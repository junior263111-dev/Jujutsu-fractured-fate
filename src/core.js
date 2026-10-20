(function (root) {
  "use strict";
  var DATA = root.JFF_DATA;
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function deepCopy(value) { return JSON.parse(JSON.stringify(value)); }

  function createState(styleId) {
    var style = DATA.styles[styleId] || DATA.styles.echo;
    return {
      schema: 1,
      styleId: style.id,
      view: "story",
      player: {
        name: "Estudante",
        level: 1,
        xp: 0,
        nextXp: 80,
        hp: 110,
        maxHp: 110,
        ce: 55,
        maxCe: 55,
        attack: 12,
        defense: 4,
        rebirths: 0,
        legacy: 0,
        wins: 0,
        domainsUnlocked: false
      },
      story: {
        openingChoice: null,
        endingChoice: null,
        chapterOneComplete: false,
        clueCount: 0,
        allyTrust: 0
      },
      combat: null,
      inventory: { potions: 2, seals: 1 },
      log: ["Você chegou a Kurohama. Leia o ambiente antes de tomar sua primeira decisão."],
      lastResult: null
    };
  }

  function rankForLevel(level) {
    var result = DATA.ranks[0].name;
    DATA.ranks.forEach(function (rank) { if (level >= rank.level) result = rank.name; });
    return result;
  }

  function enemyFor(id, level, wins) {
    var base = DATA.enemies[id] || DATA.enemies.echo;
    var scale = 1 + Math.max(0, level - 1) * 0.085 + Math.max(0, wins - 2) * 0.035;
    return {
      id: base.id,
      name: base.name,
      grade: base.grade,
      symbol: base.symbol,
      color: base.color,
      maxHp: Math.round(base.hp * scale),
      hp: Math.round(base.hp * scale),
      attack: Math.round(base.attack * (1 + Math.max(0, level - 1) * 0.04)),
      defense: base.defense + Math.floor(Math.max(0, level - 1) / 4),
      xp: Math.round(base.xp * (1 + Math.max(0, level - 1) * 0.12)),
      ce: base.ce,
      description: base.description,
      exposed: false,
      stunned: false
    };
  }

  function startCombat(state, enemyId) {
    state.combat = enemyFor(enemyId, state.player.level, state.player.wins);
    state.view = "combat";
    state.lastResult = null;
    state.log.unshift("Combate iniciado: " + state.combat.name + " (" + state.combat.grade + ").");
    state.log = state.log.slice(0, 9);
    if (state.styleId === "flow") state.combat.openingGuard = true;
    return state.combat;
  }

  function applyEnemyDamage(state, amount) {
    state.combat.hp = clamp(state.combat.hp - Math.max(0, Math.floor(amount)), 0, state.combat.maxHp);
    return state.combat.hp;
  }

  function applyPlayerDamage(state, amount) {
    var player = state.player;
    var damage = Math.max(1, Math.floor(amount) - player.defense);
    player.hp = clamp(player.hp - damage, 0, player.maxHp);
    return damage;
  }

  function gainXP(state, amount) {
    var player = state.player;
    player.xp += Math.max(0, Math.floor(amount));
    var levels = 0;
    while (player.xp >= player.nextXp) {
      player.xp -= player.nextXp;
      player.level += 1;
      player.nextXp = Math.round(player.nextXp * 1.34);
      player.maxHp += 11;
      player.maxCe += 6;
      player.attack += 2;
      player.defense += player.level % 2 === 0 ? 1 : 0;
      player.hp = player.maxHp;
      player.ce = player.maxCe;
      levels += 1;
      if (player.level >= 8) player.domainsUnlocked = true;
      state.log.unshift("Nível " + player.level + " alcançado. Atributos elevados e reservas restauradas.");
    }
    return levels;
  }

  function winCombat(state) {
    if (!state.combat) return null;
    var enemy = state.combat;
    var player = state.player;
    player.wins += 1;
    player.ce = clamp(player.ce + enemy.ce, 0, player.maxCe);
    var levels = gainXP(state, enemy.xp);
    state.lastResult = { type: "victory", enemyName: enemy.name, xp: enemy.xp, levels: levels };
    state.log.unshift("Exorcismo concluído: +" + enemy.xp + " XP e +" + enemy.ce + " de energia amaldiçoada.");
    state.combat = null;
    if (enemy.id === "echo" && !state.story.chapterOneComplete) {
      state.story.chapterOneComplete = true;
      state.view = "ending";
    } else {
      state.view = "mission";
    }
    state.log = state.log.slice(0, 9);
    return state.lastResult;
  }

  function loseCombat(state) {
    if (!state.combat) return;
    var name = state.combat.name;
    state.combat = null;
    state.player.hp = Math.max(35, Math.ceil(state.player.maxHp * 0.38));
    state.player.ce = Math.max(10, Math.ceil(state.player.maxCe * 0.25));
    state.view = "mission";
    state.lastResult = { type: "recovery", enemyName: name };
    state.log.unshift("Você recuou após ser ferido. A equipe de apoio estabilizou você; tente outra estratégia.");
    state.log = state.log.slice(0, 9);
  }

  function canRebirth(state) {
    return state.player.level >= 6 && state.player.wins >= 3;
  }

  function rebirth(state) {
    if (!canRebirth(state)) return { ok: false, message: "Rebirth exige nível 6 e pelo menos 3 exorcismos." };
    var player = state.player;
    var oldStyle = state.styleId;
    var rebirths = player.rebirths + 1;
    var legacy = player.legacy + 1;
    var wins = player.wins;
    var story = state.story;
    var inventory = state.inventory;
    var newState = createState(oldStyle);
    newState.player.rebirths = rebirths;
    newState.player.legacy = legacy;
    newState.player.attack += legacy * 2;
    newState.player.maxHp += legacy * 5;
    newState.player.hp = newState.player.maxHp;
    newState.player.maxCe += legacy * 3;
    newState.player.ce = newState.player.maxCe;
    newState.player.wins = wins;
    newState.story = story;
    newState.inventory = inventory;
    newState.view = "mission";
    newState.log = [
      "Rebirth " + rebirths + " concluído. A linha do destino foi reiniciada.",
      "Legado permanente +" + legacy + ": bônus de ataque, vida e energia foram preservados."
    ].concat(state.log).slice(0, 9);
    return { ok: true, state: newState };
  }

  function xpPercent(player) { return clamp(Math.round(player.xp / player.nextXp * 100), 0, 100); }
  function cePercent(player) { return clamp(Math.round(player.ce / player.maxCe * 100), 0, 100); }
  function hpPercent(player) { return clamp(Math.round(player.hp / player.maxHp * 100), 0, 100); }

  root.JFF_CORE = {
    createState: createState,
    rankForLevel: rankForLevel,
    enemyFor: enemyFor,
    startCombat: startCombat,
    applyEnemyDamage: applyEnemyDamage,
    applyPlayerDamage: applyPlayerDamage,
    gainXP: gainXP,
    winCombat: winCombat,
    loseCombat: loseCombat,
    canRebirth: canRebirth,
    rebirth: rebirth,
    xpPercent: xpPercent,
    cePercent: cePercent,
    hpPercent: hpPercent,
    deepCopy: deepCopy
  };
})(window);