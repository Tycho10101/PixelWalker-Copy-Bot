export const HomeRoute = {
  path: '/',
  name: 'home',
  component: () => import('@/views/home/Home.vue'),
}

export const NotFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'notFound',
  component: () => import('@/views/NotFound.vue'),
}
