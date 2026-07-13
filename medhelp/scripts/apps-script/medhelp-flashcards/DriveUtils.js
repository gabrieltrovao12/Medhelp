// ============================================================
// SERVIÇOS E UTILITÁRIOS DO GOOGLE DRIVE
// ============================================================

const DriveUtils = {
  /**
   * Obtém os arquivos recentes ignorando MIME types específicos (pega PDFs e MDs).
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

  obterOuCriarSubpasta: function(nomePasta) {
    const pastaRaiz = DriveApp.getFolderById(CONFIG.ID_PASTA_SAIDA_FLASHCARDS);
    const subpastas = pastaRaiz.getFoldersByName(nomePasta);
    if (subpastas.hasNext()) {
      return subpastas.next();
    }
    return pastaRaiz.createFolder(nomePasta);
  },

  checkIfFileExists: function(nome, subpastaNome) {
    const folder = this.obterOuCriarSubpasta(subpastaNome);
    const files = folder.getFilesByName(nome);
    if (files.hasNext()) return files.next();
    return null;
  },

  saveMarkdown: function(nomeDestino, content, subpastaNome, metaDataHeader) {
    const folder = this.obterOuCriarSubpasta(subpastaNome);
    
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
