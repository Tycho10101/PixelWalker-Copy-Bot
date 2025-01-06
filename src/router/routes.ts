export const LoginRoute = {
  path: '/login',
  name: 'login',
  component: () => import('@/views/Login/Login.vue'),
}

export const BotInfoRoute = {
  path: '/bot-info',
  name: 'bot-info',
  component: () => import('@/views/BotInfo/BotInfo.vue'),
}

export const NotFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/views/NotFound.vue'),
}
