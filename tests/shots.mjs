// Pulang Sebelum Fajar — take the 4 screenshots (1280x720 JPG) for the entry.
// Run: node tests/shots.mjs   (playwright-core + system chromium)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { statSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exe = process.env.CHROME_PATH || (process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = spawn('node', ['serve.ts', '--port', '8080'], { cwd: root, stdio: 'pipe' });
await sleep(1500);
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

try {
  await page.goto('http://localhost:8080/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => window.__gameReady, null, { timeout: 15000 });
  await sleep(1200);
  await page.screenshot({ path: join(root, 'screenshots', '1-title.jpg'), type: 'jpeg', quality: 82 });

  await page.evaluate(() => window.__pfShots.brawl());
  await sleep(900);
  await page.screenshot({ path: join(root, 'screenshots', '2-street-brawl.jpg'), type: 'jpeg', quality: 82 });

  await page.evaluate(() => window.__pfShots.market());
  await sleep(900);
  await page.screenshot({ path: join(root, 'screenshots', '3-market.jpg'), type: 'jpeg', quality: 82 });

  await page.evaluate(() => window.__pfShots.boss());
  await sleep(900);
  await page.screenshot({ path: join(root, 'screenshots', '4-boss.jpg'), type: 'jpeg', quality: 82 });

  for (const f of ['1-title.jpg', '2-street-brawl.jpg', '3-market.jpg', '4-boss.jpg']) {
    const s = statSync(join(root, 'screenshots', f));
    console.log(f, s.size + ' bytes', s.size <= 262144 ? 'OK' : 'TOO BIG');
  }
  console.log('page errors:', errors.length, errors.slice(0, 3));
} finally {
  await browser.close();
  server.kill();
}
