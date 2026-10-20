(function (root) {
  "use strict";
  root.JFF_DATA = {
    version: "0.1.0",
    title: "Jujutsu: Fractured Fate",
    disclaimer: "Projeto de fã, não oficial e sem afiliação com os criadores ou detentores de Jujutsu Kaisen.",
    styles: {
      echo: {
        id: "echo",
        name: "Punho Ecoante",
        role: "Combate corpo a corpo",
        icon: "拳",
        color: "rose",
        description: "Encadeie golpes rápidos e use uma segunda onda de energia para quebrar a defesa.",
        passive: "Combo de 4 golpes causa dano extra.",
        techniqueName: "Impacto Retardado",
        techniqueDescription: "Um golpe carregado que deixa a maldição vulnerável ao próximo ataque.",
        ceCost: 10,
        damageScale: 1.65,
        effect: "expose"
      },
      shadow: {
        id: "shadow",
        name: "Sombra Vinculada",
        role: "Controle de campo",
        icon: "影",
        color: "violet",
        description: "Prenda o alvo por um instante para interromper seu ritmo e abrir espaço.",
        passive: "Esquivas perfeitas recuperam energia amaldiçoada.",
        techniqueName: "Laço Sombrio",
        techniqueDescription: "Causa dano moderado e interrompe o próximo ataque inimigo.",
        ceCost: 14,
        damageScale: 1.15,
        effect: "stun"
      },
      flow: {
        id: "flow",
        name: "Fluxo Reverso",
        role: "Precisão e resistência",
        icon: "流",
        color: "cyan",
        description: "Controle sua energia para reforçar o corpo, sobreviver e responder com precisão.",
        passive: "Começa cada combate com defesa reforçada.",
        techniqueName: "Reforço Amaldiçoado",
        techniqueDescription: "Fortalece os próximos golpes e reduz o dano recebido.",
        ceCost: 12,
        damageScale: 1.0,
        effect: "empower"
      }
    },
    enemies: {
      echo: {
        id: "echo",
        name: "Maldição do Eco",
        grade: "Grau 3",
        symbol: "響",
        color: "rose",
        hp: 82,
        attack: 10,
        defense: 2,
        xp: 55,
        ce: 13,
        description: "Uma maldição nascida do medo de ouvir passos atrás de si. Ela copia o ritmo do adversário e tenta atacar quando a guarda baixa."
      },
      devourer: {
        id: "devourer",
        name: "Devorador de Resíduos",
        grade: "Grau 2",
        symbol: "喰",
        color: "violet",
        hp: 132,
        attack: 14,
        defense: 4,
        xp: 90,
        ce: 19,
        description: "Uma maldição que se alimenta de resíduos de energia amaldiçoada. Seus ataques são lentos, mas punem quem fica parado."
      },
      sentinel: {
        id: "sentinel",
        name: "Sentinela do Véu",
        grade: "Grau 1",
        symbol: "封",
        color: "gold",
        hp: 205,
        attack: 19,
        defense: 6,
        xp: 155,
        ce: 26,
        description: "Um guardião criado por um véu instável. Seus golpes exigem leitura de movimento e uma janela de resposta bem calculada."
      }
    },
    story: {
      openingTitle: "Incidente de Kurohama",
      openingKicker: "Capítulo 01 · Uma ruptura na barreira",
      opening: "Uma barreira irregular surgiu em uma estação subterrânea de Kurohama. A comunicação com a equipe de apoio falhou e relatos de uma presença hostil continuam chegando. Você é um estudante enviado para investigar — sua primeira decisão pode mudar quem confiará em você.",
      choices: [
        {
          id: "rescue",
          title: "Resgatar os civis primeiro",
          description: "Priorize as pessoas presas. Você ganhará aliados, mas a maldição terá tempo para se preparar.",
          outcome: "Você guiou os últimos passageiros até uma saída lateral. Uma testemunha entregou um amuleto de proteção improvisado.",
          xp: 20,
          hp: 12
        },
        {
          id: "trace",
          title: "Seguir os resíduos amaldiçoados",
          description: "Rastreie a origem da barreira. Você chega ao inimigo com uma leitura melhor de seu padrão.",
          outcome: "Você seguiu os resíduos pelo túnel e encontrou o foco da anomalia. Seu estudo revelou o ritmo de ataque da maldição.",
          xp: 15,
          ce: 12
        }
      ],
      endings: [
        {
          id: "seal",
          title: "Selar a ruptura",
          description: "Estabilize a barreira para proteger a estação. Um final mais seguro, mas algumas perguntas continuarão abertas.",
          outcome: "Você estabilizou a barreira. Kurohama ficou segura por enquanto, mas os resíduos indicam que alguém provocou a ruptura."
        },
        {
          id: "research",
          title: "Investigar a origem",
          description: "Preserve o foco da anomalia para análise. Você obterá uma pista para a próxima rota, assumindo um risco maior.",
          outcome: "Você preservou o foco da anomalia para estudo. A decisão abriu uma pista nova — e fez uma presença distante notar seu nome."
        }
      ]
    },
    ranks: [
      { level: 1, name: "Grau 4" },
      { level: 3, name: "Grau 3" },
      { level: 5, name: "Grau 2" },
      { level: 8, name: "Grau 1" },
      { level: 12, name: "Semi-Grau Especial" },
      { level: 16, name: "Grau Especial" }
    ]
  };
})(window);