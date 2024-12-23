const express = require('express');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const companiesRoutes = require('./routes/companies');
const applicationsRoutes = require('./routes/applications');
const stationsRoutes = require('./routes/stations');
const bookmarksRoutes = require('./routes/bookmarks');
const internsRoutes = require('./routes/interns');
const newjobsRoutes = require('./routes/newjobs');
const userRoutes = require('./routes/users');

// Swagger 설정 불러오기
const setupSwaggerDocs = require('./swagger');

const app = express();
const PORT = 8080;

app.use(express.json());

// Swagger UI 설정
setupSwaggerDocs(app);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/interns', internsRoutes);
app.use('/api/newjobs', newjobsRoutes);
app.use('/api/users', userRoutes);

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
