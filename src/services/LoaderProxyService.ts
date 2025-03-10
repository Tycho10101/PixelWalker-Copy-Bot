import { Ref } from 'vue'

export async function withLoading(loading: Ref<boolean>, callback: () => Promise<void>) {
  loading.value = true
  try {
    await callback()
  } finally {
    loading.value = false
  }
}
