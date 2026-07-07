// ============================================================
//  AUTOMAÇÃO DE FLASHCARDS - MEDICINA (GEMINI 2.5 FLASH)
//  Versão 4.0 — Resumos .md + PDFs de Tutoria (multimodal)
//  Formato saída: Obsidian (.md) | Filtro: últimas N horas
// ============================================================

const CONFIG = {
  API_KEY: 'AIzaSyC8oickhFH0Zwn4P3aNm1nuxrZVHr1HwFE',

  // Pasta onde os flashcards .md gerados serão salvos (Obsidian)
  DESTINATION_FOLDER_ID: '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA',

  // Pasta com resumos de aula em .md
  RESUMOS_FOLDER_ID: '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',

  // Pasta com PDFs de objetivos da tutoria (todos agrupados em 1 .md)
  TUTORIA_FOLDER_ID: '1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB',

  // Janela de tempo para considerar arquivo "recente" (em horas)
  HORAS_RECENTES: 168,  // 7 dias — garante que nenhum arquivo recente seja perdido

  // Pausa entre chamadas à API (ms) — evita rate limit
  DELAY_ENTRE_ARQUIVOS_MS: 3000,

  // Modelo Gemini
  GEMINI_MODEL: 'gemini-2.5-flash',

  // Mapeamento de palavras-chave no nome do arquivo → disciplina
  DISCIPLINAS: {
    'radiologia': 'LMF - Radiologia',
    'rastreio':   'LMF - Radiologia',
    'torax':      'LMF - Radiologia',
    'patologia':  'Patologia',
    'parasito':   'Parasitologia',
    'amebias':    'Parasitologia',
    'giardia':    'Parasitologia',
    'farmaco':    'Farmacologia',
    'antimetab':  'Farmacologia',
    'antineopla': 'Farmacologia',
    'clinica':    'LHM - Clínica',
    'fetal':      'LHM - Clínica',
    'obstetri':   'LHM - Clínica'
  }
};

// ============================================================
//  PONTO DE ENTRADA — agende esta função no Apps Script
// ============================================================
function processFlashcardsAutomation() {
  const inicio = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`INÍCIO DA EXECUÇÃO: ${inicio.toLocaleString('pt-BR')}`);
  console.log(`${'='.repeat(60)}\n`);

  // --- PARTE 1: Resumos .md ---
  processarResumos();

  console.log(`\n${'='.repeat(60)}\n`);

  // --- PARTE 2: PDFs de Tutoria (agrupados em 1 .md) ---
  processarTutoria();

  const fim = new Date();
  const duracaoSeg = Math.round((fim - inicio) / 1000);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`EXECUÇÃO TOTAL CONCLUÍDA em ${duracaoSeg}s`);
  console.log(`FIM: ${fim.toLocaleString('pt-BR')}`);
  console.log(`${'='.repeat(60)}\n`);
}

