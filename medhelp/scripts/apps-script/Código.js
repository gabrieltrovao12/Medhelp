// ============================================================
//  AUTOMAÇÃO DE FLASHCARDS - MEDICINA (GEMINI 2.5 FLASH)
//  Versão 5.0 — Resumos .md + PDFs de Tutoria (multimodal)
//  Formato saída: Obsidian (.md) | Filtro: últimas N horas
//  Inclui guarda de timeout (4.5 min) e PropertiesService.
// ============================================================

// SEÇÃO 1: CONFIGURAÇÕES
const CONFIG = {
  // Pasta onde os flashcards .md gerados serão salvos (Obsidian)
  DESTINATION_FOLDER_ID: '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA',

  // Pasta com resumos de aula em .md
  RESUMOS_FOLDER_ID: '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',

  // Pasta com PDFs de objetivos da tutoria (todos agrupados em 1 .md)
  TUTORIA_FOLDER_ID: '1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB',

  // Janela de tempo para considerar arquivo "recente" (em horas)
  HORAS_RECENTES: 168,  // 7 dias

  // Pausa entre chamadas à API (ms) — evita rate limit (Throttling)
  DELAY_ENTRE_ARQUIVOS_MS: 5000,

  // Modelo Gemini
  GEMINI_MODEL: 'gemini-2.5-flash',

  // Trava de segurança contra timeout do GAS (6 minutos)
  TEMPO_LIMITE_MS: 4.5 * 60 * 1000,

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

// SEÇÃO 2: SYSTEM INSTRUCTIONS (PROMPTS)
function buildPromptTexto(content, disciplina) {
  return `
### [O] - Objetivo
Converter o resumo da aula fornecido em exatamente entre 18 e 20 flashcards altamente atômicos e precisos estruturados para o plugin Obsidian Spaced Repetition em formato de Pergunta e Resposta (Q&A).

### [C] - Contexto
- **Disciplina/Tema:** ${disciplina}
- **Verdade Terrestre (Ground Truth):** Usar estritamente os fatos e dados presentes no resumo fornecido abaixo. Não alucinar nem complementar com conhecimento externo ao texto.
- **Idioma:** Português (Brasil).

### [A] - Ações
1. **Seleção de Conteúdo:** Priorizar tópicos na seguinte ordem de importância:
   - Mecanismos fisiopatológicos (Por quê / Como ocorre).
   - Diagnósticos diferenciais e critérios diagnósticos.
   - Conduta clínica e farmacologia (com dosagens se estiverem citadas).
   - Armadilhas de prova e alertas clínicos.
   - Definições e conceitos-chave.
2. **Atomização:** Quebrar conceitos em perguntas atômicas (1 Pergunta = 1 Conceito). Evitar respostas com listas longas ou explicações extensas.
3. **Aplicação de Estilo Obsidian:**
   - **Conceitos-Chave:** Em **negrito** (ex: **Hipotálamo**).
   - **Fármacos, Valores e Dosagens:** Formatar como \`código\` (ex: \`Penicilina\`).
   - **Alertas e Pontos Críticos:** Usar realce com dois sinais de igual (ex: ==colher 3 amostras antes de iniciar==).
   - **Setas Lógicas:** Usar \`->\` ou \`=>\` para processos e cascatas causais.

### [N] - Normas (Negativas)
- **PROIBIDO** o uso de qualquer tag HTML (como <div>, <span>, <details>).
- **PROIBIDO** o uso de emojis de qualquer tipo nas perguntas ou respostas.
- **PROIBIDO** deixar linhas em branco *entre* os itens de resposta de um mesmo card.
- **PROIBIDO** emitir preâmbulos, saudações, conclusões ou notas explicativas sobre o formato. Retornar apenas os cards gerados em Markdown puro.

### [E] - Exemplos
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

### [S] - Saída
- Gerar os flashcards na estrutura exata de pergunta, pulo de linha, \`?\` em linha isolada, resposta em lista compacta com marcadores \`-\` (sem linhas em branco intermediárias), e uma linha em branco separando os cards.

### [CONTEÚDO DA AULA]
${content}
`.trim();
}

function buildPromptPDF(nomeArquivo, limite) {
  // Margem de variação aceitável para o limite
  const minFlashcards = Math.max(5, limite - 2);

  return `
### [O] - Objetivo
Converter o PDF de tutoria fornecido em exatamente entre ${minFlashcards} e ${limite} flashcards de revisão no formato de Pergunta e Resposta (Q&A) otimizados para o Obsidian Spaced Repetition.

### [C] - Contexto
- **Arquivo de Origem:** ${nomeArquivo}
- **Fidelidade e Escopo:** O PDF contém objetivos de tutoria médica. O conteúdo dele estabelece os limites do que deve ser estudado.
- **Enriquecimento Científico (Verdade Terrestre Estendida):** Use o PDF como mapa de tópicos. É obrigatório enriquecer as respostas e mecanismos fisiopatológicos consultando e incorporando conhecimentos das referências médicas consagradas (como UpToDate, Harrison Medicina Interna, Robbins Patologia e diretrizes de sociedades médicas nacionais/internacionais). Complete dosagens e fármacos omitidos ou resumidos no PDF, detalhe cascatas de sinalização molecular e explique o porquê de cada conduta clínica.
- **Idioma:** Português (Brasil). Traduza qualquer termo técnico que esteja em inglês ou latim no PDF de origem.

### [A] - Ações
1. **Identificação e Ordenação dos Objetivos:** Varra o PDF, identifique os objetivos de aprendizado declarados e determine a ordem de importância deles no documento.
2. **Geração Proporcional:** Distribua a meta de ${limite} flashcards de forma equilibrada entre os objetivos.
3. **Estrutura Sequencial:** Gere os flashcards ordenados estritamente conforme a sequência de objetivos do PDF (ex: todos os cards do Objetivo 1 primeiro, depois Objetivo 2, etc.).
4. **Priorização de Tópicos (Dentro de cada objetivo):** Ordene dos conceitos mais críticos para os complementares, focando em:
   - Mecanismos fisiopatológicos detalhados (explicação molecular/fisiológica de "como" e "por que").
   - Critérios diagnósticos oficiais e diagnósticos diferenciais.
   - Farmacologia aplicada: doses, via de administração, contraindicações e efeitos adversos.
   - Alertas e armadilhas clínicas práticas.
5. **Atomização Estrita:** Cada flashcard deve testar apenas um conceito ou fato (1 Pergunta = 1 Resposta curta).
6. **Formatação Estilo Obsidian:**
   - Termos fundamentais e patologias em **negrito** (ex: **Insuficiência Cardíaca**).
   - Medicamentos, exames específicos e valores em \`código\` (ex: \`Ceftriaxona\`, \`500mg\`).
   - Alertas críticos ou condutas imediatas com marcação dupla de igual (ex: ==realizar ECG em até 10 minutos==).
   - Cascatas fisiológicas ou relações causais mapeadas com setas lógicas (\`->\` ou \`=>\`).

### [N] - Normas (Guardrails)
- **PROIBIDO** utilizar tags HTML (ex: <div>, <span>, <br>).
- **PROIBIDO** usar emojis em qualquer parte das perguntas ou respostas.
- **PROIBIDO** deixar linhas em branco intermediárias dentro da resposta de um mesmo card.
- **PROIBIDO** emitir explicações prévias, introduções ou notas de rodapé. Retornar apenas os flashcards gerados.

### [E] - Exemplos
Qual a fisiopatologia da formação de **ascite** na **cirrose hepática**?
?
- **Hipertensão portal** -> aumento da **pressão hidrostática** capilar.
- Vasodilatação esplâncnica -> redução do volume arterial efetivo -> ativação do **SRAA**.
- Retenção renal de sódio e água -> extravasamento de fluido para a cavidade peritoneal.

Qual a conduta inicial e dose no tratamento da **crise asmática grave**?
?
- ==Oxigenoterapia para manter SpO2 entre 93% e 95%.==
- **Beta-2 agonista de curta ação** (\`Fenoterol\` ou \`Salbutamol\`) 20 gotas via nebulização a cada 20 minutos na primeira hora.
- Corticoide sistêmico precoce (\`Metilprednisolona\` \`40mg\` EV ou \`Prednisona\` \`40-60mg\` VO).

### [S] - Saída
- Retornar os cards em Markdown puro. A pergunta na primeira linha, o caractere \`?\` isolado na segunda linha, e a resposta estruturada em tópicos com marcadores \`-\` nas linhas seguintes (sem linhas em branco intermediárias). Separe os cards com exatamente uma linha em branco.
`.trim();
}

// SEÇÃO 3: ORQUESTRADOR
function processFlashcardsAutomation() {
  const tempoInicio = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[INÍCIO] Executando Automação de Flashcards: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`${'='.repeat(60)}\n`);

  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não encontrada nas Propriedades do Script. Abortando.');
    return;
  }

  // --- PARTE 1: Resumos .md ---
  try {
    processarResumos(tempoInicio, apiKey);
  } catch (err) {
    console.error('[ERRO] Falha crítica no processamento de resumos: ' + err.message);
  }

  console.log(`\n${'='.repeat(60)}\n`);

  // --- PARTE 2: PDFs de Tutoria (agrupados em 1 .md) ---
  try {
    // Apenas executa se ainda houver tempo disponível
    if (Date.now() - tempoInicio < CONFIG.TEMPO_LIMITE_MS) {
      processarTutoria(tempoInicio, apiKey);
    } else {
      console.warn('[AVISO] Tempo esgotado antes de iniciar o processamento de tutoria.');
    }
  } catch (err) {
    console.error('[ERRO] Falha crítica no processamento de tutoria: ' + err.message);
  }

  const fim = Date.now();
  const duracaoSeg = Math.round((fim - tempoInicio) / 1000);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[FIM] Automação concluída em ${duracaoSeg}s`);
  console.log(`${'='.repeat(60)}\n`);
}

function processarResumos(tempoInicio, apiKey) {
  console.log('[INFO] Processando resumos de aula (.md)...\n');

  let totalProcessados = 0;
  let totalPulados     = 0;
  let totalErros       = 0;

  let arquivos;
  try {
    arquivos = getArquivosRecentes(CONFIG.RESUMOS_FOLDER_ID, null);
  } catch (e) {
    console.error(`[ERRO] Falha ao acessar pasta de resumos: ${e.message}`);
    return;
  }

  if (arquivos.length === 0) {
    console.log('ℹ️  Nenhum resumo novo encontrado nas últimas ' + CONFIG.HORAS_RECENTES + 'h.');
    return;
  }

  const vistos = new Set();
  const arquivosUnicos = arquivos.filter(f => {
    if (vistos.has(f.getName())) return false;
    vistos.add(f.getName());
    return true;
  });

  console.log(`[INFO] ${arquivosUnicos.length} resumo(s) único(s) encontrado(s).\n`);

  for (const file of arquivosUnicos) {
    // Guarda de segurança contra timeout do GAS
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Tempo limite de 4.5 min atingido. Interrompendo processamento de resumos.');
      break;
    }

    const nomeOriginal  = file.getName();
    const nomeFlashcard = gerarNomeFlashcard(nomeOriginal);
    const disciplina    = detectarDisciplina(nomeOriginal);

    console.log(`[PROCESSANDO] "${nomeOriginal}" ──► "${disciplina}"`);

    if (checkIfFileExists(nomeFlashcard, disciplina)) {
      console.log(`  [INFO] Pulado: "${nomeFlashcard}" já existe.\n`);
      totalPulados++;
      continue;
    }

    let textContent;
    try {
      textContent = file.getBlob().getDataAsString('UTF-8');
      if (!textContent || textContent.trim().length < 30) {
        throw new Error('Conteúdo vazio ou excessivamente curto.');
      }
    } catch (e) {
      console.error(`  [ERRO] Leitura de arquivo falhou: ${e.message}\n`);
      totalErros++;
      continue;
    }

    let flashcards;
    try {
      flashcards = callGeminiTexto(textContent, disciplina, apiKey);
      if (!flashcards || flashcards.trim().length === 0) {
        throw new Error('Resposta do Gemini vazia.');
      }
    } catch (e) {
      console.error(`  [ERRO] API Gemini falhou: ${e.message}\n`);
      totalErros++;
      continue;
    }

    try {
      saveMarkdown(nomeFlashcard, flashcards, disciplina, nomeOriginal);
      console.log(`  [SUCESSO] Salvo: "${nomeFlashcard}"\n`);
      totalProcessados++;
    } catch (e) {
      console.error(`  [ERRO] Falha ao salvar arquivo Markdown: ${e.message}\n`);
      totalErros++;
      continue;
    }

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS);
  }

  console.log(`[RESUMOS] Concluído. Sucesso: ${totalProcessados} | Pulados: ${totalPulados} | Erros: ${totalErros}`);
}

function processarTutoria(tempoInicio, apiKey) {
  console.log('[INFO] Processando PDFs de tutoria...\n');

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
    console.error(`[ERRO] Falha ao acessar pasta de tutoria: ${e.message}`);
    return;
  }

  if (todosArquivos.length === 0) {
    console.log('ℹ️  Nenhum PDF encontrado na pasta de tutoria.');
    return;
  }

  const vistos = new Set();
  const arquivos = todosArquivos.filter(f => {
    if (vistos.has(f.getName())) return false;
    vistos.add(f.getName());
    return true;
  });

  console.log(`[INFO] ${arquivos.length} PDF(s) de tutoria encontrado(s).\n`);

  const nomesDisplay = arquivos
    .map(f => f.getName().replace(/\.pdf$/i, '').replace(/\//g, '-'))
    .join(' + ');
  const nomeFlashcard = `Tutoria - ${nomesDisplay} - Flashcards.md`;

  const destFolder   = obterOuCriarSubpasta('Tutoria');
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
      console.log(`  [INFO] Pulado: "${nomeFlashcard}" já existe e nenhum PDF foi atualizado desde então.\n`);
      return;
    }

    console.log(`  [INFO] PDF modificado detectado — removendo versão antiga para regeneração...\n`);
    flashcardExistente.setTrashed(true);
  }

  const blocosPorObjetivo = [];
  const nomesArquivos     = [];

  // Calcula o total de objetivos de todos os PDFs da lista
  let totalObjetivosGeral = 0;
  arquivos.forEach(file => {
    const nome = file.getName();
    const barras = (nome.match(/\//g) || []).length;
    totalObjetivosGeral += (barras + 1);
  });
  console.log(`[INFO] Total de objetivos identificados na tutoria: ${totalObjetivosGeral}`);

  for (const file of arquivos) {
    // Guarda de segurança contra timeout
    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Tempo limite de 4.5 min atingido. Encerrando processamento de tutoria de forma parcial.');
      break;
    }

    const nomeOriginal = file.getName();
    const barras = (nomeOriginal.match(/\//g) || []).length;
    const nObjetivos = barras + 1;
    // Calcula o limite proporcional a 55 flashcards no total
    const limite = Math.max(5, Math.round((nObjetivos / totalObjetivosGeral) * 55));
    console.log(`[PROCESSANDO] PDF Tutoria: "${nomeOriginal}" | Proporção: ${nObjetivos}/${totalObjetivosGeral} | Limite: ${limite} flashcards`);

    let pdfBase64;
    try {
      const blob = file.getBlob();
      pdfBase64  = Utilities.base64Encode(blob.getBytes());
    } catch (e) {
      console.error(`  [ERRO] Falha na leitura do PDF: ${e.message}\n`);
      continue;
    }

    let flashcards;
    try {
      flashcards = callGeminiPDF(pdfBase64, nomeOriginal, limite, apiKey);
      if (!flashcards || flashcards.trim().length === 0) {
        throw new Error('Resposta vazia da API do Gemini.');
      }
      console.log(`  [SUCESSO] Flashcards gerados (${flashcards.length} caracteres).\n`);
    } catch (e) {
      console.error(`  [ERRO] API do Gemini falhou para o PDF: ${e.message}\n`);
      continue;
    }

    const nomeDisplay = nomeOriginal.replace(/\.pdf$/i, '');
    blocosPorObjetivo.push(`## 📖 ${nomeDisplay}\n\n${flashcards.trim()}`);
    nomesArquivos.push(nomeOriginal);

    Utilities.sleep(CONFIG.DELAY_ENTRE_ARQUIVOS_MS);
  }

  if (blocosPorObjetivo.length === 0) {
    console.warn('  [AVISO] Nenhum flashcard de tutoria foi gerado. Abortando criação do consolidado.');
    return;
  }

  const conteudoConsolidado = blocosPorObjetivo.join('\n\n---\n\n');

  try {
    saveMarkdownTutoria(nomeFlashcard, conteudoConsolidado, nomesArquivos);
    console.log(`[SUCESSO] Arquivo consolidado salvo: "${nomeFlashcard}"`);
  } catch (e) {
    console.error(`[ERRO] Falha ao salvar arquivo de tutoria consolidado: ${e.message}`);
  }
}

