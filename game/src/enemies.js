// Pulang Sebelum Fajar — rival gang fighters: grunt / heavy / runner / boss.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  function gangColor(kind, district) {
    if (kind === 'boss') return PF.GANG_COLORS.Guntur;
    var rival = PF.DISTRICTS[district].rival;
    if (rival.indexOf('Ular') !== -1 && rival.indexOf('Serigala') === -1) return PF.GANG_COLORS['Ular Pasar'];
    if (rival.indexOf('Elang') !== -1) return PF.GANG_COLORS['Elang Atap'];
    if (kind === 'runner') return PF.GANG_COLORS['Elang Atap'];
    if (kind === 'heavy') return PF.GANG_COLORS['Ular Pasar'];
    return PF.GANG_COLORS.Serigala;
  }

  PF.spawnEnemy = function (scene, kind, district, x, z) {
    var cfg = PF.ENEMIES[kind];
    var label = kind === 'boss' ? 'Guntur' : kind;
    var mesh = PF.makeFighter(gangColor(kind, district), cfg.scale, label);
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    return {
      kind: kind, mesh: mesh, x: x, z: z,
      hp: cfg.hp, maxHp: cfg.hp, speed: cfg.speed, dmg: cfg.dmg,
      reach: cfg.reach, score: cfg.score,
      windup: 0, attackCd: 0.5 + PF.rng() * 0.8, flash: 0, dead: false,
    };
  };

  // Chase the nearest living target (Dito or an ally), telegraph, then punch.
  PF.enemyUpdate = function (e, dt, targets) {
    if (e.dead) return;
    e.attackCd = Math.max(0, e.attackCd - dt);
    e.flash = Math.max(0, e.flash - dt);
    var best = null, bestD = 1e9;
    targets.forEach(function (t) {
      if (t.hp <= 0 || t.down) return;
      var d = Math.hypot(t.x - e.x, t.z - e.z);
      if (d < bestD) { bestD = d; best = t; }
    });
    if (!best) return;
    var dx = best.x - e.x, dz = best.z - e.z;
    var dist = Math.hypot(dx, dz) || 0.001;
    e.mesh.rotation.y = Math.atan2(dx, dz);
    if (e.windup > 0) {
      e.windup -= dt;
      // telegraph: lean back, flash red-ish by scaling the head
      e.mesh.position.y = Math.sin(e.windup * 20) * 0.05;
      if (e.windup <= 0) {
        if (dist <= e.reach + 0.5) {
          if (best.isPlayer) PF.playerHurt(best, e.dmg);
          else PF.allyHurt(best, e.dmg);
          PF.audio.hurt();
        }
        e.attackCd = 1.0 + PF.rng() * 0.6;
      }
    } else if (dist > e.reach) {
      e.x += (dx / dist) * e.speed * dt;
      e.z += (dz / dist) * e.speed * dt;
      e.x = Math.max(-PF.ARENA.halfX, Math.min(PF.ARENA.halfX, e.x));
      e.z = Math.max(-PF.ARENA.halfZ, Math.min(PF.ARENA.halfZ, e.z));
    } else if (e.attackCd <= 0) {
      e.windup = 0.45; // visible telegraph before the hit lands
    }
    e.mesh.position.set(e.x, e.flash > 0 ? 0.1 : 0, e.z);
    var m = e.mesh.children[0].material;
    if (m) m.emissive = new THREE.Color(e.windup > 0 ? 0x661111 : (e.flash > 0 ? 0x333333 : 0x000000));
  };

  PF.enemyHurt = function (e, dmg) {
    e.hp -= dmg; e.flash = 0.15;
    return e.hp <= 0;
  };
})();
