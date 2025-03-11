import { computed, defineComponent, ref, watch } from 'vue'

import { PWApiClient, PWGameClient } from 'pw-js-api'
import { VForm } from 'vuetify/components'
import { getPwApiClient, getPwGameClient, usePWClientStore } from '@/stores/PWClientStore.ts'
import { useRouter } from 'vue-router'
import { MessageService } from '@/services/MessageService.ts'
import { BotInfoRoute } from '@/router/Routes.ts'
import { registerCallbacks } from '@/services/PacketHandlerService.ts'
import { getReversedRecord } from '@/utils/ReverseRecord.ts'
import { pwAuthenticate, pwJoinWorld } from '@/services/PWClientService.ts'
import { getWorldIdIfUrl } from '@/services/WorldIdExtractorService.ts'

export default defineComponent({
  setup() {
    const email = ref('')
    const password = ref('')
    const worldId = ref('')
    const loading = { loading: ref(false) }
    const form = ref<VForm>()

    const router = useRouter()
    const PWClientStore = usePWClientStore()

    const devViewEnabled = computed(() => import.meta.env.VITE_DEV_VIEW === 'TRUE')

    watch(worldId, () => {
      worldId.value = getWorldIdIfUrl(worldId.value)
    })

    async function onConnectButtonClick() {
      PWClientStore.worldId = worldId.value
      PWClientStore.email = email.value
      PWClientStore.password = password.value
      if (!(await form.value!.validate()).valid) {
        return
      }

      PWClientStore.setPwApiClient(new PWApiClient(email.value, password.value))

      try {
        await pwAuthenticate(getPwApiClient())
      } catch (e) {
        MessageService.error((e as Error).message)
        console.error(e)
        return
      }

      PWClientStore.setPwGameClient(new PWGameClient(getPwApiClient()))

      registerCallbacks()

      try {
        await pwJoinWorld(getPwGameClient(), worldId.value)
      } catch (e) {
        MessageService.error((e as Error).message)
        console.error(e)
        return
      }

      PWClientStore.blockMappings = await getPwApiClient().getMappings()
      PWClientStore.blockMappingsReversed = getReversedRecord(PWClientStore.blockMappings)

      await router.push({ name: BotInfoRoute.name })
    }

    function setDefaultWorldIdButtonClicked() {
      worldId.value = import.meta.env.VITE_DEFAULT_WORLD_ID
    }

    return {
      email,
      password,
      worldId,
      loading,
      form,
      onConnectButtonClick,
      devViewEnabled,
      setDefaultWorldIdButtonClicked,
    }
  },
})
