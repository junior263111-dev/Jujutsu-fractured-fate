# Jujutsu: Fractured Fate — v0.4 Overhaul

**RPG de navegador feito por fã, em português, inspirado no universo de Jujutsu Kaisen.** A versão 0.3 reúne combate tático por dados, minigames jogáveis, três etapas de campanha, escolhas persistentes e progressão com recompensas de primeira conclusão.

> Projeto de fã, não oficial e sem afiliação com os criadores ou detentores de Jujutsu Kaisen. A primeira missão e os personagens de apoio são originais. O projeto não contém roteiro, páginas da wiki, imagens ou trilhas copiados da obra.

## Jogar no computador

1. Abra o repositório e clique em **Code → Download ZIP** (ou clone o repositório).
2. Extraia os arquivos.
3. Abra **index.html** no Edge, Chrome ou outro navegador moderno.

Não é necessário instalar dependências, configurar Node.js ou iniciar um servidor. O save fica no armazenamento local do navegador. Para jogar em outro dispositivo, use os botões Exportar save / Importar save.

## O que mudou na atualização 0.4 — Overhaul

### Novas decisões táticas
- Talismã de selamento (tecla 8): gasta um talismã para cancelar a intenção inimiga atual, inclusive a preparação de um ataque pesado.
- Guarda contra ataque pesado: reduz muito mais o dano e devolve um contra-ataque se o golpe conectar.
- A Sentinela do Véu tem uma segunda fase: abaixo de 50% de vida, rompe o primeiro selo, perde o turno de transição e fica mais agressiva.

### Contratos da escola
- Disciplina de Campo: conclua Controle do Fluxo e Reflexos de Campo.
- Primeiro Exorcismo: finalize a primeira missão.
- Relatório de Investigação: conclua a perícia e reúna pistas.
- Três Alvos: vença pela primeira vez as três operações principais.
- Contratos podem ser resgatados uma vez e pagam XP, ouro e talismãs. Talismãs agora têm uso real em combate.

### Interface
- Paleta global redesenhada em azul-petróleo, ciano e rosa, com contrastes novos para as áreas principais.
- Contratos exibem requisitos, estado e recompensa antes do resgate.
- O combate informa quando a guarda vira contra-ataque, quando um talismã cancela um golpe e quando a Sentinela entra na segunda fase.

### Versão 0.3 — Campanha e treinos

## O que mudou na atualização 0.3

### Progressão e recompensas
- A primeira conclusão de cada missão dá bônus de XP; repetições continuam válidas, mas pagam menos para não substituir o restante do jogo por farm de um único inimigo.
- A curva de XP cresce em passos mais suaves (fator de 1,18 por nível), e os treinos recompensam de acordo com o desempenho.
- Primeira conclusão: Eco 175 XP, Devorador 280 XP e Sentinela 400 XP. Repetições recebem 45% da recompensa-base, com mínimo de 25 XP.
- Treinos na primeira conclusão: Controle do Fluxo (50–98 XP), Reflexos de Campo (50–86 XP) e Perícia da Barreira (55–100 XP). Repetições rendem 12–14 XP.

### Minigames jogáveis ligados à campanha
- **Controle do Fluxo:** memorize e reproduza uma sequência de quatro passos; o padrão muda conforme seu progresso.
- **Reflexos de Campo:** responda a três intenções simuladas — ataque pesado, preparação e golpe direto — com uma decisão tática.
- **Perícia da Barreira:** resolva três questões de evidência; os acertos viram pistas e a conclusão abre a operação do túnel leste.
- Os resultados, as recompensas de primeira conclusão e os capítulos liberados ficam no save.

### Campanha expandida
- Capítulo 01: incidente de Kurohama e relatório com escolhas.
- Capítulo 02: perícia da barreira, confronto contra o Devorador de Resíduos e decisão sobre conter o vestígio ou seguir sua trilha.
- Capítulo 03: confronto contra a Sentinela do Véu e decisão sobre guardar ou distribuir os registros.
- O fim do Capítulo 03 marca o fim do conteúdo narrativo implementado nesta versão; a continuação ainda é futura.

### Balanceamento implementado
- A Maldição do Eco passa de 103 para 70 de vida, evasão 11 para 9 e ataque 12 para 8; a curva de escalonamento por nível foi reduzida.
- Acertos inimigos têm bônus-base menor; ataques pesados e carregados foram suavizados.
- Custos das técnicas caíram para 14–18 de energia, meditação restaura mais energia, poções curam 42 e Expansão de Domínio custa 35.
- Black Flash tem probabilidade de 10% no Controle inicial, chegando a 25% a partir de Controle 4.

## Histórico da versão 0.2

## O que mudou na atualização 0.2

### Ficha RPG no lugar de “estilo de luta”
- Escolha uma das quatro técnicas inatas disponíveis no protótipo.
- Invista pontos de habilidade em Força, Vitalidade, Controle e Instinto.
- Gaste dois pontos para aumentar a Maestria da Técnica, até o nível 5.
- Aumente atributos derivados e tenha acesso a novas possibilidades de progressão.
- Os inimigos escalam com nível, exorcismos e rebirth, em vez de permanecerem fáceis para sempre.

### Combate tático por turnos
- Cada ação do jogador encerra o turno e permite que o inimigo responda.
- A intenção inimiga é revelada antes da decisão: golpe direto, ataque pesado ou acumular energia.
- Ataques físicos usam D20 para acertar, mais uma rolagem de dano.
- Defesa reduz muito o dano daquele turno; esquiva exige um teste de D20 + Instinto; meditar recupera energia amaldiçoada, mas abre mão de causar dano.
- Poções curam durante o combate, mas o inimigo continua agindo depois do uso.
- Ataques pesados, críticos, interrupções, sangramento, pontos vulneráveis e proteção das sombras mudam a forma de decidir.
- **Não há cadeias de combos automáticas.** O jogador escolhe uma ação significativa a cada turno.

