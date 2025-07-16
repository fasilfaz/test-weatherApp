const Joi = require('joi');
const logger = require('./logger');

// Validation schemas
const weatherValidation = {
  // Schema for fetching current weather
  fetchCurrentWeather: Joi.object({
    location: Joi.string()
      .valid('Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh')
      .required()
      .messages({
        'any.only': 'Location must be one of: Delhi, Moscow, Paris, New York, Sydney, Riyadh',
        'any.required': 'Location is required'
      })
  }),

  // Schema for historical weather data
  getHistoricalWeather: Joi.object({
    location: Joi.string()
      .valid('Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh')
      .required()
      .messages({
        'any.only': 'Location must be one of: Delhi, Moscow, Paris, New York, Sydney, Riyadh',
        'any.required': 'Location is required'
      }),
    startDate: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'Start date cannot be in the future',
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date()
      .max('now')
      .min(Joi.ref('startDate'))
      .required()
      .messages({
        'date.max': 'End date cannot be in the future',
        'date.min': 'End date must be after start date',
        'any.required': 'End date is required'
      })
  }).custom((value, helpers) => {
    const { startDate, endDate } = value;
    const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      return helpers.error('any.invalid', { 
        message: 'Date range cannot exceed 30 days' 
      });
    }
    
    return value;
  }),

  // Schema for pagination
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  }),

  // Schema for weather data
  weatherData: Joi.object({
    location: Joi.string()
      .valid('Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh')
      .required(),
    temperature: Joi.object({
      current: Joi.number().required(),
      min: Joi.number().required(),
      max: Joi.number().required()
    }).required(),
    humidity: Joi.number().min(0).max(100).required(),
    pressure: Joi.number().positive().required(),
    windSpeed: Joi.number().min(0).required(),
    windDirection: Joi.number().min(0).max(360).required(),
    description: Joi.string().required(),
    icon: Joi.string().required(),
    visibility: Joi.number().min(0).required(),
    clouds: Joi.number().min(0).max(100).required()
  })
};

// Validation function
const validate = (schema, data) => {
  try {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      logger.warn('Validation failed:', { data, errors: errorMessages });
      throw new Error(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`);
    }

    return value;
  } catch (error) {
    logger.error('Validation error:', error);
    throw error;
  }
};

// Specific validation functions
const validateWeatherRequest = (data) => validate(weatherValidation.fetchCurrentWeather, data);
const validateHistoricalRequest = (data) => validate(weatherValidation.getHistoricalWeather, data);
const validatePagination = (data) => validate(weatherValidation.pagination, data);
const validateWeatherData = (data) => validate(weatherValidation.weatherData, data);

// Date validation helper
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start > now || end > now) {
    throw new Error('Dates cannot be in the future');
  }

  if (start > end) {
    throw new Error('Start date must be before end date');
  }

  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) {
    throw new Error('Date range cannot exceed 30 days');
  }

  return { start, end };
};

// Location validation helper
const validateLocation = (location) => {
  const validLocations = ['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh'];
  
  if (!validLocations.includes(location)) {
    throw new Error(`Invalid location. Must be one of: ${validLocations.join(', ')}`);
  }
  
  return location;
};

module.exports = {
  validate,
  validateWeatherRequest,
  validateHistoricalRequest,
  validatePagination,
  validateWeatherData,
  validateDateRange,
  validateLocation,
  weatherValidation
}; 