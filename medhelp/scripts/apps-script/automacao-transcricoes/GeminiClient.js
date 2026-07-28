/**
 * GeminiClient.js
 * Gerencia a comunicação com a API do Google Gemini, incluindo o tratamento de rede,
 * Exponential Backoff e proteção contra limites de cota (429).
 */

/**
 * Envia o texto para o Gemini e retorna o resumo gerado.
 * Implementa Exponential Backoff para erros de cota (429) e servidor (5xx).
 *
 * @param {string} texto        - Conteúdo bruto do .txt (transcrição + slides)
 * @param {string} nomeArquivo  - Nome do arquivo (para logging e metadados)
 * @param {string} apiKey       - Chave da API Gemini
 * @returns {string|null}       - Texto do resumo gerado, ou null em caso de falha
 */
function chamarGeminiAPI(texto, nomeArquivo, apiKey, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  // Injeta metadados úteis no prompt para o modelo preencher o cabeçalho do .md
  const dataHoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const promptUsuario = `**NOME DO ARQUIVO:** ${nomeArquivo}\n**DATA:** ${dataHoje}\n\n**ARQUIVO BRUTO PARA PROCESSAMENTO:**\n\n${texto}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [{
      parts: [{ text: promptUsuario }]
    }],
    generationConfig: {
      temperature: 0.2  // Baixa temperatura para máximo determinismo clínico
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true  // Capturamos os erros manualmente no loop para tratar 429 e 5xx
  };

  for (let tentativa = 1; tentativa <= CONFIG.MAX_RETRIES; tentativa++) {
    console.log(`[API] Tentativa ${tentativa}/${CONFIG.MAX_RETRIES} para "${nomeArquivo}"...`);

    const response = UrlFetchApp.fetch(url, options);
    const code     = response.getResponseCode();

    // --- Sucesso ---
    if (code === 200) {
      try {
        const json = JSON.parse(response.getContentText());

        // Guarda de segurança: verifica se o Gemini bloqueou a resposta (safety filters)
        if (!json.candidates || json.candidates.length === 0) {
          console.error(`[ERRO] A API retornou 200 mas sem candidatos. Possível bloqueio por filtros de segurança. ` +
                        `Resposta: ${response.getContentText().substring(0, 300)}`);
          return null;
        }

        // Guarda de segurança: verifica se o conteúdo existe
        const candidate = json.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error(`[ERRO] Candidato retornado sem conteúdo. finishReason: ${candidate.finishReason}`);
          return null;
        }

        console.log(`[API] Sucesso na tentativa ${tentativa}.`);
        return candidate.content.parts[0].text;

      } catch (e) {
        console.error(`[ERRO] Falha ao parsear a resposta JSON da API: ${e.message}`);
        return null;
      }
    }

    // --- Cota excedida (429): espera fixa de 62s para limpar janela de 1 minuto ---
    else if (code === 429) {
      const espera = 62000; // O tempo de backoff para o rate limit (15 RPM)
      console.warn(`[429] Cota excedida. Tentativa ${tentativa}/${CONFIG.MAX_RETRIES}. ` +
                   `Hibernando ${espera / 1000}s para reset da janela da API...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    }

    // --- Erro de servidor (5xx): Exponential Backoff com Jitter ---
    else if (code >= 500) {
      const espera = Math.pow(2, tentativa) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`[${code}] Erro no servidor do Google. Tentativa ${tentativa}/${CONFIG.MAX_RETRIES}. ` +
                   `Aguardando ${Math.round(espera / 1000)}s...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    }

    // --- Erro fatal (4xx que não seja 429): sem retry ---
    else {
      console.error(`[FATAL HTTP ${code}] Erro não recuperável: ${response.getContentText().substring(0, 500)}`);
      return null;
    }
  }

  console.error(`[ESGOTADO] ${CONFIG.MAX_RETRIES} tentativas falharam para "${nomeArquivo}". ` +
                'Se o erro for 429 persistente, considere reduzir a frequência do trigger.');
  return null;
}

/**
 * Envia o texto para o Gemini e retorna um objeto JSON parseado.
 * Implementa as mesmas regras de Exponential Backoff.
 *
 * @param {string} promptUsuario - Prompt a ser avaliado
 * @param {string} apiKey - Chave da API Gemini
 * @param {string} systemInstruction - O prompt de sistema rigoroso
 * @returns {Object|null} - Objeto JSON, ou null em caso de falha
 */
function chamarGeminiJSON(promptUsuario, apiKey, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [{
      parts: [{ text: promptUsuario }]
    }],
    generationConfig: {
      temperature: 0.0, // Curadoria determinística
      response_mime_type: "application/json"
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  for (let tentativa = 1; tentativa <= CONFIG.MAX_RETRIES; tentativa++) {
    console.log(`[API JSON] Tentativa ${tentativa}/${CONFIG.MAX_RETRIES}...`);

    const response = UrlFetchApp.fetch(url, options);
    const code     = response.getResponseCode();

    if (code === 200) {
      try {
        const json = JSON.parse(response.getContentText());
        const candidate = json.candidates && json.candidates[0];
        
        if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error(`[ERRO JSON] Candidato inválido. Resposta: ${response.getContentText().substring(0, 300)}`);
          return null;
        }

        const textoRetorno = candidate.content.parts[0].text;
        return JSON.parse(textoRetorno);

      } catch (e) {
        console.error(`[ERRO JSON] Falha ao parsear JSON final: ${e.message}`);
        return null;
      }
    } else if (code === 429) {
      const espera = 62000;
      console.warn(`[429 JSON] Cota excedida. Hibernando ${espera / 1000}s...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    } else if (code >= 500) {
      const espera = Math.pow(2, tentativa) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`[${code} JSON] Erro servidor. Aguardando ${Math.round(espera / 1000)}s...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    } else {
      console.error(`[FATAL HTTP ${code} JSON] Erro não recuperável: ${response.getContentText().substring(0, 500)}`);
      return null;
    }
  }

  console.error(`[ESGOTADO JSON] ${CONFIG.MAX_RETRIES} tentativas falharam.`);
  return null;
}

/**
 * Utilitário de diagnóstico manual para validar conexão com a API e o Prompt.
 */
function testarConexaoAPI() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[TESTE] GEMINI_API_KEY não encontrada nas Properties do script.');
    return;
  }

  const textoTeste = `**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
Então, pessoal, hoje vamos falar sobre hipertensão portal. Isso vai cair na prova, prestem atenção.
A hipertensão portal causa aumento da pressão hidrostática, levando à ascite.

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
Slide 1 - Hipertensão Portal: Aumento da pressão no sistema venoso portal (>10 mmHg).
Consequências: ascite, varizes esofágicas, esplenomegalia.`;

  console.log('[TESTE] Enviando prompt de diagnóstico...');
  const resultado = chamarGeminiAPI(textoTeste, 'TESTE_DIAGNOSTICO', apiKey, SYSTEM_INSTRUCTION_TEORIA);

  if (resultado) {
    console.log('[TESTE] Conexão bem-sucedida. Resposta truncada:');
    console.log(resultado.substring(0, 500));
  } else {
    console.error('[TESTE] Falha na conexão. Verifique a API key e o modelo configurado no Config.js.');
  }
}
