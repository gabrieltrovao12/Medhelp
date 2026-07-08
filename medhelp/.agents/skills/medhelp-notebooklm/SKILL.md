---
name: "medhelp-notebooklm"
description: "Fluxo completo de integração com o NotebookLM via MCP. Usar para criar cadernos, gerenciar roteiros de tutoria (PBL), subir referências em PDF e organizar materiais de estudo interativos (Flashcards). Acionar sempre que o usuário pedir para gerar roteiro, consultar tutoria, subir cartas/flashcards ou interagir com cadernos de produto."
---

# Skill: medhelp-notebooklm (Ecossistema NotebookLM)

## 1. Objetivo
Centralizar todas as operações de automação que conectam o repositório Medhelp (e o Google Drive) ao NotebookLM usando o protocolo MCP. Esta skill cobre tanto o fluxo acadêmico (preparação de tutorias PBL baseadas em PDFs de referência) quanto o fluxo de produto (publicação de flashcards interativos para clientes).

## 2. Configurações Ativas (Semestre: 2026.2 - M6)
Sempre utilize estes IDs e caminhos como fonte de verdade:
*   **Referências Tutoria (PDFs):** `/content/drive/MyDrive/Logística - Drive/Tutoria/` (ID: `1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB`)
*   **Flashcards Gerados:** (ID: `1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA`)
*   **Resumos Prontos:** (ID: `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6`)

## 3. Fluxo 1: Tutoria e PBL (Criação de Roteiro)
Este fluxo gera um roteiro respondendo aos objetivos do grupo com base nas fontes autorizadas.

1. **Coleta**: Peça ao usuário os "Objetivos de Aprendizado" e o nome do caso (ex: `Tutoria 5 - Insuficiência Cardíaca`).
2. **Criação**: Via MCP (`notebook_list` para checar; `notebook_create` para criar), crie o caderno.
3. **Upload das Fontes**: Via `notebook_add_drive`, adicione APENAS os PDFs referenciados para aquela tutoria. (Nunca misture assuntos).
4. **Geração (Query)**: Use a ferramenta `notebook_query` com um prompt estruturado OCANES:
   ```
   [O] Responder aos objetivos de aprendizado baseando-se EXCLUSIVAMENTE nas fontes fornecidas.
   [A] 
   1. Para cada objetivo, extraia: Definição, Fisiopatologia e Conduta (se aplicável).
   2. Cite as fontes.
   [N] Se a informação não estiver nas fontes, retorne: 'INFORMAÇÃO_INEXISTENTE nas fontes fornecidas'.
   ```
5. **Entrega**: Apresente a resposta gerada (o roteiro da tutoria ou confirmação dos flashcards) diretamente ao usuário no chat, eliminando saudações desnecessárias. **Não** há necessidade de gerar ou salvar um arquivo `.md` local no Obsidian.

## 4. Fluxo 2: Publicação de Produtos (Flashcards e Resumos)
Este fluxo alimenta cadernos que são entregues aos clientes como "produtos interativos de estudo".

1. **Mapeamento de Disciplinas**: O script Apps Script (`flashcards/Código.js`) usa um dicionário para agrupar matérias (ex: `radiologia` -> `LMF - Radiologia`).
2. **Checagem de Cadernos**: Verifique (via `notebook_list`) se o caderno mestre já existe (ex: `Flashcards M6 - Farmacologia`).
3. **Upload (Add Sources)**: Use `notebook_add_drive` (ou upload local se sincronizado) para subir os arquivos `.md` criados pelo pipeline Medhelp para o respectivo caderno no NotebookLM.
4. **Relatório**: Informe ao usuário quantos cards/resumos foram publicados e se houve alguma rejeição de arquivo.

## 5. Troubleshooting de MCP e Regras de Segurança
*   **Erro de Auth MCP**: Se os comandos do notebooklm-mcp-server retornarem erro de autenticação, rode `npx notebooklm-mcp-server auth` no terminal.
*   **Limites de Caderno**: O NotebookLM tem limites de número de fontes por caderno. Para produtos muito grandes, alerte o usuário sobre o agrupamento de `.md` em arquivos consolidados.
*   **Isolamento de Dados (RAG)**: NUNCA suba PDFs de matérias irrelevantes no caderno de uma tutoria específica para evitar que o LLM (RAG) faça cruzamento de informações cruzadas ou cause alucinações acadêmicas.

## 6. Autocorreção: Execução Alternativa por Scripts Node.js (Fallback)
Se a IDE apresentar erros gRPC ou `Failed to fetch` de comunicação com o daemon MCP local do Antigravity, contorne o problema executando a automação via scripts Node.js em segundo plano:
1. Inicie o servidor MCP (`notebooklm-wrapper.js`) com um processo filho (`spawn` ou `exec`).
2. Transmita mensagens no formato JSON-RPC 2.0 (como `initialize`, `initialized`, `tools/call`) diretamente pelo stdin/stdout do processo.
3. Isso garante que a automação continue 100% funcional mesmo que a interface de chat da IDE esteja com erros de conectividade gRPC locais.
