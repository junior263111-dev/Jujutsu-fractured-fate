const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../src/data.js");
require("../src/core.js");

const Core = global.JFF_CORE;
const DATA = global.JFF_DATA;

function sequence(values) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}
const highRoll = () => 0.999999;
const lowRoll = () => 0;

test("new character stores an innate technique and starts with skill points", () => {
  const state = Core.createState("blood", "Yu");
  assert.equal(state.techniqueId, "blood");
  assert.equal(state.player.name, "Yu");
  assert.equal(state.player.level, 1);
  assert.equal(state.player.skillPoints, 4);
  assert.equal(state.view, "dialogue");
  assert.equal(state.player.hp, state.player.maxHp);
  assert.equal(state.player.ce, state.player.maxCe);
});

test("enemy health and threat scale with level and rebirth history", () => {
  const base = Core.enemyFor("echo", 1, 0, 0);
  const leveled = Core.enemyFor("echo", 6, 2, 0);
  const reborn = Core.enemyFor("echo", 1, 5, 2);
  assert.ok(leveled.maxHp > base.maxHp);
  assert.ok(leveled.attack > base.attack);
  assert.ok(reborn.maxHp > base.maxHp);
});

test("spending an attribute point updates derived stats and uses one point", () => {
  const state = Core.createState("ratio");
  const oldMaxHp = state.player.maxHp;
  const oldStrength = state.player.attributes.strength;
  const result = Core.spendSkillPoint(state, "vitality");
  assert.equal(result.ok, true);
  assert.equal(state.player.skillPoints, 3);
  assert.equal(state.player.attributes.vitality, 2);
  assert.ok(state.player.maxHp > oldMaxHp);
  assert.ok(state.player.hp > 0);
  assert.equal(state.player.attributes.strength, oldStrength);
});

test("technique mastery costs two skill points and has a cap", () => {
  const state = Core.createState("shadows");
  const result = Core.spendSkillPoint(state, "technique");
  assert.equal(result.ok, true);
  assert.equal(state.player.skillPoints, 2);
  assert.equal(state.player.techniqueRank, 2);
  state.player.skillPoints = 0;
  assert.equal(Core.spendSkillPoint(state, "technique").ok, false);
});

test("XP thresholds level up and grant three skill points", () => {
  const state = Core.createState("speech");
  const initialPoints = state.player.skillPoints;
  state.player.hp = 20;
  state.player.ce = 3;
  const levels = Core.gainXP(state, 100);
  assert.equal(levels, 1);
  assert.equal(state.player.level, 2);
  assert.equal(state.player.xp, 0);
  assert.equal(state.player.skillPoints, initialPoints + 3);
  assert.equal(state.player.hp, state.player.maxHp);
  assert.equal(state.player.ce, state.player.maxCe);
});

test("rank thresholds are consistent", () => {
  assert.equal(Core.rankForLevel(1), "Grau 4");
  assert.equal(Core.rankForLevel(3), "Grau 3");
  assert.equal(Core.rankForLevel(5), "Grau 2");
  assert.equal(Core.rankForLevel(8), "Grau 1");
  assert.equal(Core.rankForLevel(16), "Grau Especial");
});

test("dialogue choice persists route flags and applies rewards", () => {
  const state = Core.createState("ratio");
  const result = Core.applyDialogueChoice(state, "analyze");
  assert.equal(result.ok, true);
  assert.equal(state.story.openingChoice, "analyze");
  assert.equal(state.story.clues, 1);
  assert.equal(state.view, "mission");
  assert.equal(state.story.dialogueNode, null);
  assert.ok(state.player.ce > 0);
});

test("the first physical attack can roll a Black Flash, but consumes only one player turn", () => {
  const state = Core.createState("ratio");
  Core.startCombat(state, "echo", lowRoll);
  const hpBefore = state.player.hp;
  const result = Core.takeTurn(state, "physical", sequence([0.999999, 0.999999, 0.999999, 0, 0, 0]));
  assert.equal(result.ok, true);
  assert.equal(result.result.blackFlash, true);
  assert.equal(state.player.hp, hpBefore, "Black Flash should interrupt this enemy turn");
  assert.ok(state.log.some(line => line.includes("BLACK FLASH!")));
  assert.equal(state.view, "combat");
});

test("innate techniques never trigger Black Flash; physical attack has the separate dice rule", () => {
  const state = Core.createState("blood");
  Core.startCombat(state, "echo", highRoll);
  const result = Core.takeTurn(state, "technique", highRoll);
  assert.equal(result.ok, true);
  assert.equal(result.result.action, "technique");
  assert.equal(result.result.blackFlash, false);
  assert.equal(state.combat.bleedTurns, 1, "the enemy turn should consume one bleed tick");
  assert.ok(!state.log.some(line => line.includes("BLACK FLASH!")));
});

