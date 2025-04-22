import { WorldBlock } from '@/type/WorldBlock.ts'

export type UndoRedoItem = {
  oldBlocks: WorldBlock[]
  newBlocks: WorldBlock[]
}
