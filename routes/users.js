const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const router = express.Router();

// 사용자 전체 목록 조회
router.get("/", (req, res) => {
  const query = "SELECT id, email, created_at FROM users";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json(result);
  });
});

// 특정 사용자 정보 조회
router.get("/:id", (req, res) => {
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

// 사용자 생성 (회원가입)
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  // 이메일 중복 확인
  const checkQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkQuery, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다" });
    }

    // 비밀번호 해싱 및 사용자 추가
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = "INSERT INTO users (email, password) VALUES (?, ?)";
    db.query(insertQuery, [email, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ message: "데이터베이스 오류" });
      }
      res.status(201).json({ message: "사용자가 성공적으로 생성되었습니다" });
    });
  });
});

// 사용자 정보 업데이트
router.put("/:id", async (req, res) => {
  const { email, password } = req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = "UPDATE users SET email = ?, password = ? WHERE id = ?";
  db.query(query, [email, hashedPassword, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json({ message: "사용자 정보가 성공적으로 업데이트되었습니다" });
  });
});

// 사용자 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "데이터베이스 오류" });
    }
    res.status(200).json({ message: "사용자가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
