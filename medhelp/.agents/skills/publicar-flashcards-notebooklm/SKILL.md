---
name: "Publicar Flashcards no NotebookLM"
description: "Automatizar o upload de arquivos .md de flashcards gerados pelo Medhelp para cadernos do NotebookLM via MCP, criando uma experiência interativa de estudo para clientes. Ativar para: publicar flashcards, subir cards, interagir com MCP do NotebookLM, resolver erros de conexão gRPC, e organizar cadernos de produto."
---

# Skill: Publicar Flashcards no NotebookLM

## 1. Objetivo
Automatizar o processo de upload de arquivos `.md` de flashcards para cadernos dedicados no NotebookLM via MCP. Essa skill garante que os flashcards sejam disponibilizados aos clientes como um produto interativo **sem sofrer alterações criativas** pelo modelo do Google, garantindo fidelidade clínica.

## 2. A Regra de Ouro: Caderno Único por Disciplina
Para manter a organização do material dos clientes, **cada disciplina deve ter apenas um caderno** que acumulará todas as aulas ao longo do semestre.

- **Por quê?** Se criarmos um caderno por aula, o cliente terá dezenas de links separados. Concentrar fontes (arquivos .md) em um único caderno permite que o cliente consulte todo o escopo de uma matéria de uma vez.
- **Padrão de Nome:** `Flashcards M6 - [Nome da Disciplina]` (ex: `Flashcards M6 - Farmacologia`, `Flashcards M6 - LMF - Radiologia`).
- **Comportamento:** Sempre use `notebook_list` para buscar o caderno antes de tentar criar um novo com `notebook_create`.

## 3. O Fluxo de Execução (via MCP)
1. Listar os `.md` gerados na pasta do Drive (ID: `1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA`).
2. Mapear o nome do arquivo para a Disciplina (ex: `radiologia` -> `LMF - Radiologia`).
3. Checar/Criar o caderno e usar `notebook_add_drive` para subir o `.md` correspondente.
4. Entregar o Link e o **Prompt Anti-Alucinação** ao usuário no chat.

## 4. Prompt Anti-Alucinação OCANES V3 (Instruções Personalizadas do Caderno)
A IA do NotebookLM tende a resumir itens e injetar notação matemática LaTeX (`$`, `\text{}`) em unidades clínicas, além de aglutinar listas em parágrafo único. Cole o bloco abaixo nas **Instruções Personalizadas** (ou Personalizar Cartões Didáticos) do NotebookLM.

```text
[O] - OBJETIVO:
Transcrever determinística e integralmente todos os pares de pergunta/resposta dos arquivos .md para os Cartões Didáticos do NotebookLM. No verso de cada cartão, cada item técnico deve ser impresso em uma linha separada, com pontuação médica literal e texto puro, sem aglutinação em linha única e com proibição absoluta de formatação matemática LaTeX.

[C] - CONTEXTO:
Arquivos Markdown (.md) de medicina contendo flashcards com perguntas terminadas em "?" e respostas em tópicos ou parágrafos.
Os cartões contêm medidas clínicas (ex: > 3 cm, > 1 cm, > 4 mm), anatomia e critérios diagnósticos.
O verso do cartão no NotebookLM exibe texto puro. Não há suporte a Markdown ou LaTeX.

[A] - AÇÕES:
1. Mapeie cada par pergunta/resposta do arquivo fonte, mantendo a contagem exata e a ordem original.
2. FRENTE: Transcreva a pergunta completa, removendo asteriscos (*) e crases (`).
3. VERSO - SEPARAÇÃO DE LINHAS (REGRA MANDATÓRIA):
   a. Para respostas compostas por múltiplos itens, critérios, limites anatômicos ou tópicos:
      - Insira uma quebra de linha (Enter) entre cada item.
      - Inicie cada item com um marcador de lista em hífen seguido de espaço ("- ").
      - NUNCA aglutine múltiplos itens na mesma linha.
   b. Para respostas conceituais em texto contínuo de parágrafo único, transcreva o parágrafo diretamente.
