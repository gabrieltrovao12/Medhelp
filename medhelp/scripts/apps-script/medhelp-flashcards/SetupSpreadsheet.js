function criarPlanilhaLogistica() {
  let folderIt = DriveApp.getFoldersByName("Logística - Drive");
  let folder = folderIt.hasNext() ? folderIt.next() : DriveApp.getRootFolder();

  const ss = SpreadsheetApp.create("Medhelp - Dashboard Automático");
  DriveApp.getFileById(ss.getId()).moveTo(folder);

  const sheetLog = ss.getSheets()[0];
  sheetLog.setName("Log");
  sheetLog.appendRow(['Data', 'Hora', 'Semana', 'Script', 'Arquivo', 'Disciplina', 'Status', 'Duração (s)', 'Modelo']);
  sheetLog.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4A90D9').setFontColor('#FFFFFF');
  sheetLog.setFrozenRows(1);

  const sheetDash = ss.insertSheet("Dashboard - Visão Semanal");
  sheetDash.getRange("A1").setValue("DASHBOARD DE PRODUÇÃO MEDHELP");
  sheetDash.getRange("A1").setFontSize(16).setFontWeight("bold");
  sheetDash.getRange("A3").setValue("A aba Log guardará o histórico. Crie gráficos e tabelas dinâmicas nesta aba referenciando a aba Log.");

  PropertiesService.getScriptProperties().setProperty('SHEETS_LOG_ID', ss.getId());
  console.log("✅ Planilha criada com sucesso na pasta Logística. URL: " + ss.getUrl());
}
