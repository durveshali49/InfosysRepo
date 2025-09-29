/**
 * Validation Middleware
 * Input validation for API endpoints
 */

/**
 * Validate listing input data
 */
export const validateListingInput = (req, res, next) => {
  const { service_name, description, category, price, location_city, location_zip } = req.body;
  
  // Required fields validation
  if (!service_name || !category || !price || !location_city || !location_zip) {
    return res.status(400).json({
      success: false,
      message: "Service name, category, price, city, and ZIP code are required"
    });
  }

  // Price validation
  const priceNum = parseFloat(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid positive number"
    });
  }

  // Service name length validation
  if (service_name.length > 255) {
    return res.status(400).json({
      success: false,
      message: "Service name cannot exceed 255 characters"
    });
  }

  // Category validation (predefined categories)
  const validCategories = [
    'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 
    'Gardening', 'Moving', 'Tutoring', 'Pet Care', 'Beauty', 'Other'
  ];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category. Please select a valid category."
    });
  }

  next();
};

/**
 * Validate user registration data
 */
export const validateUserRegistration = (req, res, next) => {
  const { username, email, password, role } = req.body;

  // Required fields
  if (!username || !email || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required!" 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  // Username validation
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Username must be between 3 and 50 characters"
    });
  }

  // Role validation
  const validRoles = ['Customer', 'Service Provider'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Must be 'Customer' or 'Service Provider'"
    });
  }

  next();
};

/**
 * Validate login data
 */
export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Username/Email and password are required!" 
    });
  }

  next();
};

export default {
  validateListingInput,
  validateUserRegistration,
  validateLoginInput,
};