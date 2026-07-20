// ============================================================
// CONFIGURAÇÃO DOS GATILHOS (TRIGGERS)
// ============================================================

/**
 * Executa uma única vez para configurar os gatilhos temporais do projeto de Flashcards.
 * Substitui os triggers antigos para evitar duplicações.
 */
function setupFlashcardsTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  
  // Limpa triggers existentes
  for (let i = 0; i < triggers.length; i++) {
    const handler = triggers[i].getHandlerFunction();
    if (handler === 'processarFlashcardsDeResumos' || handler === 'processarFlashcardsDeTutoria') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Cria trigger para Resumos: roda a cada 4 horas
  ScriptApp.newTrigger('processarFlashcardsDeResumos')
    .timeBased()
    .everyHours(4)
    .create();

  // Cria trigger para Tutoria: roda a cada 6 horas
  ScriptApp.newTrigger('processarFlashcardsDeTutoria')
    .timeBased()
    .everyHours(6)
    .create();

  console.log("✅ Triggers configurados com sucesso! Resumos a cada 4h e Tutoria a cada 6h.");
}
