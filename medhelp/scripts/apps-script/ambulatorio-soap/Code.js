/**
 * ============================================================================
 *               MEDHELP - PIPELINE AUTOMATIZADO AMBULATÓRIO SOAP
 * ============================================================================
 * Arquivo Único Consolidado para cópia fácil no Editor do Google Apps Script.
 * 
 * Funcionalidade:
 * Google Forms (Mobile) ➔ Google Apps Script ➔ Gemini API ➔ Email + Obsidian (.md)
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURAÇÃO CENTRALIZADA
// ============================================================================
const CONFIG = {
  // Pasta no Google Drive onde os arquivos .md do Ambulatório serão salvos
  // (Esta pasta deve estar sincronizada com seu cofre do Obsidian local)
  // ⚠️ PREENCHA AQUI COM O ID DA SUA PASTA DO DRIVE
  ID_PASTA_CASOS_MD: 'COLE_O_ID_DA_PASTA_AQUI',

  // Modelo da API do Gemini a ser utilizado
  MODELO_GEMINI: 'gemini-3.5-flash-lite',

  // Trava de segurança (GAS cancela execuções com 6 minutos. Usamos 4.5 minutos)
  TEMPO_LIMITE_MS: 4.5 * 60 * 1000,

  // Tentativas máximas no Exponential Backoff
  MAX_RETRIES: 3,
};

// ============================================================================
// 2. INSTRUÇÃO DE SISTEMA (PROMPT OCANES)
// ============================================================================
const SYSTEM_INSTRUCTION_SOAP = `**OBJETIVO:**
Estruturar dados clínicos taquigráficos brutos (palavras-chave soltas, abreviações e siglas) em um registro médico formal completo no padrão SOAP (Subjetivo, Objetivo, Avaliação, Plano). O documento final deve ser formatado em Markdown para publicação no Obsidian e deve incluir auditoria de lacunas clínicas e perguntas de Active Recall.

**CONTEXTO:**
Os dados de entrada vêm de um formulário de captação rápida preenchido no celular durante atendimento ambulatorial. Cada campo pode conter:
- Texto taquigráfico bruto (ex: "dor peito aperto qdo anda 2m melhora sentado")
- Checkboxes de coleta marcados (indicam O QUE o estudante coletou)
- Campos vazios ou não preenchidos

Os checkboxes NÃO são dados clínicos — são indicadores do que foi investigado. Use-os para a AUDITORIA DE LACUNAS:
- Itens NÃO marcados nos checkboxes representam dados que o estudante ESQUECEU de coletar.
- Se um item do checklist de Anamnese não foi marcado, registre: [LACUNA ANAMNESE: item não investigado]
- Se um item do checklist de Sinais Vitais não foi marcado, registre: [LACUNA SSVV: parâmetro não aferido]
- Se um item do checklist de Exame Físico não foi marcado E é relevante para a hipótese diagnóstica, registre: [LACUNA EF: sistema não examinado]

**DADOS DO FORMULÁRIO (8 CAMPOS):**
Os dados do paciente serão fornecidos no seguinte formato:

<ID_PACIENTE>
[Campo 1: Iniciais, Idade, Sexo]
</ID_PACIENTE>

<QUEIXA_HMA>
[Campo 2: Texto taquigráfico da queixa e história clínica]
</QUEIXA_HMA>

<CHECKLIST_ANAMNESE>
[Campo 3: Itens marcados no checklist de anamnese, separados por vírgula. Se vazio, NENHUM item foi investigado.]
</CHECKLIST_ANAMNESE>

<CHECKLIST_SSVV>
[Campo 4: Itens marcados no checklist de sinais vitais, separados por vírgula. Se vazio, NENHUM sinal vital foi aferido.]
</CHECKLIST_SSVV>

<VALORES_SSVV>
[Campo 5: Valores numéricos dos sinais vitais em bloco. Se vazio, nenhum valor foi registrado.]
</VALORES_SSVV>

<CHECKLIST_EXAME_FISICO>
[Campo 6: Itens marcados no checklist de exame físico, separados por vírgula. Se vazio, NENHUM sistema foi examinado.]
</CHECKLIST_EXAME_FISICO>

<ACHADOS_EXAME_FISICO>
[Campo 7: Texto taquigráfico com achados do exame físico. Se vazio, nenhum achado foi registrado.]
</ACHADOS_EXAME_FISICO>

<HIPOTESE_CONDUTA>
[Campo 8: Texto taquigráfico com hipótese diagnóstica e conduta. Se vazio, nenhuma hipótese foi formulada.]
</HIPOTESE_CONDUTA>

**AÇÕES:**
1. **Decodificação Taquigráfica**: Traduza TODAS as abreviações, siglas e palavras soltas para linguagem médica formal (nível Guyton/Robbins), mantendo fidelidade absoluta ao dado original. Ex: "dor peito aperto qdo anda" → "Precordialgia de caráter constritivo desencadeada aos esforços".
2. **Estruturação SOAP**: Organize os dados traduzidos nos 4 quadrantes:
   - **S (Subjetivo)**: Campo 1 (ID) + Campo 2 (HMA) traduzidos.
   - **O (Objetivo)**: Campos 4-7 (SSVV + Exame Físico) traduzidos e formatados.
   - **A (Avaliação)**: Campo 8 (Hipótese) expandida com nomenclatura CID-10 quando possível.
   - **P (Plano)**: Campo 8 (Conduta) expandida com dosagens padrão quando mencionadas.
3. **Auditoria de Lacunas**: Execute o cruzamento entre checklists marcados vs. itens relevantes para a hipótese diagnóstica. Gere tags [LACUNA: ...] para cada omissão clique-relevante.
4. **Active Recall**: Gere exatamente 3 perguntas clínicas contextualizadas ao caso (diagnóstico diferencial, fisiopatologia, conduta de primeira linha).

**NORMAS:**
1. É TERMINANTEMENTE PROIBIDO inventar dados clínicos (sinais vitais, achados de exame, diagnósticos) que NÃO foram fornecidos nos campos de entrada. Se um campo estiver vazio, registre "Não informado" ou a tag [LACUNA] apropriada.
2. É PROIBIDO adicionar condutas terapêuticas, dosagens ou exames que o estudante NÃO mencionou no Campo 8, a menos que esteja expandindo uma abreviação óbvia (ex: "AAS" → "Ácido Acetilsalicílico 100mg").
3. É PROIBIDO usar parágrafos corridos. Use EXCLUSIVAMENTE bullet points e tópicos curtos.
4. É PROIBIDO incluir saudações, prólogos, epílogos ou comentários fora da estrutura SOAP.
5. TODOS os checkboxes da Anamnese disponíveis são: "Início e duração dos sintomas", "Fatores de melhora / piora", "Sintomas associados", "Medicações em uso", "Antecedentes pessoais (comorbidades)", "Antecedentes familiares", "Hábitos de vida (tabagismo, etilismo)", "Alergias".
6. TODOS os checkboxes de SSVV disponíveis são: "PA (Pressão Arterial)", "FC (Frequência Cardíaca)", "FR (Frequência Respiratória)", "SpO2 (Saturação)", "Tax (Temperatura Axilar)", "Glicemia Capilar".
7. TODOS os checkboxes de Exame Físico disponíveis são: "Estado Geral e Nível de Consciência", "Cabeça e Pescoço (orofaringe, tireoide, linfonodos)", "Aparelho Cardiovascular (ACV — ausculta, pulsos, perfusão)", "Aparelho Respiratório (AP — ausculta, padrão, expansibilidade)", "Abdome (inspeção, palpação, RHA)", "Extremidades (edema, pulsos periféricos)", "Pele e Mucosas", "Exame Neurológico (força, sensibilidade, reflexos)", "Aparelho Locomotor (articulações, amplitude de movimento)".

**EXEMPLOS:**

**Input:**
<ID_PACIENTE>MJS, 45a, F</ID_PACIENTE>
<QUEIXA_HMA>dor lombar irradia perna dir 3d choque piora andar</QUEIXA_HMA>
<CHECKLIST_ANAMNESE>Início e duração dos sintomas, Fatores de melhora / piora, Medicações em uso</CHECKLIST_ANAMNESE>
<CHECKLIST_SSVV>PA (Pressão Arterial), FC (Frequência Cardíaca)</CHECKLIST_SSVV>
<VALORES_SSVV>140x90 90bpm</VALORES_SSVV>
<CHECKLIST_EXAME_FISICO>Aparelho Locomotor (articulações, amplitude de movimento), Exame Neurológico (força, sensibilidade, reflexos)</CHECKLIST_EXAME_FISICO>
<ACHADOS_EXAME_FISICO>lasegue pos dir forca preservada</ACHADOS_EXAME_FISICO>
<HIPOTESE_CONDUTA>lombociatalgia pedir rx dar aine</HIPOTESE_CONDUTA>

**Output Esperado:**
---
tags:
  - ambulatorio
  - soap
  - lombociatalgia
data: 2026-07-29
paciente: MJS
---

## S — Subjetivo

- **Identificação:** M.J.S., 45 anos, sexo feminino
- **Queixa Principal:** Lombalgia com irradiação para membro inferior direito há 3 dias
- **HMA:** Paciente relata dor em região lombar com irradiação em trajeto ciático para membro inferior direito, com início há 3 dias. Refere caráter em "choque elétrico", com piora à deambulação
- **Investigado:** Início e duração ✓ | Fatores de melhora/piora ✓ | Medicações em uso ✓
- [LACUNA ANAMNESE: Sintomas associados não investigados]
- [LACUNA ANAMNESE: Antecedentes pessoais (comorbidades) não investigados]
- [LACUNA ANAMNESE: Alergias não investigadas]

## O — Objetivo

### Sinais Vitais
- **PA:** 140 x 90 mmHg (↑)
- **FC:** 90 bpm
- [LACUNA SSVV: FR não aferida]
- [LACUNA SSVV: SpO2 não aferida]

### Exame Físico
- **Aparelho Locomotor:** Sinal de Lasègue positivo à direita
- **Exame Neurológico:** Força muscular preservada em membros inferiores
- [LACUNA EF: Estado Geral e Nível de Consciência não avaliados]

## A — Avaliação

- **Hipótese Diagnóstica Principal:** Lombociatalgia (CID-10: M54.4 — Lumbago com ciática)
- **Diagnósticos Diferenciais a Considerar:** Hérnia discal lombar (L4-L5 ou L5-S1), Síndrome do piriforme

## P — Plano

- Solicitado Radiografia de coluna lombar (AP + Perfil)
- Prescrito Anti-inflamatório Não Esteroidal (AINE) — posologia a definir
- Orientações de repouso relativo e retorno para reavaliação

---

## 🧠 Active Recall

1. Qual o trajeto dermatômico esperado para compressão radicular em L5 vs. S1, e como diferenciá-los ao exame neurológico?
2. Quais são os sinais de alarme (red flags) que indicam investigação urgente com ressonância magnética na lombalgia aguda?
3. Por que a Manobra de Lasègue é considerada positiva e qual a fisiopatologia da dor irradiada durante sua execução?

**SAÍDA:**
Apresentar a saída EXCLUSIVAMENTE no formato Markdown acima, incluindo o bloco YAML frontmatter no topo, as 4 seções SOAP, e as 3 perguntas de Active Recall ao final.`;

// ============================================================================
// 3. ORQUESTRADOR CENTRAL (MAIN TRIGGER)
// ============================================================================

/**
 * Função acionada ao enviar o Google Form.
 * @param {Object} e - Evento de submissão do Google Forms
 */
