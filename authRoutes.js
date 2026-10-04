const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('./db');
const verifyToken = require('./authMiddleware');

const router = express.Router();

function getPasswordHash(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return null;
  }

  if (/^[a-f\d]{32}$/i.test(password)) {
    return password.toLowerCase();
  }

  const decoded = Buffer.from(password, 'base64');
  const normalizedInput = password.replace(/=+$/, '');
  if (decoded.length === 0 || decoded.toString('base64').replace(/=+$/, '') !== normalizedInput) {
    return null;
  }

  return crypto.createHash('md5').update(decoded).digest('hex');
}

function hashesMatch(candidate, stored) {
  if (typeof stored !== 'string' || !/^[a-f\d]{32}$/i.test(stored)) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidate, 'hex');
  const storedBuffer = Buffer.from(stored, 'hex');
  return candidateBuffer.length === storedBuffer.length
    && crypto.timingSafeEqual(candidateBuffer, storedBuffer);
}

router.get('/', (req, res) => {
  res.json({
    message: 'JWT Auth Demo',
    login: 'POST /',
    authenticate: 'GET /auth',
    protectedExample: 'GET /hello'
  });
});

router.post('/', (req, res) => {
  const { userName, password } = req.body || {};
  if (typeof userName !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Cần gửi userName và password.' });
  }

  const user = users.find((item) => item.UserName === userName);
  const passwordHash = getPasswordHash(password);
  if (!user || !passwordHash || !hashesMatch(passwordHash, user.Password)) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
  }

  const token = jwt.sign(
    { IdUser: user.IdUser, userName: user.UserName },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
  user.Token = token;

  return res.json({
    message: 'Đăng nhập thành công.',
    token,
    tokenType: 'Bearer',
    expiresIn: 3600
  });
});

router.get('/auth', verifyToken, (req, res) => {
  return res.json({ authenticated: true, user: req.user });
});

router.get('/hello', verifyToken, (req, res) => {
  return res.json({ message: 'Hello World', user: req.user });
});

module.exports = router;
