# Pulang Sebelum Fajar

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/Unge32/pulang-sebelum-fajar/rank.svg)](https://make.fun/bounty/best-game-01)
[![reward](https://make.fun/badge/best-game-01/Unge32/pulang-sebelum-fajar/reward.svg)](https://make.fun/bounty/best-game-01)

Entry for [make.fun's "Make the best game" bounty](https://make.fun/bounty/best-game-01) ($1000 in USDC).

## The game

**Pulang Sebelum Fajar** (Home Before Dawn) is an original PS2-era 3D street-gang
brawler. After a gang summit at the old depot turns into a frame-up, Dito — leader
of the Senja gang — is blamed for an attack he did not commit. Every rival gang in
the fictional city of Kota Karsa is now hunting Senja. Dito and his crew, Bimo and
Sari, must fight their way home across 5 districts before dawn — and face Guntur,
leader of the Serigala, on their own turf.

- 5 districts, each its own arena: Stasiun, Jalan Merdeka, Pasar Senja, Atap Kota, Gang Senja
- Beat-'em-up combat: punch, kick, block, dodge roll, combos, and an Amuk (rage) mode
- Pick-up weapons: bat, bottle, chain — plus jamu (health) and coins
- Allies Bimo and Sari fight beside you; press Q to switch their orders (Ikut / Serbu)
- Rival gangs: Serigala, Ular Pasar, Elang Atap — grunts, heavies, runners, and boss Guntur
- Low-poly night city, fog, synthesized WebAudio SFX — no audio files, no network

## Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| J / click | Punch |
| K | Kick (longer reach) |
| L (hold) | Block (−70% damage) |
| Space | Dodge roll (brief invulnerability) |
| F | Pick up weapon |
| E | Amuk mode (when the meter is full) |
| Q | Ally orders: Ikut / Serbu |
| P / Esc | Pause |
| R | Restart (win / death screen) |

## Play

```sh
node serve.ts
# open http://localhost:8080
```

Built with Three.js r149, vendored locally under `game/vendor/three.min.js`.
The game runs fully offline — no CDN, no external requests.

## License

MIT — see [LICENSE](LICENSE).
