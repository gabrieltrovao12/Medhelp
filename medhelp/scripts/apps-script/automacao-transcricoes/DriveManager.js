/**
 * DriveManager.js
 * Gerencia todas as interações com o Google Drive (pastas de entrada, arquivamento e exclusão).
 */

/**
 * Lê o cabeçalho AUDIOS_ORIGEM do .txt e exclui (move para lixeira)
 * todos os áudios correspondentes na pasta configurada em CONFIG.ID_PASTA_AUDIOS.
 * Falhas de exclusão são logadas mas não interrompem o fluxo principal.
 *
 * @param {string} textoBruto   - Conteúdo completo do .txt processado
 * @param {string} nomeArquivo  - Nome da aula (para logging)
 */
function excluirAudiosDaAula(textoBruto, nomeArquivo) {
  try {
    // Extrai a linha de metadados: **AUDIOS_ORIGEM:**nome1.m4a,nome2.m4a
    const match = textoBruto.match(/\*\*AUDIOS_ORIGEM:\*\*(.+)/);
    if (!match) {
      console.warn(`[ÁUDIO] Cabeçalho AUDIOS_ORIGEM não encontrado em "${nomeArquivo}". Nenhum áudio excluído.`);
      return;
    }

    const nomesAudios = match[1].trim().split(',').map(n => n.trim()).filter(Boolean);
    console.log(`[ÁUDIO] ${nomesAudios.length} áudio(s) identificado(s) para exclusão: ${nomesAudios.join(', ')}`);

    const pastaAudios = DriveApp.getFolderById(CONFIG.ID_PASTA_AUDIOS);

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
 * Utilitário: Lista os arquivos pendentes na pasta de entrada.
 * Execute manualmente para checar a fila no Apps Script Editor antes de acionar o pipeline.
 */
function listarFilaPendente() {
  const pastaEntrada = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA);
  const arquivos = pastaEntrada.getFilesByType(MimeType.PLAIN_TEXT);
  let count = 0;
  
  console.log('[FILA] Arquivos .txt pendentes na pasta de entrada:');
  while (arquivos.hasNext()) {
    const f = arquivos.next();
    const tamanhoKB = Math.round(f.getSize() / 1024);
    console.log(`  - ${f.getName()} (${tamanhoKB} KB) | Modificado: ${f.getLastUpdated()}`);
    count++;
  }
  
  if (count === 0) console.log('  [vazia]');
  console.log(`[FILA] Total: ${count} arquivo(s) aguardando processamento.`);
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
 * Salva o conteúdo formatado em um novo arquivo .md na pasta de resumos.
 * @param {string} titulo 
 * @param {string} conteudo 
 * @returns {GoogleAppsScript.Drive.File}
 */
function salvarResumo(titulo, conteudo) {
  const pastaResumos = DriveApp.getFolderById(CONFIG.ID_PASTA_RESUMOS);
  return pastaResumos.createFile(titulo + '.md', conteudo, MimeType.PLAIN_TEXT);
}

/**
 * Move um arquivo processado para a pasta de arquivados.
 * @param {GoogleAppsScript.Drive.File} arquivo 
 */
function arquivarArquivo(arquivo) {
  const pastaArquivados = DriveApp.getFolderById(CONFIG.ID_PASTA_ARQUIVADOS);
  arquivo.moveTo(pastaArquivados);
}