function processarCasoClinico(e) {
  const tempoInicio = Date.now();

  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não configurada nas Propriedades do Script.');
    return;
  }

  const valores = e.values;
  const timestamp         = valores[0] || '';
  const idPaciente        = valores[1] || 'Paciente não identificado';
  const queixaHma         = valores[2] || '';
  const checkAnamnese     = valores[3] || '';
  const checkSsvv         = valores[4] || '';
  const valoresSsvv       = valores[5] || '';
  const checkExameFisico  = valores[6] || '';
  const achadosExame      = valores[7] || '';
  const hipoteseConduta   = valores[8] || '';

  console.log(`[INÍCIO] Caso Clínico recebido: ${idPaciente}`);

  const dataHoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Montagem estruturada do input
  const promptUsuario = `<ID_PACIENTE>${idPaciente}</ID_PACIENTE>
<QUEIXA_HMA>${queixaHma}</QUEIXA_HMA>
<CHECKLIST_ANAMNESE>${checkAnamnese}</CHECKLIST_ANAMNESE>
<CHECKLIST_SSVV>${checkSsvv}</CHECKLIST_SSVV>
<VALORES_SSVV>${valoresSsvv}</VALORES_SSVV>
<CHECKLIST_EXAME_FISICO>${checkExameFisico}</CHECKLIST_EXAME_FISICO>
<ACHADOS_EXAME_FISICO>${achadosExame}</ACHADOS_EXAME_FISICO>
<HIPOTESE_CONDUTA>${hipoteseConduta}</HIPOTESE_CONDUTA>

DATA_DO_ATENDIMENTO: ${dataHoje}`;

  console.log('[Gemini API] Iniciando chamada estruturada...');
  const soapGerado = chamarGeminiAPI(promptUsuario, apiKey, SYSTEM_INSTRUCTION_SOAP);

  if (!soapGerado) {
    console.error('[FALHA] Sem retorno válido do LLM.');
    SheetsLogger.registrar({
      script: 'AmbulatorioSOAP',
      arquivo: idPaciente,
      disciplina: 'Ambulatório',
      status: 'ERRO_API',
      duracao: Math.round((Date.now() - tempoInicio) / 1000)
    });
    return;
  }

  // Entrega por E-mail (Notificação Rápida)
  try {
    enviarEmailSOAP(idPaciente, soapGerado, dataHoje);
    console.log('[EMAIL] Enviado com sucesso.');
  } catch (err) {
    console.error(`[EMAIL ERRO] ${err.message}`);
  }

  // Entrega no Google Drive (Cofre Obsidian .md)
  try {
    salvarArquivoMD(idPaciente, soapGerado, dataHoje, hipoteseConduta);
    console.log('[DRIVE] Arquivo .md salvo com sucesso.');
  } catch (err) {
    console.error(`[DRIVE ERRO] ${err.message}`);
  }

  // Registro na Planilha de Log
  SheetsLogger.registrar({
    script: 'AmbulatorioSOAP',
    arquivo: idPaciente,
    disciplina: 'Ambulatório',
    status: 'SUCESSO',
    duracao: Math.round((Date.now() - tempoInicio) / 1000)
  });

  console.log(`[SUCESSO] Fluxo concluído em ${Math.round((Date.now() - tempoInicio) / 1000)}s.`);
}

