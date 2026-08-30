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

  // Bi-turma: itera sobre todas as turmas com pastas de entrada configuradas
  const turmasAtivas = getTurmasAtivas();
  console.log(`[TURMA_ROUTER] Turmas ativas neste ciclo: ${turmasAtivas.join(', ')}`);

  let processados = 0;
  let falhas      = 0;
  let quarentena  = 0; // Não são falhas do sistema — arquivo apenas mal nomeado

  for (const turmaId of turmasAtivas) {
    // Guarda de Timeout global
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Tempo limite de 4.5 min atingido antes de processar todas as turmas. ' +
                   'Os itens pendentes serão retomados no próximo ciclo.');
      break;
    }

    const turmaConfig = getConfigTurma(turmaId);
    const pastaEntrada = DriveApp.getFolderById(turmaConfig.ID_PASTA_ENTRADA);
    const listaArquivos = obterArquivosTextoPendentes(pastaEntrada);

    console.log(`\n[${turmaId}] ${listaArquivos.length} arquivo(s) .txt detectado(s) na pasta de entrada.`);

    for (let i = 0; i < listaArquivos.length; i++) {
      if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
        console.warn(`[AVISO] Tempo limite atingido durante o lote de ${turmaId}. Encerrando com segurança.`);
        break;
      }

      const arquivo = listaArquivos[i];
      const resultado = processarArquivoIndividual(arquivo, apiKey, apiKeyYoutube, tempoInicio, turmaConfig, turmaId);

      if (resultado === true)        processados++;
      else if (resultado === null)   quarentena++;  // arquivo mal nomeado
      else                           falhas++;       // resultado === false: falha real

      // Pausa Preditiva (Throttling) entre arquivos para segurança do Rate Limit
      if (i < listaArquivos.length - 1) {
        console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s para proteção de cota...`);
        Utilities.sleep(CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS);
      }
    }
  }

  console.log(`\n[FIM] Ciclo concluído. Processados: ${processados} | Falhas: ${falhas} | Quarentena: ${quarentena}`);

  if (processados > 0 || falhas > 0) {
    enviarNotificacaoEmail(processados, falhas);
  }

  // Aciona o gerador de flashcards se tivermos processado novos resumos
  if (processados > 0) {
    acionarWebhookFlashcards();
  }
}

/**
 * Processa um único arquivo de transcrição.
 *
 * @param {GoogleAppsScript.Drive.File} arquivo
 * @param {string} apiKey
 * @param {string} apiKeyYoutube
 * @param {number} tempoInicio
 * @param {Object} turmaConfig - Config da turma (vem do TurmaRouter)
 * @param {string} turmaId    - Sigla da turma ('UNDB' | 'CEUMA')
 * @returns {true|false|null} true=sucesso, false=falha real, null=arquivo em quarentena (mal nomeado)
 */
function processarArquivoIndividual(arquivo, apiKey, apiKeyYoutube, tempoInicio, turmaConfig, turmaId) {
  const nomeOriginal = arquivo.getName().replace(/\.txt$/i, '');
  const pastaOrigemId = arquivo.getParents().hasNext() ? arquivo.getParents().next().getId() : null;

  // Valida turma pelo arquivo (defesa dupla — a iteração já garante a pasta certa,
  // mas o prefixo do nome confirma que o arquivo foi nomeado corretamente)
  const turmaDetectada = detectarTurma(nomeOriginal, pastaOrigemId);
  if (turmaDetectada === 'QUARENTENA') {
    console.warn(`[QUARENTENA] Arquivo "${nomeOriginal}" ignorado. Sem prefixo de turma reconhecível.`);
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: '—', status: 'TURMA_DESCONHECIDA', duracao: 0 });
    return null; // Não é falha do sistema — arquivo apenas mal nomeado
  }

  const nomeLimpo = limparNomeArquivo(nomeOriginal);
  console.log(`\n[INÍCIO][${turmaId}] Processando: "${nomeOriginal}" → "${nomeLimpo}"`);

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
    console.error(`[FALHA][${turmaId}] API não retornou texto válido para "${nomeOriginal}". ` +
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

    // Salva e arquiva usando as pastas da turma correta (injetadas via turmaConfig)
    salvarResumo(`${tituloLimpo} (resumo)`, resumoFinal, turmaConfig.ID_PASTA_RESUMOS);
    arquivarArquivo(arquivo, turmaConfig.ID_PASTA_ARQUIVADOS);
    excluirAudiosDaAula(textoBruto, nomeOriginal, turmaConfig.ID_PASTA_AUDIOS);

    const duracao = Math.round((Date.now() - tempoInicio) / 1000);
    console.log(`[SUCESSO][${turmaId}] "${nomeLimpo}.md" gerado e salvo. Original arquivado.`);
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: 'Resumo', status: `SUCESSO [${turmaId}]`, duracao });
    return true;

  } catch (e) {
    console.error(`[ERRO][${turmaId}] Falha de I/O ao salvar "${nomeLimpo}": ${e.message}. ` +
                  'O arquivo .txt permanece na pasta de entrada para tentativa futura.');
    SheetsLogger.registrar({ script: 'ResumosTranscricao', arquivo: nomeOriginal, disciplina: 'Resumo', status: `ERRO_IO [${turmaId}]`, duracao: 0 });
    return false;
  }
}

/**
 * Remove prefixos e formatações indesejadas do nome do arquivo, preservando a categoria no início.
 * Filtros suportados: TFC, LHM, Conferência, Lacuna Zero.
 * @param {string} nomeOriginal 
 * @returns {string}
 */
function limparNomeArquivo(nomeOriginal) {
  // Etapa 0: remove o prefixo de turma ("UNDB - " ou "CEUMA - ") antes de qualquer outra lógica.
  // O nome final dos arquivos gerados não carregará o identificador de turma.
  let nomeBase = (nomeOriginal || '').replace(/^(UNDB|CEUMA)\s*-\s*/i, '').trim();

  // 1. Detecta a categoria baseando-se no termo contido no nome (insensível a acentos)
  const nomeLower = nomeBase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let categoria = '';
  if (nomeLower.includes('tfc')) categoria = 'TFC';
  else if (nomeLower.includes('lhm')) categoria = 'LHM';
  else if (nomeLower.includes('conferencia') || nomeLower.includes('tutoria')) categoria = 'Conferência';
  else if (nomeLower.includes('lacuna')) categoria = 'Lacuna Zero';

  // 2. Remove termos de categoria e colchetes para poder limpar o restante
  let resto = nomeBase
    .replace(/conferênci[aa]|conferenci[aa]/ig, '')
    .replace(/tutoria/ig, '')
    .replace(/tfc/ig, '')
    .replace(/lhm/ig, '')
    .replace(/lacuna(\s*zero)?/ig, '')
    .replace(/[\[\]]/g, '')
    .trim();

  resto = resto.replace(/^-\s*/, '').trim();

  // 3. Remove numeração sequencial inicial (ex: "01 - ") e hifens órfãos
  resto = resto
    .replace(/^\d+\s*-\s*/, '')
    .replace(/^-\s*/, '')
    .replace(/\s*-\s*$/, '')
    .trim();

  resto = resto.replace(/\s*-\s*-\s*/g, ' - ').trim();

  // 4. Remonta no formato padronizado se houver categoria
  if (categoria) {
    resto = resto.replace(/^-\s*/, '');
    return `${categoria} - ${resto}`;
  }
  return resto;
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
  console.log("[WEBHOOK] Acionador recebido. Aguardando 5s para sincronização e indexação do Google Drive...");
  Utilities.sleep(5000); // Pausa defensiva: evita race condition onde o Colab salva o arquivo no Drive e chama o Webhook no mesmo milissegundo antes da API indexar
  
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

/**
 * Aciona o webhook do projeto Medhelp Flashcards para iniciar
 * a geração automática dos flashcards a partir dos novos resumos.
 */
function acionarWebhookFlashcards() {
  const url = PropertiesService.getScriptProperties().getProperty('WEBHOOK_FLASHCARDS_URL');
  
  if (!url) {
    console.warn("[AVISO] WEBHOOK_FLASHCARDS_URL não configurada nas Propriedades do Script. Ignorando acionamento do Flashcards.");
    return;
  }

  try {
    console.log(`[WEBHOOK OUT] Acionando pipeline de Flashcards...`);
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      muteHttpExceptions: true // Impede que o GAS lance erro e aborte o script caso o webhook retorne 500
    };
    
    const response = UrlFetchApp.fetch(url, options);
    console.log(`[WEBHOOK OUT] Resposta Flashcards (HTTP ${response.getResponseCode()}): ${response.getContentText()}`);
  } catch (e) {
    console.error(`[WEBHOOK OUT ERRO] Falha ao acionar o webhook do Flashcards: ${e.message}`);
  }
}
