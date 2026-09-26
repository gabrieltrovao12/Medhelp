# Roteiro de Evidências (NotebookLM) — Especificação e Solução de Sumário Digital

## 1. Problema Diagnosticado e Refinamento
1. **Dispersão por Exaustividade Cega (Over-Retrieval):** Corrigido pelo *Princípio do Capítulo-Âncora*, forçando o modelo a focar no capítulo conceitual de base (máximo 1 a 2 blocos por objetivo) e eliminando a busca por retalhos dispersos no livro.
2. **Hiper-Fragmentação de Seções:** Corrigido pela *Consolidação Macroscópica de Seções (Nível H2)*, onde subtópicos contíguos são fundidos sob o título da Seção-Mãe em um único intervalo de páginas.
3. **Rejeição de Offset Manual:** A tentativa de exigir do usuário cálculos de offset matemático (`Offset: +X`) foi rejeitada por fricção e complexidade desnecessária.

## 2. Investigação Técnica: Por que o NotebookLM ignora Bookmarks/Sumário Digital?
- **Estrutura de PDF:** O sumário digital interativo (bookmarks da barra lateral) fica na árvore de metadados `/Outlines` do PDF.
- **Mecanismo de Ingestão do NotebookLM:** O NotebookLM utiliza extração de texto linear pura ("flattened text stream") para gerar os embeddings de RAG. Ele **descarta e ignora** completamente a árvore de `/Outlines`.
- **Consequência:** A IA do NotebookLM **literalmente não enxerga** os bookmarks do arquivo PDF. Se o livro não tiver páginas impressas no corpo do texto, o NotebookLM só tem acesso ao índice bruto das páginas do arquivo, atomizando os subtópicos ou emitindo páginas de leitor sem contexto da obra.

## 3. Decision Log (Brainstorming)
- **Decisão 1:** Adotar a **Opção A** — Gerar um arquivo `[LIVRO]_Sumario.md` e subi-lo como fonte textual no NotebookLM.
  - *Alternativas consideradas:* Adicionar carimbo visual de páginas (Page Stamping) no PDF (rejeitado por alterar o arquivo original e ser lento); Extração local 100% fora do NotebookLM (rejeitado por tirar a flexibilidade de curadoria da tutoria).
  - *Motivo da escolha:* Um arquivo `.md` é ingerido pelo NotebookLM com 100% de integridade textual e sem perda de hierarquia.
- **Decisão 2:** Granularidade **Apenas Macroscópica** (Capítulo H1 e Seção-Mãe H2 com intervalos de páginas).
  - *Motivo da escolha:* Impede fisicamente que o NotebookLM divida a saída em dezenas de subtópicos H3/H4.
- **Decisão 3:** Suporte Duplo (Script Python Local CLI + Célula utilitária no Colab).
  - *Motivo da escolha:* Permite processar livros tanto no computador local com 1 comando rápido quanto direto no Google Drive do Colab.

## 4. Abordagens de Design para Implementação
- **Abordagem 1 (Recomendada):** Script Python CLI (`extrair_sumario.py`) com PyMuPDF (`fitz`), aceitando caminho de arquivo único ou pasta inteira, calculando automaticamente o intervalo de páginas de cada seção (`pp. início–fim`). Fornecer também o bloco equivalente para uso no Colab.
- **Abordagem 2:** Conversor com GUI / Webapp local (complexidade desnecessária / violação de YAGNI).

---

## 5. Análise Técnica: Subcapa com Índice de Subtópicos por Objetivo (Item 11)

### 5.1 O Dilema: Orquestrador Híbrido vs. Prompt do NotebookLM
- **Opção 1 — Via Prompt do NotebookLM (Desaconselhada):**
  - O prompt v5 do NotebookLM está blindado exclusivamente para extração top-down de fontes e cálculo de páginas.
  - Inserir síntese conceitual de subtópicos no NotebookLM gera fragmentação de atenção (*attention split*), risco de alucinar seções ou falhar na paginação.
  - Dependência estrita dos PDFs anexados: se a pergunta norteadora abranger um aspecto básico que o livro fatiado não traz explicitamente no capítulo âncora, o NotebookLM falharia ou omitiria o tópico.
  - Exigiria novo parsing na Célula 6 de qualquer forma para estruturar os dados.
