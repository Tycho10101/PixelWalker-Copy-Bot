import { Block, createBlockPackets, Point, SendableBlockPacket } from 'pw-js-world'
import {
  getBlockMappings,
  getBlockMappingsReversed,
  getPwGameClient,
  getPwGameWorldHelper,
} from '@/stores/PWClientStore.ts'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { PwBlockName } from '@/enums/PwBlockName.ts'
import { sleep } from '@/utils/sleep.ts'

export function getBlockAt(pos: Point, layer: number): Block {
  try {
    return getPwGameWorldHelper().getBlockAt(pos.x, pos.y, layer)
  } catch (e) {
    return new Block(0)
  }
}

export async function placeMultipleBlocks(worldBlocks: WorldBlock[]) {
  const packets = createBlockPackets(worldBlocks)

  for (let i = 0; i < packets.length; i++) {
    placeBlockPacket(packets[i])
    
    // TODO: Remove this, once Doom fixes packet throttling
    const MAX_PACKET_COUNT_PER_SECOND = 80
    if (i % MAX_PACKET_COUNT_PER_SECOND === MAX_PACKET_COUNT_PER_SECOND - 1) {
      await sleep(1000)
    }
  }
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
