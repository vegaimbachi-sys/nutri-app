import { createRouter, createWebHistory } from 'vue-router'
import PlannerView from '../views/PlannerView.vue'

const routes = [
  {
    path: '/',
    name: 'planner',
    component: PlannerView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router