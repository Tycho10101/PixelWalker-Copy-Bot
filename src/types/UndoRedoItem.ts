import { WorldBlock } from '@/types/WorldBlock.ts'

export type UndoRedoItem = {
  oldBlocks: WorldBlock[]
  newBlocks: WorldBlock[]
}
