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
    setTimeout(connectToDatabase, 5000); // 5초 후 재시도
  } else {
    console.log("Connected to MySQL database.");
  }
});

// 재연결 함수
function connectToDatabase() {
  connection.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      setTimeout(connectToDatabase, 5000); // 재시도
    } else {
      console.log("Connected to MySQL database.");
    }
  });
}

module.exports = connection;