// ============================================================
//  PARTE 1 — RESUMOS DE AULA (.md)
// ============================================================
function processarResumos() {
  console.log('📚 PROCESSANDO RESUMOS DE AULA (.md)\n');

  let totalProcessados = 0;
  let totalPulados     = 0;
  let totalErros       = 0;

  let arquivos;
  try {
    arquivos = getArquivosRecentes(CONFIG.RESUMOS_FOLDER_ID, null);
  } catch (e) {
    console.error(`❌ Erro fatal ao acessar pasta de resumos: ${e.message}`);
    return;
  }

  if (arquivos.length === 0) {
    console.log('ℹ️  Nenhum resumo novo encontrado nas últimas ' + CONFIG.HORAS_RECENTES + 'h.');
    return;
  }

  // Remove duplicatas pelo nome (o Drive pode listar o mesmo arquivo 2x)
  const vistos = new Set();
  const arquivosUnicos = arquivos.filter(f => {
    if (vistos.has(f.getName())) return false;
    vistos.add(f.getName());
    return true;
  });

  console.log(`📄 ${arquivosUnicos.length} resumo(s) encontrado(s) (${arquivos.length - arquivosUnicos.length} duplicata(s) ignorada(s)).\n`);

  for (const file of arquivosUnicos) {
    const nomeOriginal  = file.getName();
    const nomeFlashcard = gerarNomeFlashcard(nomeOriginal);
    const disciplina    = detectarDisciplina(nomeOriginal);

    console.log(`▶ Processando: "${nomeOriginal}"`);
    console.log(`  Disciplina detectada: ${disciplina}`);

    if (checkIfFileExists(nomeFlashcard)) {
      console.log(`  ⚠️  Pulado: "${nomeFlashcard}" já existe.\n`);
      totalPulados++;
      continue;
    }

    let textContent;
    try {
      textContent = file.getBlob().getDataAsString('UTF-8');
      if (!textContent || textContent.trim().length < 30) {
        throw new Error('Conteúdo muito curto ou vazio.');
      }
      console.log(`  ✅ Texto lido: ${textContent.length} caracteres.`);
    } catch (e) {
      console.error(`  ❌ Erro na leitura: ${e.message}\n`);
      totalErros++;
      continue;
    }

    let flashcards;
    try {
      flashcards = callGeminiTexto(textContent, disciplina);
      if (!flashcards || flashcards.trim().length === 0) {
        throw new Error('Resposta da API veio vazia.');
      }
      console.log(`  ✅ Flashcards gerados: ${flashcards.length} caracteres.`);
    } catch (e) {
      console.error(`  ❌ Erro na API Gemini: ${e.message}\n`);
      totalErros++;
      continue;
    }

    try {
      saveMarkdown(nomeFlashcard, flashcards, disciplina, nomeOriginal);
      console.log(`  ✅ Salvo: "${nomeFlashcard}"\n`);
      totalProcessados++;
    } catch (e) {
      console.error(`  ❌ Erro ao salvar: ${e.message}\n`);
      totalErros++;
      continue;
    }

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS);
  }

  console.log(`RESUMOS — ✅ ${totalProcessados} processados | ⚠️ ${totalPulados} pulados | ❌ ${totalErros} erros`);
}

