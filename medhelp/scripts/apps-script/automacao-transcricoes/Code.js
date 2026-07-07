
// ============================================================
// SEÇÃO 1: CONSTANTES DE CONFIGURAÇÃO
// ============================================================

/** IDs das pastas do Google Drive */
const CONFIG = {
  // Pasta onde o Colab deposita os .txt com transcrição + slides
  ID_PASTA_ENTRADA:     '1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh',

  // Pasta de saída final — onde os .md vão para o Obsidian
  ID_PASTA_RESUMOS:     '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',

  // Pasta de arquivamento dos .txt já processados
  ID_PASTA_ARQUIVADOS:  '1R58WOeO0p3U51T05g-d-N9svziLSf9fL',
  ID_PASTA_AUDIOS:      '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',

  // Modelo: Flash tem 15 RPM e 1M tokens de contexto na cota gratuita
  // Troque por 'gemini-2.5-pro' apenas se tiver cota paga
  MODELO_GEMINI:        'gemini-2.5-flash',

  // Trava de segurança: GAS mata scripts após 6 min. Usamos 4.5 min.
  TEMPO_LIMITE_MS:      4.5 * 60 * 1000,

  // Intervalo entre arquivos (Flash: 15 RPM => ~4s mínimo; usamos 6s de margem)
  INTERVALO_ENTRE_ARQUIVOS_MS: 6000,

  // Tentativas máximas por arquivo antes de desistir
  MAX_RETRIES:          3,
};

// ============================================================
// SEÇÃO 2: PROMPT OCANES (System Instruction)
// ============================================================

