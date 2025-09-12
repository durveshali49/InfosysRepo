import mysql from "mysql2/promise";
 
const pool = mysql.createPool({
  host: "localhost",     // ✅ Using localhost to match MySQL Workbench
  port: 3306,            // ✅ Port 3306
  user: "root",          // ✅ Username is "root" 
  password: "AZaz09$$",  // ✅ Your MySQL password
  database: "infosys",   // ✅ Database name (now created)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
 
export default pool;