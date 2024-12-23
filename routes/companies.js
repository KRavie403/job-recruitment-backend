const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * 회사 목록 조회 (필터링, 검색, 페이지네이션, 정렬 지원)
 */
router.get("/", (req, res) => {
  const {
    company_name,
    industry,
    location,
    page = 1,
    limit = 10,
    sortField = "establishment",
    sortOrder = "DESC",
  } = req.query;

  const offset = (page - 1) * limit;

  let baseQuery = "SELECT * FROM companies WHERE 1=1";
  const params = [];

  // 필터링 조건 추가
  if (company_name) {
    baseQuery += " AND company_name LIKE ?";
    params.push(`%${company_name}%`);
  }

  if (industry) {
    baseQuery += " AND industry LIKE ?";
    params.push(`%${industry}%`);
  }

  if (location) {
    baseQuery += " AND location LIKE ?";
    params.push(`%${location}%`);
  }

  // 정렬 조건 추가
  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

  // 페이지네이션 추가
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });

    // 전체 데이터 개수 조회
    const countQuery = "SELECT COUNT(*) AS totalCount FROM companies WHERE 1=1";
    db.query(countQuery, params.slice(0, params.length - 2), (countErr, countResult) => {
      if (countErr) return res.status(500).json({ message: "데이터베이스 오류" });

      const totalCount = countResult[0].totalCount;

      res.status(200).json({
        data: results,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
      });
    });
  });
});

/**
 * 특정 회사 조회
 */
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM companies WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "회사를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

/**
 * 회사 생성
 */
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

/**
 * 회사 수정
 */
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

/**
 * 회사 삭제
 */
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM companies WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "회사가 성공적으로 삭제되었습니다" });
  });
});

/**
 * 데이터 집계 API (산업별 회사 수)
 */
router.get("/aggregate/industry", (req, res) => {
  const query = `
    SELECT industry, COUNT(*) AS company_count
    FROM companies
    GROUP BY industry
    ORDER BY company_count DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(results);
  });
});

/**
 * 데이터 집계 API (지역별 회사 수)
 */
router.get("/aggregate/location", (req, res) => {
  const query = `
    SELECT location, COUNT(*) AS company_count
    FROM companies
    GROUP BY location
    ORDER BY company_count DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(results);
  });
});

module.exports = router;
