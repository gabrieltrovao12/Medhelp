---
name: "medhelp-apps-script-master"
description: "Manual centralizado de desenvolvimento e diagnóstico em Google Apps Script para o Medhelp. Usar para criar novos scripts seguindo o protocolo V.L.A.E.G., adicionar tratamento de falhas (retry, backoff, timeout), e investigar travamentos de pipeline e erros de cotas de APIs via Google Drive."
---

# Skill: medhelp-apps-script-master (Desenvolvimento e Diagnóstico GAS)

## 1. Objetivo
Unificar a criação de código seguro no Google Apps Script com as melhores práticas de depuração e inspeção do sistema. Como quase todas as falhas de integração (Drive, Docs, Sheets, APIs externas) ocorrem na camada GAS, esta skill centraliza o "como construir" e o "como consertar".

## 2. Diagnóstico de Falhas (Troubleshooting Pipeline)
Quando o usuário relatar "um arquivo não processou", "o script parou" ou "falta o resumo", atue como um detetive de dados antes de supor bugs de código.

### 2.1. Onde Inspecionar?
Use a ferramenta MCP de Google Drive (`gdrive search`) para rastrear o caminho do arquivo:
1. **Pasta de Entrada** (ID: `1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh`): O arquivo `.txt` caiu aqui? Se não, a transcrição falhou ou ainda não rodou no Colab.
2. **Pasta Resumos_Prontos** (ID: `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6`): O resumo `.md` foi gerado? Se não, o erro está na automação principal de resumos.
3. **Pasta Arquivados** (ID: `1R58WOeO0p3U51T05g-d-N9svziLSf9fL`): O `.txt` foi movido para cá após o processamento?
4. **Pasta Flashcards** (ID: `1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA`): O .md do Anki foi criado?

> [!NOTE]
> Se a ferramenta MCP `gdrive search` apresentar timeouts ou falhas na IDE, você pode diagnosticar a existência dos arquivos localmente no diretório sincronizado pelo OverGrive: `/home/vvgfilhos/Gdrive/Logística - Drive/` (subpastas `/Flashcards`, `/Resumos_Prontos`, `/Arquivados`).

### 2.2. Causas Raízes Comuns no GAS
*   **Timeouts:** Scripts no GAS morrem em 6 minutos. Se processar lote grande, arquivos finais não serão processados.
*   **Limites de API (Erro 429):** O Gemini pode estourar as cotas (Flash: 15 RPM).
*   **Mapeamento de Regras:** O script de flashcards pulará arquivos que não batam com as regras de nomenclatura em `CONFIG.DISCIPLINAS`.

## 3. Protocolo de Desenvolvimento (V.L.A.E.G.)
Ao criar *novas* automações, implemente os 5 passos obrigatórios:

### V — Visão
Defina claramente Gatilho (Trigger), Entradas (Pastas IDs) e Saídas. Documente isso com o usuário antes de codar.

### L — Link
*   Teste de Credenciais. Nunca "hardcode" API Keys. Use `PropertiesService.getScriptProperties()`.
*   Cheque permissões de Drive, Docs ou Sheets.

### A — Arquitetura (Obrigatório em todo código)
Todo script GAS deve ter 5 seções bem delimitadas:
1.  **CONFIGURAÇÕES:** IDs de pastas, modelo de LLM, timeout máximo, retry config.
2.  **SYSTEM INSTRUCTION:** O prompt OCANES.
3.  **ORQUESTRADOR (Função Principal):** Com try/catch englobante.
4.  **INTEGRAÇÃO COM API:** Função genérica para chamar APIs (fetch).
5.  **UTILITÁRIOS:** Limpeza de nome, logging formatado, triggers auxiliares.

### E — Estilo e Logs
*   Faça logs robustos e tagueados: `[INÍCIO]`, `[SUCESSO]`, `[ESPERA]`, `[AVISO]`, `[ERRO]`, `[FATAL]`.
*   Para saídas em Markdown, formate com `##`, negritos estratégicos, tabelas sem markdown blocks desnecessários (` ``` `).

### G — Gatilhos e Proteção (O "Coração" da Estabilidade)
Nenhuma automação deve ser comitada sem as 4 proteções:
1.  **Guarda de Timeout:**
    ```javascript
    const tempoInicio = Date.now();
    // No loop:
    if (Date.now() - tempoInicio > (4.5 * 60 * 1000)) { 
        console.warn('[AVISO] Tempo limite de 4.5 min atingido.'); 
        break; 
    }
    ```
2.  **Exponential Backoff (Retry de Rede):**
    Quando houver erros de cota (429) ou erro 500, o script DEVE pausar de forma exponencial e tentar novamente (`Utilities.sleep(espera)`).
3.  **Pausa Preditiva (Throttling):**
    Entre as requisições em loop (arquivos processados), aplique uma trava fixa para respeitar limites da API (ex: 6 segundos para ficar abaixo de 15 RPM).
4.  **Try/Catch em I/O:**
    Qualquer `getBlob()`, `getDataAsString()` ou `UrlFetchApp` pode quebrar. Isole-os.

## 4. Checklist Final de Entrega
1. O objeto `CONFIG` centraliza as variáveis do ambiente (2026.2 - M6)?
2. A API Key está segura?
3. O Exponential Backoff está implementado?
4. A pausa preditiva está lá?
5. A proteção de 4.5 min foi incluída no loop?
6. O registro no `system_log.md` ou `task.md` local foi atualizado com a mudança?
