/**
 * Authentication Controller
 * Handles HTTP requests and delegates to AuthService
 */

import authService from '../services/authService.js';

/**
 * User registration
 * POST /signup
 */
export const signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const userExists = await authService.userExistsByEmail(email);
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists!" 
      });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const newUser = await authService.createUser({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      userId: newUser.userId
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email or username
    const user = await authService.findUserByIdentifier(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Verify password
    const passwordMatch = await authService.verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Login successful - sanitize user data
    const sanitizedUser = authService.sanitizeUser(user);
    
    res.json({
      success: true,
      message: "Login successful!",
      user: sanitizedUser
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