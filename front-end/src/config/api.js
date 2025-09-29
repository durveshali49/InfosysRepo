/**
 * API Configuration
 * Centralized API endpoints and configurations
 */

const API_CONFIG = {
  // Base URL for API endpoints
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Socket.IO configuration
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
  
  // API timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      SIGNUP: '/signup',
      LOGIN: '/login',
    },
    
    // Listings
    LISTINGS: {
      BASE: '/api/listings',
      SEARCH: '/api/listings/search',
      PROVIDER: '/api/listings/provider',
      SEED: '/api/seed-services',
    },
    
    // Health check
    HEALTH: '/health',
  },
};

export default API_CONFIG;