const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const app = express();

async function fetchCompanyInfo(companyLink) {
  try {
    const response = await axios.get(companyLink);
    const $ = cheerio.load(response.data);

    const companyName = $('.tit_company').text().trim();
    const industry = $('.txt_job').text().trim();
    const homepage = $('.company_details_group .tit:contains("홈페이지")')
      .next('.desc')
      .find('a')
      .attr('href') || '';

    const address = $('.company_details_group .tit:contains("주소")')
      .next('.desc')
      .find('p')
      .attr('title') || '';

    return {
      companyName,
      industry,
      homepage,
      address
    };
  } catch (error) {
    console.error("Error fetching company info:", error.message);
    return {
      companyName: '',
      industry: '',
      homepage: '',
      address: ''
    };
  }
}

// 상세 페이지에서 급여 정보 가져오기
async function fetchJobDetails(detailUrl) {
  try {
    const response = await axios.get(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    // 급여 정보 찾기: dt 태그가 '급여'인 경우의 dd 태그
    const salary = $(".jv_cont.jv_summary .cont .col") // 컨테이너 접근
      .find("dt") // 모든 dt 태그 찾기
      .filter((_, element) => $(element).text().trim() === "급여") // "급여" 텍스트 필터링
      .next("dd") // 해당 dt의 다음 dd 태그 접근
      .text()
      .trim();

    return salary || "회사내규에 따름";
  } catch (error) {
    console.error(`Error fetching job details: ${detailUrl}`, error);
    return "정보 없음";
  }
}

// 메인 크롤링 함수
async function crawlSaramin(keyword, pages = 1) {
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

      // 모든 jobListings를 Promise.all로 처리
      const jobPromises = jobListings.map((index, job) => {
        return new Promise(async (resolve) => {
          try {
          // const companyLinkPartial = $(job).find('.corp_name a').attr('href');
          // const companyLink = companyLinkPartial
            // ? 'https://www.saramin.co.kr' + companyLinkPartial
            // : '';
          // const companyInfo = companyLink ? await fetchCompanyInfo(companyLink) : {};

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
          const salary = await fetchJobDetails(link); // 상세 페이지에서 급여 정보 가져오기

          if (title && company) {  // 필수 필드 확인
            jobs.push({
              // 회사명: companyInfo.companyName || company,
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
              // 업종: companyInfo.industry || '',
              // 홈페이지: companyInfo.homepage || '',
              // 회사주소: companyInfo.address || ''
            });
          }
        } catch (err) {
          console.error("Error parsing job:", err);
        } finally {
          resolve();  // 개별 작업 완료
        }
      });
    }).get();

      // 모든 작업이 끝날 때까지 대기
      await Promise.all(jobPromises);

      console.log(`${page}페이지 크롤링 성공`);

    } catch (err) {
      console.error(`${page}페이지 크롤링 오류 발생:`, err);
    }

    // 랜덤 딜레이 (1초 ~ 3초 사이)
    const randomDelay = Math.floor(Math.random() * 2000) + 1000;  // 1000ms ~ 3000ms 사이
    await new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  return jobs;
}

// 크롤링 후 CSV로 저장
async function saveToCSV(keyword, pages) {
  const jobs = await crawlSaramin(keyword, pages);

  if (jobs.length === 0) {
    console.error("결과가 없습니다. CSV 파일이 생성되지 않습니다.");
    return;
  }

  // JSON 데이터를 CSV로 변환
  const csv = parse(jobs);

  // CSV 파일 저장 경로
  const csvPath = path.join(__dirname, `saramin_jobs.csv`);

  try {
    // CSV 파일로 저장 (UTF-8 BOM 추가)
    fs.writeFileSync(csvPath, "\uFEFF" + csv, "utf-8");
    console.log(`CSV 경로: ${csvPath}`);
  } catch (error) {
    console.error("Error CSV 경로:", error);
  }
}

app.get('/crawl', async (req, res) => {
  const keyword = req.query.keyword || 'javascript';
  const pages = parseInt(req.query.pages) || 5;

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
