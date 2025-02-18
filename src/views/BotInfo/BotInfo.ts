import { defineComponent, ref } from 'vue'
import { getPwGameClient, usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { exportToEelvl } from '@/services/EelvlExporterService.ts'
import { importFromEelvl } from '@/services/EelvlImporterService.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'

export default defineComponent({
  setup() {
    const loading = { loadingDisconnect: ref(false), loadingExport: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    const importEelvlFileInput = ref<HTMLInputElement>()

    async function onDisconnectButtonClick() {
      getPwGameClient().disconnect(false)

      PWClientStore.setPwGameClient(undefined)
      PWClientStore.setPwApiClient(undefined)
      await router.push({ name: LoginRoute.name })
    }

    async function onExportButtonClick() {
      exportToEelvl()
    }

    async function onImportButtonClick() {
      importEelvlFileInput.value!.click()
    }

    async function onFileChange(event: Event) {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const fileData = e.target?.result as ArrayBuffer
          if (fileData) {
            sendGlobalChatMessage(`Importing world from ${file.name}`)
            importFromEelvl(fileData)
            target.value = ''
          }
        }
        reader.readAsArrayBuffer(file)
      }
    }

    return {
      loading,
      onDisconnectButtonClick,
      onExportButtonClick,
      onImportButtonClick,
      onFileChange,
      importEelvlFileInput,
    }
  },
})