- **Opção 2 — No Orquestrador Híbrido via Gemini (Recomendada):**
  - O Orquestrador já possui a `pergunta_completa` (pergunta norteadora original) e o `titulo` de cada objetivo.
  - A geração do índice de subtópicos pode ocorrer diretamente no Agente 1 (Célula 6 — `ObjetivoJSON` com `subtopicos: list[str]`), sem latência extra de rede, ou numa chamada dedicada sob demanda.
  - O Gemini sintetiza um micro-roteiro conceitual de 3 a 5 subtópicos essenciais com base na pergunta norteadora.
  - Permite revisão no `config.json` (Célula 7) antes da compilação dos PDFs.
  - Renderização gráfica de alto padrão no ReportLab (Checklist interativo com checkboxes estéticos e espaçamento editorial).

### 5.2 Topologia Visual: Capa Consolidada vs. Subcapa Dedicada (Página 2)
- **Abordagem A (Integrado na Capa - Recomendada se enxuto):**
  - Aproveita o espaço nobre liberado pela remoção do antigo índice de livros.
  - Layout: Cabeçalho (Objetivo + Título + Pergunta) → Bloco "MAPA DE ESTUDO & CHECKLIST" (3 a 4 itens com checkboxes) → Vídeos Recomendados → Rodapé de Autoria.
  - Tudo em 1 única página de abertura rápida.
- **Abordagem B (Subcapa Dedicada / Página 2 de Abertura):**
  - Gera uma página 2 independente entre a Capa e os Separadores de Livros.

---

## 6. Especificação e Planejamento: Reestruturação do Portal Medhelp (Item 12)

### 6.1 Contexto e Diagnóstico
- O portal `~/index.html` estava configurado para o módulo anterior (*Manifestações Abdominais*) com Problemas 01 a 06 e links de flashcards antigos.
- Há a transição de módulo acadêmico para **Febre, Inflamação e Infecção**.
- Demandava-se a criação de seções/blocos específicos para **Lacuna Zero**, **Conferências** (com pasta dedicada no Drive) e **TBL (Team-Based Learning)**, além da limpeza dos links de flashcards antigos até que os novos fiquem prontos.

### 6.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Inputs: Novas pastas do Google Drive para o módulo *Febre, Inflamação e Infecção* (P1 a P4, Lacuna Zero, Conferências).
   - Outputs: `index.html` reestruturado com novo módulo, seções para Lacuna Zero, TBL e Conferências, barra de navegação/filtro interativo e tracking GA4 atualizado em `analytics.js`.
2. **Link (L):**
   - Conferência: `https://drive.google.com/drive/u/0/folders/1biDGwPJ_efPUeG72ltTvQk7J9bXGa4WW`
   - Lacuna Zero: `https://drive.google.com/drive/u/0/folders/12ZfSkcVjI3fmtViUeesWdIJtRfbEYFFP`
   - Problema 01: `https://drive.google.com/drive/u/0/folders/1Hz6afomNtSoPz4HSfW6fxAfOlxX7il48`
   - Problema 02: `https://drive.google.com/drive/u/0/folders/1MyoeIp8nXvgLfeRl3Nlcnd8c5klWyTqt`
   - Problema 03: `https://drive.google.com/drive/u/0/folders/1G4MUt6VBw49SMgV3M2qDJOBXEvshg46P`
   - Problema 04: `https://drive.google.com/drive/u/0/folders/1CDonVmWOz0YB5pfsKdFz-aIWun7GqlRZ`
3. **Arquitetura (A):**
   - Grid modular com cards específicos:
     - Bloco 1: **Febre, Inflamação e Infecção - Tutoria** (Lacuna Zero + Problemas 01 a 04).
     - Bloco 2: **Conferências** (acesso à pasta de grandes aulas e resumos).
     - Bloco 3: **TBL — Team-Based Learning** (seção dedicada com guia de casos e preparações).
     - Bloco 4: **Habilidades Médicas** (Cirúrgicas e Clínicas).
     - Bloco 5: **TFC** (Clínico e Cirúrgico).
     - Bloco 6: **Flashcards** (estado limpo "Em breve", sem links externos quebrados).
   - Barra de navegação e filtros rápidos por categoria ("Todos", "Tutoria & Lacuna", "Conferências", "TBL", "Habilidades & TFC", "Flashcards") em CSS/JS puro com zero dependências externas.
4. **Estilo (E):**
   - Tipografia de alta classe: Playfair Display nos cabeçalhos e Inter no corpo.
   - Paleta cromática oficial: Verde Musgo (`#556B2F`), Verde Claro (`#A3B18A`), bordas suaves e sombras com elevação suave.
   - Pílulas de filtro estilizadas com microinterações de hover e estado ativo vibrante.
5. **Gatilho (G):**
   - Eventos GA4 disparados em `analytics.js` para cliques nos novos blocos, subpastas e filtros por categoria.

