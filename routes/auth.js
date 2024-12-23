const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");
require("dotenv").config();
const router = express.Router();
const { body, validationResult } = require('express-validator');

// 이메일 형식 검증 미들웨어
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증 관련 API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 사용자 비밀번호
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
router.post(
  "/register",
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
  ],
  async (req, res) => {
    const { email, password } = req.body;

    // 요청 값 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 이메일 중복 확인
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: "이미 등록된 이메일입니다." });
      }

      try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 회원가입 정보 저장
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
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 로그인 (JWT 발급)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: 사용자 이메일
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 사용자 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = `SELECT * FROM users WHERE email = ?`;
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

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // 로그인 이력 저장 (예시)
      const loginHistoryQuery = `
        INSERT INTO login_history (user_id, login_time) VALUES (?, NOW())
      `;
      db.query(loginHistoryQuery, [user.id], (err) => {
        if (err) {
          console.error("로그인 이력 저장 중 오류 발생:", err);
        }
      });

      res.status(200).json({ message: "로그인이 성공적으로 완료되었습니다.", token });
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh 토큰
 *     responses:
 *       200:
 *         description: 새로운 Access 토큰 발급
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 새로운 Access 토큰
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh 토큰이 필요합니다." });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token: newAccessToken });
  });
});

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: 회원 정보 수정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 새로운 비밀번호
 *     responses:
 *       200:
 *         description: 회원 정보 수정 성공
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.put("/profile", async (req, res) => {
  const { password } = req.body;

  // 인증 미들웨어 추가 필요
  if (!req.user) {
    return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "UPDATE users SET password = ? WHERE id = ?";
    db.query(query, [hashedPassword, req.user.userId], (err) => {
      if (err) {
        console.error("회원 정보 수정 중 오류 발생:", err);
        return res.status(500).json({ message: "회원 정보 수정에 실패했습니다." });
      }
      res.status(200).json({ message: "회원 정보가 성공적으로 수정되었습니다." });
    });
  } catch (error) {
    console.error("비밀번호 변경 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
