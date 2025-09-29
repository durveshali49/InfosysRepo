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
  password: process.env.DB_PASSWORD || "AZaz09$$", // Your original password
  database: process.env.DB_NAME || "infosys",
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0,
  // Removed invalid options: acquireTimeout and timeout
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
    
    // Test a simple query to verify database access
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log("[INFO] Database query test successful");
    
    connection.release();
    return true;
  } catch (error) {
    console.log("[ERROR] Database connection failed:", error.message);
    console.log("[ERROR] Error code:", error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("[HELP] Authentication failed. Please check:");
      console.log("[HELP] 1. Username and password in database.js");
      console.log("[HELP] 2. MySQL user permissions");
      console.log("[HELP] 3. Current config - User: '" + DB_CONFIG.user + "', Host: '" + DB_CONFIG.host + "'");
    } else if (error.code === 'ECONNREFUSED') {
      console.log("[HELP] Connection refused. Please check:");
      console.log("[HELP] 1. MySQL server is running");
      console.log("[HELP] 2. Host and port are correct");
    }
    
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