test("guard action reduces the incoming damage on a strike intent", () => {
  const state = Core.createState("ratio");
  Core.startCombat(state, "echo", lowRoll);
  const initialHp = state.player.hp;
  const result = Core.takeTurn(state, "guard", sequence([0.5, 0.4, 0]));
  assert.equal(result.ok, true);
  assert.ok(state.player.hp < initialHp);
  assert.ok(initialHp - state.player.hp < 12, "guard should substantially reduce a normal strike");
});

test("first exorcism opens aftermath dialogue and pays progression rewards", () => {
  const state = Core.createState("speech");
  Core.startCombat(state, "echo", lowRoll);
  state.combat.hp = 1;
  const reward = Core.winCombat(state);
  assert.equal(reward.type, "victory");
  assert.equal(state.player.wins, 1);
  assert.equal(state.story.chapterOneComplete, true);
  assert.equal(state.story.dialogueNode, "aftermath");
  assert.equal(state.view, "dialogue");
  assert.equal(state.combat, null);
});

test("rebirth requires level 8 and five exorcisms", () => {
  const state = Core.createState("ratio");
  assert.equal(Core.canRebirth(state), false);
  const result = Core.rebirth(state);
  assert.equal(result.ok, false);
  state.player.level = 8;
  state.player.wins = 5;
  assert.equal(Core.canRebirth(state), true);
});

test("rebirth resets level while preserving technique mastery, route, and legacy", () => {
  const state = Core.createState("shadows", "Akira");
  state.player.level = 8;
  state.player.wins = 5;
  state.player.techniqueRank = 3;
  state.player.gold = 42;
  state.story.chapterOneComplete = true;
  state.story.clues = 3;
  state.story.endingChoice = "research";
  state.inventory.potions = 4;

  const result = Core.rebirth(state);
  assert.equal(result.ok, true);
  assert.equal(result.state.player.level, 1);
  assert.equal(result.state.player.rebirths, 1);
  assert.equal(result.state.player.legacy, 1);
  assert.equal(result.state.player.name, "Akira");
  assert.equal(result.state.player.wins, 5);
  assert.equal(result.state.player.techniqueRank, 3);
  assert.equal(result.state.player.gold, 42);
  assert.equal(result.state.techniqueId, "shadows");
  assert.equal(result.state.story.chapterOneComplete, true);
  assert.equal(result.state.story.clues, 3);
  assert.equal(result.state.story.endingChoice, "research");
  assert.equal(result.state.inventory.potions, 4);
  assert.equal(result.state.player.hp, result.state.player.maxHp);
});

test("the XP curve reaches level 3 without the old 1.32 jump", () => {
  const state = Core.createState("ratio");
  assert.equal(state.player.nextXp, 100);
  Core.gainXP(state, 100);
  assert.equal(state.player.level, 2);
  assert.equal(state.player.nextXp, 118);
  Core.gainXP(state, 118);
  assert.equal(state.player.level, 3);
});

test("flow memory training awards first-clear XP and reduced replay XP", () => {
  const state = Core.createState("ratio");
  assert.equal(Core.startTraining(state, "flow").ok, true);
  const pattern = DATA.training.flow.patterns[state.training.patternIndex];
  assert.equal(Core.applyTrainingChoice(state, "start").ok, true);
  let result;
  for (const step of pattern) result = Core.applyTrainingChoice(state, step);
  assert.equal(result.finished, true);
  assert.equal(state.training.result.score, 4);
  assert.equal(state.training.result.xp, 98);
  assert.equal(state.story.trainingCompleted.flow, true);
  state.training = null; state.view = "mission";
  Core.startTraining(state, "flow");
  Core.applyTrainingChoice(state, "start");
  for (const step of DATA.training.flow.patterns[state.training.patternIndex]) result = Core.applyTrainingChoice(state, step);
  assert.equal(state.training.result.xp, 14);
});

test("reflex mini-game evaluates tactical choices in all three scenarios", () => {
  const state = Core.createState("shadows");
  Core.startTraining(state, "reflex");
  let result;
  for (const answer of DATA.training.reflex.scenarios.map(item => item.correct)) result = Core.applyTrainingChoice(state, answer);
  assert.equal(result.finished, true);
  assert.equal(state.training.result.score, 3);
  assert.equal(state.story.trainingCompleted.reflex, true);
});

test("barrier investigation cannot start before chapter one", () => {
  const state = Core.createState("blood");
  assert.equal(Core.startCombat(state, "devourer").ok, false);
  assert.equal(Core.startTraining(state, "investigation").ok, false);
  assert.equal(state.story.investigationComplete, false);
});

