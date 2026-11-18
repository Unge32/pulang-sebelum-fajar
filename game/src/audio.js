// Pulang Sebelum Fajar — synthesized WebAudio sound effects only, no files.
(function () {
  window.PF = window.PF || {};
  var ctx = null, hum = null, master = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
      return true;
    } catch (e) { return false; }
  }

  function tone(freq, dur, type, vol, slide) {
    if (!ensure()) return;
    try {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), ctx.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.02);
    } catch (e) {}
  }
  function noise(dur, vol, freq) {
    if (!ensure()) return;
    try {
      var len = Math.floor(ctx.sampleRate * dur);
      var buf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 800;
      var g = ctx.createGain(); g.gain.value = vol || 0.3;
      src.connect(f); f.connect(g); g.connect(master); src.start();
    } catch (e) {}
  }

  window.PF.audio = {
    unlock: ensure,
    punch: function () { noise(0.09, 0.5, 500); tone(120, 0.1, 'sine', 0.4, 60); },
    kick: function () { noise(0.14, 0.55, 350); tone(90, 0.14, 'sine', 0.45, 45); },
    hurt: function () { tone(180, 0.18, 'sawtooth', 0.22, 70); },
    pickup: function () { tone(520, 0.09, 'square', 0.18); tone(780, 0.12, 'square', 0.18); },
    coin: function () { tone(980, 0.07, 'sine', 0.22); tone(1320, 0.1, 'sine', 0.2); },
    enemyDown: function () { noise(0.2, 0.4, 300); tone(70, 0.25, 'sine', 0.4, 40); },
    roar: function () { tone(90, 0.6, 'sawtooth', 0.4, 220); noise(0.5, 0.25, 900); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { tone(f, 0.25, 'triangle', 0.3); }, i * 140); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { setTimeout(function () { tone(f, 0.3, 'triangle', 0.28); }, i * 160); }); },
    startAmbience: function () {
      if (!ensure() || hum) return;
      try {
        hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 55;
        var g = ctx.createGain(); g.gain.value = 0.05;
        var lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
        var lg = ctx.createGain(); lg.gain.value = 0.02;
        lfo.connect(lg); lg.connect(g.gain);
        hum.connect(g); g.connect(master); hum.start(); lfo.start();
      } catch (e) {}
    },
  };
})();
