const express = require("express");
const db = require("../config/db");

const router = express.Router();

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
 * 데이터 집계 API (회사별 가장 가까운 역 개수)
 */
router.get("/aggregate/company", (req, res) => {
  const query = `
    SELECT company_name, nearest_station, COUNT(*) AS station_count
    FROM stations
    GROUP BY company_name, nearest_station
    ORDER BY station_count DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("데이터 집계 중 오류 발생:", err);
      return res.status(500).json({ message: "데이터 집계에 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

/**
 * 데이터 집계 API (역별 관련 회사 개수)
 */
router.get("/aggregate/station", (req, res) => {
  const query = `
    SELECT nearest_station, COUNT(DISTINCT company_name) AS company_count
    FROM stations
    GROUP BY nearest_station
    ORDER BY company_count DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("데이터 집계 중 오류 발생:", err);
      return res.status(500).json({ message: "데이터 집계에 실패했습니다." });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
