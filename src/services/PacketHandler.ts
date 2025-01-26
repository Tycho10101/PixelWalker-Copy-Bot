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
      helpCommandReceived(args, playerId)
      break
    case '.paste':
      pasteCommandReceived(args, playerId)
      break
  }
}

function helpCommandReceived(args: string[], playerId: number) {
  if (args[1] === 'paste') {
    sendPrivateChatMessage('Example usage: .paste 2 3', playerId)
    return
  }

  sendPrivateChatMessage('Bot usage:', playerId)
  sendPrivateChatMessage('Gold coin - select blocks', playerId)
  sendPrivateChatMessage('Blue coin - paste blocks', playerId)
  sendPrivateChatMessage('Commands:', playerId)
  sendPrivateChatMessage('.ping - pong', playerId)
  sendPrivateChatMessage('.help [command] - print help info', playerId)
  sendPrivateChatMessage(
    '.paste x_times y_times - repeat next paste specified amount of times in x and y direction',
    playerId,
  )
}

function pasteCommandReceived(args: string[], playerId: number) {
  const repeatX = Number(args[1])
  const repeatY = Number(args[2])
  if (!isFinite(repeatX) || !isFinite(repeatY)) {
    sendPrivateChatMessage(`ERROR! Correct usage is .paste x_times y_times`, playerId)
    return
  }

  const botData = getPlayerBotData()[playerId]
  botData.repeatX = repeatX
  botData.repeatY = repeatY
  botData.repeatEnabled = true
  sendPrivateChatMessage(`Next paste will be repeated ${repeatX}x${repeatY} times`, playerId)
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

  const oldBlock = states.oldBlocks[0]
  const blockPacket = getPwGameWorldHelper().createBlockPacket(oldBlock, LayerType.Foreground, blockPos)
  if (data.blockId === BlockNames.COIN_GOLD) {
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
      botData.selectionSize = {
        x: Math.abs(botData.selectedToPos.x - botData.selectedFromPos.x) + 1,
        y: Math.abs(botData.selectedToPos.y - botData.selectedFromPos.y) + 1,
      }

      const dirX = botData.selectedFromPos.x <= botData.selectedToPos.x ? 1 : -1
      const dirY = botData.selectedFromPos.y <= botData.selectedToPos.y ? 1 : -1

      if (dirX == 1) {
        botData.selectionLocalTopLeftPos.x = 0
        botData.selectionLocalBottomRightPos.x = botData.selectionSize.x - 1
      } else {
        botData.selectionLocalTopLeftPos.x = -botData.selectionSize.x + 1
        botData.selectionLocalBottomRightPos.x = 0
      }

      if (dirY == 1) {
        botData.selectionLocalTopLeftPos.y = 0
        botData.selectionLocalBottomRightPos.y = botData.selectionSize.y - 1
      } else {
        botData.selectionLocalTopLeftPos.y = -botData.selectionSize.y + 1
        botData.selectionLocalBottomRightPos.y = 0
      }

      botData.selectedBlocks = getSelectedAreaCopy(oldBlock, botData)
    }

    sendPrivateChatMessage(`Selected ${selectedTypeText} x: ${blockPos.x} y: ${blockPos.y}`, playerId)
  }

  if (data.blockId === BlockNames.COIN_BLUE) {
    placeBlock(blockPacket)
    if (botData.repeatEnabled) {
      let allBlocks: BlockInfo[] = []
      const mapWidth = getPwGameWorldHelper().width
      const mapHeight = getPwGameWorldHelper().height
      botData.repeatEnabled = false
      for (let x = 0; x < Math.abs(botData.repeatX); x++) {
        const offsetPosX =
          blockPos.x + (x + (botData.repeatX < 0 ? 1 : 0)) * botData.selectionSize.x * (botData.repeatX < 0 ? -1 : 1)
        if (
          offsetPosX + botData.selectionLocalTopLeftPos.x >= mapWidth ||
          offsetPosX + botData.selectionLocalBottomRightPos.x < 0
        ) {
          break
        }
        for (let y = 0; y < botData.repeatY; y++) {
          const offsetPosY =
            blockPos.y + (y + (botData.repeatY < 0 ? 1 : 0)) * botData.selectionSize.y * (botData.repeatY < 0 ? -1 : 1)
          if (
            offsetPosY + botData.selectionLocalTopLeftPos.y >= mapHeight ||
            offsetPosY + botData.selectionLocalBottomRightPos.y < 0
          ) {
            break
          }

          const offsetPos = {
            x: offsetPosX,
            y: offsetPosY,
          }
          const offsetBlocks = applyPosOffsetForBlocks(offsetPos, botData.selectedBlocks)
          allBlocks = allBlocks.concat(offsetBlocks)
        }
      }
      placeMultipleBlocks(allBlocks)
    } else {
      const offsetBlocks = applyPosOffsetForBlocks(blockPos, botData.selectedBlocks)
      placeMultipleBlocks(offsetBlocks)
    }
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
