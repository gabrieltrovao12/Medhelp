---
name: "Tutoria via NotebookLM"
description: "Automatizar a geração de roteiros de tutoria usando o NotebookLM como motor de síntese. Ativar quando o usuário pedir para criar um roteiro de tutoria, gerar prévia de tutoria, subir referências para o NotebookLM, processar objetivos de aprendizado de uma tutoria, ou preparar material de PBL. Também ativar para: criar caderno tutoria, montar roteiro, prévia tutoria, objetivos PBL."
---

# Skill: Tutoria via NotebookLM

## Objetivo
Automatizar o fluxo de preparação de roteiros de tutoria (PBL) integrando o Google Drive (onde ficam as referências em PDF) com o NotebookLM (que sintetiza as respostas) via protocolo MCP, eliminando o trabalho manual de criar cadernos, subir arquivos e copiar respostas.

---

## 1. Fluxo de Trabalho Automatizado (3 Etapas)

```
[ETAPA 1 — NotebookLM (via MCP)]
Criar caderno → Subir PDFs de livros → Enviar Prompt de Roteiro
       │
       ▼ (Roteiro hierárquico com páginas exatas)
[ETAPA 2 — Gemini/Claude (via API ou chat)]
Converter Roteiro → config.json com offsets aplicados
       │
       ▼ (JSON estruturado com cortes por objetivo)
[ETAPA 3 — Google Colab (Roteiro_Tutoria.ipynb)]
Recortar PDFs → Gerar capas + separadores → Salvar em saida/
```

---

## 2. Caminhos e Configurações Ativas

* **Pasta de Referências (Drive):** `/content/drive/MyDrive/Logística - Drive/Tutoria/`
* **ID da Pasta de Tutoria (Apps Script):** `1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB`
* **Semestre Ativo:** `2026.2 - M6`

---

## 3. Nomenclatura dos Cadernos

```
Tutoria [Número] - [Tema Principal]
```

**Exemplos:**
- `Tutoria 5 - Insuficiência Cardíaca`
- `Tutoria 3 - Acidentes por Animais Peçonhentos`

---

## 4. ETAPA 1 — Prompt de Geração do Roteiro (NotebookLM)

Este é o prompt enviado ao NotebookLM via `notebook_query`. Os objetivos de aprendizado devem ser inseridos no placeholder `[INSERIR OBJETIVOS AQUI]` ao final.

