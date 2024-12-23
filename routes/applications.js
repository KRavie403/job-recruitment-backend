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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: 유효하지 않은 채용 공고 ID
 *       500:
 *         description: 서버 오류
 */
router.post("/", authenticateToken, (req, res) => {
  const { jobId } = req.body;
  const userId = req.user.userId;

  const validateJobQuery = `
    SELECT * FROM jobs WHERE id = ?
  `;

  db.query(validateJobQuery, [jobId], (err, results) => {
    if (err) {
      console.error("DB 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "채용 공고 확인 중 오류가 발생했습니다." });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "유효하지 않은 채용 공고 ID입니다." });
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
router.delete("/:applicationId", authenticateToken, (req, res) => {
  const { applicationId } = req.params;

  const query = `
    DELETE FROM applications
    WHERE id = ?
  `;

  db.query(query, [applicationId], (err) => {
    if (err) {
      console.error("지원 취소 중 오류 발생:", err);
      return res.status(500).json({ message: "채용 공고 지원 취소에 실패했습니다." });
    }
    res.status(200).json({ message: "채용 공고 지원이 성공적으로 취소되었습니다." });
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
 *                         description: 지원 ID
 *                       title:
 *                         type: string
 *                         description: 채용 공고 제목
 *                       company:
 *                         type: string
 *                         description: 회사 이름
 *                       application_date:
 *                         type: string
 *                         format: date-time
 *                         description: 지원 날짜
 *       500:
 *         description: 서버 오류
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId;

  const query = `
    SELECT applications.id, jobs.title, jobs.company, applications.application_date
    FROM applications
    JOIN jobs ON applications.job_id = jobs.id
    WHERE applications.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("지원 내역 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "지원 내역 조회에 실패했습니다." });
    }
    res.status(200).json({ 지원내역: results });
  });
});

module.exports = router;
