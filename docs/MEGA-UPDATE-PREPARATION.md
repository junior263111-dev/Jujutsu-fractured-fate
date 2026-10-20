# Mega update — fase de preparação e plano de balanceamento

**Estado:** planejamento antes da implementação  
**Versão de referência:** 0.2  
**Regra desta fase:** não alterar arquivos de gameplay. Este documento define o alvo de design, as fórmulas propostas e os testes necessários antes da próxima grande atualização.

---

## 1. Diagnóstico: por que o jogo parece desbalanceado

O problema não é apenas “a vida do inimigo está alta”. Os números atuais fazem o combate favorecer a maldição cedo demais, enquanto a progressão permite aumentos de atributos muito bruscos.

### Números iniciais calculados pela implementação atual

| Métrica | Personagem inicial | Maldição do Eco |
|---|---:|---:|
| Vida | 101 | 103 |
| Energia amaldiçoada | 56 | — |
| Poder de ataque físico | 9 | Ataque-base 12 |
| Defesa | 1 | 2 |
| Bônus de acerto | +1 | +3 |
| Evasão usada no teste | — | 11 |
| Dano médio quando o ataque acerta | 10,5 | 15,5 antes de ataque pesado/carga |
| Chance aproximada de acertar | 55% | 70% |

*Estimativas calculadas a partir das fórmulas e dos dados atuais, sem considerar técnicas, crítico, Black Flash, efeitos de estado ou defesa/esquiva.*

O jogador causa em média cerca de 10,5 × 55% = 5,8 de dano por ação física antes de outros efeitos. Contra 103 de vida, isso sugere aproximadamente **18 ações de ataque** em média para derrotar a maldição.

Já o inimigo acerta aproximadamente 70% das vezes e causa, em média, cerca de 15,5 de dano quando conecta um golpe normal. Isso representa cerca de **10,9 de dano esperado por turno**, antes de considerar ataques pesados e ataques carregados. Uma reserva de 101 de vida pode acabar antes de o jogador ter oportunidade razoável de vencer por ataques normais.

### Outros desequilíbrios encontrados

1. **Atributos com ganhos muito diferentes.** Cada ponto de Força acrescenta 2 de ataque; cada ponto de Vitalidade acrescenta 13 de vida máxima; cada ponto de Controle acrescenta 11 de energia e também melhora a potência técnica. Quatro pontos iniciais podem criar um personagem muito especializado antes de a primeira missão começar.
2. **Técnicas caras, com falha dispendiosa.** As técnicas custam entre 16 e 22 de energia, e o personagem começa com 56. Uma técnica que erra ainda consome o recurso; dependendo da técnica, o custo pode ser alto demais para o resultado.
3. **Fala Amaldiçoada interrompe pouco.** A condição atual de efeito exige uma rolagem alta contra a resistência do inimigo. No encontro inicial, a chance de interromper depois de acertar pode ficar baixa demais para justificar o custo.
4. **Black Flash pode ficar invisível por longos períodos.** No Controle inicial, o teste exige 20 no segundo D20: apenas 5% depois de um acerto físico, aproximadamente 2,75% por ação física com a chance de acerto atual. O efeito é forte, mas o jogador pode passar uma luta sem vê-lo.
5. **Ações defensivas não têm uma comparação de risco suficientemente transparente.** A intenção inimiga aparece, mas o jogo precisa mostrar melhor o custo esperado de atacar, defender ou esquivar.
6. **Economia repetível.** O Eco pode ser enfrentado repetidamente, mas ouro e XP precisam considerar primeira conclusão e repetição. Caso contrário, farmar uma missão pode ser a estratégia dominante.
7. **Escalonamento por nível pode criar corridas de números.** Aumentar automaticamente vida e ataque de inimigos por nível, vitórias e rebirth pode tornar o progresso quase nulo se os ganhos do jogador não forem comparados à curva inimiga.

A próxima atualização precisa corrigir o modelo todo em conjunto. Reduzir somente a vida da primeira maldição não basta.

---

## 2. Fantasia e princípios de balanceamento

