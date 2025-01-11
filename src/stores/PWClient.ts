import { defineStore } from 'pinia'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import World from '@/services/world/world.ts'

export const usePWClientStore = defineStore('PWClientStore', () => {
  let pwGameClient: PWGameClient | undefined
  let pwApiClient: PWApiClient | undefined
  let selfPlayerId: number | undefined
  let world: World | undefined

  return {
    pwGameClient,
    pwApiClient,
    selfPlayerId,
    world,
  }
})
