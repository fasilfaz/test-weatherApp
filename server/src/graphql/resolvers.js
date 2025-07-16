const weatherService = require('../services/weatherService');
const { validateWeatherRequest, validateHistoricalRequest, validateLocation } = require('../utils/validation');
const logger = require('../utils/logger');

const resolvers = {
  Query: {
    // Get current weather for a location
    getCurrentWeather: async (_, { location }) => {
      try {
        // Validate input
        const validatedData = validateWeatherRequest({ location });
        
        // Get latest weather data
        const weather = await weatherService.getLatestWeather(validatedData.location);
        
        return {
          success: true,
          data: weather,
          error: null
        };
      } catch (error) {
        logger.error('Error in getCurrentWeather:', error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }
    },

    // Get historical weather data
    getHistoricalWeather: async (_, { location, startDate, endDate, pagination = {} }) => {
      try {
        // Validate input
        const validatedData = validateHistoricalRequest({ location, startDate, endDate });
        
        // Get historical weather data
        const weatherData = await weatherService.getWeatherByLocationAndDateRange(
          validatedData.location,
          validatedData.startDate,
          validatedData.endDate
        );

        // Apply pagination
        const { page = 1, limit = 20 } = pagination;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = weatherData.slice(startIndex, endIndex);

        return {
          success: true,
          data: paginatedData,
          total: weatherData.length,
          error: null
        };
      } catch (error) {
        logger.error('Error in getHistoricalWeather:', error);
        return {
          success: false,
          data: [],
          total: 0,
          error: error.message
        };
      }
    },

    // Get all available locations
    getLocations: async () => {
      try {
        const locations = await weatherService.getLocations();
        
        return {
          success: true,
          data: locations,
          error: null
        };
      } catch (error) {
        logger.error('Error in getLocations:', error);
        return {
          success: false,
          data: [],
          error: error.message
        };
      }
    },

    // Get latest weather for all locations
    getAllLocationsWeather: async () => {
      try {
        const locations = weatherService.getAvailableLocations();
        const weatherPromises = locations.map(location => 
          weatherService.getLatestWeather(location).catch(error => {
            logger.error(`Error fetching weather for ${location}:`, error);
            return null;
          })
        );

        const weatherResults = await Promise.all(weatherPromises);
        const successfulData = weatherResults.filter(result => result !== null);
        const failedLocations = locations.filter((_, index) => weatherResults[index] === null);

        return {
          success: true,
          data: successfulData,
          failed: failedLocations,
          total: successfulData.length,
          error: null
        };
      } catch (error) {
        logger.error('Error in getAllLocationsWeather:', error);
        return {
          success: false,
          data: [],
          failed: [],
          total: 0,
          error: error.message
        };
      }
    },

    // Health check
    health: () => {
      return 'Weather API is running!';
    }
  },

  Mutation: {
    // Fetch and store current weather for a location
    fetchCurrentWeather: async (_, { location }) => {
      try {
        // Validate input
        const validatedData = validateWeatherRequest({ location });
        
        // Fetch fresh weather data from API
        const weather = await weatherService.fetchCurrentWeather(validatedData.location);
        
        return {
          success: true,
          data: weather,
          error: null
        };
      } catch (error) {
        logger.error('Error in fetchCurrentWeather:', error);
        return {
          success: false,
          data: null,
          error: error.message
        };
      }
    },

    // Fetch weather for all locations
    fetchAllLocationsWeather: async () => {
      try {
        const result = await weatherService.fetchAllLocationsWeather();
        
        return {
          success: true,
          data: result.successful,
          failed: result.failed,
          total: result.successful.length,
          error: null
        };
      } catch (error) {
        logger.error('Error in fetchAllLocationsWeather:', error);
        return {
          success: false,
          data: [],
          failed: [],
          total: 0,
          error: error.message
        };
      }
    }
  },

  // Custom resolvers for computed fields
  Weather: {
    // Convert temperature from Kelvin to Celsius
    temperature: (parent) => {
      const temp = parent.temperature;
      return {
        current: temp.current,
        min: temp.min,
        max: temp.max,
        currentCelsius: Math.round(temp.current - 273.15),
        minCelsius: Math.round(temp.min - 273.15),
        maxCelsius: Math.round(temp.max - 273.15)
      };
    },

    // Format timestamp
    timestamp: (parent) => {
      return parent.timestamp.toISOString();
    },

    // Format date for display
    formattedDate: (parent) => {
      return parent.formattedDate || parent.timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Format creation date
    createdAt: (parent) => {
      return parent.createdAt.toISOString();
    },

    // Format update date
    updatedAt: (parent) => {
      return parent.updatedAt.toISOString();
    }
  },

  // Error handling for all resolvers
  WeatherResponse: {
    data: (parent) => parent.data,
    success: (parent) => parent.success,
    error: (parent) => parent.error
  },

  HistoricalWeatherResponse: {
    data: (parent) => parent.data,
    success: (parent) => parent.success,
    total: (parent) => parent.total,
    error: (parent) => parent.error
  },

  LocationsResponse: {
    data: (parent) => parent.data,
    success: (parent) => parent.success,
    error: (parent) => parent.error
  },

  BulkWeatherResponse: {
    data: (parent) => parent.data,
    success: (parent) => parent.success,
    failed: (parent) => parent.failed,
    total: (parent) => parent.total,
    error: (parent) => parent.error
  }
};

module.exports = { resolvers }; 