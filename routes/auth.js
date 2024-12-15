// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const router = express.Router();

// 회원가입 API
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  
  const hashedPassword = await bcrypt.hash(password, 10);  // 비밀번호 해싱

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "User created successfully" });
  });
});

// 로그인 API (JWT 발급)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // JWT 토큰 생성
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });
});

module.exports = router;
