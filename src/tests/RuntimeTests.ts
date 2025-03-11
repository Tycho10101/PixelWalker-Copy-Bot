import everyBlockEelvlFile from '@/tests/resources/every-block.eelvl?url'
import everyBlockExportedEelvlPwlvlFile from '@/tests/resources/every-block-exported-eelvl.pwlvl?url'
import { getImportedFromEelvlData } from '@/services/EelvlImporterService.ts'
import { deepStrictEqual } from 'node:assert'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { getImportedFromPwlvlData } from '@/services/PwlvlImporterService.ts'
import { TOTAL_EELVL_LAYERS } from '@/constants/General.ts'

export async function performRuntimeTests() {
  sendGlobalChatMessage('[TEST] Performing runtime tests...')
  const tests = [testImport]
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

async function testImport() {
  const everyBlockEelvlRaw = await fetch(everyBlockEelvlFile)
  const everyBlockEelvlArrayBuffer = await everyBlockEelvlRaw.arrayBuffer()
  const importedFromEelvlData = getImportedFromEelvlData(everyBlockEelvlArrayBuffer)

  const everyBlockPwlvlRaw = await fetch(everyBlockExportedEelvlPwlvlFile)
  const everyBlockPwlvlArrayBuffer = await everyBlockPwlvlRaw.arrayBuffer()
  const importedFromPwlvlData = getImportedFromPwlvlData(everyBlockPwlvlArrayBuffer)

  deepStrictEqual(importedFromEelvlData.width, importedFromPwlvlData.width)
  deepStrictEqual(importedFromEelvlData.height, importedFromPwlvlData.height)
  for (let layer = 0; layer < TOTAL_EELVL_LAYERS; layer++) {
    for (let x = 0; x < importedFromEelvlData.width; x++) {
      for (let y = 0; y < importedFromEelvlData.height; y++) {
        const importedBlock = importedFromEelvlData.blocks[layer][x][y]
        const parsedBlock = importedFromPwlvlData.blocks[layer][x][y]
        deepStrictEqual(
          importedBlock,
          parsedBlock,
          new Error(
            `testImport error: Block at ${x}, ${y} on layer ${layer} is not equal.\nGot (${importedBlock.name}):\n${JSON.stringify(importedBlock)}.\nExpected (${parsedBlock.name}):\n${JSON.stringify(parsedBlock)}`,
          ),
        )
      }
    }
  }
}
