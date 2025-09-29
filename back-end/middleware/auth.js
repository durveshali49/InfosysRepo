/**
 * Authentication Middleware
 * JWT-less authentication using user ID headers
 */

import pool from '../config/database.js';

/**
 * Verify user authentication via header
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    // Verify user exists in database
    const [users] = await pool.execute(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid user" 
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

/**
 * Verify provider role
 */
export const verifyProvider = (req, res, next) => {
  if (req.user.role !== 'Service Provider') {
    return res.status(403).json({ 
      success: false, 
      message: "Only service providers can manage listings" 
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no user
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (userId) {
      const [users] = await pool.execute(
        "SELECT id, username, email, role FROM users WHERE id = ?",
        [userId]
      );
      
      if (users.length > 0) {
        req.user = users[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if there's an error
    next();
  }
};

export default {
  verifyAuth,
  verifyProvider,
  optionalAuth,
};