```
OBJETIVO: Atuar como um Monitor Acadêmico rigoroso. Sua meta é cruzar uma lista de Objetivos de Aprendizagem com a base de dados fornecida e gerar um Roteiro de Leitura "mastigado", altamente preciso e formatado para envio no WhatsApp da turma.

CONTEXTO: A base de dados é estritamente restrita aos documentos/livros anexados neste ambiente. O público-alvo necessita de direcionamento milimétrico para otimização do tempo de estudo, exigindo previsibilidade visual e correspondência exata com o material de referência.

════════════════════════════════════
SISTEMA DE REFERÊNCIA DE PARTES E PÁGINAS
════════════════════════════════════

Os livros foram divididos em arquivos separados. Cada fonte tem um nome no formato:
[TÍTULO DO LIVRO] – Parte X (ex: "Fundamentos de Oncologia Molecular – Parte 2")

REGRAS DE CITAÇÃO DE PÁGINA (siga nesta ordem):

PASSO 1 — Localize o número impresso no rodapé ou cabeçalho da própria página do documento.
           Este é o número que deve ser citado. Ignore o contador do leitor de PDF.

PASSO 2 — Se o conteúdo relevante ocupar mais de uma página, cite o intervalo completo:
           📄 pp. 246–251 (nunca cite só a primeira página quando o tema continua)

PASSO 3 — Se o número impresso não estiver visível (página sem numeração, como capas
           ou páginas introdutórias), informe obrigatoriamente:
           "pág. [N do leitor] – sem numeração impressa – Parte X"

PASSO 4 — Se o conteúdo estiver em partes diferentes do mesmo livro, cite cada parte
           separadamente com seu respectivo intervalo de páginas:
           📚 Fundamentos de Oncologia Molecular – Parte 1 | 📄 pp. 230–235
           📚 Fundamentos de Oncologia Molecular – Parte 2 | 📄 pp. 10–18

PROIBIDO:
× Citar apenas a página inicial quando o conteúdo se estende por várias páginas
× Usar o número do leitor de PDF quando o número impresso estiver visível
× Citar um intervalo aproximado — os números devem ser exatos conforme o documento

════════════════════════════════════
AÇÕES (execute nesta ordem)
════════════════════════════════════

1. Isole cada Objetivo de Aprendizagem listado ao final.

2. VARREDURA: Para cada objetivo, busque em TODOS os documentos do notebook por palavras-chave e sinônimos do tema. Registre internamente: Fonte + Parte + página inicial e final da seção encontrada.

3. VALIDAÇÃO INTERNA (não exiba): Confirme se o número do capítulo citado bate com o título no índice/sumário do arquivo. A verdade do documento sempre prevalece.

4. AVALIAÇÃO DE ESCOPO (crítica — execute antes de mapear):

   PASSO 1 — Leia o título do capítulo e compare com o objetivo:
   - O título do capítulo nomeia exatamente o tema do objetivo? → fortíssimo sinal de capítulo completo
   - O título do capítulo é mais amplo que o objetivo? → provável afunilamento necessário
   - O título do capítulo é mais restrito que o objetivo? → pode ser necessário combinar seções de capítulos diferentes

   PASSO 2 — Leia o sumário interno do capítulo (lista de seções):
   - A maioria das seções é relevante para o objetivo? → capítulo completo
   - Apenas 1 ou 2 seções de um capítulo longo são relevantes? → afunilar para essas seções
   - Todas as seções são relevantes mas o capítulo é introdutório demais? → capítulo completo + marcar como leitura base

   PASSO 3 — Aplique o critério de proporcionalidade:
   - Se as seções relevantes correspondem a mais de 60% do capítulo → cite o capítulo completo
   - Se as seções relevantes correspondem a menos de 60% → afunile apenas para essas seções
   - Em caso de dúvida, prefira sempre o capítulo completo — é menos prejudicial incluir conteúdo a mais do que deixar lacunas

   PASSO 4 — Registre internamente a decisão antes de mapear:
   "Decidi [capítulo completo / afunilamento] porque [motivo baseado nos passos acima]."
   Só avance para o mapeamento após registrar essa decisão.

5. VERIFICAÇÃO DE DUPLICATAS (execute após mapear, antes de exibir):

   PASSO 1 — Mantenha internamente um registro cumulativo de todas as páginas já citadas
              em objetivos anteriores, no formato: Fonte + Parte + intervalo de páginas.

   PASSO 2 — Para cada página ou intervalo que você está prestes a citar no objetivo atual,
              verifique se ela já apareceu em algum objetivo anterior.

   PASSO 3 — Se houver sobreposição, avalie:
   - A página é essencial e insubstituível para este objetivo? → cite novamente e sinalize:
     ⚠️ [CONTEÚDO COMPARTILHADO com Objetivo XX] pp. XX–XX
   - Existe outra seção do documento que cobre o mesmo tema sem repetição? → cite essa seção alternativa no lugar.
   - A sobreposição é marginal (1 página em intervalo longo)? → cite normalmente, sem sinalizar.

   PASSO 4 — Nunca omita conteúdo essencial para evitar duplicata.
              A sinalização existe para informar, não para censurar o roteiro.

6. MAPEAMENTO HIERÁRQUICO: Extraia:
   📚 Nível 1 → Fonte: [Nome do Livro – Parte X] | Capítulo X: [Título]
   📂 Nível 2 → Seção Principal | 📄 Páginas: XX–XX
   ↳ Nível 3 → Subtítulo | 📄 p. XX (somente se o escopo for menor que o capítulo inteiro)
   · Nível 4 → Termos em negrito / itens de listas numeradas essenciais (somente se o escopo for menor que o capítulo inteiro)

════════════════════════════════════
NORMAS ABSOLUTAS
════════════════════════════════════
* PROIBIDO usar conhecimento externo para preencher lacunas.
* Se não houver cobertura no notebook para um objetivo: retorne exatamente → ⚠️ [SEM COBERTURA] Pesquisar fonte externa.
* Copie títulos e subtítulos EXATAMENTE como no documento.
* ZERO parágrafos explicativos na saída. Apenas hierarquia visual.
* Negrito apenas em títulos. Emojis apenas nos marcadores abaixo.
* Quando o capítulo inteiro for citado, os Níveis 3 e 4 são OMITIDOS — não liste subtópicos dentro de um capítulo completo.
* A sinalização ⚠️ [CONTEÚDO COMPARTILHADO] aparece sempre INLINE, na mesma linha da citação, nunca em parágrafo separado.

════════════════════════════════════
FORMATO DE SAÍDA (por objetivo)
════════════════════════════════════
🎯 OBJETIVO: [Nome do objetivo]

📚 [Nome do Livro – Parte X] | Cap. X: [Título do Capítulo]
📂 [Título da Seção ou "Capítulo completo"] | 📄 pp. XX–XX ⚠️ [CONTEÚDO COMPARTILHADO com Objetivo XX]
↳ [Subtítulo] | 📄 p. XX        ← omitir se capítulo completo
· [Termo essencial]              ← omitir se capítulo completo

════════════════════════════════════
OBJETIVOS DE APRENDIZAGEM
════════════════════════════════════
[INSERIR OBJETIVOS AQUI]
```

