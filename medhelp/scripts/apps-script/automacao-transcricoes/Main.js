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
  const apiKeyYoutube = scriptProperties.getProperty('YOUTUBE_API_KEY');
  
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não encontrada nas Propriedades do Script. Abortando fluxo.');
    return;
  }

  const pastaEntrada = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA);
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

    const arquivo = arquivos.next();
    const sucesso = processarArquivoIndividual(arquivo, apiKey, apiKeyYoutube, tempoInicio);
    
    if (sucesso) {
      processados++;
    } else {
      falhas++;
    }

    // Pausa Preditiva (Throttling) entre arquivos para segurança do Rate Limit
    if (arquivos.hasNext()) {
      console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s para proteção de cota...`);
      Utilities.sleep(CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS);
    }
  }

  console.log(`\n[FIM] Ciclo concluído. Processados: ${processados} | Falhas: ${falhas}`);

  if (processados > 0 || falhas > 0) {
    enviarNotificacaoEmail(processados, falhas);
  }
}

/**
 * Processa um único arquivo de transcrição.
 * @param {GoogleAppsScript.Drive.File} arquivo
 * @param {string} apiKey
 * @param {string} apiKeyYoutube
 * @param {number} tempoInicio
 * @returns {boolean} True se processado com sucesso, false caso contrário
 */
function processarArquivoIndividual(arquivo, apiKey, apiKeyYoutube, tempoInicio) {
  const nomeOriginal = arquivo.getName().replace(/\.txt$/i, '');
  const nomeLimpo = limparNomeArquivo(nomeOriginal);

  console.log(`\n[INÍCIO] Processando: "${nomeOriginal}" → "${nomeLimpo}"`);

  let textoBruto;
  try {
    textoBruto = lerConteudoArquivo(arquivo);
  } catch (e) {
    console.error(`[ERRO] Falha de I/O ao ler o arquivo "${nomeOriginal}": ${e.message}`);
    return false;
  }

  const ehPratica = /osce|prática|pratica/i.test(nomeOriginal);
  const promptAplicado = ehPratica ? SYSTEM_INSTRUCTION_OSCE : SYSTEM_INSTRUCTION_TEORIA;
  const resumoGerado = chamarGeminiAPI(textoBruto, nomeOriginal, apiKey, promptAplicado);

  if (!resumoGerado) {
    console.error(`[FALHA] API não retornou texto válido para "${nomeOriginal}". ` +
                  'O arquivo .txt permanece na pasta de entrada para revisão ou próxima tentativa.');
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: 'Resumo', status: 'ERRO_API', duracao: 0 });
    return false;
  }

  try {
    const tituloLimpo = nomeLimpo.replace(/\s*\(Resumo\)\s*/gi, '').trim();
    let resumoFinal = `# ${tituloLimpo}\n\n${resumoGerado}`;

    const videoMd = YouTubeCurator.obterRecomendacaoDeVideo(tituloLimpo, apiKey, apiKeyYoutube);
    if (videoMd) {
      resumoFinal = `# ${tituloLimpo}\n\n${videoMd}\n\n${resumoGerado}`;
    }

    salvarResumo(tituloLimpo, resumoFinal);
    arquivarArquivo(arquivo);
    excluirAudiosDaAula(textoBruto, nomeOriginal);

    console.log(`[SUCESSO] "${nomeLimpo}.md" gerado e salvo. Original arquivado com sucesso.`);
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: 'Resumo', status: 'SUCESSO', duracao: Math.round((Date.now() - tempoInicio) / 1000) });
    return true;

  } catch (e) {
    console.error(`[ERRO] Falha de I/O ao salvar o arquivo "${nomeLimpo}": ${e.message}. ` +
                  'O arquivo .txt permanece na pasta de entrada para tentativa futura.');
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: 'Resumo', status: 'ERRO_IO', duracao: 0 });
    return false;
  }
}

/**
 * Remove prefixos e formatações indesejadas do nome do arquivo.
 * @param {string} nomeOriginal 
 * @returns {string}
 */
function limparNomeArquivo(nomeOriginal) {
  return nomeOriginal.replace(/^\d+\s*-\s*(?:[^-]+-\s*)?/, '').trim();
}

/**
 * Envia um e-mail de notificação com o relatório do lote processado.
 * @param {number} processados 
 * @param {number} falhas 
 */
function enviarNotificacaoEmail(processados, falhas) {
  try {
    const assunto = falhas > 0
      ? `[Medhelp ⚠️] Pipeline: ${processados} OK, ${falhas} FALHA(S)`
      : `[Medhelp ✅] Pipeline concluído: ${processados} resumo(s) gerado(s)`;

    const corpo = `Relatório do ciclo de Automação de Resumos — ${new Date().toLocaleString('pt-BR')}

✅ Processados com sucesso: ${processados}
❌ Falhas:                  ${falhas}

${falhas > 0 ? '⚠️ Arquivos com falha permanecem na pasta de entrada para próxima tentativa.\nVerifique o Log do Apps Script para detalhes.\n' : ''}
Resumos prontos em: Drive → Resumos_Prontos/`;

    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      subject: assunto,
      body: corpo
    });
    console.log('[EMAIL] Notificação de relatório enviada.');
  } catch (e) {
    console.warn(`[EMAIL] Falha ao enviar notificação: ${e.message}`);
  }
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
