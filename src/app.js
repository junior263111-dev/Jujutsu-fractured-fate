(function () {
  "use strict";
  var DATA = window.JFF_DATA;
  var CORE = window.JFF_CORE;
  var SAVE_KEY = "jujutsu-fractured-fate-save-v2";
  var state = null;
  var selectedTechnique = "ratio";
  var lastRollDisplay = null;
  var toastTimer = null;
  var $ = function (id) { return document.getElementById(id); };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeLoad() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.schema !== 2 || !parsed.player || !parsed.story || !DATA.techniques[parsed.techniqueId]) return null;
      if (!parsed.player.attributes || !parsed.inventory || !Array.isArray(parsed.log)) return null;
      return parsed;
    } catch (err) { return null; }
  }
  function persist(showMessage) {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      if (showMessage) toast("Progresso salvo neste navegador.");
    } catch (err) {
      if (showMessage) toast("Não foi possível salvar. Confira o armazenamento do navegador.");
    }
  }
  function toast(message) {
    var node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove("show"); }, 2500);
  }
  function showIntro() {
    $("intro-screen").classList.remove("hidden");
    $("game-screen").classList.add("hidden");
    var saved = safeLoad();
    $("resume-btn").classList.toggle("hidden", !saved);
    $("save-summary").textContent = saved
      ? "Save encontrado: " + saved.player.name + " · nível " + saved.player.level + " · " + saved.player.wins + " exorcismo(s) · " + saved.player.rebirths + " rebirth(s)."
      : "Crie uma ficha para iniciar o Capítulo 01.";
    if (saved) selectedTechnique = saved.techniqueId;
    renderTechniqueCards();
  }
  function showGame() {
    $("intro-screen").classList.add("hidden");
    $("game-screen").classList.remove("hidden");
  }
  function renderTechniqueCards() {
    var grid = $("technique-grid");
    grid.innerHTML = Object.keys(DATA.techniques).map(function (id) {
      var item = DATA.techniques[id];
      return '<button class="technique-card' + (id === selectedTechnique ? ' selected' : '') + '" data-technique="' + id + '" aria-pressed="' + (id === selectedTechnique) + '">' +
        '<span class="technique-symbol">' + escapeHtml(item.kanji) + '</span>' +
        '<span class="technique-role">' + escapeHtml(item.category) + '</span>' +
        '<strong>' + escapeHtml(item.name) + '</strong>' +
        '<p>' + escapeHtml(item.description) + '</p>' +
        '<span class="technique-detail">' + escapeHtml(item.principle) + '</span></button>';
    }).join("");
  }
  function startNewGame() {
    if (safeLoad() && !window.confirm("Começar uma nova jornada? O save atual continuará no histórico do navegador, mas será substituído para este jogo.")) return;
    var name = $("player-name").value.trim() || "Estudante";
    state = CORE.createState(selectedTechnique, name);
    lastRollDisplay = null;
    showGame();
    render();
    persist(false);
    toast("Ficha criada. Leia o briefing e escolha sua resposta.");
  }
  function resumeGame() {
    state = safeLoad();
    if (!state) { toast("Nenhum save válido foi encontrado."); showIntro(); return; }
    selectedTechnique = state.techniqueId;
    lastRollDisplay = null;
    showGame();
    render();
    toast("Jornada restaurada.");
  }
  function toTitle() {
    persist(false);
    state = null;
    showIntro();
  }
  function pushLog(message) {
    if (!state) return;
    state.log.unshift(message);
    state.log = state.log.slice(0, 10);
  }
  function applyDialogueChoice(choiceId) {
    var result = CORE.applyDialogueChoice(state, choiceId);
    if (!result.ok) { toast(result.message); return; }
    if (choiceId === "protect") toast("A equipe confia mais em você. Uma poção foi adicionada.");
    else if (choiceId === "analyze") toast("Pista registrada. Energia amaldiçoada recuperada.");
    else if (choiceId === "research") toast("Nova pista adicionada ao relatório.");
    else if (choiceId === "seal") toast("Barreira selada. Talismã adicionado.");
    else toast("Decisão registrada.");
    render();
    persist(false);
  }
  function spendSkillPoint(skillId) {
    if (!state) return;
    if (state.view === "combat") { toast("Pontos de habilidade só podem ser gastos fora do combate."); return; }
    var result = CORE.spendSkillPoint(state, skillId);
    if (!result.ok) { toast(result.message); return; }
    toast(result.message);
    render();
    persist(false);
  }
  function startCombat(enemyId) {
    if (!state || state.combat) return;
    var result = CORE.startCombat(state, enemyId);
    if (!result.ok) { toast(result.message); return; }
    lastRollDisplay = { title: "Combate iniciado", detail: "Leia a intenção inimiga antes de escolher a ação deste turno.", icon: "D20" };
    render();
    persist(false);
  }
  function makeMissionButton(title, description, action, disabled, tag) {
    return '<button class="choice-card mission-card" data-action="' + action + '"' + (disabled ? " disabled" : "") + '>' +
      '<span class="choice-num">' + escapeHtml(tag) + '</span><strong>' + escapeHtml(title) + '</strong><p>' +
      escapeHtml(description) + '</p><span class="choice-arrow" aria-hidden="true">↗</span></button>';
  }
  function makeChoiceButton(choice, index) {
    return '<button class="choice-card" data-action="dialogue:' + escapeHtml(choice.id) + '">' +
      '<span class="choice-num">RESPOSTA 0' + (index + 1) + '</span><strong>' + escapeHtml(choice.label) +
      '</strong><p>' + escapeHtml(choice.description) + '</p><span class="choice-arrow" aria-hidden="true">↗</span></button>';
  }
  function renderDialogue() {
    var node = DATA.dialogues[state.story.dialogueNode];
    if (!node) {
      state.view = "mission";
      state.story.dialogueNode = null;
      render();
      return;
    }
    $("chapter-label").textContent = node.chapter;
    $("screen-title").textContent = state.story.dialogueNode === "briefing" ? "Incidente de Kurohama" : "Consequências do exorcismo";
    $("scene-kicker").textContent = "DIÁLOGO · DECISÃO PERSISTENTE";
    $("scene-title").textContent = state.story.dialogueNode === "briefing" ? "A barreira de Kurohama" : "O que fazer com o resíduo?";
    $("scene-description").textContent = state.story.dialogueNode === "briefing"
      ? "Sua equipe está prestes a cruzar um véu instável. A supervisora espera uma resposta."
      : "A primeira maldição foi exorcizada; agora é preciso decidir o destino da amostra.";
    $("scene-location").textContent = "ESTAÇÃO DE KUROHAMA";
    $("scene-condition").textContent = state.story.dialogueNode === "briefing" ? "BRIEFING ATIVO" : "RELATÓRIO PENDENTE";
    $("dialogue-heading").textContent = state.story.dialogueNode === "briefing" ? "Briefing de campo" : "Relatório de consequências";
    $("dialogue-chip").textContent = state.story.dialogueNode === "briefing" ? "ANTES DA MISSÃO" : "PÓS-EXORCISMO";
    $("dialogue-lines").innerHTML = node.lines.map(function (line, index) {
      return '<div class="dialogue-bubble"><div class="dialogue-portrait">' + escapeHtml(index === 1 && state.story.dialogueNode === "briefing" ? "??" : node.portrait) + '</div>' +
        '<div><div class="dialogue-speaker"><strong>' + escapeHtml(index === 1 && state.story.dialogueNode === "briefing" ? "Transmissão no rádio" : node.speaker) + '</strong><span>' +
        escapeHtml(index === 1 && state.story.dialogueNode === "briefing" ? "Canal de apoio" : node.role) + '</span></div><p>' + escapeHtml(line) + '</p></div></div>';
    }).join("");
    $("dialogue-options").innerHTML = node.choices.map(makeChoiceButton).join("");
  }
  function renderMission() {
    $("chapter-label").textContent = "CAMPANHA · ROTA ATUAL";
    $("screen-title").textContent = state.story.chapterOneComplete ? "Centro de operações" : "Preparação da missão";
    $("scene-kicker").textContent = "CENTRO DE OPERAÇÕES · TÓQUIO";
    $("scene-title").textContent = state.story.chapterOneComplete ? "Os resíduos persistem" : "Antes de cruzar o véu";
    $("scene-description").textContent = state.story.chapterOneComplete
      ? "A ruptura foi contida, mas os resíduos indicam que alguém pode ter provocado o incidente. Treine, prepare recursos e continue investigando."
      : "A supervisora aguarda sua resposta. A primeira incursão será contra a Maldição do Eco, cuja intenção muda de turno para turno.";
    $("scene-location").textContent = "CENTRO DE OPERAÇÕES";
    $("scene-condition").textContent = state.story.chapterOneComplete ? "NOVA ROTA DISPONÍVEL" : "MISSÃO PREPARADA";
    $("mission-heading").textContent = state.story.chapterOneComplete ? "Selecione uma operação" : "Pronto para entrar?";
    $("mission-chip").textContent = "MISSÕES";
    $("mission-text").textContent = state.story.chapterOneComplete
      ? "Cada missão oferece XP, ouro e energia. As ameaças escalam com seu nível e histórico de exorcismos; invista pontos de habilidade antes de entrar."
      : "A Maldição do Eco está no túnel leste. A intenção inimiga será exibida antes de cada rodada. Não existe combo automático: você decide quando atacar, defender, esquivar ou recuperar energia.";
    var options = "";
    if (!state.story.chapterOneComplete) {
      options += makeMissionButton("Entrar na estação", "Enfrente a Maldição do Eco para concluir a primeira missão e abrir o relatório.", "mission:echo", false, "MISSÃO PRINCIPAL");
    } else {
      options += makeMissionButton("Treino de exorcismo", "Enfrente uma Maldição do Eco cuja força escala com seu progresso.", "mission:echo", false, "REPETÍVEL");
      options += makeMissionButton("Resíduos Persistentes", "Enfrente o Devorador de Resíduos. A missão recompensa mais XP e ouro.", "mission:devourer", state.player.wins < 1, "GRAU 2");
      options += makeMissionButton("O Véu Fraturado", "Enfrente a Sentinela do Véu. Requer nível 5.", "mission:sentinel", state.player.level < 5, "GRAU 1");
    }
    options += makeMissionButton("Descansar na escola", "Gasta 8 de ouro para restaurar vida e energia amaldiçoada.", "rest", state.player.gold < 8 || (state.player.hp === state.player.maxHp && state.player.ce === state.player.maxCe), "RECUPERAÇÃO");
    options += makeMissionButton("Comprar uma poção", "Gasta 10 de ouro. Poções recuperam vida durante uma rodada de combate.", "buy-potion", state.player.gold < 10 || state.inventory.potions >= 9, "LOJA");
    $("mission-options").innerHTML = options;
  }
  function setDiceDisplay(title, detail, icon, kind) {
    lastRollDisplay = { title: title, detail: detail, icon: icon || "D20", kind: kind || "" };
  }
  function performCombatAction(action) {
    if (!state || !state.combat) return;
    var result = CORE.takeTurn(state, action);
    if (!result.ok) { toast(result.message); return; }
    var r = result.result || {};
    var tech = DATA.techniques[state.techniqueId];
    if (action === "physical") {
      if (!r.hit) {
        setDiceDisplay("Ataque físico — erro", "D20 " + r.attackRoll + " + " + (state.player.accuracy || 0) + " = " + r.total + " contra Evasão " + r.target + ". Seu turno foi consumido.", "D20", "negative");
      } else {
        var bfText = r.blackFlash
          ? "Teste de Black Flash: D20 " + r.bfRoll + " ≥ " + r.bfThreshold + ". BLACK FLASH!"
          : "Teste de Black Flash: D20 " + r.bfRoll + ", precisava de " + r.bfThreshold + ". Sem ressonância.";
        setDiceDisplay((r.blackFlash ? "BLACK FLASH! " : r.critical ? "Acerto crítico" : "Ataque físico acertou") + " · " + r.damage + " de dano",
          "Ataque D20 " + r.attackRoll + " + Precisão = " + r.total + " contra Evasão " + r.target + ". " + bfText,
          r.blackFlash ? "黒" : "D20", r.blackFlash ? "positive" : "neutral");
      }
    } else if (action === "technique") {
      setDiceDisplay(tech.name + (r.hit ? " acertou" : " errou"),
        "Teste D20 " + r.attackRoll + " + Controle/Maestria = " + r.total + " contra Evasão " + r.target +
        ". " + (r.hit ? "Dano: " + r.damage + ". " : "A energia foi gasta apesar do erro. ") +
        "Técnicas inatas não geram Black Flash.",
        tech.kanji, r.hit ? "positive" : "negative");
    } else if (action === "dodge") {
      var enemyResult = r.enemy || {};
      var dodgeDetail = enemyResult.dodgeRoll
        ? "Teste D20 " + enemyResult.dodgeRoll + " + Instinto = " + enemyResult.dodgeTotal + " contra " + enemyResult.dodgeTarget + ". "
        : "";
      setDiceDisplay(enemyResult.dodged ? "Esquiva bem-sucedida" : "Tentativa de esquiva",
        dodgeDetail + (enemyResult.dodged ? "Você evitou o ataque e recuperou energia amaldiçoada." : "O resultado do inimigo foi resolvido. Leia a próxima intenção."),
        "躱", enemyResult.dodged ? "positive" : "negative");
    } else if (action === "guard") {
      setDiceDisplay("Guarda preparada", "Você reduziu o dano recebido nesta rodada. A intenção seguinte será sorteada depois do ataque inimigo.", "盾", "positive");
    } else if (action === "meditate") {
      setDiceDisplay("Meditação", "Energia amaldiçoada recuperada. Meditar ainda consome um turno, então observe o ataque inimigo.", "息", "neutral");
    } else if (action === "potion") {
      setDiceDisplay("Poção usada", "Vida restaurada. O inimigo ainda age no final do turno.", "薬", "positive");
    } else if (action === "domain") {
      setDiceDisplay("Expansão de Domínio", "Dano " + r.damage + " após rolar D10 (" + r.roll + "). Domínios são técnicas separadas e não produzem Black Flash.", "領", "positive");
    } else if (action === "heavy") {
      setDiceDisplay("Ataque pesado", "Dano aumentado, mas sem uma cadeia de combo. O turno inimigo foi resolvido.", "衝", "neutral");
    }
    if (result.outcome === "victory") {
      toast("Exorcismo concluído! +XP, ouro e energia registrados.");
      setDiceDisplay("Vitória — " + (state.lastResult ? state.lastResult.enemyName : "exorcismo"),
        "A batalha terminou. O próximo diálogo registra as consequências.", "勝", "positive");
    } else if (result.outcome === "defeat") {
      toast("Você foi resgatado. Recupere-se e ajuste seus atributos.");
    }
    render();
    persist(false);
  }
  function restAtSchool() {
    if (!state || state.view === "combat") return;
    if (state.player.gold < 8) { toast("Você precisa de 8 de ouro."); return; }
    if (state.player.hp === state.player.maxHp && state.player.ce === state.player.maxCe) { toast("Você já está em boas condições."); return; }
    state.player.gold -= 8;
    state.player.hp = state.player.maxHp;
    state.player.ce = state.player.maxCe;
    pushLog("Descanso na escola: vida e energia restauradas. −8 ouro.");
    toast("Vida e energia restauradas.");
    render();
    persist(false);
  }
  function buyPotion() {
    if (!state || state.view === "combat") return;
    if (state.player.gold < 10 || state.inventory.potions >= 9) { toast("Não é possível comprar uma poção agora."); return; }
    state.player.gold -= 10;
    state.inventory.potions += 1;
    pushLog("Uma poção de recuperação foi comprada. −10 ouro.");
    toast("Poção adicionada ao inventário.");
    render();
    persist(false);
  }
  function performRebirth() {
    if (!state) return;
    if (!CORE.canRebirth(state)) { toast("Rebirth exige nível 8, cinco exorcismos e nenhum combate ativo."); return; }
    if (!window.confirm("Fazer Rebirth? O nível e os atributos investidos serão reiniciados. Técnica, maestria, escolhas, ouro e legado serão preservados.")) return;
    var result = CORE.rebirth(state);
    if (!result.ok) { toast(result.message); return; }
    state = result.state;
    lastRollDisplay = null;
    pushLog("Rebirth concluído. O próximo ciclo começa com um legado permanente adicional.");
    toast("REBIRTH " + state.player.rebirths + " concluído!");
    render();
    persist(false);
  }
  function exportSave() {
    if (!state) { toast("Comece ou carregue uma jornada primeiro."); return; }
    var data = JSON.stringify(state, null, 2);
    var blob = new Blob([data], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "jujutsu-fractured-fate-save.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Backup de save exportado.");
  }
  function importSaveFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || ""));
        if (!parsed || parsed.schema !== 2 || !parsed.player || !parsed.story || !DATA.techniques[parsed.techniqueId] || !parsed.inventory || !Array.isArray(parsed.log)) {
          throw new Error("Schema inválido");
        }
        if (!Number.isFinite(parsed.player.level) || !Number.isFinite(parsed.player.hp) || !parsed.player.attributes) throw new Error("Estado inválido");
        if (!window.confirm("Substituir a jornada atual pelo arquivo de save selecionado?")) return;
        state = parsed;
        state.combat = null;
        state.view = state.story.chapterOneComplete ? "mission" : "dialogue";
        if (!state.story.chapterOneComplete && !state.story.dialogueNode) state.story.dialogueNode = "briefing";
        lastRollDisplay = { title: "Save importado", detail: "A jornada foi carregada. Combates não são restaurados; você voltou para um ponto seguro.", icon: "SAVE", kind: "positive" };
        selectedTechnique = state.techniqueId;
        persist(false);
        render();
        toast("Save importado com sucesso.");
      } catch (err) {
        toast("Esse arquivo não parece ser um save válido da versão 0.2.");
      }
      $("save-file").value = "";
    };
    reader.onerror = function () { toast("Não foi possível ler o arquivo selecionado."); };
    reader.readAsText(file);
  }
  function renderHud() {
    var p = state.player;
    var tech = DATA.techniques[state.techniqueId];
    $("quick-hp").textContent = p.hp + " / " + p.maxHp;
    $("quick-hp-bar").style.width = CORE.hpPercent(p.hp, p.maxHp) + "%";
    $("quick-ce").textContent = p.ce + " / " + p.maxCe;
    $("quick-ce-bar").style.width = CORE.cePercent(p) + "%";
    $("quick-xp").textContent = p.xp + " / " + p.nextXp;
    $("quick-xp-bar").style.width = CORE.xpPercent(p) + "%";
    $("quick-legacy").textContent = p.legacy + " / " + p.rebirths;
    $("rank-label").textContent = CORE.rankForLevel(p.level);
    $("profile-name").textContent = p.name;
    $("profile-technique").textContent = tech.name;
    $("profile-symbol").textContent = tech.kanji;
    $("level-label").textContent = p.level;
    $("grade-pill").textContent = CORE.rankForLevel(p.level).toUpperCase();
    $("skill-points").textContent = p.skillPoints + " ponto(s)";
    $("wins-label").textContent = p.wins;
    $("gold-label").textContent = p.gold;
    $("legacy-label").textContent = p.legacy;
    $("potion-count").textContent = state.inventory.potions;
    $("seal-count").textContent = state.inventory.seals;
    $("mastery-rank").textContent = "Nv. " + p.techniqueRank + " +";
    $("mastery-description").textContent = p.techniqueRank >= 5 ? "Maestria máxima" : "Custa 2 pontos de habilidade";
    $("mastery-button").disabled = p.skillPoints < 2 || p.techniqueRank >= 5 || state.view === "combat";
    $("rebirth-btn").disabled = !CORE.canRebirth(state);
    $("rebirth-requirement").textContent = CORE.canRebirth(state) ? "Disponível · legado +" + (p.legacy + 1) : "Nível 8 · 5 exorcismos";
    $("rebirth-copy").textContent = CORE.canRebirth(state)
      ? "Pronto para reiniciar o nível e preservar maestria, história e legado."
      : "Requer nível 8 e cinco exorcismos. Cada ciclo aumenta seu bônus permanente.";
    var attributeData = DATA.attributes;
    $("attributes-list").innerHTML = attributeData.map(function (a) {
      var value = p.attributes[a.id];
      var disabled = p.skillPoints < 1 || value >= 20 || state.view === "combat";
      return '<div class="attribute-row"><span class="attribute-icon">' + escapeHtml(a.icon) + '</span><span><strong>' + escapeHtml(a.name) + '</strong><small>' + escapeHtml(a.description) + '</small></span><strong class="attribute-value">' + value + '</strong><button class="skill-plus" data-action="skill:' + a.id + '" aria-label="Aumentar ' + escapeHtml(a.name) + '" title="Gastar 1 ponto"' + (disabled ? " disabled" : "") + '>+</button></div>';
    }).join("");
    $("choice-one-status").textContent = ({ protect: "Civis primeiro", analyze: "Investigar a barreira", advance: "Avançar rápido" })[state.story.openingChoice] || "Não escolhida";
    $("choice-two-status").textContent = ({ seal: "Barreira selada", research: "Investigação" })[state.story.endingChoice] || "Não escolhido";
    $("clues-status").textContent = state.story.clues;
    $("trust-status").textContent = state.story.trust;
    $("route-one-status").textContent = state.story.chapterOneComplete ? "Concluído" : "Em andamento";
    $("route-two-status").textContent = state.story.chapterOneComplete ? "Disponível" : "Bloqueado";
    $("route-one-node").classList.toggle("complete", state.story.chapterOneComplete);
    $("route-two-node").classList.toggle("active-node", state.story.chapterOneComplete);
    if (p.level >= 8) p.domainUnlocked = true;
    if (state.view === "combat" && state.combat) {
      $("domain-btn").disabled = !p.domainUnlocked || p.ce < 42;
      $("domain-state").textContent = !p.domainUnlocked ? "Desbloqueia no nível 8 · 42 energia" : p.ce < 42 ? "Energia insuficiente · precisa de 42" : "42 energia · dano forte e interrupção";
      $("potion-action-label").textContent = state.inventory.potions + " disponível(is) · cura 38";
    } else {
      $("domain-btn").disabled = true;
    }
    $("hint-text").textContent = p.level >= 8
      ? "Expansão de Domínio disponível. Guarde 42 de energia e use quando o inimigo estiver numa situação em que a interrupção tenha valor."
      : "Observe a intenção inimiga: golpe direto, ataque pesado ou acumular energia. Pontos de Força, Vitalidade, Controle e Instinto mudam seus testes.";
    $("event-log").innerHTML = state.log.map(function (line) {
      return '<div class="event-row"><span class="event-dot"></span><span>' + escapeHtml(line) + '</span></div>';
    }).join("");
  }
  function renderDicePanel() {
    var data = lastRollDisplay;
    if (!data) data = { title: "Dados de combate", detail: "A rolagem do último turno aparecerá aqui. Black Flash depende de um segundo teste após um ataque físico bem-sucedido.", icon: "D20", kind: "" };
    $("last-roll").className = "last-roll" + (data.kind ? " " + data.kind : "");
    $("last-roll").innerHTML = '<span class="die-icon">' + escapeHtml(data.icon) + '</span><span><strong>' + escapeHtml(data.title) + '</strong><small>' + escapeHtml(data.detail) + '</small></span>';
  }
  function renderCombat() {
    var enemy = state.combat;
    var tech = DATA.techniques[state.techniqueId];
    var intent = DATA.intents[enemy.intent] || DATA.intents.strike;
    $("chapter-label").textContent = "OPERAÇÃO · " + enemy.grade.toUpperCase();
    $("screen-title").textContent = "Combate tático";
    $("scene-kicker").textContent = "TURNO " + enemy.round + " · ROLE OS DADOS";
    $("scene-title").textContent = enemy.name;
    $("scene-description").textContent = enemy.description;
    $("scene-location").textContent = "ZONA DE EXORCISMO";
    $("scene-condition").textContent = enemy.intent === "heavy" ? "ATAQUE PESADO ANUNCIADO" : enemy.intent === "charge" ? "ENERGIA SENDO ACUMULADA" : "INTENÇÃO INIMIGA LIDA";
    $("combat-heading").textContent = enemy.name;
    $("combat-grade").textContent = enemy.grade.toUpperCase();
    $("combat-description").textContent = "Escolha uma ação para este turno. A rolagem determina o acerto; depois, a intenção inimiga é resolvida.";
    $("enemy-symbol").textContent = enemy.symbol;
    $("enemy-name").textContent = enemy.name;
    $("enemy-hp-text").textContent = enemy.hp + " / " + enemy.maxHp;
    $("enemy-hp-bar").style.width = CORE.hpPercent(enemy.hp, enemy.maxHp) + "%";
    $("enemy-status").textContent = enemy.stunned ? "INTERROMPIDO" : enemy.exposed ? "VULNERÁVEL" : enemy.bleedTurns > 0 ? "SANGRANDO" : enemy.charged ? "ENERGIA ACUMULADA" : "ADVERSÁRIO ATIVO";
    $("round-label").textContent = "TURNO " + enemy.round;
    $("intent-icon").textContent = intent.icon;
    $("intent-title").textContent = intent.name;
    $("intent-description").textContent = intent.description;
    $("intent-roll").textContent = enemy.intent === "heavy" ? "!!" : enemy.intent === "charge" ? "✧" : "!";
    $("technique-icon").textContent = tech.kanji;
    $("technique-button-title").textContent = tech.name;
    $("technique-button-cost").textContent = tech.cost + " energia · maestria " + state.player.techniqueRank;
    $("combat-feedback").textContent = enemy.stunned ? "O inimigo está interrompido: aproveite a rodada para uma ação segura." : enemy.exposed ? "O alvo está vulnerável; seu próximo acerto causa dano extra." : enemy.intent === "heavy" ? "O ataque pesado está anunciado. Defender ou esquivar pode evitar muito dano." : enemy.intent === "charge" ? "O inimigo está acumulando energia. Você pode atacar ou aproveitar para se preparar." : "Escolha sua ação; cada decisão encerra seu turno.";
    $("combat-feedback").className = "combat-feedback" + (enemy.stunned || enemy.exposed ? " positive" : enemy.intent === "heavy" ? " negative" : "");
    $("domain-btn").disabled = state.player.level < 8 || state.player.ce < 42;
    $("domain-state").textContent = state.player.level < 8 ? "Desbloqueia no nível 8 · 42 energia" : state.player.ce < 42 ? "Energia insuficiente · precisa de 42" : "42 energia · dano forte e interrupção";
    $("potion-action-label").textContent = state.inventory.potions + " disponível(is) · cura 38";
    $("dialogue-panel").classList.add("hidden");
    $("combat-panel").classList.remove("hidden");
    $("mission-panel").classList.add("hidden");
    renderDicePanel();
  }
  function renderView() {
    $("dialogue-panel").classList.toggle("hidden", state.view !== "dialogue");
    $("combat-panel").classList.toggle("hidden", state.view !== "combat");
    $("mission-panel").classList.toggle("hidden", state.view !== "mission");
    if (state.view === "dialogue") renderDialogue();
    else if (state.view === "combat") renderCombat();
    else renderMission();
  }
  function render() {
    if (!state) { showIntro(); return; }
    showGame();
    renderHud();
    renderView();
    persist(false);
  }
  function dispatch(action) {
    if (!state) {
      if (action === "start") startNewGame();
      else if (action === "resume") resumeGame();
      else if (action === "menu") toast("Escolha uma técnica inata, crie a ficha ou continue o save.");
      return;
    }
    if (action === "start") { startNewGame(); return; }
    if (action === "resume") { resumeGame(); return; }
    if (action === "save") { persist(true); return; }
    if (action === "export") { exportSave(); return; }
    if (action === "import") { $("save-file").click(); return; }
    if (action === "menu") { toast("Combate: 1 físico · 2 técnica · 3 defesa · 4 esquiva · 5 meditar · 6 poção · 7 domínio."); return; }
    if (action === "to-title") { toTitle(); return; }
    if (action === "rebirth") { performRebirth(); return; }
    if (action.indexOf("dialogue:") === 0) { if (state.view === "dialogue") applyDialogueChoice(action.slice(9)); return; }
    if (action.indexOf("skill:") === 0) { spendSkillPoint(action.slice(6)); return; }
    if (action === "mission:echo") { startCombat("echo"); return; }
    if (action === "mission:devourer") {
      if (state.player.wins < 1) { toast("Complete uma missão primeiro."); return; }
      startCombat("devourer"); return;
    }
    if (action === "mission:sentinel") {
      if (state.player.level < 5) { toast("A Sentinela exige nível 5."); return; }
      startCombat("sentinel"); return;
    }
    if (action === "rest") { restAtSchool(); return; }
    if (action === "buy-potion") { buyPotion(); return; }
    if (["physical","technique","guard","dodge","meditate","potion","domain"].indexOf(action) >= 0) {
      if (state.view === "combat") performCombatAction(action);
      return;
    }
  }

  document.addEventListener("click", function (event) {
    var techniqueCard = event.target.closest("[data-technique]");
    if (techniqueCard) {
      selectedTechnique = techniqueCard.getAttribute("data-technique");
      renderTechniqueCards();
      return;
    }
    var button = event.target.closest("[data-action]");
    if (button && !button.disabled) dispatch(button.getAttribute("data-action"));
  });
  $("save-file").addEventListener("change", function () { importSaveFile(this.files && this.files[0]); });
  document.addEventListener("keydown", function (event) {
    if (!state || state.view !== "combat") return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    var key = event.key.toLowerCase();
    var mapping = { "1":"physical", "2":"technique", "3":"guard", "4":"dodge", "5":"meditate", "6":"potion", "7":"domain" };
    if (mapping[key]) { event.preventDefault(); dispatch(mapping[key]); }
  });
  window.addEventListener("beforeunload", function () { persist(false); });

  var existing = safeLoad();
  if (existing) selectedTechnique = existing.techniqueId;
  renderTechniqueCards();
  $("resume-btn").classList.toggle("hidden", !existing);
  if (existing) $("save-summary").textContent = "Save encontrado: " + existing.player.name + " · nível " + existing.player.level + " · " + existing.player.wins + " exorcismo(s) · " + existing.player.rebirths + " rebirth(s).";
  showIntro();
})();