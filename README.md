# Crônicas do Abismo — Mini RPG de texto

Protótipo experimental de RPG em português, jogável direto no navegador. O objetivo deste projeto é testar uma base pequena de jogo com interface visual, escolhas, progressão e combate por turnos.

## Como jogar

1. Abra [index.html](./index.html) no navegador (baixe o arquivo ou clone/baixe o repositório).
2. Comece na Aldeia do Crepúsculo.
3. Escolha uma região na seção **Regiões** ou nos botões de exploração.
4. Enfrente inimigos usando ataques, magia, defesa e poções.
5. Ganhe XP e ouro, suba de nível e volte à aldeia para descansar.

Não é necessário instalar bibliotecas, usar Node.js ou configurar um servidor. O jogo é feito em HTML, CSS e JavaScript sem dependências externas.

## Recursos da versão 0.1

- Interface responsiva para computador e celular.
- Combate por turnos contra três tipos de inimigos.
- Ataque físico, Raio Arcano, defesa, poções e fuga.
- Vida, mana, defesa, ataque, ouro, XP e níveis.
- Regiões com ameaças e recompensas diferentes.
- Descanso na aldeia por 5 moedas.
- Diário com os últimos eventos.
- Salvamento local no navegador, usando `localStorage`.

## Estrutura

- `index.html` — interface, estilos, lógica do jogo e salvamento local.

## Limitações conhecidas

- O progresso fica no armazenamento local do navegador e não sincroniza entre dispositivos.
- Não há conta de usuário, multiplayer, backend ou salvamento na nuvem.
- É um protótipo inicial: balanceamento, missões, equipamentos e conteúdo podem ser ampliados nas próximas versões.

## Ideias para os próximos testes

1. Missões e escolhas narrativas que alteram a história.
2. Inventário real com itens equipáveis.
3. Mais habilidades, inimigos e chefes.
4. Testes automatizados para combate, progressão e salvamento.

---

Feito como mini projeto experimental de RPG de texto.
