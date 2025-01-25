import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import * as Routes from './routes'
import { usePWClientStore } from '@/stores/PWClientStore.ts'

const buildRouter = () => {
  const routes: RouteRecordRaw[] = [...Object.values(Routes)].sort((a, b): number => {
    return a.path.length < b.path.length ? 1 : -1
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [...routes],
  })

  router.beforeEach((to) => {
    if (to.name === 'notFound') {
      return { name: 'login' }
    }

    const PWClientStore = usePWClientStore()
    if (PWClientStore.pwApiClient === undefined || PWClientStore.pwGameClient === undefined) {
      if (to.name !== 'login') {
        return { name: 'login' }
      }
    }
  })

  return router
}

export { buildRouter as createRouter }
