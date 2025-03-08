import everyBlockEelvlFile from '@/tests/resources/every-block.eelvl?url'
import everyBlockEelvlJsonFile from '@/tests/resources/every-block-eelvl.json?url'
import { getImportedFromEelvlData } from '@/services/EelvlImporterService.ts'
import { StructureHelper } from 'pw-js-world'
import { deepStrictEqual } from 'node:assert'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'

export async function performRuntimeTests() {
  sendGlobalChatMessage('[TEST] Performing runtime tests...')
  const tests = [testImport]
  let testsPassed = 0
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i]
    try {
      await test()
      const msg = `[TEST] ${i + 1}/${tests.length} PASSED ${test.name}`
      sendGlobalChatMessage(msg)
      testsPassed += 1
    } catch (e) {
      const msg = `[TEST] ${i + 1}/${tests.length} FAILED ${test.name}`
      sendGlobalChatMessage(msg)
      console.error(msg, e)
      return
    }
  }
  sendGlobalChatMessage(`[TEST] ALL TESTS PASSED`)
}

export async function testImport() {
  const everyBlockEelvlRaw = await fetch(everyBlockEelvlFile)
  const everyBlockEelvlArrayBuffer = await everyBlockEelvlRaw.arrayBuffer()
  const importedFromEelvlData = getImportedFromEelvlData(everyBlockEelvlArrayBuffer)

  const everyBlockEelvlJsonRaw = await fetch(everyBlockEelvlJsonFile)
  const everyBlockEelvlJsonJson = await everyBlockEelvlJsonRaw.json()
  const parsedWorldData = StructureHelper.read(everyBlockEelvlJsonJson)

  deepStrictEqual(importedFromEelvlData.width, parsedWorldData.width)
  deepStrictEqual(importedFromEelvlData.height, parsedWorldData.height)
  for (let layer = 0; layer < 2; layer++) {
    for (let x = 0; x < importedFromEelvlData.width; x++) {
      for (let y = 0; y < importedFromEelvlData.height; y++) {
        const importedBlock = importedFromEelvlData.blocks[layer][x][y]
        const parsedBlock = parsedWorldData.blocks[layer][x][y]
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
