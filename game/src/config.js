// Pulang Sebelum Fajar — tuning data: districts, gangs, weapons, enemies.
// Everything here is original fiction: Kota Karsa, gang Senja, and friends.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;

  PF.ARENA = { halfX: 11, halfZ: 7 };

  PF.DISTRICTS = [
    { name: 'Stasiun', sub: 'Peron tua, lampu berkedip', rival: 'Serigala',
      ground: 0x2a2f3a, fog: 0x0b0e18, accent: 0x7f9cc4,
      waves: [['grunt', 'grunt'], ['grunt', 'grunt', 'grunt']] },
    { name: 'Jalan Merdeka', sub: 'Jalan raya, mobil terparkir', rival: 'Serigala dan Ular Pasar',
      ground: 0x23262e, fog: 0x0b0e18, accent: 0xd8b25a,
      waves: [['grunt', 'grunt'], ['grunt', 'runner', 'grunt']] },
    { name: 'Pasar Senja', sub: 'Los pasar, tenda dan peti', rival: 'Ular Pasar',
      ground: 0x2e2a22, fog: 0x0d0b12, accent: 0x7fc47f,
      waves: [['grunt', 'grunt'], ['heavy', 'grunt'], ['grunt', 'grunt', 'heavy']] },
    { name: 'Atap Kota', sub: 'Atap gedung, tangki air', rival: 'Elang Atap',
      ground: 0x262633, fog: 0x0b0d1a, accent: 0xb48ad8,
      waves: [['runner', 'grunt'], ['runner', 'runner'], ['heavy', 'runner', 'grunt']] },
    { name: 'Gang Senja', sub: 'Kampung halaman — mural Senja', rival: 'Guntur',
      ground: 0x2a2320, fog: 0x0e0a10, accent: 0xe07b2e,
      waves: [['boss', 'grunt', 'grunt']] },
  ];

  PF.GANG_COLORS = {
    Senja: 0xe07b2e, Serigala: 0x7f9cc4, 'Ular Pasar': 0x5da85d,
    'Elang Atap': 0x9a6fd0, Guntur: 0x8a2f2f,
  };

  PF.ENEMIES = {
    grunt:  { hp: 3, speed: 2.2, dmg: 8,  reach: 1.3, scale: 1.0, score: 50 },
    heavy:  { hp: 6, speed: 1.3, dmg: 16, reach: 1.5, scale: 1.25, score: 100 },
    runner: { hp: 2, speed: 3.6, dmg: 6,  reach: 1.2, scale: 0.9, score: 75 },
    boss:   { hp: 30, speed: 1.9, dmg: 20, reach: 1.8, scale: 1.5, score: 1000 },
  };

  PF.WEAPONS = {
    bat:    { label: 'Pemukul', dmg: 3, dur: 12, reach: 2.2, color: 0x8a5a2e },
    bottle: { label: 'Botol',   dmg: 4, dur: 1,  reach: 2.6, color: 0x3f8f5f },
    chain:  { label: 'Rantai',  dmg: 2, dur: 15, reach: 2.8, color: 0x9aa0aa },
  };

  PF.PLAYER = {
    hp: 100, speed: 5.2, punchDmg: 1, punchReach: 1.6, punchCd: 0.32,
    kickDmg: 2, kickReach: 2.1, kickCd: 0.55, comboWindow: 1.2,
    dodgeTime: 0.35, dodgeSpeed: 11, blockCut: 0.7, amukTime: 8,
  };

  PF.ALLIES = [
    { name: 'Bimo', color: 0xe0a52e, dmg: 1, speed: 4.6 },
    { name: 'Sari', color: 0xe07b9e, dmg: 1, speed: 4.9 },
  ];
})();
