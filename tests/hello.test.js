const assert = require('node:assert/strict');
const test = require('node:test');
const { login, startTestServer } = require('./testServer');

test('GET /hello returns Hello World only when a valid JWT is supplied', async () => {
  const server = await startTestServer();
  try {
    const { body: loginBody } = await login(server.baseUrl);
    const authorizedResponse = await fetch(`${server.baseUrl}/hello`, {
      headers: { Authorization: `Bearer ${loginBody.token}` }
    });
    assert.equal(authorizedResponse.status, 200);
    const authorizedBody = await authorizedResponse.json();
    assert.equal(authorizedBody.message, 'Hello World');
    assert.equal(authorizedBody.user.IdUser, 1);

    const unauthorizedResponse = await fetch(`${server.baseUrl}/hello`);
    assert.equal(unauthorizedResponse.status, 401);
  } finally {
    await server.stop();
  }
});
