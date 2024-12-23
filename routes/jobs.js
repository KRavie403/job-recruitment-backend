const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 채용 공고 전체 조회
router.get("/", (req, res) => {
  const query = "SELECT * FROM jobs";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(result);
  });
});

// 특정 채용 공고 조회
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM jobs WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "공고를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

// 채용 공고 생성
router.post("/", (req, res) => {
  const { title, link, company, location, experience, education, employment_type, deadline, sector, salary } = req.body;
  const query = `
    INSERT INTO jobs (title, link, company, location, experience, education, employment_type, deadline, sector, salary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [title, link, company, location, experience, education, employment_type, deadline, sector, salary], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "채용 공고가 성공적으로 생성되었습니다" });
  });
});

// 채용 공고 수정
router.put("/:id", (req, res) => {
  const { title, link, company, location, experience, education, employment_type, deadline, sector, salary } = req.body;
  const query = `
    UPDATE jobs SET title = ?, link = ?, company = ?, location = ?, experience = ?, education = ?, employment_type = ?, deadline = ?, sector = ?, salary = ?
    WHERE id = ?
  `;
  db.query(query, [title, link, company, location, experience, education, employment_type, deadline, sector, salary, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "채용 공고가 성공적으로 수정되었습니다" });
  });
});

// 채용 공고 삭제
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM jobs WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "채용 공고가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
