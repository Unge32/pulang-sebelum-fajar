// Pulang Sebelum Fajar — entrypoint for make.fun best-game-01.
//
// This is an original PS2-era 3D street brawler: Dito, leader of the Senja
// gang, is framed at a gang summit and must fight his way home across five
// districts of the fictional city Kota Karsa before dawn, with allies Bimo
// and Sari at his side. Five arenas, three rival gangs, a rage (Amuk) mode,
// pick-up weapons, combos and a boss fight against Guntur.
//
// The game itself is plain static files under game/ (Three.js r149 vendored
// locally, classic script tags, no network at runtime). This script only
// stages the entry: it refuses to run if game/index.html is missing, copies
// game/ and screenshots/ into the output directory, then writes the
// deterministic dossier.json the judge reads via the vendored make.fun lib.
//
// Run locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Play locally with: node serve.ts   (then open the printed address)

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const gameEntry = join(repoRoot, 'game', 'index.html');
if (!existsSync(gameEntry)) {
  throw new Error('Pulang Sebelum Fajar: game/index.html is missing at ' + gameEntry);
}
const marker = readFileSync(gameEntry, 'utf8');
if (!marker.includes('PULANG SEBELUM FAJAR')) {
  throw new Error('Pulang Sebelum Fajar: game/index.html does not look like this game');
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps the scorer enforces: 4 screenshots max, 256 KiB each; game/ under
// 993 files and 48 MiB total; no game path over 1000 bytes; text budget
// 160 KiB. Same caps as the kit starter's reference gate.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('dossier written to ' + join(outDir, 'dossier.json'));
