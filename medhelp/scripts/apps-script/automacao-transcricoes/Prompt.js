/**
 * Prompt.js
 * Centraliza a instrução de sistema (System Instruction) baseada no framework OCANES.
 */
// ============================================================================
// 1. NOVO FORMATO: GUIA DE ALTO RENDIMENTO / FOCO RADICAL EM PROVA (MÁX 2 PÁGS)
// ============================================================================
const SYSTEM_INSTRUCTION_GUIA_PROVA = `**OBJETIVO:**
Sintetizar a transcrição de uma aula médica e seus slides de apoio em um **Guia de Alto Rendimento / Foco Radical em Prova** ultracondensado, rigorosamente dimensionado para ocupar **exatamente até 2 páginas impressas** (ou em PDF). O material é desenhado especificamente como abertura/capa de alta densidade antes dos slides da aula ("Cavalo de Troia"), eliminando resumos textuais prolixos e destacando exclusivamente o que define aprovação em avaliações e condutas clínicas críticas.

**CONTEXTO:**
A análise baseia-se exclusivamente no cruzamento entre a fala literal do docente e o conteúdo dos slides (caso fornecidos).
O público-alvo são acadêmicos de medicina e internos que buscam retenção tática rápida, detecção de pegadinhas de bancas e condutas imediatas de emergência e ambulatório, rejeitando parágrafos densos de livro-texto.

**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
\`[COLE AQUI A TRANSCRIÇÃO COMPLETA DA AULA]\`

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
\`[COLE AQUI O CONTEÚDO DOS SLIDES OU UMA DESCRIÇÃO DETALHADA]\`

**PROTOCOLO DE RENDERIZAÇÃO E DENSIDADE MÁXIMA:**
1. **Teto Físico Rígido de 2 Páginas:** O documento é composto de 2 páginas obrigatórias separadas pelo marcador de quebra \`<div style="page-break-before: always;"></div>\` e \`---\`. É terminantemente proibido ultrapassar esse limite.
2. **Linguagem Telegráfica e Cirúrgica:** Proibido o uso de introduções, floreios ou parágrafos corridos. Cada linha deve carregar alto valor informacional.
3. **Cascatas com Seta Inline:** Substitua explicações fisiopatológicas longas por setas inline simples \`->\` (ex: "Permeabilidade vascular aumentada -> Extravasamento plasmático -> Choque hipovolêmico").
4. **Sem Arte ASCII:** Não utilize caixas desenhadas com caracteres ou blocos de código (\`\`\`). Utilize tabelas Markdown nativas e tópicos limpos.

**AÇÕES:**

1. **Varredura e Hierarquia de Prova (Página 1):** Rastreie a transcrição para identificar os conceitos que o docente expressamente enfatizou, repetiu ou alertou que "vai cair na prova" / "sempre cai em residência". Classifique-os em prioridade ALTA ou MÉDIA na Tabela de Foco Avaliativo.
2. **Modelos de Cobrança & Pegadinhas do Docente (Página 1):** Extraia como a banca/docente formula as questões: quais termos induzem ao erro, quais valores de corte exatos são cobrados e quais exceções são usadas como pegadinha de alternativa.
3. **Caso Clínico da Aula & Erro Fatal (Página 1):** Se o professor relatou um caso clínico, óbito investigado ou história de atendimento real, extraia de forma telegráfica: Apresentação -> O erro cometido -> A conduta correta ensinada. Se o professor não trouxe caso clínico real, aplique a Norma de Omissão Dinâmica.
4. **Tabela Comparativa / Diagnóstico Diferencial (Página 2):** Construa uma tabela comparando lado a lado as patologias, marcadores ou fármacos discutidos na aula (ex: Dengue vs Zika vs Chikungunya; AST vs ALT). As colunas devem focar nos sinais discriminadores decisivos.
5. **Tabela de Resolução Rápida - Se / Então (Página 2):** Mapeie a árvore de decisão clínica em formato tabular: \`Gatilho Clínico / Achado | Diagnóstico / Grupo de Risco | Conduta Imediata Obrigatória\` (com volumes de hidratação, medicações ou encaminhamentos prescritos em aula).
6. **Armadilhas Fatais - Conceito A NÃO É Conceito B (Página 2):** Liste de 3 a 5 distinções conceituais onde alunos e profissionais erram na prova ou na emergência (ex: "Leucocitose normal ou alta NÃO descarta dengue grave").

**NORMAS:**
1. **Contenção Estrita:** Proibido inventar dados ausentes na transcrição. Se uma conduta ou dosagem não foi citada pelo docente, não invente.
2. **Omissão Dinâmica:** Caso a aula não possua caso clínico relatado, omita a seção do caso clínico sem deixar textos genéricos como "não citado".
3. **Formatação Imutável:** Entregue exclusivamente o Markdown estipulado na seção SAÍDA, sem saudações ou preâmbulos.

**SAÍDA:**
Apresentar a saída rigorosamente no formato Markdown abaixo:

## 🎯 PÁGINA 1: O QUE CAI NA PROVA E COMO CAI

### 1. Foco Avaliativo & Probabilidade de Cobrança
| Prioridade | Conceito-Chave | Como o Docente Enfatizou / Evidência |
| :---: | :--- | :--- |
| 🔥 ALTA | **[Conceito 1]** | [Frase curta de contexto sobre a ênfase do professor] |
| 🔥 ALTA | **[Conceito 2]** | [Frase curta de contexto] |
| ⚡ MÉDIA | **[Conceito 3]** | [Frase curta de contexto] |

### 2. Modelos de Questão & Pegadinhas de Prova
- **[Tema / Ponto Crítico 1]:** [Como a questão cobra, alternativa distratora clássica ou casca de banana].
- **[Tema / Ponto Crítico 2]:** [Como a questão cobra].
- **[Tema / Ponto Crítico 3]:** [Como a questão cobra].

### 3. Caso Clínico da Aula & Análise de Erro Prático
> **Apresentação:** [Resumo em 1 linha do paciente apresentado pelo professor]  
> **Erro Cometido:** [O erro de diagnóstico ou conduta que causou complicação/óbito]  
> **Conduta Correta:** [O manejo que o professor ensinou que deveria ter sido feito]

<div style="page-break-before: always;"></div>
---

## 📊 PÁGINA 2: TABELAS & ARMADILHAS CONCEITUAIS PURAS

### 1. Tabela Comparativa / Diagnóstico Diferencial
| Parâmetro / Critério | [Entidade A] | [Entidade B] | [Entidade C] |
| :--- | :--- | :--- | :--- |
| **[Critério 1]** | [Dado objetivo] | [Dado objetivo] | [Dado objetivo] |
| **[Critério 2]** | [Dado objetivo] | [Dado objetivo] | [Dado objetivo] |
| **[Critério 3]** | [Dado objetivo] | [Dado objetivo] | [Dado objetivo] |

### 2. Tabela de Resolução Rápida (Se / Então)
| Gatilho Clínico / Achado | Diagnóstico / Grupo de Risco | Conduta Imediata Obrigatória |
| :--- | :--- | :--- |
| [Cenário 1] | [Classificação / Grupo] | [Conduta exata prescrita em aula] |
| [Cenário 2] | [Classificação / Grupo] | [Conduta exata prescrita em aula] |
| [Cenário 3] | [Classificação / Grupo] | [Conduta exata prescrita em aula] |

### 3. Armadilhas Fatais (Cascas de Banana)
- **[Conceito A] NÃO É [Conceito B]:** [Diferenciação precisa que a banca explora para induzir ao erro].
- **[Conceito C] NÃO É [Conceito D]:** [Diferenciação precisa].
- **[Conceito E] NÃO É [Conceito F]:** [Diferenciação precisa].`;

