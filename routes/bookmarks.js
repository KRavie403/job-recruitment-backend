const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: 북마크 관련 API
 */

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: 북마크 추가
 *     tags: [Bookmarks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: integer
 *                 description: 북마크할 채용 공고 ID
 *     responses:
 *       201:
 *         description: 북마크 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
router.post("/", authenticateToken, (req, res) => {
  const { jobId } = req.body;
  const userId = req.user.userId;

  const query = `
    INSERT INTO bookmarks (user_id, job_id)
    VALUES (?, ?)
  `;

  db.query(query, [userId, jobId], (err) => {
    if (err) {
      console.error("북마크 추가 중 오류 발생:", err);
      return res.status(500).json({ message: "북마크 추가에 실패했습니다." });
    }
    res.status(201).json({ message: "북마크가 성공적으로 추가되었습니다." });
  });
});

/**
 * @swagger
 * /bookmarks/{bookmarkId}:
 *   delete:
 *     summary: 북마크 삭제
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: bookmarkId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 북마크 ID
 *     responses:
 *       200:
 *         description: 북마크 삭제 성공
 *       500:
 *         description: 서버 오류
 */
router.delete("/:bookmarkId", authenticateToken, (req, res) => {
  const { bookmarkId } = req.params;

  const query = `
    DELETE FROM bookmarks
    WHERE id = ?
  `;

  db.query(query, [bookmarkId], (err) => {
    if (err) {
      console.error("북마크 삭제 중 오류 발생:", err);
      return res.status(500).json({ message: "북마크 삭제에 실패했습니다." });
    }
    res.status(200).json({ message: "북마크가 성공적으로 삭제되었습니다." });
  });
});

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: 북마크 조회
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: 채용 공고 제목 필터링
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: 회사명 필터링
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "페이지 번호 (기본값: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "페이지 당 항목 수 (기본값: 20)"
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *         description: "정렬할 필드 (기본값: created_at)"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: "정렬 순서 (기본값: DESC)"
 *     responses:
 *       200:
 *         description: 북마크 조회 성공
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

router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const {
    title,
    company,
    page = 1,
    limit = 20,
    sortField = "bookmarks.created_at",
    sortOrder = "DESC",
  } = req.query;

  const offset = (page - 1) * limit;

  let baseQuery = `
    SELECT bookmarks.id, jobs.title, jobs.company, bookmarks.created_at
    FROM bookmarks
    JOIN jobs ON bookmarks.job_id = jobs.id
    WHERE bookmarks.user_id = ?
  `;
  const params = [userId];

  if (title) {
    baseQuery += " AND jobs.title LIKE ?";
    params.push(`%${title}%`);
  }

  if (company) {
    baseQuery += " AND jobs.company LIKE ?";
    params.push(`%${company}%`);
  }

  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) {
      console.error("북마크 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "북마크 조회에 실패했습니다." });
    }

    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bookmarks
      JOIN jobs ON bookmarks.job_id = jobs.id
      WHERE bookmarks.user_id = ?
    `;
    db.query(countQuery, [userId], (countErr, countResult) => {
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
 * /bookmarks/aggregate/company:
 *   get:
 *     summary: 회사별 북마크 개수 조회
 *     tags: [Bookmarks]
 *     responses:
 *       200:
 *         description: 집계 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   company:
 *                     type: string
 *                   bookmark_count:
 *                     type: integer
 *       500:
 *         description: 서버 오류
 */
router.get("/aggregate/company", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT jobs.company, COUNT(*) AS bookmark_count
    FROM bookmarks
    JOIN jobs ON bookmarks.job_id = jobs.id
    WHERE bookmarks.user_id = ?
    GROUP BY jobs.company
    ORDER BY bookmark_count DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("데이터 집계 중 오류 발생:", err);
      return res.status(500).json({ message: "데이터 집계에 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

/**
 * @swagger
 * /bookmarks/aggregate/date:
 *   get:
 *     summary: 날짜별 북마크 개수 조회
 *     tags: [Bookmarks]
 *     responses:
 *       200:
 *         description: 집계 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   bookmark_count:
 *                     type: integer
 *       500:
 *         description: 서버 오류
 */
router.get("/aggregate/date", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT DATE(bookmarks.created_at) AS date, COUNT(*) AS bookmark_count
    FROM bookmarks
    WHERE bookmarks.user_id = ?
    GROUP BY DATE(bookmarks.created_at)
    ORDER BY date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("데이터 집계 중 오류 발생:", err);
      return res.status(500).json({ message: "데이터 집계에 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
