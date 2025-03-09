import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'
import { computed, markRaw, ref } from 'vue'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let _pwGameClient: PWGameClient | undefined
  let _pwApiClient: PWApiClient | undefined
  const pwGameWorldHelper = markRaw(new PWGameWorldHelper())
  const worldId = ref<string>('')
  const email = ref<string>('')
  const password = ref<string>('')
  const totalBlocksLeftToReceiveFromWorldImport = ref<number>(0)
  let blockMappings: Record<string, number> = {}
  let blockMappingsReversed: Record<number, string> = {}

  const pwGameClient = computed<PWGameClient | undefined>(() => {
    if (!_pwApiClient) {
      return undefined
    }
    return _pwGameClient
  })

  function setPwGameClient(client: PWGameClient | undefined) {
    _pwGameClient = client
  }

  const pwApiClient = computed<PWApiClient | undefined>(() => {
    if (!_pwApiClient) {
      return undefined
    }
    return _pwApiClient
  })

  function setPwApiClient(client: PWApiClient | undefined) {
    _pwApiClient = client
  }

  return {
    pwGameClient,
    pwApiClient,
    pwGameWorldHelper,
    worldId,
    email,
    password,
    blockMappings,
    blockMappingsReversed,
    setPwGameClient,
    setPwApiClient,
    totalBlocksLeftToReceiveFromWorldImport,
  }
})

export function getPwGameClient(): PWGameClient {
  return usePWClientStore().pwGameClient!
}

export function getPwApiClient(): PWApiClient {
  return usePWClientStore().pwApiClient!
}

export function getPwGameWorldHelper(): PWGameWorldHelper {
  return usePWClientStore().pwGameWorldHelper
}

export function getBlockMappings(): Record<string, number> {
  return usePWClientStore().blockMappings
}

export function getBlockMappingsReversed(): Record<number, string> {
  return usePWClientStore().blockMappingsReversed
}