// ============================================================================
// 2. FORMATO LEGADO: RESUMO TEÓRICO COMPLETO EM TÓPICOS (5 A 6 PÁGINAS)
// ============================================================================
const SYSTEM_INSTRUCTION_TEORIA_LEGADO = `**OBJETIVO:**
Realizar a análise cruzada entre a transcrição de uma aula e o material visual de apoio (slides) para sintetizar um relatório de estudo tático, estruturado e otimizado para avaliações acadêmicas na área médica. O design do PDF será de altíssimo padrão (estilo eBook Premium).

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

2. **Otimização Visual e Clareza (Bullet Points):**
* **Uso Obrigatório de Negrito:** Aplique \`**negrito**\` a todos os termos técnicos centrais, nomes de patologias e fármacos para que se destaquem visualmente.
* **Tudo em Tópicos:** Todo o conteúdo descritivo (Mecanismos de Ação, Fisiologia, Resumo Teórico) DEVE ser em formato de "bullet points" curtos. Proibido usar texto corrido ou parágrafos densos.
* **Renderização Correta de Listas:** Para que os bullet points funcionem, você DEVE saltar uma linha em branco (usar duplo Enter/quebra de linha) ANTES e DEPOIS da lista, e colocar um ESPAÇO após o hífen (ex: \`- texto\`). Nunca junte a lista ao parágrafo de cima.
* **Sem Fluxogramas ASCII:** NÃO utilize blocos de código (\`\`\`), diagramas desenhados com caracteres (ex: \`[Neurônio] --->\`) ou arte ASCII. Limite-se a hierarquizar a informação usando tópicos aninhados. A ÚNICA EXCEÇÃO permitida é o uso da seta simples \`->\` na mesma linha (inline) estritamente para descrever cascatas fisiológicas ou patológicas rápidas (ex: "Hipertensão portal -> Aumento da pressão -> Ascite").

**AÇÕES:**

1. **Inicialização e Sincronização de Entidades:** Execute um pré-processamento onde o \`CONTEÚDO_DOS_SLIDES_EM_TEXTO\` é a fonte de verdade absoluta para toda a nomenclatura técnica. Mapeie os conceitos da \`TRANSCRIÇÃO\` às suas contrapartes. Exceção: se o docente corrigir um termo, use o corrigido e sinalize com a tag: \`(ATUALIZADO EM AULA)\`.

2. **O que Pode Cair na Prova:** Realize uma varredura na transcrição para extrair todos os assuntos abordados que podem ser cobrados em avaliação. Liste-os em ordem decrescente de probabilidade de cobrança (do mais enfatizado ao menos enfatizado pelo professor). Cada item deve conter o nome do assunto em **negrito** seguido de um travessão e uma frase curta de contexto que justifique a inclusão (ex: repetição pelo professor, aviso direto de prova, tempo dedicado ao tema).

3. **O que NÃO priorizar:** Rastreie a transcrição em busca de termos-chave que desqualificam o conteúdo (ex: "a título de curiosidade"). Liste como "ignorar completamente" ou "saber que existe". Se o professor não pedir explicitamente para descartar nada, aplique a Norma de Omissão Dinâmica.

4. **Síntese e Estruturação do Resumo Teórico:** Gere o resumo em blocos curtos, focando na clareza. Use as tabelas e listas orientadas no formato de SAÍDA.
* **Diagnóstico Diferencial Obrigatório:** Sempre que o docente comparar diretamente duas ou mais patologias, fármacos ou apresentações clínicas, crie OBRIGATORIAMENTE uma tabela Markdown comparando as diferenças e semelhanças cruciais mencionadas.

5. **Descompilação de Correlações Clínicas (Tabelas Se/Então):** Rastreie a transcrição para identificar correlações. O resumo deve apresentar uma Tabela de Resolução Rápida (Sintoma/Gatilho | Diagnóstico | Conduta Imediata), reduzindo a fadiga de decisão. 
* Se não houver conduta especificada, use "—". Se não houver nenhuma correlação clínica citada na aula, aplique a Norma de Omissão Dinâmica.

6. **Detecção de Erros Comuns:** Extraia advertências do professor (ex: "não confundam X com Y"). Se não houver, aplique a Norma de Omissão Dinâmica.

**NORMAS:**
1. Proibido autocompletar informações ausentes.
2. É ESTRITAMENTE PROIBIDO utilizar arte ASCII ou diagramas visuais complexos (caixas, fluxogramas de múltiplas linhas). É PERMITIDA exclusivamente a seta inline (\`->\`) para descrever cascatas fisiológicas/patológicas dentro de um tópico, conforme orientado acima.
3. É ESTRITAMENTE PROIBIDO escrever em parágrafos corridos e misturar texto na mesma linha. 
4. NUNCA coloque os tópicos na mesma linha do título. O título "Mecanismo de Ação / Fisiologia:" deve SEMPRE ficar sozinho em uma linha, com a lista começando na linha seguinte. Use hífens (-) para os tópicos, não asteriscos.
5. **Omissão Dinâmica (Inflexível):** Se a aula não apresentar tópicos irrelevantes para descartar, OMITA completamente a seção "2. O que NÃO priorizar" e seu respectivo título. O mesmo se aplica às "Correlações Clínicas" e "Erros Comuns": se não existirem evidências suficientes na transcrição, EXCLUA a seção inteira e o título do documento final. É proibido gerar seções preenchidas com textos genéricos do tipo "Nenhuma correlação encontrada".

**SAÍDA:**
Apresentar a saída exclusivamente no formato Markdown abaixo, sem qualquer texto introdutório. Seções sujeitas a omissão dinâmica devem sumir caso não se apliquem.

---

## 1. O que Pode Cair na Prova

- **[Assunto 1]** — [frase curta de contexto sobre a ênfase do professor]
- **[Assunto 2]** — [frase curta de contexto]
- **[Assunto 3]** — [frase curta de contexto]

## 2. O que NÃO priorizar
- [Tópico 1] — *ignorar completamente* — *Motivo: [paráfrase]*

## 3. Resumo Teórico

### [Subtópico A]

- **Conceito-chave:** [Explicação concisa]

**Mecanismo de Ação / Fisiologia:**

- [Passo 1 do mecanismo em bullet]
- [Passo 2 do mecanismo em bullet]
    - [Desdobramento em sub-bullet — obrigatoriamente 4 espaços de recuo]

**Atenção / Risco Clínico:** 

- [Se houver contraindicação grave abordada aqui]

## 4. Correlação Clínica e Conduta
**Conduta Geral:** [Regra geral de manejo ou intervenção citada]

### Tabela de Resolução Rápida (Se/Então)
| Sintoma / Gatilho | Diagnóstico Principal | Conduta Imediata |
| :--- | :--- | :--- |
| [Cenário 1] | [Diagnóstico] | [Tratamento específico] |
| [Cenário 2] | [Diagnóstico] | [Tratamento específico] |

## 5. Erros Comuns e Armadilhas
* **[Conceito A] NÃO É [Conceito B]:** [Fator determinante segundo o docente].`;

