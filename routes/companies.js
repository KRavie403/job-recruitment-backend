const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: 회사 관련 API
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: 회사 목록 조회
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: company_name
 *         schema:
 *           type: string
 *         description: 회사 이름 검색
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: 산업 필터
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 위치 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: establishment
 *         description: 정렬 기준 필드
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: DESC
 *         description: 정렬 순서 (ASC 또는 DESC)
 *     responses:
 *       200:
 *         description: 회사 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       company_name:
 *                         type: string
 *                       establishment:
 *                         type: string
 *                       representative:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       financial:
 *                         type: string
 *                       location:
 *                         type: string
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */

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
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: 특정 회사 조회
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회사 ID
 *     responses:
 *       200:
 *         description: 회사 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 company_name:
 *                   type: string
 *                 establishment:
 *                   type: string
 *                 representative:
 *                   type: string
 *                 industry:
 *                   type: string
 *                 financial:
 *                   type: string
 *                 location:
 *                   type: string
 *       404:
 *         description: 회사를 찾을 수 없음
 */

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
 * @swagger
 * /companies:
 *   post:
 *     summary: 회사 생성
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - establishment
 *             properties:
 *               company_name:
 *                 type: string
 *               establishment:
 *                 type: string
 *               representative:
 *                 type: string
 *               industry:
 *                 type: string
 *               financial:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회사가 성공적으로 생성됨
 *       500:
 *         description: 데이터베이스 오류
 */

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
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: 회사 수정
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회사 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               establishment:
 *                 type: string
 *               representative:
 *                 type: string
 *               industry:
 *                 type: string
 *               financial:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: 회사가 성공적으로 수정됨
 *       500:
 *         description: 데이터베이스 오류
 */

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
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: 회사 삭제
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 회사 ID
 *     responses:
 *       200:
 *         description: 회사가 성공적으로 삭제됨
 *       500:
 *         description: 데이터베이스 오류
 */

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
 * @swagger
 * /companies/aggregate/industry:
 *   get:
 *     summary: 산업별 회사 수 조회
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: 산업별 회사 수 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   industry:
 *                     type: string
 *                   company_count:
 *                     type: integer
 */

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
 * @swagger
 * /companies/aggregate/location:
 *   get:
 *     summary: 지역별 회사 수 조회
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: 지역별 회사 수 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   location:
 *                     type: string
 *                   company_count:
 *                     type: integer
 */

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