// ============================================================
//  PARTE 2 — PDFs DE TUTORIA (todos agrupados em 1 .md)
//
//  Lógica de deduplicação:
//  - Nome do arquivo de saída é baseado nos PDFs processados
//    Ex: "Tutoria - Objetivo 01 + Objetivo 02-03 - Flashcards.md"
//  - O script busca TODOS os PDFs da pasta (sem filtro de data)
//  - Para cada PDF, verifica se já existe um flashcard que o contém
//    comparando a data de modificação do PDF com a do flashcard
//  - Se o PDF foi modificado DEPOIS do flashcard → regenera tudo
//  - Se nada mudou → pula
// ============================================================
function processarTutoria() {
  console.log('🏥 PROCESSANDO PDFs DE TUTORIA\n');

  // Busca TODOS os PDFs da pasta (sem filtro de data — a deduplicação é por modificação)
  let todosArquivos;
  try {
    const folder = DriveApp.getFolderById(CONFIG.TUTORIA_FOLDER_ID);
    const iter   = folder.getFiles();
    todosArquivos = [];
    while (iter.hasNext()) {
      const f = iter.next();
      if (f.getMimeType() === 'application/pdf') todosArquivos.push(f);
    }
  } catch (e) {
    console.error(`❌ Erro fatal ao acessar pasta de tutoria: ${e.message}`);
    return;
  }

  if (todosArquivos.length === 0) {
    console.log('ℹ️  Nenhum PDF encontrado na pasta de tutoria.');
    return;
  }

  // Remove duplicatas pelo nome (Drive às vezes lista 2x)
  const vistos = new Set();
  const arquivos = todosArquivos.filter(f => {
    if (vistos.has(f.getName())) return false;
    vistos.add(f.getName());
    return true;
  });

  console.log(`📄 ${arquivos.length} PDF(s) encontrado(s) na pasta de tutoria.\n`);

  // Monta o nome esperado do arquivo de saída baseado nos PDFs presentes
  const nomesDisplay = arquivos
    .map(f => f.getName().replace(/\.pdf$/i, '').replace(/\//g, '-'))
    .join(' + ');
  const nomeFlashcard = `Tutoria - ${nomesDisplay} - Flashcards.md`;

  // Verifica se o flashcard já existe e se algum PDF foi modificado depois dele
  const destFolder   = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
  const existentes   = destFolder.getFilesByName(nomeFlashcard);
  let flashcardExistente = null;
  if (existentes.hasNext()) flashcardExistente = existentes.next();

  if (flashcardExistente) {
    const dataFlashcard = flashcardExistente.getDateCreated();
    const algumPDFMudou = arquivos.some(f => {
      const mod = f.getLastUpdated();
      return mod > dataFlashcard;
    });

    if (!algumPDFMudou) {
      console.log(`  ⚠️  Pulado: "${nomeFlashcard}" já existe e nenhum PDF foi modificado.\n`);
      return;
    }

    // PDF mudou → deleta o flashcard antigo para regenerar
    console.log(`  🔄 PDF modificado detectado — deletando versão antiga e regenerando...\n`);
    flashcardExistente.setTrashed(true);
  }

  // Processa cada PDF
  const blocosPorObjetivo = [];
  const nomesArquivos     = [];

  for (const file of arquivos) {
    const nomeOriginal = file.getName();
    const limite       = calcularLimiteFlashcards(nomeOriginal);
    console.log(`▶ Processando PDF: "${nomeOriginal}" | Limite: ${limite} flashcards`);

    let pdfBase64;
    try {
      const blob = file.getBlob();
      pdfBase64  = Utilities.base64Encode(blob.getBytes());
      console.log(`  ✅ PDF lido: ${blob.getBytes().length} bytes.`);
    } catch (e) {
      console.error(`  ❌ Erro ao ler PDF: ${e.message}\n`);
      continue;
    }

    let flashcards;
    try {
      flashcards = callGeminiPDF(pdfBase64, nomeOriginal);
      if (!flashcards || flashcards.trim().length === 0) {
        throw new Error('Resposta da API veio vazia.');
      }
      console.log(`  ✅ Flashcards gerados: ${flashcards.length} caracteres.\n`);
    } catch (e) {
      console.error(`  ❌ Erro na API Gemini: ${e.message}\n`);
      continue;
    }

    const nomeDisplay = nomeOriginal.replace(/\.pdf$/i, '');
    blocosPorObjetivo.push(`## 📖 ${nomeDisplay}\n\n${flashcards.trim()}`);
    nomesArquivos.push(nomeOriginal);

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS);
  }

  if (blocosPorObjetivo.length === 0) {
    console.log('  ❌ Nenhum flashcard gerado — arquivo consolidado não criado.');
    return;
  }

  const conteudoConsolidado = blocosPorObjetivo.join('\n\n---\n\n');

  try {
    saveMarkdownTutoria(nomeFlashcard, conteudoConsolidado, nomesArquivos);
    console.log(`✅ Arquivo consolidado salvo: "${nomeFlashcard}"`);
  } catch (e) {
    console.error(`❌ Erro ao salvar arquivo de tutoria: ${e.message}`);
  }
}

// ============================================================
//  BUSCA ARQUIVOS RECENTES EM UMA PASTA
//  mimeTypeFilter: 'application/pdf' | null (todos os tipos)
// ============================================================
function getArquivosRecentes(folderId, mimeTypeFilter) {
  const folder   = DriveApp.getFolderById(folderId);
  const files    = folder.getFiles();
  const recentes = [];

  const limiteMs = CONFIG.HORAS_RECENTES * 60 * 60 * 1000;
  const limite   = new Date(Date.now() - limiteMs);

  while (files.hasNext()) {
    const file = files.next();

    // Filtra por tipo MIME se especificado
    if (mimeTypeFilter && file.getMimeType() !== mimeTypeFilter) continue;

    const dataCriacao     = file.getDateCreated();
    const dataModificacao = file.getLastUpdated();
    const dataMaisRecente = dataCriacao > dataModificacao ? dataCriacao : dataModificacao;

    console.log(`  🔍 "${file.getName()}" | Modificado: ${dataMaisRecente.toLocaleString('pt-BR')}`);

    if (dataMaisRecente >= limite) {
      console.log(`  📌 Selecionado.`);
      recentes.push(file);
    }
  }

  return recentes;
}

// ============================================================
//  DETECTA A DISCIPLINA PELO NOME DO ARQUIVO
// ============================================================
function detectarDisciplina(nomeArquivo) {
  const nomeLower = nomeArquivo.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [keyword, disciplina] of Object.entries(CONFIG.DISCIPLINAS)) {
    if (nomeLower.includes(keyword)) return disciplina;
  }

  return 'Medicina';
}

