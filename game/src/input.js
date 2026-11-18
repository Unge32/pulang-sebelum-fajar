// Pulang Sebelum Fajar — keyboard + mouse state, no dependencies.
(function () {
  window.PF = window.PF || {};
  var keys = {};
  var pressed = {};
  var PF = window.PF;

  function code(e) { return e.code || e.key; }

  window.addEventListener('keydown', function (e) {
    var c = code(e);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(c) !== -1) e.preventDefault();
    if (!keys[c]) pressed[c] = true;
    keys[c] = true;
  });
  window.addEventListener('keyup', function (e) { keys[code(e)] = false; });
  window.addEventListener('mousedown', function (e) {
    if (e.button === 0) { pressed.Mouse0 = true; keys.Mouse0 = true; }
  });
  window.addEventListener('mouseup', function (e) {
    if (e.button === 0) keys.Mouse0 = false;
  });
  window.addEventListener('blur', function () { keys = {}; });

  PF.input = {
    down: function (c) { return !!keys[c]; },
    hit: function (c) { var v = !!pressed[c]; if (v) pressed[c] = false; return v; },
    consumeAll: function () { pressed = {}; },
    axis: function () {
      var x = 0, z = 0;
      if (keys.KeyA || keys.ArrowLeft) x -= 1;
      if (keys.KeyD || keys.ArrowRight) x += 1;
      if (keys.KeyW || keys.ArrowUp) z -= 1;
      if (keys.KeyS || keys.ArrowDown) z += 1;
      var len = Math.hypot(x, z) || 1;
      return { x: x / len, z: z / len, active: !!(x || z) };
    },
  };
})();