// SEÇÃO 4: INTEGRAÇÃO COM A API DO GEMINI (COM RETRY + EXPONENTIAL BACKOFF)
function callGeminiTexto(content, disciplina, apiKey) {
  const url     = buildGeminiUrl(apiKey);
  const prompt  = buildPromptTexto(content, disciplina);
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.9 },
    safetySettings: safetySettingsBlock()
  };
  return fetchGemini(url, payload);
}

function callGeminiPDF(pdfBase64, nomeArquivo, limite, apiKey) {
  const url     = buildGeminiUrl(apiKey);
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

function buildGeminiUrl(apiKey) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
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
  const ESPERAS_MS     = [60000, 90000, 120000];

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const response   = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();

      if (statusCode === 200) {
        const json = JSON.parse(response.getContentText());
        if (
          !json.candidates ||
          json.candidates.length === 0 ||
          !json.candidates[0].content ||
          !json.candidates[0].content.parts ||
          json.candidates[0].content.parts.length === 0
        ) {
          const motivo = json.promptFeedback?.blockReason || 'Estrutura de resposta inválida';
          throw new Error(`Resposta bloqueada pelos filtros ou com formato inválido: ${motivo}`);
        }
        return json.candidates[0].content.parts[0].text;
      }

      // Erro de cota (429) ou sobrecarga temporária (503)
      if ((statusCode === 429 || statusCode === 503) && tentativa < MAX_TENTATIVAS) {
        let esperaMs = ESPERAS_MS[tentativa - 1];
        try {
          const errJson = JSON.parse(response.getContentText());
          const retryInfo = errJson?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
          if (retryInfo?.retryDelay) {
            const segundos = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
            if (!isNaN(segundos)) esperaMs = (segundos + 5) * 1000;
          }
        } catch (_) {}

        const esperaSeg = Math.round(esperaMs / 1000);
        console.warn(`  [AVISO] Status HTTP ${statusCode} — Aguardando ${esperaSeg}s antes de tentar novamente (Tentativa ${tentativa}/${MAX_TENTATIVAS})...`);
        Utilities.sleep(esperaMs);
        continue;
      }

      throw new Error(`Servidor respondeu com status ${statusCode}: ${response.getContentText()}`);

    } catch (err) {
      console.error(`  [ERRO] Exceção na chamada de rede (Tentativa ${tentativa}/${MAX_TENTATIVAS}): ${err.message}`);
      if (tentativa === MAX_TENTATIVAS) throw err;
      Utilities.sleep(15000 * tentativa); // Backoff menor para erros gerais de rede
    }
  }

  throw new Error(`Falha persistente após ${MAX_TENTATIVAS} tentativas.`);
}

