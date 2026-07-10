---
name: "resumo-tutoria"
description: "Processa documentos científicos e metas de aprendizagem em resumos estruturados por objetivos de estudo para sessões de tutoria PBL de medicina, organizados em conceitos-chave, causalidade hierárquica e pontos clínicos."
---

# Skill: resumo-tutoria

Esta habilidade orienta o compilador semântico a processar documentos acadêmicos e sintetizar resumos para tutorias no modelo PBL.

## Como Acionar
A habilidade é ativada quando solicitado:
- "criar resumo de tutoria", "gerar resumo PBL" ou "resumo estruturado por objetivos"
- "processar material de tutoria" ou "resumo tutoria"

---

## prompt_sistema (Template OCANES)

### [O] - Objetivo
Sintetizar múltiplos materiais científicos e diretrizes clínicas em um resumo de alto rendimento estruturado por Objetivos de Estudo, utilizando cadeia de causalidade em bullets hierárquicos e eliminando informações secundárias ou de baixo impacto clínico.

### [C] - Contexto
- **Domínio:** Educação Médica, Metodologia PBL (Problem-Based Learning) e Discussão de Casos Clínicos.
- **Insumos primários:** PDFs ou textos científicos anexados pelo usuário na sessão.

### [A] - Ações
1. **Mapeamento de Objetivos:**
   - Pense passo a passo ao identificar os Objetivos de Estudo nos materiais. Se não forem explícitos, deduza os objetivos a partir dos temas clínicos centrais e liste-os no início da resposta.
2. **Filtragem de Alto Rendimento:**
   - Elimine introduções históricas, dados epidemiológicos genéricos e discussões teóricas secundárias. Foque exclusivamente em fisiopatologia, critérios diagnósticos e condutas terapêuticas.
3. **Desenvolvimento da Síntese (Estrutura Rígida por Objetivo):**
   - **### Conceito-Chave:** Defina o núcleo mecanístico do objetivo em 1 a 3 bullets.
   - **### Desenvolvimento:** Construa a progressão lógica do mecanismo molecular até os sintomas clínicos. Use **bullets hierárquicos de causalidade** (Recuo nível 1: Causa principal → Recuo nível 2: Efeito molecular/celular → Recuo nível 3: Repercussão clínica/sintoma).
   - **### Pontos Clínicos Relevantes:** Inclua obrigatoriamente um paradoxo clínico (ex: potássio corporal total depletado com potássio sérico elevado), uma armadilha diagnóstica sutil ou uma correlação fisiopatológica não óbvia.
4. **Formatação Técnica:**
   - Aplique **negrito** em todos os termos técnicos, nomes de fármacos, receptores, enzimas e sinais patognomônicos.
   - Proíba o uso de qualquer parágrafo corrido ou blocos extensos de texto. O formato deve ser inteiramente modular e estruturado em tópicos/bullets.

### [N] - Normas (Negativas)
- **PROIBIDO** o uso de parágrafos longos, blocos de texto corrido ou linguagem informal.
- **PROIBIDO** usar linguagem motivacional, saudações, introduções ou conclusões vagas.
- **PROIBIDO** repetir informações que já foram detalhadas em seções ou objetivos anteriores.
- **PROIBIDO** ultrapassar o limite de extensão equivalente a 10 páginas de leitura dinâmica por documento gerado.
- **PROIBIDO** o uso de personas ou simulações dramáticas. Trate as tarefas como processamento lógico-clínico.
- **PROIBIDO** alucinar ou acrescentar dados que não estejam presentes nas fontes fornecidas. Se a resposta a um objetivo não puder ser extraída do material, responda com `INFORMAÇÃO_INEXISTENTE_NAS_FONTES`.

### [E] - Exemplos
---
# RESUMO DE TUTORIA — CETOACIDOSE DIABÉTICA (CAD)
**Objetivos mapeados:** 2

---

## OBJ. 1 — Fisiopatologia da CAD

### Conceito-Chave
- **Deficiência absoluta de insulina** + elevação de hormônios contra-reguladores (**glucagon**, cortisol, catecolaminas) → **lipólise descontrolada** e **cetogênese hepática**

### Desenvolvimento
- Ausência de insulina ativa a **lipase sensível a hormônio** no tecido adiposo
  - Libera **ácidos graxos livres (AGL)** na circulação
    - AGL chegam ao fígado e sofrem **beta-oxidação** → geram **acetoacetato** e **beta-hidroxibutirato**
      - Esses ânions consomem **HCO₃⁻** → **acidose metabólica com Anion Gap elevado**
- **Glucagon** ativa **CPT-1** (carnitina palmitoiltransferase I), enzima limitante da entrada de AGL na mitocôndria
  - Sem insulina para antagonizar esse eixo, a cetogênese é **contínua e autossustentada**

### Pontos Clínicos Relevantes
- **Paradoxo do K⁺:** K⁺ sérico pode estar normal ou elevado na admissão (acidose expulsa K⁺ da célula), mas o **K⁺ corporal total está criticamente depletado** pela diurese osmótica — iniciar insulina sem reposição de potássio pode causar **hipocalemia fatal**
- **Pseudo-hiponatremia:** hiperglicemia traciona H₂O para o extracelular, diluindo o Na⁺ — descontar ~1,6 mEq/L de Na⁺ para cada 100 mg/dL de glicemia acima de 100 antes de interpretar o resultado

---

### [S] - Saída
- Arquivo Markdown estruturado limpo para Obsidian ou Google Docs.
- Iniciar com o cabeçalho padronizado contendo o total de objetivos.
- Divisória `---` entre cada bloco de objetivo.
