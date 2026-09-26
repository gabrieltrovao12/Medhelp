# Tarefas do Projeto - Medhelp

## FASE ATUAL: Crivo do Google Analytics & Dashboard Looker Studio (Item 15) - Concluído & Validado
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
