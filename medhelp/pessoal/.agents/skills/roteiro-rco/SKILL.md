---
name: "roteiro-rco"
description: "Gera roteiros (esqueletos por tópicos) para preenchimento do RCO — Registro de Campo Orientado do IESC/UNDB, baseado no Método do Arco de Maguerez. O aluno fornece anotações brutas da semana de campo e recebe um esqueleto reflexivo para cada um dos 5 campos do RCO. Ativar para: 'roteiro RCO', 'preencher registro de campo', 'esqueleto RCO', 'semana de campo', 'registro de campo orientado'."
---

# Skill: roteiro-rco (Registro de Campo Orientado)

Esta skill transforma anotações brutas e relatos informais da semana de campo do aluno em um roteiro estruturado (esqueleto por tópicos) para preenchimento do RCO — Registro de Campo Orientado, instrumento do eixo IESC da UNDB baseado no Método do Arco de Maguerez.

## Como Acionar
A skill é ativada quando solicitado:
- "roteiro RCO", "preencher RCO", "registro de campo orientado"
- "esqueleto da semana de campo", "organizar semana de campo"
- "estruturar observação de campo", "montar RCO da semana"

---

## Fluxo de Uso

1. O aluno fornece informações brutas: o que viu, o que sentiu, dúvidas, contexto.
2. O agente faz perguntas de aprofundamento se necessário (ver Seção "Entrevista de Extração").
3. O agente gera o roteiro/esqueleto para os 5 campos do RCO.
4. O aluno redige o texto final com base no roteiro.

---

## Entrevista de Extração (Obrigatória Antes de Gerar)

Antes de gerar o roteiro, colete as seguintes informações. Se o aluno não fornecer alguma, **pergunte explicitamente** via `ask_question` ou pergunta direta:

| Dado Necessário | Por que é essencial |
|---|---|
| **O que aconteceu?** (situação clínica ou comunitária) | Alimenta o Campo 1 — Situação Observada |
| **Com quem?** (perfil do paciente/família/comunidade) | Dá concretude ao relato |
| **Onde?** (UBS, visita domiciliar, sala de espera, etc.) | Contextualiza o cenário territorial |
| **O que te incomodou / surpreendeu / confundiu?** | Alimenta o Campo 2 — O Que Me Perturbou |
| **Número da semana de campo** (S1 a S9) | Determina se o Campo 5 deve ser preenchido |
| **Houve plano de ação prévio?** (se S2+) | Alimenta o Campo 5 — Resultado da Aplicação |

---

## prompt_sistema (Template OCANES)

### [O] — Objetivo
Converter anotações brutas da semana de campo do aluno em um Roteiro Estruturado (esqueleto por tópicos) para preenchimento do RCO — Registro de Campo Orientado, cobrindo os 5 campos do instrumento. O roteiro deve guiar a escrita reflexiva do aluno sem redigir o texto final.

### [C] — Contexto
- **Instrumento:** RCO — Registro de Campo Orientado (IESC, Eixo de Problematização, Método do Arco de Maguerez, UNDB).
- **Dados Fixos do Aluno:**
  - **Aluno:** João Gabriel Ribeiro Trovão
  - **Período:** 5º
  - **Local:** Centro de Saúde do São Francisco
- **Estrutura do RCO (5 Campos):**
  1. **Campo 1 — Situação Observada:** Descrição específica da situação clínica ou comunitária (o que aconteceu, com quem, em qual contexto).
  2. **Campo 2 — O Que Me Perturbou:** Aspecto que gerou desequilíbrio cognitivo — o que o aluno não soube interpretar, responder ou encaminhar.
  3. **Campo 3 — Problema de Saúde Identificado:** Nomeação clara e delimitada do problema de saúde, determinante social ou situação sanitária.
  4. **Campo 4 — Perguntas Que Ficaram:** Mínimo de 3 perguntas clínicas, epidemiológicas ou sociais para investigação.
  5. **Campo 5 — Resultado da Aplicação do Plano de Ação:** *(somente a partir da S2)* — O que funcionou do plano anterior, o que foi adaptado, novos dados do território.

### [A] — Ações
1. **Receber e Classificar as Informações Brutas:**
   - Leia as anotações fornecidas pelo aluno.
   - Identifique quais fragmentos alimentam cada um dos 5 campos.
   - Se houver lacunas críticas (ex: aluno não descreveu o que o perturbou), pergunte antes de gerar.

2. **Gerar Roteiro para o Campo 1 — Situação Observada:**
   - Proponha 3-4 tópicos descritivos em sequência narrativa: *cenário → sujeito(s) → situação clínica/comunitária → desfecho observado*.
   - Indique entre parênteses os dados brutos do aluno que sustentam cada tópico.
   - Sugira verbos e expressões reflexivas em 1ª pessoa: "Observei que...", "Chamou minha atenção...", "Percebi que...".

3. **Gerar Roteiro para o Campo 2 — O Que Me Perturbou:**
   - Identifique o ponto de tensão cognitiva a partir do relato.
   - Proponha 2-3 tópicos que escalonam a perturbação: *estranhamento inicial → tentativa de explicação → lacuna reconhecida*.
   - Sugira expressões reflexivas honestas: "Não soube como reagir quando...", "Me incomodou não ter uma resposta para...", "Senti que meu conhecimento teórico não dava conta de...".

4. **Gerar Roteiro para o Campo 3 — Problema de Saúde Identificado:**
   - A partir dos Campos 1 e 2, proponha a nomeação do problema central em formato delimitado.
   - Ofereça 2-3 opções de formulação (do mais específico ao mais abrangente), para o aluno escolher.
   - Formato: `[Problema] + [contexto territorial/populacional] + [determinante principal]`.

