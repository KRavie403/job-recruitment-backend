const express = require("express");
const crawlerRoutes = require("./routes/crawler");

const app = express();
const PORT = process.env.PORT || 3000;

// Routes
app.use("/api/crawl", crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
