# Roteiro de Evidências (NotebookLM) — Especificação e Solução de Sumário Digital

## 0. Diagnóstico Crítico: Quebra do PyAV 19.0.0 no faster-whisper (`Transcribe.ipynb`)
- **Incidente:** O pipeline de transcrição médica no Google Colab falhou subitamente para todo o lote com:
  `TypeError: open() got an unexpected keyword argument 'metadata_errors'`
- **Causa Raiz Investigada:**
  - O pacote `PyAV` (`av`) publicou a versão major **19.0.0** no PyPI em 29/09/2026 às 17:46:33 UTC (horas antes da execução do usuário).
  - No PyAV 19.0.0, os argumentos `metadata_errors` e `metadata_encoding` foram **removidos** de `av.open()` (o tratamento agora é forçado como UTF-8 com `surrogateescape`).
  - O `faster-whisper` (v1.2.1) tem como dependência declarada `av>=11` (sem teto superior). Ao executar `!pip install faster-whisper`, o pip baixou a versão mais recente (`av==19.0.0`).
  - No arquivo `faster_whisper/audio.py`, a função de decodificação chama:
    `with av.open(input_file, mode="r", metadata_errors="ignore") as container:`
  - Como `metadata_errors` não é mais aceito pelo PyAV 19, a chamada quebra imediatamente ao carregar qualquer áudio na VRAM/CPU.
- **Estratégia de Correção (Dupla Camada - Defesa em Profundidade):**
  1. **Camada 1 (Instalação / Dependências - Célula 1):**
     Fixar `"av<19"` na instalação via pip (`!pip install faster-whisper "av<19" ...`), garantindo compatibilidade nativa em novas instâncias do Colab.
  2. **Camada 2 (Hotfix / Monkeypatch em Runtime - Célula 4):**
     Injetar um wrapper transparente em `av.open` que descarta `metadata_errors` e `metadata_encoding` caso existam antes de repassar para o PyAV real:
     ```python
     try:
         import av
         _orig_av_open = av.open
         def _safe_av_open(*args, **kwargs):
             kwargs.pop('metadata_errors', None)
             kwargs.pop('metadata_encoding', None)
             return _orig_av_open(*args, **kwargs)
         av.open = _safe_av_open
     except Exception:
         pass
     ```
     *Benefício imediato:* Usuários com sessões ativas do Colab que já possuem `av==19.0.0` em memória não precisam reiniciar o runtime nem reinstalar pacotes — o script se autocorrige em tempo de execução (*Self-Healing*).
  3. **Correção do Guardião de Versão (Célula 0):**
     Restauração de indentação e variáveis na Célula 0 para checagem sem falhas sintáticas com GitHub.
  4. **Atualização do Banner e Metadados:**
     Versão do pipeline elevada para **v2.5 (CUDA + OCR + PyAV-Fix)**.

---

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

---

## 8. Especificação de Limpeza Visual e Ativação do TBL (Portal index.html)

### 8.1 Diagnóstico das Demandas do Usuário
1. **Poluição Visual no Bloco "Outros":**
   - As tags "Nivelamento" (em Lacuna Zero) e "Gravações & Slides" (em Conferências) foram solicitadas para remoção para conferir um visual mais sóbrio, limpo e direto aos itens.
2. **Ativação da Pasta de TBL:**
   - Substituição do nome longo "TBL — Team-Based Learning" por simplesmente "TBL".
   - Conversão do placeholder inativo (`.sub-item-placeholder` com badge "Em breve") em link de navegação ativo apontando para a pasta oficial do Drive: `https://drive.google.com/drive/u/0/folders/1RE5uK-9Y9qGf73gmerAhBCY6T2egSzPD`.
3. **Harmonização dos Badges de Flashcards:**
   - Unificação dos status "Em elaboração" e "Aguarde" em um único padrão textual e visual: **"Em breve"**.

### 8.2 Aplicação do Ciclo V.L.A.E.G.
- **Visão (V):** Inputs definidos (URL do Drive de TBL, exclusão de badges de texto secundários em Lacuna e Conferências, unificação para "Em breve" em Flashcards).
- **Link (L):** Validação da URL da pasta TBL e confirmação de disparo automático do evento `click_sub_item` no `analytics.js`.
- **Arquitetura (A):** Modificação no `index.html`, mantendo marcação semântica e acessibilidade (`aria-label`).
- **Estilo (E):** Manutenção da tipografia serifada/sem-serifa equilibrada e setas indicativas de link ativo (`.sub-seta`) nos itens do card "Outros".
- **Gatilho (G):** Validação do HTML e registro em `system_log.md`.

### 8.3 Atualização da Pasta-Mãe do Módulo de Tutoria (Febre, Inflamação e Infecção)
- **Diagnóstico:** O cabeçalho do card de Tutoria (`.pasta-header`) estava utilizando provisoriamente o ID do Problema 01 (`1Hz6afomNtSoPz4HSfW6fxAfOlxX7il48`).
- **Resolução:** Substituição pelo link oficial da pasta-mãe do módulo fornecido pelo usuário: `https://drive.google.com/drive/u/0/folders/1vKNhlHaeWpFFtXXKLxuubL9P3Cy1_sm4`.
- **Integridade dos Subitens:** Os links de Problema 01 a 04 permanecem inalterados.

---

## 9. Extrator de Sumário Digital: Resiliência contra Marcadores Achatados e PDFs sem Bookmarks (Junqueira & Carneiro)

### 9.1 Diagnóstico de Casos de Borda (Edge Cases)
1. **Bookmarks Achatados (Flattened TOC):**
   - Em livros convertidos de ePub para PDF por ferramentas como o Calibre (ex: `Histologia Básica_parte1.pdf`), todos os nós do índice são salvos como Nível 1 (`item[0] == 1`).
   - O extrator padrão transformava 138 tópicos em cabeçalhos `## 📚`, quebrando a macro-hierarquia requerida pelo NotebookLM.
   - **Solução:** Algoritmo de desachatamento inteligente. Quando mais de 80% dos marcadores forem Nível 1 e houver títulos numerados (`^\d{1,2}\s+[A-ZÀ-Ú]`), o script promove apenas os capítulos numerados a `lvl = 1` e rebaixa todas as seções internas contíguas para `lvl = 2` (`- 📂 **...**`), descartando preliminares e homenagens pré-capítulo 1.

