import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import * as Routes from './routes'

const buildRouter = () => {
  const routes: RouteRecordRaw[] = [...Object.values(Routes)].sort((a, b): number => {
    return a.path.length < b.path.length ? 1 : -1
  })

  return createRouter({
    history: createWebHistory(),
    routes: [
      ...routes,
    ],
  })
}

export { buildRouter as createRouter }