const SYSTEM_INSTRUCTION = `**OBJETIVO:**
Realizar a análise cruzada entre a transcrição de uma aula e o material visual de apoio (slides) para sintetizar um relatório de estudo tático, estruturado e otimizado para avaliações acadêmicas na área médica.

**CONTEXTO:**
A análise deve se basear exclusivamente no cruzamento dos dois documentos fornecidos abaixo. O primeiro é a transcrição literal da fala do docente e o segundo é o conteúdo textual extraído dos slides de referência.

**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
\`[COLE AQUI A TRANSCRIÇÃO COMPLETA DA AULA]\`

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
\`[COLE AQUI O CONTEÚDO DOS SLIDES OU UMA DESCRIÇÃO DETALHADA]\`

**PROTOCOLO DE RENDERIZAÇÃO E ESTILO DE SAÍDA**

Este protocolo define as regras não negociáveis de formatação e tom de voz para o relatório final. Ele deve ser aplicado a todas as seções do documento gerado.

1. **Transparência e Atribuição Docente (Modo "Relator Tático"):**
* **Diretriz:** É mandatório que toda informação técnica, ênfase ou priorização seja explicitamente atribuída à fala do docente por meio de paráfrase. O objetivo é gerar um registro fiel da perspectiva e dos pontos de foco da aula, não um resumo genérico de livro-texto.
* **Execução — Paráfrase Obrigatória:** É terminantemente proibido reproduzir falas do docente na íntegra. Toda atribuição deve ser uma paráfrase fiel e gramaticalmente correta, precedida por um marcador de atribuição. Reserve aspas apenas para termos técnicos cunhados ou redefinidos pelo professor (ex: um apelido didático para um mecanismo).
* **Execução — Disfluências:** Ignorar completamente hesitações, repetições ("é...", "tipo...", "né?"), vícios de linguagem, frases não concluídas e qualquer ruído de transcrição. Esses elementos não devem aparecer em nenhuma seção do documento.
* **Exemplos de Marcadores de Atribuição:** *"O professor enfatizou que..."*, *"Segundo o docente..."*, *"Foi destacado em aula que..."*, *"O ponto central abordado foi..."*, *"O docente alertou para..."*.

2. **Otimização Visual para Leitura Dinâmica (Formato "Active Recall"):**
* **Diretriz:** A estrutura visual deve ser otimizada para escaneabilidade, revisão rápida e facilitação da memorização ativa. A clareza e a hierarquia da informação são prioritárias sobre o texto em prosa.
* **Execução:**
  * **Uso Obrigatório de Negrito:** Aplique \`**negrito**\` a todos os termos técnicos centrais, nomes de patologias, fármacos, mecanismos moleculares e conceitos-chave para que se destaquem visualmente.
  * **Sintaxe de Causalidade com Setas (\`->\`):** Substitua descrições textuais de processos, cascatas fisiológicas ou relações de causa e efeito por uma notação de seta lógica e direta.

* **Modelo de Aplicação Combinada:**
  * **NÃO FAZER:** "O professor explicou que a hipertensão portal causa um aumento da pressão hidrostática, o que por sua vez leva à formação de ascite."
  * **FAZER:** "O docente destacou que a **hipertensão portal** -> aumento da **pressão hidrostática** -> formação de **ascite**."

**Rigor Estético e Formatação:**
- **Remoção Absoluta de Emojis:** É terminantemente proibido o uso de qualquer emoji ou linguagem lúdica em todo o documento.
- Proibido gerar parágrafos com mais de 3 linhas contínuas.
- Proibido incluir saudações, prólogos ("Claro, aqui está...") ou epílogos.

**AÇÕES:**

1. **Inicialização e Sincronização de Entidades:** Execute um pré-processamento onde o \`CONTEÚDO_DOS_SLIDES_EM_TEXTO\` é definido como a fonte de verdade absoluta (*ground truth*) para toda a nomenclatura técnica. Mapeie os conceitos da \`TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO\` às suas contrapartes terminológicas exatas nos slides. Exceção: se o docente corrigir ou atualizar explicitamente um termo durante a aula, utilize o termo corrigido e sinalize com a tag: \`(ATUALIZADO EM AULA: slides usam "X", professor corrigiu para "Y")\`.

2. **Foco Principal da Aula — Índice de Prioridade:** Realize uma varredura na transcrição para quantificar a relevância de cada conceito. Classifique cada tópico em um dos três níveis de prioridade abaixo, com base nos critérios métricos listados:

* **Nível ALTA:** Atende a pelo menos dois dos critérios abaixo simultaneamente.
* **Nível MÉDIA:** Atende a exatamente um dos critérios abaixo.
* **Nível BAIXA:** Mencionado pelo docente, mas sem nenhum critério de cobrança identificado.

* **Critérios de classificação:**
  * **Gatilho de Atenção Direta:** Presença de comandos verbais preditivos (ex: "isso vai cair", "prestem atenção nisso").
  * **Tempo Dedicado em Aula:** Proporção de linhas/parágrafos da transcrição dedicados a um único conceito acima da média.
  * **Repetição Espaçada:** Menções do mesmo termo técnico em seções logicamente distintas da aula (início, meio, fim).

* *Formato da Evidência na coluna "Evidência":* paráfrase objetiva do comportamento do docente que justifica o nível atribuído (ex: "O docente retornou ao conceito em três momentos distintos e avisou expressamente sobre cobrança em prova").


3. **O que NÃO priorizar:** Rastreie a transcrição em busca de termos-chave explícitos que desqualificam o conteúdo para estudo aprofundado (ex: "a título de curiosidade", "isso é uma nota histórica", "não precisam se preocupar com isso agora"). Para cada tópico identificado, classifique a conduta recomendada em uma das três categorias abaixo e, quando aplicável, indique o conceito prioritário relacionado para onde o tempo de estudo deve ser redirecionado:

  * *ignorar completamente* — tópico sem relevância para avaliação, sem relação com conceitos cobráveis.
  * *saber que existe, não aprofundar* — tópico mencionado em contexto, mas sem detalhamento exigido.
  * *substituir tempo de estudo por: [conceito prioritário relacionado]* — tópico que consome atenção mas tem um conceito-irmão de alta prioridade que merece o tempo no lugar.

* *Formato:* lista de bullets no padrão:
  \`* [Tópico] — [conduta] — *Motivo: [paráfrase da fala do professor que desqualifica]*\`

4. **Síntese e Estruturação do Resumo Teórico:** Processe a transcrição, já calibrada pela AÇÃO 1, para gerar o resumo.

* **Calibração de Extensão por Duração da Aula:** Estime a duração da aula com base na densidade da transcrição (volume de texto e número de tópicos abordados) e ajuste o tamanho da Seção 3 conforme a tabela abaixo. O objetivo é um resumo completo o suficiente para ser o material principal de revisão pré-prova, sem redundâncias.

| Duração Estimada | Subtópicos mínimos na Seção 3 | Bullets por subtópico | Extensão orientativa |
| :--- | :---: | :---: | :--- |
| Curta (< 30 min) | 2 | mín. 2 | ~300–450 palavras |
| Média (30–60 min) | 3–4 | mín. 3 | ~500–700 palavras |
| Longa (> 60 min) | 5+ | mín. 3 | ~750–1000 palavras |

* Converta todas as descrições de processos ou cascatas em listas numeradas sequenciais.
* Transforme todas as comparações diretas entre dois ou mais conceitos em tabelas Markdown estruturadas.
* Mantenha a objetividade e limite as explicações a blocos curtos, priorizando listas hierárquicas sobre prosa.

5. **Varredura de Metadados Logísticos:** Execute uma busca por palavras-chave logísticas em ambos os documentos. Extraia e organize qualquer dado correspondente a: 'prova', 'avaliação', 'data', 'entrega', 'capítulo', 'livro', 'artigo', 'referência'.

6. **Descompilação de Correlações Clínicas:** Rastreie a transcrição para identificar e categorizar pontes entre a ciência básica e a aplicação prática. Esta seção deve ser concisa e direta: inclua apenas correlações que foram abordadas com clareza suficiente para formar um item de estudo. Omita subcategorias inteiras que não foram mencionadas na aula — não infira, não preencha com conhecimento externo.

* **Etiologias/Patologias:** Mapeie a Causa/Falha Fisiológica para a Doença/Condição Resultante.
* **Intervenções Farmacológicas:** Mapeie o Fármaco Citado ao seu [Alvo Molecular/Mecanismo] e [Efeito Clínico].
* **Semiologia:** Mapeie o [Evento Fisiopatológico] ao [Sinal/Sintoma Clínico] que ele gera.

* **Ao final desta seção, gerar obrigatoriamente a tabela de Gatilhos Diagnósticos**, consolidando em formato escaneável os achados mais relevantes identificados nas subcategorias acima:

| Achado / Cenário Clínico | Diagnóstico Principal | Conduta Imediata |
| :--- | :--- | :--- |
| [Achado] | [Diagnóstico] | [Conduta] |

* Incluir apenas achados com conduta clara identificada na aula. Se a conduta não foi mencionada, preencher com "—".

7. **Detecção de Erros Conceituais Comuns:** Inspecione a transcrição em busca de frases-gatilho que indiquem a correção de um erro frequente (ex: "cuidado para não confundir", "um erro comum é pensar que", "muitos alunos erram isso"). Extraia apenas os conceitos diretamente envolvidos nessas advertências.

8. **Compilação e Renderização Final:** Compile todos os artefatos gerados nas ações 2 a 7 na estrutura de saída final, aderindo estritamente à ordem sequencial e à formatação especificadas na seção **SAÍDA**. Esta é a etapa final e não deve introduzir nenhum conteúdo novo.

**NORMAS:**
1. **Contenção Teórica:** É terminantemente proibido autocompletar ou inferir informações que não foram explicitamente declaradas pelo docente na transcrição. Se uma explicação for iniciada e não concluída, demarque-a com a tag: \`(INCOMPLETO NA AULA: o docente iniciou o raciocínio sobre X mas não o concluiu)\`.
2. **Calibração Terminológica:** É proibido manter jargões, coloquialismos ou erros factuais do áudio. Corrija a terminologia para a versão oficial presente nos slides. Sinalize com a tag: \`(CORRIGIDO: o professor mencionou "X", ajustado para "Y" conforme os slides)\`.
3. **Reconstrução Contextual:** É proibido deixar pronomes vagos (ex: "isso aqui", "aquela estrutura"). Ancore todas as referências vagas ao seu correspondente visual ou conceitual explícito nos slides.
4. **Tratamento de Dados Ausentes:** Se informações logísticas ou erros comuns não forem mencionados, registre "Nenhuma diretriz logística ou bibliográfica identificada." ou "Nenhum erro comum destacado pelo docente.", respectivamente. Não presuma nem omita a seção correspondente. Se a Seção 6 não contiver nenhuma correlação identificável na transcrição, registre "Nenhuma correlação clínica identificada com clareza suficiente nesta aula." e não preencha as subcategorias. A tabela de Gatilhos Diagnósticos deve ser omitida nesse caso.
5. **Formatação Estrita:** É proibido o uso de emojis, saudações, prólogos, epílogos ou parágrafos com mais de 3 linhas contínuas.

**SAÍDA:**
Apresentar a saída exclusivamente no formato Markdown abaixo, sem qualquer texto introdutório ou de encerramento.

---

## 1. Foco Principal da Aula

| Prioridade | Conceito | Evidência |
| :---: | :--- | :--- |
| ALTA | [Conceito 1] | [Paráfrase objetiva da evidência de cobrança] |
| ALTA | [Conceito 2] | [Paráfrase objetiva da evidência de cobrança] |
| MÉDIA | [Conceito 3] | [Paráfrase objetiva da evidência de cobrança] |
| BAIXA | [Conceito 4] | [Paráfrase objetiva da evidência de cobrança] |


## 2. O que NÃO priorizar
* [Tópico 1] — *ignorar completamente* — *Motivo: [paráfrase da fala do professor que desqualifica]*
* [Tópico 2] — *saber que existe, não aprofundar* — *Motivo: [paráfrase da fala do professor que desqualifica]*
* [Tópico 3] — *substituir tempo de estudo por: [conceito prioritário relacionado]* — *Motivo: [paráfrase da fala do professor que desqualifica]*

## 3. Resumo Teórico

### [Subtópico A]
* **Conceito-chave:** [Explicação concisa]
* **Mecanismo de Ação:**
  1. Passo 1
  2. Passo 2
  3. Passo 3

### [Subtópico B]
| Característica | Conceito X | Conceito Y |
| :--- | :--- | :--- |
| **Mecanismo** | [Descrição] | [Descrição] |
| **Aplicação Clínica** | [Descrição] | [Descrição] |
| **Diferencial-chave** | [Descrição] | [Descrição] |

## 4. Informações Logísticas e Bibliográficas
* **Datas Relevantes:** [Ex: Prova P1: 25/10]
* **Leitura Obrigatória:** [Ex: Capítulo 12 — Guyton de Fisiologia]
* **Artigos Recomendados:** [Ex: Smith et al., NEJM 2023]
* **Outras Diretrizes:** [Qualquer instrução logística mencionada]
* *Se nenhuma informação for encontrada:* "Nenhuma diretriz logística ou bibliográfica identificada."

## 5. Correlação Clínica
* **Etiologia/Patologia:**
  * [Falha no Mecanismo Fisiológico] -> [Doença Resultante]
* **Intervenção Farmacológica:**
  * [Alvo Molecular/Receptor] -> [Fármaco] -> [Efeito Clínico]
* **Semiologia:**
  * [Evento Fisiopatológico] -> [Sinal/Sintoma Clínico Observável]
* *Se nenhuma correlação for identificada com clareza:* "Nenhuma correlação clínica identificada com clareza suficiente nesta aula."

### Gatilhos Diagnósticos
| Achado / Cenário Clínico | Diagnóstico Principal | Conduta Imediata |
| :--- | :--- | :--- |
| [Achado 1] | [Diagnóstico] | [Conduta ou —] |
| [Achado 2] | [Diagnóstico] | [Conduta ou —] |

## 6. Erros Comuns
* **Distinção Crítica:** [Conceito A] **NÃO É** [Conceito B].
  * **Fator Determinante:** [Explicação objetiva conforme o docente].
* *Se nenhum erro for explicitamente citado:* "Nenhum erro comum destacado pelo docente."`;


