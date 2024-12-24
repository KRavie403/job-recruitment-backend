const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: 채용 공고 지원 API
 */

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: 채용 공고 지원 생성
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
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
 *                 description: 지원할 채용 공고 ID
 *     responses:
 *       201:
 *         description: 지원이 성공적으로 등록됨
 *       400:
 *         description: 중복 지원이거나 유효하지 않은 채용 공고 ID
 *       500:
 *         description: 서버 오류
 */
router.post("/", authenticateToken, (req, res) => {
  const { jobId } = req.body;
  const userId = req.user.userId;

  const validateJobQuery = `SELECT * FROM jobs WHERE id = ?`;
  const checkDuplicateQuery = `SELECT * FROM applications WHERE job_id = ? AND user_id = ?`;

  db.query(validateJobQuery, [jobId], (err, jobResults) => {
    if (err) {
      console.error("DB 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "채용 공고 확인 중 오류가 발생했습니다." });
    }

    if (jobResults.length === 0) {
      return res.status(400).json({ message: "유효하지 않은 채용 공고 ID입니다." });
    }

    db.query(checkDuplicateQuery, [jobId, userId], (err, duplicateResults) => {
      if (err) {
        console.error("중복 지원 체크 중 오류 발생:", err);
        return res.status(500).json({ message: "중복 지원 체크 중 오류가 발생했습니다." });
      }

      if (duplicateResults.length > 0) {
        return res.status(400).json({ message: "이미 지원한 공고입니다." });
      }

      const insertApplicationQuery = `
        INSERT INTO applications (user_id, job_id)
        VALUES (?, ?)
      `;
      db.query(insertApplicationQuery, [userId, jobId], (err) => {
        if (err) {
          console.error("지원 등록 중 오류 발생:", err);
          return res.status(500).json({ message: "채용 공고 지원에 실패했습니다." });
        }

        res.status(201).json({ message: "채용 공고 지원이 성공적으로 등록되었습니다." });
      });
    });
  });
});

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: 지원 내역 조회
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 지원 상태별 필터링
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: 지원 내역 날짜별 정렬
 *     responses:
 *       200:
 *         description: 지원 내역 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 지원내역:
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
 *                       status:
 *                         type: string
 *                         description: 지원 상태
 *                       application_date:
 *                         type: string
 *                         format: date-time
 *                         description: 지원 날짜
 *       500:
 *         description: 서버 오류
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { status, order = "desc" } = req.query;

  let query = `
    SELECT applications.id, jobs.title, jobs.company, applications.status, applications.application_date
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.user_id = ?
  `;
  const params = [userId];

  if (status) {
    query += " AND applications.status = ?";
    params.push(status);
  }

  query += ` ORDER BY applications.application_date ${order.toUpperCase()}`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("지원 내역 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "지원 내역 조회에 실패했습니다." });
    }

    res.status(200).json({ 지원내역: results });
  });
});

/**
 * @swagger
 * /applications/{applicationId}:
 *   delete:
 *     summary: 채용 공고 지원 취소
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 지원 ID
 *     responses:
 *       200:
 *         description: 지원이 성공적으로 취소됨
 *       400:
 *         description: 취소할 수 없는 지원
 *       500:
 *         description: 서버 오류
 */
router.delete("/:applicationId", authenticateToken, (req, res) => {
  const { applicationId } = req.params;

  const checkCancellableQuery = `
    SELECT status FROM applications WHERE id = ?
  `;
  const deleteApplicationQuery = `
    DELETE FROM applications WHERE id = ?
  `;

  db.query(checkCancellableQuery, [applicationId], (err, results) => {
    if (err) {
      console.error("취소 가능 여부 확인 중 오류 발생:", err);
      return res.status(500).json({ message: "취소 가능 여부 확인 중 오류가 발생했습니다." });
    }

    if (results.length === 0 || results[0].status !== "pending") {
      return res.status(400).json({ message: "취소할 수 없는 지원입니다." });
    }

    db.query(deleteApplicationQuery, [applicationId], (err) => {
      if (err) {
        console.error("지원 취소 중 오류 발생:", err);
        return res.status(500).json({ message: "채용 공고 지원 취소에 실패했습니다." });
      }

      res.status(200).json({ message: "채용 공고 지원이 성공적으로 취소되었습니다." });
    });
  });
});

module.exports = router;
