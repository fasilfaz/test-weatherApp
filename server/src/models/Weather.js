const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
    enum: ['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh'],
    trim: true
  },
  temperature: {
    current: {
      type: Number,
      required: [true, 'Current temperature is required']
    },
    min: {
      type: Number,
      required: [true, 'Minimum temperature is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum temperature is required']
    }
  },
  humidity: {
    type: Number,
    required: [true, 'Humidity is required'],
    min: 0,
    max: 100
  },
  pressure: {
    type: Number,
    required: [true, 'Pressure is required']
  },
  windSpeed: {
    type: Number,
    required: [true, 'Wind speed is required']
  },
  windDirection: {
    type: Number,
    required: [true, 'Wind direction is required']
  },
  description: {
    type: String,
    required: [true, 'Weather description is required'],
    trim: true
  },
  icon: {
    type: String,
    required: [true, 'Weather icon is required']
  },
  visibility: {
    type: Number,
    required: [true, 'Visibility is required']
  },
  clouds: {
    type: Number,
    required: [true, 'Cloud coverage is required'],
    min: 0,
    max: 100
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now
  },
  apiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'API response data is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
weatherSchema.index({ location: 1, timestamp: -1 });
weatherSchema.index({ timestamp: -1 });
weatherSchema.index({ location: 1 });

// Virtual for formatted date
weatherSchema.virtual('formattedDate').get(function() {
  return this.timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for temperature in Celsius
weatherSchema.virtual('temperatureCelsius').get(function() {
  return {
    current: Math.round(this.temperature.current - 273.15),
    min: Math.round(this.temperature.min - 273.15),
    max: Math.round(this.temperature.max - 273.15)
  };
});

// Static method to get weather by location and date range
weatherSchema.statics.getWeatherByLocationAndDateRange = function(location, startDate, endDate) {
  return this.find({
    location: location,
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ timestamp: -1 });
};

// Static method to get latest weather for a location
weatherSchema.statics.getLatestWeather = function(location) {
  return this.findOne({ location: location }).sort({ timestamp: -1 });
};

// Static method to get all locations
weatherSchema.statics.getLocations = function() {
  return this.distinct('location');
};

// Pre-save middleware to validate data
weatherSchema.pre('save', function(next) {
  // Validate temperature ranges
  if (this.temperature.current < 150 || this.temperature.current > 350) {
    return next(new Error('Invalid temperature value'));
  }
  
  if (this.humidity < 0 || this.humidity > 100) {
    return next(new Error('Invalid humidity value'));
  }
  
  if (this.clouds < 0 || this.clouds > 100) {
    return next(new Error('Invalid cloud coverage value'));
  }
  
  next();
});

module.exports = mongoose.model('Weather', weatherSchema); 