// ============================================================
// UTILITÁRIO DE NOTIFICAÇÕES (E-MAIL)
// ============================================================

const NotificationUtils = {
  /**
   * Envia um e-mail de relatório de sucesso.
   * 
   * @param {string} moduleName O nome do módulo (ex: 'Resumos' ou 'Tutoria')
   * @param {number} successCount Quantidade de itens processados com sucesso
   * @param {number} duration Duracao em segundos
   * @param {string} outputFolder Pasta destino para formatar a mensagem
   */
  sendSuccessReport: function(moduleName, successCount, duration, outputFolder) {
    if (successCount <= 0) return;

    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: `[Medhelp ✅] ${successCount} flashcard(s) gerado(s) a partir de ${moduleName}`,
        body: `Relatório do ciclo de Flashcards (${moduleName}) — ${new Date().toLocaleString('pt-BR')}\n\n✅ Itens processados com sucesso: ${successCount}\nTempo de execução: ${duration}s\n\nArquivos prontos em: Drive → ${outputFolder}/`
      });
      console.log('[EMAIL] Notificação enviada.');
    } catch (e) {
      console.warn(`[EMAIL] Falha ao enviar notificação: ${e.message}`);
    }
  }
};
