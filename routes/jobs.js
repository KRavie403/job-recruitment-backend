const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: 채용 공고 관련 API
 */
/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: 채용 공고 전체 조회
 *     tags: [Jobs]
 *     description: 필터링, 검색, 페이지네이션, 정렬을 지원하여 채용 공고 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: company
 *         description: 회사 이름으로 필터링합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: title
 *         description: 직무 제목으로 필터링합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         description: 위치로 필터링합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: experience
 *         description: 경험으로 필터링합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: sector
 *         description: 산업군으로 필터링합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         description: "페이지 번호 (기본값: 1)"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: "한 페이지에 보여줄 항목 수 (기본값: 20)"
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortField
 *         description: "정렬 필드 (기본값: created_at)"
 *         required: false
 *         schema:
 *           type: string
 *           default: created_at
 *       - in: query
 *         name: sortOrder
 *         description: "정렬 순서 (기본값: DESC)"
 *         required: false
 *         schema:
 *           type: string
 *           default: DESC
 *     responses:
 *       200:
 *         description: 채용 공고 목록이 성공적으로 반환되었습니다.
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
 *                       title:
 *                         type: string
 *                       company:
 *                         type: string
 *                       location:
 *                         type: string
 *                       experience:
 *                         type: string
 *                       sector:
 *                         type: string
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/", (req, res) => {
  const {
    company,
    title,
    location,
    experience,
    sector,
    page = 1,
    limit = 20,
    sortField = "created_at",
    sortOrder = "DESC",
  } = req.query;

  const offset = (page - 1) * limit;

  let baseQuery = "SELECT * FROM jobs WHERE 1=1";
  const params = [];

  if (company) {
    baseQuery += " AND company LIKE ?";
    params.push(`%${company}%`);
  }

  if (title) {
    baseQuery += " AND title LIKE ?";
    params.push(`%${title}%`);
  }

  if (location) {
    baseQuery += " AND location LIKE ?";
    params.push(`%${location}%`);
  }

  if (experience) {
    baseQuery += " AND experience LIKE ?";
    params.push(`%${experience}%`);
  }

  if (sector) {
    baseQuery += " AND sector LIKE ?";
    params.push(`%${sector}%`);
  }

  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });

    const countQuery = "SELECT COUNT(*) AS totalCount FROM jobs WHERE 1=1";
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
 * /jobs/{id}:
 *   get:
 *     summary: 특정 채용 공고 조회
 *     tags: [Jobs]
 *     description: 주어진 ID로 특정 채용 공고를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: 채용 공고의 ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 채용 공고가 성공적으로 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 company:
 *                   type: string
 *                 location:
 *                   type: string
 *                 experience:
 *                   type: string
 *                 sector:
 *                   type: string
 *       404:
 *         description: 공고를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/:id", (req, res) => {
  const jobId = req.params.id;

  const incrementViewsQuery = "UPDATE jobs SET views = views + 1 WHERE id = ?";
  db.query(incrementViewsQuery, [jobId], (err) => {
    if (err) return res.status(500).json({ message: "조회수 업데이트에 실패하였습니다." });

    const jobQuery = "SELECT * FROM jobs WHERE id = ?";
    db.query(jobQuery, [jobId], (err, results) => {
      if (err) return res.status(500).json({ message: "데이터베이스 오류" });
      if (results.length === 0) return res.status(404).json({ message: "공고를 찾을 수 없습니다." });

      const relatedQuery = `
        SELECT * FROM jobs
        WHERE sector = ? AND id != ?
        LIMIT 5
      `;
      db.query(relatedQuery, [results[0].sector, jobId], (relatedErr, relatedJobs) => {
        if (relatedErr) return res.status(500).json({ message: "관련된 공고가 없습니다." });

        res.status(200).json({
          job: results[0],
          related: relatedJobs,
        });
      });
    });
  });
});
/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: 채용 공고 생성
 *     tags: [Jobs]
 *     description: 새 채용 공고를 생성합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               link:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               sector:
 *                 type: string
 *               salary:
 *                 type: string
 *     responses:
 *       201:
 *         description: 채용 공고가 성공적으로 생성되었습니다.
 *       500:
 *         description: 서버 내부 오류
 */
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

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: 채용 공고 수정
 *     tags: [Jobs]
 *     description: 특정 ID의 채용 공고를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: 채용 공고의 ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               link:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               experience:
 *                 type: string
 *               education:
 *                 type: string
 *               employment_type:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               sector:
 *                 type: string
 *               salary:
 *                 type: string
 *     responses:
 *       200:
 *         description: 채용 공고가 성공적으로 수정되었습니다.
 *       404:
 *         description: 공고를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류
 */
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

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: 채용 공고 삭제
 *     tags: [Jobs]
 *     description: 특정 ID의 채용 공고를 삭제합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: 채용 공고의 ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 채용 공고가 성공적으로 삭제되었습니다.
 *       404:
 *         description: 공고를 찾을 수 없습니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM jobs WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "채용 공고가 성공적으로 삭제되었습니다" });
  });
});

/**
 * @swagger
 * /jobs/aggregate/company:
 *   get:
 *     summary: 회사별 채용 공고 수 집계
 *     tags: [Jobs]
 *     description: 각 회사별로 채용 공고의 개수를 집계합니다.
 *     responses:
 *       200:
 *         description: 회사별 채용 공고 수 집계 결과가 반환되었습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company:
 *                     type: string
 *                   job_count:
 *                     type: integer
 *       500:
 *         description: 서버 내부 오류
 */
router.get("/aggregate/company", (req, res) => {
  const query = `
    SELECT company, COUNT(*) AS job_count
    FROM jobs
    GROUP BY company
    ORDER BY job_count DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json(results);
  });
});

module.exports = router;
