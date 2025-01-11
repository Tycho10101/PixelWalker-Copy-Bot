import { defineComponent, onBeforeMount, ref } from 'vue'
import { usePWClientStore } from '@/stores/PWClient.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const loading = ref(false)

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    onBeforeMount(async () => {})

    async function onDisconnectButtonClick() {
      PWClientStore.pwGameClient?.disconnect(false)

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
