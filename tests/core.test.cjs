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

test("technique catalogue has a cost, effect, and descriptive identity for each choice", () => {
  Object.values(DATA.techniques).forEach(technique => {
    assert.ok(technique.name);
    assert.ok(technique.cost > 0);
    assert.ok(technique.effect);
    assert.ok(technique.description);
  });
});