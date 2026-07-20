// ============================================================
// GATILHO E LÓGICA DE NEGÓCIO: PDFs DE TUTORIA PARA FLASHCARDS
// ============================================================

function processarFlashcardsDeTutoria() {
  const tempoInicio = Date.now();
  console.log(`\n============================================================`);
  console.log(`[INÍCIO] Fluxo de Tutoria -> Flashcards`);

  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada.');
    return;
  }

  // A Tutoria lê PDFs (não restringe pelo limitador de 168h nativo, pois lê a pasta inteira e deduplica)
  // Mas para manter performance vamos apenas ler a pasta
  let folder;
  try {
    folder = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA_TUTORIA);
  } catch(e) {
    console.error(`[ERRO] Falha ao acessar pasta Tutoria: ${e.message}`);
    return;
  }

  const iter = folder.getFilesByType('application/pdf');
  const arquivosUnicosMap = new Map();
  let totalObjetivosGeral = 0;

  while(iter.hasNext()) {
    const f = iter.next();
    if (!arquivosUnicosMap.has(f.getName())) {
      arquivosUnicosMap.set(f.getName(), f);
      // Conta as barras para saber total de objetivos
      totalObjetivosGeral += ((f.getName().match(/\//g) || []).length + 1);
    }
  }

  const arquivos = Array.from(arquivosUnicosMap.values());
  if (arquivos.length === 0) {
    console.log(`[INFO] Nenhum PDF de tutoria encontrado.`);
    return;
  }

  console.log(`[INFO] Encontrados ${arquivos.length} PDF(s) de Tutoria com ~${totalObjetivosGeral} objetivos. Inspecionando lote...`);

  // O nome do arquivo consolidado engloba os nomes dos PDFs sem extensão
  const nomesParaOArquivo = arquivos.map(f => f.getName().replace(/\.pdf$/i, '').replace(/\//g, '-')).join(' + ');
  const nomeDestino = NamingUtils.gerarNomeFlashcardLimpo(`Tutoria - ${nomesParaOArquivo}`);

  // Deduplicação baseada em modificação temporal
  const arquivoExistente = DriveUtils.checkIfFileExists(nomeDestino, 'Tutoria');
  if (arquivoExistente) {
    const dataCards = arquivoExistente.getDateCreated().getTime();
    const pdfAtualizado = arquivos.some(f => f.getLastUpdated().getTime() > dataCards);
    
    if (!pdfAtualizado) {
      console.log(`[PULO] O consolidado "${nomeDestino}" já existe e está atualizado.`);
      return;
    }
    
    console.log(`[INFO] Mudança detectada nos PDFs. Deletando "${nomeDestino}" antigo para regeneração.`);
    arquivoExistente.setTrashed(true);
  }

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

  if (blocosConsolidados.length > 0) {
    try {
      const conteudoFinal = blocosConsolidados.join('\n\n---\n\n');
      const metaDataHeader = `> **Fontes Originais:**\n${metaNomes.join('\n')}`;
      
      DriveUtils.saveMarkdown(nomeDestino, conteudoFinal, 'Tutoria', metaDataHeader);
      console.log(`\n[SUCESSO GLOBAL] Consolidado "${nomeDestino}" salvo.`);
    } catch (e) {
      console.error(`[ERRO] Falha ao salvar consolidado no Drive: ${e.message}`);
    }
  }

  const duracao = Math.round((Date.now() - tempoInicio) / 1000);
  console.log(`[FIM] Concluído em ${duracao}s.`);
  console.log(`============================================================\n`);

  // Notificação por e-mail — enviada apenas se houve consolidação gerada
  if (blocosConsolidados.length > 0) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: `[Medhelp ✅] Flashcards de Tutoria gerados (${blocosConsolidados.length} PDF(s))`,
        body: `Relatório do ciclo de Flashcards (Tutoria) — ${new Date().toLocaleString('pt-BR')}\n\n✅ PDFs processados: ${blocosConsolidados.length}\nTempo de execução: ${duracao}s\n\nArquivos prontos em: Drive → Flashcards_Prontos/Tutoria/`
      });
      console.log('[EMAIL] Notificação enviada.');
    } catch (e) {
      console.warn(`[EMAIL] Falha ao enviar notificação: ${e.message}`);
    }
  }
}