// ============================================================================
// 4. CLIENTE RESILIENTE GEMINI API
// ============================================================================

/**
 * Executa chamadas HTTP com Exponential Backoff e Jitter
 */
function fetchGeminiWithResilience(url, payload) {
  const startTime = Date.now();
  const MAX_EXECUTION_TIME_MS = 300000;
  const BASE_DELAY_MS = 1000;
  const CAP_DELAY_MS = 60000;
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true 
  };

  let attempt = 1;

  while (true) {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (e) {
      jsonResponse = { error: { code: statusCode, message: responseText } };
    }

    const errorCode = (jsonResponse.error && jsonResponse.error.code) ? jsonResponse.error.code : statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      return jsonResponse;
    }

    if (errorCode === 400 || errorCode === 401) {
      throw new Error(`Erro Crítico [HTTP ${errorCode}]: ${responseText}`);
    }

    if (errorCode === 503 || errorCode === 429) {
      const elapsedMs = Date.now() - startTime;
      
      if (elapsedMs >= MAX_EXECUTION_TIME_MS) {
        throw new Error('Runtime Safety Timeout ultrapassado.');
      }

      const tempCap = Math.min(CAP_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
      const sleepMs = Math.random() * tempCap;

      if (elapsedMs + sleepMs >= MAX_EXECUTION_TIME_MS) {
        throw new Error('Runtime Safety Timeout iminente.');
      }

      console.log(`[HTTP ${errorCode}] Tentativa nº ${attempt} falhou. Pausa mitigadora Full Jitter: ${Math.round(sleepMs)}ms.`);
      Utilities.sleep(sleepMs);
      attempt++;
    } else {
      throw new Error(`Erro Crítico não-transiente [HTTP ${errorCode}]: ${responseText}`);
    }
  }
}

