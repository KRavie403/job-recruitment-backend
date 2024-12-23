const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate"); // 미들웨어 임포트
const bcrypt = require("bcryptjs"); // bcrypt 해싱 라이브러리

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 정보 관련 API
 */
/**
 * @swagger
 * /users:
 *   get:
 *     summary: 사용자 전체 목록 조회
 *     tags: [Users]
 *     description: 인증 없이 모든 사용자의 이메일 및 생성일을 조회합니다.
 *     responses:
 *       200:
 *         description: 사용자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   email:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/", (req, res) => {
  const query = "SELECT id, email, created_at FROM users";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json(result);
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 특정 사용자 정보 조회
 *     tags: [Users]
 *     description: 인증된 사용자가 자신의 정보나 특정 사용자의 이메일 및 생성일을 조회합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 사용자 고유 ID
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", authenticateToken, (req, res) => {
  const query = "SELECT id, email, created_at FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
    }
    res.status(200).json(result[0]);
  });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 사용자 정보 업데이트
 *     tags: [Users]
 *     description: 사용자가 자신의 정보를 업데이트합니다. 비밀번호는 해싱 후 저장됩니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 사용자 고유 ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/:id", authenticateToken, (req, res) => {
  const { email, password } = req.body;

  // 비밀번호 해싱
  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = "UPDATE users SET email = ?, password = ? WHERE id = ?";
  db.query(query, [email, hashedPassword, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json({ message: "사용자 정보가 성공적으로 업데이트되었습니다" });
  });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [Users]
 *     description: 사용자가 자신의 계정을 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 사용자 고유 ID
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", authenticateToken, (req, res) => {
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json({ message: "사용자가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
