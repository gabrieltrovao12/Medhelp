// ============================================================
// GATILHO E LÓGICA DE NEGÓCIO: RESUMOS PARA FLASHCARDS
// ============================================================

function processarFlashcardsDeResumos() {
  const tempoInicio = Date.now();
  console.log(`\n============================================================`);
  console.log(`[INÍCIO] Fluxo de Resumos -> Flashcards`);
  
  const apiKey = CONFIG.getApiKey();
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada.');
    return;
  }

  const arquivos = _getResumosPendentes();
  if (arquivos.length === 0) {
    console.log(`[INFO] Nenhum resumo .md recente nas últimas ${CONFIG.HORAS_RECENTES}h.`);
    return;
  }

  console.log(`[INFO] Encontrados ${arquivos.length} resumo(s). Inspecionando lote...`);

  let sucesso = 0;
  for (const arquivo of arquivos) {
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Proteção de Tempo Limite (4.5 min) atingida. Encerrando lote precocemente.');
      break;
    }

    if (_processarResumoUnico(arquivo, apiKey, tempoInicio)) {
      sucesso++;
    }
  }

  const duracao = Math.round((Date.now() - tempoInicio) / 1000);
  console.log(`[FIM] Concluído em ${duracao}s. Sucessos: ${sucesso}`);
  console.log(`============================================================\n`);

  NotificationUtils.sendSuccessReport('Resumos', sucesso, duracao, 'Flashcards_Prontos');
}

/**
 * Filtra e retorna arquivos Markdown únicos da pasta de entrada.
 * @returns {GoogleAppsScript.Drive.File[]}
 */
function _getResumosPendentes() {
  const arquivosBrutos = DriveUtils.getArquivosRecentes(CONFIG.ID_PASTA_ENTRADA_RESUMOS);
  const arquivosUnicosMap = new Map();
  
  arquivosBrutos.forEach(f => {
    if (f.getName().toLowerCase().endsWith('.md')) {
      if (!arquivosUnicosMap.has(f.getName())) {
        arquivosUnicosMap.set(f.getName(), f);
      }
    }
  });

  return Array.from(arquivosUnicosMap.values());
}

/**
 * Processa um único arquivo de resumo.
 * @param {GoogleAppsScript.Drive.File} arquivo
 * @param {string} apiKey
 * @param {number} tempoInicio
 * @returns {boolean} true se processou e gerou com sucesso
 */
function _processarResumoUnico(arquivo, apiKey, tempoInicio) {
  const nomeOriginal = arquivo.getName();
  const disciplina = NamingUtils.detectarDisciplina(nomeOriginal);
  const nomeDestino = NamingUtils.gerarNomeFlashcardLimpo(nomeOriginal);
  const categoria = NamingUtils.detectarCategoria(nomeOriginal);

  console.log(`\n[LENDO] "${nomeOriginal}" -> Destino planejado: "${nomeDestino}" | Categoria: "${categoria}"`);

  const arquivoExistente = DriveUtils.checkIfFileExists(nomeDestino, disciplina, categoria);
  if (arquivoExistente) {
    console.log(`[PULO] O flashcard já existe ("${nomeDestino}"). Ignorando.`);
    return false;
  }

  let texto = "";
  try {
    texto = arquivo.getBlob().getDataAsString('UTF-8');
    if (texto.trim().length < 50) throw new Error("Conteúdo insuficiente");
  } catch (e) {
    console.error(`[ERRO] Falha ao extrair texto: ${e.message}`);
    return false;
  }

  let geradoComSucesso = false;
  const flashcards = GeminiAPI.gerarApenasTexto(texto, disciplina, apiKey);
  
  if (flashcards) {
    try {
      const metaData = `> **Fonte Original:** ${nomeOriginal}`;
      DriveUtils.saveMarkdown(nomeDestino, flashcards, disciplina, metaData, categoria);
      console.log(`[SUCESSO] Salvo o arquivo "${nomeDestino}".`);
      SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: 'SUCESSO', duracao: Math.round((Date.now() - tempoInicio) / 1000) });
      geradoComSucesso = true;
    } catch (e) {
      console.error(`[ERRO] Falha ao salvar no Drive: ${e.message}`);
      SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: 'ERRO', duracao: 0 });
    }
  } else {
    console.error(`[ERRO] Gemini não retornou dados.`);
    SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeOriginal, disciplina, status: 'ERRO_API', duracao: 0 });
  }

  Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS); // Throttling Preditivo
  return geradoComSucesso;
}
