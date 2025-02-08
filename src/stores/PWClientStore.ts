import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'
import { markRaw, ref } from 'vue'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let pwGameClient: PWGameClient | undefined = undefined
  let pwApiClient: PWApiClient | undefined = undefined
  const pwGameWorldHelper = markRaw(new PWGameWorldHelper())
  const worldId = ref<string>('')
  let blockMappings: Record<string, number> = {}
  let blockMappingsReversed: Record<number, string> = {}

  return {
    pwGameClient,
    pwApiClient,
    pwGameWorldHelper,
    worldId,
    blockMappings,
    blockMappingsReversed,
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
