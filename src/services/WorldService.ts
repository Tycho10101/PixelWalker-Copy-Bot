import { Block, createBlockPackets, Point, SendableBlockPacket } from 'pw-js-world'
import { getPwGameClient, getPwGameWorldHelper } from '@/stores/PWClientStore.ts'
import { WorldBlock } from '@/types/WorldBlock.ts'

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
