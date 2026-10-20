(function (root) {
  "use strict";
  root.JFF_DATA = {
    version: "0.5.0",
    title: "Jujutsu: Fractured Fate",
    paths: {
      balanced: { id: "balanced", name: "Versátil", symbol: "均", category: "Equilíbrio", description: "Sem fraquezas marcantes. Ideal para experimentar as quatro ações.", bonus: "Sem modificadores; flexibilidade total.", hp: 0, ce: 0, attack: 0, defense: 0, techniquePower: 0 },
      vanguard: { id: "vanguard", name: "Punho de Exorcista", symbol: "拳", category: "Ofensiva", description: "Transforma cada abertura em pressão física. Melhor para quem lê as intenções e contra-ataca.", bonus: "+2 de ataque físico.", hp: 0, ce: 0, attack: 2, defense: 0, techniquePower: 0 },
      conduit: { id: "conduit", name: "Condutor de Energia", symbol: "呪", category: "Técnica", description: "Amplia a reserva e a potência da técnica inata para sequências de controle.", bonus: "+15 energia máxima e +2 potência técnica.", hp: 0, ce: 15, attack: 0, defense: 0, techniquePower: 2 },
      guardian: { id: "guardian", name: "Guardião do Véu", symbol: "盾", category: "Defesa", description: "Prioriza sobrevivência e guarda, tolerando erros durante missões difíceis.", bonus: "+18 vida máxima e +1 defesa.", hp: 18, ce: 0, attack: 0, defense: 1, techniquePower: 0 }
    },
    techniques: {
      speech: {
        id: "speech",
        name: "Fala Amaldiçoada",
        kanji: "言",
        category: "Controle",
        description: "Uma ordem carregada de energia amaldiçoada pode quebrar o ritmo do adversário.",
        principle: "Pode interromper um inimigo quando o teste de efeito supera sua resistência.",
        cost: 15,
        multiplier: 1.05,
        effect: "stun",
        effectName: "Ordem restritiva",
        masteryText: "Maestria melhora a potência da técnica e os testes de controle."
      },
      blood: {
        id: "blood",
        name: "Manipulação de Sangue",
        kanji: "血",
        category: "Pressão contínua",
        description: "Converte energia amaldiçoada em um ataque preciso que deixa um efeito persistente.",
        principle: "Acertos aplicam sangramento por duas rodadas.",
        cost: 16,
        multiplier: 1.3,
        effect: "bleed",
        effectName: "Sangramento",
        masteryText: "Maestria eleva o dano da técnica e o dano persistente."
      },
      ratio: {
        id: "ratio",
        name: "Técnica da Proporção",
        kanji: "比",
        category: "Precisão",
        description: "Busca o ponto fraco do alvo e prepara uma abertura para o próximo ataque físico.",
        principle: "Marca o inimigo: o próximo ataque que acertar causa dano adicional.",
        cost: 14,
        multiplier: 1.0,
        effect: "expose",
        effectName: "Ponto vulnerável",
        masteryText: "Maestria aumenta dano e precisão das técnicas."
      },
      shadows: {
        id: "shadows",
        name: "Técnica das Dez Sombras",
        kanji: "影",
        category: "Versatilidade",
        description: "Usa sombras para pressionar o inimigo e proteger o feiticeiro por um turno.",
        principle: "O ataque também cria uma proteção para reduzir o próximo golpe recebido.",
        cost: 18,
        multiplier: 1.15,
        effect: "ward",
        effectName: "Proteção das sombras",
        masteryText: "Maestria reforça o ataque e a proteção concedida."
      }
    },
    attributes: [
      { id: "strength", name: "Força", short: "FOR", icon: "拳", description: "Aumenta o dano dos ataques físicos." },
      { id: "vitality", name: "Vitalidade", short: "VIT", icon: "盾", description: "Aumenta a vida máxima e a resistência." },
      { id: "control", name: "Controle", short: "CTL", icon: "呪", description: "Aumenta energia amaldiçoada, potência técnica e chance de Black Flash." },
      { id: "instinct", name: "Instinto", short: "INS", icon: "眼", description: "Melhora acertos físicos e testes de esquiva." }
    ],
    dialogues: {
      briefing: {
        chapter: "CAPÍTULO 01 · KUROHAMA",
        speaker: "Aki Morino",
        role: "Supervisora de campo",
        portrait: "AM",
        lines: [
          "A barreira na estação de Kurohama oscila a cada três minutos. A equipe de apoio perdeu contato com dois passageiros e com o vigia do túnel leste.",
          "Não sabemos se a presença lá dentro está atraindo pessoas ou se reage ao medo delas. Você vai entrar como apoio de primeiro grau supervisionado — nada de agir sem pensar.",
          "Antes de cruzarmos o véu, preciso saber o que vem primeiro para você."
        ],
        choices: [
          {
            id: "protect",
            label: "Priorizar os civis",
            description: "Resgatar os passageiros antes de investigar. Você recebe um recurso extra e fortalece a confiança da equipe.",
            response: "Boa. Uma missão cumprida com sobreviventes ainda é uma missão cumprida. Pegue mais uma poção; vou manter a saída aberta.",
            effects: { trust: 2, potions: 1, openingChoice: "protect" }
          },
          {
            id: "analyze",
            label: "Entender a barreira",
            description: "Perguntar sobre os resíduos e entrar com uma hipótese. Ganhe pista e energia para a investigação.",
            response: "Os resíduos se acumulam nos intervalos da barreira. Registre qualquer mudança: talvez a própria estrutura revele quem a montou.",
            effects: { clues: 1, ce: 16, openingChoice: "analyze" }
          },
          {
            id: "advance",
            label: "Pedir autorização para avançar",
            description: "Assumir o risco de enfrentar a ameaça rapidamente. Receba experiência inicial, mas sem recursos extras.",
            response: "Autorização concedida. Não confunda coragem com invulnerabilidade — leia o adversário antes de comprometer sua energia.",
            effects: { xp: 18, openingChoice: "advance" }
          }
        ]
      },
      aftermath: {
        chapter: "CAPÍTULO 01 · CONSEQUÊNCIAS",
        speaker: "Aki Morino",
        role: "Supervisora de campo",
        portrait: "AM",
        lines: [
          "A maldição foi exorcizada, mas o foco da barreira não se desfez. O resíduo tem uma estrutura deliberada — alguém pode ter usado a estação como teste.",
          "A direção quer que eu sele o local imediatamente. Eu quero preservar uma amostra, mesmo que isso nos obrigue a voltar quando a barreira estiver mais instável.",
          "A decisão fica registrada no relatório. Ela vai definir a pista que seguiremos."
        ],
        choices: [
          {
            id: "seal",
            label: "Selar a ruptura agora",
            description: "Reduzir o risco imediato. Ganha um talismã e confiança adicional.",
            response: "A equipe selou a ruptura antes do amanhecer. Não vamos colocar mais vidas em risco por uma resposta que ainda não sabemos interpretar.",
            effects: { trust: 2, seals: 1, endingChoice: "seal" }
          },
          {
            id: "research",
            label: "Preservar o resíduo para análise",
            description: "Ganhar uma pista importante e recuperar energia, aceitando um risco futuro.",
            response: "A amostra foi preservada em contenção. Há um segundo padrão escondido nela — alguém sabia exatamente como a barreira reagiria.",
            effects: { clues: 2, ce: 20, endingChoice: "research" }
          }
        ]
      },
      devourerAftermath: {
        chapter: "CAPÍTULO 02 · RASTROS",
        title: "A coisa dentro do recipiente",
        sceneTitle: "Contenção em risco",
        sceneDescription: "O Devorador foi exorcizado, mas sua energia deixou uma marca legível. A forma de tratar o vestígio vai definir a próxima operação.",
        sceneLocation: "ANEXO DE CONTENÇÃO",
        sceneCondition: "CAPÍTULO 02 CONCLUÍDO",
        speaker: "Aki Morino", role: "Supervisora de campo", portrait: "AM",
        lines: [
          "O Devorador não surgiu por acaso. Ele estava drenando o resíduo que preservamos — ou que não conseguimos destruir — em Kurohama.",
          "A Sentinela do Véu protege o ponto de origem. Antes de entrar lá, decida se nossa prioridade é conter o perigo ou seguir a trilha até quem o preparou.",
          "Não existe resposta sem custo. A próxima equipe vai trabalhar com o que você registrar agora."
        ],
        choices: [
          { id: "contain", label: "Conter o vestígio", description: "Prioriza a segurança; recebe um talismã e aumenta a confiança.", response: "O vestígio ficará isolado. Se a trilha esfriar, ao menos não permitiremos que a maldição volte a se formar.", effects: { trust: 2, seals: 1, chapterTwoChoice: "contain", xp: 35 } },
          { id: "trace", label: "Seguir a trilha de energia", description: "Prioriza pistas para a próxima investigação.", response: "A trilha aponta para um segundo selo. Registramos as coordenadas antes que o fluxo se dissipasse.", effects: { clues: 2, chapterTwoChoice: "trace", xp: 25 } }
        ]
      },
      sentinelAftermath: {
        chapter: "CAPÍTULO 03 · O VÉU FRATURADO",
        title: "Do outro lado da barreira",
        sceneTitle: "O silêncio depois do véu",
        sceneDescription: "A Sentinela caiu. O que parecia uma maldição isolada revela sinais de uma experiência deliberada com energia residual.",
        sceneLocation: "CÂMARA DO VÉU",
        sceneCondition: "INVESTIGAÇÃO EM ANDAMENTO",
        speaker: "Aki Morino", role: "Supervisora de campo", portrait: "AM",
        lines: [
          "Você alcançou o núcleo, mas ele não foi construído apenas para manter algo do lado de fora. A barreira parece ter sido feita para observar o que acontecia do lado de dentro.",
          "Há marcas de uma segunda pessoa nos registros. Não temos nome, rosto ou motivo — só uma assinatura de energia repetida em todos os locais.",
          "O relatório será encaminhado à equipe de investigação. A operação termina aqui; a campanha, não."
        ],
        choices: [
          { id: "secure", label: "Proteger os registros", description: "Fecha a operação com segurança e recupera um recurso.", response: "Os registros foram guardados em contenção. Não é a resposta final, mas impede que a mesma armadilha seja usada contra outra equipe.", effects: { trust: 2, potions: 1, chapterThreeChoice: "secure", xp: 45 } },
          { id: "expose", label: "Distribuir o padrão para análise", description: "Ganha pistas adicionais para uma futura continuação.", response: "O padrão foi distribuído aos analistas. Agora qualquer barreira com a mesma assinatura poderá ser reconhecida.", effects: { clues: 2, chapterThreeChoice: "expose", xp: 60 } }
        ]
      }
    },
    contracts: [
      { id: "training_pair", title: "Disciplina de Campo", description: "Conclua Controle do Fluxo e Reflexos de Campo.", reward: { xp: 110, gold: 12, seals: 0 }, condition: "training_pair" },
      { id: "first_exorcism", title: "Primeiro Exorcismo", description: "Conclua sua primeira missão e reporte o resultado.", reward: { xp: 140, gold: 20, seals: 1 }, condition: "first_exorcism" },
      { id: "barrier_report", title: "Relatório de Investigação", description: "Conclua a Perícia da Barreira e reúna três pistas.", reward: { xp: 110, gold: 15, seals: 1 }, condition: "barrier_report" },
      { id: "three_targets", title: "Três Alvos", description: "Conclua pela primeira vez as operações Eco, Devorador e Sentinela.", reward: { xp: 240, gold: 40, seals: 2 }, condition: "three_targets" }
    ],
    training: {
      flow: {
        title: "Controle do Fluxo", kicker: "TREINO DE ENERGIA · MEMÓRIA",
        description: "Aki demonstra uma sequência curta de controle. Memorize a ordem e reproduza os quatro passos sem perder o ritmo.",
        steps: {
          focus: { label: "Concentrar", icon: "凝", detail: "Reunir a energia no centro." },
          flow: { label: "Circular", icon: "流", detail: "Manter o fluxo estável." },
          release: { label: "Liberar", icon: "放", detail: "Soltar energia sem desperdiçar." },
          seal: { label: "Selar", icon: "封", detail: "Fechar o ciclo com precisão." }
        },
        patterns: [["focus","flow","release","seal"],["flow","focus","seal","release"],["focus","seal","flow","release"]]
      },
      reflex: {
        title: "Reflexos de Campo", kicker: "SIMULAÇÃO · LEITURA DE INTENÇÃO",
        description: "Uma simulação de três situações ensina a responder à intenção do adversário em vez de agir por impulso.",
        options: [
          { id: "strike", label: "Punir a abertura", icon: "拳" },
          { id: "guard", label: "Firmar a guarda", icon: "盾" },
          { id: "dodge", label: "Sair da linha", icon: "躱" }
        ],
        scenarios: [
          { title: "Ataque pesado anunciado", prompt: "A maldição prepara um golpe que vai cobrir boa parte do corredor. Qual resposta é mais segura?", correct: "dodge", explanation: "Sair da linha evita o golpe pesado se o teste for bem-sucedido; defender ainda deixa parte do impacto passar." },
          { title: "O inimigo acumulou energia", prompt: "A criatura está concentrando energia e ainda não lançou o ataque. Qual é a melhor janela para pressionar?", correct: "strike", explanation: "A preparação abre uma janela para atacar antes que a energia se converta em dano." },
          { title: "Golpe rápido à curta distância", prompt: "O ataque é rápido e a passagem estreita reduz o espaço de esquiva. Você quer reduzir o risco.", correct: "guard", explanation: "A guarda é a escolha mais consistente contra um golpe direto quando não há espaço para sair da linha." }
        ]
      },
      investigation: {
        title: "Perícia da Barreira", kicker: "CAPÍTULO 02 · INVESTIGAÇÃO",
        description: "Cruze os sinais encontrados em Kurohama. Cada resposta precisa se apoiar numa evidência observável.",
        questions: [
          { title: "Registro temporal", prompt: "A barreira pulsa no mesmo intervalo de três minutos. Qual dado deve entrar primeiro no relatório?", choices: [
            { id: "interval", label: "O pulso se repete no mesmo intervalo", correct: true }, { id: "echo", label: "O som parece mais alto no túnel", correct: false }, { id: "crowd", label: "Há mais pessoas perto da saída", correct: false }
          ], explanation: "O intervalo fixo é reproduzível e permite prever quando a barreira se altera." },
          { title: "Rastro de energia", prompt: "A densidade do resíduo cresce depois de cada pulso. Que hipótese combina melhor com os dados?", choices: [
            { id: "weather", label: "A umidade do túnel está criando o resíduo", correct: false }, { id: "drain", label: "Algo atrai e drena energia a cada pulso", correct: true }, { id: "random", label: "A energia surge sem qualquer padrão", correct: false }
          ], explanation: "A repetição e o aumento de densidade sugerem um processo que se alimenta do fluxo." },
          { title: "Próximo ponto", prompt: "As marcas recentes e o fluxo residual apontam para o túnel leste. Qual é a próxima ação útil?", choices: [
            { id: "leave", label: "Encerrar sem registrar o local", correct: false }, { id: "charge", label: "Entrar sem informar a equipe", correct: false }, { id: "east", label: "Marcar o túnel e preparar entrada coordenada", correct: true }
          ], explanation: "Registrar o local e preparar a equipe transforma a pista numa operação verificável." }
        ]
      }
    },
    enemies: {
      echo: {
        id: "echo",
        name: "Maldição do Eco",
        grade: "Grau 3",
        symbol: "響",
        hp: 70,
        attack: 8,
        defense: 1,
        evasion: 9,
        stability: 12,
        xp: 140,
        ce: 18,
        gold: 18,
        intentWeights: [50, 32, 18],
        description: "Nascida do medo de ouvir passos atrás de si. A maldição repete padrões e castiga quem insiste no mesmo movimento."
      },
      devourer: {
        id: "devourer",
        name: "Devorador de Resíduos",
        grade: "Grau 2",
        symbol: "喰",
        hp: 128,
        attack: 12,
        defense: 3,
        evasion: 11,
        stability: 14,
        xp: 235,
        ce: 24,
        gold: 30,
        intentWeights: [38, 42, 20],
        description: "Uma maldição que se alimenta de energia residual. Quando se prepara para um golpe pesado, abre uma janela curta para defesa ou esquiva."
      },
      sentinel: {
        id: "sentinel",
        name: "Sentinela do Véu",
        grade: "Grau 1",
        symbol: "封",
        hp: 190,
        attack: 15,
        defense: 4,
        evasion: 12,
        stability: 15,
        xp: 340,
        ce: 32,
        gold: 55,
        phaseAt: 0.5,
        phaseAttackBonus: 3,
        intentWeights: [30, 50, 20],
        description: "Um guardião preso a uma barreira antiga. Aguenta pressão, prepara ataques fortes e pune o uso descuidado de energia."
      }
    },
    intents: {
      strike: { name: "Golpe direto", description: "Um ataque rápido. Defesa e esquiva podem reduzir ou evitar o dano.", icon: "⚔" },
      heavy: { name: "Ataque pesado", description: "Um golpe lento e perigoso, anunciado com antecedência. Esquivar é arriscado, mas pode evitar tudo.", icon: "‼" },
      charge: { name: "Acumulando energia", description: "O inimigo se fortalece e prepara um ataque mais perigoso na próxima oportunidade.", icon: "✧" }
    },
    story: {
      openingTitle: "Incidente de Kurohama",
      sideMissions: {
        echo: { title: "Eco no túnel leste", detail: "Treino de exorcismo: a Maldição do Eco reaparece em um resíduo instável." },
        devourer: { title: "Resíduos Persistentes", detail: "O Devorador de Resíduos está consumindo vestígios da barreira de Kurohama." },
        sentinel: { title: "O Véu Fraturado", detail: "A Sentinela protege uma estrutura de Grau 1. Uma luta que exige leitura de intenções." }
      }
    },
    grades: [
      { level: 1, name: "Grau 4" },
      { level: 3, name: "Grau 3" },
      { level: 5, name: "Grau 2" },
      { level: 8, name: "Grau 1" },
      { level: 12, name: "Semi-Grau Especial" },
      { level: 16, name: "Grau Especial" }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);