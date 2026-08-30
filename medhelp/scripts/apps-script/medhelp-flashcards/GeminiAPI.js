// ============================================================
// INTEGRAÇÃO DE REDE COM O GEMINI API (VLAEG Compliant)
// ============================================================

const GeminiAPI = {
  
  _buildUrl: function(model, apiKey) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  },

  _getSafetySettings: function() {
    return [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ];
  },

  /**
   * Chamada com Exponential Backoff, Full Jitter, Graceful Exit e Model Cascade.
   * Tenta cada modelo em CONFIG.GEMINI_MODELS sequencialmente.
   * Se um modelo esgota os retries ou retorna 404, avança para o próximo.
   * @param {Object} payload 
   * @param {string} apiKey 
   * @returns {string}
   */
  fetchWithRetry: function(payload, apiKey) {
    const models = CONFIG.GEMINI_MODELS;
    const MAX_EXECUTION_TIME_MS = 300000; // Limite de 5 min (GAS mata em 6 min)
    const BASE_DELAY_MS = 1000;
    const CAP_DELAY_MS = 60000;
    const globalStartTime = Date.now();
    let lastError = null;

    for (let modelIdx = 0; modelIdx < models.length; modelIdx++) {
      const currentModel = models[modelIdx];
      const url = this._buildUrl(currentModel, apiKey);
      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      let attempt = 1;

      while (attempt <= CONFIG.MAX_RETRIES) {
        // Verificação de tempo global antes de cada tentativa
        const elapsedMs = Date.now() - globalStartTime;
        if (elapsedMs >= MAX_EXECUTION_TIME_MS) {
          throw new Error(`Runtime Safety Timeout: Orçamento cronometrado (${elapsedMs}ms) excedeu o teto de 300s. Último modelo: ${currentModel}.`);
        }

        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();
        const responseText = response.getContentText();

        let jsonResponse;
        try {
          jsonResponse = JSON.parse(responseText);
        } catch (e) {
          jsonResponse = { error: { code: statusCode, message: responseText } };
        }

        const errorCode = (jsonResponse.error && jsonResponse.error.code) ? jsonResponse.error.code : statusCode;

        // --- Sucesso ---
        if (statusCode === 200) {
          if (!jsonResponse.candidates || jsonResponse.candidates.length === 0 || !jsonResponse.candidates[0].content || !jsonResponse.candidates[0].content.parts || jsonResponse.candidates[0].content.parts.length === 0) {
            throw new Error(`Resposta vazia ou bloqueada. Detalhes: ${jsonResponse.promptFeedback?.blockReason || 'desconhecido'}. Modelo: ${currentModel}`);
          }
          if (modelIdx > 0) {
            console.info(`[MODEL CASCADE] Sucesso com modelo de fallback: ${currentModel} (posição ${modelIdx + 1}/${models.length}).`);
          }
          return jsonResponse.candidates[0].content.parts[0].text;
        }

        // --- Erros Fatais (não há sentido em retries) ---
        if (errorCode === 400 || errorCode === 401) {
          throw new Error(`Erro Crítico [HTTP ${errorCode}]: Cancelamento Imediato. Modelo: ${currentModel}. Detalhes: ${responseText}`);
        }

        // --- Modelo não encontrado: pula direto para o próximo ---
        if (errorCode === 404) {
          console.warn(`[MODEL CASCADE] Modelo "${currentModel}" retornou 404 (não encontrado). Avançando para o próximo.`);
          lastError = new Error(`Modelo "${currentModel}" não encontrado (404).`);
          break; // Sai do while, vai pro próximo modelo
        }

        // --- Erros transientes (429, 503, 5xx): backoff com jitter ---
        if (errorCode === 429 || errorCode === 503 || errorCode >= 500) {
          const tempCap = Math.min(CAP_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
          const sleepMs = Math.random() * tempCap; // Full Jitter

          const projectedElapsed = (Date.now() - globalStartTime) + sleepMs;
          if (projectedElapsed >= MAX_EXECUTION_TIME_MS) {
            console.warn(`[MODEL CASCADE] Timeout iminente com modelo "${currentModel}". Tentando próximo modelo.`);
            lastError = new Error(`Timeout iminente no modelo "${currentModel}" após ${attempt} tentativas.`);
            break; // Sai do while, vai pro próximo modelo
          }

          console.warn(`[HTTP ${errorCode}] Modelo: ${currentModel} | Tentativa ${attempt}/${CONFIG.MAX_RETRIES} | Suspensão Full Jitter: ${Math.round(sleepMs)}ms.`);
          Utilities.sleep(sleepMs);
          attempt++;
        } else {
          // Erro desconhecido não-transiente
          lastError = new Error(`Erro não-transiente [HTTP ${errorCode}] no modelo "${currentModel}": ${responseText}`);
          break; // Sai do while, tenta próximo modelo
        }
      }

      // Se esgotou retries sem sucesso para este modelo
      if (attempt > CONFIG.MAX_RETRIES) {
        console.warn(`[MODEL CASCADE] Modelo "${currentModel}" esgotou ${CONFIG.MAX_RETRIES} tentativas. Avançando para o próximo.`);
        lastError = new Error(`Modelo "${currentModel}" esgotou todas as ${CONFIG.MAX_RETRIES} tentativas.`);
      }
    }

    // Se todos os modelos falharam
    throw new Error(`[MODEL CASCADE FALHA TOTAL] Todos os ${models.length} modelos falharam. Último erro: ${lastError ? lastError.message : 'desconhecido'}. Modelos tentados: ${models.join(', ')}.`);
  },

  /**
   * Gera flashcards a partir de texto markdown de resumos.
   * @param {string} textoBruto 
   * @param {string} disciplina 
   * @param {string} apiKey 
   * @returns {string}
   */
  gerarApenasTexto: function(textoBruto, disciplina, apiKey) {
    const payload = {
      contents: [{ parts: [{ text: PROMPTS.buildPromptResumos(textoBruto, disciplina) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
      safetySettings: this._getSafetySettings()
    };
    return this.fetchWithRetry(payload, apiKey);
  },

  /**
   * Gera flashcards a partir de extração em PDF de tutoria.
   * @param {string} pdfBase64 
   * @param {string} nomeArquivo 
   * @param {number} limiteCards 
   * @param {string} apiKey 
   * @returns {string}
   */
  gerarComPDF: function(pdfBase64, nomeArquivo, limiteCards, apiKey) {
    const payload = {
      contents: [{
        parts: [
          { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
          { text: PROMPTS.buildPromptTutoria(nomeArquivo, limiteCards) }
        ]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
      safetySettings: this._getSafetySettings()
    };
    return this.fetchWithRetry(payload, apiKey);
  }
};
