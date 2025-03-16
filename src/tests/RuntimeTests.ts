import everyBlockEelvlFile from '@/tests/resources/every-block.eelvl?url'
import everyBlockExportedEelvlPwlvlFile from '@/tests/resources/every-block-exported-eelvl.pwlvl?url'
import everyBlockOriginalPwlvlFile from '@/tests/resources/every-block-original.pwlvl?url'
import { getImportedFromEelvlData } from '@/services/EelvlImporterService.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { getExportedToEelvlData } from '@/services/EelvlExporterService.ts'
import {
  compareDeserialisedStructureData,
  getDataFromEelvlFile,
  getDataFromPwlvlFile,
} from '@/tests/RuntimeTestsUtil.ts'

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

async function testEelvlImport() {
  const expectedData = await getDataFromPwlvlFile(everyBlockExportedEelvlPwlvlFile)
  const receivedData = await getDataFromEelvlFile(everyBlockEelvlFile)

  compareDeserialisedStructureData(receivedData, expectedData)
}

async function testEelvlExportWithEelvlData() {
  const expectedData = await getDataFromPwlvlFile(everyBlockExportedEelvlPwlvlFile)

  const [exportEelvlDataBuffer] = getExportedToEelvlData(expectedData)
  const receivedData = getImportedFromEelvlData(exportEelvlDataBuffer)

  compareDeserialisedStructureData(receivedData, expectedData)
}

async function testEelvlExportWithPwlvlData() {
  const pwlvlData = await getDataFromPwlvlFile(everyBlockOriginalPwlvlFile)

  const [exportPwlvlDataBuffer] = getExportedToEelvlData(pwlvlData)
  const receivedData = getImportedFromEelvlData(exportPwlvlDataBuffer)

  const expectedData = await getDataFromPwlvlFile(everyBlockExportedEelvlPwlvlFile)

  compareDeserialisedStructureData(receivedData, expectedData)
}

// async function testMapUpdateFromWorldBlockPlacedPacket() {
//   await pwClearWorld()
//
// }
