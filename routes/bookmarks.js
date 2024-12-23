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
 * 북마크 조회 API (필터링, 검색, 페이지네이션, 정렬 지원)
 */
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.userId; // JWT에서 사용자 ID 추출
  const {
    title,
    company,
    page = 1,
    limit = 10,
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

  // 필터링 조건 추가
  if (title) {
    baseQuery += " AND jobs.title LIKE ?";
    params.push(`%${title}%`);
  }

  if (company) {
    baseQuery += " AND jobs.company LIKE ?";
    params.push(`%${company}%`);
  }

  // 정렬 조건 추가
  baseQuery += ` ORDER BY ${sortField} ${sortOrder}`;

  // 페이지네이션 추가
  baseQuery += " LIMIT ? OFFSET ?";
  params.push(parseInt(limit), parseInt(offset));

  db.query(baseQuery, params, (err, results) => {
    if (err) {
      console.error("북마크 조회 중 오류 발생:", err);
      return res.status(500).json({ message: "북마크 조회에 실패했습니다." });
    }

    // 전체 데이터 개수 조회
    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM bookmarks
      JOIN jobs ON bookmarks.job_id = jobs.id
      WHERE bookmarks.user_id = ?
    `;
    const countParams = [userId];

    if (title) countQuery += " AND jobs.title LIKE ?";
    if (company) countQuery += " AND jobs.company LIKE ?";

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
 * 데이터 집계 API (사용자가 북마크한 회사별 개수)
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
 * 데이터 집계 API (북마크 날짜별 개수)
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
