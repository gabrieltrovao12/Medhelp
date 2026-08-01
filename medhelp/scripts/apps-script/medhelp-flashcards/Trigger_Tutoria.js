// ============================================================
// GATILHO E LÓGICA DE NEGÓCIO: PDFs DE TUTORIA PARA FLASHCARDS
// ============================================================

function processarFlashcardsDeTutoria() {
  const tempoInicio = Date.now();
  console.log(`\n============================================================`);
  console.log(`[INÍCIO] Fluxo de Tutoria -> Flashcards`);

  const apiKey = CONFIG.getApiKey();
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada.');
    return;
  }

  const resultPdfs = _getTutoriaPdfs();
  if (!resultPdfs || resultPdfs.arquivos.length === 0) {
    console.log(`[INFO] Nenhum PDF de tutoria encontrado.`);
    return;
  }

  const { arquivos, totalObjetivosGeral } = resultPdfs;
  console.log(`[INFO] Encontrados ${arquivos.length} PDF(s) de Tutoria com ~${totalObjetivosGeral} objetivos. Inspecionando lote...`);

  const nomeDestino = _gerarNomeDestinoTutoria(arquivos);
  
  if (!_verificarDeduplicacao(arquivos, nomeDestino)) {
    return; // Já existe e está atualizado
  }

  const { blocosConsolidados, metaNomes } = _processarPdfsTutoria(arquivos, totalObjetivosGeral, apiKey, tempoInicio);

  if (blocosConsolidados.length > 0) {
    _salvarConsolidadoTutoria(nomeDestino, blocosConsolidados, metaNomes);
  }

  const duracao = Math.round((Date.now() - tempoInicio) / 1000);
  console.log(`[FIM] Concluído em ${duracao}s.`);
  console.log(`============================================================\n`);

  NotificationUtils.sendSuccessReport('Tutoria', blocosConsolidados.length, duracao, 'Tutoria');
}

/**
 * Lê a pasta de tutoria e retorna os PDFs deduplicados e o total de objetivos.
 * @returns {{arquivos: GoogleAppsScript.Drive.File[], totalObjetivosGeral: number}|null}
 */
function _getTutoriaPdfs() {
  let folder;
  try {
    folder = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA_TUTORIA);
  } catch(e) {
    console.error(`[ERRO] Falha ao acessar pasta Tutoria: ${e.message}`);
    return null;
  }

  const iter = folder.getFilesByType('application/pdf');
  const arquivosUnicosMap = new Map();
  let totalObjetivosGeral = 0;

  while(iter.hasNext()) {
    const f = iter.next();
    if (!arquivosUnicosMap.has(f.getName())) {
      arquivosUnicosMap.set(f.getName(), f);
      totalObjetivosGeral += ((f.getName().match(/\//g) || []).length + 1);
    }
  }

  return {
    arquivos: Array.from(arquivosUnicosMap.values()),
    totalObjetivosGeral
  };
}

/**
 * @param {GoogleAppsScript.Drive.File[]} arquivos 
 * @returns {string}
 */
function _gerarNomeDestinoTutoria(arquivos) {
  const nomesParaOArquivo = arquivos.map(f => f.getName().replace(/\.pdf$/i, '').replace(/\//g, '-')).join(' + ');
  return NamingUtils.gerarNomeFlashcardLimpo(`Tutoria - ${nomesParaOArquivo}`);
}

/**
 * @param {GoogleAppsScript.Drive.File[]} arquivos 
 * @param {string} nomeDestino 
 * @returns {boolean} true se deve prosseguir, false se deve abortar (pulo)
 */
function _verificarDeduplicacao(arquivos, nomeDestino) {
  const arquivoExistente = DriveUtils.checkIfFileExists(nomeDestino, 'Tutoria');
  if (arquivoExistente) {
    const dataCards = arquivoExistente.getDateCreated().getTime();
    const pdfAtualizado = arquivos.some(f => f.getLastUpdated().getTime() > dataCards);
    
    if (!pdfAtualizado) {
      console.log(`[PULO] O consolidado "${nomeDestino}" já existe e está atualizado.`);
      return false;
    }
    
    console.log(`[INFO] Mudança detectada nos PDFs. Deletando "${nomeDestino}" antigo para regeneração.`);
    arquivoExistente.setTrashed(true);
  }
  return true;
}

/**
 * @param {GoogleAppsScript.Drive.File[]} arquivos 
 * @param {number} totalObjetivosGeral 
 * @param {string} apiKey 
 * @param {number} tempoInicio 
 * @returns {{blocosConsolidados: string[], metaNomes: string[]}}
 */
function _processarPdfsTutoria(arquivos, totalObjetivosGeral, apiKey, tempoInicio) {
  const blocosConsolidados = [];
  const metaNomes = [];

  for (const arquivo of arquivos) {
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Proteção de Tempo Limite (4.5 min) atingida. Encerrando lote de tutoria de forma parcial.');
      break;
    }

    const nomeOriginal = arquivo.getName();
    const limiteLocal = NamingUtils.calcularLimiteFlashcardsTutoria(nomeOriginal, totalObjetivosGeral);
    
    console.log(`\n[LENDO] PDF Tutoria: "${nomeOriginal}" -> Meta: ${limiteLocal} cards`);

    let pdfBase64 = "";
    try {
      pdfBase64 = Utilities.base64Encode(arquivo.getBlob().getBytes());
    } catch (e) {
      console.error(`[ERRO] Falha ao extrair PDF: ${e.message}`);
      continue;
    }

    const flashcards = GeminiAPI.gerarComPDF(pdfBase64, nomeOriginal, limiteLocal, apiKey);
    if (flashcards) {
      blocosConsolidados.push(`## 📎 ${nomeOriginal.replace(/\.pdf$/i, '')}\n\n${flashcards.trim()}`);
      metaNomes.push(`> - ${nomeOriginal}`);
      console.log(`[SUCESSO] Conteúdo gerado para ${nomeOriginal}.`);
      SheetsLogger.registrar({ script: 'Tutoria', arquivo: nomeOriginal, disciplina: 'Tutoria', status: 'SUCESSO', duracao: Math.round((Date.now() - tempoInicio) / 1000) });
    } else {
      console.error(`[ERRO] Gemini não retornou dados para o PDF.`);
      SheetsLogger.registrar({ script: 'Tutoria', arquivo: nomeOriginal, disciplina: 'Tutoria', status: 'ERRO_API', duracao: 0 });
    }

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS); // Throttling Preditivo
  }

  return { blocosConsolidados, metaNomes };
}

/**
 * @param {string} nomeDestino 
 * @param {string[]} blocosConsolidados 
 * @param {string[]} metaNomes 
 */
function _salvarConsolidadoTutoria(nomeDestino, blocosConsolidados, metaNomes) {
  try {
    const conteudoFinal = blocosConsolidados.join('\n\n---\n\n');
    const metaDataHeader = `> **Fontes Originais:**\n${metaNomes.join('\n')}`;
    
    DriveUtils.saveMarkdown(nomeDestino, conteudoFinal, 'Tutoria', metaDataHeader);
    console.log(`\n[SUCESSO GLOBAL] Consolidado "${nomeDestino}" salvo.`);
  } catch (e) {
    console.error(`[ERRO] Falha ao salvar consolidado no Drive: ${e.message}`);
  }
}
