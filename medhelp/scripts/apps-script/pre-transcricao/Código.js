// ══════════════════════════════════════════════════════════════════
// GERADOR DE CÉLULA 3 — Apps Script (Versão 5.0)
// Varre áudios (todos) + slides recentes (<24h), cruza por nome,
// gera priming via Gemini e salva o bloco Python pronto no Drive.
// Inclui etapa 0 de renomeação inteligente de áudios brutos por IA.
// ══════════════════════════════════════════════════════════════════

// SEÇÃO 1: CONFIGURAÇÕES
const CFG = {
  ID_PASTA_AUDIOS:       '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
  ID_PASTA_SLIDES_RAIZ:  '1Xt4bqNvrS90myX54prN96pkFX5XOyVqv',
  ID_PASTA_SAIDA:        '1rMaDcdTU5wOJIhwY1eJKoT11',
  MODELO_GEMINI:         'gemini-2.5-flash',
  JANELA_SLIDES_HORAS:   24,
  PREFIXO_AUDIO:         '/content/drive/MyDrive/Logística - Drive/Transcrições/Áudios aulas/',
  DELAY_ENTRE_REQUISICOES_MS: 3000,
  MAX_RETRIES: 3,
  TEMPO_LIMITE_MS: 4.5 * 60 * 1000
};

// SEÇÃO 2: SYSTEM INSTRUCTIONS (PROMPTS)
const PROMPT_RENOMEACAO_SISTEMA = `
### [O] - Objetivo
Traduzir um nome rápido/abreviado de arquivo de áudio de aula médica para o nome oficial padronizado correspondente.

### [C] - Contexto
Matérias/Áreas oficiais e regras de classificação do semestre:
- **LHM** (Laboratório de Habilidades Médicas): Pode ser Teórica ou Prática. Se o nome contiver 'pratica', 'prática', 'osce', 'habilidade', 'procedimento', mapear como "LHM - [Assunto] - Prática". Caso contrário, mapear como "LHM - [Assunto] - Teórica".
- **Cirurgia**: Pode ser Teórica ou Prática. Se o nome contiver 'pratica', 'prática', 'cirurgica', 'bloco', 'sutura', 'paramentacao', mapear como "Cirurgia - [Assunto] - Prática". Caso contrário, mapear como "Cirurgia - [Assunto] - Teórica".
- **Conferência**: Mapear para "Conferência - [Assunto]".
- **TFC**: Mapear para "TFC - [Assunto]".
- **LMF**: Mapear para "LMF - [Assunto]".

Abreviações comuns de assuntos:
- 'cardio' -> 'Cardiologia' ou 'Insuficiência Cardíaca' ou o assunto equivalente.
- 'beta' -> 'Beta-bloqueadores'.
- 'hernia' -> 'Hérnias da Parede Abdominal'.
- 'ped' -> 'Pediatria'.
- 'radio' -> 'Radiologia'.

### [A] - Ações
1. Identifique qual das disciplinas oficiais o nome rápido pertence.
2. Extraia e corrija o assunto da aula com termos completos (letras iniciais maiúsculas).
3. Determine se é Prática ou Teórica com base nos termos.
4. Identifique se existe parte (ex: 'p1', 'p2', 'p03', 'parte 1', '1', '2') e formate como 'Parte 01', 'Parte 02', etc.
5. Formate o nome final exatamente como: '[Matéria] - [Assunto] - [Tipo]' (e se houver parte: '[Matéria] - [Assunto] - [Tipo] - [Parte]').
   Exemplo: 'cardio - beta - pratica' -> 'LHM - Beta-bloqueadores - Prática' (se o áudio original sugerir parte, ex: 'cardio beta p1' -> 'LHM - Beta-bloqueadores - Prática - Parte 01').

### [N] - Normas (Guardrails)
- Retorne APENAS o nome corrigido do arquivo, sem extensão, sem aspas adicionais, sem preâmbulo, sem explicações, sem ponto final.
- Se não conseguir identificar a matéria, use 'Medicina' como padrão (ex: 'Medicina - [Assunto]').
- Não insira caracteres especiais inválidos para nomes de arquivos do Windows/Linux.

### [E] - Exemplos
- Input: cardio - beta - pratica
  Output: LHM - Beta-bloqueadores - Prática
- Input: cirurgia hernia teorica p2
  Output: Cirurgia - Hérnias da Parede Abdominal - Teórica - Parte 02
- Input: conferência sepse
  Output: Conferência - Sepse
- Input: lmf radio torax
  Output: LMF - Radiologia de Tórax
- Input: tfc pediatria asma
  Output: TFC - Pediatria - Asma
`;

