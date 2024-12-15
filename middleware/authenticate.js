const jwt = require("jsonwebtoken");

// JWT 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"에서 토큰만 추출

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    req.user = user; // 검증된 사용자 정보를 요청 객체에 추가
    next(); // 다음 미들웨어 또는 라우터로 전달
  });
};

module.exports = { authenticateToken };
