// routes/jobs.js
const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 채용 공고 조회 API
router.get("/jobs", (req, res) => {
  const query = "SELECT * FROM jobs";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.status(200).json(result);
  });
});

module.exports = router;
