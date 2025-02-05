import { defineComponent, ref } from 'vue'
import { getPwGameClient, usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { pwToEelvl } from '@/services/WorldConverterService.ts'

export default defineComponent({
  setup() {
    const loading = { loadingDisconnect: ref(false), loadingExport: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    async function onDisconnectButtonClick() {
      getPwGameClient().disconnect(false)

      PWClientStore.pwGameClient = undefined
      PWClientStore.pwApiClient = undefined
      await router.push({ name: LoginRoute.name })
    }

    async function onExportButtonClick() {
      pwToEelvl()
    }

    return {
      loading,
      onDisconnectButtonClick,
      onExportButtonClick,
    }
  },
})
