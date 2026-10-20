# Tarefas do Projeto - Medhelp

## FASE ATUAL: Unificação do Bloco Flashcards em Lacuna Zero no Portal (index.html) - Concluído & Validado
- [x] Especificação técnica e ciclo V.L.A.E.G. documentados em `research.md`.
- [x] Substituir o conteúdo de `.subpastas-lista` do bloco Flashcards em `index.html` deixando exclusivamente o link de Lacuna Zero (`https://notebooklm.link.google/aOaQN6cI1NYQ`).
- [x] Validar compatibilidade semântica, acessibilidade (`aria-label`), integridade da árvore HTML e rastreamento em `analytics.js`.
- [x] Registrar histórico analítico de alterações em `system_log.md`.
- [x] Criar commit semântico e realizar push para `origin main` (GitHub Pages).

## FASE ANTERIOR: Atualização do Link do Flashcard de TFC Cirúrgico no Portal (index.html) - Concluído & Validado
- [x] Especificação técnica e ciclo V.L.A.E.G. documentados em `research.md`.
- [x] Atualizar o link do caderno NotebookLM de TFC Cirúrgico para `https://notebooklm.link.google/Io3b1Z5d4mqf` no bloco Flashcards de `index.html`.
- [x] Validar compatibilidade semântica, integridade do HTML e consistência com `analytics.js`.
- [x] Registrar histórico analítico de alterações em `system_log.md`.
- [x] Criar commit semântico e realizar push para `origin main` (GitHub Pages).

## FASE ANTERIOR: Publicação dos Flashcards de TFC Clínico e TFC Cirúrgico no Portal (index.html) - Concluído & Validado
- [x] Especificação técnica e ciclo V.L.A.E.G. documentados em `research.md`.
- [x] Integrar os links dos cadernos NotebookLM de TFC Clínico e Cirúrgico no card Flashcards de `index.html`.
- [x] Validar compatibilidade semântica, acessibilidade (`aria-label`) e eventos no `analytics.js`.
- [x] Executar testes laboratoriais de integridade da árvore HTML.
- [x] Registrar histórico analítico de alterações em `system_log.md`.
- [x] Criar commit semântico e realizar push para `origin main` (GitHub Pages).

## FASE ANTERIOR: Geração de Slides de Tutoria — Meningites (Gemini Canvas / scientific-slides) - Concluído & Validado (Versão Resumida)
- [x] Mapear as 5 Perguntas Norteadoras da tutoria de Meningites e decompor em subtemas pedagógicos.
- [x] Aplicar o protocolo estrito do Gemini Canvas (Medhelp) com cabeçalho de renderização e arquétipos Tipo A a J.
- [x] Cumprir regras de densidade e síntese de alto impacto (16 slides objetivos, máx 2 H2, bullets telegráficos).
- [x] Gerar arquivo markdown consolidado `pessoal/geral/slides_tutoria_meningites.md` (16 slides essenciais).
- [x] Apresentar os slides estruturados ao usuário.

## FASE ANTERIOR: Refatoração Cirúrgica do Orquestrador Híbrido — Resolução Determinística de Offsets e Livros Digitais Multi-Partes (Concluído & Validado)
- [x] Especificar arquitetura de desacoplamento: LLM extrai páginas brutas e Python resolve offsets e limites físicos.
- [x] Refatorar Célula 3 (`_pedir_offset`): melhorar UX/instruções para livros digitais de volume único vs livros fatiados em partes (`_parte1`, `_parte2`, `_parte3`).
- [x] Refatorar Célula 5 (Motor):
  - [x] Implementar `resolver_arquivo_pdf` para pareamento resiliente de nomes de arquivos.
  - [x] Implementar `aplicar_offsets_deterministicos` com proteção self-healing contra offsets duplicados e suporte a múltiplos volumes.
  - [x] Aprimorar `validar_config` com relatórios ricos e alertas acionáveis.
- [x] Refatorar Célula 6 (`converter_notebooklm_para_json`):
  - [x] Atualizar `SYSTEM_PROMPT_CONVERSAO` removendo exigência de contas aritméticas pelo Gemini.
  - [x] Encadear pipeline pós-LLM com resolução determinística de arquivos e offsets + consolidação contígua.
