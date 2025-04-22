import { defineStore } from 'pinia'
import { PlayerBotData } from '@/types/BotData.ts'
import { ref } from 'vue'

export const useBotStore = defineStore('BotStore', () => {
  // TODO: periodically remove entries for players who left world (though it takes little data)
  const playerBotData = ref<PlayerBotData>({})

  return {
    playerBotData,
  }
})

export function getPlayerBotData(): PlayerBotData {
  return useBotStore().playerBotData
}
