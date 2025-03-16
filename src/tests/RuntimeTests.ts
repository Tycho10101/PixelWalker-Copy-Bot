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
  placePwLvlblocks,
} from '@/tests/RuntimeTestsUtil.ts'
import { getAllWorldBlocks, pwAuthenticate, pwJoinWorld } from '@/services/PWClientService.ts'
import { getPwGameClient, getPwGameWorldHelper, usePWClientStore } from '@/stores/PWClientStore.ts'
import { CustomBotEvents, PWApiClient, PWGameClient, WorldEventNames } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'
import waitUntil from 'async-wait-until'

export async function performRuntimeTests() {
  sendGlobalChatMessage('[TEST] Performing runtime tests...')
  const tests = [
    testMapUpdateFromWorldBlockPlacedPacket,
    testMapUpdateFromPlayerInitPacket,
    testEelvlImport,
    testEelvlExportWithEelvlData,
    testEelvlExportWithPwlvlData,
  ]
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

async function testMapUpdateFromWorldBlockPlacedPacket() {
  const expectedData = await placePwLvlblocks(everyBlockOriginalPwlvlFile)
  const receivedData = getAllWorldBlocks(getPwGameWorldHelper())

  compareDeserialisedStructureData(receivedData, expectedData)
}

async function testMapUpdateFromPlayerInitPacket() {
  const expectedData = await placePwLvlblocks(everyBlockOriginalPwlvlFile)

  getPwGameClient().disconnect(false)

  const pwApiClient = new PWApiClient(usePWClientStore().email, usePWClientStore().password)

  await pwAuthenticate(pwApiClient)

  const worldId = usePWClientStore().worldId

  const pwGameClient = new PWGameClient(pwApiClient)
  const pwGameWorldHelper = new PWGameWorldHelper()

  let initReceived = false
  pwGameClient.addHook(pwGameWorldHelper.receiveHook).addCallback('playerInitPacket', async () => {
    pwGameClient.send('playerInitReceived')

    const receivedData = getAllWorldBlocks(pwGameWorldHelper)
    compareDeserialisedStructureData(receivedData, expectedData)
    pwGameClient.disconnect(false)

    const eventName: WorldEventNames | keyof CustomBotEvents = 'playerInitPacket'

    const playerInitPacketReceived = () => {
      getPwGameClient().removeCallback(eventName, playerInitPacketReceived)
      initReceived = true
    }

    getPwGameClient().addCallback(eventName, playerInitPacketReceived)

    await pwJoinWorld(getPwGameClient(), worldId)
  })

  await pwJoinWorld(pwGameClient, worldId)
  await waitUntil(() => initReceived, { timeout: 20000, intervalBetweenAttempts: 1000 })
}
