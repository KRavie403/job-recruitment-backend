const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 가까운 역 목록 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM stations";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(result);
  });
});

// 특정 회사의 가까운 역 조회
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM stations WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "회사를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

// 가까운 역 추가
router.post("/", (req, res) => {
  const { company_name, job_title, job_link, location, deadline, nearest_station } = req.body;
  const query = `
    INSERT INTO stations (company_name, job_title, job_link, location, deadline, nearest_station)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [company_name, job_title, job_link, location, deadline, nearest_station], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "가까운 역 정보가 성공적으로 추가되었습니다" });
  });
});

// 가까운 역 정보 수정
router.put("/:id", (req, res) => {
  const { company_name, job_title, job_link, location, deadline, nearest_station } = req.body;
  const query = `
    UPDATE stations
    SET company_name = ?, job_title = ?, job_link = ?, location = ?, deadline = ?, nearest_station = ?
    WHERE id = ?
  `;
  db.query(query, [company_name, job_title, job_link, location, deadline, nearest_station, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "가까운 역 정보가 성공적으로 수정되었습니다" });
  });
});

// 가까운 역 정보 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM stations WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "가까운 역 정보가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
