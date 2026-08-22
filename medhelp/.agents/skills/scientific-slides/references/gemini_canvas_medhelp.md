# Estrutura de Slides - Gemini Canvas (Formato Medhelp)

Este documento define a estrutura arquitetônica, tipográfica e semântica estrita para a geração de slides médicos no Gemini Canvas. O agente **deve** seguir rigorosamente a taxonomia abaixo.

---

## 1. Macroestrutura Obrigatória: Perguntas Norteadoras

A apresentação inteira é organizada em torno de **Perguntas Norteadoras** fornecidas pelo usuário. Cada pergunta norteadora gera um **bloco independente** de slides. A sequência hierárquica é:

```
SLIDE 1 ─── CAPA (tema geral da aula)
│
├── SLIDE 2 ─── SUBCAPA (Pergunta Norteadora 01 – texto completo)
│   ├── Slide 3 ... N ─── Conteúdo respondendo à pergunta 01
│
├── SLIDE N+1 ── SUBCAPA (Pergunta Norteadora 02 – texto completo)
│   ├── Slide N+2 ... M ── Conteúdo respondendo à pergunta 02
│
├── SLIDE M+1 ── SUBCAPA (Pergunta Norteadora 03 – texto completo)
│   ├── ...
│
└── (repete para cada pergunta norteadora fornecida)
```

### Regras da Macroestrutura
1.  **Capa**: Sempre o primeiro slide. Contém o tema geral (ex: "Hepatites Virais").
2.  **Subcapa**: Antes de cada bloco de conteúdo, insira obrigatoriamente um slide de Subcapa contendo **a pergunta norteadora completa, na íntegra, sem cortes**.
3.  **Slides de Conteúdo**: Respondem exaustivamente à pergunta norteadora do bloco. Utilize tantos slides quanto necessário. Mapeie o conteúdo para os **Arquétipos de Slide** descritos na Seção 3.
4.  **Numeração Sequencial**: Todos os slides são numerados sequencialmente (1, 2, 3...), independente do bloco.
5.  **Exaustividade**: O conteúdo dos slides de resposta deve cobrir **todos** os aspectos levantados na pergunta norteadora. Se a pergunta menciona "etiologia, epidemiologia, transmissão, clínica, diagnóstico, tratamento e prevenção", todos devem estar presentes.

---

## 2. Slides Estruturais (Fixos)

