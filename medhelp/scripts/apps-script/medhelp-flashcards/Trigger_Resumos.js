// ============================================================
// GATILHO E LÓGICA DE NEGÓCIO: RESUMOS PARA FLASHCARDS
// ============================================================

function processarFlashcardsDeResumos() {
  const tempoInicio = Date.now();
  console.log(`\n============================================================`);
  console.log(`[INÍCIO] Fluxo de Resumos -> Flashcards`);
  
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada.');
    return;
  }

  const arquivosBrutos = DriveUtils.getArquivosRecentes(CONFIG.ID_PASTA_ENTRADA_RESUMOS);
  const arquivosUnicosMap = new Map();
  
  // Filtrar apenas arquivos Markdown (MimeType.PLAIN_TEXT ou nome terminando em .md)
  arquivosBrutos.forEach(f => {
    if (f.getName().toLowerCase().endsWith('.md')) {
      if (!arquivosUnicosMap.has(f.getName())) {
        arquivosUnicosMap.set(f.getName(), f);
      }
    }
  });

  const arquivos = Array.from(arquivosUnicosMap.values());
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

    const nomeOriginal = arquivo.getName();
    const disciplina = NamingUtils.detectarDisciplina(nomeOriginal);
    const nomeDestino = NamingUtils.gerarNomeFlashcardLimpo(nomeOriginal);

    console.log(`\n[LENDO] "${nomeOriginal}" -> Destino planejado: "${nomeDestino}"`);

    const arquivoExistente = DriveUtils.checkIfFileExists(nomeDestino, disciplina);
    if (arquivoExistente) {
      // Diferente de Tutoria, aqui basta existir.
      console.log(`[PULO] O flashcard já existe ("${nomeDestino}"). Ignorando.`);
      continue;
    }

    let texto = "";
    try {
      texto = arquivo.getBlob().getDataAsString('UTF-8');
      if (texto.trim().length < 50) throw new Error("Conteúdo insuficiente");
    } catch (e) {
      console.error(`[ERRO] Falha ao extrair texto: ${e.message}`);
      continue;
    }

    const flashcards = GeminiAPI.gerarApenasTexto(texto, disciplina, apiKey);
    if (flashcards) {
      try {
        const metaData = `> **Fonte Original:** ${nomeOriginal}`;
        DriveUtils.saveMarkdown(nomeDestino, flashcards, disciplina, metaData);
        console.log(`[SUCESSO] Salvo o arquivo "${nomeDestino}".`);
        sucesso++;
        SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: 'SUCESSO', duracao: Math.round((Date.now() - tempoInicio) / 1000) });
      } catch (e) {
        console.error(`[ERRO] Falha ao salvar no Drive: ${e.message}`);
        SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeDestino, disciplina, status: 'ERRO', duracao: 0 });
      }
    } else {
      console.error(`[ERRO] Gemini não retornou dados.`);
      SheetsLogger.registrar({ script: 'Resumos', arquivo: nomeOriginal, disciplina, status: 'ERRO_API', duracao: 0 });
    }

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS); // Throttling Preditivo
  }

  const duracao = Math.round((Date.now() - tempoInicio) / 1000);
  console.log(`[FIM] Concluído em ${duracao}s. Sucessos: ${sucesso}`);
  console.log(`============================================================\n`);

  // Notificação por e-mail — enviada apenas se houve atividade
  if (sucesso > 0) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: `[Medhelp ✅] ${sucesso} flashcard(s) gerado(s) a partir de Resumos`,
        body: `Relatório do ciclo de Flashcards (Resumos) — ${new Date().toLocaleString('pt-BR')}\n\n✅ Flashcards gerados: ${sucesso}\nTempo de execução: ${duracao}s\n\nArquivos prontos em: Drive → Flashcards_Prontos/`
      });
      console.log('[EMAIL] Notificação enviada.');
    } catch (e) {
      console.warn(`[EMAIL] Falha ao enviar notificação: ${e.message}`);
    }
  }
}
