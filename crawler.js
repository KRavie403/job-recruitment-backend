const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const app = express();

// 상세 페이지에서 급여 정보 가져오기
async function fetchJobDetails(detailUrl) {
  try {
    const response = await axios.get(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const salary = $(".jv_cont.jv_summary .cont .col")
      .find("dt")
      .filter((_, element) => $(element).text().trim() === "급여")
      .next("dd")
      .text()
      .trim();

    return salary || "회사내규에 따름";
  } catch (error) {
    console.error(`데이터를 가져오는 중 오류 발생: ${detailUrl}`, error);
    return "정보 없음";
  }
}

// 메인 크롤링 함수 (채용 공고 크롤링)
async function crawlSaraminJobs(keyword, pages = 1) {
  const jobs = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${keyword}&recruitPage=${page}`;

    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);
      const jobListings = $('.item_recruit');

      const jobPromises = jobListings.map((index, job) => new Promise(async (resolve) => {
        try {
          const company = $(job).find('.corp_name a').text().trim();
          const title = $(job).find('.job_tit a').text().trim();
          const link = 'https://www.saramin.co.kr' + $(job).find('.job_tit a').attr('href');
          const conditions = $(job).find('.job_condition span');
          const location = conditions.length > 0 ? $(conditions[0]).text().trim() : '';
          const experience = conditions.length > 1 ? $(conditions[1]).text().trim() : '';
          const education = conditions.length > 2 ? $(conditions[2]).text().trim() : '';
          const employmentType = conditions.length > 3 ? $(conditions[3]).text().trim() : '';
          const deadline = $(job).find('.job_date .date').text().trim();
          const sector = $(job).find('.job_sector').text().trim() || '';
          const salary = await fetchJobDetails(link);

          if (title && company) {
            jobs.push({
              회사명: company,
              제목: title,
              공고링크: link,
              지역: location,
              경력: experience,
              학력: education,
              고용형태: employmentType,
              마감일: deadline,
              직무분야: sector,
              연봉정보: salary
            });
          }
        } catch (err) {
          console.error("파싱 에러:", err);
        } finally {
          resolve();
        }
      })).get();

      await Promise.all(jobPromises);
      console.log(`${page}페이지 크롤링 성공`);
    } catch (err) {
      console.error(`${page}페이지 크롤링 오류 발생:`, err);
    }

    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return jobs;
}

// 인턴 공고 크롤링
async function crawlSaraminInterns(pages = 1) {
  const jobs = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.saramin.co.kr/zf_user/jobs/public/list?page=${page}&type=intern`;

    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);
      const jobListings = $('.box_item');

      const jobPromises = jobListings.map((index, job) => new Promise((resolve) => {
        try {
          const company = $(job).find('.company_nm a').text().trim();
          const title = $(job).find('.notification_info a').attr('title');
          const link = 'https://www.saramin.co.kr' + $(job).find('.notification_info a').attr('href');
          const location = $(job).find('.work_place').text().trim();
          const experience = $(job).find('.career').text().trim();
          const education = $(job).find('.education').text().trim();
          const deadline = $(job).find('.date').text().trim();
          const employmentType = "인턴";
          const salary = $(job).find('.salary').text().trim();

          if (company && title) {
            jobs.push({
              회사명: company,
              제목: title,
              공고링크: link,
              지역: location,
              경력: experience,
              학력: education,
              마감일: deadline,
              고용형태: employmentType,
              연봉정보: salary
            });
          }
        } catch (err) {
          console.error("파싱 에러:", err);
        } finally {
          resolve();
        }
      })).get();

      await Promise.all(jobPromises);
      console.log(`${page}페이지 크롤링 성공`);
    } catch (err) {
      console.error(`${page}페이지 크롤링 오류 발생:`, err);
    }

    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return jobs;
}

// 역 기반 크롤링
async function crawlSaraminStations(pages = 1) {
  const jobs = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.saramin.co.kr/zf_user/jobs/list/subway?page=${page}`;

    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);
      const jobListings = $('.box_item');

      const jobPromises = jobListings.map((index, job) => new Promise((resolve) => {
        try {
          const company = $(job).find('.company_nm a').text().trim();
          const title = $(job).find('.notification_info a').attr('title');
          const link = 'https://www.saramin.co.kr' + $(job).find('.notification_info job_tit a').attr('href');
          const location = $(job).find('.work_place').text().trim();
          const deadline = $(job).find('.date').text().trim();
          const station = $(job).find('.distance').text().trim() || '';

          if (company && station) {
            jobs.push({
              회사명: company,
              제목: title,
              공고링크: link,
              지역: location,
              마감일: deadline,
              가까운역: station
            });
          }
        } catch (err) {
          console.error("파싱 에러:", err);
        } finally {
          resolve();
        }
      })).get();

      await Promise.all(jobPromises);
      console.log(`${page}페이지 크롤링 성공`);
    } catch (err) {
      console.error(`${page}페이지 크롤링 오류 발생:`, err);
    }

    const randomDelay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return jobs;
}

// CSV로 저장
async function saveToCSV(pages) {
  const allJobs = [];

  // 각 크롤링 함수 결과를 통합
  const jobsFromSaraminJobs = await crawlSaraminJobs('강남역', pages);
  const jobsFromSaraminInterns = await crawlSaraminInterns(pages);
  const jobsFromSaraminStations = await crawlSaraminStations(pages);

  allJobs.push(...jobsFromSaraminJobs, ...jobsFromSaraminInterns, ...jobsFromSaraminStations);

  if (allJobs.length === 0) {
    console.error("결과가 없습니다. CSV 파일이 생성되지 않습니다.");
    return;
  }

  // JSON 데이터를 CSV로 변환
  const csv = parse(allJobs);

  // CSV 파일 저장 경로
  const csvPath = path.join(__dirname, `saramin.csv`);

  try {
    // CSV 파일로 저장 (UTF-8 BOM 추가)
    fs.writeFileSync(csvPath, "\uFEFF" + csv, "utf-8");
    console.log(`CSV 경로: ${csvPath}`);
  } catch (error) {
    console.error("Error CSV 경로:", error);
  }
}

app.get('/crawl', async (req, res) => {
  const pages = parseInt(req.query.pages) || 10;

  try {
    await saveToCSV(pages);
    res.send(`크롤링 성공 및 데이터 저장 완료.`);
  } catch (error) {
    console.error("웹 스크래핑 중 오류 발생:", error);
    res.status(500).send("웹 스크래핑 중 오류 발생.");
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