// SEÇÃO 3: ORQUESTRADOR
function gerarCelula3() {
  const inicio = Date.now();
  console.log('[INÍCIO] Iniciando geração da Célula 3 — ' + new Date().toISOString());

  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não encontrada nas propriedades do script. Por favor, adicione-a nas configurações do projeto.');
    return;
  }

  // ETAPA 0: Renomeação inteligente de áudios brutos
  try {
    renomearAudiosBrutos(apiKey);
  } catch (err) {
    console.error('[ERRO] Falha durante a renomeação dos áudios brutos: ' + err.message + ' | Stack: ' + err.stack);
  }

  // ETAPA 1: Carregamento de arquivos
  const audios = listarAudios();
  const slides = listarSlidesRecentes();

  console.log(`[INFO] Áudios encontrados na pasta: ${audios.length}`);
  console.log(`[INFO] Slides recentes (<${CFG.JANELA_SLIDES_HORAS}h): ${slides.length}`);

  if (audios.length === 0) {
    console.warn('[AVISO] Nenhum áudio encontrado. Abortando geração da Célula 3.');
    return;
  }

  // ETAPA 2: Cruzamento de áudio com slide
  const pares = cruzarAudiosSlides(audios, slides);
  const blocos = [];

  pares.forEach((par, idx) => {
    console.log(`\n[AULA ${idx + 1}] Processando chave base: "${par.nomeAudio}"`);

    let priming = '';
    if (par.slide) {
      console.log(`  [INFO] Slide correspondente encontrado: "${par.slide.getName()}" (Score: ${par.scoreMatch.toFixed(2)})`);
      const textoPdf = extrairTextoPdf(par.slide);
      if (textoPdf) {
        priming = gerarPrimingGemini(textoPdf, apiKey);
        console.log(`  [SUCESSO] Priming gerado com ${priming ? priming.split(',').length : 0} termos.`);
      }
    } else {
      console.warn('  [AVISO] Nenhum slide correspondente encontrado para este áudio.');
    }

    blocos.push(montarBlocoPython(par, priming, idx + 1));
  });

  // ETAPA 3: Salvamento do resultado
  const conteudo = montarArquivoFinal(blocos);
  salvarNoDrive(conteudo);

  const duracao = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(`\n[SUCESSO] Processo concluído em ${duracao}s — ${pares.length} aula(s) gerada(s).`);
}

