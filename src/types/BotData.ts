import { BotState } from '@/enums/BotState.ts'
import { Point } from 'pw-js-world'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { vec2 } from '@basementuniverse/vec'
import { UndoRedoItem } from '@/types/UndoRedoItem.ts'

export type BotData = {
  botState: BotState
  selectedFromPos: Point
  selectedToPos: Point
  selectedBlocks: WorldBlock[]
  selectionSize: Point
  selectionLocalTopLeftPos: Point
  selectionLocalBottomRightPos: Point
  repeatVec: Point
  spacingVec: Point
  smartRepeatEnabled: boolean
  undoStack: UndoRedoItem[]
  redoStack: UndoRedoItem[]
}

export type PlayerBotData = Record<number, BotData>

export function createBotData(): BotData {
  return {
    botState: BotState.NONE,
    selectedFromPos: vec2(0, 0),
    selectedToPos: vec2(0, 0),
    selectedBlocks: [],
    selectionSize: vec2(1, 1),
    selectionLocalTopLeftPos: vec2(0, 0),
    selectionLocalBottomRightPos: vec2(1, 1),
    repeatVec: vec2(1, 1),
    spacingVec: vec2(0, 0),
    smartRepeatEnabled: false,
    undoStack: [],
    redoStack: [],
  }
}
