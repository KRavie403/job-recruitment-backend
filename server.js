require('dotenv').config();  // dotenv 모듈을 사용하여 .env 파일 로드

const express = require("express");
const crawlerRoutes = require("./routes/crawler");

const app = express();
const PORT = process.env.DB_PORT;

// Routes
app.use("/api/crawl", crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
