(function (root) {
  "use strict";
  var DATA = root.JFF_DATA;
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function rollDie(sides, rng) { return 1 + Math.floor(clamp((rng || Math.random)(), 0, 0.999999) * sides); }
  function rollRange(min, max, rng) { return min + rollDie(max - min + 1, rng) - 1; }

  function refreshDerived(player, preserveGain) {
    var oldHp = player.maxHp || 0;
    var oldCe = player.maxCe || 0;
    var a = player.attributes;
    player.maxHp = 88 + a.vitality * 13 + (player.level - 1) * 8 + player.legacy * 5;
    player.maxCe = 45 + a.control * 11 + (player.level - 1) * 5 + player.legacy * 4;
    player.attackPower = 5 + player.level * 2 + a.strength * 2 + player.legacy * 2;
    player.defense = 1 + Math.floor(a.vitality / 2) + Math.floor((player.level - 1) / 3) + Math.floor(player.legacy / 2);
    player.accuracy = 1 + Math.floor(a.instinct / 2) + Math.floor((player.level - 1) / 3);
    player.techniquePower = 5 + player.level + a.control * 2 + player.techniqueRank * 3 + player.legacy;
    player.dodgeBonus = Math.floor(a.instinct / 2) + Math.floor(player.level / 4);
    if (preserveGain) {
      player.hp = clamp((player.hp || 0) + Math.max(0, player.maxHp - oldHp), 0, player.maxHp);
      player.ce = clamp((player.ce || 0) + Math.max(0, player.maxCe - oldCe), 0, player.maxCe);
    } else {
      player.hp = clamp(player.hp == null ? player.maxHp : player.hp, 0, player.maxHp);
      player.ce = clamp(player.ce == null ? player.maxCe : player.ce, 0, player.maxCe);
    }
    return player;
  }

  function createState(techniqueId, name) {
    var selected = DATA.techniques[techniqueId] ? techniqueId : "ratio";
    var state = {
      schema: 2,
      view: "dialogue",
      techniqueId: selected,
      player: {
        name: String(name || "Estudante").trim().slice(0, 24) || "Estudante",
        level: 1, xp: 0, nextXp: 100,
        hp: 0, maxHp: 0, ce: 0, maxCe: 0,
        attackPower: 0, defense: 0, accuracy: 0, techniquePower: 0, dodgeBonus: 0,
        skillPoints: 4, techniqueRank: 1,
        attributes: { strength: 1, vitality: 1, control: 1, instinct: 1 },
        rebirths: 0, legacy: 0, wins: 0, domainUnlocked: false, gold: 20
      },
      story: {
        dialogueNode: "briefing",
        openingChoice: null,
        endingChoice: null,
        chapterOneComplete: false,
        clues: 0,
        trust: 0,
        completedMissions: [],
        routeFlags: {}
      },
      combat: null,
      inventory: { potions: 2, seals: 1 },
      log: ["A supervisora Aki Morino iniciou o briefing da missão em Kurohama."],
      lastResult: null
    };
    refreshDerived(state.player, false);
    state.player.hp = state.player.maxHp;
    state.player.ce = state.player.maxCe;
    return state;
  }

  function rankForLevel(level) {
    var result = DATA.grades[0].name;
    DATA.grades.forEach(function (rank) { if (level >= rank.level) result = rank.name; });
    return result;
  }

  function enemyFor(id, level, wins, rebirths) {
    var base = DATA.enemies[id] || DATA.enemies.echo;
    var scale = 1 + Math.max(0, level - 1) * 0.105 + Math.max(0, wins - 2) * 0.035 + Math.max(0, rebirths || 0) * 0.08;
    return {
      id: base.id, name: base.name, grade: base.grade, symbol: base.symbol,
      maxHp: Math.round(base.hp * scale), hp: Math.round(base.hp * scale),
      attack: Math.round(base.attack * (1 + Math.max(0, level - 1) * 0.055 + Math.max(0, rebirths || 0) * 0.035)),
      defense: base.defense + Math.floor(Math.max(0, level - 1) / 4),
      evasion: base.evasion + Math.floor(Math.max(0, level - 1) / 5),
      stability: base.stability + Math.floor(Math.max(0, level - 1) / 4),
      xp: Math.round(base.xp * (1 + Math.max(0, level - 1) * 0.1)),
      ceReward: base.ce, gold: base.gold, description: base.description,
      intentWeights: base.intentWeights.slice(), intent: "strike",
      stunned: false, exposed: false, bleedTurns: 0, bleeds: 0, charged: false, warded: false
    };
  }

  function chooseIntent(enemy, rng) {
    var roll = rollDie(100, rng);
    var weights = enemy.intentWeights;
    if (roll <= weights[0]) enemy.intent = "strike";
    else if (roll <= weights[0] + weights[1]) enemy.intent = "heavy";
    else enemy.intent = "charge";
    return enemy.intent;
  }

  function startCombat(state, enemyId, rng) {
    if (state.combat) return { ok: false, message: "O combate já está em andamento." };
    var base = DATA.enemies[enemyId];
    if (!base) return { ok: false, message: "Inimigo desconhecido." };
    state.combat = enemyFor(enemyId, state.player.level, state.player.wins, state.player.rebirths);
    state.combat.round = 1;
    state.combat.missionId = enemyId;
    chooseIntent(state.combat, rng);
    state.view = "combat";
    state.lastResult = null;
    state.log.unshift("Encontro iniciado: " + state.combat.name + " · " + state.combat.grade + ".");
    state.log = state.log.slice(0, 10);
    return { ok: true, intent: state.combat.intent };
  }

  function gainXP(state, amount) {
    var p = state.player;
    p.xp += Math.max(0, Math.floor(amount));
    var levels = 0;
    while (p.xp >= p.nextXp) {
      p.xp -= p.nextXp;
      p.level += 1;
      p.nextXp = Math.round(p.nextXp * 1.32);
      p.skillPoints += 3;
      refreshDerived(p, true);
      p.hp = p.maxHp;
      p.ce = p.maxCe;
      if (p.level >= 8) p.domainUnlocked = true;
      levels += 1;
      state.log.unshift("Nível " + p.level + "! +3 pontos de habilidade. Vida e energia foram restauradas.");
    }
    return levels;
  }

  function spendSkillPoint(state, attributeId) {
    var p = state.player;
    if (attributeId === "technique") {
      if (p.skillPoints < 2) return { ok: false, message: "Maestria técnica custa 2 pontos de habilidade." };
      if (p.techniqueRank >= 5) return { ok: false, message: "Sua técnica já está no nível máximo." };
      p.skillPoints -= 2;
      p.techniqueRank += 1;
      refreshDerived(p, true);
      state.log.unshift("Maestria da técnica elevada para o nível " + p.techniqueRank + ".");
      return { ok: true, message: "Maestria técnica aumentada." };
    }
    if (!p.attributes.hasOwnProperty(attributeId)) return { ok: false, message: "Atributo inválido." };
    if (p.skillPoints < 1) return { ok: false, message: "Você não tem pontos de habilidade disponíveis." };
    if (p.attributes[attributeId] >= 20) return { ok: false, message: "Esse atributo já atingiu o limite desta versão." };
    p.skillPoints -= 1;
    p.attributes[attributeId] += 1;
    refreshDerived(p, true);
    state.log.unshift("Atributo " + DATA.attributes.filter(function (a) { return a.id === attributeId; })[0].name + " aumentado.");
    return { ok: true, message: "Atributo aumentado." };
  }

  function applyDialogueChoice(state, choiceId) {
    var node = DATA.dialogues[state.story.dialogueNode];
    if (!node) return { ok: false, message: "Diálogo não encontrado." };
    var choice = node.choices.filter(function (item) { return item.id === choiceId; })[0];
    if (!choice) return { ok: false, message: "Escolha inválida." };
    var effects = choice.effects || {};
    state.story.trust += effects.trust || 0;
    state.story.clues += effects.clues || 0;
    state.inventory.potions += effects.potions || 0;
    state.inventory.seals += effects.seals || 0;
    state.player.ce = clamp(state.player.ce + (effects.ce || 0), 0, state.player.maxCe);
    if (effects.xp) gainXP(state, effects.xp);
    if (effects.openingChoice) state.story.openingChoice = effects.openingChoice;
    if (effects.endingChoice) state.story.endingChoice = effects.endingChoice;
    if (choice.response) state.log.unshift((node.speaker || "Personagem") + ": " + choice.response);
    if (effects.openingChoice) state.log.unshift("Prioridade registrada: " + choice.label + ".");
    if (effects.endingChoice) state.log.unshift("Relatório atualizado: " + choice.label + ".");
    state.story.routeFlags[choice.id] = true;
    state.story.dialogueNode = null;
    state.view = "mission";
    state.log = state.log.slice(0, 10);
    return { ok: true, choice: choice, effects: effects };
  }

  function rollPhysical(state, rng) {
    var p = state.player, enemy = state.combat;
    var attackRoll = rollDie(20, rng);
    var total = attackRoll + p.accuracy;
    var hit = attackRoll !== 1 && (attackRoll === 20 || total >= enemy.evasion);
    var result = { action: "physical", attackRoll: attackRoll, total: total, target: enemy.evasion, hit: hit, damage: 0, blackFlash: false, critical: attackRoll === 20 };
    if (!hit) {
      state.log.unshift("Ataque físico: d20 " + attackRoll + " + " + p.accuracy + " = " + total + " contra " + enemy.evasion + " — ERRO.");
      return result;
    }
    var damageRoll = rollDie(6, rng);
    var damage = Math.max(1, p.attackPower + damageRoll - enemy.defense);
    if (result.critical) damage = Math.round(damage * 1.5);
    var bfRoll = rollDie(20, rng);
    var bfThreshold = Math.max(16, 20 - Math.floor(p.attributes.control / 2));
    if (bfRoll >= bfThreshold) {
      result.blackFlash = true;
      damage = Math.round(damage * 2.55);
      state.log.unshift("BLACK FLASH! d20 " + bfRoll + " ≥ " + bfThreshold + ". O ataque físico entrou em ressonância!");
      p.ce = clamp(p.ce + 8, 0, p.maxCe);
      enemy.stunned = true;
    } else {
      state.log.unshift("Ataque físico: d20 " + attackRoll + " + " + p.accuracy + " = " + total + " — ACERTO. Dano: " + p.attackPower + " + d6(" + damageRoll + ") − " + enemy.defense + ".");
      state.log.unshift("Teste de Black Flash: d20 " + bfRoll + " (precisava de " + bfThreshold + "). Sem ressonância desta vez.");
    }
    if (result.critical) state.log.unshift("Acerto crítico natural: o dano foi ampliado.");
    if (enemy.exposed) {
      damage = Math.round(damage * 1.45);
      enemy.exposed = false;
      state.log.unshift("O ponto vulnerável ampliou o ataque físico.");
    }
    enemy.hp = clamp(enemy.hp - damage, 0, enemy.maxHp);
    result.damage = damage;
    state.log.unshift("Dano final do ataque físico: " + damage + ".");
    return result;
  }

  function rollTechnique(state, rng) {
    var p = state.player, enemy = state.combat, technique = DATA.techniques[state.techniqueId];
    var result = { action: "technique", hit: false, damage: 0, blackFlash: false };
    if (p.ce < technique.cost) return { ok: false, message: "Energia amaldiçoada insuficiente para " + technique.name + "." };
    p.ce -= technique.cost;
    var attackRoll = rollDie(20, rng);
    var total = attackRoll + Math.floor(p.attributes.control / 2) + p.techniqueRank;
    result.attackRoll = attackRoll;
    result.total = total;
    result.target = enemy.evasion;
    result.hit = attackRoll !== 1 && (attackRoll === 20 || total >= enemy.evasion);
    if (!result.hit) {
      state.log.unshift(technique.name + ": d20 " + attackRoll + " + Controle/Maestria = " + total + " contra " + enemy.evasion + " — ERRO. Energia gasta.");
      return { ok: true, result: result, message: "A técnica errou, mas a energia foi consumida." };
    }
    var die = rollDie(8, rng);
    var damage = Math.max(1, Math.round(p.techniquePower * technique.multiplier) + die - enemy.defense);
    if (attackRoll === 20) damage = Math.round(damage * 1.5);
    if (enemy.exposed) {
      damage = Math.round(damage * 1.45);
      enemy.exposed = false;
    }
    enemy.hp = clamp(enemy.hp - damage, 0, enemy.maxHp);
    result.damage = damage;
    state.log.unshift(technique.name + ": d20 " + attackRoll + " + bônus = " + total + " — ACERTO; dano " + damage + ".");
    if (enemy.hp > 0) {
      if (technique.effect === "stun") {
        var effectRoll = rollDie(20, rng) + p.attributes.control + p.techniqueRank;
        if (effectRoll >= enemy.stability + 7) {
          enemy.stunned = true;
          state.log.unshift("Teste de efeito " + effectRoll + " superou a resistência. O inimigo foi interrompido.");
        } else {
          state.log.unshift("O inimigo resistiu à ordem amaldiçoada.");
        }
      } else if (technique.effect === "bleed") {
        enemy.bleedTurns = Math.max(enemy.bleedTurns, 2);
        enemy.bleeds = 3 + p.techniqueRank;
        state.log.unshift("Sangramento aplicado por duas rodadas.");
      } else if (technique.effect === "expose") {
        enemy.exposed = true;
        state.log.unshift("Ponto fraco identificado: o próximo acerto recebe bônus de dano.");
      } else if (technique.effect === "ward") {
        p.warded = true;
        state.log.unshift("A sombra protege você contra parte do próximo dano.");
      }
    }
    return { ok: true, result: result, message: "Técnica executada." };
  }

  function resolveEnemyTurn(state, action, rng) {
    var p = state.player, enemy = state.combat;
    var result = { enemyAction: enemy.intent, incoming: 0, dodged: false, guarded: false, defeated: false };
    if (enemy.bleedTurns > 0 && enemy.hp > 0) {
      enemy.hp = Math.max(0, enemy.hp - enemy.bleeds);
      enemy.bleedTurns -= 1;
      state.log.unshift("Sangramento: " + enemy.bleeds + " de dano persistente.");
      if (enemy.hp <= 0) { result.defeated = true; return result; }
    }
    if (enemy.stunned) {
      enemy.stunned = false;
      state.log.unshift(enemy.name + " perdeu o turno por interrupção.");
      chooseIntent(enemy, rng);
      enemy.round += 1;
      return result;
    }
    if (enemy.intent === "charge") {
      enemy.charged = true;
      state.log.unshift(enemy.name + " acumulou energia. O próximo ataque será mais forte.");
      chooseIntent(enemy, rng);
      enemy.round += 1;
      return result;
    }
    var isHeavy = enemy.intent === "heavy";
    var enemyRoll = rollDie(20, rng);
    var attackBonus = 3 + Math.floor(p.level / 4);
    var total = enemyRoll + attackBonus;
    var target = 10 + p.dodgeBonus;
    var hit = enemyRoll !== 1 && (enemyRoll === 20 || total >= target);
    if (action === "dodge") {
      var dodgeRoll = rollDie(20, rng);
      var dodgeTotal = dodgeRoll + p.dodgeBonus;
      var dodgeTarget = isHeavy ? 17 : 13;
      if (dodgeRoll === 20 || (dodgeRoll !== 1 && dodgeTotal >= dodgeTarget)) {
        result.dodged = true;
        p.ce = clamp(p.ce + 5, 0, p.maxCe);
        state.log.unshift("Esquiva bem-sucedida: d20 " + dodgeRoll + " + Instinto = " + dodgeTotal + " contra " + dodgeTarget + ". +5 energia.");
        chooseIntent(enemy, rng);
        enemy.round += 1;
        return result;
      }
      state.log.unshift("Esquiva falhou: d20 " + dodgeRoll + " + Instinto = " + dodgeTotal + " contra " + dodgeTarget + ".");
    }
    if (!hit) {
      state.log.unshift(enemy.name + " errou: d20 " + enemyRoll + " + " + attackBonus + " = " + total + " contra defesa " + target + ".");
    } else {
      var die = rollDie(8, rng);
      var rawDamage = enemy.attack + die - p.defense;
      if (isHeavy) rawDamage = Math.round(rawDamage * 1.45);
      if (enemy.charged) {
        rawDamage = Math.round(rawDamage * 1.3);
        enemy.charged = false;
      }
      if (enemyRoll === 20) rawDamage = Math.round(rawDamage * 1.5);
      var damage = Math.max(1, rawDamage);
      if (action === "guard") {
        damage = Math.max(1, Math.round(damage * 0.4));
        result.guarded = true;
      }
      if (p.warded) {
        damage = Math.max(1, Math.round(damage * 0.5));
        p.warded = false;
      }
      p.hp = clamp(p.hp - damage, 0, p.maxHp);
      result.incoming = damage;
      state.log.unshift(enemy.name + (isHeavy ? " (ataque pesado)" : "") + ": d20 " + enemyRoll + " + " + attackBonus + " = " + total + (enemyRoll === 20 ? " · crítico natural" : "") + ". Você recebeu " + damage + " de dano.");
    }
    enemy.round += 1;
    if (p.hp <= 0) {
      p.hp = Math.max(1, Math.round(p.maxHp * 0.25));
      p.ce = Math.max(0, Math.round(p.maxCe * 0.2));
      p.gold = Math.max(0, p.gold - Math.min(15, p.gold));
      state.combat = null;
      state.view = "mission";
      state.lastResult = { type: "defeat", message: "A equipe de apoio resgatou você. Parte do ouro foi perdida, mas sua campanha continua." };
      state.log.unshift("Você foi derrotado e evacuado. Recupere-se e tente outra estratégia.");
      state.log = state.log.slice(0, 10);
      result.defeated = true;
      return result;
    }
    chooseIntent(enemy, rng);
    return result;
  }

  function winCombat(state, result) {
    if (!state.combat) return null;
    var enemy = state.combat;
    var p = state.player;
    p.wins += 1;
    p.gold += enemy.gold;
    p.ce = clamp(p.ce + enemy.ceReward, 0, p.maxCe);
    var levels = gainXP(state, enemy.xp);
    var firstChapter = enemy.id === "echo" && !state.story.chapterOneComplete;
    state.story.completedMissions.push(enemy.missionId || enemy.id);
    if (firstChapter) {
      state.story.chapterOneComplete = true;
      state.story.dialogueNode = "aftermath";
      state.view = "dialogue";
    } else {
      state.view = "mission";
    }
    state.lastResult = { type: "victory", enemyName: enemy.name, xp: enemy.xp, gold: enemy.gold, levels: levels };
    state.log.unshift("Exorcismo concluído: +" + enemy.xp + " XP, +" + enemy.gold + " ouro e +" + enemy.ceReward + " energia.");
    state.combat = null;
    state.log = state.log.slice(0, 10);
    return state.lastResult;
  }

  function takeTurn(state, action, rng) {
    if (!state.combat || state.view !== "combat") return { ok: false, message: "Não há combate ativo." };
    var result, technique, before = state.log.length;
    if (action === "physical") {
      result = rollPhysical(state, rng);
    } else if (action === "technique") {
      technique = rollTechnique(state, rng);
      if (!technique.ok) return technique;
      result = technique.result;
    } else if (action === "guard" || action === "dodge") {
      result = { action: action };
    } else if (action === "meditate") {
      var restore = 17 + state.player.attributes.control * 3;
      var oldCe = state.player.ce;
      state.player.ce = clamp(state.player.ce + restore, 0, state.player.maxCe);
      result = { action: action, restored: state.player.ce - oldCe };
      state.log.unshift("Meditação: +" + result.restored + " energia amaldiçoada.");
    } else if (action === "potion") {
      if (state.inventory.potions <= 0) return { ok: false, message: "Nenhuma poção disponível." };
      if (state.player.hp >= state.player.maxHp) return { ok: false, message: "Sua vida já está cheia." };
      state.inventory.potions -= 1;
      var oldHp = state.player.hp;
      state.player.hp = clamp(state.player.hp + 38, 0, state.player.maxHp);
      result = { action: action, restored: state.player.hp - oldHp };
      state.log.unshift("Poção usada: +" + result.restored + " vida.");
    } else if (action === "domain") {
      if (!state.player.domainUnlocked || state.player.level < 8) return { ok: false, message: "Expansão de Domínio exige nível 8." };
      if (state.player.ce < 42) return { ok: false, message: "Energia insuficiente: são necessários 42 pontos." };
      state.player.ce -= 42;
      var domainRoll = rollDie(10, rng);
      var domainDamage = Math.max(1, Math.round(state.player.techniquePower * 1.8) + domainRoll - state.combat.defense);
      state.combat.hp = clamp(state.combat.hp - domainDamage, 0, state.combat.maxHp);
      state.combat.stunned = true;
      result = { action: action, damage: domainDamage, roll: domainRoll };
      state.log.unshift("Expansão de Domínio: d10 " + domainRoll + ", dano " + domainDamage + ". A expansão não pode gerar Black Flash.");
    } else {
      return { ok: false, message: "Ação de combate desconhecida." };
    }

    if (state.combat && state.combat.hp <= 0) {
      winCombat(state, result);
      return { ok: true, result: result, outcome: "victory", logAdded: state.log.length - before };
    }
    if (state.combat) {
      var enemyResult = resolveEnemyTurn(state, action, rng);
      result.enemy = enemyResult;
      if (state.combat && state.combat.hp <= 0) {
        winCombat(state, result);
        return { ok: true, result: result, outcome: "victory" };
      }
      if (enemyResult.defeated) {
        return { ok: true, result: result, outcome: state.lastResult ? state.lastResult.type : "defeat" };
      }
      if (state.combat) {
        chooseIntent(state.combat, rng);
        state.log.unshift("Turno " + state.combat.round + ": intenção inimiga — " + DATA.intents[state.combat.intent].name + ".");
      }
    }
    state.log = state.log.slice(0, 10);
    return { ok: true, result: result, outcome: "continue" };
  }

  function canRebirth(state) {
    return state.player.level >= 8 && state.player.wins >= 5 && !state.combat;
  }

  function rebirth(state) {
    if (!canRebirth(state)) return { ok: false, message: "Rebirth exige nível 8, cinco exorcismos e nenhum combate ativo." };
    var p = state.player;
    var newState = createState(state.techniqueId, p.name);
    newState.player.rebirths = p.rebirths + 1;
    newState.player.legacy = p.legacy + 1;
    newState.player.wins = p.wins;
    newState.player.gold = p.gold;
    newState.player.techniqueRank = p.techniqueRank;
    newState.player.domainUnlocked = false;
    refreshDerived(newState.player, false);
    newState.player.hp = newState.player.maxHp;
    newState.player.ce = newState.player.maxCe;
    newState.story = copy(state.story);
    newState.inventory = copy(state.inventory);
    newState.view = "mission";
    newState.story.dialogueNode = null;
    newState.log = ["REBIRTH " + newState.player.rebirths + ": a campanha recomeça com legado permanente.", "O nível foi reiniciado; técnica, maestria, escolhas narrativas e bônus de legado foram preservados."].concat(state.log).slice(0, 10);
    return { ok: true, state: newState };
  }

  function hpPercent(current, max) { return clamp(Math.round(current / Math.max(1, max) * 100), 0, 100); }
  function xpPercent(player) { return hpPercent(player.xp, player.nextXp); }
  function cePercent(player) { return hpPercent(player.ce, player.maxCe); }

  var api = {
    clamp: clamp, rollDie: rollDie, refreshDerived: refreshDerived, createState: createState,
    rankForLevel: rankForLevel, enemyFor: enemyFor, chooseIntent: chooseIntent, startCombat: startCombat,
    gainXP: gainXP, spendSkillPoint: spendSkillPoint, applyDialogueChoice: applyDialogueChoice,
    rollPhysical: rollPhysical, rollTechnique: rollTechnique, resolveEnemyTurn: resolveEnemyTurn,
    winCombat: winCombat, takeTurn: takeTurn, canRebirth: canRebirth, rebirth: rebirth,
    hpPercent: hpPercent, xpPercent: xpPercent, cePercent: cePercent, copy: copy
  };
  root.JFF_CORE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);