2. **PDFs sem Árvore de Bookmarks (`doc.get_toc() == []`):**
   - Arquivos como `Histologia Básica_parte2.pdf` sofreram perda dos metadados de outline durante o split ou conversão.
   - **Solução:** Fallback heurístico visual (`extrair_sumario_sem_bookmarks`).
     - Detecta páginas de capa do capítulo (página com 0 texto e $\ge 1$ imagem) seguidas de página de índice (`Introdução`, `Bibliografia`).
     - Identifica a numeração do capítulo por legendas de figuras (`FIGURA XX.1`) e vincula aos títulos canônicos do livro.
     - Mapeia o **Atlas de Histologia** ao final do volume (pp. 674–916), dividindo as pranchas em tecidos fundamentais e sistemas orgânicos.

### 9.2 Interface CLI e Resolução de Caminhos
- Se o usuário estiver no diretório `~/Downloads/histologia/`, a sintaxe para invocar o extrator é:
  ```bash
  python3 /home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py .
  ```
- O script processa automaticamente arquivo único ou lote, gerando o arquivo `[Nome] - Sumario_Digital.md` no mesmo diretório de cada PDF.

---

## 10. Diagnóstico Crítico: Erro de Offsets em Livros Digitais (`VERIFICAR_OFFSET`) & Redundância da Célula 6.5

### 10.1 Causa Raiz do Erro `"paginas": "VERIFICAR_OFFSET"` em Livros Digitais
1. **Natureza dos Livros Digitais vs Impressos:**
   - Livros extraídos via `extrair_sumario_digital.py` (ou livros ePub/PDF digitais puros como `Histologia Básica_parte2.pdf` e `Robbins - Patologia_parte2.pdf`) têm suas páginas no `Sumario_Digital.md` extraídas diretamente de `doc.get_toc()`.
   - No PyMuPDF, o campo `page` é **1-based físico do arquivo PDF** (contador do leitor). Logo, o offset é **ZERO** (`offset = 0`), pois a página já é a coordenada exata no arquivo.
2. **O Roteiro do NotebookLM:**
   - O NotebookLM v5 emite: `📂 [Seção] | 📄 pp. [XX–YY do leitor]` ou `📄 pp. XX–YY`.
3. **O Conflito na Célula 6 (`SYSTEM_PROMPT_CONVERSAO`):**
   - O prompt da Célula 6 instrui: *"Localize o arquivo e o offset na tabela do contexto... Some o offset a CADA número... Se o texto indicar 'VERIFICAR', defina precisa_verificar_offset como true... Se o resultado for <= 0, precisa_verificar_offset = true"*.
   - Se o livro digital não foi mapeado na Célula 3 (porque o usuário não tem página impressa para digitar no prompt interativo), ele **não existe na `{tabela_offsets}`**.
   - Diante de um arquivo sem offset mapeado ou com menção `do leitor` / `VERIFICAR`, o Gemini na Célula 6 aciona a flag de segurança `precisa_verificar_offset = True`, convertida em `paginas = "VERIFICAR_OFFSET"` e travando o pipeline na Célula 7 (`validar_config`).
   - Adicionalmente, detectou-se inconsistência de normalização Unicode NFD (`Histologia Básica` com `\u0301`) vs NFC (`Histologia Básica` com `\u00e1`).

### 10.2 Diagnóstico da Célula 6.5 (Otimização Curatorial Automática)
1. **Obsoleto por Mudança de Montante:**
   - O subagente de 6.5 foi desenhado quando o NotebookLM gerava tags `[FOCO]` e `[MENÇÃO]`. Em 25/09/2026, essas tags foram completamente eliminadas do NotebookLM porque o próprio NotebookLM já faz busca curatorial top-down enxuta.
   - O prompt da 6.5 ainda busca `[MENÇÃO]` para deletar, ficando disfuncional em produção.
2. **Redundância com Célula 6:**
   - A Célula 6 já analisa fusão de objetivos complementares e sobreposição de páginas.
   - A única parte operacional útil de 6.5 é `consolidar_cortes_contiguos(config)` (fusão matemática determinística em Python de páginas adjacentes do mesmo capítulo).
3. **Solução Arquitetural:**
   - Incorporar a consolidação determinística diretamente ao final da Célula 6.
   - Eliminar ou aposentar a Célula 6.5 como etapa separada de LLM, poupando tokens, eliminando latência e acabando com a instabilidade.

### 10.3 Decision Log (Brainstorming Validado)
- **Decisão 1 (Célula 6.5):** Eliminar a Célula 6.5 como chamada de LLM separada. A consolidação determinística de páginas contíguas (`consolidar_cortes_contiguos`) é migrada para a Célula 6, rodando de forma pura e instantânea em Python antes de salvar o `config.json`.
- **Decisão 2 (Eliminação do VERIFICAR_OFFSET):** Manter a soma de offset no prompt do Gemini, mas remover completamente o campo `precisa_verificar_offset` e a emissão de `VERIFICAR_OFFSET`. O Gemini retorna sempre `paginas: list[int]` já convertidas. Para livros digitais ou com offset 0, as páginas originais são mantidas sem alteração.
- **Decisão 3 (Remoção da Fusão entre Objetivos):** Eliminar a regra e o campo de fusão entre objetivos diferentes do prompt da Célula 6 (`SYSTEM_PROMPT_CONVERSAO`). Cada objetivo da tutoria mantém seu próprio PDF exclusivo.
- **Decisão 4 (Normalização Unicode):** Adicionar `unicodedata.normalize('NFC', ...)` nos nomes de arquivo em Python e na geração da tabela de offsets para blindar contra discrepâncias de acentuação (NFD vs NFC).

