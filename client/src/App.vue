<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
    <!-- Navigation -->
    <nav class="glass border-b border-white/20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h1 class="text-xl font-bold text-white">Weather App</h1>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex space-x-8">
            <router-link 
              to="/" 
              class="text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
            >
              Current Weather
            </router-link>
            <router-link 
              to="/historical" 
              class="text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
            >
              Historical Data
            </router-link>
            <router-link 
              to="/all-locations" 
              class="text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
            >
              All Locations
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button 
              @click="toggleMobileMenu"
              class="text-white hover:text-blue-200 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <router-link 
              to="/" 
              class="block px-3 py-2 text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
              @click="mobileMenuOpen = false"
            >
              Current Weather
            </router-link>
            <router-link 
              to="/historical" 
              class="block px-3 py-2 text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
              @click="mobileMenuOpen = false"
            >
              Historical Data
            </router-link>
            <router-link 
              to="/all-locations" 
              class="block px-3 py-2 text-white hover:text-blue-200 transition-colors duration-200"
              active-class="text-blue-200 font-semibold"
              @click="mobileMenuOpen = false"
            >
              All Locations
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="glass border-t border-white/20 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="text-center text-white/80 text-sm">
          <p>&copy; 2024 Weather App. Powered by OpenWeatherMap API.</p>
        </div>
      </div>
    </footer>

    <!-- Loading overlay -->
    <div 
      v-if="loading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="loading-spinner w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span class="text-gray-700">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const mobileMenuOpen = ref(false)

    const loading = computed(() => store.state.loading)

    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }

    return {
      mobileMenuOpen,
      loading,
      toggleMobileMenu
    }
  }
}
</script>

<style scoped>
/* Additional component-specific styles can be added here */
</style> 