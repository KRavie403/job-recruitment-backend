const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

const router = express.Router();

/**
 * 북마크 추가 API
 */
router.post("/", authenticateToken, (req, res) => {
  const { jobId } = req.body;
  const userId = req.user.userId; // JWT에서 사용자 ID 추출

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
 * 북마크 삭제 API
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
 * 북마크 조회 API
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId; // JWT에서 사용자 ID 추출

  const query = `
    SELECT bookmarks.id, jobs.title, jobs.company, bookmarks.created_at
    FROM bookmarks
    JOIN jobs ON bookmarks.job_id = jobs.id
    WHERE bookmarks.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("북마크 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "북마크 조회에 실패했습니다." });
    }
    res.status(200).json({ 북마크정보: results });
  });
});

module.exports = router;