### 10.4 Plano de Refatoração no `Orquestrador_Hibrido.ipynb`
1. **Célula 5 (Motor):**
   - Atualizar `CorteJSON` (remover `precisa_verificar_offset: bool`).
   - Atualizar `ObjetivoJSON` (remover `fusao: list[str] | None`).
   - Normalizar strings com `unicodedata.normalize('NFC', ...)` nas funções utilitárias.
   - Atualizar `validar_config` para remover guard de `VERIFICAR_OFFSET`.
2. **Célula 6 (Conversão JSON + Consolidação):**
   - Refatorar `SYSTEM_PROMPT_CONVERSAO`: eliminar regras de fusão entre objetivos, eliminar regras de `VERIFICAR_OFFSET`, simplificar normas e instruir aplicação direta do offset.
   - Atualizar `gerar_tabela_offsets`: normalizar nomes com NFC.
   - Integrar chamada a `consolidar_cortes_contiguos(config)` logo após receber a resposta do Gemini.
   - Salvar o `config.json` já consolidado.
3. **Células 16 e 17 (Célula 6.5):**
   - Remover as células 16 (markdown) e 17 (código do otimizador LLM) da estrutura do notebook JSON.

---

## 11. Extração de Sumário Digital: Microbiologia Tortora 12ª ed.

### 11.1 Estrutura do Livro
- **Arquivo:** `Microbiologia Tortora 12. ed.pdf` (962 páginas, 168 MB).
- **Hierarquia no PDF:**
  - Nível 1: Partes I a V + preliminares (`Iniciais`) e pós-textuais (`Finais`).
  - Nível 2: Capítulos 1 a 28 (distribuídos nas 5 partes) + Apêndices A a E, Glossário e Índice Remissivo.
- **Filtro de Ruído Pré-Textual:**
  - Inclusão de termos editoriais comuns em `preliminares_ignorar`: `"iniciais"`, `"ficha catalográfica"`, `"ficha técnica"`, `"sobre os autores"`, `"sumário detalhado"`.
  - Permite que o mapa de evidências inicie exatamente no conteúdo pedagógico útil da obra (`Parte I - Fundamentos de microbiologia`, pág. 23).
- **Arquivo Gerado:**
  - `Microbiologia Tortora 12. ed - Sumario_Digital.md` gerado na pasta do usuário com 42 tópicos indexados e páginas físicas exatas (1-based), 100% pronto para subida como fonte no NotebookLM.

---

## 12. Curadoria e Fusão de Objetivos de Tutoria: Meningites (Orquestrador Híbrido)

### 12.1 Diagnóstico do Roteiro Bruto do NotebookLM
- **Fontes Citadas:**
  1. `Harrisson Medicina interna_recortado_4.pdf` [DIGITAL → Offset 0]:
     - Cap. 137: Encefalite viral (pp. 2098–2110).
     - Cap. 138: Meningite bacteriana (pp. 2111–2122) e viral (pp. 2122–2125).
  2. `PROTOCOLO DE FLUXOS E ROTINAS DAS MENINGITES 2022 (1).pdf` [IMPRESSO → Offset +1]:
     - Seção 1: pp. 4–5 (Introdução e Manifestações Clínicas).
     - Seção 3: pp. 5–7 (Definição de Caso Suspeito e Investigação Diagnóstica).
     - Seção 3: pp. 8–25 (Padrões de Alteração Liquórica e Exames do LCR / Diagnóstico Diferencial).
     - Seção 3: pp. 6–29 (Notificação, Investigação, Quimioprofilaxia e Medidas de Controle).
- **Problema de Redundância e Duplicação Identificado:**
  - O **Objetivo 3** (LCR) e o **Objetivo 4** (Diferencial Meningite vs. Encefalite) citavam **rigorosamente o mesmo intervalo do Protocolo (`pp. 8–25`)** e o mesmo miolo de Meningite Bacteriana do Harrison (`pp. 2111–2122`).
  - Sem fusão, seriam gerados dois cadernos contendo as mesmas 18 páginas do Protocolo impressas em duplicidade, fragmentando a análise laboratorial e sindrômica.

### 12.2 Diretriz do Usuário (Transcrição do Áudio)
- *"Faça a fusão de objetivos que têm a mesma coisa... porque os objetivos que têm as mesmas páginas não faz sentido deixar separados, mas claro que sub-objetivos tutoriais. Vamos seguir o modelo do Orquestrador Híbrido, deixando os títulos certinho, todos presentes, mas com o objetivo fundido."*

### 12.3 Estratégia de Fusão e Preservação de Sub-objetivos
1. **Fusão Primária (Recomendada - Objetivos 3 e 4):**
   - **Novo Objetivo 03:** *Análise Liquórica e Diagnóstico Diferencial das Infecções do SNC (Meningite vs. Encefalite)*.
   - Preserva no corpo da pergunta norteadora:
     - `• Sub-objetivo Tutorial 3: Qual é a importância da análise do líquido cefalorraquidiano (LCR)...?`
     - `• Sub-objetivo Tutorial 4: Como diferenciar meningite, encefalite e meningoencefalite...?`
   - Consolidação de Cortes:
     - Harrison Cap. 137: Encefalite viral (pp. 2098–2110).
     - Harrison Cap. 138: Meningite bacteriana e viral (pp. 2111–2125).
     - Protocolo Seção 3: Diagnóstico Diferencial e Padrões de LCR (pp. 8–25).
2. **Opção Alternativa (Eixo Diagnóstico Completo - Objetivos 2, 3 e 4):**
   - Agrupa Investigação Clínica/PL (pp. 5–7) + LCR/Diferencial (pp. 8–25), totalizando pp. 5–25 do Protocolo em um único caderno diagnóstico amplo.

---

## 13. Refatoração Cirúrgica do Orquestrador Híbrido: Resolução Determinística de Offsets e Livros Digitais Multi-Partes

