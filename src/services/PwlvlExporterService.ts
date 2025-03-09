import { getPwGameWorldHelper, usePWClientStore } from '@/stores/PWClientStore.ts'
import { downloadFile } from '@/services/FileService.ts'
import { EelvlFileHeader } from '@/types/WorldData.ts'

export function getExportedToPwlvlData(): [Buffer, string] {
  const worldMeta = getPwGameWorldHelper().meta!
  const world: EelvlFileHeader = {
    ownerName: worldMeta.owner ?? 'Unknown',
    name: worldMeta.title ?? 'Untitled world',
    width: getPwGameWorldHelper().width,
    height: getPwGameWorldHelper().height,
    gravMultiplier: 1,
    backgroundColor: 0,
    description: worldMeta.description ?? '',
    isCampaign: false,
    crewId: '',
    crewName: '',
    crewStatus: 0,
    minimapEnabled: worldMeta.minimapEnabled ?? true,
    ownerId: 'owner ID',
  }

  const worldData = getPwGameWorldHelper().sectionBlocks(0, 0, world.width - 1, world.height - 1)

  const worldId = usePWClientStore().worldId
  const fileName = `${world.name} - ${world.width}x${world.height} - ${worldId}.pwlvl`

  return [worldData.toBuffer(), fileName]
}

export function exportToPwlvl() {
  const [byteBuffer, fileName] = getExportedToPwlvlData()
  downloadFile(byteBuffer, fileName)
}