// ETAPA 0 AUXILIAR: Renomeação inteligente
function renomearAudiosBrutos(apiKey) {
  console.log('[INÍCIO] Iniciando renomeação inteligente de áudios brutos...');
  const pasta = DriveApp.getFolderById(CFG.ID_PASTA_AUDIOS);
  const arquivos = pasta.getFiles();
  const audiosPendentes = [];

  while (arquivos.hasNext()) {
    const f = arquivos.next();
    const nome = f.getName();
    if (nome.match(/\.(m4a|mp3|wav|ogg|flac)$/i)) {
      // Ignora arquivos que já contêm " - " no nome (provavelmente já padronizados)
      if (!nome.includes(' - ')) {
        audiosPendentes.push(f);
      }
    }
  }

  if (audiosPendentes.length === 0) {
    console.log('[SUCESSO] Todos os áudios já estão padronizados.');
    return;
  }

  console.log(`[INFO] Encontrados ${audiosPendentes.length} áudio(s) bruto(s) pendente(s) de renomeação.`);

  audiosPendentes.forEach((arquivo, idx) => {
    const nomeOriginal = arquivo.getName();
    const extensaoMatch = nomeOriginal.match(/\.[^.]+$/);
    const extensao = extensaoMatch ? extensaoMatch[0] : '';
    const nomeSemExtensao = nomeOriginal.replace(/\.[^.]+$/, '');

    console.log(`[PROCESSANDO] Renomeando [${idx + 1}/${audiosPendentes.length}]: "${nomeOriginal}"`);

    const novoNomeSemExtensao = chamarGeminiParaRenomear(nomeSemExtensao, apiKey);
    if (novoNomeSemExtensao && novoNomeSemExtensao.trim().length > 0 && !novoNomeSemExtensao.includes('ERRO')) {
      const novoNomeCompleto = novoNomeSemExtensao.trim() + extensao;
      arquivo.setName(novoNomeCompleto);
      console.log(`[SUCESSO] Renomeado: "${nomeOriginal}" ──► "${novoNomeCompleto}"`);
    } else {
      console.warn(`[AVISO] Não foi possível padronizar o nome de "${nomeOriginal}". Mantido original.`);
    }

    if (idx < audiosPendentes.length - 1) {
      Utilities.sleep(CFG.DELAY_ENTRE_REQUISICOES_MS);
    }
  });
}

