<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">Historical Weather Data</h1>
      <p class="text-white/80">View historical weather data with date range filters</p>
    </div>

    <!-- Filters -->
    <div class="glass rounded-lg p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Location Filter -->
        <div>
          <label for="location-filter" class="block text-white font-medium mb-2">Location</label>
          <select
            id="location-filter"
            v-model="filters.location"
            @change="onFiltersChange"
            class="form-select"
          >
            <option v-for="location in availableLocations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>

        <!-- Start Date -->
        <div>
          <label for="start-date" class="block text-white font-medium mb-2">From Date</label>
          <input
            id="start-date"
            type="date"
            v-model="filters.startDate"
            @change="onFiltersChange"
            :max="maxDate"
            class="form-input"
          />
        </div>

        <!-- End Date -->
        <div>
          <label for="end-date" class="block text-white font-medium mb-2">To Date</label>
          <input
            id="end-date"
            type="date"
            v-model="filters.endDate"
            @change="onFiltersChange"
            :max="maxDate"
            :min="filters.startDate"
            class="form-input"
          />
        </div>

        <!-- Search Button -->
        <div class="flex items-end">
          <button
            @click="fetchHistoricalData"
            :disabled="!isDateRangeValid || weatherLoading"
            class="btn-primary w-full"
          >
            <span v-if="weatherLoading">Loading...</span>
            <span v-else>Search</span>
          </button>
        </div>
      </div>

      <!-- Date Range Validation -->
      <div v-if="filters.startDate && filters.endDate && !isDateRangeValid" class="mt-4 alert alert-warning">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Date range must be within 30 days and cannot be in the future
        </div>
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

    <!-- Results Summary -->
    <div v-if="historicalWeather.length > 0" class="glass rounded-lg p-4 mb-6">
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <div class="text-white">
          <span class="font-semibold">{{ historicalWeather.length }}</span> records found for 
          <span class="font-semibold">{{ filters.location }}</span>
        </div>
        <div class="text-white/80 text-sm">
          Date range: {{ formattedDateRange }}
        </div>
      </div>
    </div>

    <!-- Historical Data Table -->
    <div v-if="historicalWeather.length > 0" class="animate-slide-up">
      <div class="table-container">
        <table class="table">
          <thead class="table-header">
            <tr>
              <th>Date & Time</th>
              <th>Temperature (°C)</th>
              <th>Humidity (%)</th>
              <th>Pressure (hPa)</th>
              <th>Wind Speed (m/s)</th>
              <th>Visibility (km)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="weather in historicalWeather" :key="weather.id" class="table-row">
              <td class="table-cell">
                <div class="flex items-center">
                  <img 
                    :src="`https://openweathermap.org/img/wn/${weather.icon}.png`"
                    :alt="weather.description"
                    class="w-8 h-8 mr-2"
                  />
                  <div>
                    <div class="font-medium">{{ weather.formattedDate }}</div>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <div class="text-center">
                  <div class="font-semibold">{{ weather.temperature.currentCelsius }}°C</div>
                  <div class="text-xs text-gray-500">
                    {{ weather.temperature.minCelsius }}°C - {{ weather.temperature.maxCelsius }}°C
                  </div>
                </div>
              </td>
              <td class="table-cell text-center">
                <div class="font-semibold">{{ weather.humidity }}%</div>
                <div class="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    class="bg-blue-400 h-1 rounded-full"
                    :style="{ width: `${weather.humidity}%` }"
                  ></div>
                </div>
              </td>
              <td class="table-cell text-center font-semibold">
                {{ weather.pressure }}
              </td>
              <td class="table-cell text-center">
                <div class="font-semibold">{{ weather.windSpeed }}</div>
                <div class="text-xs text-gray-500">
                  {{ weather.windDirection }}°
                </div>
              </td>
              <td class="table-cell text-center font-semibold">
                {{ weather.visibility }}
              </td>
              <td class="table-cell">
                <div class="capitalize text-gray-700">{{ weather.description }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="weatherLoading" class="text-center py-12">
      <div class="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-white">Loading historical data...</p>
    </div>

    <!-- No Data State -->
    <div v-else-if="!weatherLoading && historicalWeather.length === 0" class="text-center py-12">
      <div class="text-white/60 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg">No historical data found</p>
        <p class="text-sm">Select a location and date range to view historical weather data</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'HistoricalData',
  setup() {
    const store = useStore()
    
    // Local state
    const filters = ref({
      location: 'Delhi',
      startDate: '',
      endDate: ''
    })

    // Computed properties
    const historicalWeather = computed(() => store.getters['weather/historicalWeather'])
    const weatherLoading = computed(() => store.getters['weather/weatherLoading'])
    const weatherError = computed(() => store.getters['weather/weatherError'])
    const availableLocations = computed(() => store.getters['weather/availableLocations'])

    // Date validation
    const maxDate = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })

    const isDateRangeValid = computed(() => {
      if (!filters.value.startDate || !filters.value.endDate) return false
      
      const start = new Date(filters.value.startDate)
      const end = new Date(filters.value.endDate)
      const now = new Date()
      
      // Check if dates are in the past
      if (start > now || end > now) return false
      
      // Check if start date is before end date
      if (start >= end) return false
      
      // Check if date range is within 30 days
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24)
      if (daysDiff > 30) return false
      
      return true
    })

    const formattedDateRange = computed(() => {
      if (!filters.value.startDate || !filters.value.endDate) return ''
      
      const start = new Date(filters.value.startDate)
      const end = new Date(filters.value.endDate)
      
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    })

    // Methods
    const onFiltersChange = () => {
      // Clear error when filters change
      store.dispatch('weather/clearWeatherError')
    }

    const fetchHistoricalData = () => {
      if (!isDateRangeValid.value) return
      
      store.dispatch('weather/fetchHistoricalWeather', {
        location: filters.value.location,
        startDate: filters.value.startDate,
        endDate: filters.value.endDate
      })
    }

    // Set default date range (last 7 days)
    onMounted(() => {
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      filters.value.endDate = today.toISOString().split('T')[0]
      filters.value.startDate = weekAgo.toISOString().split('T')[0]
    })

    return {
      filters,
      historicalWeather,
      weatherLoading,
      weatherError,
      availableLocations,
      maxDate,
      isDateRangeValid,
      formattedDateRange,
      onFiltersChange,
      fetchHistoricalData
    }
  }
}
</script> 