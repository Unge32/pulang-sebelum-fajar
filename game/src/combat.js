// Pulang Sebelum Fajar — hits, combos, weapons, pickups, coins.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  PF.combat = {
    weaponsOnGround: [],
    pickups: [],
    coins: 0,
    score: 0,

    clearField: function (scene) {
      var self = this;
      this.weaponsOnGround.forEach(function (w) { scene.remove(w.mesh); });
      this.pickups.forEach(function (p) { scene.remove(p.mesh); });
      this.weaponsOnGround = []; this.pickups = [];
    },

    spawnWeapon: function (scene, type, x, z) {
      var w = PF.WEAPONS[type];
      var mesh = new THREE.Group();
      var mat = new THREE.MeshLambertMaterial({ color: w.color });
      var geo = type === 'bottle'
        ? new THREE.CylinderGeometry(0.16, 0.2, 0.7, 8)
        : new THREE.BoxGeometry(type === 'bat' ? 0.18 : 0.12, 1.1, 0.18);
      var m = new THREE.Mesh(geo, mat);
      m.position.y = 0.5; m.rotation.z = Math.PI / 2.4; m.castShadow = true;
      mesh.add(m);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 8, 20),
        new THREE.MeshBasicMaterial({ color: 0xffd27a }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; mesh.add(ring);
      mesh.position.set(x, 0, z);
      scene.add(mesh);
      this.weaponsOnGround.push({ type: type, mesh: mesh, x: x, z: z });
    },

    spawnPickup: function (scene, kind, x, z) {
      var color = kind === 'jamu' ? 0xe05252 : 0xffd24a;
      var mesh = new THREE.Mesh(
        kind === 'jamu' ? new THREE.CylinderGeometry(0.3, 0.3, 0.6, 10)
          : new THREE.CylinderGeometry(0.28, 0.28, 0.12, 14),
        new THREE.MeshLambertMaterial({ color: color, emissive: 0x332200 }));
      mesh.position.set(x, 0.4, z); mesh.castShadow = true;
      scene.add(mesh);
      this.pickups.push({ kind: kind, mesh: mesh, x: x, z: z });
    },

    spawnCoin: function (scene, x, z) { this.spawnPickup(scene, 'coin', x, z); },

    // Player attack: nearest enemy inside reach and roughly in front.
    playerAttack: function (scene, player, enemies, atk) {
      var best = null, bestD = 1e9;
      enemies.forEach(function (e) {
        if (e.dead) return;
        var d = Math.hypot(e.x - player.x, e.z - player.z);
        if (d < bestD && d <= atk.reach + 0.6) { bestD = d; best = e; }
      });
      if (!best) { PF.audio.punch(); return false; }
      var died = PF.enemyHurt(best, atk.dmg);
      player.combo += 1; player.comboTimer = PF.PLAYER.comboWindow;
      player.rage = Math.min(100, player.rage + 8);
      // knockback away from Dito
      var dx = best.x - player.x, dz = best.z - player.z;
      var len = Math.hypot(dx, dz) || 1;
      best.x += (dx / len) * 0.5; best.z += (dz / len) * 0.5;
      if (atk.kind === 'kick') PF.audio.kick(); else PF.audio.punch();
      if (player.weapon) {
        player.weapon.dur -= 1;
        if (player.weapon.dur <= 0) { player.weapon = null; }
      }
      if (died) PF.onEnemyKilled(best);
      return true;
    },

    tryPickupWeapon: function (scene, player) {
      for (var i = 0; i < this.weaponsOnGround.length; i++) {
        var w = this.weaponsOnGround[i];
        if (Math.hypot(w.x - player.x, w.z - player.z) < 1.4) {
          var def = PF.WEAPONS[w.type];
          player.weapon = { type: w.type, label: def.label, dmg: def.dmg, dur: def.dur, reach: def.reach };
          scene.remove(w.mesh);
          this.weaponsOnGround.splice(i, 1);
          PF.audio.pickup();
          return w.type;
        }
      }
      return null;
    },

    updatePickups: function (scene, player, dt, t) {
      var self = this;
      this.pickups.forEach(function (p) {
        p.mesh.rotation.y = t * 2;
        p.mesh.position.y = 0.4 + Math.sin(t * 3 + p.x) * 0.08;
      });
      for (var i = this.pickups.length - 1; i >= 0; i--) {
        var p = this.pickups[i];
        if (Math.hypot(p.x - player.x, p.z - player.z) < 1.1) {
          if (p.kind === 'coin') { self.coins += 1; self.score += 10; PF.audio.coin(); }
          else if (p.kind === 'jamu') { player.hp = Math.min(player.maxHp, player.hp + 30); PF.audio.pickup(); }
          scene.remove(p.mesh);
          this.pickups.splice(i, 1);
        }
      }
      this.weaponsOnGround.forEach(function (w) {
        w.mesh.children[1].rotation.z = t * 1.5;
      });
    },
  };
})();
