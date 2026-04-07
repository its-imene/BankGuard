const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = 9000;
const SECRET = 'test_secret_123'; // Use this when adding the destination in the UI
const EXPORT_DIR = path.join(__dirname, 'test_exports');

if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR);

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      const payload = Buffer.concat(body);
      const signature = req.headers['x-blacklist-signature'];
      const timestamp = req.headers['x-blacklist-timestamp'];
      const eventType = req.headers['x-blacklist-event'];
      const filename = req.headers['x-blacklist-filename'] || 'payload.bin';

      console.log('\n\x1b[36m%s\x1b[0m', '─'.repeat(50));
      console.log('\x1b[35m%s\x1b[0m', `📥 RECEIVED WEBHOOK: ${eventType}`);
      console.log('\x1b[33m%s\x1b[0m', `Timestamp: ${timestamp}`);

      // Security Verification
      const expectedSignature = crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .update(`.${timestamp}`)
        .digest('hex');

      if (signature === expectedSignature) {
        console.log('\x1b[32m%s\x1b[0m', '✅ SECURITY VERIFIED: Signature matches shared secret.');
      } else {
        console.log('\x1b[31m%s\x1b[0m', '❌ SECURITY FAILED: Invalid signature!');
      }

      // Save Data
      const filePath = path.join(EXPORT_DIR, filename);
      fs.writeFileSync(filePath, payload);
      console.log('\x1b[32m%s\x1b[0m', `💾 SAVED TO: ${filePath}`);

      // Preview (if text)
      const contentType = req.headers['content-type'];
      if (contentType.includes('json') || contentType.includes('xml')) {
        console.log('\x1b[34m%s\x1b[0m', '--- PAYLOAD PREVIEW ---');
        console.log(payload.toString().substring(0, 500) + '...');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'SUCCESS', received: true }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log('\x1b[1m%s\x1b[0m', '🚀 MOCK BANK DESTINATION RUNNING');
  console.log('URL: \x1b[36mhttp://localhost:9000/webhook\x1b[0m');
  console.log('Secret: \x1b[36mtest_secret_123\x1b[0m');
  console.log('Listening for data...');
});
