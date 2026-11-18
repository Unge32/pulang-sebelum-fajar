// Pulang Sebelum Fajar — HUD in Indonesian, updated from game state.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;
  var el = {};

  function barHTML(id, pct, color) {
    return '<div class="bar"><div id="' + id + '" class="fill" style="width:' + pct +
      '%;background:' + color + '"></div></div>';
  }

  PF.hud = {
    init: function () {
      var root = document.getElementById('hud');
      root.innerHTML =
        '<div id="hud-tl"><div class="label">DITO <span id="hp-num"></span></div>' +
        '<div class="bar"><div id="hp-fill" class="fill" style="background:#e05252"></div></div>' +
        '<div class="label">AMUK <span id="rage-num"></span></div>' +
        '<div class="bar"><div id="rage-fill" class="fill" style="background:#ff8c1a"></div></div>' +
        '<div id="weapon-line" class="label"></div></div>' +
        '<div id="hud-tr"><div id="district-name" class="big"></div>' +
        '<div id="objective" class="label"></div>' +
        '<div id="enemies-line" class="label"></div>' +
        '<div id="coins-line" class="label"></div></div>' +
        '<div id="hud-bl"><div class="label">SEKUTU</div>' +
        '<div id="ally-bimo" class="label"></div><div id="ally-sari" class="label"></div>' +
        '<div id="cmd-line" class="label"></div></div>' +
        '<div id="combo" class="combo"></div>' +
        '<div id="toast"></div>' +
        '<div id="amuk-glow"></div>';
      ['hp-fill', 'rage-fill', 'hp-num', 'rage-num', 'weapon-line', 'district-name',
       'objective', 'enemies-line', 'coins-line', 'ally-bimo', 'ally-sari', 'cmd-line',
       'combo', 'toast', 'amuk-glow'].forEach(function (id) { el[id] = document.getElementById(id); });
    },
    show: function (on) { document.getElementById('hud').style.display = on ? 'block' : 'none'; },
    toast: function (msg, ms) {
      el.toast.textContent = msg; el.toast.style.opacity = '1';
      clearTimeout(this._tt);
      var self = this;
      this._tt = setTimeout(function () { el.toast.style.opacity = '0'; }, ms || 2200);
    },
    update: function (s) {
      if (!el['hp-fill']) return;
      el['hp-fill'].style.width = Math.max(0, s.player.hp / s.player.maxHp * 100) + '%';
      el['hp-num'].textContent = Math.ceil(s.player.hp) + ' HP';
      el['rage-fill'].style.width = s.player.rage + '%';
      el['rage-num'].textContent = s.player.amuk > 0 ? 'AMUK AKTIF!' : Math.floor(s.player.rage) + '% — tekan E';
      el['weapon-line'].textContent = s.player.weapon
        ? 'Senjata: ' + s.player.weapon.label + ' (' + s.player.weapon.dur + 'x)' : '';
      var d = PF.DISTRICTS[s.district];
      el['district-name'].textContent = (s.district + 1) + '/5 — ' + d.name;
      el['objective'].textContent = s.objective;
      var alive = s.enemies.filter(function (e) { return !e.dead; }).length;
      el['enemies-line'].textContent = 'Musuh: ' + alive + '  •  Gelombang ' + (s.wave + 1) + '/' + d.waves.length;
      el['coins-line'].textContent = 'Koin: ' + PF.combat.coins + '  •  Skor: ' + PF.combat.score;
      el['ally-bimo'].textContent = 'Bimo ' + (s.allies[0].down ? '— TUMBANG (' + Math.ceil(s.allies[0].downTimer) + ' dtk)' : '— ' + Math.ceil(s.allies[0].hp) + ' HP');
      el['ally-sari'].textContent = 'Sari ' + (s.allies[1].down ? '— TUMBANG (' + Math.ceil(s.allies[1].downTimer) + ' dtk)' : '— ' + Math.ceil(s.allies[1].hp) + ' HP');
      el['cmd-line'].textContent = 'Perintah (Q): ' + (s.command === 'serbu' ? 'Serbu!' : 'Ikut!');
      el.combo.textContent = s.player.combo >= 2 ? 'KOMBO x' + s.player.combo : '';
      el.combo.style.opacity = s.player.combo >= 2 ? '1' : '0';
      el['amuk-glow'].style.opacity = s.player.amuk > 0 ? '1' : '0';
    },
  };

  PF.showScreen = function (id) {
    ['title-screen', 'win-screen', 'death-screen', 'pause-screen'].forEach(function (s) {
      var n = document.getElementById(s);
      if (n) n.style.display = s === id ? 'flex' : 'none';
    });
  };
})();