4. VERSO - HIGIENIZAÇÃO DE TEXTO E UNIDADES:
   a. OPERADORES E MEDIDAS: Ao transcrever valores numéricos com comparadores (> ou <) e unidades de medida (cm, mm, mg), escreva SEMPRE em texto puro padrão com espaço: "> 3 cm", "> 1 cm", "> 4 mm".
   b. REMOÇÃO DE MARKDOWN: Remova todos os asteriscos (**) e crases (`), preservando a grafia e a caixa natural das palavras (letras maiúsculas e minúsculas originais; não altere para caixa alta).
   c. SETAS: Converta "->" para o caractere "→".
5. Não omita nenhum cartão e não resuma o conteúdo técnico.

[N] - NORMAS (GUARDRAILS NEGATIVOS):
1. PROIBIÇÃO ABSOLUTA DE LATEX:
   - NUNCA utilize o caractere de cifrão ($).
   - NUNCA utilize barras invertidas (\) ou comandos como \text{}, \mathrm{}, \ge, \le.
   - NUNCA escreva "$ > 3 \text{ cm} $" ou "$ > 4 \text{ mm} $". Escreva exclusivamente: "> 3 cm" e "> 4 mm".
2. PROIBIÇÃO DE LINHA CONTÍNUA / AGLUTINAÇÃO:
   - É terminantemente PROIBIDO juntar múltiplos itens de lista numa única linha contínua separada apenas por espaços.
   - Se houver 5 tópicos na resposta, o verso DEVE conter 5 linhas separadas iniciadas por "- ".
3. PROIBIÇÃO DE CAIXA ALTA ARTIFICIAL:
   - PROIBIDO converter termos para CAIXA ALTA (ALL CAPS). Mantenha a capitalização gramatical padrão do texto fonte.
4. PROIBIÇÃO DE FORMATAÇÃO MARKDOWN CRUA:
   - PROIBIDO deixar asteriscos (**) ou crases (`) visíveis no texto do cartão.
5. CONTENÇÃO CLÍNICA:
   - PROIBIDO parafrasear, resumir, abreviar ou inventar critérios médicos. Transcrição 100% fiel à verdade terrestre da fonte.

[E] - EXEMPLOS:

Exemplo 1 (Critérios com operadores e medidas):
Frente:
Quais as indicações de colecistectomia profilática na colelitíase assintomática?

Verso Correto:
- Cálculos > 3 cm
- Pólipos associados > 1 cm
- Vesícula em porcelana (alto risco de câncer)
- Anomalias congênitas da vesícula
- Anemia hemolítica crônica

Verso Proibido (FALHA GRAVE):
❌ Cálculos $ > 3 \text{ cm} $ Pólipos associados $ > 1 \text{ cm} $ Vesícula em porcelana (alto risco de câncer) Anomalias congênitas da vesícula Anemia hemolítica crônica

---

Exemplo 2 (Achados ultrassonográficos com operadores e medidas):
Frente:
Quais os achados ultrassonográficos da colecistite aguda?

Verso Correto:
- Espessamento da parede da vesícula > 4 mm
- Líquido pericolecístico
- Sinal de Murphy ultrassonográfico
- Distensão da vesícula (hidropsia)

Verso Proibido (FALHA GRAVE):
❌ Espessamento da parede da vesícula $ > 4 \text{ mm} $ Líquido pericolecístico Sinal de Murphy ultrassonográfico Distensão da vesícula (hidropsia)

---

Exemplo 3 (Limites anatômicos):
Frente:
Quais são os limites anatômicos do Trígono de Calot e qual estrutura passa em seu interior?

Verso Correto:
- Superior: Borda inferior do fígado
- Medial: Ducto hepático comum
- Lateral: Ducto cístico
- Conteúdo: Artéria cística

Verso Proibido (FALHA GRAVE):
❌ Superior: Borda inferior do fígado Medial: Ducto hepático comum Lateral: Ducto cístico Conteúdo: Artéria cística

[S] - SAÍDA:
Gerar os flashcards diretamente no formato de Cartões Didáticos (Frente e Verso) do NotebookLM, sem textos introdutórios, saudações ou explicações.
```

## 5. Resiliência: Troubleshooting e Fallback Node.js
Se a automação MCP falhar, atue para recuperar o sistema:

- **Erro de Autenticação MCP:** Se o `notebooklm-mcp-server` reclamar de Auth, diga ao usuário para rodar `npx notebooklm-mcp-server auth` no terminal.
- **Erros gRPC / "Failed to fetch":** Se a IDE perder a conexão com o daemon MCP local do Antigravity, **não desista da tarefa**. Contorne o problema invocando o servidor MCP via script Node.js nativo:
  1. Inicie o wrapper (`notebooklm-wrapper.js`) com um processo filho (`spawn` ou `exec`).
  2. Transmita mensagens no padrão JSON-RPC 2.0 (`initialize`, `tools/call`) via `stdin/stdout`.
  3. Isso ignora o defeito da IDE e garante que o upload dos flashcards aconteça.
