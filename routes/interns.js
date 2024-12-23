const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Interns
 *   description: 인턴 공고 관련 API
 */
/**
 * @swagger
 * /interns:
 *   get:
 *     summary: 인턴 채용 공고 전체 조회
 *     tags: [Interns]
 *     description: 필터링, 검색, 페이지네이션, 정렬 지원
 *     parameters:
 *       - in: query
 *         name: company_name
 *         schema:
 *           type: string
 *         description: 회사 이름
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 공고 제목
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 위치
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: 경력
 *       - in: query
 *         name: education
 *         schema:
 *           type: string
 *         description: 학력
 *       - in: query
 *         name: employment_type
 *         schema:
 *           type: string
 *         description: 고용 유형
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
 *         description: 페이지당 결과 개수
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: created_at
 *         description: 정렬 기준 필드
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: DESC
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 인턴 공고 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
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

  let baseQuery = "SELECT * FROM interns WHERE 1=1";
  const params = [];

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

  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });

    const countQuery = "SELECT COUNT(*) AS totalCount FROM interns WHERE 1=1";
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
 * /interns/{id}:
 *   get:
 *     summary: 특정 인턴 채용 공고 조회
 *     tags: [Interns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 공고 ID
 *     responses:
 *       200:
 *         description: 공고 상세 정보
 *       404:
 *         description: 공고를 찾을 수 없음
 */
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM interns WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "공고를 찾을 수 없습니다" });
    res.status(200).json(result[0]);
  });
});

/**
 * @swagger
 * /interns:
 *   post:
 *     summary: 인턴 채용 공고 생성
 *     tags: [Interns]
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
 *               salary:
 *                 type: string
 *               job_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: 인턴 공고 생성 성공
 */
router.post("/", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } =
    req.body;
  const query = `
    INSERT INTO interns (title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "인턴 채용 공고가 성공적으로 생성되었습니다" });
  });
});

/**
 * @swagger
 * /interns/{id}:
 *   put:
 *     summary: 인턴 채용 공고 수정
 *     tags: [Interns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 공고 ID
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
 *               salary:
 *                 type: string
 *               job_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인턴 공고 수정 성공
 */
router.put("/:id", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } =
    req.body;
  const query = `
    UPDATE interns SET title = ?, link = ?, company_name = ?, location = ?, experience = ?, education = ?, employment_type = ?, deadline = ?, salary = ?, job_id = ?
    WHERE id = ?
  `;
  db.query(query, [title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "인턴 채용 공고가 성공적으로 수정되었습니다" });
  });
});

/**
 * @swagger
 * /interns/{id}:
 *   delete:
 *     summary: 인턴 채용 공고 삭제
 *     tags: [Interns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 공고 ID
 *     responses:
 *       200:
 *         description: 인턴 공고 삭제 성공
 */
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM interns WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "인턴 채용 공고가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;
