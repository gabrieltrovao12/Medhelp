// ============================================================
// UTILITÁRIOS DE NOMENCLATURA E REGEX
// ============================================================

const NamingUtils = {
  detectarDisciplina: function(nomeArquivo) {
    const nomeLower = nomeArquivo.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    for (const [keyword, disciplina] of Object.entries(CONFIG.DISCIPLINAS)) {
      if (nomeLower.includes(keyword)) return disciplina;
    }
    return 'Medicina'; // Fallback
  },

  gerarNomeFlashcardLimpo: function(nomeOriginal) {
    // 1. Remove a extensão atual se houver (.md ou .pdf ou .txt)
    let nomeLimpo = nomeOriginal.replace(/\.(md|pdf|txt)$/i, '');
    
    // 2. Remove lixo inicial numérico e hifens (ex: "01 - [LHM] Dinâmica -> Dinâmica")
    nomeLimpo = nomeLimpo.replace(/^\d+\s*-\s*(?:[^-]+-\s*)?/, '');
    
    // 3. Remove indicativos legados (ex: "(Resumo)", "[Resumo]")
    nomeLimpo = nomeLimpo.replace(/\(Resumo\)/ig, '');
    nomeLimpo = nomeLimpo.replace(/\[Resumo\]/ig, '');
    
    // 4. Limpeza final de espaços
    nomeLimpo = nomeLimpo.trim();

    return `${nomeLimpo} - Flashcards.md`;
  },
  
  calcularLimiteFlashcardsTutoria: function(nomeArquivo, totalObjetivosGeral) {
    const barras     = (nomeArquivo.match(/\//g) || []).length;
    const nObjetivos = barras + 1;
    // Distribui o total proporcional a 55 flashcards no geral
    return Math.max(5, Math.round((nObjetivos / totalObjetivosGeral) * 55));
  }
};
