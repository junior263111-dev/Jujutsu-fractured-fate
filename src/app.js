(function () {
  "use strict";
  var DATA = window.JFF_DATA;
  var CORE = window.JFF_CORE;
  var SAVE_KEY = "jujutsu-fractured-fate-save-v1";
  var state = null;
  var selectedStyle = "echo";
  var combo = 0;
  var comboLastHitAt = 0;
  var blackFlashReadyUntil = 0;
  var heavyReadyAt = 0;
  var techniqueReadyAt = 0;
  var dodgeReadyAt = 0;
  var dodgeUntil = 0;
  var guarding = false;
  var powerHits = 0;
  var domainUntil = 0;
  var enemyStartTimer = null;
  var enemyResolveTimer = null;
  var comboExpireTimer = null;
  var blackFlashTimer = null;
  var toastTimer = null;
  var feedbackMessage = "Leia o ritmo da maldição e comece com um golpe rápido.";
  var feedbackKind = "";
  var $ = function (id) { return document.getElementById(id); };

  function safeLoad() {
    try {
      var value = localStorage.getItem(SAVE_KEY);
      if (!value) return null;
      var parsed = JSON.parse(value);
      if (parsed && parsed.schema === 1 && parsed.player && DATA.styles[parsed.styleId]) return parsed;
    } catch (err) { /* Salvamento inválido: mostrar a criação de ficha. */ }
    return null;
  }
  function persist(silent) {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      if (!silent) toast("Progresso salvo neste navegador.");
    } catch (err) {
      if (!silent) toast("O navegador não permitiu salvar. Confira o espaço de armazenamento.");
    }
  }
  function toast(message) {
    var node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove("show"); }, 2300);
  }
  function pushLog(message) {
    if (!state) return;
    state.log.unshift(message);
    state.log = state.log.slice(0, 9);
  }
  function randomInt(max) { return Math.floor(Math.random() * max); }
  function setFeedback(message, kind) {
    feedbackMessage = message;
    feedbackKind = kind || "";
    var node = $("battle-feedback");
    if (node) {
      node.textContent = message;
      node.className = "battle-feedback" + (feedbackKind ? " " + feedbackKind : "");
    }
  }
  function stopTimers() {
    [enemyStartTimer, enemyResolveTimer, comboExpireTimer, blackFlashTimer].forEach(function (timer) {
      if (timer) clearTimeout(timer);
    });
    enemyStartTimer = enemyResolveTimer = comboExpireTimer = blackFlashTimer = null;
  }
  function resetFightInput() {
    combo = 0;
    comboLastHitAt = 0;
    blackFlashReadyUntil = 0;
    heavyReadyAt = 0;
    techniqueReadyAt = 0;
    dodgeReadyAt = 0;
    dodgeUntil = 0;
    guarding = false;
    powerHits = 0;
    domainUntil = 0;
    feedbackMessage = "Leia o ritmo da maldição e comece com um golpe rápido.";
    feedbackKind = "";
  }
  function showIntro() {
    $("intro-screen").classList.remove("hidden");
    $("game-screen").classList.add("hidden");
    var saved = safeLoad();
    $("resume-btn").classList.toggle("hidden", !saved);
    $("save-summary").textContent = saved
      ? "Salvamento encontrado: nível " + saved.player.level + " · " + saved.player.wins + " exorcismo(s) · " + saved.player.rebirths + " rebirth(s)."
      : "Crie uma nova ficha para iniciar o Capítulo 01.";
    selectedStyle = saved ? saved.styleId : selectedStyle;
    updateStyleCards();
  }
  function showGame() {
    $("intro-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
  }
  function updateStyleCards() {
    document.querySelectorAll("[data-style]").forEach(function (node) {
      node.classList.toggle("selected", node.getAttribute("data-style") === selectedStyle);
    });
  }
  function startNew(styleId) {
    if (safeLoad() && !window.confirm("Começar uma nova jornada? O salvamento anterior será substituído.")) return;
    stopTimers();
    selectedStyle = DATA.styles[styleId] ? styleId : "echo";
    state = CORE.createState(selectedStyle);
    resetFightInput();
    showGame();
    render();
    persist(true);
  }
  function resumeGame() {
    state = safeLoad();
    if (!state) { toast("Nenhum salvamento válido foi encontrado."); showIntro(); return; }
    selectedStyle = state.styleId;
    resetFightInput();
    if (state.combat) state.combat.telegraph = false;
    showGame();
    render();
    if (state.combat) scheduleEnemyAttack(650);
    toast("Jornada restaurada.");
  }
  function toTitle() {
    persist(true);
    stopTimers();
    state = null;
    showIntro();
  }
  function openMenu() {
    toast("Atalhos: J golpe · K pesado · Q técnica · F Black Flash · Espaço defesa · E esquiva · R domínio.");
  }

  function applyOpeningChoice(choiceId) {
    if (!state || state.story.openingChoice) return;
    var choice = DATA.story.choices.filter(function (item) { return item.id === choiceId; })[0];
    if (!choice) return;
    state.story.openingChoice = choiceId;
    if (choice.xp) CORE.gainXP(state, choice.xp);
    if (choice.hp) state.player.hp = Math.min(state.player.maxHp, state.player.hp + choice.hp);
    if (choice.ce) state.player.ce = Math.min(state.player.maxCe, state.player.ce + choice.ce);
    if (choiceId === "rescue") state.story.allyTrust += 1;
    if (choiceId === "trace") state.story.clueCount += 1;
    pushLog(choice.outcome);
    state.view = "mission";
    toast("Decisão registrada. A rota narrativa foi atualizada.");
    render();
    persist(true);
  }
  function applyEndingChoice(choiceId) {
    if (!state || state.story.endingChoice) return;
    var choice = DATA.story.endings.filter(function (item) { return item.id === choiceId; })[0];
    if (!choice) return;
    state.story.endingChoice = choiceId;
    if (choiceId === "research") {
      state.story.clueCount += 1;
      state.player.ce = Math.min(state.player.maxCe, state.player.ce + 12);
    } else {
      state.story.allyTrust += 1;
      state.inventory.seals += 1;
    }
    pushLog(choice.outcome);
    state.view = "mission";
    toast("Desfecho registrado. Novos caminhos poderão divergir dele.");
    render();
    persist(true);
  }
  function beginCombat(enemyId) {
    if (!state || state.combat) return;
    stopTimers();
    resetFightInput();
    CORE.startCombat(state, enemyId);
    showGame();
    render();
    scheduleEnemyAttack(1550);
    persist(true);
  }
  function finishVictory() {
    if (!state || !state.combat) return;
    stopTimers();
    var defeatedName = state.combat.name;
    CORE.winCombat(state);
    combo = 0;
    blackFlashReadyUntil = 0;
    guarding = false;
    setFeedback("Exorcismo concluído: " + defeatedName + " foi derrotado.", "positive");
    render();
    persist(true);
  }
  function finishDefeat() {
    if (!state || !state.combat) return;
    stopTimers();
    CORE.loseCombat(state);
    resetFightInput();
    setFeedback("Você recuou e foi estabilizado pela equipe de apoio.", "negative");
    render();
    persist(true);
  }
  function damageEnemy(amount, label) {
    if (!state || !state.combat) return;
    var target = state.combat;
    var damage = Math.max(1, Math.round(amount));
    if (target.exposed) {
      damage = Math.round(damage * 1.3);
      target.exposed = false;
      pushLog("A abertura criada pela técnica ampliou o golpe seguinte.");
    }
    if (Date.now() < domainUntil) {
      damage = Math.round(damage * 1.22);
      domainUntil -= 900;
    }
    target.hp = Math.max(0, target.hp - damage);
    pushLog(label + " causou " + damage + " de dano.");
    if (target.hp <= 0) {
      finishVictory();
      return damage;
    }
    render();
    persist(true);
    return damage;
  }
  function scheduleEnemyAttack(delay) {
    if (!state || !state.combat) return;
    if (enemyStartTimer) clearTimeout(enemyStartTimer);
    if (enemyResolveTimer) clearTimeout(enemyResolveTimer);
    enemyStartTimer = setTimeout(function () {
      if (!state || !state.combat) return;
      state.combat.telegraph = true;
      state.combat.telegraphAt = Date.now();
      pushLog(state.combat.name + " começou a preparar um ataque.");
      render();
      enemyResolveTimer = setTimeout(resolveEnemyAttack, 880);
    }, delay || 1650);
  }
  function resolveEnemyAttack() {
    if (!state || !state.combat) return;
    var enemy = state.combat;
    enemy.telegraph = false;
    $("telegraph").classList.add("hidden");
    $("enemy-action-label").textContent = "Recalculando postura";
    if (enemy.stunned) {
      enemy.stunned = false;
      guarding = false;
      setFeedback("Interrupção bem-sucedida: a maldição perdeu o turno.", "positive");
      pushLog("O inimigo perdeu a janela de ataque.");
      render();
      scheduleEnemyAttack(1150);
      persist(true);
      return;
    }
    if (Date.now() < dodgeUntil) {
      setFeedback("Esquiva perfeita! Você saiu da trajetória e recuperou o ritmo.", "positive");
      pushLog("Esquiva perfeita: nenhum dano recebido.");
      if (state.styleId === "shadow") state.player.ce = Math.min(state.player.maxCe, state.player.ce + 6);
      damageEnemy(5 + Math.floor(state.player.attack * 0.35), "Contra-ataque da esquiva");
      if (!state || !state.combat) return;
      guarding = false;
      scheduleEnemyAttack(1250);
      persist(true);
      return;
    }
    var incoming = enemy.attack + randomInt(5);
    if (guarding) incoming = Math.round(incoming * 0.36);
    if (enemy.openingGuard) {
      incoming = Math.round(incoming * 0.45);
      enemy.openingGuard = false;
    }
    var dealt = CORE.applyPlayerDamage(state, incoming);
    guarding = false;
    pushLog(enemy.name + " atingiu você por " + dealt + " de dano.");
    if (state.player.hp <= 0) {
      finishDefeat();
      return;
    }
    setFeedback(guarding ? "Você reduziu o impacto do ataque." : enemy.name + " atacou. Observe o próximo telegráfico.", guarding ? "positive" : "negative");
    render();
    persist(true);
    scheduleEnemyAttack(1450);
  }
  function quickAttack() {
    if (!state || state.view !== "combat" || !state.combat) return;
    var now = Date.now();
    if (now - comboLastHitAt > 950) combo = 0;
    combo = combo >= 4 ? 1 : combo + 1;
    comboLastHitAt = now;
    if (comboExpireTimer) clearTimeout(comboExpireTimer);
    comboExpireTimer = setTimeout(function () {
      if (Date.now() - comboLastHitAt >= 950) {
        combo = 0;
        blackFlashReadyUntil = 0;
        render();
      }
    }, 980);
    var multipliers = [0, 0.72, 0.82, 0.98, 1.34];
    var damage = state.player.attack * multipliers[combo] + 2 + randomInt(4);
    if (state.styleId === "echo" && combo === 4) damage *= 1.28;
    if (powerHits > 0) { damage *= 1.35; powerHits -= 1; }
    damageEnemy(damage, "Golpe " + combo + "/4");
    if (!state || !state.combat) return;
    if (combo >= 3 && state.player.ce >= 12) {
      blackFlashReadyUntil = Date.now() + 430;
      if (blackFlashTimer) clearTimeout(blackFlashTimer);
      blackFlashTimer = setTimeout(function () {
        if (Date.now() >= blackFlashReadyUntil) {
          blackFlashReadyUntil = 0;
          setFeedback("A janela de Black Flash fechou. Construa um combo para tentar de novo.");
          render();
        }
      }, 450);
    }
    setFeedback(combo === 4 ? "FINISHER! Você completou a sequência de quatro golpes." : "Golpe " + combo + " conectado. Continue a sequência para abrir uma janela de timing.", combo === 4 ? "positive" : "");
    render();
  }
  function heavyAttack() {
    if (!state || state.view !== "combat" || !state.combat) return;
    var now = Date.now();
    if (now < heavyReadyAt) { toast("Golpe pesado recarregando."); return; }
    heavyReadyAt = now + 1250;
    var damage = state.player.attack * 1.45 + 4 + randomInt(5);
    if (combo >= 2) damage += 4;
    if (powerHits > 0) { damage *= 1.35; powerHits -= 1; }
    combo = 0;
    blackFlashReadyUntil = 0;
    damageEnemy(damage, "Golpe pesado");
    if (state && state.combat) setFeedback("Golpe pesado conectado. A sequência rápida foi encerrada.", "positive");
    render();
  }
  function useTechnique() {
    if (!state || state.view !== "combat" || !state.combat) return;
    var now = Date.now();
    if (now < techniqueReadyAt) { toast("Técnica inata recarregando."); return; }
    var style = DATA.styles[state.styleId];
    if (state.player.ce < style.ceCost) { toast("Energia amaldiçoada insuficiente."); return; }
    techniqueReadyAt = now + 1450;
    state.player.ce -= style.ceCost;
    if (style.effect === "expose") {
      state.combat.exposed = true;
      damageEnemy(state.player.attack * style.damageScale + 4 + randomInt(5), style.techniqueName);
      if (state && state.combat) setFeedback("Impacto conectado. O inimigo ficou vulnerável ao próximo golpe.", "positive");
    } else if (style.effect === "stun") {
      state.combat.stunned = true;
      damageEnemy(state.player.attack * style.damageScale + 3 + randomInt(5), style.techniqueName);
      if (state && state.combat) setFeedback("Laço aplicado. Se o ataque estiver chegando, ele será interrompido.", "positive");
    } else {
      powerHits = Math.max(powerHits, 3);
      damageEnemy(state.player.attack * style.damageScale + 2 + randomInt(4), style.techniqueName);
      if (state && state.combat) setFeedback("Reforço ativo: os próximos três golpes recebem potência adicional.", "positive");
    }
    if (state) { render(); persist(true); }
  }
  function blackFlash() {
    if (!state || state.view !== "combat" || !state.combat) return;
    var now = Date.now();
    if (now > blackFlashReadyUntil || combo < 3) {
      setFeedback("Timing perdido. Acerte três golpes dentro da janela de combo e pressione F logo após o impacto.", "negative");
      render();
      return;
    }
    if (state.player.ce < 12) {
      setFeedback("Energia amaldiçoada insuficiente para manter o fluxo do golpe.", "negative");
      return;
    }
    state.player.ce -= 12;
    blackFlashReadyUntil = 0;
    if (blackFlashTimer) clearTimeout(blackFlashTimer);
    combo = Math.min(4, combo + 1);
    var damage = state.player.attack * 2.5 + randomInt(6);
    if (powerHits > 0) { damage *= 1.35; powerHits -= 1; }
    damageEnemy(damage, "BLACK FLASH");
    if (state && state.combat) setFeedback("BLACK FLASH! A janela foi acertada. Seu fluxo de energia entrou em ressonância.", "positive");
    render();
    if (state) persist(true);
  }
  function guard() {
    if (!state || state.view !== "combat" || !state.combat) return;
    guarding = true;
    if (state.combat.telegraph) setFeedback("Guarda levantada! O próximo impacto será reduzido.", "positive");
    else setFeedback("Você preparou a guarda. Mantenha a leitura do próximo ataque.");
    render();
  }
  function dodge() {
    if (!state || state.view !== "combat" || !state.combat) return;
    var now = Date.now();
    if (now < dodgeReadyAt) { toast("Esquiva recarregando."); return; }
    dodgeReadyAt = now + 1650;
    dodgeUntil = now + 720;
    setFeedback(state.combat.telegraph ? "Esquiva! Saia da trajetória antes do impacto." : "Você mudou de posição. A janela de esquiva é curta.");
    render();
  }
  function expandDomain() {
    if (!state || state.view !== "combat" || !state.combat) return;
    if (state.player.level < 8) { toast("Expansão de Domínio desbloqueada no nível 8."); return; }
    if (state.player.ce < 35) { toast("Você precisa de 35 pontos de energia amaldiçoada."); return; }
    state.player.ce -= 35;
    domainUntil = Date.now() + 8000;
    state.combat.stunned = true;
    var damage = state.player.attack * 2.05 + 15 + randomInt(12);
    damageEnemy(damage, "Expansão de Domínio");
    if (state && state.combat) setFeedback("A barreira se fecha. O domínio fortalece os próximos golpes e interrompe a ação inimiga.", "positive");
    render();
    if (state) persist(true);
  }
  function usePotion() {
    if (!state) return;
    if (state.inventory.potions <= 0) { toast("Você não tem poções de recuperação."); return; }
    if (state.player.hp >= state.player.maxHp) { toast("Sua vida já está cheia."); return; }
    state.inventory.potions -= 1;
    var restored = Math.min(32, state.player.maxHp - state.player.hp);
    state.player.hp += restored;
    pushLog("Poção utilizada: +" + restored + " de vida.");
    toast("Vida restaurada: +" + restored + ".");
    render();
    persist(true);
  }
  function performRebirth() {
    if (!state) return;
    var result = CORE.rebirth(state);
    if (!result.ok) { toast(result.message); return; }
    stopTimers();
    state = result.state;
    resetFightInput();
    toast("REBIRTH " + state.player.rebirths + " concluído. Seu legado ficou mais forte.");
    render();
    persist(true);
  }

  function makeChoiceButton(index, title, description, action) {
    return '<button class="choice-card" data-action="' + action + '"><span class="choice-num">ESCOLHA 0' + (index + 1) + '</span><strong>' + title + '</strong><p>' + description + '</p><span class="choice-arrow" aria-hidden="true">↗</span></button>';
  }
  function missionButton(title, description, action, disabled, badge) {
    return '<button class="choice-card mission-card" data-action="' + action + '"' + (disabled ? " disabled" : "") + '><span class="choice-num">' + badge + '</span><strong>' + title + '</strong><p>' + description + '</p><span class="choice-arrow" aria-hidden="true">↗</span></button>';
  }
  function renderView() {
    var view = state.view;
    $("story-panel").classList.toggle("hidden", view !== "story");
    $("combat-panel").classList.toggle("hidden", view !== "combat");
    $("ending-panel").classList.toggle("hidden", view !== "ending");
    $("mission-panel").classList.toggle("hidden", view !== "mission");

    if (view === "story") {
      $("chapter-label").textContent = "CAPÍTULO 01 · KUROHAMA";
      $("screen-title").textContent = "Incidente de Kurohama";
      $("scene-kicker").textContent = "ARQUIVO DE MISSÃO · TÓQUIO";
      $("scene-title").textContent = DATA.story.openingTitle;
      $("scene-description").textContent = DATA.story.opening;
      $("scene-location").textContent = "DISTRITO DE KUROHAMA";
      $("scene-condition").textContent = "RISCO DESCONHECIDO";
      $("state-chip").textContent = "ESCOLHA NARRATIVA";
      $("story-heading").textContent = "Sua primeira decisão";
      $("story-text").textContent = "Você tem pouco tempo antes de entrar na estação. A equipe de apoio está incomunicável. Qual será sua prioridade?";
      $("story-options").innerHTML = makeChoiceButton(0, DATA.story.choices[0].title, DATA.story.choices[0].description, "opening:rescue") + makeChoiceButton(1, DATA.story.choices[1].title, DATA.story.choices[1].description, "opening:trace");
    } else if (view === "combat") {
      $("chapter-label").textContent = "CAPÍTULO 01 · COMBATE";
      $("screen-title").textContent = "Exorcismo em andamento";
      $("scene-kicker").textContent = "CONTATO HOSTIL · EM TEMPO REAL";
      $("scene-title").textContent = state.combat.name;
      $("scene-description").textContent = "Observe os telegráficos, conecte combos e escolha o momento certo para gastar energia amaldiçoada.";
      $("scene-location").textContent = "ZONA DE EXORCISMO";
      $("scene-condition").textContent = state.combat.telegraph ? "ATAQUE IMINENTE" : "ADVERSÁRIO ATIVO";
      $("combat-heading").textContent = state.combat.name;
      $("combat-grade").textContent = state.combat.grade.toUpperCase();
      $("combat-description").textContent = DATA.enemies[state.combat.id].description;
      $("enemy-symbol").textContent = state.combat.symbol;
      $("enemy-name").textContent = state.combat.name;
      $("enemy-hp-text").textContent = state.combat.hp + " / " + state.combat.maxHp;
      $("enemy-hp-bar").style.width = CORE.hpPercent({ hp: state.combat.hp, maxHp: state.combat.maxHp }) + "%";
      $("enemy-status").textContent = state.combat.stunned ? "INTERROMPIDO" : state.combat.exposed ? "VULNERÁVEL" : state.combat.telegraph ? "PREPARANDO GOLPE" : "OBSERVANDO";
      $("enemy-action-label").textContent = state.combat.telegraph ? "Impacto em instantes" : "Lendo seus movimentos";
      $("telegraph").classList.toggle("hidden", !state.combat.telegraph);
      var st = DATA.styles[state.styleId];
      $("technique-button-title").textContent = st.techniqueName;
      $("technique-button-cost").textContent = st.ceCost + " energia amaldiçoada";
      $("black-flash-btn").disabled = Date.now() > blackFlashReadyUntil || combo < 3 || state.player.ce < 12;
      $("black-flash-state").textContent = Date.now() <= blackFlashReadyUntil && combo >= 3 ? "JANELA ATIVA · PRESSIONE F" : "Combo 3+ e timing preciso";
      $("domain-btn").disabled = state.player.level < 8 || state.player.ce < 35;
      $("domain-state").textContent = state.player.level < 8 ? "Desbloqueia no nível 8" : domainUntil > Date.now() ? "DOMÍNIO ATIVO · golpes reforçados" : "35 energia · interrupção e pressão";
      $("heavy-cooldown").textContent = "";
      $("dodge-cooldown").textContent = Date.now() < dodgeReadyAt ? "Esquiva recarregando" : "Janela curta · recarga";
      $("story-heading").textContent = "Missão em andamento";
      var styleDesc = DATA.styles[state.styleId].techniqueDescription;
      $("story-text").textContent = "Dica do estilo: " + styleDesc + " Cada golpe rápido mantém o combo por 950 ms. Após o terceiro golpe, a janela de Black Flash dura menos de meio segundo.";
      $("battle-feedback").textContent = feedbackMessage;
      $("battle-feedback").className = "battle-feedback" + (feedbackKind ? " " + feedbackKind : "");
    } else if (view === "ending") {
      $("chapter-label").textContent = "CAPÍTULO 01 · CONSEQUÊNCIAS";
      $("screen-title").textContent = "A ruptura foi contida";
      $("scene-kicker").textContent = "RELATÓRIO DE EXORCISMO · CONCLUÍDO";
      $("scene-title").textContent = "Uma vitória, duas versões do futuro";
      $("scene-description").textContent = "O foco da barreira foi neutralizado. Agora, decida o que fazer com os vestígios que sobraram.";
      $("scene-location").textContent = "ESTAÇÃO DE KUROHAMA";
      $("scene-condition").textContent = "AMEAÇA CONTIDA";
      $("ending-heading").textContent = "O que fazer com a verdade?";
      $("ending-text").textContent = "A missão terminou, mas o resíduo encontrado no local não corresponde a uma maldição comum. Sua decisão define a próxima pista e altera as relações que poderão se abrir na campanha.";
      $("ending-options").innerHTML = makeChoiceButton(0, DATA.story.endings[0].title, DATA.story.endings[0].description, "ending:seal") + makeChoiceButton(1, DATA.story.endings[1].title, DATA.story.endings[1].description, "ending:research");
    } else {
      $("chapter-label").textContent = "CAMPANHA · ROTA ATUAL";
      $("screen-title").textContent = state.story.chapterOneComplete ? "Próximo movimento" : "Preparação da missão";
      $("scene-kicker").textContent = "CENTRO DE OPERAÇÕES · TÓQUIO";
      $("scene-title").textContent = state.story.chapterOneComplete ? "Os resíduos persistem" : "Antes de entrar na estação";
      $("scene-description").textContent = state.story.chapterOneComplete
        ? "A primeira missão foi concluída. Continue treinando, investigue a próxima ameaça e construa o poder necessário para desbloquear novas rotas."
        : "Você está perto da barreira. Prepare-se e entre na zona de exorcismo quando estiver pronto.";
      $("scene-location").textContent = "CENTRO DE OPERAÇÕES";
      $("scene-condition").textContent = state.story.chapterOneComplete ? "NOVA ROTA DISPONÍVEL" : "MISSÃO PREPARADA";
      $("mission-heading").textContent = state.story.chapterOneComplete ? "Escolha seu próximo desafio" : "Entrar na zona de exorcismo";
      $("mission-text").textContent = state.story.chapterOneComplete
        ? "O relatório de Kurohama abre novas tarefas. As maldições ficam mais fortes, mas as recompensas também. Ganhe níveis para desbloquear o domínio e atingir a condição de rebirth."
        : "Sua decisão foi registrada. A Maldição do Eco está no túnel leste. Entre quando estiver pronto; você pode sempre voltar aqui se precisar reorganizar sua estratégia.";
      var options = "";
      if (!state.story.chapterOneComplete) {
        options += missionButton("Entrar na estação", "Enfrente a Maldição do Eco e conclua a primeira missão.", "mission:start-echo", false, "MISSÃO PRINCIPAL");
      } else {
        options += missionButton("Treino de exorcismo", "Enfrente uma maldição de baixo grau para treinar combos.", "mission:start-echo", false, "REPETÍVEL");
        options += missionButton("Resíduos Persistentes", "Enfrente o Devorador de Resíduos. Requer pelo menos um exorcismo.", "mission:start-devourer", state.player.wins < 1, "GRAU 2");
        options += missionButton("Véu Fraturado", "Enfrente a Sentinela do Véu. Requer nível 5.", "mission:start-sentinel", state.player.level < 5, "GRAU 1");
      }
      $("mission-options").innerHTML = options;
    }
  }
  function renderHud() {
    var player = state.player;
    var style = DATA.styles[state.styleId];
    $("quick-hp").textContent = player.hp + " / " + player.maxHp;
    $("quick-hp-bar").style.width = CORE.hpPercent({ hp: player.hp, maxHp: player.maxHp }) + "%";
    $("quick-ce").textContent = player.ce + " / " + player.maxCe;
    $("quick-ce-bar").style.width = CORE.cePercent(player) + "%";
    $("quick-xp").textContent = player.xp + " / " + player.nextXp;
    $("quick-xp-bar").style.width = CORE.xpPercent(player) + "%";
    $("quick-legacy").textContent = player.legacy + " / " + player.rebirths;
    $("rank-label").textContent = CORE.rankForLevel(player.level);
    $("level-label").textContent = player.level;
    $("grade-pill").textContent = CORE.rankForLevel(player.level).toUpperCase();
    $("profile-symbol").textContent = style.icon;
    $("profile-style").textContent = style.name;
    $("attack-label").textContent = player.attack;
    $("defense-label").textContent = player.defense;
    $("wins-label").textContent = player.wins;
    $("legacy-label").textContent = player.legacy;
    $("mini-tech-icon").textContent = style.icon;
    $("mini-tech-name").textContent = style.techniqueName;
    $("mini-tech-description").textContent = style.techniqueDescription;
    $("potion-count").textContent = state.inventory.potions;
    $("seal-count").textContent = state.inventory.seals;
    $("rebirth-btn").disabled = !CORE.canRebirth(state) || !!state.combat;
    $("rebirth-requirement").textContent = CORE.canRebirth(state) ? "Pronto · legado +" + (player.legacy + 1) : "Nível 6 · 3 exorcismos";
    $("rebirth-copy").textContent = CORE.canRebirth(state)
      ? "Pronto para reiniciar o nível e preservar bônus permanentes."
      : "Requer nível 6 e pelo menos 3 exorcismos. Cada ciclo fortalece seu legado.";
    $("choice-one-status").textContent = state.story.openingChoice === "rescue" ? "Civis primeiro" : state.story.openingChoice === "trace" ? "Seguiu resíduos" : "Não escolhida";
    $("choice-two-status").textContent = state.story.endingChoice === "seal" ? "Barreira selada" : state.story.endingChoice === "research" ? "Investigação" : "Não escolhido";
    $("route-one-status").textContent = state.story.chapterOneComplete ? "Concluído" : "Em andamento";
    $("route-two-status").textContent = state.story.chapterOneComplete ? "Disponível" : "Bloqueado";
    $("route-two-node").parentElement.classList.toggle("complete", state.story.chapterOneComplete);
    $("route-two-node").classList.toggle("active-node", state.story.chapterOneComplete);
    if (state.lastResult && state.lastResult.type === "victory") {
      $("hint-text").textContent = "Vitória registrada. Alterne os desafios: a técnica certa contra o padrão certo vale mais do que repetir a mesma ação.";
    } else if (state.player.level >= 8) {
      $("hint-text").textContent = "Expansão de Domínio disponível. O custo é alto: use o domínio numa abertura real, não desperdice energia enquanto o inimigo está prestes a atacar.";
    } else {
      $("hint-text").textContent = "Aprenda o ritmo do adversário: combo mantém uma janela de 950 ms; Black Flash exige combo 3+ e um input rápido. Esquivas perfeitas podem virar contra-ataques.";
    }
    if (state.view === "combat" && state.combat) {
      $("combo-count").innerHTML = combo + ' <small>/ 4</small>';
      $("combo-bar").style.width = (combo / 4 * 100) + "%";
      for (var i = 1; i <= 4; i++) {
        var step = $("combo-step-" + i);
        step.classList.toggle("active", i === combo);
        step.classList.toggle("completed", i < combo);
      }
      $("black-flash-btn").disabled = Date.now() > blackFlashReadyUntil || combo < 3 || player.ce < 12;
      $("black-flash-state").textContent = Date.now() <= blackFlashReadyUntil && combo >= 3 ? "JANELA ATIVA · PRESSIONE F" : "Combo 3+ e timing preciso";
      $("domain-btn").disabled = player.level < 8 || player.ce < 35;
      $("domain-state").textContent = player.level < 8 ? "Desbloqueia no nível 8" : domainUntil > Date.now() ? "DOMÍNIO ATIVO · golpes reforçados" : "35 energia · interrupção e pressão";
      $("dodge-cooldown").textContent = Date.now() < dodgeReadyAt ? "Esquiva recarregando" : "Janela curta · recarga";
      $("telegraph").classList.toggle("hidden", !state.combat.telegraph);
      $("scene-condition").textContent = state.combat.telegraph ? "ATAQUE IMINENTE" : "ADVERSÁRIO ATIVO";
    }
    $("event-log").innerHTML = state.log.map(function (line) {
      return '<div class="event-row"><span class="event-dot"></span><span>' + escapeHtml(line) + '</span></div>';
    }).join("");
  }
  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function render() {
    if (!state) { showIntro(); return; }
    showGame();
    renderHud();
    renderView();
    if (state.combat) {
      $("enemy-hp-text").textContent = state.combat.hp + " / " + state.combat.maxHp;
      $("enemy-hp-bar").style.width = CORE.hpPercent({ hp: state.combat.hp, maxHp: state.combat.maxHp }) + "%";
    }
    persist(true);
  }

  function dispatch(action) {
    if (action === "start") { startNew(selectedStyle); return; }
    if (action === "resume") { resumeGame(); return; }
    if (action === "save") { persist(false); return; }
    if (action === "show-menu") { openMenu(); return; }
    if (action === "to-title") { toTitle(); return; }
    if (action === "rebirth") { performRebirth(); return; }
    if (action === "opening:rescue") { applyOpeningChoice("rescue"); return; }
    if (action === "opening:trace") { applyOpeningChoice("trace"); return; }
    if (action === "ending:seal") { applyEndingChoice("seal"); return; }
    if (action === "ending:research") { applyEndingChoice("research"); return; }
    if (action === "mission:start-echo") { beginCombat("echo"); return; }
    if (action === "mission:start-devourer") {
      if (state.player.wins < 1) { toast("Complete a missão primeiro."); return; }
      beginCombat("devourer"); return;
    }
    if (action === "mission:start-sentinel") {
      if (state.player.level < 5) { toast("A Sentinela exige nível 5."); return; }
      beginCombat("sentinel"); return;
    }
    if (action === "quick") { quickAttack(); return; }
    if (action === "heavy") { heavyAttack(); return; }
    if (action === "technique") { useTechnique(); return; }
    if (action === "black-flash") { blackFlash(); return; }
    if (action === "guard") { guard(); return; }
    if (action === "dodge") { dodge(); return; }
    if (action === "domain") { expandDomain(); return; }
    if (action === "potion") { usePotion(); return; }
  }
  document.addEventListener("click", function (event) {
    var styleCard = event.target.closest("[data-style]");
    if (styleCard) {
      selectedStyle = styleCard.getAttribute("data-style");
      updateStyleCards();
      return;
    }
    var button = event.target.closest("[data-action]");
    if (button && !button.disabled) dispatch(button.getAttribute("data-action"));
  });
  document.addEventListener("keydown", function (event) {
    if (!state || state.view !== "combat") return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var key = event.key.toLowerCase();
    if (key === " " || key === "spacebar") { event.preventDefault(); guard(); }
    else if (key === "j") { quickAttack(); }
    else if (key === "k") { heavyAttack(); }
    else if (key === "q") { useTechnique(); }
    else if (key === "f") { blackFlash(); }
    else if (key === "e") { dodge(); }
    else if (key === "r") { expandDomain(); }
  });
  window.addEventListener("beforeunload", function () { persist(true); });
  window.addEventListener("storage", function (event) {
    if (event.key === SAVE_KEY && !state) showIntro();
  });
  var existing = safeLoad();
  if (existing) {
    selectedStyle = existing.styleId;
    $("resume-btn").classList.remove("hidden");
    $("save-summary").textContent = "Salvamento encontrado: nível " + existing.player.level + " · " + existing.player.wins + " exorcismo(s) · " + existing.player.rebirths + " rebirth(s).";
  }
  updateStyleCards();
  showIntro();
})();