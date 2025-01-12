import { defineComponent, onBeforeMount, ref } from 'vue'

import { PWApiClient, PWGameClient } from 'pw-js-api'
import { VForm } from 'vuetify/components'
import { usePWClientStore } from '@/stores/PWClient.ts'
import { useRouter } from 'vue-router'
import { MessageService } from '@/services/MessageService.ts'
import { GENERAL_CONSTANTS } from '@/constants/general.ts'
import { BotInfoRoute } from '@/router/routes.ts'

export default defineComponent({
  setup() {
    const email = ref('')
    const password = ref('')
    const worldId = ref('')
    const loading = { loading: ref(false) }
    const form = ref<VForm>()

    const router = useRouter()
    const PWClientStore = usePWClientStore()

    const getPwGameClient = (): PWGameClient => {
      return PWClientStore.pwGameClient!
    }
    const getPwApiClient = (): PWApiClient => {
      return PWClientStore.pwApiClient!
    }

    onBeforeMount(async () => {})

    async function authenticate(): Promise<boolean> {
      const authenticationResult = await getPwApiClient().authenticate()

      if ('token' in authenticationResult) {
        return true
      }

      if ('message' in authenticationResult) {
        MessageService.error(authenticationResult.message)
      } else {
        MessageService.error(GENERAL_CONSTANTS.GENERIC_ERROR)
      }

      return false
    }

    async function joinWorld(): Promise<boolean> {
      try {
        PWClientStore.pwGameClient = await getPwApiClient().joinWorld(worldId.value, {
          gameSettings: {
            handlePackets: ['PING'],
          },
        })
        return true
      } catch (e) {
        MessageService.error('Failed to join world. ' + e.message)
        return false
      }
    }

    async function onConnectButtonClick() {
      if (!(await form.value!.validate()).valid) {
        return
      }

      PWClientStore.pwApiClient = new PWApiClient(email.value, password.value)

      if (!(await authenticate())) {
        return
      }

      if (!(await joinWorld())) {
        return
      }

      getPwGameClient().addCallback('debug', console.log)

      getPwGameClient().addCallback('playerInitPacket', (data) => {
        PWClientStore.selfPlayerId = data.playerProperties?.playerId

        getPwGameClient()?.send('playerInitReceived')
      })

      await router.push({ name: BotInfoRoute.name })
    }

    function setWorldId() {
      worldId.value = 'r3c188b31614b7f'
    }

    return {
      email,
      password,
      worldId,
      loading,
      form,
      onConnectButtonClick,
      setWorldId,
    }
  },
})
