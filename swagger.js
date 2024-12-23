const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Swagger 문서화 설정
 */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',  // OpenAPI 3.0 명시
    info: {
      title: 'Jobs API',
      description: '채용을 위한 구인 목록 API',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api', // 모든 경로는 기본적으로 '/api'로 시작
        description: 'Jobs API 서버'
      },
    ],
  },
  apis: ['./routes/*.js'], // 모든 routes 폴더 내 JS 파일을 대상으로
};

// Swagger 문서화 설정
const swaggerDocs = swaggerJsdoc(swaggerOptions);

/**
 * Swagger UI를 위한 미들웨어 설정
 */
const setupSwaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwaggerDocs;