O objetivo de design não é fazer todas as lutas fáceis nem fazer cada combate durar dezenas de turnos. Queremos que a vitória venha de escolher bem, ler o adversário e construir uma ficha coerente.

### Princípios obrigatórios

- **Uma ação importante por turno.** Não voltar a combos automáticos que apaguem a diferença entre builds.
- **Informação antes da decisão.** A intenção do inimigo e os efeitos ativos precisam ser visíveis antes de o jogador agir.
- **Cada ação deve ter um motivo real para existir.** Ataque físico é confiável e pode gerar Black Flash; técnica gasta recurso para aplicar dano ou um efeito distintivo; defesa reduz risco; esquiva tem maior risco de falha e maior recompensa; meditação regenera energia; itens são limitados.
- **Builds diferentes, resultados próximos.** Uma build especializada pode brilhar em uma situação, mas nenhuma deve vencer todos os encontros com uma única ação.
- **Progressão de poder sem inflar apenas HP.** Inimigos posteriores precisam de padrões, resistências e fases distintas, não apenas de números maiores.
- **Falha justa.** O jogador deve conseguir explicar por que perdeu e ter pelo menos uma opção de recuperação.
- **Dados explicados.** Mostrar a rolagem, o bônus, o alvo e o resultado; o jogador nunca deve achar que o jogo decidiu arbitrariamente.
- **Sem poder permanente gratuito em toda tela.** Cura, energia e economia devem manter escolhas relevantes após o primeiro combate.
- **Aleatoriedade reproduzível em testes.** A lógica de combate deve aceitar uma fonte de aleatoriedade injetável, para que erros de balanceamento possam ser reproduzidos.

---

## 3. Alvos de balanceamento para os encontros

Esses valores são **metas de teste**, não números já implementados. Depois de simular e testar, serão ajustados conforme os resultados.

| Tipo de encontro | Duração-alvo | Vida que o jogador costuma perder | Intenção |
|---|---:|---:|---|
| Primeiro encontro / tutorial | 6–9 turnos | 30–55% da vida | Ensinar leitura de intenção e uso das ações |
| Maldição repetível de grau baixo | 5–8 turnos após algumas melhorias | 20–45% | Treino rentável, mas não melhor que todo o conteúdo |
| Inimigo de Grau 2 | 7–10 turnos | 40–65% | Exigir uso de recurso e pelo menos uma escolha defensiva |
| Elitário de Grau 1 | 8–12 turnos | 45–70% | Testar build, gestão de energia e leitura dos padrões |
| Chefe com fases | 10–16 turnos totais | Variável por fase | Aprender mecânica; não apenas esvaziar HP |

### Métricas a recolher

A cada simulação, guardar:
- turnos até à vitória/derrota;
- percentagem de vitórias por técnica e distribuição de atributos;
- vida e energia restantes;
- quantidade de ações perdidas por erro;
- número de técnicas usadas e respetivo valor;
- frequência de Black Flash;
- curas/itens usados;
- recompensa por minuto/turno, especialmente em missões repetíveis.

Meta inicial para a primeira missão: uma ficha nova, com decisões razoáveis, deve vencer sem consumíveis na maioria das tentativas de teste; investir em defesa deve reduzir o risco, mas aumentar muito a duração não deve ser uma estratégia ótima.

---

## 4. Curva proposta para dados e acertos

### Ataque físico

O jogador rola D20 e soma Precisão. Resultado natural 1 falha; resultado natural 20 é acerto crítico. Nos restantes casos, o total precisa atingir a Evasão do inimigo.

Proposta inicial a testar:
- personagem novo: aproximadamente 60–70% de chance de acerto contra a primeira maldição;
- maldição baixa: Evasão-alvo 9–10;
- Grau 2: Evasão-alvo 11–12;
- Grau 1/elitário: Evasão-alvo 13–14;
- chefe: Evasão depende da fase, com janelas claras de vulnerabilidade.

O nível não deve dar Precisão tão rápido que as rolagens deixem de importar.

### Dano físico

A fórmula atual dá muito dano por acerto, mas a chance baixa de acertar e a vida muito alta do inimigo tornam o valor efetivo por turno insuficiente. A proposta é ajustar **vida inimiga, Evasão e dano recebido em conjunto**, em vez de apenas elevar o dano do jogador.

