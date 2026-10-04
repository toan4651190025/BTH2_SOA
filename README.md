# JWT Auth Demo

Express REST API thực hành đăng nhập, JWT và middleware xác thực. Dịch vụ dùng dữ liệu người dùng trong bộ nhớ từ `db.js`, nên đây chỉ là ví dụ học tập; thay đổi token và dữ liệu sẽ mất khi khởi động lại.

## Chạy ứng dụng

1. Sao chép `.env.example` thành `.env` và đặt `JWT_SECRET` thành một chuỗi bí mật ngẫu nhiên.
2. Chạy `npm start` (hoặc `npm run dev`).
3. Mặc định dịch vụ chạy tại `http://localhost:3000`.

Tài khoản mẫu: `admin`. Mật khẩu ban đầu là `123456`; gửi mật khẩu ở dạng MD5 (`e10adc3949ba59abbe56e057f20f883e`) hoặc Base64 (`MTIzNDU2`).

## API

### Đăng nhập và nhận JWT

Gửi `POST /` với JSON:

```json
{
  "userName": "admin",
  "password": "MTIzNDU2"
}
```

Phản hồi thành công có `token`, `tokenType` (`Bearer`) và thời hạn 3600 giây.

### Kiểm tra token

Gọi `GET /auth` với header `Authorization: Bearer <token>`. Token thiếu, không hợp lệ hoặc hết hạn sẽ nhận HTTP 401.

### API Hello World có bảo vệ

Gọi `GET /hello` với cùng header để nhận thông điệp `Hello World`. Route này gắn middleware xác thực JWT.

> Base64 và MD5 không bảo vệ được mật khẩu trên đường truyền; chỉ dùng để đáp ứng bài thực hành. Dùng HTTPS và lưu mật khẩu bằng thuật toán băm mật khẩu chuyên dụng (như Argon2 hoặc bcrypt) trong ứng dụng thực tế.
