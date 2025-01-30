import { getPwGameClient } from '@/stores/PWClientStore.ts'

export function sendPrivateChatMessage(message: string, playerId: number) {
  sendMessage(`/pm #${playerId} [BOT] ${message}`)
}

export function sendGlobalChatMessage(message: string) {
  sendMessage(`[BOT] ${message}`)
}

function sendMessage(message: string) {
  let finalMessage = message
  if (finalMessage.length > 120) {
    console.error('Message too long, max message length is 120 characters')
    finalMessage = 'ERROR! Message too long!'
  }
  getPwGameClient().send('playerChatPacket', {
    message: finalMessage,
  })
}
