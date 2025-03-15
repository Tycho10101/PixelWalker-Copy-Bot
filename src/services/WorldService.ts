import { Block, createBlockPackets, DeserialisedStructure, Point, SendableBlockPacket } from 'pw-js-world'
import {
  getBlockMappings,
  getBlockMappingsReversed,
  getPwGameClient,
  getPwGameWorldHelper,
  usePWClientStore,
} from '@/stores/PWClientStore.ts'
import { WorldBlock } from '@/types/WorldBlock.ts'
import { PwBlockName } from '@/enums/PwBlockName.ts'
import { sleep } from '@/utils/Sleep.ts'
import { TOTAL_PW_LAYERS } from '@/constants/General.ts'

export function getBlockAt(pos: Point, layer: number): Block {
  try {
    return getPwGameWorldHelper().getBlockAt(pos.x, pos.y, layer)
  } catch {
    return new Block(0)
  }
}

export async function placeMultipleBlocks(worldBlocks: WorldBlock[]) {
  const packets = createBlockPackets(worldBlocks)

  return await placePackets(packets, worldBlocks.length)
}

export async function placeWorldDataBlocks(worldData: DeserialisedStructure, pos: Point): Promise<boolean> {
  const packets: SendableBlockPacket[] = worldData.toPackets(pos.x, pos.y)

  return await placePackets(packets, worldData.width * worldData.height * TOTAL_PW_LAYERS)
}

async function placePackets(packets: SendableBlockPacket[], blockCount: number): Promise<boolean> {
  // TODO: use packet count instead of block count
  usePWClientStore().totalBlocksLeftToReceiveFromWorldImport = blockCount
  let lastTotalBlocksLeftToReceiveFromWorldImportValue = usePWClientStore().totalBlocksLeftToReceiveFromWorldImport

  for (const packet of packets) {
    placeBlockPacket(packet)
  }

  const TOTAL_WAIT_ATTEMPTS_BEFORE_ASSUMING_ERROR = 10
  let total_attempts = 0
  while (total_attempts < TOTAL_WAIT_ATTEMPTS_BEFORE_ASSUMING_ERROR) {
    if (usePWClientStore().totalBlocksLeftToReceiveFromWorldImport === 0) {
      return true
    }

    if (
      usePWClientStore().totalBlocksLeftToReceiveFromWorldImport === lastTotalBlocksLeftToReceiveFromWorldImportValue
    ) {
      total_attempts++
    }

    lastTotalBlocksLeftToReceiveFromWorldImportValue = usePWClientStore().totalBlocksLeftToReceiveFromWorldImport

    await sleep(1000)
  }
  return false
}

export function placeBlockPacket(blockPacket: SendableBlockPacket) {
  getPwGameClient().send('worldBlockPlacedPacket', blockPacket)
}

export function getBlockName(pwBlockId: number): PwBlockName {
  return getBlockMappingsReversed()[pwBlockId].toUpperCase() as PwBlockName
}

export function getBlockId(pwBlockName: PwBlockName): number {
  return getBlockMappings()[pwBlockName.toLowerCase()]
}