// SEÇÃO 4: INTEGRAÇÃO COM A API DO GEMINI
function chamarGeminiParaRenomear(nomeRapido, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CFG.MODELO_GEMINI}:generateContent?key=${apiKey}`;
  const promptUsuario = `NOME ORIGINAL RÁPIDO DO CELULAR: "${nomeRapido}"\nNOME PADRONIZADO:`;
  const payload = {
    system_instruction: { parts: [{ text: PROMPT_RENOMEACAO_SISTEMA.trim() }] },
    contents: [{ parts: [{ text: promptUsuario }] }],
    generationConfig: { temperature: 0.1 }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  for (let tentativa = 1; tentativa <= CFG.MAX_RETRIES; tentativa++) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();

      if (code === 200) {
        const json = JSON.parse(response.getContentText());
        const txt = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) return txt.trim();
      }

      if ((code === 429 || code >= 500) && tentativa < CFG.MAX_RETRIES) {
        const espera = tentativa * 5000;
        console.warn(`[API] Erro temporário (HTTP ${code}) ao renomear. Aguardando ${espera / 1000}s (Tentativa ${tentativa}/${CFG.MAX_RETRIES})...`);
        Utilities.sleep(espera);
      } else {
        console.error(`[API ERRO] Falha persistente na chamada do Gemini ao renomear (HTTP ${code}): ${response.getContentText()}`);
        break;
      }
    } catch (e) {
      console.error(`[API ERRO] Exceção na chamada de renomeação do Gemini: ${e.message}`);
      if (tentativa < CFG.MAX_RETRIES) Utilities.sleep(tentativa * 5000);
    }
  }
  return null;
}

function gerarPrimingGemini(textoPdf, apiKey) {
  const prompt =
    'Você é um especialista em terminologia médica. ' +
    'Analise o texto abaixo extraído de slides de uma aula de medicina ' +
    'e extraia até 50 termos técnicos relevantes: nomes de doenças, fármacos, ' +
    'estruturas anatômicas, mecanismos moleculares, siglas clínicas e termos em latim. ' +
    'Retorne APENAS os termos separados por vírgula, sem numeração, ' +
    'sem explicação, sem markdown, sem ponto final.\n\n' + textoPdf;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CFG.MODELO_GEMINI}:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  for (let tentativa = 1; tentativa <= CFG.MAX_RETRIES; tentativa++) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      const code = response.getResponseCode();

      if (code === 200) {
        const json = JSON.parse(response.getContentText());
        return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }

      if ((code === 429 || code >= 500) && tentativa < CFG.MAX_RETRIES) {
        const espera = tentativa * 10000;
        console.warn(`[API] Erro temporário (HTTP ${code}) no priming. Aguardando ${espera / 1000}s (Tentativa ${tentativa}/${CFG.MAX_RETRIES})...`);
        Utilities.sleep(espera);
      } else {
        console.error(`[API ERRO] Falha ao gerar priming do Gemini (HTTP ${code}): ${response.getContentText()}`);
        break;
      }
    } catch (e) {
      console.error(`[API ERRO] Exceção ao gerar priming do Gemini: ${e.message}`);
      if (tentativa < CFG.MAX_RETRIES) Utilities.sleep(tentativa * 5000);
    }
  }
  return '';
}

// SEÇÃO 5: UTILITÁRIOS
function listarAudios() {
  const pasta = DriveApp.getFolderById(CFG.ID_PASTA_AUDIOS);
  const arquivos = pasta.getFiles();
  const resultado = [];

  while (arquivos.hasNext()) {
    const f = arquivos.next();
    const nome = f.getName();
    if (nome.match(/\.(m4a|mp3|wav|ogg|flac)$/i)) {
      resultado.push(f);
    }
  }

  // Ordena por data de criação — mais recentes primeiro
  resultado.sort((a, b) => b.getDateCreated() - a.getDateCreated());
  return resultado;
}

function listarSlidesRecentes() {
  const corte = new Date(Date.now() - CFG.JANELA_SLIDES_HORAS * 60 * 60 * 1000);
  const resultado = [];
  varrerPastaRecursivo(DriveApp.getFolderById(CFG.ID_PASTA_SLIDES_RAIZ), corte, resultado);
  return resultado;
}

function varrerPastaRecursivo(pasta, corte, acumulador) {
  const arquivos = pasta.getFiles();
  while (arquivos.hasNext()) {
    const f = arquivos.next();
    if (f.getName().match(/\.pdf$/i) && f.getDateCreated() >= corte) {
      acumulador.push(f);
    }
  }
  const subpastas = pasta.getFolders();
  while (subpastas.hasNext()) {
    varrerPastaRecursivo(subpastas.next(), corte, acumulador);
  }
}

function cruzarAudiosSlides(audios, slides) {
  // Agrupa áudios por aula (detecta Parte 1 / Parte 2)
  const grupos = agruparPartes(audios);

  return grupos.map(grupo => {
    const nomeBase = normalizarNome(grupo.nomeBase);
    let melhorSlide = null;
    let melhorScore = 0;

    slides.forEach(slide => {
      const nomeSlide = normalizarNome(slide.getName());
      const score = similaridade(nomeBase, nomeSlide);
      if (score > melhorScore) {
        melhorScore = score;
        melhorSlide = slide;
      }
    });

    // Aceita match apenas se similaridade mínima de 0.2
    return {
      nomeAudio: grupo.nomeBase,
      arquivosAudio: grupo.arquivos,
      slide: melhorScore >= 0.2 ? melhorSlide : null,
      scoreMatch: melhorScore,
    };
  });
}

function agruparPartes(audios) {
  const grupos = {};

  audios.forEach(f => {
    const nome = f.getName();
    // Remove "Parte 01", "Parte 02", "Parte1", "Part 1" etc. para obter a chave base
    const chave = nome
      .replace(/[-_\s]*(parte|part)[-_\s]*\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!grupos[chave]) {
      grupos[chave] = { nomeBase: chave, arquivos: [] };
    }
    grupos[chave].arquivos.push(f);
  });

  // Ordena as partes dentro de cada grupo
  Object.values(grupos).forEach(g => {
    g.arquivos.sort((a, b) => a.getName().localeCompare(b.getName()));
  });

  return Object.values(grupos);
}

function normalizarNome(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\.(pdf|m4a|mp3|wav)$/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similaridade(a, b) {
  const tokensA = new Set(a.split(' ').filter(t => t.length > 2));
  const tokensB = new Set(b.split(' ').filter(t => t.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersecao = 0;
  tokensA.forEach(t => { if (tokensB.has(t)) intersecao++; });

  return intersecao / Math.max(tokensA.size, tokensB.size);
}

function extrairTextoPdf(slideFile) {
  try {
    console.log(`[SLIDE] Tentando converter slide "${slideFile.getName()}" (${slideFile.getId()}) para Doc temporário...`);
    const blob = slideFile.getBlob();

    // NOTA: Requer ativação do Drive API Avançado nas configurações do Apps Script!
    const docTemp = Drive.Files.insert(
      { title: '_temp_priming_ocr', mimeType: MimeType.GOOGLE_DOCS },
      blob,
      { convert: true }
    );

    const texto = DocumentApp.openById(docTemp.id).getBody().getText();
    DriveApp.getFileById(docTemp.id).setTrashed(true);
    return texto.substring(0, 10000);
  } catch (e) {
    console.error(`[SLIDE ERRO] Falha ao extrair texto do PDF: ${e.message}. Certifique-se de que a "Drive API" está ativada nas configurações de Serviços.`);
    return '';
  }
}

function montarBlocoPython(par, priming, idx) {
  const nomeSaida = inferirNomeSaida(par.nomeAudio);

  const linhasAudio = par.arquivosAudio
    .map(f => `        "${CFG.PREFIXO_AUDIO}${f.getName()}",`)
    .join('\n');

  const caminhoPdf = par.slide
    ? `"${obterCaminhoRelativo(par.slide)}"`
    : 'None';

  const primingLinha = priming
    ? `        "prompt_whisper": "${priming}",`
    : `        "prompt_whisper": "",  # sem slide correspondente`;

  return `
    # ── AULA ${idx} ──
    {
        "nome_saida": "${nomeSaida}",
        "caminhos_audios": [
${linhasAudio}
        ],
        "caminho_pdf": ${caminhoPdf},
${primingLinha}
    },`.trimStart();
}

