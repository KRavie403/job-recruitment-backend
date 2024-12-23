const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 경력 요구 사항 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM experience_requirements";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(result);
  });
});

// 경력 요구 사항 추가
router.post("/", (req, res) => {
  const { job_id, experience_level } = req.body;
  const query = `
    INSERT INTO experience_requirements (job_id, experience_level)
    VALUES (?, ?)
  `;
  db.query(query, [job_id, experience_level], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "경력 요구 사항이 성공적으로 추가되었습니다" });
  });
});

// 경력 요구 사항 수정
router.put("/:id", (req, res) => {
  const { experience_level } = req.body;
  const query = `
    UPDATE experience_requirements
    SET experience_level = ?
    WHERE id = ?
  `;
  db.query(query, [experience_level, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "경력 요구 사항이 성공적으로 수정되었습니다" });
  });
});

// 경력 요구 사항 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM experience_requirements WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "경력 요구 사항이 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