### Black Flash baseado em dados
- Um ataque físico comum bem-sucedido faz um segundo teste de D20 para verificar Black Flash.
- Controle melhora gradualmente o limite necessário para entrar em ressonância.
- Black Flash é uma possibilidade rara com grande recompensa: dano multiplicado, recuperação de energia e interrupção do inimigo.
- Técnicas inatas e Expansão de Domínio **não** podem ativar Black Flash. Não existe botão separado para forçar o fenômeno; ele só acontece no teste do ataque físico.

### Técnicas inatas diferentes
- **Fala Amaldiçoada:** pode interromper um inimigo se o teste de efeito superar sua resistência.
- **Manipulação de Sangue:** aplica dano persistente por duas rodadas.
- **Técnica da Proporção:** marca um ponto vulnerável para ampliar o próximo acerto.
- **Técnica das Dez Sombras:** causa dano e fornece proteção contra parte do próximo golpe.
- O custo em energia e a maestria tornam necessário planejar os recursos.
- Expansão de Domínio é desbloqueada no nível 8 e custa 42 pontos de energia.

### Diálogos e consequências
- Briefing com a supervisora original Aki Morino.
- Escolha entre priorizar civis, investigar a barreira ou avançar rapidamente.
- A primeira missão tem um relatório pós-exorcismo com duas rotas.
- Confiança, pistas, suprimentos e escolhas ficam salvos na ficha.
- Uma campanha mais longa e rotas What If serão adicionadas em etapas; esta versão é o primeiro capítulo jogável, não a história completa.

### Progressão, economia e rebirth
- XP, níveis, graus de feiticeiro, pontos de habilidade, maestria, ouro, poções e talismãs.
- Descansar na escola restaura vida e energia por 8 moedas.
- Poções custam 10 moedas na loja e restauram vida em combate.
- Rebirth exige nível 8 e cinco exorcismos. O nível e os atributos investidos reiniciam, enquanto técnica, maestria, escolhas narrativas, ouro e o legado são preservados. Cada rebirth adiciona bônus permanente.

### Saves
- Save automático local com schema versionado.
- Botões para exportar e importar arquivo JSON.
- Arquivos incompatíveis com a versão atual são rejeitados.
- Saves da versão 0.1 não são carregados automaticamente pela versão 0.2, pois o formato de personagem e combate foi alterado.

## Controles durante o combate

| Tecla | Ação |
|---|---|
| **1** | Ataque físico |
| **2** | Técnica inata |
| **3** | Defender |
| **4** | Esquivar |
| **5** | Meditar e recuperar energia |
| **6** | Usar poção |
| **7** | Expansão de Domínio, nível 8+ |

Os botões na interface também funcionam com mouse e toque. Os atalhos de teclado não ativam quando o foco está em um campo de texto.

## Estrutura do projeto

- \`index.html\` — telas de criação, diálogos, missão e combate.
- \`styles.css\` — interface responsiva.
- \`src/data.js\` — técnicas, atributos, diálogos, inimigos e graus.
- \`src/core.js\` — regras de dados, combate, atributos, progressão e rebirth.
- \`src/app.js\` — interface, interação, saves e fluxo narrativo.
- \`tests/core.test.cjs\` — testes automatizados do núcleo.
- \`docs/ROADMAP.md\` — planos de expansão.
- \`.github/workflows/test.yml\` — checagem de sintaxe e testes no GitHub Actions.

## Rodar os testes

Com Node.js 22 ou compatível, execute na raiz:

    node --check src/data.js
    node --check src/core.js
    node --check src/app.js
    node --test tests/core.test.cjs

O workflow executa esses passos a cada push para \`main\` e em pull requests.

## Pesquisa e referências

Referências de conceitos gerais usadas como ponto de partida:
- [Cursed Energy](https://jujutsu-kaisen.fandom.com/wiki/Cursed_Energy)
- [Black Flash](https://jujutsu-kaisen.fandom.com/wiki/Black_Flash)
- [Domain Expansion](https://jujutsu-kaisen.fandom.com/wiki/Domain_Expansion)
- [Binding Vow](https://jujutsu-kaisen.fandom.com/wiki/Binding_Vow)
- [Heavenly Restriction](https://jujutsu-kaisen.fandom.com/wiki/Heavenly_Restriction)

Os números de dano, custos, escalas, limites de dados e requisitos de nível são decisões de balanceamento do jogo, não valores oficiais do cânone.

## Limitações e futuro

Esta versão é single-player e offline; não usa um serviço de IA para escrever a história. O randomizer de escolhas e a geração de enredo por IA ficam para uma fase futura, depois que as regras de campanha, salvamento, balanceamento e testes estiverem mais sólidas. Se uma IA for conectada no futuro, as credenciais deverão ficar num backend seguro, nunca embutidas no JavaScript do navegador.

A auditoria de balanceamento original está em [docs/MEGA-UPDATE-PREPARATION.md](docs/MEGA-UPDATE-PREPARATION.md). A versão 0.4 acrescenta mais opções táticas, contratos resgatáveis e uma fase de chefe, além dos sistemas narrativos e de treino da versão anterior.

Veja [docs/ROADMAP.md](docs/ROADMAP.md) para o plano de trabalho geral.