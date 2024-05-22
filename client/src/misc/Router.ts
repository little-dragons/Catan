import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../home/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../about/About.vue')
    },
    {
        path: '/room/:id',
        name: 'room',
        component: () => import('../room/Room.vue')
    }
  ]
})

export default router