// ============================================================
// SEÇÃO 3: FUNÇÃO PRINCIPAL ORQUESTRADORA
// ============================================================

function processarNovasTranscricoes() {
  const tempoInicio = Date.now();

  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[FATAL] GEMINI_API_KEY não encontrada nas Propriedades do Script. Abortando.');
    return;
  }

  const pastaEntrada    = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA);
  const pastaResumos    = DriveApp.getFolderById(CONFIG.ID_PASTA_RESUMOS);
  const pastaArquivados = DriveApp.getFolderById(CONFIG.ID_PASTA_ARQUIVADOS);

  const arquivos = pastaEntrada.getFilesByType(MimeType.PLAIN_TEXT);

  let processados = 0;
  let falhas      = 0;

  while (arquivos.hasNext()) {

    if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
      console.warn('[AVISO] Tempo limite de 4.5 min atingido. Encerrando lote. ' +
                   'O restante será processado no próximo ciclo agendado.');
      break;
    }

    const arquivo      = arquivos.next();
    const nomeOriginal = arquivo.getName().replace(/\.txt$/i, ''); // preservado para logs e arquivamento
    const nomeLimpo    = nomeOriginal.replace(/^\d+\s*-\s*(?:[^-]+-\s*)?/, '').trim(); // usado nos arquivos .md

    console.log(`\n[INÍCIO] Processando: "${nomeOriginal}" → "${nomeLimpo}"`);

    let textoBruto;
    try {
      textoBruto = arquivo.getBlob().getDataAsString('UTF-8');
    } catch (e) {
      console.error(`[ERRO] Falha ao ler o arquivo "${nomeOriginal}": ${e.message}`);
      falhas++;
      continue;
    }

    const resumoGerado = chamarGeminiAPI(textoBruto, nomeOriginal, apiKey);

    if (resumoGerado) {
      try {
        const blobSaida = Utilities.newBlob('')
          .setDataFromString(resumoGerado, 'UTF-8')
          .setName(nomeLimpo + '.md'); // ← nomeLimpo

        pastaResumos.createFile(blobSaida);

        arquivo.moveTo(pastaArquivados);

        excluirAudiosDaAula(textoBruto, nomeOriginal); // ← nomeOriginal preservado para encontrar os áudios

        console.log(`[SUCESSO] "${nomeLimpo}.md" salvo em Resumos_Prontos e original arquivado.`);
        processados++;

      } catch (e) {
        console.error(`[ERRO] Falha ao salvar o arquivo "${nomeLimpo}": ${e.message}. ` +
                      'O .txt permanece na pasta de entrada para nova tentativa.');
        falhas++;
      }
    } else {
      console.error(`[FALHA] API não retornou resultado para "${nomeOriginal}". ` +
                    'O .txt permanece na pasta de entrada.');
      falhas++;
    }

    if (arquivos.hasNext()) {
      console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s antes do próximo arquivo...`);
      Utilities.sleep(CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS);
    }
  }

  console.log(`\n[FIM] Ciclo concluído. Processados: ${processados} | Falhas: ${falhas}`);
}


// ============================================================
// SEÇÃO 4: INTEGRAÇÃO COM A API DO GEMINI (com Retry + Backoff)
// ============================================================

/**
 * Envia o texto para o Gemini e retorna o resumo gerado.
 * Implementa Exponential Backoff para erros de cota (429) e servidor (5xx).
 *
 * @param {string} texto        - Conteúdo bruto do .txt (transcrição + slides)
 * @param {string} nomeArquivo  - Nome do arquivo (para logging e metadados)
 * @param {string} apiKey       - Chave da API Gemini
 * @returns {string|null}       - Texto do resumo gerado, ou null em caso de falha
 */
function chamarGeminiAPI(texto, nomeArquivo, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODELO_GEMINI}:generateContent?key=${apiKey}`;

  // Injeta metadados úteis no prompt para o modelo preencher o cabeçalho do .md
  const dataHoje = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  const promptUsuario = `**NOME DO ARQUIVO:** ${nomeArquivo}\n**DATA:** ${dataHoje}\n\n**ARQUIVO BRUTO PARA PROCESSAMENTO:**\n\n${texto}`;

  const payload = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [{
      parts: [{ text: promptUsuario }]
    }],
    generationConfig: {
      temperature: 0.2  // Baixa temperatura para máximo determinismo clínico
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true  // Capturamos os erros manualmente no loop
  };

  for (let tentativa = 1; tentativa <= CONFIG.MAX_RETRIES; tentativa++) {
    console.log(`[API] Tentativa ${tentativa}/${CONFIG.MAX_RETRIES} para "${nomeArquivo}"...`);

    const response = UrlFetchApp.fetch(url, options);
    const code     = response.getResponseCode();

    // --- Sucesso ---
    if (code === 200) {
      try {
        const json = JSON.parse(response.getContentText());

        // Guarda de segurança: verifica se o Gemini bloqueou a resposta (safety filters)
        if (!json.candidates || json.candidates.length === 0) {
          console.error(`[ERRO] A API retornou 200 mas sem candidatos. Possível bloqueio por filtros de segurança. ` +
                        `Resposta: ${response.getContentText().substring(0, 300)}`);
          return null;
        }

        // Guarda de segurança: verifica se o conteúdo existe
        const candidate = json.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error(`[ERRO] Candidato retornado sem conteúdo. finishReason: ${candidate.finishReason}`);
          return null;
        }

        console.log(`[API] Sucesso na tentativa ${tentativa}.`);
        return candidate.content.parts[0].text;

      } catch (e) {
        console.error(`[ERRO] Falha ao parsear a resposta JSON da API: ${e.message}`);
        return null;
      }
    }

    // --- Cota excedida (429): espera fixa de 62s para limpar janela de 1 minuto ---
    else if (code === 429) {
      const espera = 62000;
      console.warn(`[429] Cota excedida. Tentativa ${tentativa}/${CONFIG.MAX_RETRIES}. ` +
                   `Hibernando ${espera / 1000}s para reset da janela da API...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    }

    // --- Erro de servidor (5xx): Exponential Backoff com Jitter ---
    else if (code >= 500) {
      const espera = Math.pow(2, tentativa) * 1000 + Math.floor(Math.random() * 500);
      console.warn(`[${code}] Erro no servidor do Google. Tentativa ${tentativa}/${CONFIG.MAX_RETRIES}. ` +
                   `Aguardando ${Math.round(espera / 1000)}s...`);
      if (tentativa < CONFIG.MAX_RETRIES) Utilities.sleep(espera);
    }

    // --- Erro fatal (4xx que não seja 429): sem retry ---
    else {
      console.error(`[FATAL HTTP ${code}] Erro não recuperável: ${response.getContentText().substring(0, 500)}`);
      return null;
    }
  }

  console.error(`[ESGOTADO] ${CONFIG.MAX_RETRIES} tentativas falharam para "${nomeArquivo}". ` +
                'Se o erro for 429 persistente, considere reduzir a frequência do trigger.');
  return null;
}


// ============================================================
// SEÇÃO 5: UTILITÁRIOS — DIAGNÓSTICO E MANUTENÇÃO
// ============================================================

/**
 * Execute esta função manualmente no editor do Apps Script
 * para testar a conexão com a API sem processar arquivos reais.
 * Útil após trocar a API key ou o modelo.
 */
/**
 * Lê o cabeçalho AUDIOS_ORIGEM do .txt e exclui (move para lixeira)
 * todos os áudios correspondentes na pasta ID_PASTA_AUDIOS.
 * Falhas de exclusão são logadas mas não interrompem o fluxo.
 *
 * @param {string} textoBruto   - Conteúdo completo do .txt processado
 * @param {string} nomeArquivo  - Nome da aula (para logging)
 */
function excluirAudiosDaAula(textoBruto, nomeArquivo) {
  try {
    // Extrai a linha: **AUDIOS_ORIGEM:**nome1.m4a,nome2.m4a
    const match = textoBruto.match(/\*\*AUDIOS_ORIGEM:\*\*(.+)/);
    if (!match) {
      console.warn(`[ÁUDIO] Cabeçalho AUDIOS_ORIGEM não encontrado em "${nomeArquivo}". Nenhum áudio excluído.`);
      return;
    }

    const nomesAudios = match[1].trim().split(',').map(n => n.trim()).filter(Boolean);
    console.log(`[ÁUDIO] ${nomesAudios.length} áudio(s) identificado(s) para exclusão: ${nomesAudios.join(', ')}`);

    const pastaAudios = DriveApp.getFolderById(CONFIG.ID_PASTA_AUDIOS);

    nomesAudios.forEach(nomeAudio => {
      try {
        const resultados = pastaAudios.getFilesByName(nomeAudio);
        if (!resultados.hasNext()) {
          console.warn(`[ÁUDIO] Arquivo não encontrado na pasta de áudios: "${nomeAudio}". Pode já ter sido excluído.`);
          return;
        }
        while (resultados.hasNext()) {
          const audioFile = resultados.next();
          audioFile.setTrashed(true);
          console.log(`[ÁUDIO] Excluído: "${nomeAudio}"`);
        }
      } catch (e) {
        console.error(`[ÁUDIO] Falha ao excluir "${nomeAudio}": ${e.message}. O restante do fluxo não foi afetado.`);
      }
    });

  } catch (e) {
    console.error(`[ÁUDIO] Erro inesperado em excluirAudiosDaAula para "${nomeArquivo}": ${e.message}`);
  }
}


function testarConexaoAPI() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    console.error('[TESTE] GEMINI_API_KEY não encontrada.');
    return;
  }

  const textoTeste = `**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
Então, pessoal, hoje vamos falar sobre hipertensão portal. Isso vai cair na prova, prestem atenção.
A hipertensão portal causa aumento da pressão hidrostática, levando à ascite.

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
Slide 1 - Hipertensão Portal: Aumento da pressão no sistema venoso portal (>10 mmHg).
Consequências: ascite, varizes esofágicas, esplenomegalia.`;

  console.log('[TESTE] Enviando prompt de diagnóstico...');
  const resultado = chamarGeminiAPI(textoTeste, 'TESTE_DIAGNOSTICO', apiKey);

  if (resultado) {
    console.log('[TESTE] Conexão bem-sucedida. Primeiras 500 chars da resposta:');
    console.log(resultado.substring(0, 500));
  } else {
    console.error('[TESTE] Falha na conexão. Verifique a API key e o modelo configurado.');
  }
}

/**
 * Lista os arquivos pendentes na pasta de entrada.
 * Execute manualmente para checar a fila antes de acionar o pipeline.
 */
function listarFilaPendente() {
  const pastaEntrada = DriveApp.getFolderById(CONFIG.ID_PASTA_ENTRADA);
  const arquivos = pastaEntrada.getFilesByType(MimeType.PLAIN_TEXT);
  let count = 0;
  console.log('[FILA] Arquivos .txt pendentes na pasta de entrada:');
  while (arquivos.hasNext()) {
    const f = arquivos.next();
    const tamanhoKB = Math.round(f.getSize() / 1024);
    console.log(`  - ${f.getName()} (${tamanhoKB} KB) | Modificado: ${f.getLastUpdated()}`);
    count++;
  }
  if (count === 0) console.log('  [vazia]');
  console.log(`[FILA] Total: ${count} arquivo(s) aguardando processamento.`);
}