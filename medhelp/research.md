# Pesquisas e Limites Técnicos - Geração de Flashcards por Subagentes

## 1. Mapeamento de Destinos
- **Vault Local do Obsidian**: `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1`
- **Pasta de Flashcards do Negócio**: `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1/📈Negócio/Flashcards`
- **Lógica de Sincronização**: O Overgrive sincroniza a pasta local com o Google Drive `/Obsidian/faculdadedemedician1/negócio/Flashcards` na nuvem.

## 2. Parâmetros de Estilo dos Flashcards (Obsidian Spaced Repetition)
- **Pergunta / Resposta**:
  ```markdown
  Qual o marco do desenvolvimento motor com 2 meses?
  ?
  - **Controle cefálico**: mantém a cabeça erguida quando em decúbito ventral.
  - Alerta: ==não deve apresentar hipotonia global persistente==.
  ```
- **Proibições Rígidas**:
  - Emojis de qualquer tipo nas perguntas ou respostas.
  - Qualquer tag HTML (ex: `<div>`, `<span>`, `<br>`).
  - Linhas em branco intermediárias na resposta de um mesmo card.
- **Marcações Visuais Obrigatórias**:
  - Conceitos-chave em **negrito** (ex: **Hipotireoidismo Congênito**).
  - Fármacos, doses e valores críticos em `código` (ex: `Levotiroxina`, `10 a 15 mcg/kg/dia`).
  - Pontos de atenção crítica em realce duplo de igual (ex: ==realizar teste do pezinho entre o 3º e 5º dia de vida==).
  - Cascatas causais e processos com `->` ou `=>`.

## 3. Escopo por Problema (Subagentes)
1. **Subagente P1 (Triagem Neonatal, Icterícia, Puericultura, 1100 dias)**
   - Curadoria baseada no PDF 3 (Orelhinha, Olhinho, Teste do Pezinho, Bilirrubina/Icterícia, 1100 dias, Puericultura).
   - Foco na identificação de problemas materno-fetais, cronograma de consultas, classificação do RN, icterícias neonatal (ABO, Rh, aleitamento, leite materno) e testes de triagem.
2. **Subagente P2 (Aleitamento Materno, Micronutrientes, Suplementações)**
   - Curadoria baseada no PDF 2 (Micronutrientes, suplementações obrigatórias de ferro/Vit D/Vit A/zinco em prematuros e a termo, intercorrências na amamentação, introdução alimentar).
3. **Subagente P3 (Crescimento e Desenvolvimento, Curvas, Baixa Estatura, M-CHAT-R)**
   - Curadoria baseada no PDF 4 (Crescimento e desenvolvimento, fatores de influência, vigilância do crescimento, percentis, escore Z, alvo estatural, baixa estatura constitucional vs patológica, marcos do neurodesenvolvimento de 0-2 anos, M-CHAT-R).
4. **Subagente P4 (Vacinação, Princípios, Calendários, ESAVI)**
   - Curadoria baseada no PDF 1 (Conceitos de vacinação, vacinas atenuadas vs inativadas, PNI vs SBP/SBIm, calendário de prematuros e a termo, contraindicações, precauções, ESAVI - vigilância e notificação).
5. **Subagente P5 (Adolescência e Puberdade, Tanner, HEADSS, Saúde do Adolescente)**
   - Curadoria baseada no PDF 5 (Adolescência vs Puberdade, sigilo médico/ética/lei, anamnese e HEADSS, estadiamento de Tanner, desenvolvimento psicossocial e neurodesenvolvimento, medidas de promoção de saúde - vacinas, exercícios, sono, alimentação).
