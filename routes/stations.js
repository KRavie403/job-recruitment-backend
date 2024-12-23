const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stations
 *   description: 역세권 공고 관련 API
 */
/**
 * @swagger
 * /stations:
 *   get:
 *     summary: 가까운 역 목록 조회 (필터링, 검색, 페이지네이션, 정렬 포함)
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: company_name
 *         schema:
 *           type: string
 *         description: 회사명 필터링
 *       - in: query
 *         name: job_title
 *         schema:
 *           type: string
 *         description: 채용 공고 제목 필터링
 *       - in: query
 *         name: nearest_station
 *         schema:
 *           type: string
 *         description: 역명 필터링
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "페이지 번호 (기본값: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "페이지 당 항목 수 (기본값: 10)"
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: "정렬할 필드 (기본값: id)"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: "정렬 순서 (기본값: ASC)"
 *     responses:
 *       200:
 *         description: 가까운 역 목록 조회 성공
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
 *                       job_title:
 *                         type: string
 *                       nearest_station:
 *                         type: string
 *                       location:
 *                         type: string
 *                       deadline:
 *                         type: string
 *                         format: date-time
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 totalCount:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: 서버 오류
 */

/**
 * 가까운 역 목록 조회 (필터링, 검색, 페이지네이션, 정렬 포함)
 */
router.get("/", (req, res) => {
  const {
    company_name,
    job_title,
    nearest_station,
    page = 1,
    limit = 10,
    sortField = "id",
    sortOrder = "ASC",
  } = req.query;

  const offset = (page - 1) * limit;

  let baseQuery = "SELECT * FROM stations WHERE 1=1";
  const params = [];

  // 필터링 조건 추가
  if (company_name) {
    baseQuery += " AND company_name LIKE ?";
    params.push(`%${company_name}%`);
  }

  if (job_title) {
    baseQuery += " AND job_title LIKE ?";
    params.push(`%${job_title}%`);
  }

  if (nearest_station) {
    baseQuery += " AND nearest_station LIKE ?";
    params.push(`%${nearest_station}%`);
  }

  // 정렬 조건 추가
  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

  // 페이지네이션 추가
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) {
      console.error("가까운 역 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "가까운 역 조회에 실패했습니다." });
    }

    // 전체 데이터 개수 조회
    const countQuery = "SELECT COUNT(*) AS totalCount FROM stations WHERE 1=1";
    const countParams = [...params.slice(0, params.length - 2)]; // 페이지네이션 제외한 필터링 파라미터

    db.query(countQuery, countParams, (countErr, countResult) => {
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
 * /stations/{id}:
 *   get:
 *     summary: 특정 회사의 가까운 역 조회
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 가까운 역 ID
 *     responses:
 *       200:
 *         description: 특정 회사의 가까운 역 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 company_name:
 *                   type: string
 *                 job_title:
 *                   type: string
 *                 nearest_station:
 *                   type: string
 *                 location:
 *                   type: string
 *                 deadline:
 *                   type: string
 *                   format: date-time
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 정보를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * 특정 회사의 가까운 역 조회
 */
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM stations WHERE id = ?";
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    if (result.length === 0) return res.status(404).json({ message: "정보를 찾을 수 없습니다." });
    res.status(200).json(result[0]);
  });
});

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: 가까운 역 추가
 *     tags: [Stations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               job_title:
 *                 type: string
 *               job_link:
 *                 type: string
 *               location:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               nearest_station:
 *                 type: string
 *     responses:
 *       201:
 *         description: 가까운 역 정보가 성공적으로 추가됨
 *       500:
 *         description: 서버 오류
 */

/**
 * 가까운 역 추가
 */
router.post("/", (req, res) => {
  const { company_name, job_title, job_link, location, deadline, nearest_station } = req.body;
  const query = `
    INSERT INTO stations (company_name, job_title, job_link, location, deadline, nearest_station)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [company_name, job_title, job_link, location, deadline, nearest_station], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(201).json({ message: "가까운 역 정보가 성공적으로 추가되었습니다." });
  });
});

/**
 * @swagger
 * /stations/{id}:
 *   put:
 *     summary: 가까운 역 정보 수정
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 역 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               job_title:
 *                 type: string
 *               job_link:
 *                 type: string
 *               location:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               nearest_station:
 *                 type: string
 *     responses:
 *       200:
 *         description: 가까운 역 정보가 성공적으로 수정됨
 *       404:
 *         description: 정보를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * 가까운 역 정보 수정
 */
router.put("/:id", (req, res) => {
  const { company_name, job_title, job_link, location, deadline, nearest_station } = req.body;
  const query = `
    UPDATE stations
    SET company_name = ?, job_title = ?, job_link = ?, location = ?, deadline = ?, nearest_station = ?
    WHERE id = ?
  `;
  db.query(query, [company_name, job_title, job_link, location, deadline, nearest_station, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "가까운 역 정보가 성공적으로 수정되었습니다." });
  });
});

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: 가까운 역 정보 삭제
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 역 ID
 *     responses:
 *       200:
 *         description: 가까운 역 정보가 성공적으로 삭제됨
 *       404:
 *         description: 정보를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

/**
 * 가까운 역 정보 삭제
 */
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM stations WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "가까운 역 정보가 성공적으로 삭제되었습니다." });
  });
});

/**
 * @swagger
 * /stations/aggregate/company:
 *   get:
 *     summary: 데이터 집계 API (회사별 가장 가까운 역 개수)
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: 데이터 집계 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company_name:
 *                     type: string
 *                   nearest_station:
 *                     type: string
 *                   station_count:
 *                     type: integer
 *       500:
 *         description: 서버 오류
 */

/**
 * 회사별로 가장 가까운 역 개수 집계
 */
router.get("/aggregate/company", (req, res) => {
  const query = `
    SELECT company_name, nearest_station, COUNT(*) AS station_count
    FROM stations
    GROUP BY company_name, nearest_station
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "서버 오류" });
    res.status(200).json(results);
  });
});

/**
 * @swagger
 * /stations/aggregate/station:
 *   get:
 *     summary: 데이터 집계 API (역별 관련 회사 개수)
 *     tags: [Stations]
 *     responses:
 *       200:
 *         description: 데이터 집계 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nearest_station:
 *                     type: string
 *                   company_count:
 *                     type: integer
 *       500:
 *         description: 서버 오류
 */

/**
 * 역별 관련 회사 개수 집계
 */
router.get("/aggregate/station", (req, res) => {
  const query = `
    SELECT nearest_station, COUNT(DISTINCT company_name) AS company_count
    FROM stations
    GROUP BY nearest_station
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "서버 오류" });
    res.status(200).json(results);
  });
});

module.exports = router;
