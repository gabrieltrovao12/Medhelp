---
name: "Orquestrador de Tutoria (Substituto NotebookLM)"
description: "Gera roteiros de tutoria (PBL) e arquivos PDF mesclados via Google Colab. Ativar quando o usuário pedir para gerar roteiro de tutoria, processar objetivos de aprendizado, ou preparar material de PBL."
---

# Skill: Orquestrador de Tutoria (Google Colab)

## Objetivo
Automatizar a geração de roteiros de tutoria (PBL) substituindo o uso falho do NotebookLM e da Célula 7. Esta arquitetura foi migrada para o **Google Colab** em um arquivo unificado de 1-clique para evitar os gargalos e falhas de sincronização do *Overgrive* local.

---

## 1. Caminhos e Configurações Ativas

* **Notebook Colab:** `/home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Automatico.ipynb`
* **Pasta de Referências:** `Logística - Drive/Tutoria/Referências - MEDICINA/`

---

## 2. Protocolo de Execução

Quando o usuário pedir para processar uma nova tutoria, siga EXATAMENTE estes passos:

### FASE 1 — Ação do Agente
1. Peça ao usuário os **Objetivos de Aprendizado** (se não tiver fornecido).
2. Verifique se o usuário já colou a sua `GEMINI_API_KEY` na aba Secrets do Colab, sob o nome `GEMINI_API_KEY`.
3. Instrua o usuário a **abrir o Notebook** `Orquestrador_Automatico.ipynb` no Google Colab.

### FASE 2 — Ação do Usuário
1. O usuário abrirá o Notebook Colab e navegará até a Célula Final: "EXECUÇÃO DA TUTORIA".
2. O usuário deverá colar o texto dos objetivos dentro da variável `OBJETIVOS = """..."""`.
3. O usuário irá alterar (se necessário) o caminho da variável `PASTA_SAIDA`.
4. O usuário clica em **"Run All" (Rodar Tudo)**.

### FASE 3 — Processamento em Nuvem
O próprio Colab irá:
1. Montar o Google Drive nativamente.
2. Instalar as bibliotecas (`google-antigravity`, `reportlab`, `pymupdf`).
3. Baixar os sumários (TOC) dos PDFs reais contidos na pasta de referências.
4. Acionar o LLM Gemini via Antigravity SDK para estruturar as páginas exatas.
5. Gerar os recortes em PDF incluindo **Capas Premium e Separadores**.
6. Salvar tudo diretamente na pasta do Google Drive do usuário (eliminando o problema de sincronização do Overgrive).

## 3. Tratamento de Exceções
- **Erro de Memória / Timeout:** Como estamos rodando na VM do Colab, os limites impostos pelo Google Apps Script (50MB/6min) não se aplicam.
- **Livro Escaneado (Sem Sumário Digital):** O script ignorará arquivos sem sumários válidos (`TOC len: 0`). Para usá-los, o usuário deverá realizar o OCR previamente.
