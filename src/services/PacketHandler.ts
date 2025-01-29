import { PlayerChatPacket, PlayerInitPacket, WorldBlockPlacedPacket } from 'pw-js-api/dist/gen/world_pb'
import { usePWClientStore } from '@/stores/PWClientStore.ts'
import { BlockNames, PWApiClient, PWGameClient } from 'pw-js-api'
import {
  Block,
  BlockArgsHeadings,
  ComponentTypeHeader,
  Constants,
  IPlayer,
  Point,
  PWGameWorldHelper,
  SendableBlockPacket,
} from 'pw-js-world'
import { cloneDeep } from 'lodash-es'
import { createBotData, PlayerBotData } from '@/types/BotData.ts'
import { useBotStore } from '@/stores/BotStore.ts'
import { BotState } from '@/enums/BotState.ts'
import { BlockInfo } from '@/types/BlockInfo.ts'
import { PlayerJoinedPacket } from 'pw-js-api/cm/gen/world_pb'
import { sendPrivateChatMessage } from '@/services/ChatMessageService.ts'

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
    .addCallback('playerJoinedPacket', playerJoinedPacketReceived)
}

function playerJoinedPacketReceived(data: PlayerJoinedPacket) {
  const playerId = data.properties?.playerId!
  if (!getPlayerBotData()[playerId]) {
    getPlayerBotData()[playerId] = createBotData()
  }
  sendPrivateChatMessage('Copy Bot is here! Type .help to show usage!', playerId)
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
      pasteCommandReceived(args, playerId, false)
      break
    case '.smartpaste':
      pasteCommandReceived(args, playerId, true)
      break
  }
}

function helpCommandReceived(args: string[], playerId: number) {
  const HELP_MESSAGE_PING = '.ping - check if bot is alive by pinging it.'
  const HELP_MESSAGE_HELP = '.help [command] - get general help, or if command is specified, get help about command.'
  const HELP_MESSAGE_PASTE =
    '.paste x_times y_times - repeat next paste specified amount of times in x and y direction.'
  const HELP_MESSAGE_SMARTPASTE =
    '.smartpaste - same as .paste, but increments special block arguments, when using repeated paste.'
  if (args.length == 1) {
    sendPrivateChatMessage('Bot usage:', playerId)
    sendPrivateChatMessage('Gold coin - select blocks', playerId)
    sendPrivateChatMessage('Blue coin - paste blocks', playerId)
    sendPrivateChatMessage('Commands:', playerId)
    sendPrivateChatMessage('.ping - pong', playerId)
    sendPrivateChatMessage('.help [command] - print help info', playerId)
    sendPrivateChatMessage(HELP_MESSAGE_PASTE, playerId)
    sendPrivateChatMessage(HELP_MESSAGE_SMARTPASTE, playerId)
    return
  }
  if (args[1] === 'ping') {
    sendPrivateChatMessage(HELP_MESSAGE_PING, playerId)
    sendPrivateChatMessage(`Example usage: .ping`, playerId)
    return
  }
  if (args[1] === 'help') {
    sendPrivateChatMessage(HELP_MESSAGE_HELP, playerId)
    sendPrivateChatMessage(`Example usage: .help paste`, playerId)
    return
  }
  if (args[1] === 'paste') {
    sendPrivateChatMessage(HELP_MESSAGE_PASTE, playerId)
    sendPrivateChatMessage(`Example usage: .paste 2 3`, playerId)
    return
  }
  if (args[1] === 'smartpaste') {
    sendPrivateChatMessage(HELP_MESSAGE_SMARTPASTE, playerId)
    sendPrivateChatMessage(`Requires specifying pattern before placing in paste location.`, playerId)
    sendPrivateChatMessage(
      `Example: place purple switch id=1 at {x=0,y=0} and purple switch id=2 at {x=1,y=0}.`,
      playerId,
    )
    sendPrivateChatMessage(`Then select region for copy from {x=0,y=0} to {x=0,y=0}.`, playerId)
    sendPrivateChatMessage(`Then Type in chat .smartpaste 5 1`, playerId)
    sendPrivateChatMessage(`Lastly paste your selection at {x=0,y=0}`, playerId)
    sendPrivateChatMessage(`As result, you should see purple switches with ids [1,2,3,4,5] placed in a row.`, playerId)
    return
  }
}

