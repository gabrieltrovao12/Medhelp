// ============================================================
// SEÇÃO 1: CONFIGURAÇÕES GLOBAIS
// ============================================================

const CONFIG = {
  // IDs de Pastas
  ID_PASTA_ENTRADA_RESUMOS: '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6', // Resumos prontos (.md)
  ID_PASTA_ENTRADA_TUTORIA: '1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB', // PDFs de Tutoria
  ID_PASTA_SAIDA_FLASHCARDS: '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA', // Onde caem no Obsidian
  
  // Limites e Tempos (VLAEG)
  TEMPO_LIMITE_MS: 4.5 * 60 * 1000, // Proteção de 4.5 min do Apps Script
  HORAS_RECENTES: 168,              // Janela de 7 dias
  DELAY_ENTRE_ARQUIVOS_MS: 6000,    // Throttling preditivo para 15 RPM (Gemini Flash)
  MAX_RETRIES: 4,                   // Tentativas em caso de erro 429/500
  
  // Modelo Gemini
  GEMINI_MODEL: 'gemini-3.5-flash',
  
  // Mapeamento de Disciplinas (usado principalmente pelos Resumos)
  DISCIPLINAS: {
    // Básicas
    'anatomia':   'Anatomia',
    'histologia': 'Histologia',
    'fisiologia': 'Fisiologia',
    'bioquimica': 'Bioquímica',
    'genetica':   'Genética',
    'embriologia':'Embriologia',
    'imuno':      'Imunologia',
    'microbio':   'Microbiologia',
    
    // Herdadas / Específicas antigas
    'patologia':  'Patologia',
    'parasito':   'Parasitologia',
    'amebias':    'Parasitologia',
    'giardia':    'Parasitologia',
    'farmaco':    'Farmacologia',
    'antimetab':  'Farmacologia',
    'antineopla': 'Farmacologia',
    
    // Clínicas
    'cardio':     'Cardiologia',
    'pneumo':     'Pneumologia',
    'nefro':      'Nefrologia',
    'gastro':     'Gastroenterologia',
    'endrocrino': 'Endocrinologia',
    'neuro':      'Neurologia',
    'hemato':     'Hematologia',
    'infecto':    'Infectologia',
    'reumato':    'Reumatologia',
    'dermato':    'Dermatologia',
    'onco':       'Oncologia',

    // Cirúrgicas e Grandes Áreas
    'cirurgia':   'Cirurgia',
    'pedia':      'Pediatria',
    'gineco':     'Ginecologia e Obstetrícia',
    'psiquiatria':'Psiquiatria',
    'preventiva': 'Medicina Preventiva',
    'ortopedia':  'Ortopedia',
    'oftalmo':    'Oftalmologia',
    'otorrino':   'Otorrinolaringologia',

    // Especiais (LMF / LHM) herdados do original
    'radiologia': 'LMF - Radiologia',
    'rastreio':   'LMF - Radiologia',
    'torax':      'LMF - Radiologia',
    'clinica':    'LHM - Clínica',
    'fetal':      'LHM - Clínica',
    'obstetri':   'LHM - Clínica'
  }
};

// ============================================================
// SEÇÃO 2: PROMPTS OCANES
// ============================================================

