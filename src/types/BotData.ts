import { BotState } from '@/enums/BotState.ts'
import { Point } from 'pw-js-world'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { vec2 } from '@basementuniverse/vec'

export type BotData = {
  botState: BotState
  selectedFromPos: Point
  selectedToPos: Point
  selectedBlocks: WorldBlock[]
  selectionSize: Point
  selectionLocalTopLeftPos: Point
  selectionLocalBottomRightPos: Point
  repeatEnabled: boolean
  repeatVec: Point
  smartRepeatEnabled: boolean
}

export type PlayerBotData = {
  [playerId: number]: BotData
}

export function createBotData(): BotData {
  return {
    botState: BotState.NONE,
    selectedFromPos: vec2(0,0),
    selectedToPos: vec2(0,0),
    selectedBlocks: [],
    selectionSize: vec2(1,1),
    selectionLocalTopLeftPos: vec2(0,0),
    selectionLocalBottomRightPos: vec2(1,1),
    repeatEnabled: false,
    repeatVec: vec2(1,1),
    smartRepeatEnabled: false,
  }
}
