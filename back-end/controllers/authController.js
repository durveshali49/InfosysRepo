/**
 * Authentication Controller
 * Handles user registration and login
 */

import bcrypt from "bcrypt";
import pool from '../config/database.js';
import SERVER_CONFIG from '../config/server.js';

/**
 * User registration
 * POST /signup
 */
export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists!" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SERVER_CONFIG.BCRYPT_SALT_ROUNDS);

    // Insert user into database
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

/**
 * User login
 * POST /login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in database by email OR username
    const [users] = await pool.execute(
      "SELECT id, username, email, password, role FROM users WHERE email = ? OR username = ?",
      [email, email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const user = users[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Login successful - don't send password back
    const { password: userPassword, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: "Login successful!",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export default {
  signup,
  login,
};