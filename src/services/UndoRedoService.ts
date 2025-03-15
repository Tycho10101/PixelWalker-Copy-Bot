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

// TODO: this could be improved by smartly merging blocks as opposed to doing undo one by one
export function performUndo(botData: BotData, playerId: number, count: number) {
  let i = 0
  for (; i < count; i++) {
    const undoRedoItem = botData.undoStack.pop()
    if (undoRedoItem === undefined) {
      break
    }
    botData.redoStack.push(undoRedoItem)
    void placeMultipleBlocks(undoRedoItem.oldBlocks)
  }
  sendPrivateChatMessage(`Undo performed ${i} time(s).`, playerId)
}

// TODO: this could be improved by smartly merging blocks as opposed to doing redo one by one
export function performRedo(botData: BotData, playerId: number, count: number) {
  let i = 0
  for (; i < count; i++) {
    const undoRedoItem = botData.redoStack.pop()
    if (undoRedoItem === undefined) {
      break
    }
    botData.undoStack.push(undoRedoItem)
    void placeMultipleBlocks(undoRedoItem.newBlocks)
  }
  sendPrivateChatMessage(`Redo performed ${i} time(s).`, playerId)
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
