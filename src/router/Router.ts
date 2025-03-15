import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import * as Routes from './Routes.ts'
import { usePWClientStore } from '@/stores/PWClientStore.ts'
import { LoginViewRoute, NotFoundRoute } from './Routes.ts'

const buildRouter = () => {
  const routes: RouteRecordRaw[] = [...Object.values(Routes)].sort((a, b): number => {
    return a.path.length < b.path.length ? 1 : -1
  })

  const router = createRouter({
    history: createWebHistory(),
    routes: [...routes],
  })

  router.beforeEach((to) => {
    if (to.name === NotFoundRoute.name) {
      return { name: LoginViewRoute.name }
    }

    const PWClientStore = usePWClientStore()
    if (PWClientStore.pwApiClient === undefined || PWClientStore.pwGameClient === undefined) {
      if (to.name !== LoginViewRoute.name) {
        return { name: LoginViewRoute.name }
      }
    }
  })

  return router
}

export { buildRouter as createRouter }
