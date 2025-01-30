import { defineComponent, ref } from 'vue'
import { getPwGameClient, usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const loading = { loading: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

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
