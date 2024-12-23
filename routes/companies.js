const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 회사 목록 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM companies";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(result);
  });
});

// 특정 회사 조회
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM companies WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "회사를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

// 회사 생성
router.post("/", (req, res) => {
  const { company_name, establishment, representative, industry, financial, location } = req.body;
  const query = `
    INSERT INTO companies (company_name, establishment, representative, industry, financial, location)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [company_name, establishment, representative, industry, financial, location], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "회사가 성공적으로 생성되었습니다" });
  });
});

// 회사 수정
router.put("/:id", (req, res) => {
  const { company_name, establishment, representative, industry, financial, location } = req.body;
  const query = `
    UPDATE companies SET company_name = ?, establishment = ?, representative = ?, industry = ?, financial = ?, location = ?
    WHERE id = ?
  `;
  db.query(query, [company_name, establishment, representative, industry, financial, location, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "회사가 성공적으로 수정되었습니다" });
  });
});

// 회사 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM companies WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "회사가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
