const express = require("express");
const db = require("../config/db");

const router = express.Router();

/**
 * 인턴 채용 공고 전체 조회 (필터링, 검색, 페이지네이션, 정렬 지원)
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
 * 특정 인턴 채용 공고 조회
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
 * 인턴 채용 공고 생성
 */
router.post("/", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } = req.body;
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
 * 인턴 채용 공고 수정
 */
router.put("/:id", (req, res) => {
  const { title, link, company_name, location, experience, education, employment_type, deadline, salary, job_id } = req.body;
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
 * 인턴 채용 공고 삭제
 */
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM interns WHERE id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "데이터베이스 오류" });
    res.status(200).json({ message: "인턴 채용 공고가 성공적으로 삭제되었습니다" });
  });
});

module.exports = router;