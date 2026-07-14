# Tarefas do Projeto - Medhelp

## FASE ATUAL: Refatoração Profissional - Automação de Transcrições (VLAEG)

- [x] Dividir `Code.js` em múltiplos módulos funcionais (`Config.js`, `Prompt.js`, `GeminiClient.js`, `DriveManager.js`, `Main.js`).
- [x] Aplicar padrões de JSDoc, Logging Avançado e tratamento de bordas (Exponential Backoff e Pausa Preditiva).
- [x] Configurar `.clasp.json` (mantido o existente do usuário).
- [x] Excluir o antigo monolito `Code.js`.
- [x] O usuário fará o push final e revisão via `clasp push`.

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
