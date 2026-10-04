require('dotenv').config();

const express = require('express');
const authRoutes = require('./authRoutes');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Configure it in .env before starting the service.');
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use('/', authRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON request body.' });
  }

  console.error(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  return res.status(status).json({
    message: status === 500 ? 'Internal server error.' : error.message
  });
});

app.listen(port, () => {
  console.log(`JWT Auth Demo is listening at http://localhost:${port}`);
});
