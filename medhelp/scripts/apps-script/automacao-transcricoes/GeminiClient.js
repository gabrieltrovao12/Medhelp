/**
 * GeminiClient.js
 * Gerencia a comunicação com a API do Google Gemini, incluindo o tratamento de rede,
 * Exponential Backoff com Full Jitter e proteção contra limites de cota (429 e 503).
 */

/**
 * Wrapper de execução estritamente síncrona para Google Apps Script desenhado 
 * para consumo da arquitetura da Gemini API.
 * 
 * Implementa a neutralização 'Exponential Backoff with Full Jitter' exclusivamente 
 * para anomalias HTTP 503 (Alta Demanda) e HTTP 429 (Quota de Taxa Excedida).
 * Respeita CONFIG.MAX_RETRIES por modelo e escala automaticamente pela cadeia
 * CONFIG.MODELOS_FALLBACK[] quando o modelo ativo esgota as tentativas.
 * Possui vigilância nativa sobre o ciclo de vida do Wall-Clock, forçando 
 * um Graceful Exit à marca dos 300 segundos para proteger os sistemas de um crash GWS.
 * 
 * @param {string} url Endpoint HTTP REST da API do Gemini (com modelo primário).
 * @param {object} payload Configuração nativa JSON do prompt do LLM.
 * @param {number} [fallbackIndex=-1] Índice atual na cadeia MODELOS_FALLBACK (-1 = primário).
 * @returns {object} Corpo JSON deserializado do payload inferido.
 */
function fetchGeminiWithResilience(url, payload, fallbackIndex) {
  const startTime = Date.now();
  const MAX_EXECUTION_TIME_MS = 300000; // Limite de 5 min (GAS mata em 6 min)
  const BASE_DELAY_MS = 1000;
  const CAP_DELAY_MS = 60000;
  const maxRetries = CONFIG.MAX_RETRIES || 4;
  const fallbackChain = CONFIG.MODELOS_FALLBACK || [];
  const currentIndex = (fallbackIndex === undefined || fallbackIndex === null) ? -1 : fallbackIndex;

  // Determina modelo e URL ativa
  let activeUrl = url;
  let modeloAtivo = CONFIG.MODELO_GEMINI;
  if (currentIndex >= 0 && currentIndex < fallbackChain.length) {
    modeloAtivo = fallbackChain[currentIndex];
    activeUrl = url.replace(/models\/[^:]+:/, `models/${modeloAtivo}:`);
    console.log(`[FALLBACK ${currentIndex + 1}/${fallbackChain.length}] Escalando para: ${modeloAtivo}`);
  }
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true 
  };

  let attempt = 1;

  while (attempt <= maxRetries) {
    const response = UrlFetchApp.fetch(activeUrl, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      jsonResponse = { error: { code: statusCode, message: responseText } };
    }

    const errorCode = (jsonResponse.error && jsonResponse.error.code) ? jsonResponse.error.code : statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      if (currentIndex >= 0) {
        console.log(`[FALLBACK] Sucesso via modelo alternativo: ${modeloAtivo}`);
      }
      return jsonResponse;
    }

    if (errorCode === 400 || errorCode === 401) {
      throw new Error(`Erro Crítico [HTTP ${errorCode}]: Cancelamento Imediato de Retentativas. Propagação: ${responseText}`);
    }

    if (errorCode === 404) {
      const nextIndex = currentIndex + 1;
      if (nextIndex < fallbackChain.length) {
        console.warn(`[MODELO INDISPONÍVEL] O modelo "${modeloAtivo}" retornou HTTP 404. Escalando imediatamente para próximo fallback (${nextIndex + 1}/${fallbackChain.length}): ${fallbackChain[nextIndex]}`);
        return fetchGeminiWithResilience(url, payload, nextIndex);
      }
      throw new Error(`[ESGOTAMENTO TOTAL] Todos os modelos falharam (primário + ${fallbackChain.length} fallbacks), erro final foi HTTP 404. Última resposta: ${responseText.substring(0, 300)}`);
    }

    if (errorCode === 503 || errorCode === 429) {
      const elapsedMs = Date.now() - startTime;
      
      if (elapsedMs >= MAX_EXECUTION_TIME_MS) {
        throw new Error(`Runtime Safety Timeout: O orçamento cronometrado (${elapsedMs}ms) estoirou o teto de 300s. Saída limpa forçada.`);
      }

      // Se esgotou tentativas neste modelo, escalar para o próximo da cadeia
      if (attempt >= maxRetries) {
        const nextIndex = currentIndex + 1;
        if (nextIndex < fallbackChain.length) {
          console.warn(`[BACKOFF] ${maxRetries} tentativas esgotadas em "${modeloAtivo}". Escalando para próximo fallback (${nextIndex + 1}/${fallbackChain.length}): ${fallbackChain[nextIndex]}`);
          return fetchGeminiWithResilience(url, payload, nextIndex);
        }
        throw new Error(`[ESGOTAMENTO TOTAL] Todos os modelos falharam (primário + ${fallbackChain.length} fallbacks). HTTP ${errorCode}. Última resposta: ${responseText.substring(0, 300)}`);
      }

      const tempCap = Math.min(CAP_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
      const sleepMs = Math.random() * tempCap; // Full Jitter

      if (elapsedMs + sleepMs >= MAX_EXECUTION_TIME_MS) {
        // Timeout iminente — pular direto para próximo fallback se disponível
        const nextIndex = currentIndex + 1;
        if (nextIndex < fallbackChain.length) {
          console.warn(`[TIMEOUT IMINENTE] Sleep de ${Math.round(sleepMs)}ms causaria timeout. Escalando imediatamente para: ${fallbackChain[nextIndex]}`);
          return fetchGeminiWithResilience(url, payload, nextIndex);
        }
        throw new Error(`Runtime Safety Timeout: Sleep de ${Math.round(sleepMs)}ms provocaria colapso (teto 300s). Cadeia de fallback esgotada.`);
      }

      console.log(`[HTTP ${errorCode}] Rejeição em "${modeloAtivo}". Tentativa ${attempt}/${maxRetries}: Full Jitter ${Math.round(sleepMs)}ms.`);
      
      Utilities.sleep(sleepMs);
      attempt++;
    } else {
      throw new Error(`Erro não-transiente [HTTP ${errorCode}] reportado fora da jurisdição estocástica: ${responseText}`);
    }
  }
}

