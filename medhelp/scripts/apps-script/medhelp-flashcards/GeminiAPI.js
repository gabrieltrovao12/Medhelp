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
   * Chamada genérica com Exponential Backoff
   */
  fetchWithRetry: function(payload, apiKey) {
    const url = this._buildUrl(apiKey);
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const ESPERAS_MS = [60000, 90000, 120000];

    for (let tentativa = 1; tentativa <= CONFIG.MAX_RETRIES; tentativa++) {
      try {
        const response = UrlFetchApp.fetch(url, options);
        const statusCode = response.getResponseCode();

        if (statusCode === 200) {
          const json = JSON.parse(response.getContentText());
          if (!json.candidates || json.candidates.length === 0 || !json.candidates[0].content || !json.candidates[0].content.parts || json.candidates[0].content.parts.length === 0) {
            throw new Error(`Resposta vazia ou bloqueada. Detalhes: ${json.promptFeedback?.blockReason || 'desconhecido'}`);
          }
          return json.candidates[0].content.parts[0].text;
        }

        if ((statusCode === 429 || statusCode === 503) && tentativa < CONFIG.MAX_RETRIES) {
          let esperaMs = ESPERAS_MS[tentativa - 1] || 120000;
          console.warn(`[AVISO HTTP ${statusCode}] Cota ou sobrecarga. Aguardando ${Math.round(esperaMs/1000)}s (Tentativa ${tentativa}/${CONFIG.MAX_RETRIES})...`);
          Utilities.sleep(esperaMs);
          continue;
        }

        // Se erro 500 normal
        if (statusCode >= 500 && tentativa < CONFIG.MAX_RETRIES) {
          const espera = Math.pow(2, tentativa) * 1000 + Math.floor(Math.random() * 500); // Jitter
          console.warn(`[AVISO HTTP ${statusCode}] Erro interno. Aguardando ${Math.round(espera/1000)}s...`);
          Utilities.sleep(espera);
          continue;
        }

        throw new Error(`Servidor HTTP ${statusCode}: ${response.getContentText()}`);
      } catch (err) {
        console.error(`[ERRO DE REDE] Tentativa ${tentativa}: ${err.message}`);
        if (tentativa === CONFIG.MAX_RETRIES) throw err;
        Utilities.sleep(15000 * tentativa);
      }
    }
    return null;
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
