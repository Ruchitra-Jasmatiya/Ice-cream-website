// Local API server for development:  npm run api   (Vite proxies /api -> :3001)
import http from 'node:http';
import handler from './app.js';
const port = Number(process.env.API_PORT || 3001);
http.createServer((req, res) => handler(req, res)).listen(port, () => console.log(`API ready on http://localhost:${port}/api/health`));
