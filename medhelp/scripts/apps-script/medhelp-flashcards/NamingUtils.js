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
    let nomeLimpo = (nomeOriginal || '').replace(/\.(md|pdf|txt)$/i, '');
    
    // 2. Remove apenas a numeração de lote inicial (ex: "01 - TFC - Aula" -> "TFC - Aula")
    nomeLimpo = nomeLimpo.replace(/^\d+\s*-\s*/, '');
    
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
  },
  
  detectarCategoria: function(nomeArquivo) {
    const nomeLower = (nomeArquivo || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (nomeLower.includes('tfc')) return 'TFC';
    if (nomeLower.includes('lhm')) return 'LHM';
    if (nomeLower.includes('conferencia') || nomeLower.includes('tutoria')) return 'Conferência';
    if (nomeLower.includes('lacuna')) return 'Lacuna Zero';
    return 'Geral';
  }
};
