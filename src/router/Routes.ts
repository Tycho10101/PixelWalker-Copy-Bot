const basePath = '/Pixel-Walker-Copy-Bot'

export const LoginRoute = {
  path: `${basePath}/login`,
  name: 'login',
  component: () => import('@/views/Login/Login.vue'),
}

export const BotInfoRoute = {
  path: `${basePath}/bot-info`,
  name: 'bot-info',
  component: () => import('@/views/BotInfo/BotInfo.vue'),
}

export const NotFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/views/NotFound.vue'),
}
