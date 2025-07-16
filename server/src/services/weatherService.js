const axios = require('axios');
const Weather = require('../models/Weather');
const logger = require('../utils/logger');

// Location coordinates mapping
const LOCATION_COORDINATES = {
  'Delhi': { lat: 28.6139, lon: 77.2090 },
  'Moscow': { lat: 55.7558, lon: 37.6176 },
  'Paris': { lat: 48.8566, lon: 2.3522 },
  'New York': { lat: 40.7128, lon: -74.0060 },
  'Sydney': { lat: -33.8688, lon: 151.2093 },
  'Riyadh': { lat: 24.7136, lon: 46.6753 }
};

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
    
    if (!this.apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }
  }

  // Fetch current weather from OpenWeatherMap API
  async fetchCurrentWeather(location) {
    try {
      const coords = LOCATION_COORDINATES[location];
      if (!coords) {
        throw new Error(`Invalid location: ${location}`);
      }

      const url = `${this.baseUrl}/weather`;
      const params = {
        lat: coords.lat,
        lon: coords.lon,
        appid: this.apiKey,
        units: 'metric'
      };

      logger.info(`Fetching weather data for ${location}`);
      const response = await axios.get(url, { params, timeout: 10000 });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const weatherData = this.transformWeatherData(response.data, location);
      
      // Save to database
      const savedWeather = await this.saveWeatherData(weatherData);
      
      logger.info(`Weather data saved for ${location}`);
      return savedWeather;

    } catch (error) {
      logger.error(`Error fetching weather for ${location}:`, error.message);
      throw new Error(`Failed to fetch weather data for ${location}: ${error.message}`);
    }
  }

  // Transform API response to our format
  transformWeatherData(apiData, location) {
    return {
      location: location,
      temperature: {
        current: apiData.main.temp + 273.15, // Convert to Kelvin for storage
        min: apiData.main.temp_min + 273.15,
        max: apiData.main.temp_max + 273.15
      },
      humidity: apiData.main.humidity,
      pressure: apiData.main.pressure,
      windSpeed: apiData.wind.speed,
      windDirection: apiData.wind.deg || 0,
      description: apiData.weather[0].description,
      icon: apiData.weather[0].icon,
      visibility: apiData.visibility / 1000, // Convert to km
      clouds: apiData.clouds.all,
      timestamp: new Date(apiData.dt * 1000),
      apiResponse: apiData
    };
  }

  // Save weather data to database
  async saveWeatherData(weatherData) {
    try {
      const weather = new Weather(weatherData);
      const savedWeather = await weather.save();
      
      logger.info(`Weather data saved to database for ${weatherData.location}`);
      return savedWeather;
    } catch (error) {
      logger.error('Error saving weather data:', error);
      throw new Error(`Failed to save weather data: ${error.message}`);
    }
  }

  // Get weather data by location and date range
  async getWeatherByLocationAndDateRange(location, startDate, endDate) {
    try {
      // Validate date range (max 30 days)
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 30) {
        throw new Error('Date range cannot exceed 30 days');
      }

      if (start > end) {
        throw new Error('Start date must be before end date');
      }

      const weatherData = await Weather.getWeatherByLocationAndDateRange(location, startDate, endDate);
      
      logger.info(`Retrieved ${weatherData.length} weather records for ${location}`);
      return weatherData;
    } catch (error) {
      logger.error(`Error retrieving weather data for ${location}:`, error.message);
      throw error;
    }
  }

  // Get latest weather for a location
  async getLatestWeather(location) {
    try {
      const weather = await Weather.getLatestWeather(location);
      
      if (!weather) {
        // If no data exists, fetch from API
        logger.info(`No historical data found for ${location}, fetching from API`);
        return await this.fetchCurrentWeather(location);
      }
      
      return weather;
    } catch (error) {
      logger.error(`Error getting latest weather for ${location}:`, error.message);
      throw error;
    }
  }

  // Get all available locations
  async getLocations() {
    try {
      const locations = await Weather.getLocations();
      return locations.length > 0 ? locations : Object.keys(LOCATION_COORDINATES);
    } catch (error) {
      logger.error('Error getting locations:', error.message);
      return Object.keys(LOCATION_COORDINATES);
    }
  }

  // Fetch weather for all locations
  async fetchAllLocationsWeather() {
    try {
      const locations = Object.keys(LOCATION_COORDINATES);
      const promises = locations.map(location => this.fetchCurrentWeather(location));
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      logger.info(`Successfully fetched weather for ${successful.length} locations`);
      if (failed.length > 0) {
        logger.warn(`Failed to fetch weather for ${failed.length} locations`);
      }
      
      return {
        successful: successful.map(result => result.value),
        failed: failed.map(result => result.reason.message)
      };
    } catch (error) {
      logger.error('Error fetching all locations weather:', error.message);
      throw error;
    }
  }

  // Validate location
  isValidLocation(location) {
    return LOCATION_COORDINATES.hasOwnProperty(location);
  }

  // Get available locations
  getAvailableLocations() {
    return Object.keys(LOCATION_COORDINATES);
  }
}

module.exports = new WeatherService(); 