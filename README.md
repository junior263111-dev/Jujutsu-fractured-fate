# Jujutsu: Fractured Fate

**Protótipo jogável de RPG de navegador inspirado no universo de Jujutsu Kaisen.** Interface em português, combate em tempo real, combos, técnicas, escolhas narrativas e progressão persistente.

> Projeto de fã, não oficial e sem afiliação com os criadores ou detentores de Jujutsu Kaisen. A missão inicial e seus personagens de apoio são originais. O projeto não inclui imagens, músicas, páginas de roteiro ou diálogos copiados da obra.

## Executar

Não é necessário instalar bibliotecas nem usar um servidor:

1. Abra o repositório e baixe o ZIP, ou clone-o.
2. Extraia os arquivos.
3. Abra **index.html** no navegador.

O projeto usa HTML, CSS e JavaScript simples. O progresso é guardado em **localStorage** no navegador atual.

## Controles durante o combate

| Tecla | Ação |
|---|---|
| **J** | Golpe rápido e cadeia de combo |
| **K** | Golpe pesado, com recarga |
| **Q** | Técnica inata escolhida na ficha |
| **F** | Tentar Black Flash após construir um combo |
| **Espaço** | Preparar a guarda e reduzir o próximo golpe |
| **E** | Esquiva com janela curta e recarga |
| **R** | Expansão de Domínio, desbloqueada no nível 8 |
| Clique | Todas as ações também possuem botões na interface |

## Sistemas implementados na versão 0.1

- Três estilos jogáveis com efeitos diferentes: Punho Ecoante, Sombra Vinculada e Fluxo Reverso.
- Combate em tempo real com cadeia de quatro golpes, finisher, golpe pesado, recarga de habilidades, telegráficos de inimigo, defesa e esquiva.
- Janela curta para tentar Black Flash após uma sequência de golpes. A janela de timing é uma adaptação de gameplay, não uma simulação literal de um microssegundo.
- Técnicas com custo de energia amaldiçoada e efeitos que interagem com os próximos golpes.
- Expansão de Domínio desbloqueada por progressão, com alto custo e janela temporária de vantagem.
- Vida, energia amaldiçoada, XP, níveis, graus, atributos, itens, vitórias e rebirth.
- Rebirth: disponível a partir do nível 6 e de três exorcismos; reinicia o nível, preserva escolhas narrativas e concede bônus de legado.
- Uma missão original com duas escolhas iniciais e dois desfechos alternativos.
- Dois desafios extras que desbloqueiam por progressão.
- Salvamento automático local e botão de salvar.
- Interface adaptável a PC e celular, controles por teclado e botões de toque.
- Núcleo de progressão separado da interface e testes automatizados básicos.

## Estrutura

- **index.html** — estrutura e controles da interface.
- **styles.css** — identidade visual, componentes e layout responsivo.
- **src/data.js** — estilos, inimigos, narrativa e tabela de graus.
- **src/core.js** — criação de estado, combate, XP, graus e rebirth.
- **src/app.js** — interface, controles, timers de combate e salvamento.
- **tests/core.test.cjs** — testes do núcleo.
- **docs/ROADMAP.md** — desenho de sistemas e etapas futuras.

## Testes

Com Node.js instalado, execute na raiz do projeto:

    node --test tests/core.test.cjs

Também existe um workflow no GitHub Actions que executa os testes em novos pushes e pull requests.

## Importante sobre cânone e adaptação

Os conceitos gerais usados como referência incluem energia amaldiçoada, votos de restrição, Black Flash e Expansão de Domínio. Os números de dano, custos, recargas, janelas e requisitos de nível do protótipo são decisões de balanceamento do jogo — não afirmam reproduzir os valores exatos do cânone. Consulte a wiki para contexto factual e não use a wiki como texto de roteiro.

Referências de mecânica:
- [Cursed Energy](https://jujutsu-kaisen.fandom.com/wiki/Cursed_Energy)
- [Black Flash](https://jujutsu-kaisen.fandom.com/wiki/Black_Flash)
- [Domain Expansion](https://jujutsu-kaisen.fandom.com/wiki/Domain_Expansion)
- [Binding Vow](https://jujutsu-kaisen.fandom.com/wiki/Binding_Vow)
- [Heavenly Restriction](https://jujutsu-kaisen.fandom.com/wiki/Heavenly_Restriction)

## Próximos passos

Veja [docs/ROADMAP.md](docs/ROADMAP.md). O objetivo é evoluir a experiência em fatias jogáveis e testáveis, em vez de tentar implementar toda a campanha numa única alteração.