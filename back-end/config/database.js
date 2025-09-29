/**
 * Database Configuration
 * Centralized database connection and configuration
 */

import mysql from "mysql2/promise";

// Environment-based configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "AZaz09$$",
  database: process.env.DB_NAME || "infosys",
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0,
  // Additional pool options for production
  acquireTimeout: 60000,
  timeout: 60000,
};

/**
 * Create MySQL connection pool
 */
const pool = mysql.createPool(DB_CONFIG);

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("[SUCCESS] Database connected successfully!");
    connection.release();
    return true;
  } catch (error) {
    console.log("[WARNING] Database connection failed:", error.message);
    console.log("[INFO] Server will run without database connection");
    return false;
  }
};

/**
 * Execute query with error handling
 */
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

/**
 * Get connection from pool
 */
export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;