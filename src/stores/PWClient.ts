import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let pwGameClient: PWGameClient | undefined
  let pwApiClient: PWApiClient | undefined
  let selfPlayerId: number | undefined

  return {
    pwGameClient,
    pwApiClient,
    selfPlayerId,
  }
})