// ============================================================
//  GERA O NOME DO ARQUIVO DE FLASHCARD (resumos .md)
// ============================================================
function gerarNomeFlashcard(nomeOriginal) {
  return nomeOriginal.replace(/\.md$/i, '') + ' - Flashcards.md';
}

// ============================================================
//  CHAMADA À API GEMINI — TEXTO (resumos .md)
// ============================================================
function callGeminiTexto(content, disciplina) {
  const url     = buildGeminiUrl();
  const prompt  = buildPromptTexto(content, disciplina);
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
    safetySettings: safetySettingsBlock()
  };
  return fetchGemini(url, payload);
}

// ============================================================
//  CALCULA LIMITE DE FLASHCARDS PELO NÚMERO DE OBJETIVOS
//  "Objetivo 01.pdf"       → 1 objetivo → 12 flashcards
//  "Objetivo 01/02.pdf"    → 2 objetivos → 24 flashcards
//  "Objetivo 01/02/03.pdf" → 3 objetivos → 36 flashcards
// ============================================================
function calcularLimiteFlashcards(nomeArquivo) {
  const barras     = (nomeArquivo.match(/\//g) || []).length;
  const nObjetivos = barras + 1;
  return nObjetivos * 12;
}

// ============================================================
//  CHAMADA À API GEMINI — PDF MULTIMODAL (tutoria)
// ============================================================
function callGeminiPDF(pdfBase64, nomeArquivo) {
  const url     = buildGeminiUrl();
  const limite  = calcularLimiteFlashcards(nomeArquivo);
  const prompt  = buildPromptPDF(nomeArquivo, limite);
  const payload = {
    contents: [{
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
        { text: prompt }
      ]
    }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
    safetySettings: safetySettingsBlock()
  };
  return fetchGemini(url, payload);
}

// ============================================================
//  HELPERS DA API
// ============================================================
function buildGeminiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.API_KEY}`;
}

function safetySettingsBlock() {
  return [
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
  ];
}

function fetchGemini(url, payload) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const MAX_TENTATIVAS = 4;
  const ESPERAS_MS     = [60000, 90000, 120000]; // 1min, 1.5min, 2min

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const response   = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    // Sucesso
    if (statusCode === 200) {
      const json = JSON.parse(response.getContentText());
      if (
        !json.candidates ||
        json.candidates.length === 0 ||
        !json.candidates[0].content ||
        !json.candidates[0].content.parts ||
        json.candidates[0].content.parts.length === 0
      ) {
        const motivo = json.promptFeedback?.blockReason || 'Estrutura inesperada';
        throw new Error(`Resposta inválida: ${motivo}`);
      }
      return json.candidates[0].content.parts[0].text;
    }

    // Rate limit (429) ou sobrecarga (503) — tenta esperar e repetir
    if ((statusCode === 429 || statusCode === 503) && tentativa < MAX_TENTATIVAS) {
      // Tenta extrair o retryDelay sugerido pelo Gemini
      let esperaMs = ESPERAS_MS[tentativa - 1];
      try {
        const errJson = JSON.parse(response.getContentText());
        const retryInfo = errJson?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          const segundos = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          if (!isNaN(segundos)) esperaMs = (segundos + 5) * 1000; // +5s de margem
        }
      } catch (_) {}

      const esperaSeg = Math.round(esperaMs / 1000);
      console.log(`  ⏳ Status ${statusCode} — aguardando ${esperaSeg}s antes de tentar novamente (tentativa ${tentativa}/${MAX_TENTATIVAS})...`);
      Utilities.sleep(esperaMs);
      continue;
    }

    // Qualquer outro erro — falha imediata
    throw new Error(`Status ${statusCode}: ${response.getContentText()}`);
  }

  throw new Error(`Falha após ${MAX_TENTATIVAS} tentativas (rate limit persistente).`);
}

// ============================================================
//  PROMPT — RESUMOS DE AULA (.md) — 15 a 20 flashcards
// ============================================================
function buildPromptTexto(content, disciplina) {
  return `
[IDIOMA — OBRIGATÓRIO]
Responda EXCLUSIVAMENTE em português do Brasil. PROIBIDO usar qualquer palavra em inglês.

[PAPEL]
Você é um professor de medicina especializado em ${disciplina}, gerando material de Active Recall para um aluno com perfil TDAH. Clareza absoluta, linguagem direta, zero enrolação.

[TAREFA]
Gere exatamente entre 18 e 20 flashcards atômicos baseados NO CONTEÚDO ABAIXO — e apenas nele. Não invente informações que não estejam no texto. Você pode complementar mecanismos fisiopatológicos implícitos no conteúdo, mas nunca adicionar tópicos ausentes.

[CRITÉRIOS DE SELEÇÃO — priorize nesta ordem]
1. Mecanismos fisiopatológicos (Por quê / Como acontece)
2. Diagnóstico diferencial e critérios diagnósticos
3. Conduta clínica e farmacologia (com doses quando disponíveis)
4. Armadilhas de prova e alertas clínicos
5. Definições e conceitos-chave

[REGRAS DE ATOMIZAÇÃO]
- 1 flashcard = 1 único conceito testável
- Perguntas compostas são PROIBIDAS (ex: "Qual o mecanismo E o tratamento de X?")
- Prefira perguntas de raciocínio: "Por quê?", "Qual o mecanismo?", "O que acontece se...?"
- Evite perguntas de pura memorização quando possível
- 

[FORMATAÇÃO — SIGA EXATAMENTE]
- Separador: linha com apenas ? entre pergunta e resposta
- Respostas: lista com marcadores (-)
- PROIBIDO linha em branco entre itens da mesma resposta
- **Negrito** → conceitos-chave
- \`backtick\` → doses e valores numéricos
- ==Highlight== → alertas e armadilhas de prova
- -> → processos, cascatas e relações causais
- Linha em branco entre flashcards
- Output: Markdown puro. PROIBIDO introduções, conclusões, títulos ou YAML

[EXEMPLO CORRETO]
Por que a hemocultura deve ser colhida ANTES do antibiótico na endocardite?
?
- O antibiótico esteriliza o sangue rapidamente -> **falseia a hemocultura**.
- ==Colher 3 amostras em sítios diferentes antes de iniciar o tratamento.==
- Critério de Duke maior depende de hemocultura positiva.

Qual o mecanismo de ação da **Penicilina**?
?
- Inibe a **transpeptidase** (PBP) -> bloqueia a síntese da parede celular bacteriana.
- Bactericida: age apenas na fase de crescimento ativo.
- Espectro principal: **gram-positivos**.

[CONTEÚDO — DISCIPLINA: ${disciplina}]
${content}
`.trim();
}

