# Tarefas do Projeto - Medhelp

- [x] [V.L.A.E.G.] Implementar Integração de Webhook Colab -> Apps Script
  - [x] **Visão**: Mapear entradas/saídas do webhook HTTP POST
  - [x] **Link**: Configurar endpoint seguro e propriedades do script
  - [x] **Arquitetura**: Modificar `Code.js` adicionando função `doPost(e)`
  - [x] **Estilo**: Padronizar logs de erro/sucesso do webhook
  - [x] **Gatilho**: Configurar acionador HTTP no Python do Google Colab
- [x] [Vigia] Testar o acionamento em lote via Webhook com dados de simulação
- [x] [A] Atualizar os caminhos físicos do Google Drive nos scripts do Colab e Apps Script
  - [x] Atualizar `pre-transcricao/Código.js` (`PREFIXO_AUDIO`)
  - [x] Atualizar `Transcribe.ipynb` (`PREFIXO_AUDIO`, `PASTA_SAIDA_DRIVE` e semestre `2026.2 - M6`)
  - [x] Atualizar `Roteiro_Tutoria.ipynb` (`PASTA_BASE` e semestre `2026.2 - M6` se aplicável)
- [x] [V.L.A.E.G.] Integração NotebookLM ↔ Antigravity via MCP
  - [x] **Visão**: Instalar e autenticar o servidor MCP do NotebookLM
  - [x] **Link**: Registrar o servidor no `mcp_config.json` do Antigravity
  - [x] **Arquitetura**: Criar Skill `tutoria-notebooklm` para roteiros de tutoria
  - [x] **Arquitetura**: Criar Skill `publicar-flashcards-notebooklm` para clientes
  - [x] **Estilo**: Incorporar os 3 prompts reais do usuário nas Skills
  - [x] **Gatilho**: Testar fluxo completo (listar e excluir cadernos validado via JSON-RPC e automações do backend)
- [x] [V.L.A.E.G.] Refatoração e Estabilização Geral do Apps Script
  - [x] **Visão**: Mapear dependências (API avançada do Drive, PropertiesService) e convenção final de nomes dos áudios.
  - [x] **Link**: Migrar as chaves hardcoded para propriedades do script (`PropertiesService`) e verificar autenticação.
  - [x] **Arquitetura**: Desenvolver a função `renomearAudiosBrutos()` no `pre-transcricao/Código.js`.
  - [x] **Arquitetura**: Revisar e adicionar guarda de timeout (4.5 min) e backoff no loop de flashcards (`flashcards/Código.js`).
  - [x] **Estilo**: Padronizar todos os logs do Apps Script seguindo o padrão master (`[INÍCIO]`, `[SUCESSO]`, `[ERRO]`).
  - [x] **Gatilho**: Testar o ciclo completo do pipeline de áudios renomeados sintéticos e validar a geração do código Python no Colab.
- [x] [V.L.A.E.G.] Organização em Subpastas por Disciplina nos Flashcards
  - [x] **Visão**: Mapear a lógica de criação e salvamento de arquivos em subpastas de destino no Drive.
  - [x] **Arquitetura**: Modificar as funções `saveMarkdown`, `saveMarkdownTutoria` e `checkIfFileExists` em `flashcards/Código.js` e `Código.js` da raiz.
  - [x] **Gatilho**: Executar push via `clasp` e testar a geração em lote verificando a separação por subpastas no Drive.


