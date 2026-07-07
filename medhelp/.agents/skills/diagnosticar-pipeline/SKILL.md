---
name: "Diagnosticar Pipeline Medhelp"
description: "Diagnosticar, investigar e resolver falhas no pipeline de automação do Medhelp. Usar quando o usuário reportar que uma aula não gerou resumo, flashcards não apareceram, transcrição falhou, arquivo não foi processado, arquivo não foi arquivado, áudio não foi deletado, ou qualquer outro problema no fluxo de dados entre Colab, Apps Script e Google Drive. Também ativar para: pipeline parou, erro no Gemini, erro 429, timeout, arquivo sumiu, pasta vazia, resumo incompleto, flashcard duplicado."
---

# Skill: Diagnosticar Pipeline Medhelp

## Objetivo
Investigar falhas no pipeline de automação do Medhelp de forma estruturada, identificando a causa-raiz com o mínimo de perguntas ao usuário e o máximo de inspeção direta nos arquivos e pastas do Google Drive.

## Mapa do Pipeline (Referência Rápida)

```
[1. PRÉ-TRANSCRIÇÃO]          [2. TRANSCRIÇÃO]              [3. RESUMO]                  [4. FLASHCARDS]
pre-transcricao/Código.js  →  Transcribe.ipynb (Colab)  →   automacao-transcricoes/    →  flashcards/Código.js
                                                              Code.js
Varre áudios + slides         Whisper large-v3               Gemini 2.5-flash             Gemini 2.5-flash
Gera bloco Python             Gera .txt no Drive             Gera .md no Drive            Gera .md no Drive
                              (pasta: Transcricoes_Med)      (pasta: Resumos_Prontos)     (pasta: Flashcards)
```

### IDs das Pastas do Drive (Fonte de Verdade)

| Pasta | ID | Usado por |
|:---|:---|:---|
| Entrada (`.txt` brutos) | `1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh` | Code.js (leitura) |
| Resumos Prontos (`.md`) | `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6` | Code.js (escrita) / flashcards (leitura) |
| Arquivados (`.txt` processados) | `1R58WOeO0p3U51T05g-d-N9svziLSf9fL` | Code.js (movimentação) |
| Áudios | `1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC` | Code.js (exclusão pós-processamento) |
| Flashcards (`.md`) | `1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA` | flashcards/Código.js (escrita) |
| Tutoria PDFs | `1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB` | flashcards/Código.js (leitura) |
| Slides (raiz) | `1Xt4bqNvrS90myX54prN96pkFX5XOyVqv` | pre-transcricao (leitura recursiva) |

## Protocolo de Diagnóstico

### ETAPA 1 — Localizar o Ponto de Falha

Perguntar ao usuário (se não estiver claro no pedido):
- **Qual aula** apresentou o problema? (nome ou tema)
- **Qual etapa falhou?** (transcrição / resumo / flashcard / todas)

Se o usuário não souber qual etapa falhou, executar a investigação completa na ordem abaixo.

### ETAPA 2 — Inspeção Direta no Google Drive (via MCP)

Usar o MCP do Google Drive (`gdrive/search`) para verificar a presença física dos arquivos em cada estágio do pipeline:

#### Checklist de Investigação:

**2.1 — O arquivo `.txt` bruto existe na pasta de Entrada?**
```
gdrive search: "[nome da aula]" 
```
- ✅ Se encontrar o `.txt` na pasta de Entrada → o Colab fez o trabalho, mas o Apps Script não consumiu.
- ❌ Se NÃO encontrar → verificar se está na pasta de Arquivados (foi processado e movido) ou se o Colab nunca gerou.

**2.2 — O arquivo `.md` de resumo existe na pasta Resumos_Prontos?**
```
gdrive search: "[nome da aula] Resumo"
```
- ✅ Se encontrar → o resumo foi gerado. O problema está na etapa de flashcards.
- ❌ Se NÃO encontrar → o Apps Script de resumos falhou. Investigar causa (ver Etapa 3).

