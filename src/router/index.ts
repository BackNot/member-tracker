import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('../views/Members.vue')
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('../views/Statistics.vue')
    },
    {
      path: '/help',
      name: 'Help',
      component: () => import('../views/Help.vue')
    }
  ]
})

export default router 