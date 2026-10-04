const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.get('Authorization');
  const match = authHeader && authHeader.match(/^Bearer\s+(\S+)$/i);
  const token = match && match[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied: Bearer token is required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured.' });
  }

  try {
    req.user = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;