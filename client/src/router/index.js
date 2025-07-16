import { createRouter, createWebHistory } from 'vue-router'
import CurrentWeather from '../views/CurrentWeather.vue'
import HistoricalData from '../views/HistoricalData.vue'
import AllLocations from '../views/AllLocations.vue'

const routes = [
  {
    path: '/',
    name: 'CurrentWeather',
    component: CurrentWeather,
    meta: {
      title: 'Current Weather'
    }
  },
  {
    path: '/historical',
    name: 'HistoricalData',
    component: HistoricalData,
    meta: {
      title: 'Historical Data'
    }
  },
  {
    path: '/all-locations',
    name: 'AllLocations',
    component: AllLocations,
    meta: {
      title: 'All Locations'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard to update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Weather App` : 'Weather App'
  next()
})

export default router 