import { BotData } from '@/types/BotData.ts'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { getBlockAt, placeMultipleBlocks } from '@/services/WorldService.ts'
import { sendPrivateChatMessage } from '@/services/ChatMessageService.ts'
import { Block, LayerType, Point } from 'pw-js-world'
import { vec2 } from '@basementuniverse/vec'

const MAX_UNDO_REDO_STACK_LENGTH = 100

export function addUndoItem(botData: BotData, newBlocks: WorldBlock[], oldBlock: Block, oldBlockPos: Point) {
  botData.redoStack = []
  if (botData.undoStack.length >= MAX_UNDO_REDO_STACK_LENGTH) {
    botData.undoStack.shift()
  }
  const undoRedoItem = {
    newBlocks: newBlocks,
    oldBlocks: getOldBlocks(newBlocks, oldBlock, oldBlockPos),
  }
  botData.undoStack.push(undoRedoItem)
}

export function performUndo(botData: BotData, playerId: number) {
  const undoRedoItem = botData.undoStack.pop()
  if (undoRedoItem === undefined) {
    sendPrivateChatMessage('There is nothing to undo.', playerId)
    return
  }
  botData.redoStack.push(undoRedoItem)
  placeMultipleBlocks(undoRedoItem.oldBlocks)
  sendPrivateChatMessage('Undo performed.', playerId)
}

export function performRedo(botData: BotData, playerId: number) {
  const undoRedoItem = botData.redoStack.pop()
  if (undoRedoItem === undefined) {
    sendPrivateChatMessage('There is nothing to redo.', playerId)
    return
  }
  botData.undoStack.push(undoRedoItem)
  placeMultipleBlocks(undoRedoItem.newBlocks)
  sendPrivateChatMessage('Redo performed.', playerId)
}

function getOldBlocks(newBlocks: WorldBlock[], oldBlock: Block, oldBlockPos: Point): WorldBlock[] {
  return newBlocks.map((newBlock) => {
    let block = getBlockAt(newBlock.pos, newBlock.layer)
    if (vec2.eq(newBlock.pos, oldBlockPos) && newBlock.layer == LayerType.Foreground) {
      block = oldBlock
    }
    return {
      block: block,
      layer: newBlock.layer,
      pos: newBlock.pos,
    }
  })
}
