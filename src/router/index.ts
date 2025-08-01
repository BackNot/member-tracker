import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import { ROUTES, ROUTE_NAMES } from './routerConst'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.HOME,
      name: ROUTE_NAMES.HOME,
      component: Dashboard
    },
    {
      path: ROUTES.MEMBERS.LIST,
      name: ROUTE_NAMES.MEMBERS.LIST,
      component: () => import('../views/Members.vue')
    },
    {
      path: ROUTES.STATISTICS,
      name: ROUTE_NAMES.STATISTICS,
      component: () => import('../views/Statistics.vue')
    },
    {
      path: ROUTES.HELP,
      name: ROUTE_NAMES.HELP,
      component: () => import('../views/Help.vue')
    },
    {
      path: ROUTES.MEMBERS.CREATE,
      name: ROUTE_NAMES.MEMBERS.CREATE,
      component: () => import('../views/CreateMember.vue')
    },
     {
      path: ROUTES.MEMBERSHIPS.LIST,
      name: ROUTE_NAMES.MEMBERSHIPS.LIST,
      component: () => import('../views/Memberships.vue')
    },
       {
      path: ROUTES.MEMBERSHIPS.CREATE,
      name: ROUTE_NAMES.MEMBERSHIPS.CREATE,
      component: () => import('../views/CreateMembership.vue')
    },
  ]
})

export default router