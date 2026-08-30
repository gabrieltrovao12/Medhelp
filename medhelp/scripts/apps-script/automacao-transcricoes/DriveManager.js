/**
 * DriveManager.js
 * Gerencia todas as interações com o Google Drive (leitura, arquivamento, exclusão).
 * Funções agnósticas de turma — recebem IDs de pasta via parâmetro (TurmaRouter), nunca via CONFIG.
 */

/**
 * Lê o cabeçalho AUDIOS_ORIGEM do .txt e exclui (move para lixeira)
 * todos os áudios correspondentes na pasta de áudios da turma.
 * Falhas de exclusão são logadas mas não interrompem o fluxo principal.
 *
 * @param {string} textoBruto      - Conteúdo completo do .txt processado
 * @param {string} nomeArquivo     - Nome da aula (para logging)
 * @param {string} idPastaAudios   - ID da pasta de áudios da turma (vem do TurmaRouter)
 */
function excluirAudiosDaAula(textoBruto, nomeArquivo, idPastaAudios) {
  if (!idPastaAudios || idPastaAudios.includes('[PENDENTE]')) {
    console.warn(`[ÁUDIO] ID da pasta de áudios não configurado. Exclusão ignorada para "${nomeArquivo}".`);
    return;
  }

  try {
    // Extrai a linha de metadados: **AUDIOS_ORIGEM:**nome1.m4a,nome2.m4a
    const match = textoBruto.match(/\*\*AUDIOS_ORIGEM:\*\*(.+)/);
    if (!match) {
      console.warn(`[ÁUDIO] Cabeçalho AUDIOS_ORIGEM não encontrado em "${nomeArquivo}". Nenhum áudio excluído.`);
      return;
    }

    const nomesAudios = match[1].trim().split(',').map(n => n.trim()).filter(Boolean);
    console.log(`[ÁUDIO] ${nomesAudios.length} áudio(s) identificado(s) para exclusão: ${nomesAudios.join(', ')}`);

    const pastaAudios = DriveApp.getFolderById(idPastaAudios);

    nomesAudios.forEach(nomeAudio => {
      try {
        const resultados = pastaAudios.getFilesByName(nomeAudio);
        if (!resultados.hasNext()) {
          console.warn(`[ÁUDIO] Arquivo não encontrado na pasta de áudios: "${nomeAudio}". Pode já ter sido excluído.`);
          return;
        }
        while (resultados.hasNext()) {
          const audioFile = resultados.next();
          audioFile.setTrashed(true);
          console.log(`[ÁUDIO] Excluído: "${nomeAudio}"`);
        }
      } catch (e) {
        console.error(`[ÁUDIO] Falha ao excluir "${nomeAudio}": ${e.message}. O restante do fluxo não foi afetado.`);
      }
    });

  } catch (e) {
    console.error(`[ÁUDIO] Erro inesperado em excluirAudiosDaAula para "${nomeArquivo}": ${e.message}`);
  }
}

/**
 * Obtém todos os arquivos .txt da pasta de entrada de forma robusta.
 * Não depende estritamente de MimeType.PLAIN_TEXT para evitar falhas com arquivos
 * criados via Colab FUSE / Google Drive Desktop (que usam application/octet-stream ou text/x-plain).
 * 
 * @param {GoogleAppsScript.Drive.Folder} pastaEntrada
 * @returns {Array<GoogleAppsScript.Drive.File>}
 */
function obterArquivosTextoPendentes(pastaEntrada) {
  const iterador = pastaEntrada.getFiles();
  const pendentes = [];
  
  while (iterador.hasNext()) {
    const f = iterador.next();
    const nome = f.getName();
    const mime = f.getMimeType();
    
    if (nome.toLowerCase().endsWith('.txt') || mime === MimeType.PLAIN_TEXT || mime.startsWith('text/') || mime === 'application/octet-stream') {
      if (!f.isTrashed()) {
        pendentes.push(f);
      }
    }
  }
  return pendentes;
}

/**
 * Utiltário: Lista os arquivos pendentes nas pastas de entrada de todas as turmas ativas.
 * Execute manualmente para checar a fila no Apps Script Editor antes de acionar o pipeline.
 */
function listarFilaPendente() {
  const turmasAtivas = getTurmasAtivas();
  console.log(`[FILA] Turmas ativas: ${turmasAtivas.join(', ')}`);

  turmasAtivas.forEach(turmaId => {
    const cfg = getConfigTurma(turmaId);
    const pastaEntrada = DriveApp.getFolderById(cfg.ID_PASTA_ENTRADA);
    const pendentes = obterArquivosTextoPendentes(pastaEntrada);

    console.log(`\n[FILA][${turmaId}] Arquivos .txt pendentes:`);
    pendentes.forEach(f => {
      const tamanhoKB = Math.round(f.getSize() / 1024);
      console.log(`  - ${f.getName()} (${tamanhoKB} KB) | MIME: ${f.getMimeType()} | Modificado: ${f.getLastUpdated()}`);
    });
    if (pendentes.length === 0) console.log(`  [${turmaId}: fila vazia]`);
    console.log(`[FILA][${turmaId}] Total: ${pendentes.length} arquivo(s).`);
  });
}

/**
 * Lê o conteúdo em texto bruto de um arquivo.
 * @param {GoogleAppsScript.Drive.File} arquivo 
 * @returns {string}
 */
function lerConteudoArquivo(arquivo) {
  return arquivo.getBlob().getDataAsString('UTF-8');
}

/**
 * Salva o conteúdo formatado em um novo arquivo .md na pasta de resumos da turma.
 *
 * @param {string} titulo          - Nome do arquivo (sem .md)
 * @param {string} conteudo        - Conteúdo markdown
 * @param {string} idPastaResumos  - ID da pasta de resumos da turma (vem do TurmaRouter)
 * @returns {GoogleAppsScript.Drive.File}
 */
function salvarResumo(titulo, conteudo, idPastaResumos) {
  const pastaResumos = DriveApp.getFolderById(idPastaResumos);
  return pastaResumos.createFile(titulo + '.md', conteudo, MimeType.PLAIN_TEXT);
}

/**
 * Move um arquivo processado para a pasta de arquivados da turma.
 *
 * @param {GoogleAppsScript.Drive.File} arquivo
 * @param {string} idPastaArquivados - ID da pasta de arquivados da turma (vem do TurmaRouter)
 */
function arquivarArquivo(arquivo, idPastaArquivados) {
  const pastaArquivados = DriveApp.getFolderById(idPastaArquivados);
  arquivo.moveTo(pastaArquivados);
}
