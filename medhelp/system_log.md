# Log de Sistema - Medhelp

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
