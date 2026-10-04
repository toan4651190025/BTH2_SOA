require('dotenv').config();

const express = require('express');
const authRoutes = require('./authRoutes');

if (!process.env.JWT_SECRET) {
  console.error('Thiếu JWT_SECRET. Hãy cấu hình biến môi trường trước khi chạy service.');
  process.exit(1);
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use('/', authRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'JSON không hợp lệ.' });
  }

  console.error(error);
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  return res.status(status).json({ message: status === 500 ? 'Lỗi máy chủ.' : error.message });
});

app.listen(port, () => {
  console.log(`JWT Auth Demo đang chạy tại http://localhost:${port}`);
});
