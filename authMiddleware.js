const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const match = authHeader && authHeader.match(/^Bearer\s+(\S+)$/i);
  const token = match && match[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: Không tìm thấy Bearer token!' });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET chưa được cấu hình.' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Token: Token không hợp lệ hoặc đã hết hạn!' });
  }
};

module.exports = verifyToken;
