const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

async function getAvailablePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

async function startTestServer() {
  const port = await getAvailablePort();
  const secret = 'test-secret-for-jwt-validation-only';
  const child = spawn(process.execPath, ['index.js'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), JWT_SECRET: secret },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  let output = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (child.exitCode !== null) {
        throw new Error(`Service exited during startup.\n${output}`);
      }

      try {
        const response = await fetch(baseUrl);
        if (response.ok) {
          return {
            baseUrl,
            secret,
            stop: () => stopChild(child)
          };
        }
      } catch (error) {
        // The listener may not be ready yet.
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Service did not become ready within 10 seconds.\n${output}`);
  } catch (error) {
    await stopChild(child);
    throw error;
  }
}

async function stopChild(child) {
  if (child.exitCode !== null || child.killed) {
    return;
  }

  child.kill();
  await Promise.race([
    new Promise((resolve) => child.once('close', resolve)),
    new Promise((resolve) => setTimeout(resolve, 3000))
  ]);
}

async function login(baseUrl, password = 'MTIzNDU2') {
  const response = await fetch(`${baseUrl}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: 'admin', password })
  });
  return { response, body: await response.json() };
}

module.exports = { login, startTestServer };
