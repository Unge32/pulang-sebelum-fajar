// Pulang Sebelum Fajar — main loop, state machine, district flow, debug hook.
// Original code written for this game from its spec: Dito and the Senja gang
// fight home across five districts of Kota Karsa before dawn.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  var scene, camera, renderer, clock;
  var player = null, allies = [];
  var S = {
    state: 'title', district: 0, wave: 0, enemies: [],
    command: 'ikut', exitActive: false, objective: 'Kalahkan semua musuh!',
    time: 0, waveDelay: 0,
  };

  function lights() {
    scene.add(new THREE.AmbientLight(0x445066, 0.9));
    var moon = new THREE.DirectionalLight(0xbfd0ff, 0.9);
    moon.position.set(-6, 14, 6); moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    scene.add(moon);
    var warm = new THREE.PointLight(0xff9c3f, 0.7, 20);
    warm.position.set(0, 4, 0); scene.add(warm);
  }

  function clearEnemies() {
    S.enemies.forEach(function (e) { scene.remove(e.mesh); });
    S.enemies = [];
  }

  function spawnWave(n) {
    var kinds = PF.DISTRICTS[S.district].waves[n];
    kinds.forEach(function (kind, i) {
      var x = 5 + PF.rng() * 5, z = -5 + PF.rng() * 10;
      S.enemies.push(PF.spawnEnemy(scene, kind, S.district, x, z));
    });
    S.objective = 'Kalahkan semua musuh!';
    PF.hud.toast('Gelombang ' + (n + 1) + ' — ' + PF.DISTRICTS[S.district].name);
  }

  function setDistrict(i) {
    S.district = i; S.wave = 0; S.exitActive = false;
    clearEnemies();
    PF.combat.clearField(scene);
    PF.world.build(i);
    player.x = -9; player.z = 0; player.hp = Math.min(player.maxHp, player.hp + 15);
    player.weapon = null; player.combo = 0; player.rage = Math.max(0, player.rage);
    allies.forEach(function (a, j) {
      a.x = -9; a.z = (j === 0 ? -1.6 : 1.6); a.hp = a.maxHp; a.down = false;
      a.mesh.rotation.x = 0; a.mesh.position.y = 0;
    });
    // a weapon and a jamu lying around each district
    var wtypes = ['bat', 'bottle', 'chain'];
    PF.combat.spawnWeapon(scene, wtypes[i % 3], -4 + PF.rng() * 3, -3 + PF.rng() * 6);
    PF.combat.spawnPickup(scene, 'jamu', 2 + PF.rng() * 4, -4 + PF.rng() * 8);
    spawnWave(0);
    PF.hud.update(S);
  }

  PF.onEnemyKilled = function (e) {
    if (e.dead) return;
    e.dead = true; e.mesh.visible = false;
    PF.combat.score += e.score;
    PF.audio.enemyDown();
    if (PF.rng() < 0.45) PF.combat.spawnCoin(scene, e.x, e.z);
    else if (PF.rng() < 0.12) PF.combat.spawnPickup(scene, 'jamu', e.x, e.z);
    if (e.kind === 'boss') { winGame(); return; }
    var alive = S.enemies.filter(function (x) { return !x.dead; });
    if (alive.length === 0) {
      var waves = PF.DISTRICTS[S.district].waves;
      if (S.wave < waves.length - 1) {
        S.wave += 1; S.waveDelay = 1.0;
        S.objective = 'Gelombang berikutnya datang...';
      } else {
        S.exitActive = true;
        S.objective = 'Masuk ke penanda keluar!';
        PF.world.showExit(true);
        PF.hud.toast('Jalan terbuka — lari ke penanda emas!');
      }
    }
  };

  function nextDistrict() {
    if (S.district >= 4) { winGame(); return; }
    PF.world.showExit(false);
    setDistrict(S.district + 1);
    PF.hud.toast('Distrik ' + (S.district + 1) + '/5: ' + PF.DISTRICTS[S.district].name);
  }

  function winGame() {
    if (S.state !== 'playing') return;
    S.state = 'win';
    PF.combat.score += Math.floor(player.hp) * 5 + PF.combat.coins * 10;
    document.getElementById('win-score').textContent =
      'Skor: ' + PF.combat.score + '  •  Koin: ' + PF.combat.coins + '  •  HP tersisa: ' + Math.ceil(player.hp);
    PF.showScreen('win-screen');
    PF.hud.show(false);
    PF.audio.win();
  }

  function deathGame() {
    if (S.state !== 'playing') return;
    S.state = 'dead';
    PF.showScreen('death-screen');
    PF.hud.show(false);
    PF.audio.lose();
  }

  function startGame() {
    PF.combat.coins = 0; PF.combat.score = 0;
    player.hp = player.maxHp; player.rage = 0; player.amuk = 0; player.weapon = null;
    player.combo = 0;
    S.command = 'ikut'; S.state = 'playing';
    PF.showScreen(null);
    PF.hud.show(true);
    PF.audio.unlock(); PF.audio.startAmbience();
    setDistrict(0);
    PF.hud.toast('Pulang sebelum fajar — lawan mereka semua!');
  }

  function toTitle() {
    S.state = 'title';
    clearEnemies();
    PF.combat.clearField(scene);
    PF.world.build(0);
    PF.world.showExit(false);
    player.x = -9; player.z = 0; player.hp = player.maxHp;
    player.mesh.position.set(-9, 0, 0);
    allies.forEach(function (a, j) { a.x = -9; a.z = j === 0 ? -1.6 : 1.6; a.hp = a.maxHp; a.down = false; a.mesh.rotation.x = 0; });
    PF.showScreen('title-screen');
    PF.hud.show(false);
  }

  PF.game = {
    startGame: startGame, toTitle: toTitle, setDistrict: setDistrict,
    debugSpawn: function (kind) {
      var e = PF.spawnEnemy(scene, kind || 'grunt', S.district, 3 + PF.rng() * 4, -3 + PF.rng() * 6);
      S.enemies.push(e); return S.enemies.length;
    },
    teleportPlayer: function (x, z) { player.x = x; player.z = z; player.mesh.position.set(x, 0, z); },
    state: function () { return S; },
  };

  function update(dt) {
    S.time += dt;
    PF.world.tick(S.time);
    if (S.state === 'paused') {
      if (PF.input.hit('KeyP') || PF.input.hit('Escape')) {
        S.state = 'playing'; PF.showScreen(null);
      }
      return;
    }
    if (S.state !== 'playing') return;

    // one-shot keys
    if (PF.input.hit('KeyP') || PF.input.hit('Escape')) {
      S.state = 'paused'; PF.showScreen('pause-screen'); return;
    }
    if (PF.input.hit('KeyQ')) {
      S.command = S.command === 'ikut' ? 'serbu' : 'ikut';
      PF.hud.toast(S.command === 'serbu' ? 'Serbu! Serang musuh terdekat!' : 'Ikut! Tetap di dekat Dito.');
    }
    if (PF.input.hit('KeyE') && PF.playerTryAmuk(player)) {
      PF.audio.roar(); PF.hud.toast('AMUK! Seranganmu berlipat ganda!');
    }
    if (PF.input.hit('Space')) PF.playerDodge(player);
    if (PF.input.hit('KeyF')) {
      var got = PF.combat.tryPickupWeapon(scene, player);
      if (got) PF.hud.toast('Dapat ' + PF.WEAPONS[got].label + '!');
    }
    if (PF.input.hit('KeyJ') || PF.input.hit('Mouse0')) {
      var atk = PF.playerTryAttack(player, 'punch');
      if (atk) PF.combat.playerAttack(scene, player, S.enemies, atk);
    }
    if (PF.input.hit('KeyK')) {
      var atk2 = PF.playerTryAttack(player, 'kick');
      if (atk2) PF.combat.playerAttack(scene, player, S.enemies, atk2);
    }

    PF.playerUpdate(player, dt, PF.input);
    var targets = [Object.assign({ isPlayer: true }, player)].concat(allies);
    // note: player object itself is the target; keep a live reference
    targets[0] = player; player.isPlayer = true;
    S.enemies.forEach(function (e) { PF.enemyUpdate(e, dt, targets); });
    PF.alliesUpdate(allies, dt, player, S.enemies, S.command);
    PF.combat.updatePickups(scene, player, dt, S.time);

    if (S.waveDelay > 0) {
      S.waveDelay -= dt;
      if (S.waveDelay <= 0) spawnWave(S.wave);
    }
    if (S.exitActive) {
      var ex = PF.world.exitPos();
      if (Math.hypot(ex.x - player.x, ex.z - player.z) < 1.7) nextDistrict();
    }
    if (player.hp <= 0) deathGame();
    PF.hud.update(S);
  }

  function loop() {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, clock.getDelta());
    update(dt);
    // camera: follow Dito, angled top-down; slow drift on title screen
    var cx = player ? player.x : 0, cz = player ? player.z : 0;
    if (S.state === 'title') {
      camera.position.set(Math.sin(S.time * 0.1) * 6, 13, 11);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(cx * 0.55, 13.5, cz * 0.4 + 10.5);
      camera.lookAt(cx * 0.7, 0, cz * 0.5);
    }
    renderer.render(scene, camera);
  }

  function boot() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0e18);
    scene.fog = new THREE.Fog(0x0b0e18, 18, 46);
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.domElement.id = 'game-canvas';
    document.getElementById('game-root').appendChild(renderer.domElement);
    clock = new THREE.Clock();
    PF.world.init(scene);
    lights();
    player = PF.createPlayer(scene);
    player.isPlayer = true;
    allies = PF.createAllies(scene);
    S.allies = allies; S.player = player; S.enemies = S.enemies;
    PF.hud.init();
    PF.world.build(0);
    PF.showScreen('title-screen');
    document.getElementById('start-btn').addEventListener('click', function () { startGame(); });
    document.getElementById('win-restart').addEventListener('click', function () { startGame(); });
    document.getElementById('death-retry').addEventListener('click', function () { startGame(); });
    document.getElementById('pause-resume').addEventListener('click', function () {
      S.state = 'playing'; PF.showScreen(null);
    });
    window.addEventListener('keydown', function (e) {
      if (e.code === 'Enter' && S.state === 'title') startGame();
      if (e.code === 'KeyR' && (S.state === 'win' || S.state === 'dead')) startGame();
    });
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.__pulangFajar = {
      state: function () {
        return {
          screen: S.state, district: S.district, districtName: PF.DISTRICTS[S.district].name,
          wave: S.wave, enemiesAlive: S.enemies.filter(function (e) { return !e.dead; }).length,
          playerHp: Math.round(player.hp), playerX: +player.x.toFixed(2), playerZ: +player.z.toFixed(2),
          combo: player.combo, rage: Math.round(player.rage), amuk: player.amuk > 0,
          blocking: player.blocking, weapon: player.weapon ? player.weapon.type : null,
          coins: PF.combat.coins, score: PF.combat.score, exitActive: S.exitActive,
          command: S.command,
          allies: allies.map(function (a) { return { name: a.name, hp: Math.round(a.hp), x: +a.x.toFixed(2), z: +a.z.toFixed(2), down: a.down }; }),
        };
      },
      start: startGame, toTitle: toTitle,
      despawnEnemies: function () {
        S.enemies.forEach(function (e) { scene.remove(e.mesh); });
        S.enemies = []; return 0;
      },
      spawnNear: function (kind) {
        var e = PF.spawnEnemy(scene, kind || 'grunt', S.district, player.x + 1.2, player.z);
        S.enemies.push(e); return S.enemies.length;
      },
      nearestEnemy: function () {
        var best = null, bestD = 1e9;
        S.enemies.forEach(function (e) {
          if (e.dead) return;
          var d = Math.hypot(e.x - player.x, e.z - player.z);
          if (d < bestD) { bestD = d; best = e; }
        });
        return best ? { kind: best.kind, hp: best.hp, x: +best.x.toFixed(2), z: +best.z.toFixed(2) } : null;
      },
      hitPlayer: function (n) { PF.playerHurt(player, n); return Math.round(player.hp); },
      dropWeapon: function (type) { PF.combat.spawnWeapon(scene, type || 'bat', player.x + 0.8, player.z); return true; },
      dropCoin: function () { PF.combat.spawnCoin(scene, player.x, player.z); return true; },
      dropJamu: function () { PF.combat.spawnPickup(scene, 'jamu', player.x, player.z); return true; },
      setCoins: function (n) { PF.combat.coins = n; return PF.combat.coins; },
      setDistrict: function (i) { setDistrict(i); return S.district; },
      damagePlayer: function (n) { player.hp = Math.max(0, player.hp - n); return Math.round(player.hp); },
      healPlayer: function (n) { player.hp = Math.min(player.maxHp, player.hp + n); return Math.round(player.hp); },
      clearWave: function () {
        S.enemies.forEach(function (e) { if (!e.dead) PF.onEnemyKilled(e); });
        return S.enemies.filter(function (e) { return !e.dead; }).length;
      },
      toWin: function () { S.enemies.forEach(function (e) { if (e.kind === 'boss' && !e.dead) PF.onEnemyKilled(e); }); winGame(); },
      toDeath: function () { player.hp = 0; deathGame(); },
      teleport: function (x, z) { PF.game.teleportPlayer(x, z); },
      setRage: function (n) { player.rage = n; return player.rage; },
      pause: function () { if (S.state === 'playing') { S.state = 'paused'; PF.showScreen('pause-screen'); } return S.state; },
      resume: function () { if (S.state === 'paused') { S.state = 'playing'; PF.showScreen(null); } return S.state; },
    };
    window.__gameReady = true;
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
