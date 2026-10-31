# Log de Sistema - Medhelp

## 2026-10-31 — Redesign Visual Editorial Contemporâneo dos PDFs Premium (WeasyPrint)
- **Arquivos:** [`colab_gerador_pdf_premium.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Contexto e Motivação:**
  - Após brainstorming e aprovação via Understanding Lock, os PDFs de resumos de transcrições ganharam uma identidade editorial contemporânea inspirada em periódicos médicos modernos.
  - O estilo anterior (Roboto com bordas de tabela pretas simples) foi substituído por uma tipografia serifada de alto padrão e tabelas executivas que combinam com os novos resumos focados em conceitos e tabelas.
- **Modificações Pontuais Realizadas:**
  1. **Tipografia Editorial:**
     - Títulos (`h1`, `h2`, `h3`, `h4`): Playfair Display com serifa acadêmica e imponente.
     - Corpo e Tabelas: Inter geométrica moderna em 10pt/line-height 1.6 para máxima legibilidade.
     - Título principal (`h1`): 20pt `#1a1a1a` com linha de destaque em Verde Musgo (`1.5pt solid #556B2F`).
     - Títulos secundários (`h2`): 13.5pt em Verde Musgo (`#556B2F`) com linha base sutil `#e2e8f0`.
  2. **Tabelas Executivas de Alto Contraste:**
     - Cabeçalho (`th`): Fundo sólido em Verde Musgo (`#556B2F`), tipografia Inter 9pt sem serifa, texto em branco puro (`#ffffff`) com padding confortável `7pt 10pt`.
     - Zebra Striping: Linhas pares em `#f9faf8` e ímpares em `#ffffff` para conforto visual ao ler tabelas densas.
     - Divisórias: Linhas suaves `#e2e8f0` entre linhas (`td`).
  3. **Box de Conduta Clínica (`blockquote`):**
     - Borda esquerda encorpada de `3pt solid #556B2F`, fundo pastel suave `#f8faf7`, cantos `0 4pt 4pt 0` e texto regular sem itálico apagado.
  4. **Resiliência e Dependências:**
     - Injeção de `@import url(...)` do Google Fonts no CSS.
     - Adição do pacote `fonts-inter` via `apt-get` no Colab para garantir renderização local.
     - Bump do Guardião de Versões para `2026-10-31T17:30:00Z`.
- **Validação de Laboratório:**
  - Validação de integridade sintática Python AST em todas as células de código do notebook.
  - Verificação de parsing do formato JSON do notebook.

## 2026-10-31 — Refatoração do Prompt de Transcrições para Formato Enxuto (Conceitos + Tabelas + Conduta)
- **Arquivos:** [`Prompt.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Prompt.js), [`Config.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Config.js), [`Main.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Main.js), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Contexto e Motivação:**
  - Após revisão do usuário, abandonou-se a divisão rígida em "Páginas 1 e 2" e retornou-se à topologia do resumo clássico com podas severas para deixá-lo enxuto e estritamente visual.
- **Modificações Pontuais Realizadas:**
  1. **Seção 1:** Título alterado para `## 1. Assuntos que vão cair na prova`.
  2. **Remoção de "O que NÃO priorizar":** Extirpado completamente da instrução e da saída.
  3. **Resumo Teórico Focado em Conceitos e Tabelas:** Texto descritivo limitado ao `Conceito-chave` em bullets curtos; todo o desdobramento mecânico/fisiopatológico foi forçado obrigatoriamente para **Tabelas Markdown de fácil leitura**.
  4. **Seção de Conduta Direta:** Removida a introdução de "Correlação clínica", mantendo a seção `## 3. Conduta` com `Conduta Geral` e a `Tabela de Resolução Rápida (Se/Então)`.
  5. **Remoção de "Erros Comuns e Armadilhas":** Extirpado completamente da instrução e da saída.
- **Validação:**
  - Sintaxe JS validada, compatibilidade garantida com o ecossistema Google Apps Script.

## 2026-10-31 — Implementação do Guia de Alto Rendimento / Foco Radical em Prova (2 Páginas Reversível)
- **Arquivos:** [`Prompt.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Prompt.js), [`Config.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Config.js), [`Main.js`](file:///home/vvgfilhos/medhelp/scripts/apps-script/automacao-transcricoes/Main.js), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Contexto e Motivação:**
  - O formato legado de resumos teóricos em tópicos densos (5 a 6 páginas em PDF) vinha sofrendo rejeição pelos estudantes, que priorizam estudar pelos slides de aula.
  - Implementou-se a estratégia "Cavalo de Troia": o resumo agora é um **Guia de Alto Rendimento (Foco Radical em Prova)** de exatamente 2 páginas, projetado para servir como abertura/capa antes dos slides da aula.
- **Arquitetura de Dupla Camada de Reversão:**
  - **Camada Git:** Criada e ativada a branch dedicada `teste-guia-alto-rendimento`. A qualquer momento, o usuário pode retornar ao estado anterior com `git checkout main`.
  - **Camada de Configuração (Feature Flag):** Em `Config.js`, adicionada a chave `MODO_RESUMO: 'GUIA_PROVA'`. Para voltar ao resumo legado de 6 páginas, basta alterar para `'TEORIA_COMPLETA'`.
- **Engenharia de Prompt (Framework OCANES):**
  - Prompt clássico preservado em `SYSTEM_INSTRUCTION_TEORIA_LEGADO`.
  - Novo prompt `SYSTEM_INSTRUCTION_GUIA_PROVA` implementado com teto rígido de 2 páginas:
    - **Página 1:** Foco Avaliativo & Probabilidade de Cobrança, Modelos de Questão & Pegadinhas do Docente, e Caso Clínico da Aula / Erro Prático.
    - **Página 2:** Tabela Comparativa / Diagnóstico Diferencial, Tabela de Resolução Rápida (Se/Então), e Armadilhas Fatais (*Conceito A NÃO É Conceito B*).
  - Marcador de quebra física de página injetado: `<div style="page-break-before: always;"></div>` e `---`.
- **Validação de Laboratório:**
  - Simulação realizada com a transcrição real da aula de Dengue (1h 05m), gerando o artefato de teste [`Conferencia_Dengue_Guia_Laboratorio.md`](file:///home/vvgfilhos/medhelp/scratch/Conferencia_Dengue_Guia_Laboratorio.md).
  - Resultado: Redução de ~65% nos tokens de saída, resposta rápida e enquadramento cirúrgico em 2 páginas.

## 2026-10-29 — Atualização da Pasta de Conferências e Remoção de TBL (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Atualização do link da pasta de **Conferências** para `https://drive.google.com/drive/u/0/folders/12d8cwaMFHzbPBJrMBJK4Mo1xfuLnOE0j` dentro de `.pasta-bloco[data-categoria="outros"]`.
  - Remoção completa do item e link de **TBL** da lista de subpastas.
  - Ajuste na legenda do botão de filtro de categoria (`🗂️ Outros (Lacuna & Conf)`) e no `meta description` para refletir a saída de TBL da grade ativa.
- **Conformidade V.L.A.E.G. & Analytics:**
  - Preservados os estilos visuais padrão (`.sub-marcador.destaque`, `.sub-nome`, `.sub-seta`) e atributos de acessibilidade (`aria-label`).
  - O script [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) captura automaticamente o clique em Conferências com `item_category: 'Outros'`.
- **Validação de Laboratório:**
  - Validação da árvore sintática HTML com parser formal estrito (0 tags desbalanceadas, 100% íntegro).

## 2026-10-29 — Transição para o Módulo de Dor e Adição de OSCE em Habilidades Médicas (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Atualização do cabeçalho de módulo no `meta description` e no `.modulo-badge` de "Febre, Inflamação e Infecção" para "Módulo de Dor".
  - Atualização integral do bloco de Tutoria (`.pasta-bloco[data-categoria="tutoria"]`):
    - Pasta principal: `https://drive.google.com/drive/u/0/folders/1GWZTVYpt8oQ4BLntAtYOxsG9Dg2zYomY` ("Módulo de Dor - Tutoria").
    - Problema 01: `https://drive.google.com/drive/u/0/folders/1c_cHqCV4Q0wF8k5aufQU47ncHMsUwp9k`
    - Problema 02: `https://drive.google.com/drive/u/0/folders/1mg8umfNdWWpZTwkYMP9ETA18vgHTlXm2`
    - Problema 03: `https://drive.google.com/drive/u/0/folders/1JNGHigprmKrR9hHuS50o7XK7ZobQI1BU`
    - Removido Problema 04 legado do módulo anterior.
  - Inclusão do subgrupo **OSCE** na seção de Habilidades Médicas (`.pasta-bloco[data-categoria="habilidades"]`):
    - Link: `https://drive.google.com/drive/u/0/folders/1hSHeViOuDporaY1QleBkXSJ92mc5bjbI`
    - Nome: `OSCE`
- **Conformidade V.L.A.E.G. & Analytics:**
  - Preservados os estilos padrão (`.sub-item`, `.sub-marcador`, `.sub-nome`, `.sub-seta`) e atributos de acessibilidade (`aria-label`).
  - O script [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) captura automaticamente as novas subpastas e o cabeçalho via Beacon API do GA4.
- **Validação de Laboratório:**
  - Árvore HTML validada com parser formal estrito (0 tags desbalanceadas, 100% de integridade sintática).

## 2026-10-26 — Atualização do Bloco Flashcards com Cognitiva no Portal Medhelp (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Remoção do link de **Lacuna Zero** e inclusão do caderno interativo de flashcards de **Cognitiva** via Google NotebookLM:
    - **Link Exclusivo:** `https://notebooklm.link.google/FZj81DdprGxO`
    - **Nome do Item:** `Cognitiva`
    - **Acessibilidade:** `aria-label="Acessar Flashcards de Cognitiva no NotebookLM"`
- **Conformidade V.L.A.E.G. & Analytics:**
  - Preservados os seletores visuais (`.sub-item`, `.sub-marcador.destaque`, `.sub-nome`, `.sub-seta`) e atributos semânticos (`target="_blank"`).
  - O rastreador GA4 em [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) captura automaticamente o clique disparando o evento `click_sub_item` com `item_category: 'Flashcards'` e `item_name: 'Cognitiva'`.
- **Validação de Laboratório:**
  - Validação da árvore sintática HTML com parser formal estrito (0 tags desbalanceadas, 100% de integridade estrutural).

## 2026-10-20 — Unificação do Bloco Flashcards em Lacuna Zero no Portal Medhelp (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Remoção de todos os links, placeholders e nomes do bloco `.pasta-bloco[data-categoria="flashcards"]` (removidos TFC Clínico, TFC Cirúrgico e placeholders de módulos/revisões).
  - Inserção exclusiva do caderno interativo de flashcards do **Lacuna Zero** via Google NotebookLM:
    - **Link Exclusivo:** `https://notebooklm.link.google/aOaQN6cI1NYQ`
    - **Nome do Item:** `Lacuna Zero`
    - **Acessibilidade:** `aria-label="Acessar Flashcards de Lacuna Zero no NotebookLM"`
- **Conformidade V.L.A.E.G. & Analytics:**
  - Mantida padronização visual com `.sub-item`, `.sub-marcador.destaque`, `.sub-nome` e `.sub-seta`.
  - Disparo de eventos GA4 via `analytics.js` preservado para a categoria `Flashcards`.
- **Validação de Laboratório:**
  - Parser formal de árvore HTML executado com sucesso (0 tags desbalanceadas, 100% de integridade estrutural).

## 2026-10-18 — Atualização do Link do Flashcard de TFC Cirúrgico no Portal Medhelp (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Substituição do link do caderno interativo do Google NotebookLM de **TFC Cirúrgico** dentro do bloco `.pasta-bloco[data-categoria="flashcards"]`.
  - Link anterior: `https://notebook.google.com/notebook/ee774c54-ae58-499d-9b25-a70ed2c76618`
  - Novo link: `https://notebooklm.link.google/Io3b1Z5d4mqf`
- **Conformidade V.L.A.E.G. & Analytics:**
  - Preservados os atributos semânticos (`aria-label="Acessar Flashcards de TFC Cirúrgico no NotebookLM"` e `target="_blank"`), classes estéticas (`.sub-item`, `.sub-marcador.destaque`, `.sub-nome`, `.sub-seta`) e compatibilidade total com o despacho de eventos GA4 via `analytics.js`.
- **Validação de Laboratório:**
  - Análise sintática e verificação de integridade da árvore HTML sem erros de fechamento ou tags desbalanceadas (100% íntegro).

## 2026-10-13 — Publicação dos Flashcards de TFC Clínico e TFC Cirúrgico no Portal Medhelp (index.html)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/medhelp/index.html) (raiz do repositório / GitHub Pages), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Descrição da Alteração:**
  - Inserção dos links interativos do Google NotebookLM para os cadernos oficiais de flashcards de **TFC Clínico** e **TFC Cirúrgico** dentro do bloco `.pasta-bloco[data-categoria="flashcards"]`.
  - Links configurados:
    - **TFC Clínico:** `https://notebook.google.com/notebook/f0be34ca-65be-4ad4-9412-3e18888c2c5a`
    - **TFC Cirúrgico:** `https://notebook.google.com/notebook/ee774c54-ae58-499d-9b25-a70ed2c76618`
  - Atualização sutil da `meta description` para incluir "Flashcards" no resumo do portal para indexação e compartilhamento.
- **Conformidade de UX, Design e Analytics (V.L.A.E.G.):**
  - **Acessibilidade & Semântica:** Adicionados atributos `aria-label="Acessar Flashcards de TFC Clínico no NotebookLM"` e `target="_blank"` com classes consistentes (`.sub-item`, `.sub-marcador.destaque`, `.sub-nome`, `.sub-seta`).
  - **Preservação de Layout:** Mantidos os placeholders (`.sub-item-placeholder` com badge "Em breve") para os futuros decks de tutoria do módulo e revisões cognitivas espaçadas.
  - **Rastreamento GA4 Automático:** O script [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) intercepta as tags `.sub-item` ativas e despacha o evento `click_sub_item` com `item_category: 'Flashcards'` e as respectivas URLs via `transport: 'beacon'`.
- **Validação de Laboratório:**
  - Validação da árvore sintática HTML com parser formal (0 tags desbalanceadas, integridade 100%).
  - Validação da integração e sintaxe JS via Node.js.

## 2026-10-10 — Refatoração Cirúrgica do Orquestrador Híbrido: Desacoplamento de Offsets e Suporte Multi-Partes
- **Arquivos:** [`scripts/colab/Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb), [`research.md`](file:///home/vvgfilhos/medhelp/research.md), [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Problema Diagnosticado e Motivação:**
  - O usuário reportou via áudio que livros travavam constantemente na validação da Célula 7 com mensagens de "verificar offset" (`página ≤ 0`) ou páginas além dos limites do PDF, especialmente para **livros digitais fatiados em partes** (`_parte1.pdf`, `_parte2.pdf`, `_parte3.pdf`), forçando a edição manual constante do `config.json`.
  - **Causa Raiz 1 (Antipattern de Aritmética por LLM):** O prompt da Célula 6 forçava o Gemini a somar offsets a cada página. LLMs frequentemente falham em somas de listas e operações com números negativos.
  - **Causa Raiz 2 (Cláusula Confusa no Prompt):** A regra `(se o offset for 0 ou o livro for digital, mantenha os números originais sem alteração)` fazia o Gemini ignorar os offsets informados pelo usuário para livros digitais divididos em partes (que necessitam de offset negativo como `-450`).
  - **Causa Raiz 3 (Dica Incorreta na Célula 3):** O prompt interativo sugeria digitar `0` para qualquer livro digital, induzindo o usuário a não configurar o offset em partes fatiadas posteriores.
  - **Causa Raiz 4 (Ausência de Pipeline Pós-LLM):** O Python confiava cegamente nas páginas devolvidas pelo LLM em vez de aplicar o `offsets.json` deterministicamente.
- **Refatorações Aplicadas:**
  1. **Célula 3 (Mapeamento Interativo Didático):**
     - Prompt interativo atualizado com distinção clara entre Livro Digital de Volume Único (offset `0`) e Livros Impressos ou Fatiados em Partes (offset = `leitor - impresso`, ex: `-450`).
     - Detecção automática de sufixos `parte2`, `parte3` exibindo dicas contextuais.
     - Confirmação visual imediata do cálculo: `Citado X + offset Y = Leitor Z`.
  2. **Célula 5 (Motor Determinístico de Resolução & Modelos 3.x):**
     - Alinhamento rigoroso dos modelos para a geração 3.x (`gemini-3.8-flash`, `gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.5-flash`), descartando versões legadas 2.x conforme diretriz do usuário.
     - Adicionada função `resolver_arquivo_pdf(arquivo_citado, pasta_livros)`: matching tolerante a faltas de `.pdf`, case-insensitive, acentuação e fuzzy matching com `get_close_matches`.
     - Adicionada função `aplicar_offsets_deterministicos(config, pasta_livros, offsets_dict)`:
       - Cálculo aritmético puro em Python (`pg + offset`).
       - Auto-cura de páginas já físicas (evita offset duplicado ou negativo caso o roteiro já cite páginas do leitor).
       - Auto-cura de inversão acidental de sinal (`pg - offset`).
       - Roteamento inteligente de partes fatiadas (se uma página citada pertencer a outra parte do livro, re-associa o corte).
     - Adicionada função `recalibrar_config_offsets()`: recalibragem instantânea em Python com custo zero de API.
     - Limpeza de código morto: remoção de `_build_cover_index` e estilos ReportLab órfãos (`'secao'`, `'pg_right'`, `'livro'`, `'cap'`, `'sec'`).
     - Blindagem de layout em `gerar_capa` (margens e spacers calibrados para garantir que a capa caiba rigorosamente em 1 página A4).
     - Refatorada função `validar_config(config, pasta_livros)` com relatórios analíticos ricos e diagnósticos claros.
  3. **Célula 6 (Conversão Semântica Isolada):**
     - Refatorado `SYSTEM_PROMPT_CONVERSAO`: o Gemini agora é estritamente um extrator semântico das páginas citadas brutas (`paginas: list[int]`), sem fardo aritmético.
     - Pós-processamento encadeado em Python aplicando `aplicar_offsets_deterministicos` e `consolidar_cortes_contiguos` antes de salvar `config.json`.
  4. **Célula 7 (Preview Enriquecido):**
     - Exibição de vídeos recomendados no preview pré-geração.
- **Validação de Laboratório:**
  - Sintaxe de todas as 22 células do notebook validada com sucesso via AST (`ast.parse`).
  - Suíte de testes (`test_hybrid_orchestrator.py`) executada cobrindo livros divididos em partes com offset negativo, roteiros com páginas físicas pré-ajustadas, livros com offset positivo, livros digitais íntegros e tolerância a erros tipográficos de nomes de arquivos.
  - 100% dos testes aprovados.

## 2026-10-05 — Curadoria & Fusão de Objetivos de Tutoria: Meningites (Orquestrador Híbrido)
- **Contexto e Solicitação:**
  - O usuário submeteu 5 objetivos extraídos do NotebookLM para o tema **Meningites** com as fontes `Harrisson Medicina interna_recortado_4.pdf` [DIGITAL] e `PROTOCOLO DE FLUXOS E ROTINAS DAS MENINGITES 2022 (1).pdf` [IMPRESSO].
  - Em áudio, solicitou a fusão de objetivos que cobrem a mesma matéria e possuem as mesmas páginas, mantendo os títulos originais da tutoria explicitamente preservados como sub-objetivos tutoriais e respeitando o padrão estrutural do Orquestrador Híbrido.
- **Diagnóstico das Páginas e Sobreposição:**
  - `Objetivo 3` (Análise do LCR) e `Objetivo 4` (Diferencial Meningite vs. Encefalite) apresentavam exatamente as mesmas páginas no Protocolo (`pp. 8–25`) e Harrison Cap. 138 (`pp. 2111–2122`). Sem fusão, 18 páginas do Protocolo seriam duplicadas no corte físico.
  - O offset do Protocolo impresso foi aferido como `+1` (p. 9 impressa = p. 10 do leitor). O Harrison é digital (offset `0`).
- **Solução Implementada:**
  - Estruturação do texto pronto para input na Célula 4 com fusão dos Objetivos 3 e 4 sob o título unificado *"Análise Liquórica e Diagnóstico Diferencial nas Infecções do SNC"*, preservando ambas as perguntas norteadoras como sub-objetivos tutoriais.
  - Oferecida também a variante com agrupamento de todo o eixo diagnóstico (Objetivos 2, 3 e 4 unificando pp. 5–25 do Protocolo).

## 2026-10-05 — Extrator de Sumário Digital: Microbiologia Tortora 12ª ed. & Refinamento de Preliminares
- **Arquivos:** [`scripts/python/extrair_sumario_digital.py`](file:///home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py), `~/Downloads/Livros - Sumário Digital/Microbiologia Tortora 12. ed - Sumario_Digital.md`, [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Contexto e Solicitação:**
  - O usuário solicitou a geração do sumário digital do livro `Microbiologia Tortora 12. ed.pdf` localizado na pasta `~/Downloads/Livros - Sumário Digital`.
- **Aprimoramento do Script:**
  - Expandido o conjunto `preliminares_ignorar` para incluir os nós editoriais pré-textuais presentes em livros médicos como o Tortora: `"iniciais"`, `"ficha catalográfica"`, `"ficha técnica"`, `"sobre os autores"` e `"sumário detalhado"`.
  - Isso eliminou completamente o ruído de páginas de créditos e fichas pré-capítulo 1, iniciando a estrutura limpa diretamente em `Parte I - Fundamentos de microbiologia` (pág. 23).
- **Validação de Execução:**
  - Processado `Microbiologia Tortora 12. ed.pdf` (962 páginas, 168 MB).
  - Gerado com sucesso o arquivo [`Microbiologia Tortora 12. ed - Sumario_Digital.md`](file:///home/vvgfilhos/Downloads/Livros%20-%20Sumário%20Digital/Microbiologia%20Tortora%2012.%20ed%20-%20Sumario_Digital.md) com **42 tópicos estruturados**:
    - **Parte I - Fundamentos de microbiologia** (pp. 23–285, Capítulos 1 a 9);
    - **Parte II - Visão geral do mundo microbiano** (pp. 286–410, Capítulos 10 a 13);
    - **Parte III - Interação entre micróbio e hospedeiro** (pp. 411–600, Capítulos 14 a 20);
    - **Parte IV - Microrganismos e doenças humanas** (pp. 601–792, Capítulos 21 a 26);
    - **Parte V - Microbiologia ambiental e aplicada** (pp. 793–832, Capítulos 27 a 28);
    - **Finais** (pp. 833–962, Respostas, Apêndices A a E, Glossário e Índice).
  - Intervalos de páginas calculados com precisão matemática física (1-based), pronto para ingestão no NotebookLM.

## 2026-09-29 — Orquestrador Híbrido: Eliminação da Célula 6.5, Resolução de Offsets Digitais e Normalização NFC
- **Arquivos:** [`scripts/colab/Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb), [`research.md`](file:///home/vvgfilhos/medhelp/research.md) e [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Problema Diagnosticado e Motivação:**
  1. **Falha de Offsets em Livros Digitais:** Cortes de livros como `Histologia Básica_parte2.pdf` e `Robbins - Patologia_parte2.pdf` retornavam com `"paginas": "VERIFICAR_OFFSET"`, travando a validação na Célula 7. Causa: a instrução do prompt forçava o Gemini a acionar a flag de segurança `precisa_verificar_offset = true` diante de menções de leitor ou arquivos com divergência de acentos Unicode (NFD `Básica` com `\u0301` vs NFC `Básica`).
  2. **Disfunção e Redundância da Célula 6.5:** O subagente de otimização curatorial (`otimizar_config_com_llm`) dependia das tags `[FOCO]` e `[MENÇÃO]` (removidas do NotebookLM em 25/09/2026) e duplicava a fusão e o escopo da Célula 6. Na prática, não funcionava e adicionava latência desnecessária.
- **Refatorações Aplicadas:**
  1. **Eliminação Completa da Célula 6.5 como Chamada de LLM:**
     - Removidas as células 16 (markdown) e 17 (código com requisição ao Gemini) do notebook.
     - A função determinística `consolidar_cortes_contiguos` (Python puro) foi movida para ser executada diretamente ao final da Célula 6 logo após a resposta do Gemini, rodando em milissegundos e sem chamadas extras de IA.
     - Removido código morto em Célula 5 (`Operacao`, `ResultadoOtimizacao`, `resumir_config_para_llm`, `aplicar_operacoes`, `pos_validar_otimizacao`, `otimizar_config_com_llm`).
  2. **Eliminação do Erro `VERIFICAR_OFFSET`:**
     - Removido o campo `precisa_verificar_offset` da classe `CorteJSON` e do prompt `SYSTEM_PROMPT_CONVERSAO`. O Gemini sempre retorna `paginas: list[int]` já calculadas com o offset aplicado.
     - Instrução explícita de que livros digitais ou com offset 0 mantêm as páginas do roteiro intactas.
  3. **Remoção de Fusão Indesejada entre Objetivos Diferentes:**
     - Eliminada a regra `Análise de Fusão` do prompt da Célula 6 e o campo `fusao` de `ObjetivoJSON`, garantindo que cada objetivo da tutoria gere seu próprio PDF independente.
  4. **Normalização Universal Unicode NFC:**
     - Injetado `unicodedata.normalize('NFC', ...)` na Célula 3 (`_carregar_offsets`, `_salvar_offsets`, `mapear_offsets`), na Célula 5 (`validar_config`) e na Célula 6 (`gerar_tabela_offsets` e pós-processamento).
     - Na Célula 3, adicionado atalho para digitar diretamente `0` no prompt caso o livro seja digital.
- **Validação de Laboratório:**
  - Todas as 22 células do notebook validadas com sucesso via `ast.parse` (0 erros de compilação Python).
  - Simulação de parsing Pydantic executada com o caso real do usuário (Objetivo 01 de PAC) comprovando validação limpa dos cortes de Histologia e Robbins sem `VERIFICAR_OFFSET`.

## 2026-09-29 — Pipeline Colab: Hotfix PyAV 19.0.0 (`metadata_errors`) & Blindagem de Versão
- **Arquivos:** [`scripts/colab/Transcribe.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Transcribe.ipynb), [`research.md`](file:///home/vvgfilhos/medhelp/research.md) e [`task.md`](file:///home/vvgfilhos/medhelp/task.md)
- **Incidente Observado em Produção:**
  - O pipeline de transcrição médica no Google Colab falhou para todas as 5 aulas do lote com a seguinte exceção:
    `TypeError: open() got an unexpected keyword argument 'metadata_errors'`
- **Causa Raiz Identificada:**
  1. A biblioteca PyAV (`av`) lançou a versão **19.0.0** no PyPI em 29/09/2026 às 17:46:33 UTC (poucas horas antes da execução).
  2. No PyAV 19.0.0, os argumentos `metadata_errors` e `metadata_encoding` foram **removidos** de `av.open()` (o comportamento agora força UTF-8 com `surrogateescape`).
  3. O `faster-whisper` (1.2.1) declara dependência como `av>=11` (sem teto superior). Assim, `pip install faster-whisper` instalou a versão recém-lançada `av==19.0.0`.
  4. Na decodificação interna de áudio (`faster_whisper/audio.py`), a biblioteca executa `av.open(input_file, mode="r", metadata_errors="ignore")`, disparando a exceção fatal.
- **Correções Aplicadas (Protocolo de Defesa em Dupla Camada):**
  1. **Camada 1 — Instalação (Célula 1):**
     - Fixado `"av<19"` no comando pip (`!pip install faster-whisper "av<19" nvidia-cublas-cu12 nvidia-cudnn-cu12 -q`).
     - Atualizado banner de confirmação para `v2.5 PyAV-Fix + CUDA`.
  2. **Camada 2 — Hotfix Self-Healing em Runtime (Célula 4):**
     - Implementado monkeypatch defensivo transparente em `av.open` no topo da Célula 4 e dentro de `transcrever_audio`.
     - Caso `metadata_errors` ou `metadata_encoding` sejam passados ao abrir o contêiner de áudio, eles são descartados via `kwargs.pop()` antes de delegar para o `av.open` original.
     - **Vantagem Imediata:** Permite que o usuário re-execute a Célula 4 imediatamente na mesma sessão do Colab sem precisar reiniciar o ambiente ou re-instalar pacotes.
  3. **Correção de Sintaxe no Guardião de Versão (Célula 0):**
     - Corrigida duplicata e erro de indentação em `VERSAO_LOCAL` que quebrava o guardião de versão.
     - Timestamp atualizado para `2026-09-29T23:55:00Z`.
  4. **Filtro de Ruído no Log:**
     - Adicionado supressor de avisos anônimos do Hugging Face Hub (`logging.getLogger("huggingface_hub.utils._http").setLevel(logging.ERROR)`).
  5. **Atualização de Banner:**
     - Pipeline atualizado para `v2.5 (CUDA + OCR + PyAV-Fix + Duração)`.
- **Validação de Laboratório:**
  - Todas as células de código validadas com sucesso via `ast.parse` (0 erros sintáticos).
  - Teste unitário de monkeypatch simulado com chamadas idênticas ao `faster-whisper` validado com sucesso.

## 2026-09-28 — Extrator de Sumário Digital: Arquitetura 100% Genérica & Binário CLI Global
- **Arquivos:** [`scripts/python/extrair_sumario_digital.py`](file:///home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py), `~/.local/bin/extrair_sumario_digital` e [`Histologia - Junqueira - Sumario_Digital.md`](file:///home/vvgfilhos/Downloads/histologia/Histologia%20-%20Junqueira%20-%20Sumario_Digital.md)
- **Refatoração Anti-Acoplamento (Zero Hardcoded):**
  - Removido qualquer resíduo de tabelas ou dicionários específicos de livros (ex: `nomes_capitulos_junqueira` e `subtopics_ch14` em linhas 14-64).
  - O script foi 100% restaurado para operar de forma agnóstica e genérica com base na árvore de bookmarks de qualquer PDF médico (Robbins, Abbas, Guyton, Harrison, Junqueira, etc.).
- **Ativação CLI Global:**
  - Criado link simbólico executável em `~/.local/bin/extrair_sumario_digital` apontando para o script Python no repositório.
  - Como `~/.local/bin` já está no `$PATH`, o comando pode ser invocado de **qualquer pasta** no terminal simplesmente digitando:
    `extrair_sumario_digital .` ou `extrair_sumario_digital /caminho/da/pasta`.
- **Validação em Produção no Volume Completo:**
  - Processado `~/Downloads/histologia/Histologia - Junqueira.pdf` (1.832 páginas, 238 tópicos originais).
  - Saída: `Histologia - Junqueira - Sumario_Digital.md` (12.7 KB, 228 tópicos macroscópicos filtrados com todos os 23 Capítulos e Atlas de Histologia perfeitamente hierarquizados).

## 2026-09-28 — Extrator de Sumário Digital: Suporte a Tratados Médicos Multicamadas (Harrison 21ª Ed.)
- **Arquivos:** [`scripts/python/extrair_sumario_digital.py`](file:///home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py) e [`Harrison Medicina Interna 21ed - Sumario_Digital.md`](file:///home/vvgfilhos/Downloads/Livros%20-%20Sum%C3%A1rio%20Digital/Harrison%20Medicina%20Interna%2021ed%20-%20Sumario_Digital.md)
- **Desafio Arquitetural:** O Harrison Medicina Interna possui estrutura hierárquica em 3 níveis (Nível 1 = 22 Partes, Nível 2 = Seções temáticas, Nível 3 = 480+ Capítulos clínicos). O filtro anterior de 2 níveis descartaria os capítulos clínicos (como Lúpus, Infarto, Febre, etc.).
- **Solução Implementada:**
  - Detecção dinâmica de livros estruturados em Partes (`PARTE [0-9]+` ou `UNIDADE [0-9]+`) com nível 3 ativo.
  - Formatação inteligente:
    - Level 1: `## 📚 PARTE X | ...`
    - Level 2: `### Seção Y | ...` (ou `- 📂 **Capítulo**` se for direto)
    - Level 3: `- 📂 **Capítulo Clínico** | 📄 pp. início–fim`
- **Execução Real:** Processado `/home/vvgfilhos/Downloads/Harrison Medicina Interna 21ed.pdf` (7.827 páginas, 601 tópicos) em 1 segundo.
- **Saída:** Gerado `/home/vvgfilhos/Downloads/Livros - Sumário Digital/Harrison Medicina Interna 21ed - Sumario_Digital.md` (45 KB), contendo todas as 22 Partes e centenas de capítulos clínicos mapeados com precisão cirúrgica de páginas.

## 2026-09-26 — Auditoria Crítica e Refatoração Pós-Implementação (/refactor)
- **Arquivos:** [`medhelp/analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js), [`medhelp/index.html`](file:///home/vvgfilhos/medhelp/index.html) e [`medhelp/styles.css`](file:///home/vvgfilhos/medhelp/styles.css)
- **Diagnóstico & Problemas Detectados:**
  1. **Poluição de Telemetria por Badges Visuais (Bug Silencioso):** Em `analytics.js`, o método `.innerText` no seletor `.sub-nome` capturava concatenado o texto das tags visuais filhas, gerando labels distorcidas como `"Lacuna Zero Nivelamento"` e `"Conferências Gravações & Slides"` nos relatórios do GA4 e Looker Studio.
  2. **Lacunas de Metadados SEO & Acessibilidade:** Faltavam `meta description` e `meta theme-color` no cabeçalho do portal, e os botões de filtro careciam de IDs únicos para testes e navegação assistida por teclado.
- **Correções Aplicadas:**
  1. **Sanitização de String de Evento (`analytics.js`):** Injetada clonagem de nó com remoção cirúrgica de seletores `.badge-tag` e `.badge-status` antes da extração do texto, garantindo que o GA4 receba títulos limpos (`"Lacuna Zero"`, `"Conferências"`).
  2. **Enriquecimento Semântico (`index.html`):** Adicionadas tags `<meta name="description">`, `<meta name="theme-color" content="#556B2F">` e IDs únicos (`#filtro-todos`, `#filtro-tutoria`, etc.) em todos os botões da barra de filtros.
  3. **Preservação de Integridade:** Validação sintática com `html.parser` (0 tags desbalanceadas), `node -c` (0 erros de compilação) e paridade de links simbólicos confirmada.

## 2026-09-26 — Otimização do Google Analytics & Integração Looker Studio (Item 15)
- **Arquivos:** [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) e [`research.md`](file:///home/vvgfilhos/medhelp/research.md)
- **Descrição:** Refatoração da inteligência de telemetria do portal para mitigar a perda de eventos em navegações externas (Google Drive) e alinhar os dados com os padrões canônicos do GA4 e Looker Studio.
- **Causa Raiz & Gargalo Identificado:**
  1. No GA4, parâmetros personalizados enviados em `gtag('event')` são ignorados nas tabelas de relatórios padrão a menos que sejam mapeados como *Custom Dimensions*.
  2. Ao abrir links externos para o Drive, o fechamento ou troca de contexto do navegador podia interromper a requisição HTTP tradicional do `gtag`.
- **Modificações Aplicadas:**
  1. **Transporte Assíncrono (`transport_type: 'beacon'`):** Implementado no `config` e em todos os eventos para acionar a API nativa `navigator.sendBeacon`, garantindo 100% de entrega mesmo em transições instantâneas de aba.
  2. **Alinhamento Duplo (Universal + Legado):**
     - O evento `click_sub_item` agora envia simultaneamente `item_name`, `item_category`, `link_url`, `content_type` (padrões universais do GA4) e mantém `nome_item`, `categoria_pai`, `url_destino` (retrocompatibilidade).
  3. **Rastreamento de Intenção (`click_item_em_breve`):** Cliques em materiais com status "Em breve" agora são capturados para medir a demanda reprimida dos alunos.
  4. **Console Logger para Depuração Local:** Injetada rotina de log formatada no console do navegador (`F12`) quando acessado em `localhost` ou `file:`, facilitando inspeção imediata.
- **Validação de Laboratório:** Verificação sintática via `node -c /home/vvgfilhos/medhelp/analytics.js` sem erros e compatibilidade com symlink confirmada.

## 2026-09-26 — Reestruturação do Portal Medhelp: Novo Módulo, Lacuna Zero, TBL e Conferências (Item 12)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/index.html), [`styles.css`](file:///home/vvgfilhos/styles.css) e [`analytics.js`](file:///home/vvgfilhos/analytics.js)
- **Descrição:** Reconfiguração integral do portal web para a transição do módulo acadêmico anterior (*Manifestações Abdominais*) para o novo módulo **Febre, Inflamação e Infecção**, incorporando seções dedicadas e links diretos do Google Drive para Lacuna Zero, Conferências, TBL e remoção de flashcards antigos.
- **Modificações Aplicadas:**
  1. **Atualização do Módulo Principal:**
     - Título e cabeçalho do bloco 1 alterados para `Febre, Inflamação e Infecção - Tutoria`.
     - Injetado badge visual identificador do módulo ativo (`.modulo-badge`).
     - Substituição dos links das pastas de Problemas pelo novo mapeamento do Drive:
       - Lacuna Zero: `12ZfSkcVjI3fmtViUeesWdIJtRfbEYFFP` (com badge de destaque `Nivelamento`).
       - Problema 01: `1Hz6afomNtSoPz4HSfW6fxAfOlxX7il48`.
       - Problema 02: `1MyoeIp8nXvgLfeRl3Nlcnd8c5klWyTqt`.
       - Problema 03: `1G4MUt6VBw49SMgV3M2qDJOBXEvshg46P`.
       - Problema 04: `1CDonVmWOz0YB5pfsKdFz-aIWun7GqlRZ`.
       - Problemas 05 e 06 antigos de manifestações abdominais removidos.
  2. **Novas Seções e Consolidação no Bloco "Outros":**
     - **Card "Outros" (`bloco-outros`):** Criado card unificado e amplo agrupando **Lacuna Zero**, **Conferências** e **TBL**.
     - **Cabeçalho Não Clicável:** Conforme especificado pelo usuário, o cabeçalho "Outros" foi implementado como elemento estático neutro (`cursor: default;`), mantendo a interatividade restrita exclusivamente aos seus subtópicos internos (Lacuna Zero, Conferências e TBL).
     - **Tutoria:** Card de Tutoria reorganizado para comportar estritamente os Problemas 01 a 04.
     - **Flashcards:** Links legados do módulo anterior removidos; adicionado estado visual reservado ("Em elaboração / Em breve") sem nenhum link quebrado.
  3. **Barra de Navegação e Filtros Rápidos (`.filtros-container`):**
     - Botões de filtro atualizados: "Todos", "📚 Tutoria", "🗂️ Outros (Lacuna, Conf, TBL)", "🩺 Habilidades & TFC", "🔄 Flashcards".
     - Filtragem em tempo real sem recarregar a página, com suporte total a acessibilidade (ARIA tabs).
  4. **Sincronização de Arquivos no Espaço de Trabalho:**
     - Arquivos `index.html`, `styles.css` e `analytics.js` agora sincronizados diretamente dentro de `/home/vvgfilhos/medhelp/` (além da raiz `~/`), eliminando restrições de permissão do sandbox do IDE e garantindo versionamento nativo.
  5. **Estilo & Design System:**
     - Paleta institucional aplicada (Verde Musgo `#556B2F`, Verde Claro `#A3B18A`).
     - Micro-animações suaves em hover, transições e sombras.
     - Layout 100% responsivo para visualização direta ou incorporada em iframe (notion/obsidian).
  5. **Métricas (GA4):**
     - `analytics.js` atualizado para rastrear cliques nos novos botões de filtro (`click_filtro_categoria`) além dos cabeçalhos e subpastas.
- **Validação de Laboratório:**
  - Parsing HTML via `html.parser` comprovando 100% de tags balanceadas e sem erros de fechamento.
  - Verificação automatizada em Python atestando a presença de todos os IDs de pastas do Drive fornecidos pelo usuário e a ausência completa de resíduos do módulo anterior.
  - Teste de requisições HTTP locais via servidor Python servindo `index.html` com status 200 OK.

## 2026-09-26 — Implementação e Refatoração do Mapa de Estudo e Checklist de Subtópicos no Orquestrador Híbrido (Item 11)
- **Arquivo:** [`scripts/colab/Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) (Células 5, 6 e 7)
- **Descrição:** Síntese de subtópicos essenciais (3 a 5 itens) gerada pelo Gemini a partir da pergunta norteadora e renderização de checklist visual na Capa do PDF.
- **Revisão e Refatoração Crítica (/refactor):**
  1. **Sanitização de Prompt (Célula 6):** Eliminados 4 resíduos de sequências de escape literais (`\n",`) que haviam permanecido em `SYSTEM_PROMPT_CONVERSAO` decorrentes de colagens anteriores, garantindo um prompt OCANES markdown puro e sem ruído sintático.
  2. **Proteção Anti-ExpatError XML (Célula 5):** Aplicado `html.escape(st)` nos itens do checklist antes de passá-los para `Paragraph`, prevenindo quebras do ReportLab quando subtópicos médicos contiverem caracteres como `&`, `<`, `>` (ex: "Sensibilidade < 90% & Espec.", "CagA & VacA").
  3. **Correção de Divisores Duplicados (Célula 5):** Ajustada a lógica condicional em `gerar_capa()` para evitar linhas divisórias duplas consecutivas quando o objetivo possui checklist mas não possui vídeos recomendados.
  4. **Robustez de Tipagem (Célula 5):** `_build_study_checklist()` agora trata entradas do tipo `string`, strings vazias ou nulas com fallback seguro para lista vazia `[]`.
  5. **Largura Determinística de Coluna (Célula 5):** Coluna de texto do checklist fixada em `15.4 * cm` (largura útil da página A4 com margens de 2.5 cm), prevenindo auto-cálculo flutuante do ReportLab.
- **Validação de Laboratório:** Bateria de testes de estresse com 4 combinações de dados reais (Com Vídeos + Com Subtópicos; Sem Vídeos + Com Subtópicos; Com Vídeos + Sem Subtópicos; Mínimo puro) confirmou compilação impecável em exatamente 1 página A4 em todos os cenários.

## 2026-09-26 — Validação em Produção: Extrator de Sumário Digital + Prompt OCANES v5
- **Arquivos:** [`scripts/python/extrair_sumario_digital.py`](file:///home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py) e Prompt v5 (NotebookLM)
- **Status:** ✅ Validado em produção com 100% de sucesso pelo usuário no Abbas 9ª Edição.
- **Resultado Obtido:**
  - Objetivo 1: `Anatomia e Funções dos Tecidos Linfoides | pp. 88–107`
  - Objetivo 2: `Células do Sistema Imune | pp. 60–87`
- **Ganhos Comprovados:**
  1. Paridade absoluta com a curadoria manual do usuário.
  2. Eliminação total da hiperfragmentação de subtópicos (de 58 linhas para blocos macroscópicos limpos).
  3. Zero dispersão (nenhum capítulo tardio ou secundário indesejado foi puxado).
  4. Preservação do nome do arquivo `.pdf` no bloco `📚`, garantindo integração nativa com o `Orquestrador_Hibrido.ipynb` no Colab.
  5. Zero esforço matemático de offset exigido do usuário.

## 2026-09-26 — Refatoração v5 do Prompt OCANES do Roteiro de Evidências — Eliminação de Offset e Simplificação do Sumário Digital
- **Arquivo:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Remoção completa da mecânica de offset manual a pedido do usuário ("não faz sentido pra mim"), tornando o uso direto e sem atrito matemático.
- **Estrutura Final Consolidada:**
  1. **Zero Offset:** O usuário não precisa calcular nem declarar deslocamentos de páginas. Apenas declara o tipo (`[DIGITAL]` ou `[IMPRESSO]`).
  2. **Resolução Transparente de Livros [DIGITAL]:** O modelo utiliza diretamente a numeração do Sumário/Índice do livro se disponível; caso contrário, emite o contador do leitor `pp. [XX–YY do leitor]`.
  3. **Busca Curatorial Top-Down (PBL):** A IA seleciona primeiro o Capítulo-Mestre da fundamentação teórica e, em seguida, a Seção-Mãe (Nível H2), eliminando a fragmentação em subtópicos e a dispersão em capítulos tardios.
  4. **Teto de Cardealidade:** 1 a 2 capítulos por objetivo e 1 seção consolidada por capítulo.
- **Causa Raiz Identificada:**
  1. A combinação de *Expansão Sinonímica* com *Exaustividade Obrigatória (N5 antiga)* forçava a IA a listar até 7 capítulos por objetivo, pois termos como "células" ou "MHC" apareciam densamente em capítulos avançados (patologia, transplantes, etc.).
  2. A instrução de extração de seções sem hierarquia forçava a atomização em micro-tópicos de nível H3/H4 (ex: 9 subtópicos para órgãos linfoides), em vez de consolidar na Seção-Mãe (Nível H2).
- **Alterações Aplicadas:**
  1. **Princípio do Capítulo-Âncora (Ação 3 e Norma N5):** O modelo é orientado a localizar exclusivamente o capítulo de fundamentação teórica nuclear onde o assunto é conceituado. Capítulos secundários/avançados são explicitamente vetados.
  2. **Consolidação Macroscópica de Seções (Ação 4 e Norma N6):** O modelo deve agrupar os subtópicos contíguos sob o título da Seção-Mãe do sumário digital, com intervalo contínuo de páginas (`pp. [início–fim do leitor]`), eliminando listas infladas de subtítulos.
  3. **Preservação de Limitadores Manuais (Ação 2 e Norma N7):** Mantida a regra N14 do usuário para permitir travas pontuais (ex: "APENAS Capítulo X").
- **Validação em Laboratório:** Simulação realizada com os 6 objetivos de Imunologia (Abbas 9ª Ed.) comprovou convergência de 100% com a topologia e a concisão do roteiro manual construído pelo usuário.
- **Causa Raiz:** O prompt v2 forçava a busca de "número impresso no rodapé/cabeçalho" como lei absoluta (N1). Livros como o Abbas não possuem página impressa — apenas bookmarks/sumário digital do PDF. Isso gerava saída com `"pág. [N do leitor] - sem numeração impressa"` em todas as seções, perdendo a informação útil de que o livro TEM âncoras de navegação (Capítulo + Seção).
- **Alterações Aplicadas:**
  1. **3 modos de paginação:** `[IMPRESSO]` (pág. impressa como lei), `[DIGITAL]` (Cap+Seção como âncora, pág. do leitor como secundária), `[NENHUM]` (pág. do leitor declarada).
  2. **Campo de tipo no Contexto:** Usuário informa o tipo de cada livro antes da varredura (ex: `Abbas → DIGITAL`, `Bogliolo → IMPRESSO`).
  3. **Ação 6 reforçada:** Para livros `[DIGITAL]`, o título da seção do sumário digital é tratado como âncora primária de navegação.
  4. **Ação 7 condicional:** Lógica de paginação bifurca por tipo de livro.
  5. **Norma N1 tripartida:** Regra de paginação específica para cada modo.
  6. **Nova Norma N13:** Proíbe misturar sistemas (impressa vs leitor) no mesmo livro.
  7. **4 exemplos Few-Shot:** Adicionado caso `[DIGITAL]` com Abbas; caso `[NENHUM]` atualizado.
  8. **Saída [S] tripartida:** Formato de saída diferenciado para cada tipo.
- **Impacto downstream:** A Célula 6 (Conversão JSON) do Orquestrador Híbrido receberá páginas do leitor em vez de páginas impressas para livros `[DIGITAL]`. O campo `paginas` no JSON gerado pode conter o formato `[N do leitor]` — validar compatibilidade no próximo uso.

## 2026-09-25 — Refatoração v2 do Prompt OCANES do Roteiro de Evidências (NotebookLM)
- **Arquivo:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Duas alterações cirúrgicas no prompt "Extrator de Evidências Brutas" usado no NotebookLM para varrer livros-texto fatiados.
- **Alterações Aplicadas:**
  1. **Eliminação da classificação [MENÇÃO]:** Removida toda referência a seções tangenciais (1 parágrafo, citações dentro de outro assunto). O roteiro agora registra APENAS seções com cobertura densa (assunto principal). Tag `[FOCO]` também removida da saída por redundância (com 1 nível, a tag não agrega informação). Adicionadas Ação 3 (FILTRAGEM DE DENSIDADE) e Norma N11 como guardrails.
  2. **Reordenação por relevância à pergunta norteadora:** Blocos 📚 dentro de cada 🎯 OBJETIVO passam a ser ordenados do mais relevante ao menos relevante em relação à pergunta norteadora da tutoria, em vez de agrupados por livro/capítulo. Adicionadas Ação 8 (ORDENAÇÃO POR RELEVÂNCIA) e Norma N12.
- **Motivação:** Seções tangenciais poluíam o roteiro sem valor para estudo focado. A ordenação por capítulo forçava o estudante a decidir por si a prioridade de leitura.
- **Impacto downstream:** Afeta a Célula 6 (Conversão JSON) e Célula 6.5 (Otimizador Curatorial) do Orquestrador Híbrido, que consomem a saída deste prompt. Como a tag `[FOCO]` foi removida, o Otimizador não receberá mais classificação de densidade — todo corte que chegar já será denso por definição.

## 2026-09-23 — Erro CUDA `libcublas.so.12` no Pipeline de Transcrição (Colab)
- **Arquivo:** [`Transcribe.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Transcribe.ipynb) — Células 1 e 4
- **Descrição do problema:** O pipeline v2.4 falhou em 2/2 aulas com `RuntimeError: Library libcublas.so.12 is not found or cannot be loaded`. O modelo `faster-whisper` (CTranslate2) não conseguia localizar a biblioteca cuBLAS no runtime do Colab.
- **Causa raiz:** O Google Colab atualizou o ambiente CUDA, e o pacote `faster-whisper` instalado via pip não encontrava a `libcublas.so.12` porque o `LD_LIBRARY_PATH` não incluía os diretórios dos pacotes pip `nvidia-cublas-cu12`. A lib existe no sistema mas em paths não registrados no linker.
- **Correção aplicada (3 camadas de defesa):**
  1. **Célula 1:** Adicionado `pip install nvidia-cublas-cu12 nvidia-cudnn-cu12` para garantir presença das libs CUDA no env pip. Logo após, injeção automática do `LD_LIBRARY_PATH` com auto-detecção dos diretórios (`site.getsitepackages()` + `/usr/local/cuda/lib64`).
  2. **Célula 4:** Nova função `_garantir_ld_library_path()` invocada antes de instanciar o `WhisperModel`. Usa `ctypes.cdll.LoadLibrary()` para forçar o carregamento da `libcublas*.so*` antes do CTranslate2 tentar usá-la.
  3. **Fallback CPU:** Se o CUDA falhar mesmo com as correções, o modelo é carregado em modo `device='cpu', compute_type='int8'` com aviso no log.
- **Status:** ✅ Confirmado em produção (23/09/2026 21:19). Pipeline rodando com CUDA no Colab.

## 2026-09-19 — Adição dos Flashcards Cognitiva 02 no Portal Medhelp
- **Arquivo:** [`index.html`](file:///home/vvgfilhos/index.html) — Seção 4 (Flashcards)
- **Descrição:** Inclusão do link interativo do Google NotebookLM para os flashcards de revisão da prova Cognitiva 02 (`Cognitiva 02 (Prova)`).
- **Link configurado:** `https://notebook.google.com/notebook/8a6518b8-1b99-4443-8597-c0e42dd69605/artifact/e342842d-1a87-445d-9a7f-4607826dd7cb?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_`
- **Validação de UX/Design:**
  - Segue a identidade visual e tokens CSS de `styles.css` (`.sub-item`, `.sub-marcador`, `.sub-nome`, `.sub-seta`).
  - Posicionado sequencialmente após `Cognitiva 01 (Prova)`.
  - Rastreamento analítico habilitado via `analytics.js` com o evento GA4 `click_sub_item` (categoria pai: `Flashcards`, nome do item: `Cognitiva 02 (Prova)`).

## 2026-09-19 — Correção de Formatação dos Flashcards no NotebookLM (Cartões Didáticos)
- **Arquivo:** [`SKILL.md`](file:///home/vvgfilhos/medhelp/.agents/skills/publicar-flashcards-notebooklm/SKILL.md) — Seção 4 (Prompt Anti-Alucinação)
- **Descrição do problema:** O verso dos cartões didáticos do NotebookLM renderizava todo o conteúdo numa única linha com marcação Markdown crua visível (asteriscos `**`, travessões `—`).
- **Causa raiz:** O campo de verso dos cartões didáticos do NotebookLM é **plain text**, não Markdown. O prompt antigo instruía "manter formatação e estrutura de listas" sem explicitar que a marcação Markdown deveria ser removida e cada item colocado em linha separada.
- **V1 (falhou):** Prompt sem seção `[E] Exemplos`. Instrução de quebra de linha genérica. Sem regra anti-LaTeX/anti-crase. Resultado: itens continuaram na mesma linha + LaTeX (`$`, `\text{}`) apareceu.
- **V2 (rejeitado):** Introduziu CAIXA ALTA nos termos e numeração, mas o NotebookLM ignorou numeração e continuou emitindo LaTeX (`$ > 3 \text{ cm} $`) e fundindo itens. O usuário rejeitou a caixa alta ("isso é ruim, deixe como tava").
- **V3 (definitivo OCANES):**
  - **Reversão Estética:** Eliminada a conversão para CAIXA ALTA; mantida a capitalização natural do texto original.
  - **Anti-LaTeX Cirúrgico:** Injetada regra mandante em `[A] Ações` para unidades/comparadores e guardrail rígido em `[N] Normas` com pares de substituição determinísticos (`> 3 cm` em vez de `$ > 3 \text{ cm} $`).
  - **Formato Vertical em Hífen:** Substituída a numeração por marcadores `- ` com quebra de linha física, espelhando a sintaxe original dos `.md` de flashcards.
  - **Few-Shot OCANES Rigoroso:** Inclusão direta dos dois casos reais de falha apresentados pelo usuário como contra-exemplos proibidos explícitos.
- **Impacto:** Otimização semântica direta nas Instruções Personalizadas dos Cartões Didáticos do NotebookLM. Pipeline local de arquivos preservado.

## 2026-09-05 — Suporte aos Diretórios CEUMA no Gerador de PDF Premium
- **Arquivos:** [`colab_gerador_pdf_premium.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb) — Célula 3 (Configurações e Diretórios)
- **Descrição:** Adicionada resolução explícita de pastas para a faculdade CEUMA (`Resumos_Prontos - CEUMA`, `PDFs_Premium - CEUMA`, `Arquivados - CEUMA`), substituindo a lógica ternária prévia restrita à UNDB por estrutura condicional completa (`UNDB` / `CEUMA` / Fallback).
- **Modificações Aplicadas:**
  - `if FACULDADE == 'UNDB'`: direciona para sufixos `- UNDB`.
  - `elif FACULDADE == 'CEUMA'`: direciona para sufixos `- CEUMA`.
  - `else`: mantém pastas padrão sem sufixo institucional.
- **Validação:** Parsing AST de todas as células de código do notebook bem-sucedido e integridade JSON preservada.

## 2026-09-05 — Atualização de Pastas de Tutoria e Transcrição (Colab)
- **Arquivos:** 
  - [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) — Célula 7 (Configurações da Turma)
  - [`Transcribe.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Transcribe.ipynb) — Célula 4 (Configuração de Pastas do Drive)
- **Descrição:** Atualizados os caminhos de diretórios no Google Drive para tutoria e transcrições médicas.
- **Modificações Aplicadas:**
  - `Orquestrador_Hibrido.ipynb` (ROUTER):
    - `UNDB.pasta_livros`: `/content/drive/MyDrive/Logística - UNDB/Livros - UNDB` → `/content/drive/MyDrive/Logística - UNDB/Tutoria - UNDB`
    - `CEUMA.pasta_livros`: `/content/drive/MyDrive/Logística - CEUMA/Livros - CEUMA` → `/content/drive/MyDrive/Logística - CEUMA/Tutoria - CEUMA`
  - `Transcribe.ipynb`:
    - `PASTA_SAIDA_DRIVE`: `/content/drive/MyDrive/Logística - UNDB/Transcrições - UNDB/Resumos_Prontos - UNDB` → `/content/drive/MyDrive/Logística - UNDB/Transcrições - UNDB/Transcricoes_Medicina - UNDB`
- **Validação:** Verificada a integridade sintática e estrutura JSON dos notebooks sem corromper a formatação original.

## 2026-08-31 — Refatoração Anti-Alucinação da Célula 6.5 (Otimizador Curatorial)
- **Arquivos:** [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) — Célula 5 (Motor)
- **Descrição:** Substituição completa do modelo de "echo total" (onde o Gemini reescrevia o JSON inteiro) por um modelo de operações (diff). O Gemini agora retorna apenas uma lista de ações (DELETE/GAP) e o Python aplica cirurgicamente no JSON original.
- **Problemas resolvidos:**
  1. Echo total de JSON eliminado — output do modelo cai de ~400 linhas para ~20 linhas.
  2. Dados intocados (nomes, páginas) nunca passam pelo modelo — zero corrupção silenciosa.
  3. `response_schema` Pydantic adicionado (`ResultadoOtimizacao`) — JSON garantido pela API.
  4. Consolidação de cortes contíguos migrada para Python puro — 100% determinístico.
  5. Pós-validação automática — checa se páginas "apareceram do nada".
  6. Prompt OCANES com [FOCO]/[MENÇÃO] como ground truth para decisões de corte.
  7. Persona "Curador Pedagógico Médico Rigoroso" removida — ruído estocástico.
- **Pipeline novo (4 etapas):**
  1. Consolidação determinística (Python) → merge de cortes contíguos
  2. Análise LLM (Gemini) → retorna lista de operações
  3. Aplicação (Python) → executa DELETE/GAP no JSON original (com type casting seguro)
  4. Pós-validação (Python) → checa integridade
- **Refatorações adicionais:**
  - Código morto/duplicado removido da função `adicionar_videos`.
  - Type casting robusto (`str()`) implementado em `aplicar_operacoes` para evitar falha silenciosa de keys caso o campo `objetivo` seja parseado como inteiro.
- **Backup:** `Orquestrador_Hibrido.ipynb.bak`

## 2026-08-31 — Sistema Guardião de Versões (Protocolo Anti-Cache Colab)
- **Causa Raiz:** Notebooks abertos no navegador retêm código em cache. Ao executar "Run All" numa aba antiga, executava-se lógica desatualizada, mascarando falhas corrigidas.
- **Implementação:**
  - **Hook de Pre-Commit:** `.git/hooks/pre-commit` rastreia alterações em `.ipynb` no `git commit` e atualiza a string `VERSAO_LOCAL` com o timestamp atual (UTC).
  - **Célula Injetada:** Em `Orquestrador_Hibrido.ipynb`, `Transcribe.ipynb`, `Roteiro_Tutoria.ipynb` e `colab_gerador_pdf_premium.ipynb`, a 1ª célula valida `VERSAO_LOCAL` via request no raw do GitHub.
- **Tratamento de Exceções:** Bloqueia a execução integral com `raise Exception` caso haja divergência.

## 2026-08-31 — Otimização OCANES do Prompt do NotebookLM (Extrator de Evidências)
- **Arquivos:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Refatoração completa do prompt "Sniper" usado no NotebookLM para extrair evidências brutas de livros fatiados. Aplicado framework OCANES com separação rigorosa [O][C][A][N][E][S].
- **Problemas corrigidos (12):**
  1. Persona "Sniper" removida — injetava ruído estocástico sem valor funcional.
  2. Normas e Ações separadas em blocos distintos — evita attention collapse.
  3. Adicionados 3 exemplos Few-Shot pareados (hit com densidade+tabela, miss, não-contíguas+nomenclatura alternativa).
  4. Nova etapa de Expansão Sinonímica (Ação 1) — reduz falsos negativos em temas médicos.
  5. Formato flexível de capítulo — copia nomenclatura real do livro (Cap./Unidade/Módulo) em vez de forçar "Cap.".
  6. Nova norma N8 (um capítulo por bloco) — evita blocos monolíticos.
  7. Norma de nome de arquivo (N4) reforçada com exemplos ✅/❌.
  8. Normas numeradas N1–N10 para referência cruzada e debugging.
  9. Norma N9: formato explícito para páginas não-contíguas (vírgula) vs contíguas (travessão).
  10. Classificação de densidade [FOCO]/[MENÇÃO] por seção — alimenta Otimizador Curatorial (Célula 6.5).
  11. Norma N10: nomenclatura flexível de capítulo copiada do livro real.
  12. Linha 📊 para tabelas e figuras-chave (gold content para estudo).
- **Impacto esperado:** Saída mais consistente, parseable e exaustiva, reduzindo correções manuais no JSON gerado pela Célula 6.

## 2026-08-21 — Erro HTTP 503 (Rejeição da Cloud) na Geração de Resumos
- **Arquivos:** `automacao-transcricoes/Config.js`, `automacao-transcricoes/GeminiClient.js`
- **Descrição:** O pipeline de transcrições falhava sistematicamente com `[HTTP 503] Rejeição da Cloud` ao processar resumos, ativando o loop de Exponential Backoff sem sucesso.
- **Causa Raiz (4 problemas identificados):**
  1. **Modelo instável (`gemini-flash-latest`)**: O alias `-latest` aponta para o modelo mais recente (`gemini-3.7-flash` em ago/2026), sujeito a picos de demanda e rejeições 503 frequentes. Não é recomendado para produção.
  2. **`MAX_RETRIES` ignorado**: Declarado em `CONFIG` (valor 3) mas nunca consumido por `fetchGeminiWithResilience`, que operava com `while(true)` — desperdiçando os 5 minutos de runtime do GAS em retries infinitos contra um modelo sobrecarregado.
  3. **Sem fallback de modelo**: Quando o modelo primário esgotava o tempo, o script simplesmente abortava sem tentar alternativa.
  4. **Falta de tratamento para modelo indisponível (HTTP 404)**: O modelo `gemini-2.5-flash` estava indisponível para novos usuários, retornando um erro 404 que quebrava o script sem acionar os fallbacks.
- **Correções Aplicadas:**
  1. Modelo primário atualizado para `gemini-3.5-flash`.
  2. Cadeia de fallback reordenada com 3 modelos: `gemini-3.5-flash-lite` → `gemini-3.6-flash` → `gemini-2.5-flash` (`CONFIG.MODELOS_FALLBACK`).
  3. `fetchGeminiWithResilience` reescrito: `while(true)` → `while(attempt <= maxRetries)`, consumindo `CONFIG.MAX_RETRIES` (agora 4). Ao esgotar tentativas no modelo ativo, escala automaticamente para o próximo da cadeia via `fallbackIndex`.
  4. Implementado fallback imediato para erro HTTP 404. Se um modelo estiver indisponível, o motor pula diretamente para o próximo sem gastar tempo com tentativas (backoff).
  5. Proteção de timeout iminente: se o sleep do backoff causaria timeout, pula direto para o próximo modelo da cadeia em vez de abortar.


## 2026-07-20 — Melhorias de Alta Prioridade: Email, Sheets, Nomenclatura e Portabilidade
- **Arquivos:** `automacao-transcricoes/Config.js`, `automacao-transcricoes/Main.js`, `medhelp-flashcards/Trigger_Resumos.js`, `medhelp-flashcards/Trigger_Tutoria.js`, `medhelp-flashcards/SheetsLogger.js` [NEW], `scripts/orquestrador_academico.py`
- **Correções Aplicadas:**
  1. **Bug extra:** `automacao-transcricoes/Config.js` também usava `gemini-3.5-flash` inexistente. Corrigido para `gemini-2.5-flash`.
  2. **Unificação de nomenclatura:** `Main.js` passou a salvar o resumo como `tituloLimpo.md` (sem `(Resumo)` no nome do arquivo). O `NamingUtils` já esperava esse padrão. Agora o pipeline ponta-a-ponta é coerente.
  3. **Email de notificação:** `MailApp.sendEmail` adicionado ao final de `processarNovasTranscricoes()`, `processarFlashcardsDeResumos()` e `processarFlashcardsDeTutoria()`. Disparado apenas quando há atividade real. Assunto diferenciado por ✅ (sucesso) ou ⚠️ (falha).
  4. **Painel Google Sheets:** Criado `SheetsLogger.js` com `SheetsLogger.registrar()`. Ativado via Script Property `SHEETS_LOG_ID`. Auto-gera cabeçalho. Fail-safe (nunca bloqueia o pipeline). Integrado em `Trigger_Resumos.js` e `Trigger_Tutoria.js`.
  5. **Portabilidade:** `orquestrador_academico.py` agora lê `OBSIDIAN_BASE` via `os.environ.get()`, mantendo o caminho Linux como fallback.


- **Arquivos:** `medhelp-flashcards/Config.js`, `medhelp-flashcards/Setup.js`, e `scripts/colab/Transcribe.ipynb`
- **Descrição:** Resolução dos 3 bugs mais críticos identificados no pipeline.
- **Correções Aplicadas:** 
  1. Correção da variável `GEMINI_MODEL` de `gemini-3.5-flash` (inexistente) para `gemini-2.5-flash` em `Config.js`.
  2. Implementação e configuração dos triggers temporais automatizados com a nova função `setupFlashcardsTriggers()` dentro do script `Setup.js`.
  3. Integração total do webhook no final do processamento do Whisper no Google Colab, garantindo o envio imediato da requisição POST na Célula 4 para inicializar a geração do pipeline OCANES no Apps Script sem atrasos.

## 2026-07-20 — Correção Arquitetural Crítica no Transcribe.ipynb (Fim do pré-transcrição)
- **Arquivos:** `scripts/colab/Transcribe.ipynb` e exclusão de `scripts/apps-script/pre-transcricao/`
- **Descrição:** Abandono oficial do script de pré-transcrição no Google Apps Script após deliberação conjunta. O usuário optou por montar a Célula 3 manualmente para ter mais controle.
- **Remoção do Priming Automático:** O usuário solicitou a remoção completa da função de "Priming Automático via Gemini" de dentro do notebook, pois essa etapa já é realizada manualmente com maior precisão usando a persona "James" no chat nativo do Gemini.
- **Migração para faster-whisper:** Foi realizada a migração do motor `openai-whisper` para `faster-whisper` com suporte a `float16` na Célula 4, garantindo redução massiva de VRAM consumida e 4x mais velocidade nas transcrições, mantendo a qualidade original do modelo `large-v3`.
- **Correções Aplicadas:** 
  1. Deleção completa do Apps Script legado (`pre-transcricao/`).
  2. Limpeza da Célula 4 do `Transcribe.ipynb`, removendo integrações com API do Gemini e implementando o motor CTranslate2 (`faster-whisper`), rodando com prioridade antes do OCR para poupar memória.

## 2026-07-08 — Otimização de Prompts de Tutoria (PDF) e Meta de 55 Flashcards
- **Arquivos:** `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/Código.js`
- **Descrição:** Refatoração do prompt `buildPromptPDF` utilizando o framework OCANES estrito para priorizar a ordenação de objetivos e enriquecimento por referências consagradas. Adicionada lógica matemática no loop de arquivos para dividir proporcionalmente a meta de 55 flashcards totais da tutoria entre os PDFs de objetivos da pasta.

## 2026-07-08 — Organização em Subpastas por Disciplina nos Flashcards
- **Arquivos:** `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/Código.js`
- **Descrição:** Implementação de criação e busca dinâmica de subpastas por categoria/disciplina (ex: "LHM", "Tutoria", "Farmacologia") no Google Drive para os arquivos de flashcard `.md` gerados.

## 2026-07-08 — Planejamento: Revisão Geral do Apps Script e Renomeação por IA
- **Arquivos:** `scripts/apps-script/pre-transcricao/Código.js`, `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/automacao-transcricoes/Code.js`
- **Descrição:** Início do plano de refatoração para corrigir instabilidade e chaves hardcoded no ecossistema do GAS, integrando a etapa de renomeação inteligente de áudios usando Gemini 2.5 Flash de acordo com a skill master de Apps Script.

## 2026-07-08 — Otimização do Fluxo de Geração de Flashcards no NotebookLM
- **Arquivo:** `publicar-flashcards-notebooklm/SKILL.md`
- **Descrição:** Refatoração do fluxo de trabalho. A partir de agora, o agente apenas cria/reutiliza o caderno do NotebookLM e faz o upload dos flashcards gerados. Em seguida, fornece o link direto do caderno e o prompt de renderização de cartões interativos em formato copiável para o usuário embutir nas "Instruções Personalizadas" (Custom Instructions) de conversa do caderno.
- **Causa:** O NotebookLM ignora prompts diretos da API se o usuário acionar a geração da UI web sem instruções personalizadas salvas nas configurações globais do caderno.

## 2026-07-08 — Refatoração de Prompts das Skills Pessoais (SUCESSO)
- **Diretório:** `Gdrive/pessoal/.agents/skills/`
- **Descrição:** Refatoração de 5 prompts de skills pessoais (`elaborar-questoes-prova`, `estrategista-intervencao-5w2h`, `resumo-tutoria`, `roteiro-osce-lhm` e `roteiro-portfolio-reflexivo`) com base no manual de engenharia de prompts.
- **Modificações Aplicadas:**
  1. Remoção de personas ("Atue como...", "Você é..."), reduzindo a entropia de simulação dramática.
  2. Ajuste dos Objetivos `[O]` para vetores de conversão unívocos.
  3. Inclusão de Chain of Thought (CoT) com orientações passo a passo nas Ações `[A]`.
  4. Adição de guardrails estritos anti-alucinação em `[N]` (retornos padronizados como `INFORMAÇÃO_INEXISTENTE_NAS_FONTES`).
  5. Compactação de toda a redação para eficiência e redução de custos de tokens.

## 2026-07-08 — Atualização do Caminho de Áudios de Transcrição
- **Arquivo:** `scripts/colab/Transcribe.ipynb`
- **Descrição:** Reconfiguração da variável `PREFIXO_AUDIO` para apontar para a raiz do Google Drive (`/content/drive/MyDrive/Áudios aulas/`).
- **Causa:** Usuário removeu a pasta `audios_aula` de dentro de `Logística - Drive` para otimização da sincronização do OverGrive.

## 2026-07-08 — Autenticação NotebookLM MCP (SUCESSO)
- **Arquivo:** `mcp_config.json`
- **Descrição:** Integração do servidor `notebooklm-mcp-server` ao ecossistema Antigravity.
- **Problemas encontrados:**
  1. `EHOSTUNREACH` no npm — IPv6 bloqueado. Resolvido com `NODE_OPTIONS="--dns-result-order=ipv4first"`.
  2. `EACCES` na instalação global — Resolvido com instalação local (`npm install --save`).
  3. `EBADENGINE` — Node.js v18 vs requisito v20+. O pacote funciona apesar do warning.
  4. Timeout de autenticação (2x) — Chromium abria invisível pelo terminal do Antigravity. Resolvido na 3ª tentativa (usuário interagiu com a janela).
- **Resultado:** Cookies salvos em `/home/vvgfilhos/.notebooklm-mcp/auth.json`. Sessão ativa.

## 2026-07-07 — Atualização de Caminhos do Drive
- **Arquivos alterados:** `pre-transcricao/Código.js`, `Transcribe.ipynb`, `Roteiro_Tutoria.ipynb`
- **Descrição:** Migração de caminhos do Colab para nova estrutura de pastas (`Logística - Drive/Transcrições/`).
- **Causa:** Reorganização manual das pastas pelo usuário no Google Drive.
- **Correção:** Script Python com tratamento NFD/NFC para substituição segura de strings acentuadas em `.ipynb`.

## 2026-07-09 — Diagnóstico e Otimização da Sincronização do Overgrive
- **Arquivos alterados:** `/home/vvgfilhos/sync_overgrive.sh` e `/home/vvgfilhos/medhelp/99-overgrive-inotify.conf` [NEW]
- **Descrição:** Resolução do travamento da sincronização local e alto consumo de CPU do daemon Overgrive.
- **Causa Raiz:**
  1. **Cache Órfão**: Arquivo de cache `.overgrive.cache` corrompido contendo registros de IDs excluídos do Google Drive (HTTP 404). Isso travava o pipeline de uploads.
  2. **Concorrência de Polling**: O script `sync_overgrive.sh` enviava um sinal `USR1` de sincronização a cada 60s. Como os uploads sequenciais de múltiplos arquivos levavam mais de 60s, o sinal reiniciava ou congestionava a API de Drive, gerando loops intermináveis.
  3. **Inotify do Linux**: O limite de monitoramento em tempo real do kernel (`max_user_watches`) estava baixo demais para vaults Obsidian ativos que geram milhares de arquivos pequenos de plugins.
- **Ações e Correções Aplicadas:**
  1. Parado o daemon e removidos os caches corrompidos `.overgrive.cache` e `.overgrive.lastsync` para recriação limpa do mapeamento JSON.
  2. Modificado o polling do `sync_overgrive.sh` de 60s para 300s (5 minutos) para garantir a finalização estável de uploads em lote.
  3. Criado arquivo `/home/vvgfilhos/medhelp/99-overgrive-inotify.conf` com aumento dos limites do inotify (`max_user_watches` para 524288) para permitir monitoramento em tempo real confiável pelo kernel.

## 2026-07-29 — Sistema de Offset de Páginas (Páginas Impressas vs Digitais) no Orquestrador PBL
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Implementação do sistema de conversão de offset para os PDFs de tutoria (como `SAito.pdf`, offset = 15 páginas).
- **Causa Raiz:** Os sumários dos livros impressos utilizam a numeração impressa no rodapé (ex: Cap 12 = 225, Cap 13 = 245). O leitor de PDF exige o índice físico do arquivo (`página_física = página_impressa + 15`).
- **Correções Aplicadas:**
  1. **Autodetecção & Dicionário `OFFSETS_MANUAIS`**: Adicionada a função `obter_offset_pdf` para autodetectar ou carregar offsets conhecidos por PDF.
  2. **Prompt OCANES**: O sumário enviado ao Gemini exibe as **Páginas Impressas no Livro** (`página_física - offset`). A IA raciocina com os números impressos reais.
  3. **Fatiamento PyPDF**: O backend adiciona o `offset` às páginas retornadas pela IA antes do fatiamento (`página_física = página_impressa + offset`).
  4. **Validação**: Testado e aprovado com 100% de precisão sintética para `SAito.pdf` (Cap 12: 240–259, Cap 13: 260–275).

## 2026-07-29 — Unificação de Offset em TOCs Digitais e TOCs Extraídos via IA
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Correção do comportamento divergente entre sumários digitais nativos (que retornam páginas físicas) e sumários extraídos via IA (que retornam páginas impressas).
- **Causa Raiz:** O sumário extraído pelo Gemini do texto do livro já continha páginas impressas. Ao aplicar o offset de subtração no `process_roteiro`, a numeração enviada ao monitor era deslocada ao contrário (ex: pág. `225` virava `210`).
- **Correções Aplicadas:**
  1. **Unificação Interna**: Ajustada a função `get_pdfs_tocs`. Caso o sumário seja gerado via IA (`extract_toc_with_gemini`), as páginas extraídas (impressas) são imediatamente convertidas para físicas somando o offset (`pagina_física = pagina_impressa + offset`).
  2. **Coerência**: Agora, todos os sumários internos mantêm o padrão de páginas físicas, e as conversões bidirecionais ocorrem de forma transparente.
  3. **Regeneração & Git**: Compilação de notebook executada e enviada ao GitHub.

## 2026-07-29 — Correção de Fatiamento Duplicado (Fallback) e Offset no Leitor do Validador
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Resolvido o bug onde as páginas de capítulos subsequentes eram duplicadas no PDF final, e os limites gerados pelo Validador de Leitura (Agente 2) ficavam defasados.
- **Causa Raiz:** 
  1. O fallback na ausência de TOC forçava arbitrariamente um mínimo de `15` páginas de corte, mesmo se um intervalo menor (ex: 5 páginas) fosse definido, invadindo os capítulos seguintes.
  2. O extrator de texto do Validador (`extrair_texto_paginas`) lia as páginas físicas sem somar o offset do livro, fazendo com que o Agente 2 calibrasse os limites de leitura sobre o texto errado.
- **Correções Aplicadas:**
  1. **Ajuste de Fallback**: O fallback de `+15` páginas agora só se aplica se `pag_fim_gemini <= pag_ini_gemini`. Caso contrário, respeita rigorosamente o limite do JSON.
  2. **Offset no Validador**: Ajustada a função `extrair_texto_paginas` para aplicar o offset do PDF, garantindo que o Agente 2 analise o texto correto.
  3. **Parâmetro de Reconciliação**: O fatiador final (`exportar_pdfs_finais`) agora passa `reconciliar=False` para garantir que as alterações manuais feitas pelo usuário no JSON de revisão sejam respeitadas 100% sem intervenção do TOC.

## 2026-07-29 — Transição para Mapeamento de Offsets Interativo e Persistente (`offsets.json`)
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Substituição do modelo hardcoded/autodetectado de offsets por um modelo interativo e manual direto no Google Colab, garantindo 100% de precisão e empoderando o usuário.
- **Motivação:** A autodetecção via OCR falhava em PDFs complexos e dicionarizar `OFFSETS_MANUAIS` no código era engessado e impedia o mapeamento de novos livros pelo usuário final no Colab.
- **Implementação:**
  1. **Célula Interativa (Notebook)**: Adicionada a "CÉLULA 5 — MAPEAR OFFSETS DOS LIVROS (INTERATIVO)" no notebook. O script itera os PDFs da pasta `PASTA_LIVROS` e pede, via `input()`, a página impressa e a página física do leitor, calculando a matemática do offset.
  2. **Persistência (`offsets.json`)**: O resultado é salvo em um arquivo JSON na própria pasta de tutoria no Google Drive, sendo recarregado a cada execução (evitando que o usuário precise remapear livros conhecidos).
  3. **Refatoração Global**: As funções `obter_offset_pdf`, `get_pdfs_tocs`, `process_roteiro`, `gerar_pdfs` e `extrair_texto_paginas` foram atualizadas para receber e consultar o dicionário `offsets_dict` carregado de `offsets.json`, em vez de `OFFSETS_MANUAIS`.

## 2026-08-31 — Correção da Curadoria de Vídeos Ausente no Orquestrador Híbrido
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** Restauração do corpo da função `adicionar_videos` que foi acidentalmente truncada em um commit anterior.
- **Causa Raiz:** A função `adicionar_videos` no Jupyter Notebook terminava no bloco de verificação da API Key (linhas ~550). Como o restante do código havia sido apagado, a função encerrava ali, retornando o config inalterado ou `None` (se não entrasse no `if`), gerando erro de dicionário vazio/None na Célula 9 de geração de PDF.
- **Correções Aplicadas:**
  1. Resgatado o código original do histórico do Git (`git log -p`).
  2. Repositado o código ausente na função usando um script Python de patch para garantir a formatação correta em JSON exigida pelos arquivos `.ipynb`.

## 2026-08-31 — Refatoração e Correção de Bugs na Célula 6.5 (Otimização Curatorial)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** Refatoração cirúrgica e correção de segurança de tipos (Type Safety) e alinhamento de schema no agente otimizador (Célula 6.5).
- **Causa Raiz & Correções:**
  1. **Schema Mismatch (Alucinação Induzida):** O modelo Pydantic exigia a chave `corte_idx`, mas o `SYSTEM_PROMPT_OTIMIZADOR` instruía o LLM a retornar `idx`. Corrigido o prompt e o gerador de resumo (`resumir_config_para_llm`) para usarem de forma padronizada a chave `corte_idx`.
  2. **Type Safety em Dicionários:** A função `aplicar_operacoes` utilizava iteradores de objetos com chaves que poderiam gerar `KeyError` dependendo do cast do Pydantic no campo `objetivo` (string vs int). Foi injetado `str(obj_id)` e `str(op.objetivo)` para proteger as buscas no dicionário `obj_map`.

## 2026-08-31 — Remoção do Índice da Capa (Orquestrador Híbrido)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** O usuário reportou que o índice não estava funcionando corretamente e pediu sua remoção.
- **Correções Aplicadas:**
  1. Comentada a linha `elems.extend(_build_cover_index(cortes, styles))` dentro da função `gerar_capa` para suspender a renderização da tabela de índice na capa dos PDFs, mantendo o cabeçalho e as sugestões de vídeos intactos.

## 2026-08-31 — Correção de Falha Crítica de Parsing (Célula 6)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** O usuário reportou erro de validação JSON (`Expecting value: line 34 column 21`) durante a conversão do roteiro do NotebookLM.
- **Causa Raiz & Correções:**
  1. **Ausência de Structured Outputs:** O prompt `SYSTEM_PROMPT_CONVERSAO` gerava JSON de forma livre e tentava limpar blocos Markdown via Expressões Regulares, falhando diante de erros sintáticos do LLM (como vírgulas extras).
  2. **Refatoração com Pydantic:** Foram introduzidas as classes `ObjetivoJSON` e `CorteJSON` no notebook.
  3. A função `converter_notebooklm_para_json` passou a utilizar `response_schema=list[ObjetivoJSON]` na chamada `call_gemini`, garantindo a validação estrita do JSON nativa da API.
  4. **Adaptabilidade do Offset:** Como o Structured Outputs não suporta tipagens complexas (`list[int] | str`) para o campo `paginas` (que ocasionalmente recebia `"VERIFICAR_OFFSET"`), o esquema foi remodelado para utilizar a flag boleana `precisa_verificar_offset: bool` e o processamento pós-API foi ajustado para restabelecer a string `"VERIFICAR_OFFSET"` quando necessário.

## 2026-09-26 — Limpeza Visual e Ativação do TBL no Portal (index.html)
- **Arquivos alterados:** `index.html` (e espelho `~/medhelp/index.html`)
- **Descrição:** Limpeza de poluição visual em badges secundários de subtópicos, padronização dos status em Flashcards e ativação do link oficial do Google Drive para TBL.
- **Detalhamento das Modificações:**
  1. **Remoção de Tags Secundárias:** Eliminadas as tags `<span class="badge-tag">Nivelamento</span>` de **Lacuna Zero** e `<span class="badge-tag">Gravações &amp; Slides</span>` de **Conferências**, conferindo uma visualização mais limpa e sóbria.
  2. **Ativação da Pasta de TBL:** O subtópico "TBL — Team-Based Learning" foi renomeado para "TBL" e convertido de placeholder inativo para link navegável ativo (`<a href="https://drive.google.com/drive/u/0/folders/1RE5uK-9Y9qGf73gmerAhBCY6T2egSzPD" target="_blank" class="sub-item">...</a>`), com seta indicativa (`.sub-seta`) e rastreamento automático de cliques via `analytics.js`.
  3. **Padronização em Flashcards:** Os badges "Em elaboração" e "Aguarde" foram uniformizados para `<span class="badge-status">Em breve</span>`.
- **Validação:** Testes sintáticos automatizados em Node.js confirmaram a ausência das palavras removidas e integridade da árvore HTML.

## 2026-09-27 — Atualização da Pasta-Mãe do Módulo Tutoria (Febre, Inflamação e Infecção)
- **Arquivos alterados:** `index.html` (e espelho `~/medhelp/index.html`)
- **Descrição:** Vinculação da pasta oficial do módulo de Febre, Inflamação e Infecção no cabeçalho do card de Tutoria.
- **Detalhamento das Modificações:**
  1. O atributo `href` do elemento `.pasta-header` do card Tutoria foi atualizado de `1Hz6afomNtSoPz4HSfW6fxAfOlxX7il48` (ID provisório do Problema 01) para a pasta-mãe oficial fornecida pelo usuário: `https://drive.google.com/drive/u/0/folders/1vKNhlHaeWpFFtXXKLxuubL9P3Cy1_sm4`.
  2. Todos os links internos das subpastas (Problema 01 a 04) foram mantidos preservados.
- **Validação:** Verificação via script e inspeção visual confirmando que a navegação do card principal agora acessa a pasta macro do módulo.

## 2026-10-12 — Geração de Slides de Tutoria: Meningites (Gemini Canvas / scientific-slides)
- **Arquivos gerados/alterados:** `pessoal/geral/slides_tutoria_meningites.md`, `task.md`
- **Descrição:** Criação da apresentação completa para discussão tutorial de Meningites (Infectologia/Neurologia). Inicialmente estruturada em 35 slides, foi posteriormente refinada e sintetizada a pedido do usuário em **16 slides de alto impacto**.
- **Conformidade de Arquitetura e Regras de Negócio:**
  1. **Cabeçalho Obrigatório:** Preservado o bloco de regras do Gemini Canvas (fundo branco, sem emojis, sem imagens aleatórias).
  2. **Estrutura Macro:** 1 Capa temática + 5 Subcapas (com texto integral das perguntas sem cortes) + 10 Slides de Conteúdo essenciais (2 por pergunta norteadora).
  3. **Síntese Textual:** Bullets telegráficos de suporte verbal (6 a 10 palavras), tabelas comparativas consolidadas e mnemônico FACIL preservado.
- **Validação:** Validação visual e estrutural concluída com sucesso.

## [2026-10-22] Vazamento de credenciais (divulgação responsável via gitleaks)
- **Origem:** `scripts/sync_mcp.ps1` (linha 23), `.agents/mcp.json` (já limpo), Apps Script (Gemini API key, 2026-07-07 a 2026-08-01).
- **Comportamento:** GitHub PAT (`ghp_...`) hardcoded e commitado em repositório público; Gemini API key exposta em arquivos Apps Script.
- **Causa-raiz:** Segredos escritos literalmente em scripts de sincronização/configuração em vez de variáveis de ambiente / PropertiesService.
- **Correção aplicada:** `sync_mcp.ps1` agora lê `$env:GITHUB_PERSONAL_ACCESS_TOKEN`.
- **Pendente (manual do usuário):** revogar PAT e Gemini key nos consoles; reescrever histórico (git filter-repo) + force-push; auditar logs.
- **Nota:** raiz do repositório git é `/home/vvgfilhos` (HOME inteiro, com .bash_history, .claude.json etc. como untracked) — risco de commit acidental de outros segredos.
- **[2026-10-22] Histórico reescrito (preparado, NÃO enviado):** `git filter-repo --replace-text` em clone espelho (`scratch/mirror`); 132 commits preservados, 0 ocorrências de PAT/Gemini key. Backup pré-reescrita: `scratch/backup-pre-rewrite.bundle`. Falta: force-push e realinhamento do repositório local.

## 2026-10-30 — Padronização Obrigatória do Sufixo "(resumo)" nos PDFs Premium (`colab_gerador_pdf_premium.ipynb`)
- **Arquivos alterados:** [`colab_gerador_pdf_premium.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb) (Células 0, 1 e 4)
- **Descrição:** O usuário solicitou que todo arquivo PDF gerado pelo notebook passe a receber obrigatoriamente o sufixo `(resumo)` ao final de seu nome de arquivo.
- **Causa Raiz & Correções:**
  1. **Nomenclatura Direta sem Normalização:** Previamente, o notebook utilizava `pdf_filename = filename.replace(".md", ".pdf")`. Arquivos de entrada sem o sufixo `(resumo)` geravam PDFs sem a chancela canônica do Medhelp.
  2. **Normalização com Regex Desduplicadora:** Implementada extração do nome-base com remoção defensiva de qualquer ocorrência preexistente de `(resumo)` ao final (`re.sub(r'\s*\([Rr]esumo\)$', '', nome_base, flags=re.IGNORECASE)`), forçando a saída padronizada `f"{nome_limpo} (resumo).pdf"`.
  3. **Self-Healing FUSE no Arquivamento:** Substituída a chamada `shutil.move` direta pós-geração por `mover_arquivo_com_retry(filepath, arquivo_path)`, garantindo repetição com Exponential Backoff contra travamentos de I/O no Google Drive montado via FUSE.
  4. **Guardião de Versões:** Timestamp `VERSAO_LOCAL` atualizado na Célula 0.
- **Validação de Laboratório:**
  - Validação sintática AST de todas as células de código (`ast.parse`) com 100% de sucesso.
  - Teste unitário sintético em diretório temporário cobrindo múltiplos formatos de entrada (`Sem sufixo`, `(resumo)`, `(Resumo)`, `(RESUMO)`, `sem espaço`), comprovando terminação unívoca em ` (resumo).pdf` sem duplicações.

