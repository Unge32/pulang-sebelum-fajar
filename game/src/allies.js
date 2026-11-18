// Pulang Sebelum Fajar — Bimo and Sari: follow Dito, fight nearby enemies.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  PF.createAllies = function (scene) {
    return PF.ALLIES.map(function (cfg, i) {
      var mesh = PF.makeFighter(cfg.color, 0.95, cfg.name);
      scene.add(mesh);
      var a = {
        name: cfg.name, mesh: mesh, color: cfg.color,
        x: -9, z: (i === 0 ? -1.6 : 1.6), hp: 60, maxHp: 60,
        dmg: cfg.dmg, speed: cfg.speed, attackCd: 0,
        down: false, downTimer: 0, walkPhase: PF.rng() * 6,
      };
      mesh.position.set(a.x, 0, a.z);
      return a;
    });
  };

  PF.allyHurt = function (a, dmg) {
    if (a.down) return;
    a.hp = Math.max(0, a.hp - dmg);
    if (a.hp <= 0) { a.down = true; a.downTimer = 10; a.mesh.rotation.x = Math.PI / 2; a.mesh.position.y = 0.4; }
  };

  PF.alliesUpdate = function (allies, dt, player, enemies, command) {
    allies.forEach(function (a, i) {
      if (a.down) {
        a.downTimer -= dt;
        if (a.downTimer <= 0) {
          a.down = false; a.hp = 30;
          a.mesh.rotation.x = 0; a.mesh.position.y = 0;
          a.x = player.x - 1; a.z = player.z + (i === 0 ? -1 : 1);
        }
        return;
      }
      a.attackCd = Math.max(0, a.attackCd - dt);
      // find nearest living enemy
      var best = null, bestD = 1e9;
      enemies.forEach(function (e) {
        if (e.dead) return;
        var d = Math.hypot(e.x - a.x, e.z - a.z);
        if (d < bestD) { bestD = d; best = e; }
      });
      var tx, tz;
      if (command === 'serbu' && best) { tx = best.x; tz = best.z; }
      else {
        tx = player.x - 1.2; tz = player.z + (i === 0 ? -1.4 : 1.4);
        if (best && bestD < 2.2) { tx = best.x; tz = best.z; }
      }
      var dx = tx - a.x, dz = tz - a.z;
      var dist = Math.hypot(dx, dz);
      if (dist > 0.25) {
        var step = Math.min(dist, a.speed * dt);
        a.x += (dx / dist) * step; a.z += (dz / dist) * step;
        a.walkPhase += dt * 9;
        a.mesh.rotation.y = Math.atan2(dx, dz);
      }
      a.x = Math.max(-PF.ARENA.halfX, Math.min(PF.ARENA.halfX, a.x));
      a.z = Math.max(-PF.ARENA.halfZ, Math.min(PF.ARENA.halfZ, a.z));
      a.mesh.position.set(a.x, Math.abs(Math.sin(a.walkPhase)) * 0.05, a.z);
      if (best && bestD <= 1.5 && a.attackCd <= 0) {
        a.attackCd = 0.9;
        var arm = a.mesh.getObjectByName('armR');
        if (arm) arm.rotation.x = -1.6;
        if (PF.enemyHurt(best, a.dmg)) PF.onEnemyKilled(best);
        else PF.audio.punch();
      }
    });
  };
})();
