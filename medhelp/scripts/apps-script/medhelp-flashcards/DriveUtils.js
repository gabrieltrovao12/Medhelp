// ============================================================
// SERVIÇOS E UTILITÁRIOS DO GOOGLE DRIVE
// ============================================================

const DriveUtils = {
  /**
   * Obtém os arquivos recentes de uma pasta (PDFs e MDs).
   * @param {string} folderId - ID da pasta a escanear
   * @returns {GoogleAppsScript.Drive.File[]}
   */
  getArquivosRecentes: function(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const recentes = [];

    const limiteMs = CONFIG.HORAS_RECENTES * 60 * 60 * 1000;
    const limiteDate = new Date(Date.now() - limiteMs);

    while (files.hasNext()) {
      const file = files.next();
      const dataMaisRecente = Math.max(file.getDateCreated().getTime(), file.getLastUpdated().getTime());

      if (dataMaisRecente >= limiteDate.getTime()) {
        recentes.push(file);
      }
    }
    return recentes;
  },

  /**
   * Obtém ou cria uma subpasta pelo nome dentro de uma pasta raiz.
   *
   * @param {string} nomePasta     - Nome da subpasta (ex: disciplina)
   * @param {string} categoria     - Categoria do flashcard (ex: 'TFC')
   * @param {string} idPastaRaiz   - ID da pasta raiz (vem do TurmaRouter)
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  obterOuCriarSubpastaById: function(nomePasta, categoria, idPastaRaiz) {
    const pastaRaiz = DriveApp.getFolderById(idPastaRaiz);

    // Evita criar subpastas redundantes quando disciplina coincide com categoria
    if (nomePasta && categoria &&
        (nomePasta.toLowerCase() === categoria.toLowerCase() || nomePasta.toLowerCase() === 'geral')) {
      return pastaRaiz;
    }

    const subpastas = pastaRaiz.getFoldersByName(nomePasta);
    if (subpastas.hasNext()) {
      return subpastas.next();
    }
    return pastaRaiz.createFolder(nomePasta);
  },

  /**
   * Versão legada de obterOuCriarSubpasta — resolve via TurmaRouter UNDB.
   * Mantida para compatibilidade com checkIfFileExists e Trigger_Tutoria legado.
   * @deprecated Prefira obterOuCriarSubpastaById
   */
  obterOuCriarSubpasta: function(nomePasta, categoria) {
    // Resolve o ID via TurmaRouter para a UNDB (padrão da conta principal)
    const idPastaRaiz = obterPastaSaidaFlashcard('UNDB', categoria);
    if (!idPastaRaiz || idPastaRaiz.includes('[PENDENTE]')) {
      throw new Error(`[DriveUtils] Pasta para categoria "${categoria}" não encontrada no TurmaRouter (UNDB).`);
    }
    return this.obterOuCriarSubpastaById(nomePasta, categoria, idPastaRaiz);
  },

  /**
   * Verifica se um arquivo já existe na pasta de destino (UNDB por padrão).
   * @param {string} nome
   * @param {string} subpastaNome
   * @param {string} categoria
   * @returns {GoogleAppsScript.Drive.File|null}
   */
  checkIfFileExists: function(nome, subpastaNome, categoria) {
    const folder = this.obterOuCriarSubpasta(subpastaNome, categoria);
    const files = folder.getFilesByName(nome);
    if (files.hasNext()) return files.next();
    return null;
  },

  /**
   * Salva um arquivo Markdown em uma pasta de destino específica (bi-turma).
   * Recebe o ID da pasta raiz diretamente — agnóstico de CONFIG.
   *
   * @param {string} nomeDestino    - Nome do arquivo (ex: "TFC - Fisiologia.md")
   * @param {string} content        - Conteúdo dos flashcards gerados
   * @param {string} subpastaNome   - Nome da subpasta (disciplina)
   * @param {string} metaDataHeader - Linha de metadado (fonte original)
   * @param {string} idPastaRaiz    - ID da pasta raiz de destino (vem do TurmaRouter)
   */
  saveMarkdownToFolder: function(nomeDestino, content, subpastaNome, metaDataHeader, idPastaRaiz) {
    const folder = this.obterOuCriarSubpastaById(subpastaNome, subpastaNome, idPastaRaiz);

    const cabecalho = [
      `# ${nomeDestino.replace(/\.md$/i, '')}`,
      ``,
      `> **Disciplina/Tema:** ${subpastaNome}`,
      `> **Gerado em:** ${new Date().toLocaleString('pt-BR')}`,
      metaDataHeader,
      ``,
      `---`,
      ``
    ].join('\n');

    folder.createFile(nomeDestino, cabecalho + content, MimeType.PLAIN_TEXT);
  },

  /**
   * Versão legada de saveMarkdown — usa CONFIG para resolver a pasta.
   * Mantida para compatibilidade com Trigger_Tutoria.js.
   * @deprecated Prefira saveMarkdownToFolder
   */
  saveMarkdown: function(nomeDestino, content, subpastaNome, metaDataHeader, categoria) {
    const folder = this.obterOuCriarSubpasta(subpastaNome, categoria);

    const cabecalho = [
      `# ${nomeDestino.replace(/\.md$/i, '')}`,
      ``,
      `> **Disciplina/Tema:** ${subpastaNome}`,
      `> **Gerado em:** ${new Date().toLocaleString('pt-BR')}`,
      metaDataHeader,
      ``,
      `---`,
      ``
    ].join('\n');

    folder.createFile(nomeDestino, cabecalho + content, MimeType.PLAIN_TEXT);
  }
};

