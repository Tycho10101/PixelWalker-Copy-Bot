import { DeserialisedStructure } from 'pw-js-world'
import { getImportedFromPwlvlData } from '@/services/PwlvlImporterService.ts'
import { deepStrictEqual } from 'node:assert'
import { TOTAL_EELVL_LAYERS } from '@/constants/General.ts'
import { getImportedFromEelvlData } from '@/services/EelvlImporterService.ts'
import { placeWorldDataBlocks } from '@/services/WorldService.ts'
import { vec2 } from '@basementuniverse/vec'
import { GameError } from '@/classes/GameError.ts'
import { pwClearWorld } from '@/services/PWClientService.ts'

export function compareDeserialisedStructureData(
  receivedData: DeserialisedStructure,
  expectedData: DeserialisedStructure,
) {
  deepStrictEqual(receivedData.width, expectedData.width)
  deepStrictEqual(receivedData.height, expectedData.height)
  for (let layer = 0; layer < TOTAL_EELVL_LAYERS; layer++) {
    for (let x = 0; x < receivedData.width; x++) {
      for (let y = 0; y < receivedData.height; y++) {
        const receivedBlock = receivedData.blocks[layer][x][y]
        const expectedBlock = expectedData.blocks[layer][x][y]
        deepStrictEqual(
          receivedBlock,
          expectedBlock,
          new Error(
            `ERROR! Block at ${x}, ${y} on layer ${layer} is not equal.\nGot (${receivedBlock.name}):\n${JSON.stringify(receivedBlock)}.\nExpected (${expectedBlock.name}):\n${JSON.stringify(expectedBlock)}`,
          ),
        )
      }
    }
  }
}

export async function getDataFromPwlvlFile(fileUrl: string): Promise<DeserialisedStructure> {
  const fileRaw = await fetch(fileUrl)
  const fileArrayBuffer = await fileRaw.arrayBuffer()
  return getImportedFromPwlvlData(fileArrayBuffer)
}

export async function getDataFromEelvlFile(fileUrl: string): Promise<DeserialisedStructure> {
  const fileRaw = await fetch(fileUrl)
  const fileArrayBuffer = await fileRaw.arrayBuffer()
  return getImportedFromEelvlData(fileArrayBuffer)
}

// Returns blocks loaded from fileUrl
export async function placePwLvlblocks(fileUrl: string): Promise<DeserialisedStructure> {
  await pwClearWorld()

  const expectedData = await getDataFromPwlvlFile(fileUrl)
  const success = await placeWorldDataBlocks(expectedData, vec2(0, 0))
  if (!success) {
    throw new GameError('Failed to place all blocks')
  }

  return expectedData
}