Faixa a testar para o primeiro encontro:
- dano físico médio que conecta: 9–12 antes de crítico/Black Flash;
- dano efetivo por turno, depois da chance de acerto: cerca de 6–8;
- HP inicial da primeira maldição: cerca de 55–70;
- Defesa da primeira maldição: 1–2.

### Ataque inimigo

A regra de acerto deve usar um alvo de defesa legível, com um objetivo de cerca de 50–60% de acerto para um ataque comum contra a ficha inicial. A fórmula atual resulta em aproximadamente 70% no primeiro encontro.

Faixa a testar:
- primeira maldição: ataque-base 7–9, dado de dano D6, defesa do personagem subtraída;
- ataque pesado: multiplicador menor que o atual 1,45, com aviso claro e turno de preparação;
- carga: consome uma ação inimiga, anuncia qual benefício concede e aumenta o próximo ataque de forma limitada;
- crítico inimigo: forte, mas nunca deve apagar uma ficha nova com vida cheia sem outra oportunidade de resposta.

A defesa deve reduzir consistentemente o dano de uma rodada. Esquiva deve poder evitar o ataque inteiro, mas falhar com frequência suficiente para ser uma aposta.

---

## 5. Black Flash — raro, especial e explicável

Regra de projeto:
- o teste de Black Flash só é realizado depois de um ataque físico comum que acertou;
- técnica inata, item ou Expansão de Domínio não rolam Black Flash;
- um único teste separado indica claramente D20, valor necessário e resultado;
- sucesso dá uma amplificação expressiva, recuperação pequena de energia e pode interromper o próximo ataque;
- o efeito não pode criar um ciclo infinito de interrupção.

### Frequência pretendida
- ficha nova: cerca de 8–12% por ataque físico que acerta;
- build especializada em Controle: até cerca de 20–25% por ataque físico que acerta;
- frequência medida por turno deve também considerar a chance de errar o ataque inicial.

A implementação atual dá 5% no Controle inicial, o que pode parecer que a mecânica nem existe. A fórmula final deve ser limitada por um teto explícito e testada com milhares de amostras.

Black Flash deve ser uma recompensa emocionante, não a principal forma de causar dano necessária para vencer.

---

## 6. Técnicas inatas: papéis e comparações justas

Cada técnica deve ter:
- um custo claro de energia;
- dano esperado documentado;
- uma função estratégica;
- uma contrapartida;
- um efeito testável;
- interação compreensível com defesa, resistência e vulnerabilidade.

### Catálogo de design proposto

| Técnica | Papel principal | Efeito a preservar | Risco de balanceamento a verificar |
|---|---|---|---|
| Fala Amaldiçoada | Interrupção / controle | Pode fazer perder um turno ao inimigo | A chance de efeito não pode ser tão baixa que o custo se torne inútil |
| Manipulação de Sangue | Pressão sustentada | Sangramento por mais de uma rodada | Contabilizar o dano total e impedir que acumule sem limite |
| Técnica da Proporção | Preparação de dano | Marcar ponto fraco para o próximo acerto | O dano da própria técnica mais a abertura seguinte não pode superar todas as outras opções |
| Dez Sombras | Defesa e versatilidade | Ataque mais proteção temporária | Evitar que a proteção seja permanente ou que a técnica vire sempre a melhor escolha |

### Método de comparação
Em cada encontro, comparar:
- dano esperado da técnica incluindo o dano persistente;
- valor do turno inimigo negado;
- dano prevenido por proteção;
- dano adicional causado pela vulnerabilidade;
- custo de energia por ponto de valor gerado;
- quantos turnos de meditação a técnica obriga depois.

Não balancear somente pelo dano que aparece imediatamente na tela. Interromper um chefe por um turno também representa vida poupada.

---

## 7. Atributos e pontos de habilidade

A ficha deve permitir especialização sem tornar um atributo obrigatório.

### Atributos
- **Força:** dano físico.
- **Vitalidade:** vida e resistência.
- **Controle:** energia máxima, potência/estabilidade das técnicas e chance de Black Flash.
- **Instinto:** precisão física e chance de esquiva.

