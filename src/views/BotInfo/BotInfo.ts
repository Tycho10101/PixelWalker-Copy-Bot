import { computed, defineComponent, ref } from 'vue'
import { getPwGameClient, usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginRoute } from '@/router/routes.ts'
import { useRouter } from 'vue-router'
import { exportToEelvl } from '@/services/EelvlExporterService.ts'
import { importFromEelvl } from '@/services/EelvlImporterService.ts'
import { sendGlobalChatMessage } from '@/services/ChatMessageService.ts'
import { exportToPwlvl } from '@/services/PwlvlExporterService.ts'
import { FileImportAsArrayBufferResult, getFileAsArrayBuffer } from '@/services/FileService.ts'
import { importFromPwlvl } from '@/services/PwlvlImporterService.ts'

export default defineComponent({
  setup() {
    const loading = { loadingDisconnect: ref(false), loadingExport: ref(false) }

    const PWClientStore = usePWClientStore()
    const router = useRouter()

    const importEelvlFileInput = ref<HTMLInputElement>()
    const importPwlvlFileInput = ref<HTMLInputElement>()

    const devViewEnabled = computed(() => import.meta.env.VITE_DEV_VIEW === 'TRUE')

    async function onDisconnectButtonClick() {
      getPwGameClient().disconnect(false)

      PWClientStore.setPwGameClient(undefined)
      PWClientStore.setPwApiClient(undefined)
      PWClientStore.worldId = ''
      PWClientStore.email = ''
      PWClientStore.password = ''
      await router.push({ name: LoginRoute.name })
    }

    async function onExportEelvlButtonClick() {
      exportToEelvl()
    }

    async function onImportEelvlButtonClick() {
      importEelvlFileInput.value!.click()
    }

    async function onExportPwlvlButtonClick() {
      exportToPwlvl()
    }

    async function onImportPwlvlButtonClick() {
      importPwlvlFileInput.value!.click()
    }

    async function onEelvlFileChange(event: Event) {
      const result: FileImportAsArrayBufferResult | null = await getFileAsArrayBuffer(event)
      if (!result) {
        return
      }
      sendGlobalChatMessage(`Importing world from ${result.file.name}`)
      await importFromEelvl(result.data)
    }

    async function onPwlvlFileChange(event: Event) {
      const result: FileImportAsArrayBufferResult | null = await getFileAsArrayBuffer(event)
      if (!result) {
        return
      }
      sendGlobalChatMessage(`Importing world from ${result.file.name}`)
      await importFromPwlvl(result.data)
    }

    return {
      loading,
      onDisconnectButtonClick,
      onExportEelvlButtonClick,
      onImportEelvlButtonClick,
      onExportPwlvlButtonClick,
      onImportPwlvlButtonClick,
      onEelvlFileChange,
      onPwlvlFileChange,
      devViewEnabled,
      importEelvlFileInput,
      importPwlvlFileInput,
    }
  },
})
