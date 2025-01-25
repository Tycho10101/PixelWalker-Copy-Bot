import { Block } from 'pw-js-world/esm'
import { LayerType } from 'pw-js-world/cm/Constants'

export type BlockInfo = {
  x: number
  y: number
  layer: LayerType
  block: Block
}