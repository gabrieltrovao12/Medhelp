// ══════════════════════════════════════════════════════════════════
// GERADOR DE CÉLULA 3 — Apps Script
// Varre áudios (todos) + slides recentes (<24h), cruza por nome,
// gera priming via Gemini e salva o bloco Python pronto no Drive.
// ══════════════════════════════════════════════════════════════════

const CFG = {
  ID_PASTA_AUDIOS:       '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
  ID_PASTA_SLIDES_RAIZ:  '1Xt4bqNvrS90myX54prN96pkFX5XOyVqv',
  ID_PASTA_SAIDA:        '1rMaDcdTU5wOJIhwY1eJKoT11',
  GEMINI_API_KEY:        'AIzaSyC8oickhFH0Zwn4P3aNm1nuxrZVHr1HwFE',
  MODELO_GEMINI:         'gemini-2.0-flash',
  JANELA_SLIDES_HORAS:   24,
  PREFIXO_AUDIO:         '/content/drive/MyDrive/Logística - Drive/Áudios aulas/',
};

// ── ENTRY POINT — vincule esta função ao trigger manual ou time-driven ──
function gerarCelula3() {
  const inicio = new Date();
  Logger.log('▶ Iniciando geração da Célula 3 — ' + inicio.toISOString());

  const audios = listarAudios();
  const slides = listarSlidesRecentes();

  Logger.log(`ℹ Áudios encontrados: ${audios.length}`);
  Logger.log(`ℹ Slides recentes (<${CFG.JANELA_SLIDES_HORAS}h): ${slides.length}`);

  if (audios.length === 0) {
    Logger.log('⚠ Nenhum áudio encontrado. Abortando.');
    return;
  }

  const pares = cruzarAudiosSlides(audios, slides);
  const blocos = [];

  pares.forEach((par, idx) => {
    Logger.log(`\n[Aula ${idx + 1}] ${par.nomeAudio}`);

    let priming = '';
    if (par.slide) {
      Logger.log(`  Slide: ${par.slide.getName()}`);
      const textoPdf = extrairTextoPdf(par.slide);
      if (textoPdf) {
        priming = gerarPrimingGemini(textoPdf);
        Logger.log(`  Priming: ${priming ? '✅ ' + priming.split(',').length + ' termos' : '⚠ não gerado'}`);
      }
    } else {
      Logger.log('  Slide: ⚠ sem correspondência');
    }

    blocos.push(montarBlocoPython(par, priming, idx + 1));
  });

  const conteudo = montarArquivoFinal(blocos);
  salvarNoDrive(conteudo);

  const duracao = ((new Date() - inicio) / 1000).toFixed(1);
  Logger.log(`\n✅ Concluído em ${duracao}s — ${pares.length} aula(s) gerada(s).`);
}

// ── LISTAR TODOS OS ÁUDIOS ────────────────────────────────────────
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

// ── LISTAR SLIDES RECENTES (recursivo) ───────────────────────────
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

// ── CRUZAMENTO ÁUDIO × SLIDE ──────────────────────────────────────
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

// ── NORMALIZAÇÃO E SIMILARIDADE ───────────────────────────────────
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

// ── EXTRAIR TEXTO DO PDF (converte para Google Docs) ──────────────
function extrairTextoPdf(slideFile) {
  try {
    Logger.log(`  PDF: tentando converter "${slideFile.getName()}" (${slideFile.getId()})`);
    const blob = slideFile.getBlob();
    Logger.log(`  PDF: blob obtido — ${blob.getBytes().length} bytes`);

    const docTemp = Drive.Files.insert(
      { title: '_temp_priming', mimeType: MimeType.GOOGLE_DOCS },
      blob,
      { convert: true }
    );
    Logger.log(`  PDF: convertido para Google Docs — ID ${docTemp.id}`);

    const texto = DocumentApp.openById(docTemp.id).getBody().getText();
    Logger.log(`  PDF: ${texto.length} chars extraídos`);
    DriveApp.getFileById(docTemp.id).setTrashed(true);
    return texto.substring(0, 10000);
  } catch (e) {
    Logger.log(`  ⚠ Falha ao extrair PDF: ${e.message} | Stack: ${e.stack}`);
    return '';
  }
}

// ── GERAR PRIMING VIA GEMINI ──────────────────────────────────────
function gerarPrimingGemini(textoPdf) {
  const prompt =
    'Você é um especialista em terminologia médica. ' +
    'Analise o texto abaixo extraído de slides de uma aula de medicina ' +
    'e extraia até 50 termos técnicos relevantes: nomes de doenças, fármacos, ' +
    'estruturas anatômicas, mecanismos moleculares, siglas clínicas e termos em latim. ' +
    'Retorne APENAS os termos separados por vírgula, sem numeração, ' +
    'sem explicação, sem markdown, sem ponto final.\n\n' + textoPdf;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CFG.MODELO_GEMINI}:generateContent?key=${CFG.GEMINI_API_KEY}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  let tentativas = 0;
  while (tentativas < 3) {
    try {
      const resp = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
      });

      const codigo = resp.getResponseCode();
      const corpo = resp.getContentText();
      Logger.log(`  Gemini: HTTP ${codigo}`);
      Logger.log(`  Gemini: resposta bruta — ${corpo.substring(0, 500)}`);

      if (codigo === 429 || codigo >= 500) {
        tentativas++;
        Logger.log(`  Gemini: aguardando ${tentativas * 15}s antes de retry...`);
        Utilities.sleep(tentativas * 15000);
        continue;
      }
      if (codigo !== 200) return '';

      const dados = JSON.parse(corpo);
      return dados?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    } catch (e) {
      Logger.log(`  Gemini: exceção — ${e.message}`);
      tentativas++;
      Utilities.sleep(10000);
    }
  }
  return '';
}

// ── MONTAR BLOCO PYTHON DE CADA AULA ─────────────────────────────
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
  // Retorna o path completo do Drive como string legível
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

// ── MONTAR ARQUIVO FINAL ──────────────────────────────────────────
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

// ── SALVAR NO DRIVE ───────────────────────────────────────────────
function salvarNoDrive(conteudo) {
  const agora = new Date();
  const timestamp = Utilities.formatDate(agora, 'America/Fortaleza', 'yyyyMMdd_HHmm');
  const nomeArquivo = `celula3_${timestamp}.py`;

  const pasta = DriveApp.getFolderById(CFG.ID_PASTA_SAIDA);
  const blob = Utilities.newBlob(conteudo, 'text/plain', nomeArquivo)
                         .setContentTypeFromExtension();

  pasta.createFile(blob);
  Logger.log(`✅ Arquivo salvo: ${nomeArquivo}`);
}