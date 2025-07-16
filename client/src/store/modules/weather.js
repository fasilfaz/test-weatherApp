import axios from 'axios'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/graphql' 
  : 'http://localhost:4000/graphql'

// GraphQL queries
const GET_CURRENT_WEATHER = `
  query GetCurrentWeather($location: String!) {
    getCurrentWeather(location: $location) {
      success
      data {
        id
        location
        temperature {
          currentCelsius
          minCelsius
          maxCelsius
        }
        humidity
        pressure
        windSpeed
        windDirection
        description
        icon
        visibility
        clouds
        timestamp
        formattedDate
      }
      error
    }
  }
`

const GET_HISTORICAL_WEATHER = `
  query GetHistoricalWeather($location: String!, $startDate: String!, $endDate: String!, $pagination: PaginationInput) {
    getHistoricalWeather(location: $location, startDate: $startDate, endDate: $endDate, pagination: $pagination) {
      success
      data {
        id
        location
        temperature {
          currentCelsius
          minCelsius
          maxCelsius
        }
        humidity
        pressure
        windSpeed
        windDirection
        description
        icon
        visibility
        clouds
        timestamp
        formattedDate
      }
      total
      error
    }
  }
`

const GET_ALL_LOCATIONS_WEATHER = `
  query GetAllLocationsWeather {
    getAllLocationsWeather {
      success
      data {
        id
        location
        temperature {
          currentCelsius
          minCelsius
          maxCelsius
        }
        humidity
        pressure
        windSpeed
        windDirection
        description
        icon
        visibility
        clouds
        timestamp
        formattedDate
      }
      failed
      total
      error
    }
  }
`

const FETCH_CURRENT_WEATHER = `
  mutation FetchCurrentWeather($location: String!) {
    fetchCurrentWeather(location: $location) {
      success
      data {
        id
        location
        temperature {
          currentCelsius
          minCelsius
          maxCelsius
        }
        humidity
        pressure
        windSpeed
        windDirection
        description
        icon
        visibility
        clouds
        timestamp
        formattedDate
      }
      error
    }
  }
`

export default {
  namespaced: true,
  state: {
    currentWeather: null,
    historicalWeather: [],
    allLocationsWeather: [],
    selectedLocation: 'Delhi',
    availableLocations: ['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh'],
    loading: false,
    error: null
  },
  mutations: {
    SET_CURRENT_WEATHER(state, weather) {
      state.currentWeather = weather
    },
    SET_HISTORICAL_WEATHER(state, weather) {
      state.historicalWeather = weather
    },
    SET_ALL_LOCATIONS_WEATHER(state, weather) {
      state.allLocationsWeather = weather
    },
    SET_SELECTED_LOCATION(state, location) {
      state.selectedLocation = location
    },
    SET_AVAILABLE_LOCATIONS(state, locations) {
      state.availableLocations = locations
    },
    SET_WEATHER_LOADING(state, loading) {
      state.loading = loading
    },
    SET_WEATHER_ERROR(state, error) {
      state.error = error
    },
    CLEAR_WEATHER_ERROR(state) {
      state.error = null
    }
  },
  actions: {
    async fetchCurrentWeather({ commit }, location) {
      try {
        commit('SET_WEATHER_LOADING', true)
        commit('CLEAR_WEATHER_ERROR')

        const response = await axios.post(API_BASE_URL, {
          query: GET_CURRENT_WEATHER,
          variables: { location }
        })

        const { data } = response.data

        if (data.getCurrentWeather.success) {
          commit('SET_CURRENT_WEATHER', data.getCurrentWeather.data)
          commit('SET_SELECTED_LOCATION', location)
        } else {
          throw new Error(data.getCurrentWeather.error)
        }
      } catch (error) {
        commit('SET_WEATHER_ERROR', error.message)
        console.error('Error fetching current weather:', error)
      } finally {
        commit('SET_WEATHER_LOADING', false)
      }
    },

    async fetchHistoricalWeather({ commit }, { location, startDate, endDate, pagination = {} }) {
      try {
        commit('SET_WEATHER_LOADING', true)
        commit('CLEAR_WEATHER_ERROR')

        const response = await axios.post(API_BASE_URL, {
          query: GET_HISTORICAL_WEATHER,
          variables: { location, startDate, endDate, pagination }
        })

        const { data } = response.data

        if (data.getHistoricalWeather.success) {
          commit('SET_HISTORICAL_WEATHER', data.getHistoricalWeather.data)
        } else {
          throw new Error(data.getHistoricalWeather.error)
        }
      } catch (error) {
        commit('SET_WEATHER_ERROR', error.message)
        console.error('Error fetching historical weather:', error)
      } finally {
        commit('SET_WEATHER_LOADING', false)
      }
    },

    async fetchAllLocationsWeather({ commit }) {
      try {
        commit('SET_WEATHER_LOADING', true)
        commit('CLEAR_WEATHER_ERROR')

        const response = await axios.post(API_BASE_URL, {
          query: GET_ALL_LOCATIONS_WEATHER
        })

        const { data } = response.data

        if (data.getAllLocationsWeather.success) {
          commit('SET_ALL_LOCATIONS_WEATHER', data.getAllLocationsWeather.data)
        } else {
          throw new Error(data.getAllLocationsWeather.error)
        }
      } catch (error) {
        commit('SET_WEATHER_ERROR', error.message)
        console.error('Error fetching all locations weather:', error)
      } finally {
        commit('SET_WEATHER_LOADING', false)
      }
    },

    async refreshCurrentWeather({ commit, state }) {
      try {
        commit('SET_WEATHER_LOADING', true)
        commit('CLEAR_WEATHER_ERROR')

        const response = await axios.post(API_BASE_URL, {
          query: FETCH_CURRENT_WEATHER,
          variables: { location: state.selectedLocation }
        })

        const { data } = response.data

        if (data.fetchCurrentWeather.success) {
          commit('SET_CURRENT_WEATHER', data.fetchCurrentWeather.data)
        } else {
          throw new Error(data.fetchCurrentWeather.error)
        }
      } catch (error) {
        commit('SET_WEATHER_ERROR', error.message)
        console.error('Error refreshing current weather:', error)
      } finally {
        commit('SET_WEATHER_LOADING', false)
      }
    },

    setSelectedLocation({ commit }, location) {
      commit('SET_SELECTED_LOCATION', location)
    },

    clearWeatherError({ commit }) {
      commit('CLEAR_WEATHER_ERROR')
    }
  },
  getters: {
    currentWeather: state => state.currentWeather,
    historicalWeather: state => state.historicalWeather,
    allLocationsWeather: state => state.allLocationsWeather,
    selectedLocation: state => state.selectedLocation,
    availableLocations: state => state.availableLocations,
    weatherLoading: state => state.loading,
    weatherError: state => state.error,
    hasWeatherError: state => !!state.error
  }
} 