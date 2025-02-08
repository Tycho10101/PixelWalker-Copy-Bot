import { Block, createBlockPackets, Point, SendableBlockPacket } from 'pw-js-world'
import {
  getBlockMappings,
  getBlockMappingsReversed,
  getPwGameClient,
  getPwGameWorldHelper,
} from '@/stores/PWClientStore.ts'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { PwBlockName } from '@/enums/PwBlockNames.ts'

export function getBlockAt(pos: Point, layer: number): Block {
  try {
    return getPwGameWorldHelper().getBlockAt(pos.x, pos.y, layer)
  } catch (e) {
    return new Block(0)
  }
}

export function placeMultipleBlocks(worldBlocks: WorldBlock[]) {
  const packets = createBlockPackets(worldBlocks)

  packets.forEach((packet) => placeBlockPacket(packet))
}

export function placeBlockPacket(blockPacket: SendableBlockPacket) {
  getPwGameClient().send('worldBlockPlacedPacket', blockPacket)
}

export function getBlockName(pwBlockId: number): string {
  return getBlockMappingsReversed()[pwBlockId].toUpperCase()
}

export function getBlockId(pwBlockName: PwBlockName): number {
  return getBlockMappings()[pwBlockName.toLowerCase()]
}