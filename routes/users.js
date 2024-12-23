const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate"); // 미들웨어 임포트

const router = express.Router();

// 사용자 전체 목록 조회 (비보호 라우트: 인증 필요 없음)
router.get("/", (req, res) => {
  const query = "SELECT id, email, created_at FROM users";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json(result);
  });
});

// 특정 사용자 정보 조회 (보호된 라우트: 인증 필요)
router.get("/:id", authenticateToken, (req, res) => { // authenticateToken 미들웨어 추가
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

// 사용자 정보 업데이트 (보호된 라우트: 인증 필요)
router.put("/:id", authenticateToken, (req, res) => { // authenticateToken 미들웨어 추가
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

// 사용자 삭제 (보호된 라우트: 인증 필요)
router.delete("/:id", authenticateToken, (req, res) => { // authenticateToken 미들웨어 추가
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json({ message: "사용자가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
