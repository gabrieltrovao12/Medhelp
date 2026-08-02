# 📂 Dossiê do Negócio: "Kit de Sobrevivência Med" — v4

> **Missão:** Monetizar o estudo de alta performance, vendendo _tempo_ e _segurança_ para estudantes de medicina, utilizando automação via IA e lógica de Active Recall, enquanto otimiza a própria rotina de internato/ambulatório do criador.

---

## 1. O Produto (O Ecossistema)

O produto é um **Ecossistema de Estudo e Produtividade Clínica**. Ele atende a dois propósitos: vender a aprovação no módulo para os alunos (produtos gerados) e otimizar a prática médica do criador (Ambulatório). 

---

### ✂️ Cortes Cirúrgicos e Tutoria PBL (PDF por objetivo)
**Orquestrado pelo Google Colab (Orquestrador Híbrido) + NotebookLM.**
- Roteiros do NotebookLM são convertidos pelo Gemini em instruções de corte.
- PDFs acadêmicos recortados por objetivo de aprendizagem.
- Capa Premium gerada automaticamente contendo: índice de navegação (posição no PDF em azul) e curadoria automática de vídeos do **YouTube** via API.
- Ordenação didática automática: conceito → mecanismo → clínica.

---

### 📄 Resumo OCANES (Markdown → PDF)
**Gerado automaticamente pelo Apps Script via Gemini.** Salvo em `Resumos_Prontos/` como `.md`.
- Foco principal da aula, tabelas comparativas, e cascatas `->`.
- Curadoria do YouTube acoplada ao resumo (`YouTubeCurator.js`).
- Acionado via Webhook (`doPost`) diretamente pelo término da transcrição no Colab.

---

### 🃏 Flashcards (Markdown — Obsidian Spaced Repetition)
**✅ Totalmente Automatizado pelo Apps Script.** Compatível com o plugin Spaced Repetition do Obsidian.
Possui dois motores independentes:
1. **Trigger de Resumos:** Lê os resumos gerados das aulas teóricas.
2. **Trigger de Tutoria:** Lê os PDFs gerados pelo Orquestrador Híbrido, extrai o texto base64, e consolida flashcards de múltiplos PDFs em um único arquivo mestre de Tutoria.

---

### 📝 Questões de Múltipla Escolha
_(Implementação em andamento)_ Objetivo duplo: revisão pré-prova + produto para venda em PDF.

---

### 🗺️ Mapa Mental
A "cola" visual que conecta tudo. Exportado do Obsidian/Canvas como imagem de alta resolução. Produção manual.

---

### 🩺 Prontuário Ambulatório SOAP (Ferramenta Interna)
**✅ Pipeline de Produtividade Clínica (Google Forms → Apps Script → Obsidian).**
- O estudante/médico preenche um Google Form no celular (taquigrafia bruta, siglas).
- O Apps Script (`ambulatorio-soap/Code.js`) aciona o Gemini.
- Converte a taquigrafia em um prontuário SOAP médico formal.
- Realiza **Auditoria de Lacunas**: cruza os checkboxes de exame físico marcados com o que deveria ter sido examinado para a hipótese clínica, sinalizando esquecimentos `[LACUNA EF: ...]`.
- Gera 3 perguntas de Active Recall ao final do caso para solidificação do conhecimento.

---

## 2. Infraestrutura Técnica (Arquitetura Modular)

O monolito antigo foi desmembrado em microsserviços. 

### 2.1 Visão Geral do Pipeline

```
[Áudios/PDFs] → Colab (Transcribe / Orquestradores) → Webhook / Triggers → Apps Script (Módulos) → Drive (Docs / Obsidian)
```

---

### 2.2 Componente 1 — Orquestradores do Colab (Python)
Agora dividido em notebooks especializados:
- **`Transcribe.ipynb`**: Focado unicamente em rodar o modelo Whisper (large-v3) e acionar o Webhook do Apps Script ao finalizar.
- **`Orquestrador_Hibrido.ipynb`**: Motor de Tutoria PBL. Lê texto base do NotebookLM, extrai JSON via Gemini, calcula offsets (`offsets.json`), busca vídeos no YouTube e recorta os PDFs.
- **`Roteiro_Tutoria.ipynb` & `Orquestrador_Automatico.ipynb`**: Notebooks complementares para roteirização avançada.

---

