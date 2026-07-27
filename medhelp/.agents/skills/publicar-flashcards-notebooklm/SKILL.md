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

## 4. Prompt Anti-Alucinação (Entrega para o Usuário)
A IA do NotebookLM tenta naturalmente resumir dados. Isso é perigoso para a área médica. Após concluir o upload, você deve instruir o usuário a colar OBRIGATORIAMENTE o texto abaixo nas **Instruções Personalizadas** do caderno, para forçar o Google a exibir as perguntas e respostas com fidelidade absoluta:

```text
Tarefa: Converter o documento PDF anexado em flashcards interativos, renderizando cada par pergunta/resposta com fidelidade absoluta ao texto fonte.

Regras de extração:
- Frente do cartão: Extraia a pergunta original, palavra por palavra, sem alterações
- Verso do cartão: Extraia a resposta original, mantendo toda a terminologia, formatação e estrutura de listas presentes no documento

Regra de bloqueio — cumprimento obrigatório:
- Zero geração criativa: é estritamente proibido resumir, parafrasear, fragmentar, reordenar ou alterar qualquer conceito clínico
- Cobertura total: todos os pares pergunta/resposta do documento devem ser convertidos, sem omissões
- Fidelidade terminológica: nomes de fármacos, valores numéricos, classificações e condutas devem ser transcritos exatamente como aparecem no documento fonte
- Sem preâmbulo: a saída deve começar diretamente no primeiro flashcard, sem introdução ou comentário

Você receberá um ou mais arquivos .md contendo flashcards no formato pergunta/resposta. Sua tarefa é única e não admite desvio: transcrever cada par exatamente como está escrito, sem resumir, reescrever, combinar ou omitir nenhum cartão.

Para cada flashcard encontrado nos arquivos, gere:

Frente: [pergunta copiada palavra por palavra, com pontuação e formatação originais]
Verso: [resposta copiada palavra por palavra, com toda a terminologia, valores e listas originais]
```

## 5. Resiliência: Troubleshooting e Fallback Node.js
Se a automação MCP falhar, atue para recuperar o sistema:

- **Erro de Autenticação MCP:** Se o `notebooklm-mcp-server` reclamar de Auth, diga ao usuário para rodar `npx notebooklm-mcp-server auth` no terminal.
- **Erros gRPC / "Failed to fetch":** Se a IDE perder a conexão com o daemon MCP local do Antigravity, **não desista da tarefa**. Contorne o problema invocando o servidor MCP via script Node.js nativo:
  1. Inicie o wrapper (`notebooklm-wrapper.js`) com um processo filho (`spawn` ou `exec`).
  2. Transmita mensagens no padrão JSON-RPC 2.0 (`initialize`, `tools/call`) via `stdin/stdout`.
  3. Isso ignora o defeito da IDE e garante que o upload dos flashcards aconteça.
