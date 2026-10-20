(function (root) {
  "use strict";
  root.JFF_DATA = {
    version: "0.2.0",
    title: "Jujutsu: Fractured Fate",
    techniques: {
      speech: {
        id: "speech",
        name: "Fala Amaldiçoada",
        kanji: "言",
        category: "Controle",
        description: "Uma ordem carregada de energia amaldiçoada pode quebrar o ritmo do adversário.",
        principle: "Pode interromper um inimigo quando o teste de efeito supera sua resistência.",
        cost: 20,
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
        cost: 18,
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
        cost: 16,
        multiplier: 0.95,
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
        cost: 22,
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
      }
    },
    enemies: {
      echo: {
        id: "echo",
        name: "Maldição do Eco",
        grade: "Grau 3",
        symbol: "響",
        hp: 103,
        attack: 12,
        defense: 2,
        evasion: 11,
        stability: 13,
        xp: 76,
        ce: 16,
        gold: 12,
        intentWeights: [50, 32, 18],
        description: "Nascida do medo de ouvir passos atrás de si. A maldição repete padrões e castiga quem insiste no mesmo movimento."
      },
      devourer: {
        id: "devourer",
        name: "Devorador de Resíduos",
        grade: "Grau 2",
        symbol: "喰",
        hp: 174,
        attack: 17,
        defense: 4,
        evasion: 12,
        stability: 15,
        xp: 125,
        ce: 22,
        gold: 24,
        intentWeights: [38, 42, 20],
        description: "Uma maldição que se alimenta de energia residual. Quando se prepara para um golpe pesado, abre uma janela curta para defesa ou esquiva."
      },
      sentinel: {
        id: "sentinel",
        name: "Sentinela do Véu",
        grade: "Grau 1",
        symbol: "封",
        hp: 255,
        attack: 22,
        defense: 6,
        evasion: 14,
        stability: 17,
        xp: 210,
        ce: 30,
        gold: 42,
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