### 6.3 Refinamento Arquitetural: Consolidação no Bloco "Outros"
- **Feedback do Usuário:** Em vez de blocos separados para cada modalidade complementar, unificar em uma tabela/card maior chamado **"Outros"**.
- **Regra de Interatividade do Bloco "Outros":**
  - O cabeçalho "Outros" é **não clicável** (`cursor: default;`).
  - Apenas os subtópicos internos são interativos:
    1. **Lacuna Zero:** Link para a pasta do Drive (`12ZfSkcVjI3fmtViUeesWdIJtRfbEYFFP`).
    2. **Conferências:** Link para a pasta do Drive (`1biDGwPJ_efPUeG72ltTvQk7J9bXGa4WW`).
    3. **TBL:** Casos e preparações pré-TBL.
- **Topologia do Portal:**
  - Card 1: **Febre, Inflamação e Infecção - Tutoria** (Problemas 01 a 04).
  - Card 2: **Outros** (Lacuna Zero, Conferências, TBL) — cabeçalho neutro/estático.
  - Card 3: **Habilidades Médicas**.
  - Card 4: **TFC**.
  - Card 5: **Flashcards** (Em elaboração).
- **Localização dos Arquivos do Site:**
  - O workspace configurado no IDE é `/home/vvgfilhos/medhelp`. Manter os arquivos `index.html`, `styles.css` e `analytics.js` sincronizados ou centralizados dentro de `medhelp/` (com link simbólico para `~/index.html`) resolve 100% de quaisquer restrições de permissão do ambiente e integra diretamente ao repositório git.

---

## 7. Brainstorming & Decision Log: Otimização do Google Analytics & Dashboard no Looker Studio (Item 15)

### 7.1 Diagnóstico do Sistema Atual
- **Arquivo analisado:** `analytics.js` (Property `G-ZRZ8CP11KF`).
- **Gargalo Técnico:** O script envia eventos customizados (`click_sub_item`, `click_pasta_principal`) com parâmetros próprios (`nome_item`, `categoria_pai`, `url_destino`). No GA4, parâmetros personalizados ficam ocultos nos relatórios padrão caso não sejam registrados explicitamente como **Dimensões Personalizadas (Custom Dimensions)** no painel do administrador.
- **Risco de Perda de Evento:** Ao clicar em links externos do Google Drive, se o navegador mudar de contexto rápido demais, a requisição HTTP do `gtag` poderia ser cancelada. Solução: Injetar `transport: 'beacon'` nativo.

### 7.2 Decision Log (Brainstorming Validado)
- **Decisão 1:** Adotar a **Abordagem 1 — Padronização Universal no JS + Dashboard Oficial no Google Looker Studio**.
  - *Alternativas consideradas:*
    1. Painel exclusivo dentro de "Explorações" do GA4 (rejeitado por interface pesada, confusa e de difícil acesso mobile).
    2. Automação via Google Apps Script para Google Sheets (rejeitado por violação de YAGNI e manutenção excessiva de cotas de API).
  - *Motivo da escolha:* O Looker Studio é 100% gratuito, conecta-se diretamente à propriedade do GA4 em 2 cliques, atualiza-se em tempo real e fornece uma URL direta com visual executivo limpo.
- **Decisão 2:** Alinhamento Duplo de Parâmetros no `analytics.js`.
  - Enviar tanto os parâmetros canônicos do GA4 (`item_name`, `item_category`, `link_url`) quanto os legados (`nome_item`, `categoria_pai`, `url_destino`) com `transport: 'beacon'`, garantindo compatibilidade total e zero perda de métricas.

### 7.3 Arquitetura do Dashboard Proposto (Looker Studio)
1. **Cards de Visão Geral (Scorecards):**
   - Total de Usuários Únicos (Alunos).
   - Total de Sessões / Acessos ao Portal.
   - Total de Materiais Baixados/Acessados (Cliques no Drive).
2. **Gráfico de Barras Horizontal (Ranking de Demanda):**
   - Métrica: Contagem de Eventos.
   - Dimensão: `nome_item` / `item_name`.
   - Objetivo: Mostrar com clareza quais Problemas (P1, P2, P3, P4) ou modalidades (Conferências, Lacuna Zero) são os mais demandados da turma.
3. **Gráfico de Engajamento Temporal (Padrão de Estudo):**
   - Dimensão: Dia da semana e Hora do dia.
   - Métrica: Sessões ativas.
   - Objetivo: Revelar as "vésperas de estudo" para planejar publicações de materiais no momento de maior pico.
