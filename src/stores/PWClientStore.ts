import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let pwGameClient: PWGameClient | undefined
  let pwApiClient: PWApiClient | undefined
  const pwGameWorldHelper = new PWGameWorldHelper()

  return {
    pwGameClient,
    pwApiClient,
    pwGameWorldHelper,
  }
})
