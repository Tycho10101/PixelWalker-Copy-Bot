import { PlayerChatPacket, PlayerInitPacket, WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import { usePWClientStore } from '@/stores/PWClientStore.ts'
import { BlockNames, PWApiClient, PWGameClient } from 'pw-js-api'
import { Block, Constants, IPlayer, Point, PWGameWorldHelper, SendableBlockPacket } from 'pw-js-world'
import { cloneDeep } from 'lodash-es'
import { BotData, createBotData, PlayerBotData } from '@/types/BotData.ts'
import { useBotStore } from '@/stores/BotStore.ts'
import { BotState } from '@/enums/BotState.ts'
import { BlockInfo } from '@/types/BlockInfo.ts'

function getPwGameClient(): PWGameClient {
  return usePWClientStore().pwGameClient!
}

function getPwApiClient(): PWApiClient {
  return usePWClientStore().pwApiClient!
}

function getPwGameWorldHelper(): PWGameWorldHelper {
  return usePWClientStore().pwGameWorldHelper
}

function getPlayerBotData(): PlayerBotData {
  return useBotStore().playerBotData
}

export function registerCallbacks() {
  getPwGameClient()
    .addHook(getPwGameWorldHelper().receiveHook)
    .addCallback('debug', console.log)
    .addCallback('playerInitPacket', playerInitPacketReceived)
    .addCallback('worldBlockPlacedPacket', worldBlockPlacedPacketReceived)
    .addCallback('playerChatPacket', playerChatPacketReceived)
}

function playerChatPacketReceived(data: PlayerChatPacket) {
  const args = data.message.split(' ')
  const playerId = data.playerId

  switch (args[0].toLowerCase()) {
    case '.ping':
      sendPrivateChatMessage('pong', playerId)
      break
    case '.help':
      sendPrivateChatMessage('Bot usage:', playerId)
      sendPrivateChatMessage('Gold coin - select blocks', playerId)
      sendPrivateChatMessage('Blue coin - paste blocks', playerId)
      sendPrivateChatMessage('Commands:', playerId)
      sendPrivateChatMessage('.ping - pong', playerId)
      sendPrivateChatMessage('.help - print usage and commands', playerId)
      break
  }
}

function playerInitPacketReceived(_data: PlayerInitPacket) {
  getPwGameClient().send('playerInitReceived')
  sendGlobalChatMessage('Copy Bot joined the world! Type .help to show usage!')
}

function sendPrivateChatMessage(message: string, playerId: number) {
  getPwGameClient().send('playerChatPacket', {
    message: `/pm #${playerId} [BOT] ${message}`,
  })
}

function sendGlobalChatMessage(message: string) {
  getPwGameClient().send('playerChatPacket', {
    message: `[BOT] ${message}`,
  })
}

function worldBlockPlacedPacketReceived(
  data: WorldBlockPlacedPacket,
  states?: { player: IPlayer | undefined; oldBlocks: Block[]; newBlocks: Block[] },
) {
  const LayerType = Constants.LayerType

  if (data.playerId === getPwGameWorldHelper().botPlayerId) {
    return
  }

  if (states === undefined) {
    return
  }

  const playerId = data.playerId
  if (playerId === undefined) {
    return
  }

  if (!getPlayerBotData()[playerId]) {
    getPlayerBotData()[playerId] = createBotData()
  }
  const botData = getPlayerBotData()[playerId]
  const blockPos = data.positions[0]

  if (data.blockId === BlockNames.COIN_GOLD) {
    const oldBlock = states.oldBlocks[0]
    const blockPacket = getPwGameWorldHelper().createBlockPacket(oldBlock, LayerType.Foreground, blockPos)

    placeBlock(blockPacket)

    let selectedTypeText: string
    if ([BotState.NONE, BotState.SELECTED_TO].includes(botData.botState)) {
      selectedTypeText = 'from'
      botData.botState = BotState.SELECTED_FROM
      botData.selectedFromPos = blockPos
    } else {
      selectedTypeText = 'to'
      botData.botState = BotState.SELECTED_TO
      botData.selectedToPos = blockPos

      botData.selectedBlocks = getSelectedAreaCopy(oldBlock, botData)
    }

    sendPrivateChatMessage(`Selected ${selectedTypeText} x: ${blockPos.x} y: ${blockPos.y}`, playerId)
  }

  if (data.blockId === BlockNames.COIN_BLUE) {
    const offsetBlocks = applyPosOffsetForBlocks(blockPos, botData.selectedBlocks)
    placeMultipleBlocks(offsetBlocks)
  }
}

function applyPosOffsetForBlocks(offsetPos: Point, blockData: BlockInfo[]) {
  const blocks = cloneDeep(blockData)
  blocks.forEach((block) => {
    block.x += offsetPos.x
    block.y += offsetPos.y
  })
  return blocks
}

function getSelectedAreaCopy(oldBlock: Block, botData: BotData) {
  // TODO: replace this with exported LayerType enum
  const LayerType = Constants.LayerType
  const { selectedFromPos, selectedToPos } = botData
  let data: BlockInfo[] = []
  const dirX = selectedFromPos.x <= selectedToPos.x ? 1 : -1
  const dirY = selectedFromPos.y <= selectedToPos.y ? 1 : -1
  for (let x = 0; x <= Math.abs(selectedFromPos.x - selectedToPos.x); x++) {
    for (let y = 0; y <= Math.abs(selectedFromPos.y - selectedToPos.y); y++) {
      const sourcePosX = selectedFromPos.x + x * dirX
      const sourcePosY = selectedFromPos.y + y * dirY
      const dataPosX = x * dirX
      const dataPosY = y * dirY

      let foregroundBlock = getPwGameWorldHelper().getBlockAt(sourcePosX, sourcePosY, LayerType.Foreground)
      if (sourcePosX === selectedToPos.x && sourcePosY === selectedToPos.y) {
        foregroundBlock = oldBlock
      }

      data.push({
        block: foregroundBlock,
        x: dataPosX,
        y: dataPosY,
        layer: LayerType.Foreground,
      })
      data.push({
        block: getPwGameWorldHelper().getBlockAt(sourcePosX, sourcePosY, LayerType.Background),
        x: dataPosX,
        y: dataPosY,
        layer: LayerType.Background,
      })
    }
  }
  return data
}

function placeBlock(blockPacket: SendableBlockPacket) {
  getPwGameClient().send('worldBlockPlacedPacket', blockPacket)
}

function placeMultipleBlocks(blockData: BlockInfo[]) {
  const blockDataTransformed = blockData.map((value) => {
    return { block: value.block, layer: value.layer, pos: { x: value.x, y: value.y } }
  })
  const packets = getPwGameWorldHelper().createBlockPackets(blockDataTransformed)

  packets.forEach((packet) => placeBlock(packet))
}
