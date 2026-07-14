/**
 * Config.js
 * Centraliza configurações e IDs do projeto.
 */

const CONFIG = {
  // Pasta onde o Colab deposita os .txt com transcrição + slides
  ID_PASTA_ENTRADA:     '1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh',

  // Pasta de saída final — onde os .md vão para o Obsidian
  ID_PASTA_RESUMOS:     '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',

  // Pasta de arquivamento dos .txt já processados
  ID_PASTA_ARQUIVADOS:  '1R58WOeO0p3U51T05g-d-N9svziLSf9fL',
  
  // Pasta onde estão os áudios m4a para exclusão pós-processamento
  ID_PASTA_AUDIOS:      '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',

  // Modelo do LLM
  MODELO_GEMINI:        'gemini-3.5-flash',

  // Trava de segurança: GAS mata scripts após 6 min. Usamos 4.5 min.
  TEMPO_LIMITE_MS:      4.5 * 60 * 1000,

  // Pausa Preditiva (Throttling): Evita erro 429 estourando limites RPM.
  INTERVALO_ENTRE_ARQUIVOS_MS: 6000,

  // Exponential Backoff: Tentativas máximas por arquivo
  MAX_RETRIES:          3,
};