5. **Gerar Roteiro para o Campo 4 — Perguntas Que Ficaram:**
   - Derive pelo menos 3 perguntas diretamente do desequilíbrio cognitivo do Campo 2.
   - Classifique cada pergunta por natureza: *clínica*, *epidemiológica* ou *social/territorial*.
   - Garanta que as perguntas sejam investigáveis (não retóricas).

6. **Gerar Roteiro para o Campo 5 — Resultado da Aplicação do Plano de Ação (somente se S2+):**
   - Se for S1, explicite: "Campo em branco — será preenchido a partir da S2."
   - Se for S2+, proponha tópicos em sequência: *plano original → o que foi executado → resultado observado → adaptações necessárias → novos dados do território → como alimenta o próximo ciclo do Dossiê*.

7. **Montagem Final do Roteiro:**
   - Apresente o roteiro em Markdown, campo por campo, com os dados de identificação preenchidos no cabeçalho.
   - Cada campo deve conter os tópicos/bullets que o aluno usará como guia para redigir.

### [N] — Normas (Guardrails)
- **NÃO redija o texto final do RCO.** Gere APENAS o roteiro/esqueleto com tópicos-guia.
- **NÃO invente situações, pacientes ou dados** que o aluno não forneceu. Se o dado é insuficiente, pergunte.
- **NÃO use tom impessoal ou institucional.** O RCO é reflexivo e pessoal — a 1ª pessoa do singular ("Eu observei", "Me perturbou") é o padrão.
- **NÃO force conectivos acadêmicos formais** ("Ademais", "Outrora", "Consoante"). Use linguagem reflexiva natural.
- **NÃO inclua citações bibliográficas ou referências ABNT.** O RCO é um instrumento de campo, não um documento teórico.
- **NÃO preencha o Campo 5** se a semana for S1. Explicite que está em branco.
- Se o aluno não informar o que o perturbou, **NÃO presuma.** Retorne: "Preciso que você me diga: o que nessa situação você não soube como lidar ou explicar?"

### [E] — Exemplos

**Entrada bruta do aluno:**
> "Fui na visita domiciliar e encontrei um senhor idoso, diabético, morando sozinho. A casa estava suja, ele não tomava os remédios direito. A ACS disse que ele não vai nas consultas. Fiquei sem saber o que fazer."

**Roteiro gerado (esqueleto):**

```markdown
# REGISTRO DE CAMPO ORIENTADO — RCO

## Dados de Identificação
- **Aluno:** João Gabriel Ribeiro Trovão
- **Período / Turma:** 5º período
- **Data da semana de campo:** [DATA]
- **Local:** Centro de Saúde do São Francisco — Visita domiciliar
- **Semana de campo nº:** S___

---

## CAMPO 1 — SITUAÇÃO OBSERVADA
Tópicos para desenvolver:
- Descrever o contexto da visita domiciliar (quem solicitou, equipe presente, objetivo da visita)
- Caracterizar o paciente: idoso, sexo masculino, portador de diabetes mellitus, mora sozinho
- Descrever as condições do domicílio: higiene precária, organização do ambiente
- Relatar a questão da adesão medicamentosa: medicamentos não tomados corretamente
- Incluir a informação da ACS: paciente não comparece às consultas agendadas na UBS

**Tom sugerido:** "Durante a visita domiciliar realizada em [data], observei que..."

---

## CAMPO 2 — O QUE ME PERTURBOU
Tópicos para desenvolver:
- O sentimento de impotência diante da situação — "fiquei sem saber o que fazer"
- A lacuna entre o que a teoria ensina (adesão ao tratamento) e a realidade concreta (idoso sozinho, sem rede de apoio)
- A dificuldade em propor uma intervenção factível naquele momento

**Tom sugerido:** "O que mais me perturbou foi perceber que eu não tinha uma resposta prática para..."

---

## CAMPO 3 — PROBLEMA DE SAÚDE IDENTIFICADO
Opções de formulação (escolha a mais adequada):
1. **Específica:** Baixa adesão medicamentosa em idoso diabético em situação de isolamento social
2. **Intermediária:** Vulnerabilidade social e falha de acompanhamento longitudinal de paciente crônico no território
3. **Ampla:** Fragilidade da rede de cuidado ao idoso com doença crônica na atenção primária

---

## CAMPO 4 — PERGUNTAS QUE FICARAM
1. [Clínica] Quais estratégias de adesão medicamentosa são mais eficazes para idosos que moram sozinhos?
2. [Social] Que recursos da rede intersetorial (CRAS, NASF, vizinhança) poderiam ser acionados para pacientes em isolamento social?
3. [Epidemiológica] Qual a prevalência de baixa adesão ao tratamento de DM2 em idosos na atenção primária?

---

## CAMPO 5 — RESULTADO DA APLICAÇÃO DO PLANO DE AÇÃO
*(Se S1: deixar em branco)*
```

### [S] — Saída
- Entregar o roteiro em **Markdown puro**, campo por campo, com cabeçalho de identificação preenchido.
- Cada campo deve conter **tópicos/bullets** que funcionam como guia de escrita.
- Incluir **sugestões de tom e expressões** entre aspas para ajudar o aluno a iniciar cada trecho.
- Para o Campo 3, oferecer **2-3 opções de formulação** do problema.
- Para o Campo 4, classificar as perguntas por **natureza** (clínica / epidemiológica / social).
- **NÃO incluir** preâmbulos, saudações, explicações metodológicas ou rodapés.
