const crypto = require('node:crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('./db');
const verifyToken = require('./authMiddleware');

const router = express.Router();

function passwordToMd5(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return null;
  }

  if (/^[a-f\d]{32}$/i.test(password)) {
    return password.toLowerCase();
  }

  const normalizedBase64 = password.replace(/=+$/, '');
  const decoded = Buffer.from(password, 'base64');
  if (
    decoded.length === 0
    || decoded.toString('base64').replace(/=+$/, '') !== normalizedBase64
  ) {
    return null;
  }

  return crypto.createHash('md5').update(decoded).digest('hex');
}

function passwordsMatch(candidateHash, storedHash) {
  if (
    !candidateHash
    || typeof storedHash !== 'string'
    || !/^[a-f\d]{32}$/i.test(storedHash)
  ) {
    return false;
  }

  const candidate = Buffer.from(candidateHash, 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

router.get('/', (req, res) => {
  return res.json({
    message: 'JWT Auth Demo',
    endpoints: {
      login: 'POST /',
      authenticate: 'GET /auth',
      protectedHelloWorld: 'GET /hello'
    }
  });
});

router.post('/', (req, res) => {
  const { userName, password } = req.body || {};
  if (typeof userName !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'userName and password are required.' });
  }

  const user = users.find((item) => item.UserName === userName);
  const candidateHash = passwordToMd5(password);
  if (!user || !passwordsMatch(candidateHash, user.Password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = jwt.sign(
    { IdUser: user.IdUser, userName: user.UserName },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
  user.Token = token;

  return res.json({
    message: 'Login successful.',
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