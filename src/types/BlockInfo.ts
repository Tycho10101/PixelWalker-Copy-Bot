import { Block } from 'pw-js-world'
import { LayerType } from 'pw-js-world'

export type BlockInfo = {
  x: number
  y: number
  layer: LayerType
  block: Block
}