const PROMPTS = {
  buildPromptResumos: function(content, disciplina) {
    return `
### [O] - Objetivo
Converter o resumo da aula fornecido em flashcards altamente atômicos (entre 18 e 20) estruturados para o plugin Obsidian Spaced Repetition no formato de Pergunta e Resposta (Q&A), com excelente hierarquia visual baseada em micro-tópicos.

### [C] - Contexto
- **Disciplina/Tema:** ${disciplina}
- **Verdade Terrestre:** Baseie-se estritamente no texto fornecido. Não alucine dados.
- **Idioma:** Português (Brasil).

### [A] - Ações
1. **Seleção de Conteúdo:** Focar em fisiopatologia (Mecanismos), critérios diagnósticos, condutas e armadilhas.
2. **Atomização:** 1 Pergunta = 1 Conceito central.
3. **Hierarquia Visual (Design do Card):** 
   - Estruture a resposta usando listas de marcadores (\`-\`).
   - Design limpo e minimalista: NÃO utilize nenhum tipo de emoji.
   - Use listas aninhadas (recuo) para detalhar componentes sem poluir o card.
   - Destaque termos-chave e patologias em **negrito**.
   - Valores, fármacos e exames em \`código\`.
   - Use setas lógicas (\`->\` ou \`=>\`) para denotar cascatas ou processos.

### [N] - Normas (Negativas)
- **PROIBIDO** pular linhas (deixar linhas em branco) dentro do bloco de resposta do mesmo card.
- **PROIBIDO** o uso de tags HTML (como <div>, <br>).
- **PROIBIDO** criar respostas longas em formato de parágrafo. Use estritamente listas e tópicos curtos.
- **PROIBIDO** emitir saudações ou comentários. Retornar apenas os cards.

### [E] - Exemplos
Qual a fisiopatologia da formação de **ascite** na cirrose?
?
- **Gatilho Inicial:** Hipertensão portal -> aumento da pressão hidrostática.
- **Cascata Sistêmica:** Vasodilatação esplâncnica -> queda do volume arterial.
  - *Reação*: Ativação severa do **SRAA** e SNS.
- **Desfecho:** Retenção renal de \`Na+\` e água -> extravasamento peritoneal.

### [S] - Saída
- Gerar em Markdown puro. 
- Pergunta na linha 1.
- O caractere \`?\` isolado na linha 2.
- A resposta em formato de lista (linha 3 em diante), sem NENHUMA quebra de linha em branco entre os itens.
- Separar um flashcard do outro com EXATAMENTE uma linha em branco.

### CONTEÚDO PARA PROCESSAR:
${content}
`.trim();
  },

  buildPromptTutoria: function(nomeArquivo, limite) {
    const minFlashcards = Math.max(5, limite - 2);
    return `
### [O] - Objetivo
Converter os objetivos de aprendizado extraídos do PDF de tutoria em exatamente entre ${minFlashcards} e ${limite} flashcards de revisão no formato de Pergunta e Resposta (Q&A), otimizados para o Obsidian Spaced Repetition, utilizando uma arquitetura visual de micro-tópicos hierárquicos.

### [C] - Contexto
- **Arquivo de Origem:** ${nomeArquivo}
- **Escopo Restrito (ANTOLHO):** LEIA APENAS A CAPA / PÁGINA 1 do PDF fornecido para extrair os "Objetivos de Aprendizado" ou o tema central do problema. IGNORE SUMARIAMENTE todo o restante do conteúdo escrito pelos alunos no PDF.
- **Verdade Terrestre Externa:** Após identificar os objetivos na capa, É OBRIGATÓRIO formular as respostas dos flashcards utilizando **exclusivamente** literatura médica consagrada (ex: Harrison, Robbins, Guyton, UpToDate). Não confie nem reproduza o texto das anotações dos alunos. Detalhe mecanismos fisiopatológicos, doses e cascatas com rigor acadêmico.
- **Idioma:** Português (Brasil).

### [A] - Ações
1. **Extração Cirúrgica:** Varra APENAS a primeira página do PDF e mapeie os objetivos de aprendizado declarados. Aborte a leitura das páginas seguintes.
2. **Geração Científica:** Responda aos objetivos mapeados cruzando com sua base acadêmica de mais alto nível. Distribua os ${limite} flashcards de forma equilibrada, seguindo a ordem dos objetivos.
3. **Atomização:** Cada pergunta deve testar um conceito específico.
4. **Hierarquia Visual (Design do Card):** 
   - Estruture a resposta com listas de marcadores (\`-\`).
   - Design limpo e minimalista: NÃO utilize nenhum tipo de emoji.
   - Use aninhamento (recuo de listas) para expandir explicações sem criar blocos massivos de texto.
   - Use **negrito** para patologias e conceitos cruciais.
   - Use \`código\` para doses, marcadores laboratoriais e fármacos.
   - Use setas (\`->\`) para descrever fluxos e reações.

### [N] - Normas (Guardrails)
- **PROIBIDO** utilizar as anotações do corpo do PDF (páginas seguintes) para embasar as respostas. O PDF serve única e exclusivamente para apontar quais são os objetivos.
- **PROIBIDO** pular linhas (deixar linhas vazias) dentro da resposta de um mesmo card. Isso quebra o plugin.
- **PROIBIDO** usar HTML ou respostas em formato de parágrafos densos. Use apenas tópicos curtos e diretos.
- **PROIBIDO** emitir explicações, preâmbulos ou notas. Retorne apenas o conteúdo em Markdown puro.

### [E] - Exemplos
Qual o mecanismo de ação da **Penicilina**?
?
- **Alvo Principal:** Inibe a enzima **transpeptidase** (PBP).
  - *Efeito*: Bloqueia a síntese da parede celular bacteriana (peptidoglicano).
- **Ação Primária:** Bactericida (age apenas na fase de crescimento ativo).
- **Espectro Clássico:** **Gram-positivos** e sífilis (\`Treponema pallidum\`).
- **Alerta Clínico:** Risco de anafilaxia em pacientes alérgicos cruzados.

### [S] - Saída
- Gerar os cards com a Pergunta na linha 1.
- O \`?\` isolado na linha 2.
- A resposta em tópicos listados da linha 3 em diante (SEM linhas vazias no meio).
- Separe cada flashcard completo com EXATAMENTE uma linha em branco.
`.trim();
  }
};
