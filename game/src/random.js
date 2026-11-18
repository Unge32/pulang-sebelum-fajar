// Pulang Sebelum Fajar — small seeded RNG so arena layouts are stable per run.
(function () {
  window.PF = window.PF || {};
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  window.PF.rng = mulberry32(20261118);
  window.PF.pick = function (arr) { return arr[Math.floor(window.PF.rng() * arr.length)]; };
})();
