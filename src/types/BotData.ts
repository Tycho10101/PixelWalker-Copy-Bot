import { BotState } from '@/enums/BotState.ts'
import { Point } from 'pw-js-world'
import { BlockInfo } from '@/types/BlockInfo.ts'

export type BotData = {
  botState: BotState
  selectedFromPos: Point
  selectedToPos: Point
  selectedBlocks: BlockInfo[]
  selectionSize: Point
  selectionLocalTopLeftPos: Point
  selectionLocalBottomRightPos: Point
  repeatEnabled: boolean
  repeatX: number
  repeatY: number
  smartRepeatEnabled: boolean
}

export type PlayerBotData = {
  [playerId: number]: BotData
}

export function createBotData(): BotData {
  return {
    botState: BotState.NONE,
    selectedFromPos: { x: 0, y: 0 },
    selectedToPos: { x: 0, y: 0 },
    selectedBlocks: [],
    selectionSize: {x: 1, y: 1},
    selectionLocalTopLeftPos: { x: 0, y: 0 },
    selectionLocalBottomRightPos: { x: 1, y: 1 },
    repeatEnabled: false,
    repeatX: 1,
    repeatY: 1,
    smartRepeatEnabled: false,
  }
}
