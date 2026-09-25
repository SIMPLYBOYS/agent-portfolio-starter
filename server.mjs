import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
import { loadEnvFile } from 'node:process';

try { loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url))); }
catch (error) { if (error.code !== 'ENOENT') throw error; }

const root = fileURLToPath(new URL('./public/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf' };

createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method not allowed');
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== resolve(root) && !file.startsWith(root.endsWith(sep) ? root : root + sep)) {
      res.writeHead(403); return res.end('Forbidden');
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const data = await readFile(file);
    const headers = {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes',
      'Content-Length': data.length,
    };
    // Safari and native video seeking request byte ranges.
    if (req.method === 'GET' && req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      let start = match?.[1] ? Number(match[1]) : 0;
      let end = match?.[2] ? Number(match[2]) : data.length - 1;
      if (match && !match[1] && match[2]) {
        start = Math.max(0, data.length - Number(match[2]));
        end = data.length - 1;
      }
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= data.length) {
        res.writeHead(416, { 'Content-Range': `bytes */${data.length}` });
        return res.end();
      }
      end = Math.min(end, data.length - 1);
      res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${data.length}` });
      return res.end(data.subarray(start, end + 1));
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}).listen(port, host, () => console.log(`Portfolio → http://${host}:${port}`));
