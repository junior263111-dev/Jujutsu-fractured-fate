# Roadmap — Jujutsu: Fractured Fate

## Direção do produto

RPG single-player de navegador inspirado no universo de Jujutsu Kaisen, com combates táticos baseados em dados, técnicas inatas, progressão de personagem, escolhas narrativas persistentes e rebirth. O protótipo é organizado em arquivos pequenos para permitir alterações incrementais e testes.

**Princípio editorial:** usar conceitos e fatos gerais como referência, mas escrever cenas, diálogos e consequências próprios. A wiki é uma fonte de consulta, não texto a ser copiado para o jogo.

## Versão 0.2 — Atualização grande

### Ficha RPG
- [x] Seleção de técnica inata em vez de estilo fixo.
- [x] Nome do personagem e ficha persistente.
- [x] Força, Vitalidade, Controle e Instinto.
- [x] Pontos de habilidade para atributos e maestria técnica.
- [x] Estatísticas derivadas de atributos, nível e legado.
- [x] Graus e escalonamento de inimigos.

### Combate por turnos
- [x] Uma ação significativa por turno, sem cadeia de combos.
- [x] Intenção inimiga revelada antes da ação do jogador.
- [x] D20 para ataques físicos e técnicas; dados de dano.
- [x] Teste secundário de Black Flash apenas em ataque físico comum.
- [x] Defesa, esquiva, meditação e itens.
- [x] Efeitos de atordoamento, sangramento, vulnerabilidade, proteção e carga inimiga.
- [x] Técnicas com custo de energia e efeitos distintos.
- [x] Expansão de Domínio em nível avançado.
- [x] Derrota com resgate, sem terminar a campanha.

### Narrativa e persistência
- [x] Briefing com várias falas e escolhas.
- [x] Consequências em confiança, pistas, recursos e rota.
- [x] Primeiro capítulo original e diálogo pós-exorcismo.
- [x] Missões repetíveis e desafios com pré-requisitos.
- [x] Save local versionado, exportação e importação JSON.

### Qualidade
- [x] Testes do núcleo para ficha, dados, XP, atributos, combate, diálogos e rebirth.
- [x] Workflow do GitHub Actions para validar sintaxe e executar testes.
- [x] Layout responsivo e controles de teclado, mouse e toque.

## Preparação obrigatória antes da versão 0.3

A auditoria específica está em [MEGA-UPDATE-PREPARATION.md](MEGA-UPDATE-PREPARATION.md). Primeiro analisar o desequilíbrio inicial e definir métricas com simulações; só depois alterar as regras. O plano de preparação é o ponto de partida da próxima sessão, sem mudanças de gameplay nesta etapa.

## Próxima prioridade: versão 0.3 — Combate mais profundo

1. Separar intenção, rolagens e aplicação de efeitos em uma máquina de estados completamente determinística.
2. Acrescentar animações curtas, hit-stop e feedback visual para erro, crítico, Black Flash, guarda perfeita, esquiva e efeito de técnica.
3. Dar a cada inimigo dois ou três padrões exclusivos e fases de chefe, sem inflar apenas a vida.
4. Equilibrar custos e recompensas para que não exista uma única ação ideal em todas as lutas.
5. Testar saves antes, durante e depois do combate, inclusive arquivos inválidos.
6. Criar testes de balanceamento por faixas de nível para estimar duração média, dano recebido e consumo de recursos.

## Versão 0.4 — RPG e construção de personagem

- Árvore de técnicas e técnicas secundárias desbloqueadas por nível/maestria.
- Votos de restrição como escolhas estratégicas com bônus e contrapartidas.
- Equipamentos, ferramentas amaldiçoadas, consumíveis, inventário com efeitos e lojas.
- Treino, tarefas opcionais e contratos.
- Legado de rebirth com escolhas permanentes em uma árvore, em vez de bônus idênticos para todos.
- Progressão com limites e objetivos alternativos para evitar repetição obrigatória.

## Versão 0.5 — Campanha e rotas What If

- Grafo de capítulos com pré-requisitos, consequências e estado narrativo salvo.
- Relações entre personagens e facções que influenciam opções.
- Chefes em múltiplas fases e lutas com objetivos diferentes de “reduzir HP a zero”.
- Linhas de destino alternativas, consequências em longo prazo e múltiplos finais.
- Campanha escrita para o jogo; referências factuais resumidas, sem copiar diálogo ou cenas extensas do mangá/anime.

## Versão futura — Randomizer e narrativa gerada por IA

Não implementar IA diretamente no cliente por agora. Um design seguro e viável precisará de:
- Backend intermediário para manter credenciais fora do navegador.
- Um formato estruturado de capítulo/encounter, validado contra regras do jogo.
- Contexto compacto contendo flags, personagens, técnicas e eventos já conhecidos.
- Restrições para impedir contradições, softlocks e recompensas inválidas.
- Fallback para diálogos previamente escritos quando a rede ou o modelo não estiverem disponíveis.
- Randomizer local primeiro (eventos, escolhas e encontros gerados de um conjunto aprovado); IA como camada posterior, opcional e claramente identificada.
- Testes de replay para que a mesma seed e o mesmo estado gerem uma rota reproduzível.

## Critérios de pronto

Antes de marcar uma fase como concluída:
1. Passar nos testes de núcleo e sintaxe.
2. Testar desktop e viewport mobile.
3. Testar cada ação e estado de combate.
4. Verificar que nenhum botão aparente é inoperante.
5. Confirmar que saves continuam válidos após atualizar a página.
6. Revisar conteúdo e assets: evitar reprodução de roteiro, imagens, logos ou música oficial.
7. Descrever claramente o que ainda é protótipo, para não confundir plano com funcionalidade existente.