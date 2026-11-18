// Pulang Sebelum Fajar — Dito: move, punch, kick, block, dodge, Amuk.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  function makeFighter(color, scale, name) {
    var g = new THREE.Group();
    var mat = new THREE.MeshLambertMaterial({ color: color });
    var dark = new THREE.MeshLambertMaterial({ color: 0x222222 });
    var skin = new THREE.MeshLambertMaterial({ color: 0xc98d5f });
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.5), mat);
    body.position.y = 1.05; body.castShadow = true; g.add(body);
    var head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skin);
    head.position.y = 1.9; head.castShadow = true; g.add(head);
    var hair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.6), dark);
    hair.position.y = 2.2; g.add(hair);
    var legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.32), dark);
    legL.position.set(-0.22, 0.28, 0); g.add(legL);
    var legR = legL.clone(); legR.position.x = 0.22; g.add(legR);
    var armL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.8, 0.26), mat);
    armL.position.set(-0.6, 1.15, 0); armL.name = 'armL'; g.add(armL);
    var armR = armL.clone(); armR.name = 'armR'; armR.position.x = 0.6; g.add(armR);
    g.scale.setScalar(scale || 1);
    g.userData.fighterName = name || '';
    return g;
  }
  PF.makeFighter = makeFighter;

  PF.createPlayer = function (scene) {
    var mesh = makeFighter(PF.GANG_COLORS.Senja, 1.0, 'Dito');
    scene.add(mesh);
    var p = {
      mesh: mesh, name: 'Dito', x: -9, z: 0, facing: 0,
      hp: PF.PLAYER.hp, maxHp: PF.PLAYER.hp,
      speed: PF.PLAYER.speed, attackCd: 0, swing: 0, swingKind: '',
      combo: 0, comboTimer: 0, rage: 0, amuk: 0,
      blocking: false, dodge: 0, invuln: 0, weapon: null,
      walkPhase: 0,
    };
    mesh.position.set(p.x, 0, p.z);
    return p;
  };

  PF.playerUpdate = function (p, dt, input) {
    var C = PF.PLAYER;
    p.attackCd = Math.max(0, p.attackCd - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.dodge = Math.max(0, p.dodge - dt);
    p.swing = Math.max(0, p.swing - dt);
    if (p.comboTimer > 0) { p.comboTimer -= dt; if (p.comboTimer <= 0) p.combo = 0; }
    if (p.amuk > 0) { p.amuk -= dt; p.rage = Math.max(0, p.rage - dt * 12); if (p.amuk <= 0) p.rage = 0; }

    p.blocking = !!input.down('KeyL');
    var ax = input.axis();
    var speed = C.speed * (p.amuk > 0 ? 1.25 : 1) * (p.blocking ? 0 : 1);
    if (p.dodge > 0) speed = C.dodgeSpeed;
    if (ax.active && !p.blocking) {
      p.x += ax.x * speed * dt;
      p.z += ax.z * speed * dt;
      p.facing = Math.atan2(ax.x, ax.z);
      p.walkPhase += dt * 10;
    }
    p.x = Math.max(-PF.ARENA.halfX, Math.min(PF.ARENA.halfX, p.x));
    p.z = Math.max(-PF.ARENA.halfZ, Math.min(PF.ARENA.halfZ, p.z));
    p.mesh.position.set(p.x, 0, p.z);
    p.mesh.rotation.y = p.facing;
    // simple walk bob + swing pose
    var bob = ax.active ? Math.abs(Math.sin(p.walkPhase)) * 0.08 : 0;
    p.mesh.position.y = bob;
    var armR = p.mesh.getObjectByName('armR');
    if (armR) armR.rotation.x = p.swing > 0 ? -1.6 : (ax.active ? Math.sin(p.walkPhase) * 0.5 : 0);
    return p;
  };

  PF.playerTryAttack = function (p, kind) {
    if (p.attackCd > 0 || p.blocking) return null;
    var C = PF.PLAYER;
    var dmg, reach, cd;
    if (kind === 'kick') { dmg = C.kickDmg; reach = C.kickReach; cd = C.kickCd; }
    else { dmg = C.punchDmg; reach = C.punchReach; cd = C.punchCd; }
    if (p.weapon) {
      dmg = p.weapon.dmg; reach = Math.max(reach, p.weapon.reach);
      if (kind === 'kick') { dmg = p.weapon.dmg; }
    }
    if (p.amuk > 0) dmg *= 2;
    if (p.combo >= 5) dmg += 1;
    p.attackCd = cd; p.swing = 0.18; p.swingKind = kind;
    return { dmg: dmg, reach: reach, kind: kind };
  };

  PF.playerHurt = function (p, dmg) {
    if (p.invuln > 0 || p.dodge > 0) return 0;
    var taken = p.blocking ? dmg * (1 - PF.PLAYER.blockCut) : dmg;
    p.hp = Math.max(0, p.hp - taken);
    p.combo = 0; p.comboTimer = 0;
    p.rage = Math.min(100, p.rage + 6);
    p.invuln = 0.5;
    return taken;
  };

  PF.playerDodge = function (p) {
    if (p.dodge > 0) return;
    p.dodge = PF.PLAYER.dodgeTime; p.invuln = Math.max(p.invuln, PF.PLAYER.dodgeTime + 0.05);
  };

  PF.playerTryAmuk = function (p) {
    if (p.rage >= 100 && p.amuk <= 0) {
      p.amuk = PF.PLAYER.amukTime;
      return true;
    }
    return false;
  };
})();