function chamarGeminiAPI(promptUsuario, apiKey, systemInstruction) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ parts: [{ text: promptUsuario }] }],
    generationConfig: { temperature: 0.15 }
  };

  try {
    const json = fetchGeminiWithResilience(url, payload);
    const candidate = json.candidates && json.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return null;
    }
    return candidate.content.parts[0].text;
  } catch (e) {
    console.error(`[ERRO API] ${e.message}`);
    return null;
  }
}

// ============================================================================
// 5. DISTRIBUIÇÃO E FORMATADORES
// ============================================================================

function enviarEmailSOAP(idPaciente, soapMarkdown, data) {
  const iniciais = idPaciente.split(',')[0].trim();
  const soapHtml = converterMarkdownParaHtml(soapMarkdown);
  const assunto = `[Ambulatório ✅] ${data} — ${iniciais}`;

  const corpoHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 12px; background-color: #f4f6f8; color: #1e2022; }
    .card { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e1e4e6; }
    .header { background: #1a1a2e; color: #ffffff; padding: 12px 18px; border-radius: 8px 8px 0 0; text-align: center; }
    h2 { color: #0f3460; font-size: 16px; border-bottom: 2px solid #e1e4e6; padding-bottom: 4px; }
    li { font-size: 14px; margin-bottom: 5px; }
    .lacuna { background: #fff3cd; color: #856404; padding: 6px 10px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 6px 0; font-size: 13px; }
    .recall { background: #e8f4f8; color: #17a2b8; padding: 8px 12px; border-left: 4px solid #17a2b8; border-radius: 4px; margin: 6px 0; font-size: 13px; }
    .footer { text-align: center; font-size: 11px; color: #888; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <strong>📋 SOAP — ${iniciais}</strong> • ${data}
  </div>
  <div class="card">
    ${soapHtml}
  </div>
  <div class="footer">
    Medhelp Clinical Pipeline • Google Apps Script + Gemini
  </div>
</body>
</html>`;

  MailApp.sendEmail({
    to: Session.getEffectiveUser().getEmail(),
    subject: assunto,
    htmlBody: corpoHtml
  });
}

function converterMarkdownParaHtml(md) {
  // Remove Frontmatter
  md = md.replace(/^---[\s\S]*?---\s*\n/m, '');

  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[LACUNA[^\]]*\]/g, '<div class="lacuna">⚠️ $&</div>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^(\d+\.\s.+)$/gm, '<div class="recall">$1</div>')
    .replace(/\n\n/g, '<br><br>');
}

function salvarArquivoMD(idPaciente, soapMarkdown, data, hipotese) {
  const iniciais = idPaciente.split(',')[0].trim();
  let hipoteseNome = 'Caso Clínico';
  
  if (hipotese && hipotese.trim().length > 0) {
    hipoteseNome = hipotese.trim().split(/\s+/).slice(0, 3).join(' ');
    hipoteseNome = hipoteseNome.charAt(0).toUpperCase() + hipoteseNome.slice(1);
    hipoteseNome = hipoteseNome.replace(/[\/\\:*?"<>|]/g, '');
  }

  const nomeArquivo = `${data} - ${iniciais} - ${hipoteseNome}.md`;
  const pasta = DriveApp.getFolderById(CONFIG.ID_PASTA_CASOS_MD);
  pasta.createFile(nomeArquivo, soapMarkdown, MimeType.PLAIN_TEXT);
}

// ============================================================================
// 6. LOGGER DE PRODUÇÃO (GOOGLE SHEETS)
// ============================================================================
const SheetsLogger = {
  registrar: function(dados) {
    const sheetId = PropertiesService.getScriptProperties().getProperty('SHEETS_LOG_ID');
    if (!sheetId) return;

    try {
      const ss = SpreadsheetApp.openById(sheetId);
      const sheet = ss.getSheetByName('Log') || ss.insertSheet('Log');

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Data', 'Hora', 'Semana', 'Script', 'Arquivo', 'Disciplina', 'Status', 'Duração (s)', 'Modelo']);
        sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#4A90D9').setFontColor('#FFFFFF');
        sheet.setFrozenRows(1);
      }

      const agora = new Date();
      const data = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'dd/MM/yyyy');
      const hora = Utilities.formatDate(agora, Session.getScriptTimeZone(), 'HH:mm:ss');
      
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
        dados.script || '—',
        dados.arquivo || '—',
        dados.disciplina || '—',
        dados.status || '—',
        dados.duracao || 0,
        CONFIG.MODELO_GEMINI
      ]);
    } catch (err) {
      console.warn(`[LOGGER ERRO] ${err.message}`);
    }
  }
};

// ============================================================================
// 7. FUNÇÃO DE TESTE MANUAL
// ============================================================================
function testarPipelineComDadosSinteticos() {
  const eventoFake = {
    values: [
      '29/07/2026 15:00:00',
      'MJS, 45a, F',
      'dor lombar irradia perna dir 3d choque piora andar',
      'Início e duração dos sintomas, Fatores de melhora / piora, Medicações em uso',
      'PA (Pressão Arterial), FC (Frequência Cardíaca)',
      '140x90 90bpm',
      'Aparelho Locomotor (articulações, amplitude de movimento), Exame Neurológico (força, sensibilidade, reflexos)',
      'lasegue pos dir forca preservada',
      'lombociatalgia pedir rx dar aine'
    ]
  };

  console.log('[TESTE] Iniciando teste manual com dados sintéticos...');
  processarCasoClinico(eventoFake);
  console.log('[TESTE] Fim do teste.');
}