---

## 5. ETAPA 2 — Prompt de Conversão para config.json (Gemini/Claude)

Após receber o roteiro do NotebookLM, este prompt é usado para converter o roteiro em JSON estruturado para o Colab. Os offsets dos livros e o roteiro devem ser inseridos nos placeholders correspondentes.

```
Você vai converter um roteiro de leitura acadêmico para JSON pronto para uso no Google Colab.

ARQUIVOS DISPONÍVEIS NO DRIVE E SEUS OFFSETS:
[INSERIR TABELA DE OFFSETS AQUI]

════════════════════════════════════
REGRA DE FUSÃO DE OBJETIVOS
════════════════════════════════════

Antes de gerar o JSON, analise todos os objetivos em conjunto e verifique se há cortes do mesmo capítulo/arquivo distribuídos em objetivos diferentes.

PASSO 1 — Para cada par de objetivos, verifique:
- Os cortes pertencem ao mesmo capítulo do mesmo arquivo?
- Os temas são complementares (ex: etiologia em um, tratamento em outro)?
Se sim, marque esses objetivos para fusão.

PASSO 2 — Ao fundir, agrupe os cortes por CAPÍTULO (que representa a doença ou tema):
- Identifique todos os capítulos presentes no conjunto fundido
- Para cada capítulo, reúna TODOS os cortes daquele capítulo
- Ordene os cortes dentro de cada capítulo: conceito → mecanismo → clínica
- Só então passe para o próximo capítulo

PASSO 3 — Para ordenar os capítulos entre si, use a sequência didática do conjunto:
- Qual capítulo é mais introdutório ou conceitual? → vem primeiro
- Qual capítulo é mais específico ou clínico? → vem depois
- Se forem equivalentes, mantenha a ordem do roteiro original

PASSO 4 — Adicione o campo "fusao" como lista com os títulos completos de cada objetivo fundido:
  "fusao": [
    "Obj. 01 — Título completo do primeiro objetivo exatamente como foi enunciado",
    "Obj. 03 — Título completo do terceiro objetivo exatamente como foi enunciado"
  ]
  NUNCA resuma ou truncue os títulos — copie integralmente.

PASSO 5 — Se os objetivos forem de capítulos ou arquivos completamente diferentes
e sem relação temática direta, mantenha separados mesmo que os temas sejam próximos.

════════════════════════════════════
REGRA DE PÁGINAS COMPARTILHADAS
════════════════════════════════════

Antes de gerar o JSON, registre internamente todas as páginas já alocadas por arquivo:
{ "arquivo": "paginas já usadas" }

Para cada novo corte, verifique se alguma página já foi alocada em outro objetivo (já fundido ou não).

Se houver sobreposição:
- REMOVA as páginas duplicadas do corte atual
- Se o corte ficar vazio após remoção, elimine-o completamente
- NUNCA repita a mesma página do mesmo arquivo em dois objetivos diferentes

════════════════════════════════════
LÓGICA DE ORDENAÇÃO DOS CORTES
════════════════════════════════════

Para cada objetivo, ordene os cortes dentro de "cortes" seguindo esta sequência didática:
1. Conceito base / definição do tema
2. Mecanismo / fisiopatologia / processo
3. Aplicação clínica / consequências / diagnóstico / tratamento

Se dois cortes forem do mesmo nível didático, priorize o livro mais introdutório.
Se não for possível determinar o nível didático, mantenha a ordem do roteiro.

════════════════════════════════════
REGRAS DE CAMPOS
════════════════════════════════════

* "objetivo" → número com dois dígitos ("01", "02"...)
* "titulo" → texto do objetivo sem o número. Se houve fusão, crie um título unificado
* "fusao" → lista de strings, uma por objetivo fundido, no formato "Obj. XX — título completo exatamente como enunciado". Inclua apenas se dois ou mais objetivos foram fundidos
* "ordem_motivo" → inclua apenas se a ordenação não for óbvia
* "arquivo" → use exatamente o nome do arquivo conforme tabela acima
* "capitulo" → copie exatamente como está no roteiro
* "secao" → subtítulo ou seção citada no roteiro. Se o roteiro citar o capítulo completo, deixe ""
* "nivel" → classifique cada corte como "conceito", "mecanismo" ou "clinica"
* "paginas" → siga exatamente estes passos:

   PASSO 1 — Identifique o arquivo e localize o offset na tabela acima
   PASSO 2 — Expanda o intervalo do roteiro para lista completa ANTES de aplicar offset
              Ex: pp. 246–251 → [246, 247, 248, 249, 250, 251]
   PASSO 3 — Some o offset a CADA número individualmente
   PASSO 4 — Verifique se todos os resultantes são ≥ 1
              Se algum for ≤ 0, coloque "VERIFICAR_OFFSET" no campo paginas
   PASSO 5 — O campo "paginas" recebe APENAS os números já convertidos

* Se um objetivo tiver ⚠️ SEM COBERTURA, ignore-o no JSON
* Retorne APENAS o JSON, sem explicações, sem markdown, sem texto antes ou depois

════════════════════════════════════
ESTRUTURA OBRIGATÓRIA
════════════════════════════════════

[
  {
    "objetivo": "01",
    "titulo": "Título unificado se houve fusão, ou título original",
    "fusao": [
      "Obj. 01 — Título completo do primeiro objetivo",
      "Obj. 03 — Título completo do terceiro objetivo"
    ],
    "ordem_motivo": "Conceito base antes do mecanismo",
    "cortes": [
      {
        "arquivo": "Parte_1_Saito.pdf",
        "capitulo": "Cap. 13: Invasão Tumoral e Metástase",
        "secao": "Processo Metastático",
        "nivel": "conceito",
        "paginas": [261, 262, 263]
      }
    ]
  }
]

════════════════════════════════════
ROTEIRO PARA CONVERTER
════════════════════════════════════
[COLE O ROTEIRO AQUI]
```

