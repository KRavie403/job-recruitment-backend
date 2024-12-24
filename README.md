# 구인구직 백엔드 서버 만들기 with Node.js & Express.js

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
├── config/ # 프로젝트 환경설정 관련 파일
│   ├── db.js         # 데이터베이스 연결 설정
│   └── .env.example  # 환경 변수 예제 파일
├── db/ # 데이터베이스 관련 리소스
│   ├── crawled-data.json # 크롤링된 데이터 샘플
│   ├── db_setup.sql      # 데이터베이스 초기화 SQL 파일
│   └── saramin.csv       # 크롤링한 데이터의 CSV 파일
├── middleware/ # 미들웨어 파일들
│   └── authenticate.js  # JWT 인증 미들웨어
├── routes/ # 각 기능별 API 엔드포인트 정의
│   ├── applications.js  # 채용 지원 관련 엔드포인트
│   ├── auth.js          # 인증 및 사용자 관리 API
│   ├── bookmarks.js     # 즐겨찾기 관련 API
│   ├── companies.js     # 회사 정보 API
│   ├── interns.js       # 인턴 정보 API
│   ├── jobs.js          # 채용 공고 API
│   ├── newjobs.js       # 최신 채용 공고 API
│   ├── stations.js      # 위치 및 지하철 관련 API
│   └── users.js         # 사용자 관련 API
├── crawler.js            # 채용 공고 데이터 크롤러
├── server.js             # Express 서버 진입점
├── swagger.js            # Swagger 설정 파일
├── .gitignore            # Git에서 무시할 파일 및 디렉토리
├── README.md             # 프로젝트 설명 파일
├── LICENSE               # 프로젝트 라이선스
├── package.json          # 프로젝트 의존성 및 스크립트
└── package-lock.json     # 고정된 패키지 버전 정보

```

## 🌟 주요 기능

1. **채용 공고 크롤링**

- 사람인 데이터를 크롤링하여 MySQL 데이터베이스에 저장.
- Axios와 Cheerio를 사용한 효율적인 데이터 추출.

2. **Jobs API**

- 채용 공고 목록 조회, 검색, 필터링, 정렬.
- 공고의 상세 정보 제공.

3. **Auth API**

- 회원가입 및 로그인 기능.
- JWT를 사용한 사용자 인증 및 토큰 갱신.
- 비밀번호 암호화를 통해 보안 강화.

4. **Applications API**

- 사용자 채용 지원 관리.
- 지원 내역 확인 및 삭제.
- 관심심 등록

5. **Bookmarks API**

- 사용자가 관심 있는 채용 공고를 즐겨찾기로 관리.
- 즐겨찾기 추가 및 제거 기능 제공.

6. **Companies API**

- 회사 목록 조회, 검색, 필터링.
- 회사 상세 정보 제공.

7. **Interns API**

- 인턴 공고 목록 조회.
- 필터를 통해 적합한 인턴십 공고 검색.

8. **Newjobs API**

- 신규 채용 공고 조회.
- 최신 공고의 빠른 접근 제공.

9. **Stations API**

- 채용 공고와 연계된 위치 정보 제공.
- 특정 지하철역 주변 채용 공고 검색 가능.

10. **Users API**

- 사용자 정보 관리.
- 프로필 수정 및 탈퇴 기능 제공.

11. **Swagger UI를 사용한 API 문서화**

- Swagger UI를 통해 쉽게 API를 테스트하고 확인 가능.

12. **데이터베이스 초기화 스크립트**

- db_setup.sql을 사용하여 데이터베이스를 손쉽게 초기화.

## 💻 설치 및 실행 방법

1. **환경 변수 설정**
   이 프로젝트는 `.env` 파일을 사용하여 환경 변수를 설정합니다.
   저장소의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하고 아래와 같이 수정합니다:

   ```bash
   cp .env.example .env
   ```

2. **패키지 설치**

   ```bash
   npm install
   npm install express mysql axios cheerio dotenv json2csv
   npm install swagger-jsdoc swagger-ui-express
   npm install jsonwebtoken bcrypt express-validator
   npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
   npm install nodemon --save-dev
   ```

3. **서버 실행**

   ```
   ssh -i "키 경로" -p 포트번호 ubuntu@주소
   ```

## 📦 빌드 및 배포

1. 프로덕션 환경 빌드 프로덕션 환경에서 실행하기 위해 Node.js 환경을 production으로 설정:

   ```
   export NODE_ENV=production
   ```

2. 프로덕션 의존성 설치 개발 의존성을 제외한 프로덕션 의존성만 설치:

   ```
   npm install --production
   ```

3. 서버 실행 프로덕션 모드에서 서버 실행:

   ```
   node server.js
   ```

4. 개발 환경 실행 개발 모드에서 서버를 실행하고, 코드 변경 시 자동으로 재시작:

   ```
   npm run dev
   ```

## 📋 데이터베이스 초기화 방법

1.  데이터베이스 설정 파일(config/db.js)에서 MySQL 연결 정보를 확인 및 수정.
2.  db/db_setup.sql 파일을 실행하여 데이터베이스 초기화.

## 🛡️ 보안

- 환경 변수(.env)에 중요한 정보(JWT_SECRET, DB_PASSWORD 등)를 저장하여 민감 정보 보호.
- 비밀번호는 bcrypt로 암호화하여 저장.
- JWT를 사용하여 사용자 인증 및 권한 관리.

## 📜 라이선스

이 프로젝트는 MIT License 하에 배포됩니다. 자유롭게 수정 및 배포가 가능합니다.
