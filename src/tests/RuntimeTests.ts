import everyBlockEelvlFile from '@/tests/resources/every-block.eelvl?url'
import everyBlockExportedEelvlPwlvlFile from '@/tests/resources/every-block-exported-eelvl.pwlvl?url'
import everyBlockOriginalPwlvlFile from '@/tests/resources/every-block-original.pwlvl?url'
import { getImportedFromEelvlData } from '@/services/EelvlImporterService.ts'
import { deepStrictEqual } from 'node:assert'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { getImportedFromPwlvlData } from '@/services/PwlvlImporterService.ts'
import { TOTAL_EELVL_LAYERS } from '@/constants/General.ts'
import { DeserialisedStructure } from 'pw-js-world'
import { getExportedToEelvlData } from '@/services/EelvlExporterService.ts'

export async function performRuntimeTests() {
  sendGlobalChatMessage('[TEST] Performing runtime tests...')
  const tests = [testEelvlImport, testEelvlExportWithEelvlData, testEelvlExportWithPwlvlData]
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    try {
      await test()
      const msg = `[TEST] ${i + 1}/${tests.length} PASSED ${test.name}`
      sendGlobalChatMessage(msg)
    } catch (e) {
      const msg = `[TEST] ${i + 1}/${tests.length} FAILED ${test.name}`
      sendGlobalChatMessage(msg)
      console.error(msg, e)
      return
    }
  }
  sendGlobalChatMessage(`[TEST] ALL TESTS PASSED`)
}

function compareDeserialisedStructureData(receivedData: DeserialisedStructure, expectedData: DeserialisedStructure) {
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

async function testEelvlImport() {
  const everyBlockPwlvlRaw = await fetch(everyBlockExportedEelvlPwlvlFile)
  const everyBlockPwlvlArrayBuffer = await everyBlockPwlvlRaw.arrayBuffer()
  const expectedData = getImportedFromPwlvlData(everyBlockPwlvlArrayBuffer)

  const everyBlockEelvlRaw = await fetch(everyBlockEelvlFile)
  const everyBlockEelvlArrayBuffer = await everyBlockEelvlRaw.arrayBuffer()
  const receivedData = getImportedFromEelvlData(everyBlockEelvlArrayBuffer)

  compareDeserialisedStructureData(receivedData, expectedData)
}

async function testEelvlExportWithEelvlData() {
  const everyBlockPwlvlRaw = await fetch(everyBlockExportedEelvlPwlvlFile)
  const everyBlockPwlvlArrayBuffer = await everyBlockPwlvlRaw.arrayBuffer()
  const expectedData = getImportedFromPwlvlData(everyBlockPwlvlArrayBuffer)

  const [exportEelvlDataBuffer] = getExportedToEelvlData(expectedData)
  const receivedData = getImportedFromEelvlData(exportEelvlDataBuffer)

  compareDeserialisedStructureData(receivedData, expectedData)
}

async function testEelvlExportWithPwlvlData() {
  const everyBlockOriginalPwlvlRaw = await fetch(everyBlockOriginalPwlvlFile)
  const everyBlockOriginalPwlvlArrayBuffer = await everyBlockOriginalPwlvlRaw.arrayBuffer()
  const pwlvlData = getImportedFromPwlvlData(everyBlockOriginalPwlvlArrayBuffer)

  const [exportPwlvlDataBuffer] = getExportedToEelvlData(pwlvlData)
  const receivedData = getImportedFromEelvlData(exportPwlvlDataBuffer)

  const everyBlockPwlvlRaw = await fetch(everyBlockExportedEelvlPwlvlFile)
  const everyBlockPwlvlArrayBuffer = await everyBlockPwlvlRaw.arrayBuffer()
  const expectedData = getImportedFromPwlvlData(everyBlockPwlvlArrayBuffer)

  compareDeserialisedStructureData(receivedData, expectedData)
}