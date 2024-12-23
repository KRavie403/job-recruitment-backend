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
└── swagger.js
```

## 💻 설치 및 실행 방법

1. **패키지 설치**

   ```bash
   npm install
   npm install express mysql axios cheerio dotenv json2csv
   npm install swagger-jsdoc swagger-ui-express
   npm install jsonwebtoken bcrypt express-validator

   ```

2. **DB 테이블 생성 MySQL에서 테이블 생성**

   ```
    CREATE DATABASE IF NOT EXISTS job_database;

    USE job_database;

    -- 채용 공고 정보 모델 (jobs)
    CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company VARCHAR(255) NOT NULL,  -- 회사명
        title VARCHAR(255) NOT NULL,
        link TEXT NOT NULL,             -- 공고 링크
        location VARCHAR(255),         -- 지역
        experience VARCHAR(255),       -- 경력
        education VARCHAR(255),        -- 학력
        employment_type VARCHAR(255),  -- 고용형태
        deadline DATE,                 -- 마감일
        sector VARCHAR(255),           -- 직무 분야
        salary VARCHAR(255),           -- 연봉
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 추가
    CREATE INDEX idx_jobs_title ON jobs (title);
    CREATE INDEX idx_jobs_company ON jobs (company);
    CREATE INDEX idx_jobs_location ON jobs (location);
    CREATE INDEX idx_jobs_deadline ON jobs (deadline);


    -- 회사 정보 모델 (companies)
    CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,  -- 회사명
        establishment VARCHAR(255),          -- 설립일
        representative VARCHAR(255),        -- 대표자명
        industry VARCHAR(255),              -- 업종
        financial TEXT,                      -- 재무 정보
        location VARCHAR(255),              -- 기업주소
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 가까운역 정보 모델 (stations)
    CREATE TABLE IF NOT EXISTS stations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,  -- 회사명
        job_title VARCHAR(255) NOT NULL,     -- 공고 제목
        job_link TEXT NOT NULL,              -- 공고 링크
        location VARCHAR(255),               -- 지역
        deadline VARCHAR(255),               -- 마감일
        nearest_station VARCHAR(255),        -- 가까운 역
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 사용자 정보 모델 (users)
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,  -- 이메일 (고유)
        password VARCHAR(255) NOT NULL,      -- 비밀번호
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 인덱스 추가
    CREATE UNIQUE INDEX idx_users_email ON users (email);


    -- 지원 내역 모델 (applications)
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,                         -- 사용자 ID (Foreign Key)
        job_id INT,                          -- 채용 공고 ID (Foreign Key)
        application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 지원 날짜
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    -- 인덱스 추가
    CREATE INDEX idx_applications_user_id ON applications (user_id);
    CREATE INDEX idx_applications_job_id ON applications (job_id);


    -- 북마크/관심공고 모델 (bookmarks)
    CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,                         -- 사용자 ID (Foreign Key)
        job_id INT,                          -- 채용 공고 ID (Foreign Key)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성일
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES jobs(id)
    );

    -- 인턴 채용 공고 정보 모델 (interns)
    CREATE TABLE IF NOT EXISTS interns (
        id INT AUTO_INCREMENT PRIMARY KEY,          -- 인턴 공고 고유 ID
        company_name VARCHAR(255) NOT NULL,         -- 회사명
        title VARCHAR(255) NOT NULL,                -- 공고 제목
        link TEXT NOT NULL,                         -- 공고 링크
        location VARCHAR(255),                      -- 지역
        experience VARCHAR(255),                    -- 경력
        education VARCHAR(255),                     -- 학력
        deadline VARCHAR(255),                      -- 마감일
        employment_type VARCHAR(255),               -- 고용형태
        salary VARCHAR(255),                        -- 연봉정보
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 등록일
    );

    -- 인덱스 추가
    CREATE INDEX idx_interns_title ON interns (title);
    CREATE INDEX idx_interns_company_name ON interns (company_name);
    CREATE INDEX idx_interns_location ON interns (location);
    CREATE INDEX idx_interns_deadline ON interns (deadline);


    -- 신입 요구 사항 모델 (newjobs)
    CREATE TABLE IF NOT EXISTS newjobs (
        id INT AUTO_INCREMENT PRIMARY KEY,          -- 신입 공고 고유 ID
        company_name VARCHAR(255) NOT NULL,         -- 회사명
        title VARCHAR(255) NOT NULL,                -- 공고 제목
        link TEXT NOT NULL,                         -- 공고 링크
        location VARCHAR(255),                      -- 지역
        experience VARCHAR(255),                    -- 경력
        education VARCHAR(255),                     -- 학력
        deadline VARCHAR(255),                      -- 마감일
        employment_type VARCHAR(255),               -- 고용형태
        salary VARCHAR(255),                        -- 연봉정보
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 등록일
    );

    -- 인덱스 추가
    CREATE INDEX idx_newjobs_title ON newjobs (title);
    CREATE INDEX idx_newjobs_company_name ON newjobs (company_name);
    CREATE INDEX idx_newjobs_location ON newjobs (location);
    CREATE INDEX idx_newjobs_deadline ON newjobs (deadline);

    -- 로그인 이력 모델 (login_history)
    CREATE TABLE IF NOT EXISTS login_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,               -- 사용자 ID (users 테이블과 연결)
        login_time TIMESTAMP DEFAULT NOW(), -- 로그인 시간
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
