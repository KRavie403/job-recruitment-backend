const mysql = require("mysql");
require("dotenv").config({ path: './config/.env' });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = connection;
