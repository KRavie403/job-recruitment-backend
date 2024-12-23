// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config(); // Load environment variables

const router = express.Router();

/**
 * 회원가입 API
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱

    const query = `
      INSERT INTO users (email, password)
      VALUES (?, ?)
    `;

    db.query(query, [email, hashedPassword], (err) => {
      if (err) {
        console.error("회원가입 중 오류 발생:", err);
        return res.status(500).json({ message: "회원가입에 실패했습니다." });
      }
      res.status(201).json({ message: "회원가입이 성공적으로 완료되었습니다." });
    });
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * 로그인 API (JWT 발급)
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `
      SELECT * FROM users
      WHERE email = ?
    `;

    db.query(query, [email], async (err, results) => {
      if (err || results.length === 0) {
        console.error("로그인 중 오류 발생 또는 사용자 없음:", err);
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      const user = results[0];
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      // JWT 발급
      const token = jwt.sign(
        { userId: user.id }, // JWT payload
        process.env.JWT_SECRET, // 비밀 키
        { expiresIn: "1h" } // 토큰 만료 시간
      );

      res.status(200).json({ message: "로그인이 성공적으로 완료되었습니다.", token });
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
