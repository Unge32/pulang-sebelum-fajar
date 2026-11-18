// Pulang Sebelum Fajar — screenshot poses for tests/shots.mjs.
(function () {
  window.PF = window.PF || {};
  var PF = window.PF;
  window.__pfShots = {
    title: function () { PF.game.toTitle(); },
    brawl: function () {
      PF.game.startGame();
      PF.game.debugSpawn('grunt'); PF.game.debugSpawn('grunt'); PF.game.debugSpawn('runner');
      PF.game.teleportPlayer(-2, 0);
    },
    market: function () {
      PF.game.startGame();
      PF.game.setDistrict(2);
      PF.game.debugSpawn('heavy'); PF.game.debugSpawn('grunt'); PF.game.debugSpawn('grunt');
      PF.game.teleportPlayer(-2, 0.5);
    },
    boss: function () {
      PF.game.startGame();
      PF.game.setDistrict(4);
      PF.game.teleportPlayer(-3, 0);
    },
  };
})();
