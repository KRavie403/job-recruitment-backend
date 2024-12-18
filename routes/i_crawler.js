const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

const router = express.Router();

// 웹 크롤링 엔드포인트
router.get("/scrape", authenticateToken, async (req, res) => {
  try {
    const url = "https://www.saramin.co.kr/zf_user/jobs/list/job-category?page=";
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);
    const jobs = [];
    const companies = new Set();  // 회사명 중복 처리
    const jobSectors = new Set(); // 직무 분야 중복 처리
    
    $(".item_recruit").each((index, element) => {
      const title = $(element).find("h2.job_tit").text().trim();
      const company = $(element).find("strong.corp_name").text().trim();
      const location = $(element).find("div.job_condition").text().trim();
      const detailUrl = $(element).find("a").attr("href");

      // 크롤링된 정보로 직무 분야와 회사 정보 추출
      const sector = $(element).find(".job_sector").text().trim();
      companies.add(company);
      jobSectors.add(sector);

      if (title && company && location && detailUrl) {
        jobs.push({ title, company, location, detailUrl, sector });
      }
    });

    // 회사 정보 DB에 저장
    for (let company of companies) {
      const query = `INSERT INTO companies (company_name) VALUES (?)`;
      await new Promise((resolve, reject) => {
        db.query(query, [company], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 직무 분야 DB에 저장
    for (let sector of jobSectors) {
      const query = `INSERT INTO job_sectors (sector_name) VALUES (?)`;
      await new Promise((resolve, reject) => {
        db.query(query, [sector], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // 채용 공고 DB에 저장
    for (let job of jobs) {
      const query = `
        INSERT INTO jobs (title, company, location, detail_url, sector) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(query, [job.title, job.company, job.location, job.detailUrl, job.sector], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.status(200).json({
      message: "크롤링 성공 및 데이터 저장 완료",
      data: jobs,
    });
  } catch (error) {
    console.error("웹 스크래핑 중 오류 발생:", error);
    res.status(500).json({
      message: "웹 스크래핑 중 오류 발생",
    });
  }
});

module.exports = router; // 라우터 객체를 내보냄
