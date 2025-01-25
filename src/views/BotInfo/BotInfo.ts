import { defineComponent, ref } from 'vue'
import { usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { PWApiClient, PWGameClient } from 'pw-js-api'
import { PWGameWorldHelper } from 'pw-js-world'

export default defineComponent({
  setup() {
    const loading = { loading: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    function getPwGameClient(): PWGameClient {
      return usePWClientStore().pwGameClient!
    }

    function getPwApiClient(): PWApiClient {
      return usePWClientStore().pwApiClient!
    }

    function getPwGameWorldHelper(): PWGameWorldHelper {
      return usePWClientStore().pwGameWorldHelper
    }

    async function onDisconnectButtonClick() {
      getPwGameClient().disconnect(false)

      PWClientStore.pwGameClient = undefined
      PWClientStore.pwApiClient = undefined
      await router.push({ name: LoginRoute.name })
    }

    return {
      loading,
      onDisconnectButtonClick,
    }
  },
})
