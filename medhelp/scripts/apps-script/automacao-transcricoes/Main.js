/**
 * Main.js
 * Orquestrador central que junta todas as peças: lê arquivos pendentes,
 * processa pela API Gemini, cria arquivos no destino e organiza o encerramento seguro.
 */
 

/**
 * Função principal a ser acionada por Trigger Temporal ou via do Webhook (doPost).
 */
function processarNovasTranscricoes() {
  const tempoInicio = Date.now();

  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não encontrada nas Propriedades do Script. Abortando fluxo.');
    return;
  }

  const pastaEntrada    = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA);
  const pastaResumos    = DriveApp.getFolderById(CONFIG.ID_PASTA_RESUMOS);
  const pastaArquivados = DriveApp.getFolderById(CONFIG.ID_PASTA_ARQUIVADOS);

  const arquivos = pastaEntrada.getFilesByType(MimeType.PLAIN_TEXT);

  let processados = 0;
  let falhas      = 0;

  while (arquivos.hasNext()) {

    // Guarda de Timeout de 4.5 minutos para evitar Crash Limits do GAS (6 minutos)
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Tempo limite de 4.5 min atingido. Encerrando o lote de forma segura. ' +
                   'Os arquivos pendentes serão processados no próximo ciclo agendado.');
      break;
    }

    const arquivo      = arquivos.next();
    const nomeOriginal = arquivo.getName().replace(/\.txt$/i, ''); // Usado para arquivamento e logging
    const nomeLimpo    = nomeOriginal.replace(/^\d+\s*-\s*(?:[^-]+-\s*)?/, '').trim(); // Usado na saída final (.md)

    console.log(`\n[INÍCIO] Processando: "${nomeOriginal}" → "${nomeLimpo}"`);

    let textoBruto;
    try {
      textoBruto = arquivo.getBlob().getDataAsString('UTF-8');
    } catch (e) {
      console.error(`[ERRO] Falha de I/O ao ler o arquivo "${nomeOriginal}": ${e.message}`);
      falhas++;
      continue;
    }

    // Processamento via LLM (Exponential Backoff e validações tratados internamente)
    const ehPratica = /osce|prática|pratica/i.test(nomeOriginal);
    const promptAplicado = ehPratica ? SYSTEM_INSTRUCTION_OSCE : SYSTEM_INSTRUCTION_TEORIA;
    const resumoGerado = chamarGeminiAPI(textoBruto, nomeOriginal, apiKey, promptAplicado);

    if (resumoGerado) {
      try {
        // Cria o resumo em Markdown na pasta destino
        pastaResumos.createFile(nomeLimpo + '.md', resumoGerado, MimeType.PLAIN_TEXT);

        arquivo.moveTo(pastaArquivados);
        
        // Exclusão assíncrona de áudios mapeados (metadado)
        excluirAudiosDaAula(textoBruto, nomeOriginal);

        console.log(`[SUCESSO] "${nomeLimpo}.md" gerado e salvo. Original arquivado com sucesso.`);
        processados++;

      } catch (e) {
        console.error(`[ERRO] Falha de I/O ao salvar o arquivo "${nomeLimpo}": ${e.message}. ` +
                      'O arquivo .txt permanece na pasta de entrada para tentativa futura.');
        falhas++;
      }
    } else {
      console.error(`[FALHA] API não retornou texto válido para "${nomeOriginal}". ` +
                    'O arquivo .txt permanece na pasta de entrada para revisão ou próxima tentativa.');
      falhas++;
    }

    // Pausa Preditiva (Throttling) entre arquivos para segurança do Rate Limit
    if (arquivos.hasNext()) {
      console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s para proteção de cota...`);
      Utilities.sleep(CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS);
    }
  }

  console.log(`\n[FIM] Ciclo concluído. Processados: ${processados} | Falhas: ${falhas}`);
}

/**
 * Receptor de Webhook (HTTP POST).
 * Acionado diretamente pelo Google Colab quando a transcrição Whisper termina.
 * 
 * @param {Object} e - Evento de post do Apps Script
 * @returns {TextOutput} Resposta em formato JSON
 */
function doPost(e) {
  console.log("[WEBHOOK] Acionador recebido. Iniciando pipeline de processamento...");
  
  try {
    processarNovasTranscricoes();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "sucesso",
      mensagem: "Processamento de transcrições concluído e lote seguro."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    console.error(`[WEBHOOK ERRO FATAL] Falha no pipeline: ${err.message}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "erro",
      mensagem: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
