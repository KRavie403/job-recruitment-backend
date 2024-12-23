const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 학력 요구 사항 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM education_requirements";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(result);
  });
});

// 학력 요구 사항 추가
router.post("/", (req, res) => {
  const { job_id, education_level } = req.body;
  const query = `
    INSERT INTO education_requirements (job_id, education_level)
    VALUES (?, ?)
  `;
  db.query(query, [job_id, education_level], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "학력 요구 사항이 성공적으로 추가되었습니다" });
  });
});

// 학력 요구 사항 수정
router.put("/:id", (req, res) => {
  const { education_level } = req.body;
  const query = `
    UPDATE education_requirements
    SET education_level = ?
    WHERE id = ?
  `;
  db.query(query, [education_level, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "학력 요구 사항이 성공적으로 수정되었습니다" });
  });
});

// 학력 요구 사항 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM education_requirements WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "학력 요구 사항이 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