function pasteCommandReceived(args: string[], playerId: number, smartPaste: boolean) {
  const repeatX = Number(args[1])
  const repeatY = Number(args[2])
  if (!isFinite(repeatX) || !isFinite(repeatY)) {
    sendPrivateChatMessage(`ERROR! Correct usage is ${smartPaste ? '.smartpaste' : '.paste'} x_times y_times`, playerId)
    return
  }

  const botData = getPlayerBotData()[playerId]
  botData.repeatX = repeatX
  botData.repeatY = repeatY
  botData.repeatEnabled = true
  botData.smartRepeatEnabled = smartPaste
  sendPrivateChatMessage(`Next paste will be repeated ${repeatX}x${repeatY} times`, playerId)
}

function playerInitPacketReceived(_data: PlayerInitPacket) {
  getPwGameClient().send('playerInitReceived')
}

function applySmartTransformForBlocks(
  pastedBlocks: BlockInfo[],
  pastePosBlocks: BlockInfo[],
  nextBlocksX: BlockInfo[],
  nextBlocksY: BlockInfo[],
  repetitionX: number,
  repetitionY: number,
) {
  return pastedBlocks.map((pastedBlock, i) => {
    const pastePosBlock = pastePosBlocks[i]
    const nextBlockX = nextBlocksX[i]
    const nextBlockY = nextBlocksY[i]
    const blockCopy = cloneDeep(pastedBlock)

    if (pastePosBlock.block.bId === nextBlockX.block.bId || pastePosBlock.block.bId === nextBlockY.block.bId) {
      const blockArgTypes: ComponentTypeHeader[] = (BlockArgsHeadings as any)[BlockNames[pastePosBlock.block.bId]] ?? []
      for (let i = 0; i < blockArgTypes.length; i++) {
        const blockArgType = blockArgTypes[i]
        if (blockArgType === ComponentTypeHeader.Int32) {
          if (pastePosBlock.block.bId === nextBlockX.block.bId) {
            const diffX = nextBlockX.block.args[i] - pastePosBlock.block.args[i]
            blockCopy.block.args[i] += diffX * repetitionX
          }
          if (pastePosBlock.block.bId === nextBlockY.block.bId) {
            const diffY = nextBlockY.block.args[i] - pastePosBlock.block.args[i]
            blockCopy.block.args[i] += diffY * repetitionY
          }
        }
      }
    }
    return blockCopy
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

      botData.selectedBlocks = getSelectedAreaCopy(oldBlock, blockPos, botData.selectedFromPos, botData.selectedToPos)
    }

    sendPrivateChatMessage(`Selected ${selectedTypeText} x: ${blockPos.x} y: ${blockPos.y}`, playerId)
  }

  if (data.blockId === BlockNames.COIN_BLUE) {
    placeBlock(blockPacket)
    if (botData.repeatEnabled) {
      botData.repeatEnabled = false
      let allBlocks: BlockInfo[] = []
      const mapWidth = getPwGameWorldHelper().width
      const mapHeight = getPwGameWorldHelper().height

      const repeatDirectionX = botData.repeatX < 0 ? -1 : 1
      const repeatDirectionY = botData.repeatY < 0 ? -1 : 1

      const pastePosBlocksFromPos = {
        x: blockPos.x + botData.selectionLocalTopLeftPos.x,
        y: blockPos.y + botData.selectionLocalTopLeftPos.y,
      }
      const pastePosBlocksToPos = {
        x: blockPos.x + botData.selectionLocalBottomRightPos.x,
        y: blockPos.y + botData.selectionLocalBottomRightPos.y,
      }
      const pastePosBlocks = getSelectedAreaCopy(oldBlock, blockPos, pastePosBlocksFromPos, pastePosBlocksToPos)
      const nextBlocksXFromPos = {
        x: pastePosBlocksFromPos.x + botData.selectionSize.x * repeatDirectionX,
        y: pastePosBlocksFromPos.y,
      }
      const nextBlocksXToPos = {
        x: pastePosBlocksToPos.x + botData.selectionSize.x * repeatDirectionX,
        y: pastePosBlocksToPos.y,
      }
      const nextBlocksX = getSelectedAreaCopy(oldBlock, blockPos, nextBlocksXFromPos, nextBlocksXToPos)
      const nextBlocksYFromPos = {
        x: pastePosBlocksFromPos.x,
        y: pastePosBlocksFromPos.y + botData.selectionSize.y * repeatDirectionY,
      }
      const nextBlocksYToPos = {
        x: pastePosBlocksToPos.x,
        y: pastePosBlocksToPos.y + botData.selectionSize.y * repeatDirectionY,
      }
      const nextBlocksY = getSelectedAreaCopy(oldBlock, blockPos, nextBlocksYFromPos, nextBlocksYToPos)

      for (let x = 0; x < Math.abs(botData.repeatX); x++) {
        const offsetPosX = pastePosBlocksFromPos.x + x * botData.selectionSize.x * (botData.repeatX < 0 ? -1 : 1)
        if (
          offsetPosX + botData.selectionLocalTopLeftPos.x >= mapWidth ||
          offsetPosX + botData.selectionLocalBottomRightPos.x < 0
        ) {
          break
        }
        for (let y = 0; y < Math.abs(botData.repeatY); y++) {
          const offsetPosY = pastePosBlocksFromPos.y + y * botData.selectionSize.y * (botData.repeatY < 0 ? -1 : 1)
          if (
            offsetPosY + botData.selectionLocalTopLeftPos.y >= mapHeight ||
            offsetPosY + botData.selectionLocalBottomRightPos.y < 0
          ) {
            break
          }

          const offsetPos: Point = {
            x: offsetPosX,
            y: offsetPosY,
          }

          let finalBlocks = applyPosOffsetForBlocks(offsetPos, botData.selectedBlocks)
          if (botData.smartRepeatEnabled) {
            finalBlocks = applySmartTransformForBlocks(finalBlocks, pastePosBlocks, nextBlocksX, nextBlocksY, x, y)
          }
          allBlocks = allBlocks.concat(finalBlocks)
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

function getBlockAt(x: number, y: number, layer: number): Block {
  try {
    return getPwGameWorldHelper().getBlockAt(x, y, layer)
  } catch (e) {
    return new Block(0)
  }
}

function getSelectedAreaCopy(oldBlock: Block, oldBlockPos: Point, fromPos: Point, toPos: Point) {
  fromPos = cloneDeep(fromPos)
  toPos = cloneDeep(toPos)
  if (fromPos.x > toPos.x) {
    ;[fromPos.x, toPos.x] = [toPos.x, fromPos.x]
  }
  if (fromPos.y > toPos.y) {
    ;[fromPos.y, toPos.y] = [toPos.y, fromPos.y]
  }
  // TODO: replace this with exported LayerType enum
  const LayerType = Constants.LayerType
  let data: BlockInfo[] = []
  for (let x = 0; x <= toPos.x - fromPos.x; x++) {
    for (let y = 0; y <= toPos.y - fromPos.y; y++) {
      const sourcePosX = fromPos.x + x
      const sourcePosY = fromPos.y + y

      let foregroundBlock = getBlockAt(sourcePosX, sourcePosY, LayerType.Foreground)
      if (sourcePosX === oldBlockPos.x && sourcePosY === oldBlockPos.y) {
        foregroundBlock = oldBlock
      }

      data.push({
        block: foregroundBlock,
        x: x,
        y: y,
        layer: LayerType.Foreground,
      })
      data.push({
        block: getBlockAt(sourcePosX, sourcePosY, LayerType.Background),
        x: x,
        y: y,
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