### Slide Estrutural: Capa
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF) ou cinza muito claro (#F8FAFC).
*   Elementos Gráficos: Logo do projeto/curso (se aplicável), centralizado no topo.

**2. Hierarquia Tipográfica**
*   H1: Caixa alta, destaque centralizado, cor azul-marinho (#0F172A).
*   H2: Caixa alta, centralizado, logo abaixo do H1, destaque em azul (#2563EB).
*   Corpo: Centralizado, fonte menor, cor cinza-escuro (#334155) (ex: Prof: Lucas Albuquerque).

**3. Conteúdo Textual (Semântico)**
*   TREINAMENTO EM QUESTÕES DE RESIDÊNCIA MÉDICA
*   [MÓDULO / ESPECIALIDADE EM DESTAQUE AMARELO]
*   Prof: [Nome do Professor]

---

### Slide Estrutural: Subcapa (Abertura de Pergunta Norteadora)
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF) ou cinza muito claro (#F8FAFC).
*   Elementos Gráficos: Avatar em pixel art de um médico (centro-direita), fazendo sinal positivo com o polegar.

**2. Hierarquia Tipográfica**
*   H1: Caixa alta, alinhado à esquerda, cor azul (#2563EB) – exibe o número da pergunta (ex: `PERGUNTA NORTEADORA 01`).
*   H2: Alinhado à esquerda, cor cinza-escuro (#334155), fonte menor que H1 – exibe o **texto completo** da pergunta norteadora.

**3. Conteúdo Textual (Semântico)**
*   PERGUNTA NORTEADORA [Nº]
*   [Texto integral da pergunta norteadora, sem abreviações ou cortes]

---

## 3. Arquétipos de Slides de Conteúdo

Use os arquétipos abaixo para mapear o conteúdo que responde a cada pergunta norteadora. O agente deve selecionar o arquétipo mais adequado ao tipo de informação. Um mesmo bloco pode utilizar múltiplos arquétipos diferentes.

---

### Tipo A: Epidemiologia e Fatores de Risco
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Sequência vertical de ícones circulares azul-escuro (#0F172A) com setas direcionais apontando para a direita, separando as seções.

**2. Hierarquia Tipográfica**
*   H1: Caixa alta, topo superior esquerdo, cor azul (#2563EB) (ex: nome da doença/condição).
*   H2: Alinhados no eixo vertical central, cor azul-marinho (#0F172A).
*   Corpo: Estrutura em *bullet points* padrão, cor cinza-escuro (#334155).

**3. Conteúdo Textual (Semântico)**
*   **[Tópico 1 - ex: Epidemiologia]**:
    *   [Ponto 1]
    *   [Ponto 2]
*   **[Tópico 2 - ex: Fatores de risco]**:
    *   [Ponto 1]
    *   [Ponto 2]

---

### Tipo B: Fisiopatologia / Mecanismos / Anatomia Funcional
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Setas direcionais ao centro. Esquemas gráficos (fluxogramas lógicos de caixas e setas, diagramas anatômicos/fisiológicos, esquemas de vias metabólicas).

**2. Hierarquia Tipográfica**
*   H1: Caixa alta, topo superior esquerdo, cor azul (#2563EB).
*   H2: Alinhado no eixo vertical central.
*   Destaques: Tags de influência dispostas visualmente como blocos opositores (ex: Fatores Agressivos vs. Protetores).

**3. Conteúdo Textual (Semântico)**
*   **[Subtema - ex: Via Metabólica / Mecanismo]**:
    *   [Passo 1] -> [Passo 2] -> [Efeito]
*   **[Subtema 2 - ex: Fatores / Componentes]**:
    *   **Grupo A:** [Lista]
    *   **Grupo B:** [Lista]
    *   **Associação Crítica:** [Destaque]

---

### Tipo C: Clínica e Diagnóstico
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Setas direcionais no eixo vertical central.

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Eixo central, empilhados (ex: Clínica, Diagnóstico), cor azul-marinho (#0F172A).
*   Destaques: Tags em caixas ao redor do eixo central para conceitos-chave.

**3. Conteúdo Textual (Semântico)**
*   **[Clínica / Manifestações]**:
    *   [Manifestação 1 e características]
    *   [Manifestação 2 e características]
*   **[Diagnóstico]**:
    *   [Cenário 1]: [Conduta/Exame]
    *   [Cenário 2]: [Conduta/Exame]

---

### Tipo D: Sinais de Alarme / Red Flags / Achados Específicos
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Setas direcionais no eixo vertical. Agrupamento de ícones 3D de alerta (triângulos, sinos, megafones) na metade superior.

**2. Hierarquia Tipográfica**
*   H2: Alinhado na coluna central, cor azul-marinho (#0F172A).
*   Destaques: Caixa alta para ênfases críticas na conduta (ex: SEMPRE BIOPSIAR).

**3. Conteúdo Textual (Semântico)**
*   **[Sinais de Alarme / Red Flags]**:
    *   [Sinal 1]
    *   [Sinal 2]
*   **[Conduta / Achados no Exame]**:
    *   [Achado 1]: [Conduta]
    *   [Achado 2]: [CONDUTA EM CAIXA ALTA]

---

### Tipo E: Tratamento
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Eixo central com setas direcionais.

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Eixo central (Tratamento), cor azul-marinho (#0F172A).
*   Corpo: Estrutura em *bullet points*.

**3. Conteúdo Textual (Semântico)**
*   **[Fármacos / Intervenções]**:
    *   [Classe/Droga]: [Nomes/Doses]
    *   [Duração / Posologia]
*   **[Medidas Comportamentais / Suporte]**:
    *   [Medida 1]
    *   [Medida 2]

---

### Tipo F: Complicações
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF) com áreas contendo ilustrações com borda cinza-claro (#E2E8F0).
*   Elementos Gráficos: Ilustração médica correspondente e diagrama anatômico das intervenções.

**2. Hierarquia Tipográfica**
*   H2: Coluna central, cor azul-marinho (#0F172A).

**3. Conteúdo Textual (Semântico)**
*   **[Complicação 1]**:
    *   [Conduta/Tratamento 1]
    *   [Conduta/Tratamento 2]
*   **[Complicação 2]**:
    *   [Conduta/Tratamento]

---

### Tipo G: Classificações e Tabelas de Risco / Sorologia
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Tabela centralizada sem bordas visíveis pesadas, estrutura em grid simples com linhas cinza-claro (#E2E8F0).

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Topo esquerdo, sob H1, cor azul-marinho (#0F172A).
*   Corpo: Texto tabulado, cor cinza-escuro (#334155).

**3. Conteúdo Textual (Semântico)**
*   [Nome da Tabela/Classificação]:

| Coluna 1 | Coluna 2 | Coluna 3 | Coluna 4 |
| :--- | :--- | :--- | :--- |
| **[Item 1]** | [Dado] | [Dado] | [Dado] |
| **[Item 2]** | [Dado] | [Dado] | [Dado] |

*(Nota Clínica Adicional)*: [Informações complementares pertinentes].

---

### Tipo H: Esquemas Mnemônicos e Acrônimos
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Setas direcionais verticais atuando como divisórias, cor cinza (#94A3B8).

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Centralizado, cor azul-marinho (#0F172A).
*   Corpo: Acrônimos verticais destacados por iniciais em azul (#2563EB), formando mnemônicos.

**3. Conteúdo Textual (Semântico)**
*   **[Esquema / Protocolo 1 - ex: Acrônimo]**:
    *   **[Letra 1]** - [Significado]
    *   **[Letra 2]** - [Significado]
*   **Nota Farmacológica/Clínica:** [Observação importante].

---

### Tipo I: Profilaxia / Prevenção / Vacinação
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Eixo central com setas direcionais e ícones de escudo/proteção, cor azul-marinho (#0F172A).

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Centralizado (Prevenção / Profilaxia), cor azul-marinho (#0F172A).
*   Corpo: *Bullet points*.

**3. Conteúdo Textual (Semântico)**
*   **[Vacinação]**:
    *   [Vacina]: [Esquema / Doses / Indicação]
*   **[Profilaxia Pós-Exposição]**:
    *   [Medida 1]
    *   [Medida 2]
*   **[Notificação Compulsória]**: [Regra/Prazo]

---

### Tipo J: Marcadores Laboratoriais / Perfis Sorológicos
**1. Arquitetura Visual**
*   Fundo: Branco (#FFFFFF).
*   Elementos Gráficos: Tabela e/ou fluxograma de interpretação diagnóstica.

**2. Hierarquia Tipográfica**
*   H1: Topo esquerdo, azul (#2563EB).
*   H2: Subtítulo sob H1, cor azul-marinho (#0F172A).
*   Corpo: Tabela ou *bullet points* com marcadores e interpretação, cor cinza-escuro (#334155).

**3. Conteúdo Textual (Semântico)**
*   **[Marcador 1 (ex: HBsAg)]**: [Significado clínico]
*   **[Marcador 2 (ex: Anti-HBs)]**: [Significado clínico]
*   **Perfis Sorológicos:**

| Perfil | Marcador 1 | Marcador 2 | Marcador 3 | Interpretação |
| :--- | :--- | :--- | :--- | :--- |
| [Perfil 1] | (+) | (-) | (+) | [Diagnóstico] |
| [Perfil 2] | (-) | (+) | (-) | [Diagnóstico] |

---

## 4. Fluxo de Trabalho do Agente

Ao receber um pedido de slides com perguntas norteadoras, o agente deve:

1.  **Identificar o tema geral** → Gerar o Slide de **Capa**.
2.  **Para cada pergunta norteadora** (na ordem fornecida pelo usuário):
    a.  Gerar um Slide de **Subcapa** com o número e o texto completo da pergunta.
    b.  Analisar a pergunta e decompô-la nos subtemas implícitos.
    c.  Para cada subtema, selecionar o **Arquétipo de Slide** mais adequado (Tipo A a J) e gerar o(s) slide(s) de conteúdo necessários.
    d.  Garantir **exaustividade**: tudo que a pergunta menciona deve ser respondido.
3.  **Numerar sequencialmente** todos os slides (1, 2, 3...).
4.  **Cabeçalho de Regras (System Prompt para Gemini)**: Inserir OBRIGATORIAMENTE no topo do arquivo gerado o seguinte bloco de texto:
    ```markdown
    <!-- INSTRUÇÕES DE RENDERIZAÇÃO PARA O GEMINI: 
    1. STRICT RULE: NEVER add random images, illustrations, or cliparts to the slides. Use ONLY the text provided.
    2. STRICT RULE: NEVER use emojis in the slides.
    3. STRICT RULE: Maintain the white background. Do NOT change colors unless explicitly specified in the slide architecture.
    -->
    ```
5.  **Saída**: Entregar o Markdown completo estruturado, com o bloco de instruções acima no topo, pronto para renderização no Gemini Canvas.

---

## 5. Exemplo de Saída Estruturada

```markdown
<!-- INSTRUÇÕES DE RENDERIZAÇÃO PARA O GEMINI: 
1. STRICT RULE: NEVER add random images, illustrations, or cliparts to the slides. Use ONLY the text provided.
2. STRICT RULE: NEVER use emojis in the slides.
3. STRICT RULE: Maintain the white background. Do NOT change colors unless explicitly specified in the slide architecture.
-->

### Slide 1: Capa
**1. Arquitetura Visual**: Fundo branco, logo centralizado.
**2. Hierarquia Tipográfica**: H1 azul-marinho, H2 azul, corpo cinza-escuro.
**3. Conteúdo Textual**:
*   TREINAMENTO EM QUESTÕES DE RESIDÊNCIA MÉDICA
*   HEPATITES VIRAIS
*   Prof: Lucas Albuquerque

---

### Slide 2: Subcapa – Pergunta Norteadora 01
**1. Arquitetura Visual**: Fundo branco, avatar pixel art.
**2. Hierarquia Tipográfica**: H1 azul, H2 cinza-escuro.
**3. Conteúdo Textual**:
*   PERGUNTA NORTEADORA 01
*   Como a anatomia, a histologia e a organização funcional do fígado
    e das vias biliares se relacionam com a função sintética hepática
    e com o metabolismo da bilirrubina?

---

### Slide 3: Anatomia Hepática  [Tipo B]
(...)

### Slide 4: Histologia – Lóbulo Hepático  [Tipo B]
(...)

### Slide 5: Metabolismo da Bilirrubina  [Tipo B]
(...)

---

### Slide 6: Subcapa – Pergunta Norteadora 02
**1. Arquitetura Visual**: Fundo branco, avatar pixel art.
**2. Hierarquia Tipográfica**: H1 azul, H2 cinza-escuro.
**3. Conteúdo Textual**:
*   PERGUNTA NORTEADORA 02
*   Como diferenciar os padrões hepatocelular, colestático e misto
    pela interpretação integrada de AST, ALT, fosfatase alcalina...

---

### Slide 7: Padrão Hepatocelular  [Tipo J]
(...)
```
