// ============================================================
// LOGGER DE PRODUÇÃO — GOOGLE SHEETS
// ============================================================
// Para ativar: crie uma planilha no Google Sheets, copie o ID
// da URL e cole em CONFIG.ID_SHEETS_LOG (no Config.js).
// Colunas: Data | Hora | Script | Arquivo | Disciplina | Status | Tempo(s) | Modelo
// ============================================================

const SheetsLogger = {

  /**
   * Registra uma linha de produção na planilha de controle.
   * Falha silenciosamente — nunca interrompe o pipeline principal.
   *
   * @param {Object} dados
   * @param {string} dados.script     - ex: "Resumos", "Tutoria", "AutomacaoTranscricoes"
   * @param {string} dados.arquivo    - nome do arquivo processado
   * @param {string} dados.disciplina - disciplina detectada
   * @param {string} dados.status     - "SUCESSO" | "ERRO" | "PULADO"
   * @param {number} dados.duracao    - tempo em segundos
   */
  registrar: function(dados) {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEETS_LOG_ID');
    if (!sheetId) return; // Sem planilha configurada — ignora silenciosamente

    try {
      const ss    = SpreadsheetApp.openById(sheetId);
      const sheet = ss.getSheetByName('Log') || ss.insertSheet('Log');

      // Cria cabeçalho automaticamente se a planilha estiver vazia
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Data', 'Hora', 'Semana', 'Script', 'Arquivo', 'Disciplina', 'Status', 'Duração (s)', 'Modelo']);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4A90D9').setFontColor('#FFFFFF');
        sheet.setFrozenRows(1);
      }

      const agora = new Date();
      const data  = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      const hora  = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'HH:mm:ss');
      
      // Função simples para calcular ISO Week
      const d = new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
      const semanaStr = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;

      sheet.appendRow([
        data,
        hora,
        semanaStr,
        dados.script     || '—',
        dados.arquivo    || '—',
        dados.disciplina || '—',
        dados.status     || '—',
        dados.duracao    || 0,
        CONFIG.GEMINI_MODEL || '—'
      ]);

    } catch (e) {
      console.warn(`[SHEETS] Falha ao registrar log: ${e.message}`);
    }
  }
};
