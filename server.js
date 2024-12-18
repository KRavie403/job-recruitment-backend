const express = require("express");
const crawlerRoutes = require("./routes/crawler");

const app = express();
const PORT = 8080;

// Routes
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get("/api/crawl", crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});