// ============================================================
//  PROMPT — PDFs DE TUTORIA — máximo 12 flashcards por PDF
// ============================================================
function buildPromptPDF(nomeArquivo, limite) {
  const minFlashcards = Math.max(1, limite - 2);
  const nObjetivos    = Math.round(limite / 12);

  return `
[IDIOMA — OBRIGATÓRIO]
Responda EXCLUSIVAMENTE em português do Brasil. Todo o conteúdo do PDF deve ser traduzido. PROIBIDO qualquer palavra em inglês na resposta.

[PAPEL]
Você é um professor de medicina gerando material de Active Recall para um aluno com perfil TDAH. Clareza absoluta, linguagem direta, zero enrolação. O arquivo processado é: "${nomeArquivo}".

[TAREFA]
Leia o PDF na íntegra e gere exatamente entre ${minFlashcards} e ${limite} flashcards atômicos.
Este arquivo contém ${nObjetivos} objetivo(s) de tutoria fundido(s) — distribua os flashcards proporcionalmente entre os objetivos presentes no conteúdo.

[CRITÉRIOS DE SELEÇÃO — priorize nesta ordem]
1. Mecanismos fisiopatológicos (Por quê / Como acontece)
2. Diagnóstico diferencial e critérios diagnósticos
3. Conduta clínica e farmacologia (com doses quando disponíveis no PDF)
4. Armadilhas de prova e alertas clínicos
5. Definições e conceitos-chave

[REGRAS DE ATOMIZAÇÃO]
- 1 flashcard = 1 único conceito testável
- Perguntas compostas são PROIBIDAS (ex: "Qual o mecanismo E o tratamento de X?")
- Prefira perguntas de raciocínio: "Por quê?", "Qual o mecanismo?", "O que acontece se...?"
- O resumo é a fonte primária — todo tópico presente nele deve virar flashcard
- Enriqueça com referências científicas consolidadas (UpToDate, Harrison, diretrizes SBC/SBP/MS): complete mecanismos implícitos, adicione doses ausentes, inclua correlações clínicas relevantes ao tema
- O PDF é a fonte primária — cubra todos os conceitos centrais presentes nele
- Enriqueça com referências científicas consolidadas (UpToDate, Harrison, diretrizes): complete mecanismos implícitos, adicione doses ausentes, inclua correlações clínicas relevantes

[FORMATAÇÃO — SIGA EXATAMENTE]
- Separador: linha com apenas ? entre pergunta e resposta
- Respostas: lista com marcadores (-)
- PROIBIDO linha em branco entre itens da mesma resposta
- **Negrito** → conceitos-chave
- \`backtick\` → doses e valores numéricos
- ==Highlight== → alertas e armadilhas de prova
- -> → processos, cascatas e relações causais
- Linha em branco entre flashcards
- Output: Markdown puro. PROIBIDO introduções, conclusões, títulos ou YAML

[EXEMPLO CORRETO — EM PORTUGUÊS]
Por que a hemocultura deve ser colhida ANTES do antibiótico na endocardite?
?
- O antibiótico esteriliza o sangue rapidamente -> **falseia a hemocultura**.
- ==Colher 3 amostras em sítios diferentes antes de iniciar o tratamento.==
- Critério de Duke maior depende de hemocultura positiva.

Qual o mecanismo de ação da **Penicilina**?
?
- Inibe a **transpeptidase** (PBP) -> bloqueia a síntese da parede celular bacteriana.
- Bactericida: age apenas na fase de crescimento ativo.
- Espectro principal: **gram-positivos**.
`.trim();
}

