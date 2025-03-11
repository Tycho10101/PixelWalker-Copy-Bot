import { DeserialisedStructure, StructureHelper } from 'pw-js-world'
import { vec2 } from '@basementuniverse/vec'
import { placeWorldDataBlocks } from '@/services/WorldService.ts'
import { getPwGameWorldHelper } from '@/stores/PWClientStore.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { pwCheckEditWhenImporting } from '@/services/PWClientService.ts'

export function getImportedFromPwlvlData(fileData: ArrayBuffer): DeserialisedStructure {
  return StructureHelper.read(Buffer.from(fileData))
}

export async function importFromPwlvl(fileData: ArrayBuffer) {
  if (!pwCheckEditWhenImporting(getPwGameWorldHelper())) {
    return
  }

  const worldData = getImportedFromPwlvlData(fileData)

  const success = await placeWorldDataBlocks(worldData, vec2(0, 0))
  if (success) {
    sendGlobalChatMessage('Finished importing world.')
  } else {
    sendGlobalChatMessage('[ERROR] Failed to import world.')
  }
}
