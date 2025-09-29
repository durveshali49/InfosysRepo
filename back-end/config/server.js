/**
 * Server Configuration
 * Environment variables and server settings
 */

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS settings
  CORS: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001", // Allow frontend on port 3001 as well
      "http://localhost:3000"  // Allow frontend on port 3000
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  },
  
  // Security settings
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // Request body limits
  BODY_LIMITS: {
    json: '10mb',
    urlencoded: '10mb',
  },
};

export default SERVER_CONFIG;