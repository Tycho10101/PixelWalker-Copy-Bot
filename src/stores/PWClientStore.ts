import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let pwGameClient: PWGameClient | undefined = undefined
  let pwApiClient: PWApiClient | undefined = undefined
  const pwGameWorldHelper = new PWGameWorldHelper()

  return {
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
  return usePWClientStore().pwGameWorldHelper
}
