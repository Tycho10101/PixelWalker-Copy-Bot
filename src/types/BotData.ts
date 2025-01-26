import { BotState } from '@/enums/BotState.ts'
import { Point } from 'pw-js-world'
import { BlockInfo } from '@/types/BlockInfo.ts'

export type BotData = {
  botState: BotState
  selectedFromPos: Point
  selectedToPos: Point
  selectedBlocks: BlockInfo[]
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
  }
}