- [x] Validação laboratorial:
  - [x] Validar sintaxe AST de todas as células do notebook.
  - [x] Executar simulação de teste com cenários de borda (livro digital parte 2 com offset negativo, páginas já físicas no leitor, livro com offset positivo).
- [x] Alinhamento estrito dos modelos Gemini da geração 3.x (`gemini-3.5-flash-lite`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.8-flash`) e expurgo definitivo de modelos legados (2.5, 2.0, 1.5).
- [x] Registrar histórico no `system_log.md`.


## FASE ANTERIOR: Curadoria & Fusão de Objetivos de Tutoria — Meningites (Orquestrador Híbrido) - Concluído
- [x] Mapear os 5 objetivos e identificar sobreposições de páginas e eixos conceituais (Protocolo pp. 8–25 e Harrison Cap. 138).
- [x] Transcrever e processar o áudio com as instruções de fusão do usuário (sub-objetivos tutoriais e modelo do Orquestrador).
- [x] Formatar a fusão primária (Objetivos 3 e 4) e alternativa (Objetivos 2, 3 e 4) no padrão estrito de input da Célula 4.
- [x] Validar offset do Protocolo (+1) e Harrison (0 - Digital).
- [x] Documentar no `research.md` e registrar no `system_log.md`.

## FASE ANTERIOR: Extrator de Sumário Digital — Microbiologia Tortora 12ª ed. (Concluído & Validado)
- [x] Refinar `preliminares_ignorar` em `scripts/python/extrair_sumario_digital.py` para ignorar seções pré-textuais editoriais (`iniciais`, `ficha catalográfica`, `ficha técnica`, `sobre os autores`, `sumário detalhado`).
- [x] Executar a extração no arquivo `Microbiologia Tortora 12. ed.pdf` em `~/Downloads/Livros - Sumário Digital/`.
- [x] Validar o arquivo gerado `Microbiologia Tortora 12. ed - Sumario_Digital.md` (42 tópicos, 5 partes, 28 capítulos + apêndices, páginas 23 a 962).
- [x] Registrar a execução e validação no `system_log.md` e `research.md`.

## FASE ANTERIOR: Refatoração do Orquestrador Híbrido (Célula 6.5 & Offsets Digitais) - Concluído & Validado
- [x] Diagnóstico da falha de offsets para Livros Digitais (`VERIFICAR_OFFSET`) e descompasso da Célula 6.5.
- [x] Brainstorming iterativo e alinhamento de decisões com o usuário (`medhelp-brainstorming`).
- [x] Confirmação do Understanding Lock (Decisões 1 a 4 aprovadas).
- [x] Refatorar Célula 5 (`CorteJSON`, `ObjetivoJSON`, `validar_config`, normalização NFC).
- [x] Refatorar Célula 6 (`SYSTEM_PROMPT_CONVERSAO` enxuto, remoção de fusão/offsets alucinados, consolidação determinística integrada).
- [x] Remover Célula 6.5 (Células 16 e 17 de Markdown e Código do subagente obsoleto).
- [x] Validar sintaxe AST de todas as células do `Orquestrador_Hibrido.ipynb`.
- [x] Teste laboratorial com o caso real do usuário (Objetivo 01 de PAC).
- [x] Registrar correções no `system_log.md`.

## FASE ANTERIOR: Refatoração & Correção PyAV 19.0.0 (`Transcribe.ipynb`) - Concluído & Validado
- [x] Implementar blindagem de dependências na Célula 1 (`"av<19"`).
- [x] Implementar Hotfix de Self-Healing em tempo de execução na Célula 4 para descartar `metadata_errors` em `av.open`.
- [x] Corrigir sintaxe e indentação do Guardião de Versão na Célula 0.
- [x] Atualizar banner do pipeline para v2.5 (CUDA + OCR + PyAV-Fix).
- [x] Validar sintaxe Python de todas as células do notebook via AST.
- [x] Registrar correções no `system_log.md`.

## FASE ANTERIOR: Extrator de Sumário Digital — Arquitetura 100% Genérica & CLI Global
- [x] Eliminar qualquer lógica hardcoded ou nomes de livros específicos em `scripts/python/extrair_sumario_digital.py`.
- [x] Preservar motor genérico para livros de 2 níveis (Abbas, Robbins, Junqueira completo) e tratados de 3 níveis (Harrison, Guyton).
- [x] Criar binário executável global `~/.local/bin/extrair_sumario_digital` no `$PATH` do usuário.
- [x] Processar `Histologia - Junqueira.pdf` (1.832 páginas, 228 tópicos) gerando `Histologia - Junqueira - Sumario_Digital.md`.
- [x] Registrar no `system_log.md` e atualizar `research.md`.

## FASE ANTERIOR: Atualização da Pasta-Mãe de Tutoria (Febre, Inflamação e Infecção) - Concluído & Validado
- [x] Atualizar o link `.pasta-header` do card Tutoria em `index.html` para `1vKNhlHaeWpFFtXXKLxuubL9P3Cy1_sm4`.
- [x] Validar integridade dos links de Problema 01 a 04.
- [x] Registrar alteração em `system_log.md`.

## FASE ANTERIOR: Limpeza Visual e Ativação do TBL no Portal (index.html) - Concluído & Validado
- [x] Remover tag "Nivelamento" de Lacuna Zero no card "Outros".
- [x] Remover tag "Gravações & Slides" de Conferências no card "Outros".
- [x] Converter "TBL — Team-Based Learning" para apenas "TBL" e ativar link do Drive (`1RE5uK-9Y9qGf73gmerAhBCY6T2egSzPD`).
- [x] Padronizar badges da seção Flashcards ("Em elaboração" e "Aguarde") para "Em breve".
- [x] Validar renderização e integridade do HTML.
- [x] Registrar correções e testes em `system_log.md`.

## FASE ANTERIOR: Crivo do Google Analytics & Dashboard Looker Studio (Item 15) - Concluído & Validado
- [x] Brainstorming iterativo e validação do Understanding Lock com o usuário (concluído em `research.md`).
- [x] Escolha da Abordagem 1: Padronização Universal no JS + Dashboard no Looker Studio.
- [x] Refatorar [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) com:
  - [x] Envio via `transport: 'beacon'` para blindar links externos do Drive contra perdas de requisição.
  - [x] Parâmetros canônicos do GA4 (`item_name`, `item_category`, `link_url`, `content_type`).
  - [x] Preservação de parâmetros legados (`nome_item`, `categoria_pai`, `url_destino`) para retrocompatibilidade.
  - [x] Detecção de intenção para itens placeholder (`click_item_em_breve`).
  - [x] Console logger elegante para depuração em tempo real no F12.
- [x] Fornecer guia prático passo a passo para:
  - [x] Cadastro das Dimensões Personalizadas no painel do GA4 (60 segundos).
  - [x] Conexão e criação do Dashboard no Google Looker Studio com ranking de materiais e padrões de horário.
- [x] Validação sintática do script (`node -c`) e registro detalhado em `system_log.md`.

## FASE ANTERIOR: Ajeitar o Portal (index.html) — Novo Módulo, Lacuna Zero, TBL e Conferências (Item 12) - Concluído & Validado
- [x] Especificação e arquitetura documentadas em `research.md`.
- [x] Backup de segurança do `~/index.html`, `~/styles.css` e `~/analytics.js`.
- [x] Atualização do Módulo Principal:
  - [x] Substituir "Manifestações Abdominais - Tutoria" por "Febre, Inflamação e Infecção - Tutoria".
  - [x] Inserir links de Problema 01 a 04 no Drive.
- [x] Refinamento Solicitado pelo Usuário: Bloco "Outros":
  - [x] Consolidar Lacuna Zero, Conferências e TBL como subtópicos do card/bloco **"Outros"**.
  - [x] Garantir que o cabeçalho "Outros" **não seja clicável** (`cursor: default;`), sendo apenas os subtópicos clicáveis.
  - [x] Ajustar o card de Tutoria para conter Problemas 01 a 04.
  - [x] Atualizar filtros e responsividade.
- [x] Otimização de Localização dos Arquivos:
  - [x] Centralizar/sincronizar os arquivos do site dentro de `medhelp/` e manter link/espelhamento com `~/` para eliminar barreiras de permissão do IDE.
- [x] Validação visual e registro em `system_log.md`.

## FASE ANTERIOR: Subcapa / Seção de Abertura com Índice de Subtópicos por Objetivo (Item 11) - Concluído & Validado
- [x] Análise técnica comparativa: Orquestrador Híbrido vs. Prompt do NotebookLM (Concluída em `research.md`).
- [x] Alinhamento com o usuário: Escolha por Integração na Capa (Página 1) como Dashboard de Estudo.
- [x] Implementação no Orquestrador Híbrido:
  - [x] Atualização do schema `ObjetivoJSON` com `subtopicos: list[str] | None = None`.
  - [x] Enriquecimento do prompt OCANES da Célula 6 para síntese determinística de 3 a 5 subtópicos curtos baseados na pergunta norteadora.
  - [x] Implementação do componente visual de checklist no ReportLab (`_build_study_checklist`) na Célula 5.
  - [x] Inclusão da seção na renderização da Capa (`gerar_capa`) e no preview do console da Célula 7.
- [x] Teste de laboratório com dados reais de objetivos médicos (ex: H. pylori) e validação de 1 página A4 no ReportLab.
- [x] Revisão e Refatoração Crítica (/refactor): sanitização de prompt, escape XML e blindagem de layout.
- [x] Registro em `system_log.md`.

## FASE ANTERIOR: Extrator de Sumário Digital para NotebookLM (Concluído & Validado)
- [x] Pesquisa técnica na web sobre limitações do parser de PDF do NotebookLM (descarta `/Outlines`).
- [x] Brainstorming iterativo e validação do Understanding Lock com o usuário.
- [x] Definição de arquitetura: extração de Capítulos H1 e Seções-Mãe H2 em `.md` via PyMuPDF.
- [x] Criação do script `extrair_sumario_digital.py` em `scripts/python/` com suporte a arquivo único e lote.
- [x] Execução e validação na pasta real do usuário (`~/Downloads/Livros - Sumário Digital`).
- [x] Refatoração e blindagem final do Prompt OCANES (v5) com proteção de nome de fonte PDF (N5) e prioridade de sumário.
- [x] Validação em produção pelo usuário: extração de Objetivos 1 e 2 do Abbas 9ª Ed. com 100% de paridade manual e sem fragmentação.
- [x] Registro final em `system_log.md`.

## FASE ANTERIOR: Engenharia de Prompts (NotebookLM) — Roteiro de Evidências v5 (Sem Offset & Curadoria Top-Down)
- [x] Diagnóstico comparativo entre roteiro manual do usuário e extração automática do NotebookLM.
- [x] Especificação e arquitetura da simplificação sem offset em `research.md`.
- [x] Eliminação completa da lógica de offset a pedido do usuário (sem esforço matemático manual).
- [x] Refatoração do Prompt OCANES (v5) com Busca Curatorial Top-Down e Consolidação de Seções-Mãe.
- [x] Registro técnico no `system_log.md` e entrega do prompt simplificado para cópia no Obsidian.

## FASE ANTERIOR: Publicação dos Flashcards da Cognitiva 02 no Portal Medhelp
- [x] Adicionar link dos Flashcards da Cognitiva 02 no bloco Flashcards de `~/index.html`.
- [x] Validar estrutura HTML, atributos de acessibilidade e integração com `analytics.js`.
- [x] Registrar alteração em `system_log.md` e validar persistência no repositório.

## FASE ANTERIOR: Engenharia de Prompts OCANES V3 para Flashcards do NotebookLM
- [x] Diagnóstico da falha de renderização no NotebookLM (geração de LaTeX `$ > 3 \text{ cm} $` e aglutinação de linhas).
- [x] Reversão da abordagem de CAIXA ALTA conforme solicitação expressa do usuário (retorno à capitalização natural).
- [x] Refatoração do prompt no padrão estrito OCANES ([O], [C], [A], [N], [E], [S]).
- [x] Teste de laboratório e simulação com os casos reais de vias biliares.
- [x] Atualização da skill `publicar-flashcards-notebooklm/SKILL.md` e artefatos de documentação.
