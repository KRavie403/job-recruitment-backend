# Job Recruitment Backend with Node.js & Express.js

## 🚀 프로젝트 소개

이 프로젝트는 사람인의 채용 공고 데이터를 웹 크롤링한 후 MySQL 데이터베이스에 저장하는 백엔드 서버입니다.

## 🛠️ 기술 스택

- Node.js
- Express.js
- MySQL
- Axios
- Cheerio

## 📂 프로젝트 구조

```
project/
├── config/ # DB 연결 정보 파일
│ └── db.js
├── routes/
│ └── crawler.js
├── server.js
├── .gitignore
├── README.md
├── package.json
└── .env
```

## 💻 설치 및 실행 방법

1. **패키지 설치**

   ```bash
   npm install express mysql axios cheerio dotenv

   ```

2. **DB 테이블 생성 MySQL에서 테이블 생성**

   ```
   CREATE DATABASE IF NOT EXISTS job_database;

   USE job_database;

   CREATE TABLE jobs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     company VARCHAR(255) NOT NULL,
     location VARCHAR(255),
     detail_url TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **서버 실행**

   ```
   npm start
   ```

4. **DB 초기화 (한 번만 실행) 서버 실행 후, 크롤링 경로를 호출:**

   **Endpoint**: `GET /api/crawl/scrape`  
   **Description**: 사람인 채용 정보를 크롤링하여 DB에 저장.

   ```
   GET http://113.198.66.79:17xxx/api/crawl/scrape
   ```

## 💡 주의 사항

- 크롤링 데이터는 서버 시작 후 DB에 저장되며, DB는 한 번만 채워집니다.
- 웹사이트 과도한 트래픽 차단을 방지하기 위해 요청 간격을 유의했습니다.
