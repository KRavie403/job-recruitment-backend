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
    
    $(".item_recruit").each((index, element) => {
      const title = $(element).find("h2.job_tit").text().trim();
      const company = $(element).find("strong.corp_name").text().trim();
      const location = $(element).find("div.job_condition").text().trim();
      const detailUrl = $(element).find("a").attr("href");

      if (title && company && location && detailUrl) {
        jobs.push({ title, company, location, detailUrl });
      }
    });

    // CSV 파일 저장
    const filePath = path.join(__dirname, "../data/jobs.csv");
    const csvData = jobs.map(job => `${job.title},${job.company},${job.location},${job.detailUrl}`).join("\n");
    fs.writeFileSync(filePath, csvData);

    // DB에 데이터 저장
    for (let job of jobs) {
      const query = `
        INSERT INTO jobs (title, company, location, detail_url) 
        VALUES (?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(query, [job.title, job.company, job.location, job.detailUrl], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    res.status(200).json({
      message: "Crawling complete and data saved",
      data: jobs,
    });
  } catch (error) {
    console.error("Error during web scraping:", error);
    res.status(500).json({
      message: "Error during web scraping",
    });
  }
});

module.exports = router;