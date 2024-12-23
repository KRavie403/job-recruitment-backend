const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Newjobs
 *   description: 신입 공고 관련 API
 */
/**
 * @swagger
 * /newjobs:
 *   get:
 *     summary: 신입 채용 공고 전체 조회
 *     tags: [Newjobs]
 *     description: 필터링, 검색, 페이지네이션, 정렬을 지원하는 신입 채용 공고를 조회합니다.
 *     parameters:
 *       - name: company_name
 *         in: query
 *         description: 회사명으로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: title
 *         in: query
 *         description: 채용 공고 제목으로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         description: 위치로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: experience
 *         in: query
 *         description: 경력으로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: education
 *         in: query
 *         description: 학력으로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: employment_type
 *         in: query
 *         description: 고용 형태로 검색합니다.
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: 페이지 번호 (기본값 1)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 한 페이지에 표시할 항목 수 (기본값 10)
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sortField
 *         in: query
 *         description: 정렬 기준 (기본값 "created_at")
 *         required: false
 *         schema:
 *           type: string
 *           default: "created_at"
 *       - name: sortOrder
 *         in: query
 *         description: 정렬 순서 ("ASC" 또는 "DESC", 기본값 "DESC")
 *         required: false
 *         schema:
 *           type: string
 *           default: "DESC"
 *     responses:
 *       200:
 *         description: 신입 채용 공고 목록 조회 성공
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
 *                       company_name:
 *                         type: string
 *                       location:
 *                         type: string
 *                       experience:
 *                         type: string
 *                       education:
 *                         type: string
 *                       employment_type:
 *                         type: string
 *                       deadline:
 *                         type: string
 *                         format: date
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get("/", (req, res) => {
  const {
    company_name,
    title,
    location,
    experience,
    education,
    employment_type,
    page = 1,
    limit = 10,
    sortField = "created_at",
    sortOrder = "DESC",
  } = req.query;

  const offset = (page - 1) * limit;

  let baseQuery = "SELECT * FROM newjobs WHERE 1=1";
  const params = [];

  // 필터링 조건 추가
  if (company_name) {
    baseQuery += " AND company_name LIKE ?";
    params.push(`%${company_name}%`);
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

  if (education) {
    baseQuery += " AND education LIKE ?";
    params.push(`%${education}%`);
  }

  if (employment_type) {
    baseQuery += " AND employment_type LIKE ?";
    params.push(`%${employment_type}%`);
  }

  // 정렬 조건 추가
  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

  // 페이지네이션 추가
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });

    // 전체 데이터 개수 조회
    const countQuery = "SELECT COUNT(*) AS totalCount FROM newjobs WHERE 1=1";
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
 * /newjobs/{id}:
 *   get:
 *     summary: 특정 신입 채용 공고 조회
 *     tags: [Newjobs]
 *     description: ID로 특정 신입 채용 공고를 조회합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 채용 공고의 고유 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 신입 채용 공고 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 company_name:
 *                   type: string
 *                 location:
 *                   type: string
 *                 experience:
 *                   type: string
 *                 education:
 *                   type: string
 *                 employment_type:
 *                   type: string
 *                 deadline:
 *                   type: string
 *                   format: date
 *       404:
 *         description: 해당 ID의 채용 공고를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.get("/:id", (req, res) => {
  const query = "SELECT * FROM newjobs WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "공고를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

/**
 * @swagger
 * /newjobs:
 *   post:
 *     summary: 신입 채용 공고 생성
 *     tags: [Newjobs]
 *     description: 새로운 신입 채용 공고를 생성합니다.
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
 *               company_name:
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
 *               salary:
 *                 type: string
 *               job_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: 신입 채용 공고 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post("/", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } = req.body;
  const query = `
    INSERT INTO newjobs (title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "신입 채용 공고가 성공적으로 생성되었습니다" });
  });
});

/**
 * @swagger
 * /newjobs/{id}:
 *   put:
 *     summary: 신입 채용 공고 수정
 *     tags: [Newjobs]
 *     description: 특정 신입 채용 공고의 정보를 수정합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 수정할 채용 공고의 고유 ID
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
 *               company_name:
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
 *               salary:
 *                 type: string
 *               job_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: 신입 채용 공고 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.put("/:id", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } = req.body;
  const query = `
    UPDATE newjobs SET title = ?, link = ?, company_name = ?, location = ?, experience = ?, education = ?, employment_type = ?, deadline = ?, salary = ?, job_id = ?
    WHERE id = ?
  `;
  db.query(query, [title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "신입 채용 공고가 성공적으로 수정되었습니다" });
  });
});

/**
 * @swagger
 * /newjobs/{id}:
 *   delete:
 *     summary: 신입 채용 공고 삭제
 *     tags: [Newjobs]
 *     description: 특정 신입 채용 공고를 삭제합니다.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 삭제할 채용 공고의 고유 ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 신입 채용 공고 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.delete("/:id", (req, res) => {
  const query = "DELETE FROM newjobs WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "신입 채용 공고가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