### 13.1 Diagnóstico das Falhas e Relato do Usuário
- **Sintoma Observado:** Durante a execução de tutoria no Google Colab, cortes de livros travam sistematicamente na Célula 7 com mensagens de erro como `página X inválida (≤ 0). Verifique o offset.` ou páginas excedendo o total físico do arquivo, mesmo após o usuário fornecer o offset correto na Célula 3.
- **Ponto Crítico (Livros Digitais Fatiados em Partes):** Livros digitais com marcadores extraídos (`Sumario_Digital.md`) frequentemente ultrapassam o limite de tamanho e são divididos pelo usuário em 2 ou 3 arquivos (`_parte1.pdf`, `_parte2.pdf`, `_parte3.pdf`). Nesses casos, o roteiro do NotebookLM cita páginas contínuas da obra completa (ex: pp. 480–495), enquanto a Parte 2 inicia fisicamente na página 1 do leitor, exigindo offset negativo (ex: `1 - 451 = -450`).
- **Atrito Manual:** Diante da falha do orquestrador em aplicar o offset ou de retornar páginas erradas, o usuário era obrigado a abrir e editar o `config.json` manualmente a cada tutoria.

### 13.2 Causas-Raiz Identificadas
1. **Delegação Indevida de Aritmética para LLM:**
   - A Célula 6 injetava `{tabela_offsets}` no prompt e exigia que o Gemini calculasse a soma das páginas uma a uma. Modelos generativos são propensos a erros estocásticos em operações com números negativos e listas longas.
2. **Instrução Ambígua no Prompt OCANES:**
   - O prompt continha a regra: `"(se o offset for 0 ou o livro for digital, mantenha os números originais sem alteração)"`.
   - Diante de livros digitais divididos em partes (que possuem offset não-nulo para casar a Parte 2 ou 3), o Gemini interpretava a menção a "livro digital" como ordem expressa para ignorar o offset e retornar os números brutos, estourando o limite de páginas da Parte 2.
3. **Instrução Indutora a Erro na Célula 3:**
   - A interface interativa exibia: `"(💡 Se o livro for DIGITAL ou já estiver com páginas do leitor, digite 0)"`. O usuário era induzido a digitar 0 para volumes fatiados de livros digitais, congelando o descompasso de páginas.
4. **Falta de Pipeline Pós-Processador Determinístico em Python:**
   - O Python lia a resposta do Gemini e gravava o JSON direto no disco, sem reconciliar os nomes dos arquivos com o diretório real e sem recalcular/validar matematicamente as páginas contra o `offsets.json`.

### 13.3 Arquitetura de Refatoração (V.L.A.E.G. & /refactor)
1. **Célula 3 (Mapeamento Interativo com UX Robusta):**
   - Diferenciar claramente no prompt interativo:
     - *Livro Digital de Volume Único*: onde página do leitor é igual à página citada -> offset `0`.
     - *Livro Impresso ou Digital Fatiado em Partes (`_parte2`, `_parte3`)*: offset calculado como `pg_leitor - pg_impressa`.
   - Exibir confirmação matemática imediata na tela: `Impresso X + offset Y = Leitor Z`.
2. **Célula 5 (Motor Determinístico de Resolução):**
   - `resolver_arquivo_pdf(arquivo_citado, pasta_livros)`: Resolve variações de nomes via NFC, case-insensitive, extensão `.pdf` ausente e `get_close_matches`.
   - `aplicar_offsets_deterministicos(config, pasta_livros, offsets_dict)`:
     - Aplica matematicamente `pg + offset` em Python puro.
     - **Proteção Self-Healing para Páginas Já Ajustadas**: Se `pg` já for uma página válida do leitor (`1 <= pg <= total_paginas`) e `pg + offset` resultar em valor inválido (`<= 0` ou `> total`), o motor detecta que o roteiro já continha páginas do leitor e não aplica offset duplicado.
     - **Roteamento Inteligente de Partes**: Se uma página citada pertencer a outra parte de um livro fatiado (ex: citou `parte1` para a página 650, mas a `parte1` tem 450 páginas e a `parte2` cobre 451..916), o motor re-associa o corte à parte correta.
   - Refinar `validar_config` com mensagens ricas, diagnósticos precisos e eliminação de falhas silenciosas.
3. **Célula 6 (Conversão com Responsabilidades Isoladas):**
   - `SYSTEM_PROMPT_CONVERSAO`: O Gemini extrai estritamente o intervalo citado no roteiro como inteiros brutos (Chain of Thought sem matemática de offsets).
   - Pipeline Python após retorno da API:
     `config = aplicar_offsets_deterministicos(config, PASTA_LIVROS, OFFSETS)`
     `config = consolidar_cortes_contiguos(config)`
     Salva o `config.json` já 100% validado fisicamente.
