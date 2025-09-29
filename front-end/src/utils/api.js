/**
 * API Utility Functions
 * Centralized HTTP request handling with error management
 */

import API_CONFIG from '../config/api.js';
import { HTTP_STATUS, ERROR_MESSAGES, STORAGE_KEYS } from '../config/constants.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get authentication headers for API requests
 */
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  return user.id ? { 'x-user-id': user.id } : {};
};

/**
 * Generic fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError('Invalid response format', response.status);
    }

    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      const message = data.message || getErrorMessage(response.status);
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0);
    }
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please try again.', 0);
    }
    
    throw new ApiError(ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get appropriate error message for HTTP status code
 */
const getErrorMessage = (status) => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return 'An error occurred. Please try again.';
  }
};

/**
 * API Methods
 */

// Authentication API calls
export const authApi = {
  /**
   * User signup
   */
  signup: async (userData) => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.SIGNUP}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * User login
   */
  login: async (credentials) => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST', 
      body: JSON.stringify(credentials),
    });
  },
};

// Listings API calls
export const listingsApi = {
  /**
   * Create new listing
   */
  create: async (listingData) => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.BASE}`, {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  /**
   * Get provider's listings
   */
  getProviderListings: async (providerId) => {
    return fetchWithErrorHandling(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.PROVIDER}/${providerId}`
    );
  },

  /**
   * Update listing
   */
  update: async (listingId, listingData) => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.BASE}/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  },

  /**
   * Delete listing
   */
  delete: async (listingId) => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.BASE}/${listingId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search listings with filters and pagination
   */
  search: async (searchParams = {}) => {
    const queryString = new URLSearchParams(searchParams).toString();
    return fetchWithErrorHandling(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.SEARCH}?${queryString}`
    );
  },

  /**
   * Seed sample data (development only)
   */
  seedData: async () => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LISTINGS.SEED}`, {
      method: 'POST',
    });
  },
};

// Health check
export const healthApi = {
  check: async () => {
    return fetchWithErrorHandling(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
  },
};

export default {
  authApi,
  listingsApi,
  healthApi,
  ApiError,
};