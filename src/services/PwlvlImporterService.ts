import { DeserialisedStructure, StructureHelper } from 'pw-js-world'
import { vec2 } from '@basementuniverse/vec'
import { placeWorldDataBlocks } from '@/services/WorldService.ts'
import { usePWClientStore } from '@/stores/PWClientStore.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'

export function getImportedFromPwlvlData(fileData: ArrayBuffer): DeserialisedStructure {
  return StructureHelper.read(Buffer.from(fileData))
}

export function importFromPwlvl(fileData: ArrayBuffer) {
  try {
    const worldData = getImportedFromPwlvlData(fileData)

    usePWClientStore().totalBlocksLeftToReceiveFromWorldImport = worldData.width * worldData.height * 2
    placeWorldDataBlocks(worldData, vec2(0, 0))
  } catch (e) {
    console.log(e)
    usePWClientStore().totalBlocksLeftToReceiveFromWorldImport = 0
    sendGlobalChatMessage('Unknown error occurred while importing pwlvl file.')
  }
}