// SEÇÃO 5: UTILITÁRIOS
function getArquivosRecentes(folderId, mimeTypeFilter) {
  const folder   = DriveApp.getFolderById(folderId);
  const files    = folder.getFiles();
  const recentes = [];

  const limiteMs = CONFIG.HORAS_RECENTES * 60 * 60 * 1000;
  const limite   = new Date(Date.now() - limiteMs);

  while (files.hasNext()) {
    const file = files.next();

    if (mimeTypeFilter && file.getMimeType() !== mimeTypeFilter) continue;

    const dataCriacao     = file.getDateCreated();
    const dataModificacao = file.getLastUpdated();
    const dataMaisRecente = dataCriacao > dataModificacao ? dataCriacao : dataModificacao;

    if (dataMaisRecente >= limite) {
      recentes.push(file);
    }
  }

  return recentes;
}

function detectarDisciplina(nomeArquivo) {
  const nomeLower = nomeArquivo.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [keyword, disciplina] of Object.entries(CONFIG.DISCIPLINAS)) {
    if (nomeLower.includes(keyword)) return disciplina;
  }

  return 'Medicina';
}

function gerarNomeFlashcard(nomeOriginal) {
  return nomeOriginal.replace(/\.md$/i, '') + ' - Flashcards.md';
}

function calcularLimiteFlashcards(nomeArquivo) {
  const barras     = (nomeArquivo.match(/\//g) || []).length;
  const nObjetivos = barras + 1;
  return nObjetivos * 12;
}

function obterOuCriarSubpasta(nomePasta) {
  const pastaRaiz = DriveApp.getFolderById(CONFIG.DESTINATION_FOLDER_ID);
  const subpastas = pastaRaiz.getFoldersByName(nomePasta);
  if (subpastas.hasNext()) {
    return subpastas.next();
  }
  return pastaRaiz.createFolder(nomePasta);
}

function checkIfFileExists(nome, disciplina) {
  const folder = obterOuCriarSubpasta(disciplina);
  const files  = folder.getFilesByName(nome);
  return files.hasNext();
}

function saveMarkdown(nome, content, disciplina, nomeOriginal) {
  const folder = obterOuCriarSubpasta(disciplina);

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

function saveMarkdownTutoria(nome, content, nomesArquivos) {
  const folder  = obterOuCriarSubpasta('Tutoria');
  const fontes  = nomesArquivos.map(n => `> - ${n}`).join('\n');
  const titulo = nome.replace(/\.md$/i, '');

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