**2.3 — O arquivo `.md` de flashcards existe na pasta de Flashcards?**
```
gdrive search: "[nome da aula] Flashcards"
```
- ✅ Se encontrar → pipeline completo. O problema pode ser de sincronização com o Obsidian.
- ❌ Se NÃO encontrar → o Apps Script de flashcards falhou. Investigar causa (ver Etapa 3).

**2.4 — O áudio original ainda existe?**
```
gdrive search: "[nome da aula]" (filtrar por .m4a/.mp3)
```
- Se o áudio ainda existir e o resumo já foi gerado → a função `excluirAudiosDaAula()` falhou.

### ETAPA 3 — Análise de Causa-Raiz

Com base nos resultados da Etapa 2, seguir a árvore de decisão:

#### Cenário A: `.txt` existe na Entrada mas `.md` NÃO foi gerado
**Causas prováveis (verificar nesta ordem):**
1. **Nome do arquivo malformado**: O regex de limpeza (`/^\d+\s*-\s*(?:[^-]+-\s*)?/`) não conseguiu extrair o nome limpo.
   - Verificar: Ler o conteúdo do nome do arquivo e simular o regex.
2. **Encoding inválido**: O arquivo não está em UTF-8.
   - Verificar: Usar `gdrive` para ler o conteúdo e inspecionar caracteres estranhos.
3. **Erro 429 (cota da API Gemini)**: O script atingiu o limite de requisições.
   - Verificar: Perguntar ao usuário se houve erro nos logs do Apps Script.
4. **Timeout do GAS (6 min)**: O script foi interrompido antes de processar todos os arquivos.
   - Verificar: O arquivo está no final da fila? (os primeiros da fila foram processados?)
5. **Conteúdo vazio ou corrompido**: O `.txt` não contém texto suficiente para gerar resumo.
   - Verificar: Ler o conteúdo via Drive e checar volume de texto.

#### Cenário B: `.md` de resumo existe mas flashcards NÃO foram gerados
**Causas prováveis:**
1. **Janela de tempo expirada**: O `HORAS_RECENTES` (168h / 7 dias) pode ter expirado.
   - Verificar: Checar a data de criação do `.md` no Drive.
2. **Arquivo duplicado detectado**: O script de flashcards pula arquivos já processados.
   - Verificar: Buscar se já existe um `[nome] - Flashcards.md` na pasta de destino.
3. **Mapeamento de disciplina falhou**: O nome do arquivo não contém nenhuma palavra-chave do objeto `DISCIPLINAS` no CONFIG.
   - Verificar: Comparar o nome do arquivo com as chaves em `CONFIG.DISCIPLINAS`.

#### Cenário C: Nenhum arquivo encontrado em nenhuma pasta
**Causas prováveis:**
1. **O Colab não foi executado**: O notebook `Transcribe.ipynb` não foi rodado.
2. **Caminho do áudio/PDF incorreto**: Os caminhos configurados na Célula 3 estão errados.
3. **Whisper falhou silenciosamente**: O modelo não conseguiu transcrever o áudio.

### ETAPA 4 — Propor Solução

Após identificar a causa-raiz:
1. **Propor a correção** ao usuário com detalhes técnicos.
2. **Se for um bug no código**: Seguir o protocolo de edição normal (diff + aprovação).
3. **Se for um problema operacional** (arquivo fora do lugar, encoding errado): Instruir o usuário sobre como resolver manualmente.
4. **Registrar o diagnóstico** no arquivo `system_log.md` com:
   - Data e hora do diagnóstico.
   - Aula afetada.
   - Etapa do pipeline que falhou.
   - Causa-raiz identificada.
   - Solução aplicada ou proposta.

## Regras de Segurança

- **NUNCA** deletar arquivos do Drive do usuário sem autorização explícita.
- **NUNCA** mover arquivos entre pastas do Drive sem autorização explícita.
- **NUNCA** assumir que o problema é no código sem antes verificar o estado dos arquivos no Drive.
- Priorizar sempre a inspeção direta (via MCP) sobre suposições teóricas.