/**
 * Envia o texto para o Gemini e retorna o resumo gerado.
 */
function chamarGeminiAPI(texto, nomeArquivo, apiKey, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const dataHoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const promptUsuario = `**NOME DO ARQUIVO:** ${nomeArquivo}\n**DATA:** ${dataHoje}\n\n**ARQUIVO BRUTO PARA PROCESSAMENTO:**\n\n${texto}`;

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: promptUsuario }] }],
    generationConfig: { temperature: 0.2 }
  };

  try {
    const json = fetchGeminiWithResilience(url, payload);
    const candidate = json.candidates && json.candidates[0];
    
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error(`[ERRO] A API retornou candidato inválido ou vazio.`);
      return null;
    }
    return candidate.content.parts[0].text;
  } catch (e) {
    console.error(`[ERRO] Falha ao processar ${nomeArquivo}: ${e.message}`);
    return null;
  }
}

/**
 * Envia o texto para o Gemini e retorna um objeto JSON parseado.
 */
function chamarGeminiJSON(promptUsuario, apiKey, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: promptUsuario }] }],
    generationConfig: { temperature: 0.0, response_mime_type: "application/json" }
  };

  try {
    const json = fetchGeminiWithResilience(url, payload);
    const candidate = json.candidates && json.candidates[0];
    
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error(`[ERRO JSON] Candidato inválido.`);
      return null;
    }
    return JSON.parse(candidate.content.parts[0].text);
  } catch (e) {
    console.error(`[ERRO JSON] Falha ao processar: ${e.message}`);
    return null;
  }
}

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
