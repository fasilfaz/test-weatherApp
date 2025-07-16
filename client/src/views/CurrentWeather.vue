<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">Current Weather</h1>
      <p class="text-white/80">Get real-time weather information for your selected location</p>
    </div>

    <!-- Location Selector -->
    <div class="glass rounded-lg p-6 mb-8">
      <div class="flex flex-col sm:flex-row gap-4 items-center">
        <div class="flex-1">
          <label for="location" class="block text-white font-medium mb-2">Select Location</label>
          <select
            id="location"
            v-model="selectedLocation"
            @change="onLocationChange"
            class="form-select"
          >
            <option v-for="location in availableLocations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        <button
          @click="refreshWeather"
          :disabled="weatherLoading"
          class="btn-primary flex items-center space-x-2"
        >
          <svg v-if="weatherLoading" class="loading-spinner w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ weatherLoading ? 'Refreshing...' : 'Refresh' }}</span>
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

    <!-- Weather Display -->
    <div v-if="currentWeather" class="animate-slide-up">
      <div class="weather-card glass rounded-lg p-8 text-center">
        <!-- Location and Date -->
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">{{ currentWeather.location }}</h2>
          <p class="text-white/80">{{ currentWeather.formattedDate }}</p>
        </div>

        <!-- Main Weather Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <!-- Temperature -->
          <div class="text-center">
            <div class="weather-icon mb-4">
              <img 
                :src="`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`"
                :alt="currentWeather.description"
                class="w-20 h-20 mx-auto"
              />
            </div>
            <div class="temperature-display text-4xl font-bold text-white mb-2">
              {{ currentWeather.temperature.currentCelsius }}°C
            </div>
            <p class="text-white/80 capitalize">{{ currentWeather.description }}</p>
          </div>

          <!-- Min/Max Temperature -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-white mb-4">Temperature Range</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-white/80">Min:</span>
                <span class="text-white font-medium">{{ currentWeather.temperature.minCelsius }}°C</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white/80">Max:</span>
                <span class="text-white font-medium">{{ currentWeather.temperature.maxCelsius }}°C</span>
              </div>
            </div>
          </div>

          <!-- Humidity -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-white mb-4">Humidity</h3>
            <div class="text-3xl font-bold text-white mb-2">{{ currentWeather.humidity }}%</div>
            <div class="w-full bg-white/20 rounded-full h-2">
              <div 
                class="bg-blue-400 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${currentWeather.humidity}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Additional Weather Details -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-white/60 text-sm mb-1">Pressure</div>
            <div class="text-white font-semibold">{{ currentWeather.pressure }} hPa</div>
          </div>
          <div class="text-center">
            <div class="text-white/60 text-sm mb-1">Wind Speed</div>
            <div class="text-white font-semibold">{{ currentWeather.windSpeed }} m/s</div>
          </div>
          <div class="text-center">
            <div class="text-white/60 text-sm mb-1">Visibility</div>
            <div class="text-white font-semibold">{{ currentWeather.visibility }} km</div>
          </div>
          <div class="text-center">
            <div class="text-white/60 text-sm mb-1">Clouds</div>
            <div class="text-white font-semibold">{{ currentWeather.clouds }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="weatherLoading" class="text-center py-12">
      <div class="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-white">Loading weather data...</p>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-12">
      <div class="text-white/60 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <p class="text-lg">No weather data available</p>
        <p class="text-sm">Select a location and click refresh to get current weather</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CurrentWeather',
  setup() {
    const store = useStore()
    const selectedLocation = ref('Delhi')

    // Computed properties
    const currentWeather = computed(() => store.getters['weather/currentWeather'])
    const weatherLoading = computed(() => store.getters['weather/weatherLoading'])
    const weatherError = computed(() => store.getters['weather/weatherError'])
    const availableLocations = computed(() => store.getters['weather/availableLocations'])
    // Dummy hourly forecast for UI (replace with real data if available)
    const hourlyForecast = computed(() => [
      { time: 'Now', temp: 25, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '2 AM', temp: 24, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '3 AM', temp: 23, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '4 AM', temp: 22, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '5 AM', temp: 20, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '6 AM', temp: 25, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '7 AM', temp: 25, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '8 AM', temp: 23, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '9 AM', temp: 22, icon: currentWeather.value.icon, description: currentWeather.value.description },
      { time: '10 AM', temp: 20, icon: currentWeather.value.icon, description: currentWeather.value.description },
    ])

    // Methods
    const onLocationChange = () => {
      store.dispatch('weather/fetchCurrentWeather', selectedLocation.value)
    }

    const refreshWeather = () => {
      store.dispatch('weather/refreshCurrentWeather')
    }

    // Load initial weather data
    onMounted(() => {
      store.dispatch('weather/fetchCurrentWeather', selectedLocation.value)
    })

    return {
      selectedLocation,
      currentWeather,
      weatherLoading,
      weatherError,
      availableLocations,
      onLocationChange,
      refreshWeather,
      hourlyForecast
    }
  }
}
</script> 