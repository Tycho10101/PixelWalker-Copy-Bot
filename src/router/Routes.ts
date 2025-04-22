const basePath = '/Pixel-Walker-Copy-Bot'

export const LoginViewRoute = {
  path: `${basePath}/login`,
  name: 'login',
  component: () => import('@/view/LoginView.vue'),
}

export const BotViewRoute = {
  path: `${basePath}/bot`,
  name: 'bot',
  component: () => import('@/view/BotView.vue'),
}

export const NotFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/view/NotFoundView.vue'),
}
