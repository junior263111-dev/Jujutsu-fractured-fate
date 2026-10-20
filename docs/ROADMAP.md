# Design e roadmap — Jujutsu: Fractured Fate

## Direção do jogo

Um RPG single-player para navegador com combate de ação baseado em timing, progressão de feiticeiro e uma campanha que explora linhas do destino alternativas. O protótipo atual é o primeiro corte vertical: ficha, uma missão original, combate, salvamento e um ciclo inicial de progressão.

**Regra narrativa:** utilizar resumos factuais e ideias gerais do universo como referência, mas escrever cenas, diálogos, escolhas e resultados próprios. O sistema What If deve criar divergências novas, em vez de copiar capítulos ou episódios inteiros.

## Sistemas centrais

### 1. Combate em tempo real

- Golpes rápidos encadeiam até quatro impactos. O intervalo máximo entre inputs é 950 ms.
- Golpe pesado dá mais dano, mas possui recarga.
- A técnica inata usa energia amaldiçoada e acrescenta efeitos ligados ao estilo selecionado.
- O inimigo alterna entre recuperação e telegráfico. Guarda reduz dano; esquiva possui uma janela curta e uma recarga.
- Black Flash aparece como uma janela de timing exigente depois de uma sequência. O tempo de input foi adaptado para jogabilidade humana e não pretende simular a precisão literal do fenômeno.
- Expansão de Domínio é um recurso de progressão com custo alto, interrupção do adversário e uma janela temporária de pressão. A implementação atual é uma abstração de gameplay.

A próxima revisão deve separar a resolução de combate dos temporizadores de interface, definir uma máquina de estados formal para neutro, preparação, impacto, recuperação, atordoamento e domínio, e adicionar testes determinísticos para cada transição.

### 2. Progressão e rebirth

- XP aumenta nível e atributos, e restaura reservas ao subir.
- Graus de jogo são marcos de progressão ajustáveis em src/data.js; são uma camada de jogo, não uma avaliação canônica individual.
- Rebirth exige nível 6 e três exorcismos na versão atual.
- Ao renascer, o nível volta ao início, o legado permanente melhora atributos e as escolhas de história são mantidas.
- Futuras versões devem adicionar uma árvore de legados, desafios de rebirth e objetivos por ciclo para que o reset seja uma decisão estratégica, não um atalho obrigatório.

### 3. Campanha e rotas What If

A missão inicial, Incidente de Kurohama, é original. Duas escolhas alteram aliados/pistas; o desfecho altera a relação com a anomalia e a informação disponível depois.

Modelo recomendado para cada capítulo:
- Identificador estável, pré-requisitos, cenário e condição de entrada.
- Escolhas com consequências persistentes em flags do estado da campanha.
- Condições de resolução que não dependam de texto de UI.
- Pelo menos dois caminhos viáveis e efeitos mensuráveis de curto e longo prazo.
- Testes para confirmar que os ramos não prendem o jogador nem tornam o save inválido.

A campanha futura pode cruzar eventos e personagens reconhecíveis do universo em rotas alternativas, mas precisa manter diálogos e cenas escritos do zero. Evitar reproduzir páginas da wiki, falas de episódios ou uma reconstituição integral de capítulos.

### 4. Salvamento

O protótipo usa localStorage com uma chave versionada e validação mínima de schema. Próxima iteração:
- Migrar saves quando o schema mudar.
- Adicionar exportar/importar arquivo JSON e botão para cópia de segurança.
- Testar save ausente, corrompido, antigo e save no meio do combate.
- Documentar que o save não sincroniza com nuvem e é específico ao navegador.

## Milestones

### Fase 0 — Protótipo jogável (atual)
- [x] Interface responsiva
- [x] Três estilos
- [x] Combo de quatro impactos, golpe pesado, técnica, Black Flash, guarda e esquiva
- [x] Primeiro arco original com escolhas
- [x] XP, níveis, graus, salvamento e rebirth inicial
- [x] Testes do núcleo

### Fase 1 — Combate confiável
- [ ] Máquina de estados separada dos componentes visuais
- [ ] Hit-stop, feedback de acerto e telegráficos por família de inimigo
- [ ] Testes de combo, defesa, esquiva, interrupção e domínio
- [ ] Ajuste de acessibilidade para teclado, toque e movimento reduzido

### Fase 2 — Progressão com profundidade
- [ ] Árvore de técnicas e técnicas secundárias
- [ ] Afinidades, estilos de equipamento e itens que mudam decisões
- [ ] Legado de rebirth com escolhas permanentes
- [ ] Contratos, treino e condições de desbloqueio de rota

### Fase 3 — Campanha ramificada
- [ ] Grafo de capítulos e editor declarativo de escolhas
- [ ] Flags de relação, pistas e decisões anteriores
- [ ] Chefes com fases e mecânicas distintas
- [ ] Testes de fluxo para todas as ramificações

### Fase 4 — Conteúdo e polimento
- [ ] Mais missões e encontros
- [ ] Opções de dificuldade e balanceamento
- [ ] Sons originais opcionais e efeitos visuais leves
- [ ] Página de projeto e instruções de publicação

## Verificações de qualidade

Antes de considerar uma fase pronta:
1. Rodar os testes automatizados do núcleo.
2. Abrir index.html em navegador desktop e em viewport estreita.
3. Testar refresh e retomada de save em cada tela.
4. Testar cada escolha e cada condição de desbloqueio.
5. Confirmar que nenhum botão visível é decorativo/inoperante.
6. Revisar textos e assets para garantir que foram criados para o projeto, sem copiar roteiro, imagens, logotipos oficiais ou trilhas da obra.