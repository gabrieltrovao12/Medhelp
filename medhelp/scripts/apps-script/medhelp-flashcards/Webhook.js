/**
 * Webhook.js
 * Ponto de entrada HTTP para o projeto Medhelp Flashcards.
 */

/**
 * Receptor de Webhook (HTTP POST).
 * Acionado diretamente pelo orquestrador automacao-transcricoes.
 * 
 * @param {Object} e - Evento de post do Apps Script
 * @returns {TextOutput} Resposta em formato JSON
 */
function doPost(e) {
  console.log("[WEBHOOK] Acionador externo recebido. Iniciando processamento de Flashcards de Resumos...");
  
  try {
    // Inicia o fluxo de resumos -> flashcards, que já lê a pasta de entrada
    processarFlashcardsDeResumos();
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "sucesso",
      mensagem: "Processamento de flashcards acionado e concluído."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    console.error(`[WEBHOOK ERRO FATAL] Falha no pipeline de Flashcards: ${err.message}`);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "erro",
      mensagem: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
