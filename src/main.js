import 'sweetalert2/dist/sweetalert2.min.css'
import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { useLocaleStore } from './stores/locale'
import { useAuthStore } from './stores/auth'
import { getDashboardPath } from './config/roles'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueApexCharts)

// Réhydratation session (localStorage + claims JWT) avant toute navigation
const authStore = useAuthStore()
authStore.initializeAuth()

const localeStore = useLocaleStore()
localeStore.setLocale('fr')

app.mount('#app')

// Ne pas écraser la route courante au refresh.
// Rediriger seulement sur la racine.
router.isReady().then(() => {
  const currentPath = router.currentRoute.value.path || '/'
  if (currentPath !== '/') return

  if (authStore.isAuthenticated) {
    router.replace(getDashboardPath(authStore.role || 'client'))
  } else {
    router.replace('/splash')
  }
})
