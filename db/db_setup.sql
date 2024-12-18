CREATE DATABASE IF NOT EXISTS job_database;

USE job_database;

-- 채용 공고 정보 모델 (jobs)
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 고유 식별자
    title VARCHAR(255) NOT NULL,          -- 제목
    link TEXT NOT NULL,                   -- 공고 링크
    company VARCHAR(255) NOT NULL,        -- 회사명
    location VARCHAR(255),               -- 지역
    experience VARCHAR(255),             -- 경력
    education VARCHAR(255),              -- 학력
    employment_type VARCHAR(255),        -- 고용 형태
    deadline DATE,                       -- 마감일
    sector VARCHAR(255),                 -- 직무 분야
    salary VARCHAR(255),                 -- 연봉 정보 (급여)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 생성일
);

-- 회사 정보 모델 (companies)
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 고유 식별자
    company_name VARCHAR(255) NOT NULL,    -- 회사명
    establishment DATE,                    -- 설립일
    representative VARCHAR(255),          -- 대표자명
    industry VARCHAR(255),                -- 업종
    financial TEXT,                        -- 재무 정보
    address TEXT,                          -- 기업주소
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 생성일
);

-- 가까운역 정보 모델 (stations)
CREATE TABLE IF NOT EXISTS stations (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 고유 식별자
    company_name VARCHAR(255) NOT NULL,    -- 회사명
    job_title VARCHAR(255) NOT NULL,       -- 공고 제목
    job_link TEXT NOT NULL,                -- 공고 링크
    location VARCHAR(255),                 -- 지역
    deadline DATE,                         -- 마감일
    nearest_station VARCHAR(255),          -- 가까운 역
    salary VARCHAR(255) DEFAULT '정보 없음',  -- 급여 정보 (필요시 추가)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- 생성일
);

-- 사용자 정보 모델 (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,  -- 이메일 (고유)
    password VARCHAR(255) NOT NULL,      -- 비밀번호
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 지원 내역 모델 (applications)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                         -- 사용자 ID (Foreign Key)
    job_id INT,                          -- 채용 공고 ID (Foreign Key)
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 지원 날짜
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 북마크/관심공고 모델 (bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                         -- 사용자 ID (Foreign Key)
    job_id INT,                          -- 채용 공고 ID (Foreign Key)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성일
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 학력 요구 사항 모델 (education_requirements)
CREATE TABLE IF NOT EXISTS education_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 고유 식별자
    job_id INT,                           -- 채용 공고 ID (Foreign Key)
    education_level VARCHAR(255) NOT NULL, -- 학력 요구 사항
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 생성일
    FOREIGN KEY (job_id) REFERENCES jobs(id)  -- 채용 공고와의 관계
);

-- 경력 요구 사항 모델 (experience_requirements)
CREATE TABLE IF NOT EXISTS experience_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,    -- 고유 식별자
    job_id INT,                           -- 채용 공고 ID (Foreign Key)
    experience_level VARCHAR(255) NOT NULL, -- 경력 요구 사항
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 생성일
    FOREIGN KEY (job_id) REFERENCES jobs(id)  -- 채용 공고와의 관계
);

# 데이터 조회 예시: 채용 공고 테이블 (jobs)
# SELECT * FROM jobs;
