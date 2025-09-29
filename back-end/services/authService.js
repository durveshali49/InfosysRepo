/**
 * Authentication Service
 * Contains all authentication-related business logic
 */

import bcrypt from "bcrypt";
import pool from '../config/database.js';
import SERVER_CONFIG from '../config/server.js';

class AuthService {
  /**
   * Check if a user exists by email
   * @param {string} email - User's email
   * @returns {Promise<boolean>} - True if user exists
   */
  async userExistsByEmail(email) {
    const [existingUser] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    return existingUser.length > 0;
  }

  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, SERVER_CONFIG.BCRYPT_SALT_ROUNDS);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Hashed password
   * @param {string} userData.role - User role
   * @returns {Promise<Object>} - Created user result
   */
  async createUser({ username, email, password, role }) {
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role]
    );
    return {
      userId: result.insertId,
      username,
      email,
      role
    };
  }

  /**
   * Find user by email or username
   * @param {string} identifier - Email or username
   * @returns {Promise<Object|null>} - User object or null
   */
  async findUserByIdentifier(identifier) {
    const [users] = await pool.execute(
      "SELECT id, username, email, password, role FROM users WHERE email = ? OR username = ?",
      [identifier, identifier]
    );
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} - True if passwords match
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Sanitize user object (remove sensitive data)
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user object
   */
  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();