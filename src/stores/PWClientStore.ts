import { defineStore } from 'pinia'
import { ListBlockResult, PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'
import { Raw, ref } from 'vue'

export const usePWClientStore = defineStore('PWClientStore', () => {
  const pwGameClient = ref<Raw<PWGameClient> | undefined>(undefined)
  const pwApiClient = ref<Raw<PWApiClient> | undefined>(undefined)
  const pwGameWorldHelper = ref<Raw<PWGameWorldHelper> | undefined>(undefined)
  const _blocks = ref<ListBlockResult[]>([]) // sorted and uppercased blocks
  const worldId = ref<string>('')
  const email = ref<string>('')
  const password = ref<string>('')
  const secretEditKey = ref<string>('')
  const totalBlocksLeftToReceiveFromWorldImport = ref<number>(0)
  const blocksById = ref<Record<number, ListBlockResult>>({})
  const blocksByName = ref<Record<string, ListBlockResult>>({})

  function initBlocks(blocks: ListBlockResult[]) {
    blocks = blocks
      .sort((a, b) => a.Id - b.Id)
      .map((block) => ({
        ...block,
        PaletteId: block.PaletteId.toUpperCase(),
      }))
    blocks.forEach((block) => {
      _blocks.value.push(block)
      blocksById.value[block.Id] = block
      blocksByName.value[block.PaletteId] = block
    })
  }

  return {
    worldId,
    email,
    password,
    secretEditKey,
    totalBlocksLeftToReceiveFromWorldImport,
    _blocks,
    blocksById,
    blocksByName,
    initBlocks,
    pwGameClient,
    pwApiClient,
    pwGameWorldHelper,
  }
})

export function getPwGameClient(): PWGameClient {
  return usePWClientStore().pwGameClient!
}

export function getPwApiClient(): PWApiClient {
  return usePWClientStore().pwApiClient!
}

export function getPwGameWorldHelper(): PWGameWorldHelper {
  return usePWClientStore().pwGameWorldHelper!
}

export function getPwBlocks(): ListBlockResult[] {
  return usePWClientStore()._blocks
}

// TODO: Think what to do about blockid = 0 as there is more than 1 entry
export function getPwBlocksById(): Record<number, ListBlockResult> {
  return usePWClientStore().blocksById
}

// TODO: Think what to do about blockname = EMPTY as there is more than 1 entry
export function getPwBlocksByName(): Record<string, ListBlockResult> {
  return usePWClientStore().blocksByName
}
