/**
 * Common Utility Functions
 * Reusable helper functions used throughout the application
 */

import { STORAGE_KEYS } from '../config/constants.js';

/**
 * Format price with Indian Rupee symbol
 */
export const formatPrice = (price) => {
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return 'Price on request';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numPrice);
};

/**
 * Format date to localized string
 */
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

/**
 * Format time display (24h to 12h format)
 */
export const formatTime = (timeString) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
};

/**
 * Format availability display
 */
export const formatAvailability = (availability) => {
  if (!availability) return 'Contact for availability';
  
  try {
    const parsed = typeof availability === 'string' ? JSON.parse(availability) : availability;
    const { days, hours } = parsed;
    
    if (!days || days.length === 0) return 'Contact for availability';
    
    const daysText = days.length === 7 
      ? 'Daily' 
      : days.length > 3 
        ? `${days.length} days/week`
        : days.slice(0, 2).join(', ') + (days.length > 2 ? '...' : '');
    
    if (hours && hours.start && hours.end) {
      return `${daysText} • ${formatTime(hours.start)} - ${formatTime(hours.end)}`;
    }
    
    return daysText;
  } catch (error) {
    return 'Contact for availability';
  }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 */
export const setCurrentUser = (userData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Clear user data from localStorage
 */
export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Generate random placeholder rating for demo purposes
 */
export const generatePlaceholderRating = () => {
  return {
    average: (Math.random() * 1.5 + 3.5).toFixed(1), // Random between 3.5-5.0
    count: Math.floor(Math.random() * 200) + 10, // Random between 10-210
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian mobile number
 */
export const isValidIndianMobile = (mobile) => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

/**
 * Validate Indian postal code
 */
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Generate slug from string
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Capitalize first letter of each word
 */
export const titleCase = (text) => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Get image fallback for broken images
 */
export const getImageFallback = (serviceName, category) => {
  const firstLetter = serviceName ? serviceName.charAt(0).toUpperCase() : '?';
  
  // Return a data URL with the first letter as placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" 
            fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        ${firstLetter}
      </text>
    </svg>
  `)}`;
};

export default {
  formatPrice,
  formatDate,
  formatTime,
  formatAvailability,
  truncateText,
  debounce,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  generatePlaceholderRating,
  isValidEmail,
  isValidIndianMobile,
  isValidPincode,
  generateSlug,
  titleCase,
  getImageFallback,
};