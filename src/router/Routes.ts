const basePath = '/Pixel-Walker-Copy-Bot'

export const LoginViewRoute = {
  path: `${basePath}/login`,
  name: 'login',
  component: () => import('@/views/LoginView.vue'),
}

export const BotViewRoute = {
  path: `${basePath}/bot`,
  name: 'bot',
  component: () => import('@/views/BotView.vue'),
}

export const NotFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/views/NotFoundView.vue'),
}
