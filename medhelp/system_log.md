# Log de Sistema - Medhelp

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
