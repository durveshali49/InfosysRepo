/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// User roles
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  SERVICE_PROVIDER: 'Service Provider',
  ADMIN: 'Admin',
};

// Service categories
export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical', 
  'Cleaning',
  'Carpentry',
  'Painting',
  'Gardening',
  'Moving',
  'Tutoring',
  'Pet Care',
  'Beauty',
  'Other'
];

// Indian cities for location selection
export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Visakhapatnam',
  'Indore',
  'Thane',
  'Bhopal',
  'Patna',
  'Vadodara',
  'Ghaziabad'
];

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
  SEARCH_DEBOUNCE_MS: 300,
};

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  SERVICE_NAME_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme_preference',
  SEARCH_HISTORY: 'search_history',
};

// Sort options for search
export const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  PRICE_ASC: 'price_asc', 
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

export default {
  USER_ROLES,
  SERVICE_CATEGORIES,
  INDIAN_CITIES,
  PAGINATION,
  VALIDATION,
  STORAGE_KEYS,
  SORT_OPTIONS,
  HTTP_STATUS,
  ERROR_MESSAGES,
};