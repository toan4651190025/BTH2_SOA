const assert = require('node:assert/strict');
const test = require('node:test');
const { login, startTestServer } = require('./testServer');

test('GET /auth accepts a valid token and rejects missing or invalid tokens', async () => {
  const server = await startTestServer();
  try {
    const { body: loginBody } = await login(server.baseUrl);
    const validResponse = await fetch(`${server.baseUrl}/auth`, {
      headers: { Authorization: `Bearer ${loginBody.token}` }
    });
    assert.equal(validResponse.status, 200);
    const validBody = await validResponse.json();
    assert.equal(validBody.authenticated, true);
    assert.equal(validBody.user.userName, 'admin');

    const missingResponse = await fetch(`${server.baseUrl}/auth`);
    assert.equal(missingResponse.status, 401);

    const invalidResponse = await fetch(`${server.baseUrl}/auth`, {
      headers: { Authorization: 'Bearer invalid.token.value' }
    });
    assert.equal(invalidResponse.status, 401);
  } finally {
    await server.stop();
  }
});
