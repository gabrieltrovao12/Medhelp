// ============================================================
// GATILHO E LÓGICA DE NEGÓCIO: RESUMOS PARA FLASHCARDS
// ============================================================

function processarFlashcardsDeResumos() {
  const tempoInicio = Date.now();
  console.log(`\n============================================================`);
  console.log(`[INÍCIO] Fluxo de Resumos -> Flashcards (bi-turma)`);

  const apiKey = CONFIG.getApiKey();
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada.');
    return;
  }

  // Bi-turma: itera sobre turmas com pastas de entrada configuradas
  const turmasAtivas = getTurmasAtivas();
  console.log(`[TURMA_ROUTER] Turmas ativas: ${turmasAtivas.join(', ')}`);

  let sucesso = 0;
  let quarentena = 0; // Arquivos sem prefixo de turma — não são falhas do sistema

  for (const turmaId of turmasAtivas) {
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Proteção de Tempo Limite (4.5 min) atingida antes de processar todas as turmas.');
      break;
    }

    console.log(`\n[${turmaId}] Verificando resumos pendentes...`);
    const turmaConfig = getConfigTurma(turmaId);
    const arquivos = _getResumosPendentes(turmaConfig.ID_PASTA_ENTRADA_RESUMOS);

    if (arquivos.length === 0) {
      console.log(`[${turmaId}] Nenhum resumo .md recente nas últimas ${CONFIG.HORAS_RECENTES}h.`);
      continue;
    }

    console.log(`[${turmaId}] ${arquivos.length} resumo(s) encontrado(s). Processando lote...`);

    for (const arquivo of arquivos) {
      if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
        console.warn(`[AVISO] Tempo limite atingido durante o lote de ${turmaId}.`);
        break;
      }

      const resultado = _processarResumoUnico(arquivo, apiKey, tempoInicio, turmaId, turmaConfig);
      if (resultado === true) sucesso++;
      else if (resultado === 'QUARENTENA') quarentena++;
      // resultado === false = falha de API ou I/O, que não é contabilizado no sucesso
    }
  }

  const duracao = Math.round((Date.now() - tempoInicio) / 1000);
  console.log(`[FIM] Concluído em ${duracao}s. Sucessos: ${sucesso} | Quarentena: ${quarentena}`);
  console.log(`============================================================\n`);

  NotificationUtils.sendSuccessReport('Resumos', sucesso, duracao, 'Flashcards_Prontos');
}

/**
 * Filtra e retorna arquivos Markdown únicos da pasta de entrada de uma turma.
 *
 * @param {string} idPastaEntrada - ID da pasta de resumos da turma
 * @returns {GoogleAppsScript.Drive.File[]}
 */
function _getResumosPendentes(idPastaEntrada) {
  const arquivosBrutos = DriveUtils.getArquivosRecentes(idPastaEntrada);
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
 *
 * @param {GoogleAppsScript.Drive.File} arquivo
 * @param {string} apiKey
 * @param {number} tempoInicio
 * @param {string} turmaId      - Sigla da turma ('UNDB' | 'CEUMA')
 * @param {Object} turmaConfig  - Config da turma (vem do TurmaRouter)
 * @returns {true|false|'QUARENTENA'} true=sucesso, false=falha processamento, 'QUARENTENA'=arquivo sem turma
 */
function _processarResumoUnico(arquivo, apiKey, tempoInicio, turmaId, turmaConfig) {
  const nomeOriginal = arquivo.getName();
  const pastaOrigemId = arquivo.getParents().hasNext() ? arquivo.getParents().next().getId() : null;

  // Validação de turma por prefixo de nome (defesa dupla)
  const turmaDetectada = detectarTurma(nomeOriginal, pastaOrigemId);
  if (turmaDetectada === 'QUARENTENA') {
    console.warn(`[QUARENTENA][${turmaId}] Arquivo "${nomeOriginal}" sem prefixo de turma reconhecível. Ignorando.`);
    SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeOriginal, disciplina: '—', status: 'TURMA_DESCONHECIDA', duracao: 0 });
    return 'QUARENTENA'; // Não é uma falha do sistema, é nome incorreto
  }

  const disciplina = NamingUtils.detectarDisciplina(nomeOriginal);
  const nomeDestino = NamingUtils.gerarNomeFlashcardLimpo(nomeOriginal);
  const categoria = NamingUtils.detectarCategoria(nomeOriginal);

  // Obtém a pasta de saída correta para esta turma + categoria
  const idPastaSaida = obterPastaSaidaFlashcard(turmaId, categoria);

  console.log(`\n[LENDO][${turmaId}] "${nomeOriginal}" -> Destino: "${nomeDestino}" | Categoria: "${categoria}"`);

  // Verifica duplicata na pasta CORRETA desta turma (não na UNDB por padrão)
  const pastaDestino = DriveApp.getFolderById(idPastaSaida);
  const arquivosExistentes = pastaDestino.getFilesByName(nomeDestino);
  if (arquivosExistentes.hasNext()) {
    console.log(`[PULO][${turmaId}] Flashcard já existe em "${idPastaSaida}" ("${nomeDestino}"). Ignorando.`);
    return false;
  }

  let texto = '';
  try {
    texto = arquivo.getBlob().getDataAsString('UTF-8');
    if (texto.trim().length < 50) throw new Error('Conteúdo insuficiente');
  } catch (e) {
    console.error(`[ERRO][${turmaId}] Falha ao extrair texto: ${e.message}`);
    return false;
  }

  let geradoComSucesso = false;
  const flashcards = GeminiAPI.gerarApenasTexto(texto, disciplina, apiKey);

  if (flashcards) {
    try {
      const metaData = `> **Fonte Original:** ${nomeOriginal}`;
      DriveUtils.saveMarkdownToFolder(nomeDestino, flashcards, disciplina, metaData, idPastaSaida);
      console.log(`[SUCESSO][${turmaId}] Salvo o arquivo "${nomeDestino}".`);
      SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: `SUCESSO [${turmaId}]`, duracao: Math.round((Date.now() - tempoInicio) / 1000) });
      geradoComSucesso = true;
    } catch (e) {
      console.error(`[ERRO][${turmaId}] Falha ao salvar no Drive: ${e.message}`);
      SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: `ERRO [${turmaId}]`, duracao: 0 });
    }
  } else {
    console.error(`[ERRO][${turmaId}] Gemini não retornou dados.`);
    SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeOriginal, disciplina, status: `ERRO_API [${turmaId}]`, duracao: 0 });
  }

  Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS); // Throttling Preditivo
  return geradoComSucesso;
}

