// Pulang Sebelum Fajar — district arenas: ground, props, exit marker.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;
  var scene = null, exitMesh = null, exitLight = null, propsGroup = null;

  function box(w, h, d, color, x, y, z) {
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ color: color }));
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  function buildProps(kind, rng) {
    var g = new THREE.Group();
    function scatter(count, maker) {
      for (var i = 0; i < count; i++) {
        var x = -10 + rng() * 20, z = -6 + rng() * 12;
        if (Math.abs(x) < 3 && Math.abs(z) < 2) continue; // keep spawn clear
        g.add(maker(x, z));
      }
    }
    if (kind === 0) { // Stasiun: pillars + benches
      for (var px = -8; px <= 8; px += 4) {
        g.add(box(0.7, 4, 0.7, 0x4a4f5a, px, 2, -5.5));
        g.add(box(0.7, 4, 0.7, 0x4a4f5a, px, 2, 5.5));
      }
      scatter(4, function (x, z) { return box(2.2, 0.5, 0.6, 0x6b4f2e, x, 0.55, z); });
      scatter(3, function (x, z) { return box(0.8, 1.1, 0.8, 0x39404d, x, 0.55, z); });
    } else if (kind === 1) { // Jalan Merdeka: lamps + cars + bins
      for (var lx = -9; lx <= 9; lx += 6) {
        g.add(box(0.25, 3.4, 0.25, 0x3a3f47, lx, 1.7, -6.2));
        g.add(box(1.2, 0.25, 0.25, 0xd8b25a, lx, 3.4, -6.2));
      }
      scatter(3, function (x, z) {
        var car = new THREE.Group();
        car.add(box(2.6, 0.7, 1.3, 0x5a2e2e, 0, 0.55, 0));
        car.add(box(1.4, 0.55, 1.1, 0x2a2f3a, -0.2, 1.15, 0));
        car.position.set(x, 0, z); return car;
      });
      scatter(4, function (x, z) { return box(0.6, 0.9, 0.6, 0x2f4a2f, x, 0.45, z); });
    } else if (kind === 2) { // Pasar Senja: stalls + crates + awnings
      scatter(4, function (x, z) {
        var st = new THREE.Group();
        st.add(box(2.4, 1.0, 1.4, 0x7a5230, 0, 0.5, 0));
        st.add(box(2.8, 0.15, 1.8, 0xc47f3f, 0, 1.6, 0));
        st.position.set(x, 0, z); return st;
      });
      scatter(6, function (x, z) { return box(0.9, 0.9, 0.9, 0x8a6a3e, x, 0.45, z); });
    } else if (kind === 3) { // Atap Kota: AC units + water tanks + ledges
      scatter(5, function (x, z) { return box(1.1, 0.8, 0.9, 0x565e6a, x, 0.4, z); });
      scatter(3, function (x, z) {
        var t = new THREE.Group();
        var cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.8, 10),
          new THREE.MeshLambertMaterial({ color: 0x4a6a7a }));
        cyl.position.y = 0.9; cyl.castShadow = true; t.add(cyl);
        t.position.set(x, 0, z); return t;
      });
      g.add(box(22, 0.5, 0.8, 0x3a3f4a, 0, 0.25, -6.8));
      g.add(box(22, 0.5, 0.8, 0x3a3f4a, 0, 0.25, 6.8));
    } else { // Gang Senja: mural wall + crates + home props
      var wall = box(10, 3.2, 0.4, 0x4a2e1e, -6, 1.6, -6.5);
      g.add(wall);
      var mural = box(6, 2, 0.1, 0xe07b2e, -6, 1.5, -6.25);
      g.add(mural);
      var sun = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16),
        new THREE.MeshBasicMaterial({ color: 0xffd27a }));
      sun.position.set(-6, 2.1, -6.18); g.add(sun);
      scatter(5, function (x, z) { return box(0.9, 0.9, 0.9, 0x6a4a2e, x, 0.45, z); });
      scatter(3, function (x, z) { return box(0.5, 1.4, 0.5, 0x3e5a3e, x, 0.7, z); });
    }
    return g;
  }

  PF.world = {
    init: function (sc) { scene = sc; },
    build: function (districtIndex) {
      var d = PF.DISTRICTS[districtIndex];
      if (propsGroup) { scene.remove(propsGroup); }
      if (exitMesh) { scene.remove(exitMesh); exitMesh = null; }
      scene.background = new THREE.Color(d.fog);
      scene.fog = new THREE.Fog(d.fog, 18, 46);
      var ground = new THREE.Mesh(new THREE.PlaneGeometry(26, 18),
        new THREE.MeshLambertMaterial({ color: d.ground }));
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
      ground.name = 'ground';
      // remove old ground
      var old = scene.getObjectByName('ground');
      if (old) scene.remove(old);
      scene.add(ground);
      // side walls (low, keep the arena readable)
      var oldWall = scene.getObjectByName('walls');
      if (oldWall) scene.remove(oldWall);
      var walls = new THREE.Group(); walls.name = 'walls';
      walls.add(box(26, 1.2, 0.5, 0x1c1f28, 0, 0.6, -8.6));
      walls.add(box(26, 1.2, 0.5, 0x1c1f28, 0, 0.6, 8.6));
      walls.add(box(0.5, 1.2, 18, 0x1c1f28, -12.6, 0.6, 0));
      walls.add(box(0.5, 1.2, 18, 0x1c1f28, 12.6, 0.6, 0));
      scene.add(walls);
      propsGroup = buildProps(districtIndex, PF.rng);
      scene.add(propsGroup);
      // exit marker: glowing ring at the far east end
      var ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.14, 10, 28),
        new THREE.MeshBasicMaterial({ color: 0xffd27a }));
      ring.position.set(10.4, 1.2, 0); ring.rotation.y = Math.PI / 2;
      ring.visible = false;
      exitMesh = ring; scene.add(ring);
      exitLight = new THREE.PointLight(0xffd27a, 0, 9);
      exitLight.position.set(10.4, 2, 0); scene.add(exitLight);
      return d;
    },
    showExit: function (on) {
      if (exitMesh) exitMesh.visible = on;
      if (exitLight) exitLight.intensity = on ? 1.4 : 0;
    },
    exitPos: function () { return { x: 10.4, z: 0 }; },
    tick: function (t) {
      if (exitMesh && exitMesh.visible) {
        exitMesh.rotation.x = t * 0.8;
        var s = 1 + Math.sin(t * 3) * 0.08;
        exitMesh.scale.set(s, s, s);
      }
    },
  };
})();
