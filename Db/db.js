
require("dotenv").config();
const mysql = require("mysql2/promise");

let conn;

async function initDb() {

  // 3. Create the connection pool after the database exists
conn = mysql.createPool({
  host: process.env.DB_HOST ,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

console.log('database connected');

  return conn;
}

module.exports = {
  initDb,
  getPool() {
    if (!conn) {
      throw new Error('Database not connected');
    }
    return conn;
  },
};