### 2.3 Componente 2 — Apps Script (Módulo Automação Transcrições)
A arquitetura monolítica foi refatorada para MVC-like:
- **`Main.js`**: Controlador. Possui o Webhook (`doPost`) para receber chamadas do Colab.
- **`Prompt.js`**: Engenharia OCANES centralizada.
- **`YouTubeCurator.js`**: Encontra vídeos pertinentes via API do YouTube e acopla ao resumo.
- **`GeminiClient.js` & `DriveManager.js`**: Wrappers para comunicação externa.

---

### 2.4 Componente 3 — Apps Script (Módulo Flashcards)
Totalmente modularizado, lidando com dois funis de entrada:
- **`Trigger_Resumos.js`**: Puxa Markdown de `Resumos_Prontos/` e gera cards.
- **`Trigger_Tutoria.js`**: Lê os recortes em PDF da pasta Tutoria, gera cards e consolida deduplicando atualizações.
- **`SheetsLogger.js`**: Registra toda a auditoria de sucesso, tempo e erro (`ERRO_API`, `SUCESSO`) numa planilha Google Sheets para dashboard de controle.

---

### 2.5 Componente 4 — Apps Script (Módulo Ambulatório SOAP)
Gatilho `onFormSubmit`. Trata formulários do Google Forms para expandir histórias clínicas de enfermaria/ambulatório em formato SOAP, salvando nativamente em Markdown para o Obsidian. Utiliza o modelo Gemini de forma rápida e concisa (`gemini-3.5-flash-lite`).

---

## 3. Estrutura de Pastas (Repositório de Scripts)
```
scripts/
├── apps-script/
│   ├── ambulatorio-soap/         ← SOAP e Lacunas Clínicas
│   ├── automacao-transcricoes/   ← Resumos e YouTube
│   └── medhelp-flashcards/       ← Cards de Resumo e Tutoria
└── colab/
    ├── Orquestrador_Hibrido.ipynb ← PBL e Capas Premium
    ├── Transcribe.ipynb           ← Whisper
    └── pdf-premium/               ← Assets
```

---

## 4. Estratégia e Modelo Financeiro (Barbell Strategy)

|Modalidade|Preço|Público-alvo|Lógica|
|---|---|---|---|
|**Combo do Módulo**|R$ 80,00|O aluno organizado e o ansioso|Garante caixa rápido e fidelidade. Meta: 10–20 alunos = R$ 800–R$ 1.600|
|**Aula Avulsa**|R$ 15,00|O aluno que faltou ou está desesperado|Margem alta por unidade. Resolve dor aguda imediata|
|**Ambulatório (Internato)**|Uso Pessoal|O próprio criador|Retorno sobre tempo. Otimiza o estudo em serviço e evita esquecimentos semiológicos (ferramenta base para um futuro spin-off B2B/Médicos).|

---

## 5. Regras Inegociáveis do Sistema (Protocolo de Sobrevivência)

1. **Webhook Security:** O `doPost` de automação não deve processar arquivos infinitos para não estourar os 6 min de timeout (GAS). Manter trava defensiva de 4.5 minutos.
2. **Exponential Backoff:** Preservado em todos os módulos que tocam no Gemini para segurar `429 Too Many Requests`.
3. **Sem Leitura Cega (OCR abandonado):** Os scripts de flashcards preferem ler `Base64` direto de PDFs ou `Blob.getDataAsString('UTF-8')` de Markdowns, evadindo limites do OCR legado do Drive.
4. **Safety Settings `BLOCK_NONE`:** O Google Cloud bloqueia conteúdo clínico facilmente (sangramento, choque). A API do Gemini deve sempre estar com as travas em `BLOCK_NONE`.
5. **Registro Total:** Todo fim de execução deve registrar o tempo e o estado no `SheetsLogger`.

---

## 6. Status das Implementações

### ✅ Concluído (Geração 4.0)
- Modularização completa do Apps Script.
- Pipeline do Ambulatório SOAP + Lacunas Clínicas operante.
- Webhook (`doPost`) integrado para Acionamento Colab → Apps Script.
- Curadoria do YouTube integrada aos Resumos.
- Flashcards cobrindo tanto aulas teóricas quanto PDFs de tutoria.
- Sistema de deduplicação inteligente nos flashcards.
- Orquestrador Híbrido no Colab com extração via Gemini e offsets automatizados.

### ⏳ Pendente
- Lançamento oficial de "Questões para Venda".
- Dashboard visual (Looker Studio ou AppSheet) consumindo a base do `SheetsLogger.js`.
- Refino da numeração de página no rodapé dos PDFs de corte (`p. 3 de 18`).
- Adicionar marca d'água (`Drive de Apoio`) nos PDFs premium.