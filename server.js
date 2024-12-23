const express = require("express");
const db = require('./config/db');
const authRoutes = require("./routes/auth");
const jobsRoutes = require("./routes/jobs");
const companiesRoutes = require("./routes/companies");
const applicationsRoutes = require("./routes/applications");
const stationsRoutes = require("./routes/stations");
const bookmarksRoutes = require("./routes/bookmarks");
const educationRoutes = require("./routes/education_requirements");
const experienceRoutes = require("./routes/experience_requirements");
const userRoutes = require("./routes/users");


const app = express();
const PORT = 8080;

app.use(express.json());

// Routes
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/applications", applicationsRoutes);
app.use("/api/stations", stationsRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/education-requirements", educationRoutes);
app.use("/api/experience-requirements", experienceRoutes);
app.use("/api/users", userRoutes);
// app.get("/api/crawl", crawlerRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});