// ============================================================
//  PREVENÇÃO DE DUPLICATAS
// ============================================================
function checkIfFileExists(nome) {
  const folder = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
  const files  = folder.getFilesByName(nome);
  return files.hasNext();
}

// ============================================================
//  SALVAR .md NA PASTA DE DESTINO — Resumos de aula
// ============================================================
function saveMarkdown(nome, content, disciplina, nomeOriginal) {
  const folder = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);

  const cabecalho = [
    `# Flashcards — ${nomeOriginal.replace(/\.md$/i, '')}`,
    ``,
    `> **Disciplina:** ${disciplina}`,
    `> **Gerado em:** ${new Date().toLocaleString('pt-BR')}`,
    `> **Fonte:** ${nomeOriginal}`,
    ``,
    `---`,
    ``
  ].join('\n');

  folder.createFile(nome, cabecalho + content, MimeType.PLAIN_TEXT);
}

// ============================================================
//  SALVAR .md NA PASTA DE DESTINO — Tutoria (consolidado)
// ============================================================
function saveMarkdownTutoria(nome, content, nomesArquivos) {
  const folder  = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
  const fontes  = nomesArquivos.map(n => `> - ${n}`).join('\n');
  const titulo  = nome.replace(/\.md$/i, '');

  const cabecalho = [
    `# ${titulo}`,
    ``,
    `> **Disciplina:** Tutoria`,
    `> **Gerado em:** ${new Date().toLocaleString('pt-BR')}`,
    `> **Fontes:**`,
    fontes,
    ``,
    `---`,
    ``
  ].join('\n');

  folder.createFile(nome, cabecalho + content, MimeType.PLAIN_TEXT);
}