import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'translator',
      component: () => import('@/views/translator/index.vue'),
    }
  ],
})

export default router
