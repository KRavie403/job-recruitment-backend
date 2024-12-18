const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const app = express();



// 메인 크롤링 함수
async function crawlSaramin(keyword, pages = 1) {
  const companies = [];
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.saramin.co.kr/zf_user/search/company?searchword=${keyword}&page=${page}`;
    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data);

      const companyListings = $('.item_corp');

      // 모든 companyListings를 Promise.all로 처리
      const companyPromises = companyListings.map((index, job) => new Promise((resolve) => {
        try {
          const company = $(job).find('.corp_name a').text().trim();
          const corp = $(job).find('.corp_info dl');
          const establishment = corp.length > 0 ? $(corp[0]).find('dd').text().trim() : '';
          const representative = corp.length > 1 ? $(corp[1]).find('dd').text().trim() : '';
          const industry = corp.length > 2 ? $(corp[2]).find('dd').text().trim() : '';
          const financial = corp.length > 3 ? $(corp[3]).find('dd').text().trim() : '';
          const address = corp.length > 4 ? $(corp[4]).find('dd').text().trim() : '';


          if (company && representative) {  // 필수 필드 확인
            companies.push({
              회사명: company,
              설립일: establishment,
              대표자명: representative,
              업종: industry,
              재무정보: financial,
              기업주소: address
            });
          }
        } catch (err) {
          console.error("파싱 에러:", err);
        } finally {
          resolve();  // 개별 작업 완료
        }
      })).get();

      // 모든 작업이 끝날 때까지 대기
      await Promise.all(companyPromises);
      
      console.log(`${page}페이지 크롤링 성공`);

    } catch (err) {
      console.error(`${page}페이지 크롤링 오류 발생:`, err);
    }

    // 랜덤 딜레이 (1초 ~ 3초 사이)
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;  // 1000ms ~ 3000ms 사이
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return companies;
}

// 크롤링 후 CSV로 저장
async function saveToCSV(keyword, pages) {
  const companies = await crawlSaramin(keyword, pages);

  if (companies.length === 0) {
    console.error("결과가 없습니다. CSV 파일이 생성되지 않습니다.");
    return;
  }

  // JSON 데이터를 CSV로 변환
  const csv = parse(companies);

  // CSV 파일 저장 경로
  const csvPath = path.join(__dirname, `saramin_companies.csv`);

  try {
    // CSV 파일로 저장 (UTF-8 BOM 추가)
    fs.writeFileSync(csvPath, "\uFEFF" + csv, "utf-8");
    console.log(`CSV 경로: ${csvPath}`);
  } catch (error) {
    console.error("Error CSV 경로:", error);
  }
}

app.get('/crawl', async (req, res) => {
  const keyword = req.query.keyword || '개발';
  const pages = parseInt(req.query.pages) || 10;

  try {
    await saveToCSV(keyword, pages);
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
