const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Weather data types
  type Temperature {
    current: Float!
    min: Float!
    max: Float!
    currentCelsius: Float!
    minCelsius: Float!
    maxCelsius: Float!
  }

  type Weather {
    id: ID!
    location: String!
    temperature: Temperature!
    humidity: Float!
    pressure: Float!
    windSpeed: Float!
    windDirection: Float!
    description: String!
    icon: String!
    visibility: Float!
    clouds: Float!
    timestamp: String!
    formattedDate: String!
    createdAt: String!
    updatedAt: String!
  }

  type WeatherResponse {
    success: Boolean!
    data: Weather
    error: String
  }

  type HistoricalWeatherResponse {
    success: Boolean!
    data: [Weather!]!
    total: Int!
    error: String
  }

  type LocationsResponse {
    success: Boolean!
    data: [String!]!
    error: String
  }

  type BulkWeatherResponse {
    success: Boolean!
    data: [Weather!]!
    failed: [String!]!
    total: Int!
    error: String
  }

  # Input types
  input WeatherInput {
    location: String!
  }

  input HistoricalWeatherInput {
    location: String!
    startDate: String!
    endDate: String!
  }

  input PaginationInput {
    page: Int
    limit: Int
  }

  # Queries
  type Query {
    # Get current weather for a location
    getCurrentWeather(location: String!): WeatherResponse!
    
    # Get historical weather data
    getHistoricalWeather(
      location: String!
      startDate: String!
      endDate: String!
      pagination: PaginationInput
    ): HistoricalWeatherResponse!
    
    # Get all available locations
    getLocations: LocationsResponse!
    
    # Get latest weather for all locations
    getAllLocationsWeather: BulkWeatherResponse!
    
    # Health check
    health: String!
  }

  # Mutations
  type Mutation {
    # Fetch and store current weather for a location
    fetchCurrentWeather(location: String!): WeatherResponse!
    
    # Fetch weather for all locations
    fetchAllLocationsWeather: BulkWeatherResponse!
  }

  # Subscriptions (for real-time updates)
  type Subscription {
    weatherUpdated(location: String!): Weather!
  }
`;

module.exports = { typeDefs }; 