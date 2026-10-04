const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { login, startTestServer } = require('./testServer');

test('login accepts Base64 and MD5 passwords and issues a valid JWT', async () => {
  const server = await startTestServer();
  try {
    const base64Login = await login(server.baseUrl);
    assert.equal(base64Login.response.status, 200);
    assert.equal(base64Login.body.tokenType, 'Bearer');
    assert.equal(base64Login.body.expiresIn, 3600);
    assert.equal(base64Login.body.token.split('.').length, 3);
    assert.deepEqual(jwt.verify(base64Login.body.token, server.secret, {
      algorithms: ['HS256']
    }).userName, 'admin');

    const md5Login = await login(server.baseUrl, 'e10adc3949ba59abbe56e057f20f883e');
    assert.equal(md5Login.response.status, 200);

    const rejected = await login(server.baseUrl, 'wrong-password');
    assert.equal(rejected.response.status, 401);
  } finally {
    await server.stop();
  }
});
