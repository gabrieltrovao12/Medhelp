// ============================================================
// INTEGRAÇÃO DE REDE COM O GEMINI API (VLAEG Compliant)
// ============================================================

const GeminiAPI = {
  
  _buildUrl: function(apiKey) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
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
   * Chamada com Exponential Backoff with Full Jitter e Graceful Exit.
   */
  fetchWithRetry: function(payload, apiKey) {
    const url = this._buildUrl(apiKey);
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const startTime = Date.now();
    const MAX_EXECUTION_TIME_MS = 300000; // Limite de 5 min (GAS mata em 6 min)
    const BASE_DELAY_MS = 1000;
    const CAP_DELAY_MS = 60000;
    
    let attempt = 1;

    while (true) {
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

      if (statusCode === 200) {
        if (!jsonResponse.candidates || jsonResponse.candidates.length === 0 || !jsonResponse.candidates[0].content || !jsonResponse.candidates[0].content.parts || jsonResponse.candidates[0].content.parts.length === 0) {
          throw new Error(`Resposta vazia ou bloqueada. Detalhes: ${jsonResponse.promptFeedback?.blockReason || 'desconhecido'}`);
        }
        return jsonResponse.candidates[0].content.parts[0].text;
      }

      if (errorCode === 400 || errorCode === 401) {
        throw new Error(`Erro Crítico [HTTP ${errorCode}]: Cancelamento Imediato. Propagação: ${responseText}`);
      }

      if (errorCode === 503 || errorCode === 429) {
        const elapsedMs = Date.now() - startTime;
        
        if (elapsedMs >= MAX_EXECUTION_TIME_MS) {
          throw new Error(`Runtime Safety Timeout: O orçamento cronometrado (${elapsedMs}ms) estoirou o teto de 300 segundos. Saída limpa forçada executada.`);
        }

        const tempCap = Math.min(CAP_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
        const sleepMs = Math.random() * tempCap; // Full Jitter

        if (elapsedMs + sleepMs >= MAX_EXECUTION_TIME_MS) {
          throw new Error(`Runtime Safety Timeout Intercetado: Adicionar sono de ${Math.round(sleepMs)}ms provocaria colapso do sistema (teto 300s). Saída forçada processada.`);
        }

        console.warn(`[HTTP ${errorCode}] Falha de rede. Tentativa nº ${attempt}: Suspensão mitigadora "Full Jitter" durante ${Math.round(sleepMs)}ms.`);
        
        Utilities.sleep(sleepMs);
        attempt++;
      } else {
        // Fallback genérico para outros erros 5xx (mesma lógica do Jitter)
        if (errorCode >= 500) {
           const elapsedMs = Date.now() - startTime;
           if (elapsedMs >= MAX_EXECUTION_TIME_MS) {
             throw new Error(`Runtime Safety Timeout: Erro Interno ${errorCode}.`);
           }
           const tempCap = Math.min(CAP_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
           const sleepMs = Math.random() * tempCap;
           if (elapsedMs + sleepMs >= MAX_EXECUTION_TIME_MS) {
             throw new Error(`Runtime Safety Timeout Intercetado.`);
           }
           console.warn(`[HTTP ${errorCode}] Erro genérico no servidor. Tentativa ${attempt}. Aguardando ${Math.round(sleepMs)}ms.`);
           Utilities.sleep(sleepMs);
           attempt++;
        } else {
           throw new Error(`Erro não-transiente [HTTP ${errorCode}]: ${responseText}`);
        }
      }
    }
  },

  gerarApenasTexto: function(textoBruto, disciplina, apiKey) {
    const payload = {
      contents: [{ parts: [{ text: PROMPTS.buildPromptResumos(textoBruto, disciplina) }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
      safetySettings: this._getSafetySettings()
    };
    return this.fetchWithRetry(payload, apiKey);
  },

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