---

## 6. Protocolo de Execução

### FASE 1 — Coleta de Informações
1. **Nome da Tutoria:** Ex: `Tutoria 5 - Insuficiência Cardíaca`
2. **Objetivos de Aprendizado:** Lista numerada dos objetivos.
3. **Referências:** Confirmar quais PDFs da pasta de Tutoria devem ser usados.

### FASE 2 — Criação do Caderno e Upload (MCP)
1. Usar `notebook_create` para criar o caderno com o nome da tutoria.
2. Usar `notebook_add_drive` para subir cada PDF de referência.
3. Aguardar indexação das fontes pelo NotebookLM.

### FASE 3 — Geração do Roteiro (MCP)
1. Inserir os objetivos no placeholder `[INSERIR OBJETIVOS AQUI]` do Prompt da Seção 4.
2. Enviar via `notebook_query`.
3. Receber e salvar o roteiro como `.md`.

### FASE 4 — Conversão para config.json
1. Usar o Prompt da Seção 5 com o roteiro gerado e a tabela de offsets.
2. Enviar ao Gemini/Claude para conversão.
3. Salvar o `config.json` resultante para uso no Colab.

### FASE 5 — Entrega
1. Informar ao usuário que o roteiro e o `config.json` estão prontos.
2. O usuário cola o `config.json` na Célula 4 do `Roteiro_Tutoria.ipynb` no Colab.

---

## 7. Regras de Segurança

* **NUNCA** inventar respostas para objetivos sem cobertura. Manter `⚠️ [SEM COBERTURA]`.
* **NUNCA** misturar fontes de cadernos diferentes. Cada tutoria tem seu próprio caderno isolado.
* **SEMPRE** confirmar com o usuário a lista de PDFs antes de fazer o upload.
* **SEMPRE** verificar se a autenticação do MCP está ativa antes de iniciar.
