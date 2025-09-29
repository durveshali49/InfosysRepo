/**
 * Database Connection Test
 * This script tests the database connection and authentication
 */

import mysql from "mysql2/promise";

// Use the same configuration as your app
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "AZaz09$$",
  database: process.env.DB_NAME || "infosys",
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  queueLimit: 0,
};

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  console.log("Configuration:", {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    database: DB_CONFIG.database,
    // Don't log password for security
    password: DB_CONFIG.password ? "***" : "Not set"
  });

  try {
    // Create connection pool
    const pool = mysql.createPool(DB_CONFIG);
    
    // Test basic connection
    console.log("\n1️⃣ Testing basic connection...");
    const connection = await pool.getConnection();
    console.log("✅ Basic connection successful!");
    
    // Test authentication and database access
    console.log("\n2️⃣ Testing database access...");
    const [rows] = await connection.execute("SELECT 1 as test, NOW() as current_time, USER() as current_user");
    console.log("✅ Database query successful!");
    console.log("Query result:", rows[0]);
    
    // Test if database exists and we can access it
    console.log("\n3️⃣ Testing database existence...");
    const [databases] = await connection.execute("SHOW DATABASES");
    const dbExists = databases.some(db => db.Database === DB_CONFIG.database);
    console.log(`Database '${DB_CONFIG.database}' exists:`, dbExists);
    
    if (dbExists) {
      // Test table access
      console.log("\n4️⃣ Testing table access...");
      try {
        const [tables] = await connection.execute(`SHOW TABLES FROM ${DB_CONFIG.database}`);
        console.log("✅ Tables in database:", tables.map(t => Object.values(t)[0]));
      } catch (error) {
        console.log("⚠️ Could not access tables:", error.message);
      }
    }
    
    // Release connection
    connection.release();
    await pool.end();
    
    console.log("\n🎉 All database tests passed!");
    
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error details:");
    console.error("- Code:", error.code);
    console.error("- Message:", error.message);
    console.error("- SQL State:", error.sqlState);
    
    // Provide specific help based on error type
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n🔧 Authentication Issue Detected!");
      console.log("Solutions:");
      console.log("1. Check username and password");
      console.log("2. Verify user has access to the database");
      console.log("3. Try connecting with MySQL client: mysql -u root -p");
    } else if (error.code === 'ECONNREFUSED') {
      console.log("\n🔧 Connection Refused!");
      console.log("Solutions:");
      console.log("1. Make sure MySQL server is running");
      console.log("2. Check if the host and port are correct");
      console.log("3. Verify firewall settings");
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log("\n🔧 Database Not Found!");
      console.log("Solutions:");
      console.log("1. Create the database: CREATE DATABASE infosys;");
      console.log("2. Check database name spelling");
    }
  }
}

// Run the test
testDatabaseConnection();