### Alterações a investigar antes de implementar
Os ganhos atuais por ponto são abruptos: Força +2 ataque, Vitalidade +13 HP, Controle +11 energia e potência técnica +2. Os quatro pontos iniciais podem causar uma diferença muito grande entre personagens da mesma missão.

Proposta de teste:
- reduzir os ganhos por ponto em Força e Vitalidade, ou introduzir retornos decrescentes;
- fazer cada ponto em Controle melhorar uma parte da ficha, mas não todas as partes com força total;
- evitar que um único ponto de Instinto aumente imediatamente muitos sistemas;
- manter 4 pontos iniciais, mas simular a distribuição ideal e a distribuição equilibrada;
- limitar o investimento inicial em um único atributo até que a curva seja testada;
- permitir respetiva redefinição por custo de jogo, se o jogador descobrir que construiu uma ficha inviável.

Atributos derivados devem ser calculados numa função única e cobertos por teste. Nunca atualizar vida/energia máxima em vários lugares com fórmulas diferentes.

---

## 8. Recursos e economia

### Energia amaldiçoada
A energia deve criar decisões reais:
- técnicas mais caras oferecem efeitos mais fortes ou mais seguros;
- meditar recupera energia, mas dá ao inimigo um turno;
- subir de nível pode recuperar reservas parcialmente, sem transformar cada batalha numa cura gratuita total;
- recompensas de missão devem sustentar uma técnica em parte do encontro, não spam ilimitado de técnicas.

### Vida e consumíveis
- a primeira luta deve poder ser vencida sem poção numa tentativa razoável;
- uma poção deve corrigir um erro ou prolongar uma luta, não substituir defesa a cada turno;
- usar poção continua a consumir o turno e permitir resposta inimiga;
- descanso, poções e talismãs precisam de preços coerentes com a recompensa típica.

### Ouro e recompensas
- primeira conclusão concede recompensa cheia;
- repetir missões de treino concede uma recompensa menor, porém previsível;
- missões de maior risco dão melhor recompensa por turno, sem serem necessariamente a única maneira viável de progredir;
- a loja não deve criar uma espiral em que uma derrota impeça o jogador de comprar qualquer recuperação.

Meta: o primeiro exorcismo deve render uma melhoria pequena — por exemplo, uma poção ou parte de um descanso —, não dinheiro para comprar cura infinita.

---

## 9. Progressão, níveis e rebirth

### Níveis
- XP precisa refletir duração, risco e nível recomendado da missão.
- Ganhar um nível deve ser perceptível, mas não apagar todas as consequências da batalha.
- A quantidade de pontos por nível deve ser projetada com a vida, ataque e defesa derivados.
- Desbloqueios importantes não devem exigir farm repetitivo de um só inimigo.

### Rebirth
Condições e recompensas a rever:
- requisito de nível e quantidade de exorcismos proporcionais ao conteúdo que já existe;
- mostrar exatamente o que reinicia e o que fica permanente antes de confirmar;
- legado oferece escolhas entre caminhos, em vez de somente acrescentar o mesmo bônus a todos;
- inimigos podem considerar o legado, mas o escalonamento não deve anular o bônus recebido;
- objetivos ou eventos diferentes por ciclo, para evitar que o rebirth seja somente repetir as mesmas batalhas.

O rebirth de alto nível é uma meta futura; primeiro precisamos garantir que a progressão de nível 1–8 seja justa.

---

## 10. IA da história e randomizer — depois, não agora

A atualização não deve adicionar geração por IA neste momento. O sistema narrativo deve ser preparado para isso com dados estruturados.

Futura abordagem:
1. Randomizer local com seed: ordem de encontros, eventos, recompensas e escolhas entre opções já aprovadas.
2. Validador que rejeite escolhas que quebram pré-requisitos, economia, combate ou estado da história.
3. História gerada por IA como função opcional, através de backend seguro; nenhuma chave de API será guardada no JavaScript do browser.
4. Fallback para diálogos escritos à mão, caso o modelo falhe ou produza um resultado inválido.
5. Testes de replay para verificar que o mesmo estado e seed reproduzem a mesma sequência.
6. Conteúdo original, sem pedir ao modelo que reproduza capítulos inteiros do mangá ou diálogos extensos do anime.

