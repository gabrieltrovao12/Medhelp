/**
 * TurmaRouter.js — medhelp-flashcards
 * ============================================================
 * Fonte de verdade por turma para o módulo de Flashcards.
 *
 * INSTRUÇÕES DE SETUP (CEUMA):
 * 1. Você deve criar as pastas no seu próprio Drive.
 * 2. Preencha os campos '[PENDENTE]' no bloco 'CEUMA' abaixo.
 * 3. Faça clasp push após preencher.
 * ============================================================
 */

const TURMAS = {

  // ----------------------------------------------------------
  // TURMA: UNDB (operador técnico — conta principal)
  // ----------------------------------------------------------
  'UNDB': {
    /** Pasta de entrada dos resumos .md gerados pelo módulo de transcrições */
    ID_PASTA_ENTRADA_RESUMOS:  '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',
    /** Pasta de entrada dos PDFs de tutoria */
    ID_PASTA_ENTRADA_TUTORIA:  '1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB',
    /** Pasta de saída geral (fallback quando categoria não tem pasta específica) */
    ID_PASTA_SAIDA_FLASHCARDS: '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA',
    /** Pastas de saída por categoria — saída preferencial quando disponível */
    PASTAS_SAIDA_CATEGORIAS: {
      'TFC':         '1MU8tqPAss0E8gAkky15eVQjStQWbhJEa',
      'LHM':         '1xeKf5DCbIWl_OTLggw5PHeeN4XTRU9dZ',
      'Conferência': '15sMBhmUoiO8MVHt2Lzo1X3K7SklRC5o8',
      'Lacuna Zero': '1Bkz6ElXUXJzyGxo_isC24S3TyEWleLOL',
      // Aliases para compatibilidade legada
      'Tutoria':     '15sMBhmUoiO8MVHt2Lzo1X3K7SklRC5o8',
      'Lacuna':      '1Bkz6ElXUXJzyGxo_isC24S3TyEWleLOL',
    },
    MONITOR: 'João Gabriel R. Trovão',
  },

  // ----------------------------------------------------------
  // TURMA: CEUMA (monitor parceiro — pastas compartilhadas)
  // PREENCHER APÓS RECEBER OS IDs DO MONITOR
  // Nota: sem subpastas por categoria na primeira iteração.
  // ----------------------------------------------------------
  'CEUMA': {
    ID_PASTA_ENTRADA_RESUMOS:  '1mU2kiF4kLiascykOTXL0Ul0L4qrDY6mT',
    ID_PASTA_ENTRADA_TUTORIA:  '1f6yaGoYPaBVgUsw5db08H79yu3ptPJkj',
    ID_PASTA_SAIDA_FLASHCARDS: '1qGfgH_QDk0o_3kfmLsd4IU_vZOcAD01l',
    PASTAS_SAIDA_CATEGORIAS:   {}, // Expandir depois do setup completo
    MONITOR: 'Gabriel Torquato',
  },

};

// ============================================================
// FUNÇÕES DE DETECÇÃO E ACESSO
// ============================================================

/**
 * Detecta a turma de um arquivo usando sistema híbrido:
 *   - Sinal primário:   prefixo no nome do arquivo (ex: "CEUMA - TFC - ...")
 *   - Sinal secundário: ID da pasta de origem
 *   - Fallback final:   'QUARENTENA'
 *
 * @param {string} nomeArquivo    - Nome do arquivo
 * @param {string} pastaOrigemId  - ID da pasta onde o arquivo foi encontrado
 * @returns {string} 'UNDB' | 'CEUMA' | 'QUARENTENA'
 */
function detectarTurma(nomeArquivo, pastaOrigemId) {
  const nomeUpper = (nomeArquivo || '').toUpperCase();

  // Sinal primário: prefixo no nome
  for (const sigla of Object.keys(TURMAS)) {
    if (nomeUpper.startsWith(sigla + ' -') || nomeUpper.startsWith(sigla + '-')) {
      console.log(`[TURMA_ROUTER] Turma detectada por prefixo: ${sigla}`);
      return sigla;
    }
  }

  // Sinal secundário: pasta de entrada de resumos
  for (const [sigla, cfg] of Object.entries(TURMAS)) {
    if (
      pastaOrigemId &&
      (pastaOrigemId === cfg.ID_PASTA_ENTRADA_RESUMOS ||
       pastaOrigemId === cfg.ID_PASTA_ENTRADA_TUTORIA)
    ) {
      console.log(`[TURMA_ROUTER] Turma detectada por pasta de origem: ${sigla}`);
      return sigla;
    }
  }

  console.warn(
    `[TURMA_ROUTER] QUARENTENA: turma não identificada para "${nomeArquivo}" ` +
    `(pasta: ${pastaOrigemId}). Arquivo abortado.`
  );
  return 'QUARENTENA';
}

/**
 * Retorna o objeto de configuração de uma turma.
 * @param {string} sigla
 * @returns {Object|null}
 */
function getConfigTurma(sigla) {
  return TURMAS[sigla] || null;
}

/**
 * Retorna o ID da pasta de saída de flashcards para uma turma + categoria.
 * Usa subpasta por categoria se disponível; caso contrário, pasta geral.
 *
 * @param {string} sigla      - 'UNDB' | 'CEUMA'
 * @param {string} categoria  - 'TFC' | 'LHM' | 'Conferência' | 'Lacuna Zero' | ''
 * @returns {string} ID da pasta de destino
 */
function obterPastaSaidaFlashcard(sigla, categoria) {
  const cfg = TURMAS[sigla];
  if (!cfg) return null;

  if (categoria && cfg.PASTAS_SAIDA_CATEGORIAS && cfg.PASTAS_SAIDA_CATEGORIAS[categoria]) {
    return cfg.PASTAS_SAIDA_CATEGORIAS[categoria];
  }
  return cfg.ID_PASTA_SAIDA_FLASHCARDS;
}

/**
 * Retorna todas as siglas de turmas com IDs de entrada preenchidos (não-PENDENTE).
 * @returns {string[]}
 */
function getTurmasAtivas() {
  return Object.entries(TURMAS)
    .filter(([, cfg]) => cfg.ID_PASTA_ENTRADA_RESUMOS && !cfg.ID_PASTA_ENTRADA_RESUMOS.includes('[PENDENTE]'))
    .map(([sigla]) => sigla);
}
