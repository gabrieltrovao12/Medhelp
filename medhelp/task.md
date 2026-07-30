# Tarefas do Projeto - Medhelp

## FASE ATUAL: Pipeline Ambulatório SOAP (Apps Script + Gemini API)

- [x] Criar projeto `scripts/apps-script/ambulatorio-soap/`
  - [x] `appsscript.json` — Manifesto do projeto
  - [x] `Code.js` — Código consolidado completo (Config, Prompt, API Client, Main, Logger)
- [x] Usuário: Informar ID da pasta do Google Drive para salvar os `.md`
- [x] Usuário: Configurar `GEMINI_API_KEY` nas Propriedades do Script do formulário
- [x] Usuário: Vincular trigger `onFormSubmit` no Editor de Script
- [x] Teste laboratorial com dados sintéticos no celular

## FASE ANTERIOR: Correções do Orquestrador Automático de Tutoria (PBL)

- [x] Alteração 1: Redesenhar layout da capa em ReportLab (`create_cover_page`) com cálculo de Y dinâmico.
- [x] Alteração 2: Implementar filtro estrito de idioma PT-BR (Prompt + Backend) no Curador de Vídeos.
- [x] Alteração 3: Adicionar trava defensiva `pagina_final > pagina_inicial` em Python e regra no prompt `process_roteiro`.
- [x] Alteração 4: Implementar reconciliação defensiva `reconciliar_e_calcular_limites_corte` (Self-Healing) e prompt OCANES para alinhamento estrito de Páginas Físicas do PDF vs Impressas.
- [x] Regenerar `Orquestrador_Automatico.ipynb` executando `generate_notebook.py` e testar a sintaxe.

## FASE ANTERIOR: Subagente Curador do YouTube (POC Local)

- [x] Documentar o escopo do Curador no `research.md`.
- [x] Atualizar `teste_youtube_curator.py` para usar requests e a API Real do YouTube.
- [x] Testar a execução do script laboratorial localmente.
- [x] Mapear integração final para o orquestrador (Apps Script - automacao-transcricoes).
- [x] Módulo GeminiClient: Adicionar suporte a JSON Estruturado.
- [x] Módulo YouTubeCurator: Implementar buscas na API e curadoria com OCANES.
- [x] Módulo Main: Orquestrar a injeção do rodapé no Resumo gerado.

## FASE ANTERIOR: Resolução de Bugs Críticos de Automação

- [x] Corrigir modelo Gemini inexistente (`gemini-3.5-flash` para `gemini-2.5-flash`) em `medhelp-flashcards/Config.js`.
- [x] Integrar acionamento de Webhook no Colab (`Transcribe.ipynb`) ao final da Célula 4.
- [x] Criar rotina de inicialização de Triggers (`Setup.js`) para automatizar os Flashcards.

## FASE ANTERIOR: Refatoração Profissional - Automação de Transcrições (VLAEG)

- [x] Dividir `Code.js` em múltiplos módulos funcionais (`Config.js`, `Prompt.js`, `GeminiClient.js`, `DriveManager.js`, `Main.js`).
- [x] Aplicar padrões de JSDoc, Logging Avançado e tratamento de bordas (Exponential Backoff e Pausa Preditiva).
- [x] Configurar `.clasp.json` (mantido o existente do usuário).
- [x] Excluir o antigo monolito `Code.js`.
- [x] O usuário fará o push final e revisão via `clasp push`.
- [x] **[NOVO]** Abandono e deleção oficial da pasta `pre-transcricao/`. O setup "Célula 3" agora será feito manualmente pelo usuário no Colab.
- [x] **[NOVO]** Remoção completa da integração do Gemini (Priming Automático) do `Transcribe.ipynb` e migração de `openai-whisper` para `faster-whisper` (CTranslate2) na Célula 4, garantindo otimização de velocidade e memória sem perda de qualidade.

## FASE ATUAL: Integração do Vigia Local (Antigravity SDK) - [CANCELADA]

- [x] Definir regras de negócio (pasta de entrada, roteamento de cadernos e auth) com o usuário.
- [x] Cancelamento: Usuário percebeu que a automação em background (Vigia) não atende a necessidade de velocidade do fluxo de tutoria.

## FASE ATUAL: Orquestrador Acadêmico com Subagentes (SDK)

- [x] Criar `scripts/orquestrador_academico.py` com schemas Pydantic e lógica de subagentes.
- [x] Criar ou atualizar `requirements.txt` com `google-antigravity`.
- [x] Refatorar a skill `criar-flashcards/SKILL.md` para acionar o orquestrador localmente.
- [x] Refatorar a skill `elaborar-questoes-prova/SKILL.md` para acionar o orquestrador localmente.
- [ ] Realizar teste laboratorial do script (a ser feito pelo usuário ao demandar a skill).

## FASE ATUAL: Estrutura e Organização do Repositório

- [x] Migrar pasta de projetos pessoais para `~/medhelp/pessoal` (fora da sincronização problemática do Overgrive e agora sob versionamento direto no GitHub do projeto).

## FASE ANTERIOR: Unificação do Sistema de Flashcards no Apps Script (VLAEG)

- [x] Desenhar a arquitetura de unificação (Monolito Modular).
- [x] Criar os arquivos utilitários base: `Config.js`, `DriveUtils.js`, `NamingUtils.js`, `GeminiAPI.js`.
- [x] Criar os gatilhos independentes: `Trigger_Resumos.js` e `Trigger_Tutoria.js`.
- [ ] Revisão, testes de sintaxe e submissão dos novos scripts pelo painel web do Apps Script (Ação do Usuário).
