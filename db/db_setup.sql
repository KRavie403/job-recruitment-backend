CREATE DATABASE IF NOT EXISTS job_database;

USE job_database;

-- job_database 데이터베이스가 없다면 생성
CREATE DATABASE IF NOT EXISTS job_database;
USE job_database;

-- 채용 공고 정보 모델 (jobs)
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    detail_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    salary VARCHAR(255)
);

-- 회사 정보 모델 (companies)
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    company_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 정보 모델 (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 지원 내역 모델 (applications)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    job_id INT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 북마크/관심공고 모델 (bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    job_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 직무 분야 정보 모델 (job_sectors)
CREATE TABLE IF NOT EXISTS job_sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sector_name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 학력 요구 사항 모델 (education_requirements)
CREATE TABLE IF NOT EXISTS education_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    education_level VARCHAR(255) NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- 경력 요구 사항 모델 (experience_requirements)
CREATE TABLE IF NOT EXISTS experience_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    experience_level VARCHAR(255) NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);


#SELECT * FROM jobs;
