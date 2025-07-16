import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import global styles
import './assets/css/global.css'

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(store)
app.use(router)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount app
app.mount('#app') 