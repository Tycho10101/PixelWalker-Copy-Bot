import { MessageService } from '@/services/MessageService.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { GENERAL_CONSTANTS } from '@/constants/General.ts'
import { GameError } from '@/classes/GameError.ts'

export function getExceptionDescription(exception: unknown): string {
  if (exception instanceof Error) {
    return exception.message
  } else {
    return 'Unknown error occured.'
  }
}

export function handleException(exception: unknown): void {
  console.error(exception)
  const exceptionDescription = getExceptionDescription(exception)
  MessageService.error(exceptionDescription)

  if (exception instanceof GameError) {
    sendGlobalChatMessage(GENERAL_CONSTANTS.GENERIC_ERROR)
  }
}
