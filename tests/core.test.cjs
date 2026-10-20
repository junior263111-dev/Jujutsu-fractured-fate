const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../src/data.js");
require("../src/core.js");

const Core = global.JFF_CORE;

test("new save starts with valid resources and selected style", () => {
  const state = Core.createState("shadow");
  assert.equal(state.styleId, "shadow");
  assert.equal(state.player.level, 1);
  assert.equal(state.player.hp, state.player.maxHp);
  assert.equal(state.player.ce, state.player.maxCe);
  assert.equal(state.story.openingChoice, null);
});

test("enemy scaling grows with player progression", () => {
  const baseline = Core.enemyFor("echo", 1, 0);
  const stronger = Core.enemyFor("echo", 5, 4);
  assert.ok(stronger.maxHp > baseline.maxHp);
  assert.ok(stronger.attack > baseline.attack);
});

test("XP levels up and restores player resources", () => {
  const state = Core.createState("echo");
  state.player.hp = 25;
  state.player.ce = 3;
  const levels = Core.gainXP(state, 80);
  assert.equal(levels, 1);
  assert.equal(state.player.level, 2);
  assert.equal(state.player.xp, 0);
  assert.equal(state.player.hp, state.player.maxHp);
  assert.equal(state.player.ce, state.player.maxCe);
  assert.equal(state.player.attack, 14);
});

test("rank thresholds produce expected progression labels", () => {
  assert.equal(Core.rankForLevel(1), "Grau 4");
  assert.equal(Core.rankForLevel(3), "Grau 3");
  assert.equal(Core.rankForLevel(8), "Grau 1");
  assert.equal(Core.rankForLevel(16), "Grau Especial");
});

test("incoming damage respects player defense", () => {
  const state = Core.createState("flow");
  const before = state.player.hp;
  const dealt = Core.applyPlayerDamage(state, 10);
  assert.equal(dealt, 6);
  assert.equal(state.player.hp, before - 6);
});

test("defeating the first mission sets the story-complete state", () => {
  const state = Core.createState("echo");
  Core.startCombat(state, "echo");
  const reward = Core.winCombat(state);
  assert.equal(reward.type, "victory");
  assert.equal(state.player.wins, 1);
  assert.equal(state.story.chapterOneComplete, true);
  assert.equal(state.view, "ending");
  assert.equal(state.combat, null);
});

test("rebirth is blocked until level and exorcism requirements are met", () => {
  const state = Core.createState("shadow");
  assert.equal(Core.canRebirth(state), false);
  const result = Core.rebirth(state);
  assert.equal(result.ok, false);
});

test("rebirth resets level while preserving story and permanent legacy", () => {
  const state = Core.createState("echo");
  state.player.level = 6;
  state.player.wins = 3;
  state.player.attack = 20;
  state.story.chapterOneComplete = true;
  state.story.clueCount = 2;
  state.inventory.potions = 4;

  const result = Core.rebirth(state);
  assert.equal(result.ok, true);
  assert.equal(result.state.player.level, 1);
  assert.equal(result.state.player.rebirths, 1);
  assert.equal(result.state.player.legacy, 1);
  assert.equal(result.state.player.attack, 14);
  assert.equal(result.state.player.maxHp, 115);
  assert.equal(result.state.player.wins, 3);
  assert.equal(result.state.story.chapterOneComplete, true);
  assert.equal(result.state.story.clueCount, 2);
  assert.equal(result.state.inventory.potions, 4);
});