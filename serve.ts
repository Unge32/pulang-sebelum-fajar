// Pulang Sebelum Fajar — dev server for game/ on :8080 (Node stdlib only).
// Usage: node serve.ts [--port 8080]  — serves only files inside game/.
// Nothing here is production hosting; it exists so the game can be played
// and screenshotted locally without a build step.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameDir = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const portArg = process.argv.indexOf('--port');
const port = portArg >= 0 ? Number(process.argv[portArg + 1]) || 8080 : 8080;

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

function safePath(raw: string): string | null {
  let path = raw.split('?')[0];
  try { path = decodeURIComponent(path); } catch { return null; }
  if (path.endsWith('/')) path += 'index.html';
  const full = resolve(join(gameDir, path));
  if (full !== gameDir && !full.startsWith(gameDir + sep)) return null;
  return full;
}

createServer(async (req, res) => {
  const file = safePath(req.url ?? '/');
  if (!file) { res.writeHead(400).end('bad path'); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      'content-type': types.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
      'content-length': data.length,
      'cache-control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log('Pulang Sebelum Fajar on port ' + port + ' — game/ served locally');
});
