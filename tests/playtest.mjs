// Pulang Sebelum Fajar — headless Playwright playtest.
// Starts serve.ts on :8080, drives the game, asserts mechanics, and requires
// zero console errors and zero failed requests.
// Run: node tests/playtest.mjs   (playwright-core + system chromium)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exe = process.env.CHROME_PATH || (process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');

let pass = 0, fail = 0;
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (extra ? ' — ' + extra : '')); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function poll(fn, ms = 5000, step = 250) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await fn()) return true; await sleep(step); }
  return false;
}

const server = spawn('node', ['serve.ts', '--port', '8080'], { cwd: root, stdio: 'pipe' });
await sleep(1500);

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [], failedReqs = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => failedReqs.push(r.url()));

try {
  await page.goto('http://localhost:8080/', { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => window.__gameReady, null, { timeout: 15000 });
  check('game loads, __gameReady set', true);

  check('title screen visible', await page.isVisible('#title-screen'));

  // start
  await page.click('#start-btn');
  await sleep(500);
  let st = await page.evaluate(() => window.__pulangFajar.state());
  check('start -> playing, district 1 Stasiun', st.screen === 'playing' && st.district === 0 && st.districtName === 'Stasiun', JSON.stringify(st));

  // move right
  const x0 = st.playerX;
  await page.keyboard.down('KeyD');
  await sleep(600);
  await page.keyboard.up('KeyD');
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('WASD moves Dito right', st.playerX > x0 + 0.5, 'x ' + x0 + ' -> ' + st.playerX);

  // punch damages enemy
  await page.evaluate(() => window.__pulangFajar.spawnNear('grunt'));
  await sleep(200);
  let en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  const hpBefore = en.hp;
  await page.keyboard.press('KeyJ');
  await sleep(300);
  en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  check('punch (J) damages enemy', en && en.hp < hpBefore, 'hp ' + hpBefore + ' -> ' + (en && en.hp));

  // kick damages (longer reach)
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  await page.evaluate(() => window.__pulangFajar.spawnNear('grunt'));
  await sleep(300);
  en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  const hpB2 = en.hp;
  const kickHit = await poll(async () => {
    await page.keyboard.press('KeyK');
    await sleep(500);
    const e2 = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
    return e2 && e2.hp < hpB2;
  }, 6000);
  en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  check('kick (K) damages enemy', kickHit, 'hp ' + hpB2 + ' -> ' + (en && en.hp));

  // block reduces damage
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  await page.evaluate(() => window.__pulangFajar.healPlayer(100));
  await sleep(700);
  await page.keyboard.down('KeyL');
  await sleep(100);
  let hpBlocked = await page.evaluate(() => window.__pulangFajar.hitPlayer(10));
  await page.keyboard.up('KeyL');
  const hpAfterBlock = await page.evaluate(() => window.__pulangFajar.state().playerHp);
  // invulnerability is in game-time, which runs slower than real time under
  // SwiftShader: poll until a hit actually lands.
  let hpAfterOpen = hpAfterBlock;
  await poll(async () => {
    hpAfterOpen = await page.evaluate(() => window.__pulangFajar.hitPlayer(10));
    return hpAfterOpen < hpAfterBlock;
  }, 6000);
  const hpOpen = hpAfterOpen;
  check('block (L) reduces damage 70%', (100 - hpAfterBlock) === 3 && (hpAfterBlock - hpAfterOpen) === 10,
    'blocked lost ' + (100 - hpAfterBlock) + ', open lost ' + (hpAfterBlock - hpAfterOpen));

  // dodge grants invulnerability
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  await page.keyboard.press('Space');
  await sleep(80);
  const hpDodge = await page.evaluate(() => window.__pulangFajar.hitPlayer(10));
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('dodge (Space) avoids damage', hpDodge === st.playerHp && hpDodge === hpAfterOpen, 'hp ' + hpDodge);

  // weapon pickup + use
  await page.evaluate(() => window.__pulangFajar.dropWeapon('bat'));
  await sleep(200);
  await page.keyboard.press('KeyF');
  await sleep(300);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('weapon pickup (F) equips bat', st.weapon === 'bat', 'weapon=' + st.weapon);
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  await page.evaluate(() => window.__pulangFajar.spawnNear('grunt'));
  await sleep(300);
  en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  const hpB3 = en.hp;
  const wHit = await poll(async () => {
    await page.keyboard.press('KeyJ');
    await sleep(500);
    const e2 = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
    return !e2 || e2.hp <= hpB3 - 3;
  }, 6000);
  en = await page.evaluate(() => window.__pulangFajar.nearestEnemy());
  check('weapon hit damages enemy (3 dmg)', wHit, 'hp ' + hpB3 + ' -> ' + (en && en.hp));

  // enemy death: kill a grunt, score must rise
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  const score0 = (await page.evaluate(() => window.__pulangFajar.state())).score;
  await page.evaluate(() => window.__pulangFajar.spawnNear('grunt'));
  await sleep(300);
  const died = await poll(async () => {
    await page.keyboard.press('KeyJ');
    await sleep(500);
    const s2 = await page.evaluate(() => window.__pulangFajar.state());
    return s2.score > score0;
  }, 8000);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('enemy death raises score', died, 'score=' + score0 + ' -> ' + st.score);

  // coin pickup
  const coins0 = st.coins;
  await page.evaluate(() => window.__pulangFajar.dropCoin());
  await sleep(400);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('coin pickup +1 coin', st.coins === coins0 + 1, 'coins ' + coins0 + ' -> ' + st.coins);

  // jamu heals
  await page.evaluate(() => window.__pulangFajar.damagePlayer(20));
  await sleep(700);
  const hpHurt = (await page.evaluate(() => window.__pulangFajar.state())).playerHp;
  await page.evaluate(() => window.__pulangFajar.dropJamu());
  await sleep(400);
  const hpHealed = (await page.evaluate(() => window.__pulangFajar.state())).playerHp;
  check('jamu heals +30 HP', hpHealed > hpHurt, hpHurt + ' -> ' + hpHealed);

  // allies follow Dito (poll: game-time runs slower than real time here)
  await page.evaluate(() => window.__pulangFajar.despawnEnemies());
  await page.evaluate(() => window.__pulangFajar.teleport(8, 4));
  const allyNear = await poll(async () => {
    st = await page.evaluate(() => window.__pulangFajar.state());
    return st.allies.every((a) => Math.hypot(a.x - 8, a.z - 4) < 6);
  }, 20000);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('allies follow Dito', allyNear, JSON.stringify(st.allies));

  // Amuk: fill rage, press E
  await page.evaluate(() => window.__pulangFajar.setRage(100));
  await page.keyboard.press('KeyE');
  await sleep(300);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('Amuk (E) activates at full rage', st.amuk === true, 'amuk=' + st.amuk);

  // ally command toggle
  await page.keyboard.press('KeyQ');
  await sleep(200);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('command (Q) toggles to Serbu', st.command === 'serbu', 'cmd=' + st.command);
  await page.keyboard.press('KeyQ');

  // district clear -> exit -> next district
  await page.evaluate(() => window.__pulangFajar.clearWave());
  const wave2 = await poll(async () => (await page.evaluate(() => window.__pulangFajar.state())).wave === 1, 8000);
  check('second wave spawns after first cleared', wave2, '');
  await page.evaluate(() => window.__pulangFajar.clearWave());
  const exitOpen = await poll(async () => (await page.evaluate(() => window.__pulangFajar.state())).exitActive, 6000);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('clearing all waves opens exit', exitOpen === true, 'exit=' + st.exitActive);
  await page.evaluate(() => window.__pulangFajar.teleport(10.4, 0));
  await sleep(600);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('walking into exit advances district', st.district === 1, 'district=' + st.district);

  // pause / resume
  await page.keyboard.press('KeyP');
  await sleep(300);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('pause (P) pauses', st.screen === 'paused', 'screen=' + st.screen);
  check('pause screen visible', await page.isVisible('#pause-screen'));
  await page.keyboard.press('KeyP');
  await sleep(300);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('pause (P) resumes', st.screen === 'playing', 'screen=' + st.screen);

  // win screen
  await page.evaluate(() => window.__pulangFajar.setDistrict(4));
  await sleep(400);
  await page.evaluate(() => window.__pulangFajar.toWin());
  await sleep(400);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('boss defeat -> win screen', st.screen === 'win' && (await page.isVisible('#win-screen')), 'screen=' + st.screen);

  // restart from win with R
  await page.keyboard.press('KeyR');
  await sleep(500);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('restart (R) from win starts district 1', st.screen === 'playing' && st.district === 0, 'screen=' + st.screen + ' d=' + st.district);

  // death screen
  await page.evaluate(() => window.__pulangFajar.toDeath());
  await sleep(400);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('HP 0 -> death screen', st.screen === 'dead' && (await page.isVisible('#death-screen')), 'screen=' + st.screen);

  // restart from death with R
  await page.keyboard.press('KeyR');
  await sleep(500);
  st = await page.evaluate(() => window.__pulangFajar.state());
  check('restart (R) from death', st.screen === 'playing' && st.district === 0, 'screen=' + st.screen);

  check('zero console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('zero failed requests', failedReqs.length === 0, failedReqs.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('FAIL  exception: ' + (e && e.message));
} finally {
  await browser.close();
  server.kill();
}

console.log('\n' + pass + '/' + (pass + fail) + ' checks passed');
process.exit(fail ? 1 : 0);