4. **Alinhamento Estrito de Modelos Gemini 3.x (Zero Regressão para 2.x):**
   - Eliminação definitiva de qualquer fallback para modelos legados/obsoletos (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
   - Fixação da cadeia oficial de modelos da geração 3.x:
     `GEMINI_FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash']`.
   - O tratamento de 404 em tempo de execução agora atua estritamente saltando de forma transparente entre essas variantes da série 3.x caso alguma quota ou endpoint oscile, mantendo altíssima velocidade e zero degradação de capacidade de raciocínio.

---

## 14. Especificação: Publicação dos Flashcards de TFC Clínico e TFC Cirúrgico (NotebookLM) no Portal Medhelp (index.html)

### 14.1 Contexto e Objetivos
O ecossistema Medhelp disponibilizou cadernos interativos oficiais no Google NotebookLM dedicados aos decks de flashcards de revisão espaçada para **TFC Clínico** e **TFC Cirúrgico**:
- **TFC Clínico (Flashcards):** `https://notebook.google.com/notebook/f0be34ca-65be-4ad4-9412-3e18888c2c5a`
- **TFC Cirúrgico (Flashcards):** `https://notebook.google.com/notebook/ee774c54-ae58-499d-9b25-a70ed2c76618`

O objetivo é disponibilizar o acesso direto a esses cadernos no portal de materiais Medhelp (`index.html`), publicado no GitHub Pages (`gabrieltrovao12/Medhelp`), integrando-os ao sistema de categorias e rastreamento de engajamento do GA4.

### 14.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Mapeamento de entradas: URLs públicas dos dois cadernos NotebookLM.
   - Mapeamento de saídas: Elementos de ancoragem `<a class="sub-item" target="_blank">` no bloco de Flashcards (`data-categoria="flashcards"`).
2. **Link (L):**
   - Validação da integridade das URLs do NotebookLM.
   - Compatibilidade total com `analytics.js`, que intercepta cliques em `.sub-item` e dispara o evento GA4 `click_sub_item` com `item_category: 'Flashcards'` e `link_url`.
3. **Arquitetura (A):**
   - Inclusão dos itens dentro de `.grid-pastas > .pasta-bloco[data-categoria="flashcards"] > .subpastas-lista`.
   - Preservação dos placeholders para os futuros decks de tutoria do módulo atual (`Decks do Módulo Febre, Inflamação e Infecção`) e revisões cognitivas (`Revisões Cognitivas Espaçadas`).
   - Acessibilidade: atributos `aria-label` descritivos e tags semânticas.
4. **Estilo (E):**
   - Padrão visual elegante utilizando `.sub-marcador.destaque` (verde musgo ativo com halo translúcido) e `.sub-seta` animada com transição de hover.
   - Tipografia sóbria sem tags espúrias, alinhada à limpeza visual adotada no portal.
5. **Gatilho (G):**
   - Validação automatizada da árvore HTML e dos seletores.
   - Commit semântico no Git e push para `origin main` para acionamento do deploy no GitHub.

---

## 15. Especificação: Atualização do Link do Flashcard de TFC Cirúrgico (NotebookLM) no Portal Medhelp (index.html)

### 15.1 Contexto e Objetivos
O caderno oficial de flashcards de **TFC Cirúrgico** foi atualizado e publicado sob um novo link curto/compartilhado do Google NotebookLM:
- **Link Anterior:** `https://notebook.google.com/notebook/ee774c54-ae58-499d-9b25-a70ed2c76618`
- **Novo Link Atualizado:** `https://notebooklm.link.google/Io3b1Z5d4mqf`

O objetivo é substituir deterministicamente a referência no portal `index.html` mantendo estritamente a conformidade visual, semântica e analítica.

### 15.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: `https://notebooklm.link.google/Io3b1Z5d4mqf`.
   - Saída: Atributo `href` da tag `<a>` de TFC Cirúrgico no bloco de Flashcards (`.pasta-bloco[data-categoria="flashcards"]`) em `index.html`.
2. **Link (L):**
   - Validação de integridade do formato de URL `notebooklm.link.google`.
   - Compatibilidade preservada com `analytics.js` (evento GA4 `click_sub_item`).
3. **Arquitetura (A):**
   - Modificação cirúrgica em `index.html` (alvo físico `/home/vvgfilhos/index.html` via symlink).
   - Preservação intacta de todas as demais categorias, do TFC Clínico e dos placeholders.
4. **Estilo (E):**
   - Manutenção de `.sub-marcador.destaque`, `.sub-nome` ("TFC Cirúrgico") e `.sub-seta` ("→").
5. **Gatilho (G):**
   - Verificação da árvore HTML via script Python.
   - Registro do histórico no `system_log.md`.
   - Commit e push no Git para GitHub Pages.

---

## 16. Especificação: Unificação do Bloco Flashcards com Lacuna Zero (NotebookLM) no Portal Medhelp (index.html)

### 16.1 Contexto e Objetivos
O usuário determinou a limpeza de todos os links e nomes previamente presentes no bloco de **Flashcards** (`.pasta-bloco[data-categoria="flashcards"]`), unificando o card para exibir exclusivamente os flashcards do caderno **Lacuna Zero**:
- **Novo Link Exclusivo:** `https://notebooklm.link.google/aOaQN6cI1NYQ`
- **Nome do Item:** `Lacuna Zero`
- **Itens Removidos:** TFC Clínico, TFC Cirúrgico e quaisquer outros itens residuais da lista.

### 16.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: URL `https://notebooklm.link.google/aOaQN6cI1NYQ` com o identificador "Lacuna Zero".
   - Saída: `.subpastas-lista` do bloco Flashcards contendo unicamente a tag de ancoragem para Lacuna Zero.
2. **Link (L):**
   - Formato de link verificado: link direto de compartilhamento público do Google NotebookLM.
   - Compatibilidade total com `analytics.js` (evento GA4 `click_sub_item` com `item_category: 'Flashcards'`).
3. **Arquitetura (A):**
   - Modificação em `index.html` (arquivo físico `/home/vvgfilhos/index.html` mapeado via symlink).
   - Preservação da integridade estrutural das demais categorias e do contêiner `.pasta-bloco[data-categoria="flashcards"]`.
4. **Estilo (E):**
   - Manutenção do padrão visual com `.sub-marcador.destaque`, `.sub-nome` ("Lacuna Zero") e `.sub-seta` ("→").
   - Acessibilidade: `aria-label="Acessar Flashcards de Lacuna Zero no NotebookLM"`.
5. **Gatilho (G):**
   - Validação da árvore sintática HTML com parser formal.
   - Registro analítico em `system_log.md`.
   - Commit e deploy via push para `origin main`.

---

## 17. Especificação: Atualização do Bloco Flashcards com Cognitiva (NotebookLM) no Portal Medhelp (index.html)

### 17.1 Contexto e Objetivos
O usuário solicitou a remoção do caderno de flashcards de **Lacuna Zero** e a inserção do caderno de flashcards de **Cognitiva**:
- **Novo Link Exclusivo:** `https://notebooklm.link.google/FZj81DdprGxO`
- **Nome do Item:** `Cognitiva` (Flashcards - Cognitiva)
- **Item Removido:** `Lacuna Zero` (`https://notebooklm.link.google/aOaQN6cI1NYQ`)

### 17.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: URL pública `https://notebooklm.link.google/FZj81DdprGxO` para flashcards de Cognitiva.
   - Saída: Item de ancoragem `<a class="sub-item" target="_blank">` dentro de `.subpastas-lista` do bloco Flashcards (`data-categoria="flashcards"`).
2. **Link (L):**
   - Validação do link curto do Google NotebookLM.
   - Compatibilidade com o evento GA4 `click_sub_item` no `analytics.js` (`item_category: 'Flashcards'`, `item_name: 'Cognitiva'`).
3. **Arquitetura (A):**
   - Modificação cirúrgica em `index.html` (alvo `/home/vvgfilhos/index.html` via symlink).
4. **Estilo (E):**
   - Preservação da estética padrão com `.sub-marcador.destaque`, `.sub-nome` ("Cognitiva") e `.sub-seta` ("→").
   - Acessibilidade: `aria-label="Acessar Flashcards de Cognitiva no NotebookLM"`.
5. **Gatilho (G):**
   - Validação sintática da árvore HTML com parser estrito.
   - Registro analítico em `system_log.md`.
   - Deploy via commit e push para `origin main`.

---

## 18. Especificação: Transição para o Módulo de Dor e Adição de OSCE em Habilidades Médicas no Portal Medhelp (index.html)

### 18.1 Contexto e Objetivos
O ecossistema acadêmico do Medhelp iniciou o novo módulo temático: **Módulo de Dor**. O portal de apoio (`index.html`) deve ser atualizado com as novas pastas do Google Drive correspondentes à Tutoria e seus Problemas, além de incorporar o subgrupo **OSCE** na seção de Habilidades Médicas:
- **Módulo Atual (Badge & Meta):** Transição de "Febre, Inflamação e Infecção" para "Módulo de Dor".
- **Tutoria (Módulo de Dor - Pasta Principal):** `https://drive.google.com/drive/u/0/folders/1GWZTVYpt8oQ4BLntAtYOxsG9Dg2zYomY`
- **Problema 01:** `https://drive.google.com/drive/u/0/folders/1c_cHqCV4Q0wF8k5aufQU47ncHMsUwp9k`
- **Problema 02:** `https://drive.google.com/drive/u/0/folders/1mg8umfNdWWpZTwkYMP9ETA18vgHTlXm2`
- **Problema 03:** `https://drive.google.com/drive/u/0/folders/1JNGHigprmKrR9hHuS50o7XK7ZobQI1BU`
- **Habilidades Médicas - Subgrupo OSCE:** `https://drive.google.com/drive/u/0/folders/1hSHeViOuDporaY1QleBkXSJ92mc5bjbI`

### 18.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Mapeamento de entradas: URLs das 4 pastas de Tutoria/Problemas e 1 pasta de OSCE.
   - Mapeamento de saídas: Elementos em `index.html` (meta description, modulo-badge, bloco `.pasta-bloco[data-categoria="tutoria"]` e novo item em `.pasta-bloco[data-categoria="habilidades"]`).
2. **Link (L):**
   - Validação da conectividade dos links do Drive.
   - Garantia de captura e rastreamento automático de cliques pelo `analytics.js` (`item_category: 'Módulo de Dor - Tutoria'` e `'Habilidades Médicas'`).
3. **Arquitetura (A):**
   - Modificação em `index.html` (alvo físico `/home/vvgfilhos/index.html` via symlink).
   - Remoção do Problema 04 legado (o Módulo de Dor inicia com 3 problemas ativos).
   - Inserção do subitem OSCE no grupo de Habilidades Médicas.
4. **Estilo (E):**
   - Preservação da hierarquia visual elegante, micro-animações, badges e ícones (`📚`, `🩺`).
   - Acessibilidade consistente com atributos `aria-label`.
5. **Gatilho (G):**
   - Validação automatizada da árvore HTML com parser estrito.
   - Registro detalhado em `system_log.md`.
   - Deploy automático via git commit e push para `origin main` (GitHub Pages).

---

## 19. Especificação: Atualização de Conferências e Remoção de TBL no Portal Medhelp (index.html)

### 19.1 Contexto e Objetivos
O usuário solicitou a atualização do link da pasta de **Conferências** no Google Drive e a remoção definitiva do item **TBL**:
- **Novo Link de Conferências:** `https://drive.google.com/drive/u/0/folders/12d8cwaMFHzbPBJrMBJK4Mo1xfuLnOE0j`
- **Link Anterior de Conferências:** `https://drive.google.com/drive/u/0/folders/1biDGwPJ_efPUeG72ltTvQk7J9bXGa4WW`
- **Item Removido:** `TBL` (`https://drive.google.com/drive/u/0/folders/1RE5uK-9Y9qGf73gmerAhBCY6T2egSzPD`)
- **Ajustes de UI:** Atualização da legenda do botão de filtro de categoria (`🗂️ Outros (Lacuna & Conf)`) e do `meta description`.

### 19.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: Nova URL da pasta de Conferências.
   - Saída: `index.html` com o novo `href` em Conferências e a remoção da tag `<a>` de TBL dentro de `.subpastas-lista` do bloco Outros.
2. **Link (L):**
   - Validação do link do Drive.
   - Rastreamento analítico do evento `click_sub_item` no `analytics.js` para `item_name: 'Conferências'` e `item_category: 'Outros'`.
3. **Arquitetura (A):**
   - Modificação cirúrgica em `index.html` (alvo físico `/home/vvgfilhos/index.html` via symlink).
   - Preservação da tag de ancoragem de Lacuna Zero no bloco Outros.
4. **Estilo (E):**
   - Manutenção do padrão visual com `.sub-marcador.destaque`, `.sub-nome` ("Conferências") e `.sub-seta` ("→").
   - Acessibilidade: `aria-label="Acessar pasta de Conferências no Drive"`.
5. **Gatilho (G):**
   - Validação sintática da árvore HTML com parser formal estrito.
   - Registro analítico em `system_log.md`.
   - Deploy via commit e push para `origin main`.

---

## 20. Especificação: Padronização Obrigatória do Sufixo "(resumo)" nos PDFs Premium (`colab_gerador_pdf_premium.ipynb`)

### 20.1 Contexto e Diagnóstico
- **Demanda do Usuário:** No notebook `colab_gerador_pdf_premium.ipynb`, os arquivos `.md` da pasta `Resumos_Prontos` podiam ser convertidos diretamente com `pdf_filename = filename.replace(".md", ".pdf")`. Quando um arquivo vinha sem o sufixo `(resumo)` ou com capitalizações divergentes, o PDF gerado ficava sem a chancela padrão de nomenclatura do Medhelp.
- **Voz do Usuário (Transcrição e Áudio):** *"Eu quero que todo PDF gerado coloque sempre no final do PDF o parêntese resumo, lá no nome do arquivo."*
- **Objetivo Determinístico:** Garantir que 100% dos PDFs gerados pelo `colab_gerador_pdf_premium.ipynb` terminem obrigatoriamente com o padrão `[Título Limpo] (resumo).pdf`, eliminando redundâncias (`(resumo) (resumo).pdf`) e normalizando variações de caixa alta/baixa (`(Resumo)`, `(RESUMO)`).

### 20.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - **Entrada:** Arquivos Markdown (`.md`) da pasta `Resumos_Prontos` (ex: `Hipertensão Arterial.md`, `Semiologia Pulmonar (resumo).md`, `Cardiologia (Resumo).md`).
   - **Saída:** PDFs gravados em `PDFs_Premium` com o padrão unificado `Nome do Tema (resumo).pdf`.
   - **Fluxo:** Detecção do arquivo `.md` → Extração da raiz do nome → Sanitização regex para remover qualquer `(resumo)` já existente → Concatenação de `(resumo).pdf` → Verificação de existência prévia no Drive → Renderização WeasyPrint → Arquivamento resiliente.
2. **Link (L):**
   - Caminhos resolvidos no Google Drive montado via FUSE (`/content/drive/MyDrive/...`).
   - Uso de `mover_arquivo_com_retry` para o arquivamento pós-processamento, evitando falhas FUSE.
3. **Arquitetura (A):**
   - Modificação da Célula 4 de `scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb`.
   - Utilização de `re.sub(r'\s*\([Rr]esumo\)$', '', nome_base, flags=re.IGNORECASE).strip()` para desduplicação elegante.
   - Refatoração da chamada `shutil.move` na linha de arquivamento para `mover_arquivo_com_retry(filepath, arquivo_path)`.
4. **Estilo (E):**
   - Nomenclatura consistente com a especificação canônica do Medhelp (`(resumo)` em minúsculas com espaço precedente, matching exato com `automacao-transcricoes/Main.js`).
5. **Gatilho (G):**
   - Teste de laboratório sintético validando múltiplos formatos de entrada (`Sem sufixo`, `Com (resumo)`, `Com (Resumo)`, `Com (RESUMO)`, `Sem espaço`).
   - Validação da árvore AST do notebook via Python.
   - Atualização do Guardião de Versões e registro analítico em `system_log.md`.

---

## 21. Brainstorming & Decision Log: Guia de Alto Rendimento / Foco Radical em Prova (Item 21)

### 21.1 Diagnóstico do Problema & Hipótese Central
- **Problema Observado:** Os resumos teóricos gerados a partir de transcrições de aulas (formato atual em PDF com 5 a 6 páginas) não estão sendo consumidos pelos alunos. A turma possui forte apego visual aos slides de aula e rejeita textos longos ou listas extensas de tópicos.
- **Hipótese Solucionadora ("Cavalo de Troia"):** O aluno sempre procurará e abrirá os slides da aula. Ao posicionar um **Guia Ultracondensado de 2 Páginas (Foco Radical em Prova)** como a capa/abertura obrigatória desse PDF de slides, o aluno consome a síntese da aula e o direcionamento de prova imediatamente antes de ver os slides.
- **Independência de Slides:** A IA não depende de arquivos de slides para produzir o Guia de 2 páginas. Quando a aula não tiver slides, o Guia funciona de forma autônoma e completa.

### 21.2 Decision Log (Brainstorming Validado)
- **Decisão 1 (Formato do Material):** Adoção do **Guia Visual Ultracondensado (1 a 2 páginas)** em substituição ao resumo teórico denso de 6 páginas.
  - *Alternativas consideradas:* Deck completo de Flash-Slides Sintéticos 16:9 gerados por IA; Baralhos puros de Flashcards do professor; Resumo tradicional com novo estilo visual.
  - *Motivo da escolha:* O Guia Ultracondensado consome 65% menos tokens de saída, gera menos risco de timeout no GAS, lê-se em menos de 2 minutos e é versátil para qualquer matéria.
- **Decisão 2 (Estratégia de Merge e Distribuição):** Geração do Guia de 2 páginas como PDF independente e **merge manual** subsequente com os slides da aula (via iLovePDF ou similar).
  - *Alternativas consideradas:* Merge automatizado via bibliotecas PDF em Apps Script (rejeitado por alto risco de quebra, limites de memória e dependência de formato dos slides).
  - *Motivo da escolha:* Mantém a automação leve e robusta, e dá controle total ao usuário sobre slides em PPTX, PDF ou fotos.
- **Decisão 3 (Abordagem de Conteúdo — Foco Radical em Prova):**
  - **Página 1 ("Tudo o que pode cair na prova e como cai"):**
    - Mapeamento hierárquico dos temas por probabilidade de cobrança (com ênfase expressa do professor).
    - Modelos de questão e pegadinhas de cobrança.
    - O caso clínico real ou discussão trazida pelo professor em sala (com lição de conduta e erro cometido).
  - **Página 2 ("Tabelas & Armadilhas Conceituais Puras"):**
    - Tabelas comparativas/diferenciais (diferença entre patologias, marcadores ou fármacos lado a lado).
    - Seção de armadilhas conceituais: *"Conceito A NÃO É Conceito B"*.
  - *Motivo da escolha:* Responde diretamente à dor do estudante de medicina (passar na prova e fixar condutas clínicas cruciais sem perda de tempo).
- **Decisão 4 (Métricas de Performance e Custos):**
  - Tokens de entrada: ~14.000 tokens (1h de áudio).
  - Tokens de saída: ~800 a 1.200 tokens (redução drástica frente aos 3.500 anteriores).
  - Tempo de resposta da API Gemini: 5 a 8 segundos.
  - Custo por aula: < R$ 0,01.

### 21.3 Estado Atual do Ciclo
- **Understanding Lock:** Aprovado e travado pelo usuário em 30/10/2026.
- **Status:** Substituído pelo modelo de Resumo Enxuto (Item 22).

---

## 22. Especificação: Refatoração do Prompt de Transcrições para Formato Enxuto (Item 22)

### 22.1 Diagnóstico & Solicitação do Usuário
- **Feedback:** O usuário rejeitou a divisão rígida em "Página 1 e Página 2" do experimento anterior e solicitou o retorno à estrutura base do resumo clássico com podas severas para torná-lo significativamente mais enxuto e visual.
- **Diretrizes Exatas do Usuário:**
  1. **Seção 1:** Substituir "Foco Principal da Aula" por **"1. Assuntos que vão cair na prova"**.
  2. **Eliminação de Exclusões:** Remover integralmente a seção **"O que NÃO priorizar"**.
  3. **Resumo Teórico Estruturado:** Focar o texto puramente nos **conceitos-chave** e converter todo o restante (mecanismos, fisiopatologia, parâmetros e diferenciais) em **Tabelas Markdown de fácil leitura**.
  4. **Conduta Direta:** Remover a seção prolixa de "Correlação clínica" e manter exclusivamente uma seção direta de **"3. Conduta"** (com Conduta Geral e Tabela Se/Então).
  5. **Eliminação de Armadilhas Acessórias:** Remover integralmente a seção **"Erros Comuns e Armadilhas"**.
- **Resultado Estrutural:** O resumo reduz-se estritamente a 3 seções magnas de altíssimo rendimento visual.

### 22.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: `TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO` e `CONTEÚDO_DOS_SLIDES_EM_TEXTO` (opcional).
   - Saída: Markdown canônico estruturado em apenas 3 blocos:
     - `## 1. Assuntos que vão cair na prova`
     - `## 2. Resumo Teórico` (Subtópicos com `- **Conceito-chave:**` + Tabelas Markdown de mecanismos/fisiopatologia)
     - `## 3. Conduta` (`**Conduta Geral:**` + `### Tabela de Resolução Rápida (Se/Então)`)
2. **Link (L):**
   - Invocação da Gemini API em Google Apps Script mantendo total resiliência via `GeminiClient.js` e Exponential Backoff.
3. **Arquitetura (A):**
   - `scripts/apps-script/automacao-transcricoes/Prompt.js`: `SYSTEM_INSTRUCTION_TEORIA` reescrito sob o framework OCANES eliminando seções mortas e forçando o modelo mental de "Conceito em 1 linha + Todo o resto em tabela".
   - `Main.js`: Despacho direto `const promptAplicado = ehPratica ? SYSTEM_INSTRUCTION_OSCE : SYSTEM_INSTRUCTION_TEORIA`.
   - `Config.js`: Retorno à configuração canônica limpa.
4. **Estilo (E):**
   - Altíssima escaneabilidade visual: erradicação de listas intermináveis de sub-bullets aninhados.
   - Uso de tabelas Markdown limpas, negrito para termos técnicos centrais e setas inline (`->`) para cascatas fisiológicas rápidas dentro de células.
5. **Gatilho (G):**
   - Validação sintática local e atualização de `task.md` e `system_log.md`.

---

## 23. Especificação: Redesign Visual dos PDFs Premium (Editorial Contemporâneo com WeasyPrint)

### 23.1 Diagnóstico & Oportunidade
- **Contexto:** Com a migração do prompt para um formato mais enxuto e fortemente fundamentado em tabelas e conceitos, o visual padrão em Roboto com tabelas simples de borda preta carecia de distinção editorial.
- **Objetivo Visual:** Elevar o nível estético dos PDFs gerados no Colab (`colab_gerador_pdf_premium.ipynb`) para um visual de revista científica / editorial médico contemporâneo de alto impacto.

### 23.2 Ciclo V.L.A.E.G.
1. **Visão (V):**
   - Entrada: Arquivos Markdown gerados pelo pipeline de transcrições com títulos H1/H2/H3, tabelas conceituais e boxes de conduta (`blockquote`).
   - Saída: PDFs diagramados em tamanho A4 com tipografia hierarquizada e tabelas executivas de alto contraste.
2. **Link (L):**
   - Importação remota segura do Google Fonts via `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap')`.
   - Pacote `fonts-inter` adicionado preventivamente ao comando `apt-get` no Colab para resiliência local.
3. **Arquitetura (A):**
   - `colab_gerador_pdf_premium.ipynb`:
     - Célula 0: Atualização do `VERSAO_LOCAL = "2026-10-31T17:30:00Z"`.
     - Célula 1: Atualização da descrição em Markdown catalogando os novos recursos de design.
     - Célula 2: Inclusão de `fonts-inter` na instalação do sistema operacional.
     - Célula 4: Reformulação completa do `CSS_PREMIUM_TEMPLATE`.
4. **Estilo (E):**
   - **Tipografia:**
     - Títulos (`h1`, `h2`, `h3`, `h4`): Playfair Display com serifa editorial elegante.
     - Corpo do texto (`body`, `p`, `li`, `table`): Inter geométrica moderna, tamanho 10pt, entrelinha 1.6, cor `#2c3e50`.
     - Título principal (`h1`): 20pt `#1a1a1a`, com destaque sublinhado em Verde Musgo (`1.5pt solid #556B2F`).
     - Títulos de seção (`h2`): 13.5pt `#556B2F` (Verde Musgo) com linha divisória sutil `#e2e8f0`.
   - **Tabelas Executivas de Alto Contraste:**
     - Cabeçalhos (`th`): Fundo sólido em Verde Musgo (`#556B2F`), texto em branco puro (`#ffffff`), padding confortável `7pt 10pt` e cantos executivos.
     - Células (`td`): Padding `7pt 10pt`, borda inferior suave `#e2e8f0`.
     - Zebra Striping: Linhas pares com fundo pastel `#f9faf8` e linhas ímpares com fundo branco.
   - **Box de Conduta Clínica (`blockquote`):**
     - Borda esquerda de destaque em Verde Musgo (`3pt solid #556B2F`), fundo pastel areia/oliva (`#f8faf7`), padding `10pt 14pt`, cantos `0 4pt 4pt 0` e texto em peso normal sem itálico apagado.
5. **Gatilho (G):**
   - Validação da árvore sintática AST das células Python do notebook.
   - Sincronização via Git commit e push para o GitHub.








