/**
 * Config.js
 * Configurações GLOBAIS de runtime — modelos, timeouts, throttling.
 *
 * IMPORTANTE: IDs de pastas do Google Drive NÃO ficam aqui.
 * Toda configuração de pastas por turma está em TurmaRouter.js.
 */

const CONFIG = {
  // Modelo primário do LLM (pinado em versão estável — NÃO usar aliases "-latest")
  MODELO_GEMINI:        'gemini-3.5-flash',

  // Cadeia de fallback ordenada: ativada sequencialmente quando o modelo anterior
  // retorna 503/429 após esgotar MAX_RETRIES, ou falha com 404.
  MODELOS_FALLBACK: ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-2.5-flash'],

  // Trava de segurança: GAS mata scripts após 6 min. Usamos 4.5 min.
  TEMPO_LIMITE_MS:      4.5 * 60 * 1000,

  // Pausa Preditiva (Throttling): Evita erro 429 estourando limites RPM.
  INTERVALO_ENTRE_ARQUIVOS_MS: 6000,

  // Exponential Backoff: Tentativas máximas POR MODELO antes de escalar para o fallback
  MAX_RETRIES:          4,
};