function inferirNomeSaida(nomeBase) {
  // Remove timestamp tipo "20260513-150508", extensão e underscores
  return nomeBase
    .replace(/\d{8}-\d{6}/g, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function obterCaminhoRelativo(file) {
  try {
    const parents = [];
    let atual = file.getParents();
    while (atual.hasNext()) {
      const pasta = atual.next();
      parents.unshift(pasta.getName());
      atual = pasta.getParents();
    }
    // Remove "My Drive" do início
    const partes = parents.slice(1);
    return `/content/drive/MyDrive/${partes.join('/')}/${file.getName()}`;
  } catch (e) {
    return `/content/drive/MyDrive/${file.getName()}`;
  }
}

function montarArquivoFinal(blocos) {
  const agora = new Date().toLocaleString('pt-BR');
  return `# ══════════════════════════════════════════════════════
# CÉLULA 3 — GERADO AUTOMATICAMENTE
# ${agora}
# Cole este bloco na Célula 3 do Google Colab
# ══════════════════════════════════════════════════════

aulas_para_processar = [
${blocos.join('\n')}
]
`;
}

function salvarNoDrive(conteudo) {
  const agora = new Date();
  const timestamp = Utilities.formatDate(agora, 'America/Fortaleza', 'yyyyMMdd_HHmm');
  const nomeArquivo = `celula3_${timestamp}.py`;

  const pasta = DriveApp.getFolderById(CFG.ID_PASTA_SAIDA);
  const blob = Utilities.newBlob(conteudo, 'text/plain', nomeArquivo)
                         .setContentTypeFromExtension();

  pasta.createFile(blob);
  console.log(`[SUCESSO] Arquivo de Célula 3 salvo: "${nomeArquivo}"`);
}

// FUNÇÃO DE TESTE MANUAL DE RENOMEAÇÃO
function testarRenomeacaoIA() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[TESTE] GEMINI_API_KEY não encontrada nas Propriedades do Script.');
    return;
  }

  const testes = [
    'cardio - beta - pratica',
    'cirurgia hernia teorica p2',
    'conferencia sepse',
    'lmf radio torax'
  ];

  console.log('[TESTE] Testando mapeamentos de renomeação...');
  testes.forEach(t => {
    const res = chamarGeminiParaRenomear(t, apiKey);
    console.log(`  - Input: "${t}" ──► Output: "${res}"`);
  });
}