Preparar a arquitetura agora evita misturar geração narrativa com regras de combate mais tarde.

---

## 11. Plano de implementação da mega update

**Ainda não executar estes passos nesta fase.** Eles definem a ordem para a próxima sessão de trabalho.

### Fase A — Instrumentação e modelo matemático
- [ ] Isolar rolagens, cálculo de acerto, dano e efeitos.
- [ ] Definir uma fonte de aleatoriedade injetável para testes reproduzíveis.
- [ ] Criar uma simulação sem interface, capaz de realizar milhares de lutas por técnica/build.
- [ ] Gerar uma tabela automática de duração, taxa de vitória, vida restante, uso de técnicas e Black Flash.
- [ ] Não modificar a interface até obter um ponto de comparação confiável.

### Fase B — Rebalanceamento do combate inicial
- [ ] Corrigir acerto base de jogador e inimigo.
- [ ] Ajustar HP, evasão, defesa e ataque da primeira maldição.
- [ ] Rever custo e eficácia de cada técnica.
- [ ] Definir uma função de guarda/esquiva clara para ataque normal e pesado.
- [ ] Rever probabilidade, dano e interrupção do Black Flash.
- [ ] Testar o primeiro encontro em build equilibrada e build especializada.

### Fase C — Progressão e economia
- [ ] Recalibrar o valor por ponto de atributo.
- [ ] Rever XP, cura ao subir de nível, recompensa de ouro e repetição.
- [ ] Garantir que uma derrota não cause softlock financeiro.
- [ ] Verificar a progressão do nível 1 ao 8 sem farm obrigatório.
- [ ] Especificar o contrato de rebirth e calcular a força do legado após cada ciclo.

### Fase D — Adaptação de conteúdo
- [ ] Criar padrões exclusivos e fases para cada inimigo importante.
- [ ] Usar telegráficos e efeitos visuais para explicar ataques, defesa, vulnerabilidade e interrupção.
- [ ] Garantir que a dificuldade vem das mecânicas e não só de HP inflado.
- [ ] Adicionar opções de dificuldade sem mudar a identidade do sistema.

### Fase E — Narrativa, persistência e QA
- [ ] Rever como as escolhas de diálogo alteram flags, recompensas e operações disponíveis.
- [ ] Fazer testes de save antes, durante e depois do combate.
- [ ] Criar verificação automática de rotas impossíveis/softlocks.
- [ ] Validar desktop, mobile, teclado e toque.
- [ ] Somente depois estabilizar randomizer; IA generativa fica numa fase separada.

---

## 12. Critérios para aceitar a mega update

A atualização só deve ser considerada pronta quando:

- [ ] O primeiro combate pode ser vencido de maneira consistente por mais de uma técnica, sem depender de Black Flash.
- [ ] A ficha inicial não perde automaticamente contra um inimigo de Grau 3 devido aos números-base.
- [ ] Nenhuma técnica é estritamente superior às outras em todos os cenários.
- [ ] Guardar, esquivar, atacar e meditar têm vantagens e custos que aparecem claramente na interface.
- [ ] A probabilidade de Black Flash corresponde à meta documentada.
- [ ] Os testes de balanceamento usam milhares de combates reproduzíveis e mostram resultados por build.
- [ ] O caminho inicial não exige repetir a mesma missão demasiadas vezes.
- [ ] Não há regressões nos testes, nos saves ou nos fluxos de diálogo.
- [ ] Os valores e as fórmulas estão documentados e centralizados; não espalhados em vários arquivos.
- [ ] Não se afirma que a história gerada por IA existe até ser efetivamente implementada e testada.

## Decisão final de design

**Primeiro equilibrar, depois ampliar.** O escopo da próxima atualização é o núcleo de combate, atributos e economia. Não adicionar mais técnicas, chefes ou capítulos até que a primeira luta e as quatro técnicas tenham resultados comparáveis e os testes automáticos confirmem a curva.