test("successful barrier investigation unlocks the second operation and adds clues", () => {
  const state = Core.createState("blood");
  state.story.chapterOneComplete = true; state.view = "mission";
  Core.startTraining(state, "investigation");
  let result;
  for (const question of DATA.training.investigation.questions) result = Core.applyTrainingChoice(state, question.choices.find(option => option.correct).id);
  assert.equal(result.finished, true);
  assert.equal(state.story.investigationComplete, true);
  assert.equal(state.story.clues, 3);
  state.training = null; state.view = "mission";
  assert.equal(Core.startCombat(state, "devourer").ok, true);
});

test("the rebalance reduces first-enemy HP and softens level scaling", () => {
  const echo = Core.enemyFor("echo", 1, 0, 0);
  const leveled = Core.enemyFor("echo", 6, 2, 0);
  const devourer = Core.enemyFor("devourer", 1, 0, 0);
  assert.equal(echo.maxHp, 70);
  assert.ok(leveled.maxHp > echo.maxHp);
  assert.ok(leveled.maxHp < echo.maxHp * 1.4);
  assert.ok(devourer.maxHp > echo.maxHp);
});

test("talisman cancels the current enemy intent and consumes exactly one seal", () => {
  const state = Core.createState("ratio");
  Core.startCombat(state, "echo", lowRoll);
  state.combat.intent = "heavy";
  const sealsBefore = state.inventory.seals;
  const result = Core.takeTurn(state, "seal", sequence([0.1, 0.1, 0.1]));
  assert.equal(result.ok, true);
  assert.equal(result.result.action, "seal");
  assert.equal(state.inventory.seals, sealsBefore - 1);
  assert.equal(state.player.hp, state.player.maxHp);
  assert.ok(state.log.some(line => line.includes("intenção") && line.includes("anulada")));
});

test("guarding an announced heavy strike counters damage while reducing incoming damage", () => {
  const state = Core.createState("ratio");
  Core.startCombat(state, "echo", highRoll);
  state.combat.intent = "heavy";
  const enemyHp = state.combat.hp;
  const hpBefore = state.player.hp;
  const result = Core.takeTurn(state, "guard", sequence([0.9, 0.99, 0.5]));
  assert.equal(result.ok, true);
  assert.ok(result.result.enemy.counterDamage > 0);
  assert.ok(state.combat.hp < enemyHp);
  assert.ok(hpBefore - state.player.hp < state.combat.attack + 8);
});

test("the Sentinel enters phase two once below half health", () => {
  const state = Core.createState("ratio");
  state.story.chapterTwoComplete = true; state.player.level = 5;
  Core.refreshDerived(state.player, false); state.player.hp = state.player.maxHp;
  Core.startCombat(state, "sentinel", lowRoll);
  const originalAttack = state.combat.attack;
  state.combat.hp = Math.floor(state.combat.maxHp * 0.51);
  assert.equal(Core.triggerPhaseChange(state), false);
  state.combat.hp = Math.floor(state.combat.maxHp * 0.49);
  assert.equal(Core.triggerPhaseChange(state), true);
  assert.equal(state.combat.phase, 2);
  assert.equal(state.combat.attack, originalAttack + 3);
  assert.equal(Core.triggerPhaseChange(state), false);
});

test("contracts can be claimed once and pay their published rewards", () => {
  const state = Core.createState("ratio");
  state.story.trainingCompleted = { flow: true, reflex: true };
  assert.equal(Core.contractReady(state, "training_pair"), true);
  const claimed = Core.claimContract(state, "training_pair");
  assert.equal(claimed.ok, true);
  assert.equal(claimed.reward.xp, 110);
  assert.equal(state.player.gold, 32);
  assert.equal(Core.claimContract(state, "training_pair").ok, false);
});


test("character specializations change derived stats and survive rebirth", () => {
  const balanced = Core.createState("ratio", "A", "balanced");
  const vanguard = Core.createState("ratio", "B", "vanguard");
  const conduit = Core.createState("ratio", "C", "conduit");
  const guardian = Core.createState("ratio", "D", "guardian");
  assert.equal(vanguard.player.attackPower, balanced.player.attackPower + 2);
  assert.equal(conduit.player.maxCe, balanced.player.maxCe + 15);
  assert.equal(conduit.player.techniquePower, balanced.player.techniquePower + 2);
  assert.equal(guardian.player.maxHp, balanced.player.maxHp + 18);
  assert.equal(guardian.player.defense, balanced.player.defense + 1);
  guardian.player.level = 8; guardian.player.wins = 5;
  const reborn = Core.rebirth(guardian);
  assert.equal(reborn.state.player.pathId, "guardian");
});

test("technique catalogue has a cost, effect, and descriptive identity for each choice", () => {
  Object.values(DATA.techniques).forEach(technique => {
    assert.ok(technique.name);
    assert.ok(technique.cost > 0);
    assert.ok(technique.effect);
    assert.ok(technique.description);
  });
});