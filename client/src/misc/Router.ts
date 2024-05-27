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
        path: '/room',
        name: 'room',
        component: () => import('../room/Room.vue')
    },
    {
        path: '/roomList',
        name: 'roomList',
        component: () => import('../room/RoomList.vue')
    }
  ]
})

export default router