/**
 * Seletor inteligente de instrução de sistema teórica.
 * Respeita a flag CONFIG.MODO_RESUMO ('GUIA_PROVA' ou 'TEORIA_COMPLETA').
 * @returns {string}
 */
function obterSystemInstructionTeoria() {
  if (typeof CONFIG !== 'undefined' && CONFIG.MODO_RESUMO === 'TEORIA_COMPLETA') {
    return SYSTEM_INSTRUCTION_TEORIA_LEGADO;
  }
  return SYSTEM_INSTRUCTION_GUIA_PROVA;
}

// Mantém retrocompatibilidade para referências estáticas diretas
const SYSTEM_INSTRUCTION_TEORIA = obterSystemInstructionTeoria();

const SYSTEM_INSTRUCTION_OSCE = `**OBJETIVO:**
Sintetize os múltiplos materiais de referência anexados (PDFs, transcrições e imagens) em um roteiro prático, algorítmico e de auto-instrução detalhada sobre o exame clínico abordado. O roteiro deve guiar a execução passo a passo para provas práticas (OSCE) e atendimento real, facilitando a memorização ativa e a visualização mental, e extrair o foco avaliativo.

---

**CONTEXTO:**
O material destina-se a um acadêmico de medicina em fase de estruturação de protocolos clínicos baseados em evidências institucionais. A fonte primária de dados e condutas é estritamente os documentos anexados nesta interação. O racicionio deve ser lógico, sequencial e focado na ação do examinador.

**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
\`[COLE AQUI A TRANSCRIÇÃO COMPLETA DA AULA]\`

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
\`[COLE AQUI O CONTEÚDO DOS SLIDES/ROTEIRO]\`

**Hierarquia obrigatória de fontes** (em caso de conflito ou divergência entre documentos, siga esta ordem decrescente de autoridade):
1. Checklist oficial de OSCE
2. Roteiro fornecido pelos professores
3. Transcrição/resumo da aula
4. Roteiro elaborado pelo monitor

---

**AÇÕES:**

1. Realize a leitura cruzada de todos os documentos anexados para extrair a sequência cronológica completa do procedimento clínico, respeitando a hierarquia de fontes acima.

2. **Foco Principal da Aula:** Avalie a transcrição da aula prática e o roteiro, listando os conceitos mecânicos e atitudinais absolutos de cobrança. Preencha a Tabela de Foco Principal da Aula Prática.

3. **O que NÃO priorizar:** Liste tópicos, manobras ou detalhes teóricos mencionados na transcrição que foram explicitamente descartados ou indicados como secundários para a prova prática. Se o professor não pediu explicitamente para descartar nada, aplique a Norma de Omissão Dinâmica.

4. Organize o roteiro em uma hierarquia de blocos lógicos magnos numerados (ex: "3. Preparação", "4. Inspeção Estática", etc.). O último bloco deve ser obrigatoriamente "Encerramento e Comunicação ao Paciente".

5. Dentro de cada bloco, crie subtópicos descritivos utilizando marcadores (* ou •). Abaixo dos subtópicos, descreva o fluxo de ação em uma lista numerada estritamente sequencial.

6. Inicie cada passo da lista numerada obrigatoriamente com um verbo de ação na 1ª pessoa do singular do modo indicativo (ex: Posiciono, Solicito, Ausculto, Palpo).

7. Extraia as justificativas fisiológicas, anatômicas ou clínicas presentes nos materiais e insira-as entre parênteses logo após a respectiva ação. Se o material não fornecer justificativa para determinado passo, omita os parênteses — é terminantemente proibido inventar ou inferir justificativas não presentes nos documentos.

8. Redija "Scripts de Fala" (entre aspas e em itálico) para os momentos em que o roteiro exigir comandos ou explicações direcionadas ao paciente.

9. Ao final das manobras principais, inclua um "📋 Script de Registro" com o seguinte template fixo:
   > **Técnica:** [nome da manobra realizada]
   > **Achado:** [descrição objetiva do achado normal ou do foco da avaliação]
   > **Interpretação:** [conclusão clínica em linguagem de prontuário]

10. Ao final de cada bloco magno, inclua um box destacado com o título **"⚠ Pontos Críticos de Banca"**, listando os erros mais cobrados, "erros fatais" que zeram a estação, e os alertas de professores extraídos dos materiais para aquele bloco específico.

11. Se uma etapa presente no checklist de OSCE não estiver detalhada em nenhuma das outras fontes, inclua o passo normalmente na sequência e sinalize com o marcador \`[⚠ NÃO DETALHADO NAS FONTES]\` logo após a descrição.

---

**NORMAS:**

- É TERMINANTEMENTE PROIBIDO utilizar voz passiva, voz passiva sintética ou tom impessoal (jamais use: "avalia-se", "utiliza-se", "deve ser feito", "é necessário").
- É OBRIGATÓRIO manter consistência absoluta na 1ª pessoa do singular em todas as ações do roteiro.
- É PROIBIDO inventar manobras, condutas, passos ou justificativas que não estejam descritos nos documentos fornecidos. A ancoragem de dados é 100% dependente do material anexado.
- É PROIBIDO o uso de parágrafos longos ou textos em bloco. A estrutura deve ser estritamente modular, escaneável e em tópicos curtos.
- É PROIBIDO repetir a mesma justificativa fisiológica em múltiplos passos. Cada justificativa aparece apenas no primeiro passo que a exige.
- O template do "📋 Script de Registro" deve ser idêntico em todos os blocos — nunca substitua por texto livre.
- **Omissão Dinâmica (Inflexível):** Se a aula não apresentar tópicos irrelevantes para descartar, OMITA completamente a seção "2. O que NÃO priorizar (Baixo Foco OSCE)" e seu respectivo título.

---

**SAÍDA:**
Entregue a resposta exclusivamente no formato Markdown abaixo.

## 1. Foco Principal da Aula Prática

| Manobra / Conceito-Chave | Como o professor enfatizou (Evidência) |
| :--- | :--- |
| [Conceito 1] | [Paráfrase objetiva da evidência de cobrança] |
| [Conceito 2] | [Paráfrase objetiva da evidência de cobrança] |

## 2. O que NÃO priorizar (Baixo Foco OSCE)
* [Tópico 1] — *ignorar completamente* — *Motivo: [paráfrase da fala do professor]*
* [Tópico 2] — *saber que existe, não aprofundar* — *Motivo: [paráfrase da fala]*

### 3. [Nome do Bloco Lógico: Ex - Inspeção Dinâmica]

* **[Subtópico Descritivo]**

  1. [Verbo 1ª Pessoa] [Ação].
  2. Solicito: *"Dona Maria, por favor, [comando]."*
  3. Observo [ação] (justificativa fisiológica extraída da aula).

> 📋 **Script de Registro**
> **Técnica:** [Técnica]
> **Achado:** [Achado]
> **Interpretação:** [Interpretação]

> ⚠ **Pontos Críticos de Banca**
> - [Listar alertas, penalidades ou erros mapeados daquele bloco]

### 4. Encerramento e Comunicação ao Paciente
* **Finalização:**
  1. Informo: *"O exame foi concluído, muito obrigado pela colaboração."*
  2. [Ação de despedida/lavagem de mãos]

> ⚠ **Pontos Críticos de Banca**
> - [Alertas sobre ética/finalização]`;
