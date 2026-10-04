# JWT Auth Demo

An Express REST API exercise demonstrating an Express Router, JWT login, and authentication middleware. User data is an in-memory sample in `db.js`, not a production database.

## Run locally

1. Copy `.env.example` to `.env` and set a long, random `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm start` (or `npm run dev` for automatic restart).
4. The service listens at `http://localhost:3000` by default.

Sample credentials: username `admin`, password `123456`. For the login request, send the password as MD5 (`e10adc3949ba59abbe56e057f20f883e`) or Base64 (`MTIzNDU2`).

## API

### Login and issue a JWT

Send `POST /` with JSON:

```json
{
  "userName": "admin",
  "password": "MTIzNDU2"
}
```

A successful response contains a three-part JWT in `token`, its type (`Bearer`), and its lifetime (3600 seconds).

### Authenticate a JWT

Send `GET /auth` with the header `Authorization: Bearer <token>`. A valid token returns `authenticated: true`; a missing, invalid, or expired token returns HTTP 401.

### Protected Hello World API

Send `GET /hello` with the same Bearer token. The response includes `Hello World`. This route uses the JWT verification middleware.

## Postman quick test

1. Create a `POST http://localhost:3000/` request. Select **Body → raw → JSON**, enter the login JSON above, and send it.
2. Copy the complete value of the response's `token` field.
3. Create a `GET http://localhost:3000/auth` request. Under **Authorization**, choose **Bearer Token** and paste the token into the Token field.
4. Repeat with `GET http://localhost:3000/hello`.

> Base64 is encoding, not encryption, and MD5 is not appropriate for protecting passwords in production. This exercise accepts those formats to match the assignment. Real applications should use HTTPS and a password hashing algorithm such as Argon2 or bcrypt, and store user accounts in a database.
