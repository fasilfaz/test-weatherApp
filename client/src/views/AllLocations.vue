<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">All Locations Weather</h1>
      <p class="text-white/80">Current weather conditions for all available locations</p>
    </div>

    <!-- Refresh Button -->
    <div class="glass rounded-lg p-6 mb-8">
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <div class="text-white mb-4 sm:mb-0">
          <span class="font-semibold">{{ allLocationsWeather.length }}</span> locations available
        </div>
        <button
          @click="refreshAllWeather"
          :disabled="weatherLoading"
          class="btn-primary flex items-center space-x-2"
        >
          <svg v-if="weatherLoading" class="loading-spinner w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ weatherLoading ? 'Refreshing...' : 'Refresh All' }}</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="weatherError" class="alert alert-error mb-6">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ weatherError }}
      </div>
    </div>

    <!-- Weather Cards Grid -->
    <div v-if="allLocationsWeather.length > 0" class="animate-slide-up">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="weather in allLocationsWeather" 
          :key="weather.id"
          class="weather-card glass rounded-lg p-6 text-center"
        >
          <!-- Location Header -->
          <div class="mb-4">
            <h3 class="text-xl font-bold text-white mb-1">{{ weather.location }}</h3>
            <p class="text-white/60 text-sm">{{ weather.formattedDate }}</p>
          </div>

          <!-- Weather Icon and Temperature -->
          <div class="mb-6">
            <div class="weather-icon mb-3">
              <img 
                :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
                :alt="weather.description"
                class="w-16 h-16 mx-auto"
              />
            </div>
            <div class="temperature-display text-3xl font-bold text-white mb-2">
              {{ weather.temperature.currentCelsius }}°C
            </div>
            <p class="text-white/80 capitalize text-sm">{{ weather.description }}</p>
          </div>

          <!-- Weather Details -->
          <div class="space-y-3">
            <!-- Temperature Range -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Min:</span>
              <span class="text-white font-medium">{{ weather.temperature.minCelsius }}°C</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Max:</span>
              <span class="text-white font-medium">{{ weather.temperature.maxCelsius }}°C</span>
            </div>

            <!-- Humidity -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Humidity:</span>
              <span class="text-white font-medium">{{ weather.humidity }}%</span>
            </div>

            <!-- Pressure -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Pressure:</span>
              <span class="text-white font-medium">{{ weather.pressure }} hPa</span>
            </div>

            <!-- Wind -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Wind:</span>
              <span class="text-white font-medium">{{ weather.windSpeed }} m/s</span>
            </div>

            <!-- Visibility -->
            <div class="flex justify-between items-center text-sm">
              <span class="text-white/60">Visibility:</span>
              <span class="text-white font-medium">{{ weather.visibility }} km</span>
            </div>
          </div>

          <!-- View Details Button -->
          <div class="mt-6">
            <button
              @click="viewLocationDetails(weather.location)"
              class="btn-secondary w-full text-sm"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="weatherLoading" class="text-center py-12">
      <div class="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-white">Loading weather data for all locations...</p>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-12">
      <div class="text-white/60 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <p class="text-lg">No weather data available</p>
        <p class="text-sm">Click refresh to load weather data for all locations</p>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="allLocationsWeather.length > 0" class="mt-8 animate-slide-up">
      <div class="glass rounded-lg p-6">
        <h3 class="text-xl font-bold text-white mb-4">Weather Summary</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ averageTemperature }}°C</div>
            <div class="text-white/60 text-sm">Avg Temperature</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ averageHumidity }}%</div>
            <div class="text-white/60 text-sm">Avg Humidity</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ warmestLocation }}</div>
            <div class="text-white/60 text-sm">Warmest</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white">{{ coldestLocation }}</div>
            <div class="text-white/60 text-sm">Coldest</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'AllLocations',
  setup() {
    const store = useStore()
    const router = useRouter()

    // Computed properties
    const allLocationsWeather = computed(() => store.getters['weather/allLocationsWeather'])
    const weatherLoading = computed(() => store.getters['weather/weatherLoading'])
    const weatherError = computed(() => store.getters['weather/weatherError'])

    // Summary statistics
    const averageTemperature = computed(() => {
      if (allLocationsWeather.value.length === 0) return 0
      const total = allLocationsWeather.value.reduce((sum, weather) => 
        sum + weather.temperature.currentCelsius, 0)
      return Math.round(total / allLocationsWeather.value.length)
    })

    const averageHumidity = computed(() => {
      if (allLocationsWeather.value.length === 0) return 0
      const total = allLocationsWeather.value.reduce((sum, weather) => 
        sum + weather.humidity, 0)
      return Math.round(total / allLocationsWeather.value.length)
    })

    const warmestLocation = computed(() => {
      if (allLocationsWeather.value.length === 0) return 'N/A'
      const warmest = allLocationsWeather.value.reduce((max, weather) => 
        weather.temperature.currentCelsius > max.temperature.currentCelsius ? weather : max)
      return warmest.location
    })

    const coldestLocation = computed(() => {
      if (allLocationsWeather.value.length === 0) return 'N/A'
      const coldest = allLocationsWeather.value.reduce((min, weather) => 
        weather.temperature.currentCelsius < min.temperature.currentCelsius ? weather : min)
      return coldest.location
    })

    // Methods
    const refreshAllWeather = () => {
      store.dispatch('weather/fetchAllLocationsWeather')
    }

    const viewLocationDetails = (location) => {
      store.dispatch('weather/setSelectedLocation', location)
      router.push('/')
    }

    // Load initial data
    onMounted(() => {
      store.dispatch('weather/fetchAllLocationsWeather')
    })

    return {
      allLocationsWeather,
      weatherLoading,
      weatherError,
      averageTemperature,
      averageHumidity,
      warmestLocation,
      coldestLocation,
      refreshAllWeather,
      viewLocationDetails
    }
  }
}
</script> 