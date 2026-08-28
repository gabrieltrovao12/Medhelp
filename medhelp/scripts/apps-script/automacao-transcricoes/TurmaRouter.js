/**
 * TurmaRouter.js — automacao-transcricoes
 * ============================================================
 * Fonte de verdade por turma para o módulo de Transcrições.
 *
 * INSTRUÇÕES DE SETUP (CEUMA):
 * 1. Você deve criar as 4 pastas no seu próprio Drive.
 * 2. Pegue os IDs (código na URL de cada pasta) e preencha
 *    os campos marcados como '[PENDENTE]' no bloco 'CEUMA'.
 * 3. Faça clasp push após preencher.
 * ============================================================
 */

const TURMAS = {

  // ----------------------------------------------------------
  // TURMA: UNDB (operador técnico — conta principal)
  // ----------------------------------------------------------
  'UNDB': {
    /** Pasta onde o Colab deposita os .txt de transcrição */
    ID_PASTA_ENTRADA:    '1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh',
    /** Pasta de saída final — resumos .md prontos */
    ID_PASTA_RESUMOS:    '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',
    /** Pasta de arquivamento dos .txt já processados */
    ID_PASTA_ARQUIVADOS: '1R58WOeO0p3U51T05g-d-N9svziLSf9fL',
    /** Pasta onde ficam os áudios .m4a para deleção pós-processamento */
    ID_PASTA_AUDIOS:     '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
    /** Nome do monitor — usado em logs e notificações */
    MONITOR:             'João Gabriel R. Trovão',
  },

  // ----------------------------------------------------------
  // TURMA: CEUMA (operador técnico — pastas separadas no mesmo Drive)
  // PREENCHER APÓS CRIAR AS PASTAS
  // ----------------------------------------------------------
  'CEUMA': {
    ID_PASTA_ENTRADA:    '1M8aiwpKDCvdsf5Sfo-QqiQ_XfmqbjJBF',
    ID_PASTA_RESUMOS:    '1mU2kiF4kLiascykOTXL0Ul0L4qrDY6mT',
    ID_PASTA_ARQUIVADOS: '181of4x0woQd4HsivzS1ecaOZnQm5GJhp',
    ID_PASTA_AUDIOS:     '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
    MONITOR:             'Gabriel Torquato',
  },

};

// ============================================================
// FUNÇÕES DE DETECÇÃO E ACESSO
// ============================================================

/**
 * Detecta a turma de um arquivo usando sistema híbrido:
 *   - Sinal primário:   prefixo no nome do arquivo (ex: "CEUMA - TFC - ...")
 *   - Sinal secundário: ID da pasta de origem
 *   - Fallback final:   'QUARENTENA' — arquivo será abortado e logado
 *
 * @param {string} nomeArquivo - Nome do arquivo sem extensão
 * @param {string} pastaOrigemId - ID da pasta onde o arquivo foi encontrado
 * @returns {string} Sigla da turma ('UNDB' | 'CEUMA' | 'QUARENTENA')
 */
function detectarTurma(nomeArquivo, pastaOrigemId) {
  const nomeUpper = (nomeArquivo || '').toUpperCase();

  // Sinal primário: prefixo no nome ("SIGLA - ...")
  for (const sigla of Object.keys(TURMAS)) {
    if (nomeUpper.startsWith(sigla + ' -') || nomeUpper.startsWith(sigla + '-')) {
      console.log(`[TURMA_ROUTER] Turma detectada por prefixo de nome: ${sigla}`);
      return sigla;
    }
  }

  // Sinal secundário (fallback): pasta de entrada de origem
  for (const [sigla, cfg] of Object.entries(TURMAS)) {
    if (pastaOrigemId && pastaOrigemId === cfg.ID_PASTA_ENTRADA) {
      console.log(`[TURMA_ROUTER] Turma detectada por pasta de origem: ${sigla}`);
      return sigla;
    }
  }

  // Falha total → QUARENTENA
  console.warn(
    `[TURMA_ROUTER] QUARENTENA: não foi possível identificar a turma do arquivo ` +
    `"${nomeArquivo}" (pasta: ${pastaOrigemId}). ` +
    `Arquivo será abortado e mantido na pasta de entrada para revisão manual.`
  );
  return 'QUARENTENA';
}

/**
 * Retorna o objeto de configuração de uma turma pelo ID da sigla.
 * Retorna null se a sigla for 'QUARENTENA' ou não existir.
 *
 * @param {string} sigla - 'UNDB' | 'CEUMA'
 * @returns {Object|null} Config da turma ou null
 */
function getConfigTurma(sigla) {
  return TURMAS[sigla] || null;
}

/**
 * Retorna todas as siglas de turmas com IDs preenchidos (não-PENDENTE).
 * Usado pelo orquestrador para iterar apenas sobre turmas ativas.
 *
 * @returns {string[]} Array de siglas ativas, ex: ['UNDB'] ou ['UNDB', 'CEUMA']
 */
function getTurmasAtivas() {
  return Object.entries(TURMAS)
    .filter(([, cfg]) => cfg.ID_PASTA_ENTRADA && !cfg.ID_PASTA_ENTRADA.includes('[PENDENTE]'))
    .map(([sigla]) => sigla);
}
