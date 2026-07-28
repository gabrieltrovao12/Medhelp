# 📂 Dossiê do Negócio: "Kit de Sobrevivência Med" — v3

> **Missão:** Monetizar o estudo de alta performance, vendendo _tempo_ e _segurança_ para estudantes de medicina, utilizando automação via IA e lógica de Active Recall.

---

## 1. O Produto (O Ecossistema)

Você não vende "resumos", você vende a **aprovação no módulo**. O produto é um **Ecossistema de Estudo** com 5 pilares, sendo 3 deles gerados automaticamente pelo pipeline:

---

### ✂️ Cortes Cirúrgicos (PDF por objetivo)

Mapeados via NotebookLM + gerados automaticamente pelo Google Colab. Cada PDF contém:

- Capa com índice de navegação (posição no PDF em azul + livro + capítulo + seção)
- Separadores visuais entre fontes
- Páginas recortadas dos livros acadêmicos organizadas por objetivo de aprendizagem, na sequência didática: conceito → mecanismo → aplicação clínica

O aluno não perde tempo procurando página; recebe o trecho exato do livro referente a cada objetivo da tutoria.

---

### 📄 Resumo OCANES (Markdown → PDF)

**Gerado automaticamente pelo Apps Script via Gemini 2.5 Flash.** Salvo em `Resumos_Prontos/` como `.md`, contém:

- Foco principal da aula com evidência de cobrança em prova
- O que **não** priorizar
- Resumo teórico com cascatas em setas `->` e tabelas comparativas
- Slides mais importantes com justificativa
- Correlações clínicas (etiologia, farmacologia, semiologia)
- Erros comuns destacados pelo professor
- Atribuição explícita à fala do docente em todo o documento

---

### 🃏 Flashcards (Markdown — Obsidian Spaced Repetition)

**✅ Gerado automaticamente pelo Apps Script via Gemini 2.5 Flash. IMPLEMENTADO.** Salvo em `Flashcards_Prontos/` como `.md`, compatível com o plugin Spaced Repetition do Obsidian.

**Características da implementação:**

- Lê resumos `.md` da pasta `Resumos_Prontos/` (não transcrições brutas)
- Filtra arquivos adicionados/modificados nas últimas N horas (configurável via `HORAS_RECENTES`)
- Detecta a disciplina automaticamente pelo nome do arquivo via dicionário de palavras-chave
- Previne duplicatas: não regenera flashcard se o arquivo já existe na pasta de destino
- Pausa configurável entre chamadas à API (`DELAY_ENTRE_ARQUIVOS_MS`) para evitar rate limits
- Modelo: `gemini-2.5-flash`, endpoint `/v1beta/`, temperatura `0.3`
- Safety settings todos em `BLOCK_NONE` (necessário para conteúdo médico técnico)

**Formato dos flashcards gerados:**

- Separador `?` em linha isolada entre pergunta e resposta
- Respostas em lista com marcadores `-`
- `**Negrito**` para conceitos-chave
- `` `Código` `` para doses e valores numéricos
- `==Highlight==` para alertas e armadilhas de prova
- Setas `->` para processos e cascatas
- Sem bloco YAML; sem introduções ou texto fora dos flashcards

**Exemplo de flashcard gerado:**

```
🩺 Paciente com Febre + Sopro + Nódulos de Osler. Qual a suspeita diagnóstica?
?
- **Endocardite Infecciosa** (critérios de Duke).
- A tríade clássica sugere **embolização séptica**.
- ==Atenção: hemocultura ANTES de iniciar antibiótico.==
```

**Cabeçalho inserido em cada arquivo gerado:**

```markdown
# Flashcards — [nome original sem extensão]

> **Disciplina:** [disciplina detectada]
> **Gerado em:** [data/hora]
> **Fonte:** [nome do arquivo original]

---
```

**Nomenclatura do arquivo gerado:**

```
Radiologia - Radiografia de Torax - Flashcards.md
```

---

### 📝 Questões de Múltipla Escolha (Markdown → PDF para venda)

**Gerado automaticamente pelo Apps Script via Gemini 2.5 Flash.** _(implementação pendente_ ⏳_)_ Salvo em `Questoes_Prontas/` como `.md`. Até 20 questões por aula, 4 alternativas (A/B/C/D), gabarito comentado ao final. Sem questões dissertativas ou V/F. Objetivo duplo: revisão pré-prova + produto para venda em PDF.

---

### 🗺️ Mapa Mental

A "cola" visual que conecta tudo. Exportado do Obsidian/Canvas como imagem de alta resolução. Produção manual — momento de estudo ativo do criador.

---

## 2. Infraestrutura Técnica

### 2.1 Visão Geral do Pipeline

```
Áudio (.m4a) + Slides (.pdf)
        ↓
[Componente 1 — Google Colab]
Transcrição Whisper large-v3 + Extração PDF/OCR
        ↓
.txt estruturado → Google Drive (Transcricoes_Medicina/)
        ↓
[Componente 2 — Google Apps Script — Script de Resumo]
Trigger automático (2x/dia) → Gemini 2.5 Flash
        ↓
Resumos_Prontos/    → Resumo OCANES (.md)
Questoes_Prontas/   → Questões para venda (.md) ⏳
        ↓
Arquivados/  ← .txt e áudios originais arquivados automaticamente

[Componente 3 — Google Apps Script — Script de Flashcards] ✅
Trigger independente → lê Resumos_Prontos/ → Gemini 2.5 Flash
        ↓
Flashcards_Prontos/  → Flashcards Obsidian (.md)
```

---

### 2.2 Componente 1 — Google Colab (Python)

Responsável pela extração bruta do conteúdo. Dividido em 4 células:

|Célula|Função|Editável?|
|---|---|---|
|1|Instalação de dependências|Não (roda uma vez por sessão)|
|2|Monta Drive + importa bibliotecas|Não|
|3|**Configuração do lote**|✅ Sim — única que o usuário edita|
|4|Motor de execução|❌ Nunca editar|

**O que o sistema faz:**

- Transcreve áudios com Whisper `large-v3` em português
- Suporta aulas em 1 ou múltiplas partes de áudio (lista `[]` sempre)
- Extrai texto de PDFs com PyPDF2
- Detecta páginas escaneadas automaticamente (abaixo de 50 chars) e aplica OCR com Tesseract + pdf2image
- Instala Poppler via `subprocess` na Célula 3 antes da execução
- Gera `.txt` estruturado com metadados e deposita em `Transcricoes_Medicina/` no Drive

**Estrutura do `.txt` gerado:**

```
**AUDIOS_ORIGEM:**nome1.m4a,nome2.m4a

**TRANSCRIÇÃO_DA_AULA_EM_TEXTO_BRUTO:**
[transcrição completa]

**CONTEÚDO_DOS_SLIDES_EM_TEXTO:**
[texto extraído do PDF, slide por slide com marcador --- Slide N ---]
```

**Configuração de uma aula (Célula 3):**

```python
aulas_para_processar = [
    # ── AULA 1 ──
    {
        "nome_saida": "03 - Tema Da Aula",
        "caminhos_audios": [
            "/content/drive/MyDrive/Logística - Drive/Áudios aulas/NOME.m4a",
        ],
        "caminho_pdf": "/content/drive/MyDrive/Slides/NOME.pdf",
        "prompt_whisper": "Aula de Medicina: termo1, termo2, termo3",
    },
]
```

**Constantes (nunca alterar sem o usuário pedir):**

```python
PASTA_SAIDA_DRIVE    = "/content/drive/MyDrive/Transcricoes_Medicina"
DIR_TEMP             = "/content/_whisper_temp"
LIMITE_CHARS_PAGINA  = 50   # abaixo disso, página vai para OCR
WHISPER_CONFIG = {
    "model":                      "large-v3",
    "language":                   "Portuguese",
    "temperature":                "0",
    "condition_on_previous_text": "False",
}
```

**Modelos Whisper disponíveis:**

|Modelo|Qualidade|RAM necessária|Recomendado para|
|---|---|---|---|
|`medium`|Boa|~5 GB|Colab gratuito com folga|
|`large-v2`|Muito boa|~10 GB|Colab gratuito no limite|
|`large-v3`|Máxima|~10 GB|Colab Pro ✅ (em uso)|

---

### 2.3 Componente 2 — Google Apps Script: Script de Resumo + Questões

Roda automaticamente via **Time-Driven Trigger (2× ao dia)**. Para cada `.txt` na pasta de entrada:

1. Lê o cabeçalho `AUDIOS_ORIGEM` e identifica os áudios para arquivar
2. Envia transcrição + slides para a API Gemini 2.5 Flash com o prompt OCANES
3. Gera Resumo e (futuramente) Questões em `.md` em pastas separadas
4. Arquiva o `.txt` original em `Arquivados/` e move os áudios para `Áudios aulas/`
5. Implementa **Exponential Backoff** para erros 429 (espera 62s) e 5xx
6. Possui **trava de sobrevivência de 4.5 minutos** (limite do GAS é 6 min)
7. Todos os arquivos são salvos como **Blob UTF-8** para preservar símbolos médicos

**IDs das pastas do Drive:**

```javascript
const CONFIG = {
    ID_PASTA_ENTRADA:     '1iHbxlpa_r7RFeBRWTn_Uai-1_E2Yfehb',
    ID_PASTA_RESUMOS:     '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',
    ID_PASTA_ARQUIVADOS:  '1R58WOeO0p3U51T05g-d-N9svziLSf9fL',
    ID_PASTA_AUDIOS:      '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
    MODELO_GEMINI:        'gemini-2.5-flash',
    TEMPO_LIMITE_MS:      4.5 * 60 * 1000,
    INTERVALO_ENTRE_ARQUIVOS_MS: 6000,
    MAX_RETRIES: 3,
};
```

---

### 2.4 Componente 3 — Google Apps Script: Script de Flashcards ✅

Script independente do Script de Resumo. Roda via **Time-Driven Trigger** configurável.

**Fonte de dados:** pasta `Resumos_Prontos/` (lê os `.md` de resumo, não as transcrições brutas)

**Configurações:**

```javascript
const CONFIG = {
  API_KEY:                 'AIzaSy...',               // chave Gemini
  DESTINATION_FOLDER_ID:  '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA', // Flashcards_Prontos/
  RESUMOS_FOLDER_ID:       '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6', // Resumos_Prontos/
  HORAS_RECENTES:          24,            // janela de tempo (ajustável)
  DELAY_ENTRE_ARQUIVOS_MS: 3000,          // pausa entre chamadas à API
  GEMINI_MODEL:            'gemini-2.5-flash',
  DISCIPLINAS: {
    'radiologia': 'LMF - Radiologia',
    'rastreio':   'LMF - Radiologia',
    'torax':      'LMF - Radiologia',
    'patologia':  'Patologia',
    'parasito':   'Parasitologia',
    'amebias':    'Parasitologia',
    'giardia':    'Parasitologia',
    'farmaco':    'Farmacologia',
    'antimetab':  'Farmacologia',
    'antineopla': 'Farmacologia',
    'clinica':    'LHM - Clínica',
    'fetal':      'LHM - Clínica',
    'obstetri':   'LHM - Clínica'
    // expandir conforme novas disciplinas forem adicionadas
  }
};
```

**Lógica de execução:**

1. Lista todos os arquivos `.md` em `Resumos_Prontos/` modificados dentro da janela de tempo
2. Para cada arquivo, detecta a disciplina pelo nome via dicionário de palavras-chave
3. Verifica se o flashcard correspondente já existe em `Flashcards_Prontos/` (anti-duplicata)
4. Envia o conteúdo do resumo + disciplina ao Gemini com o prompt de flashcards
5. Salva o arquivo gerado com cabeçalho padronizado

**Detecção de disciplina — lógica:**

- Nome do arquivo normalizado para lowercase sem acentos
- Primeira palavra-chave que der match no dicionário determina a disciplina
- Fallback: `'Medicina'` quando nenhuma palavra-chave é encontrada

**Filtro temporal:**

- Usa o maior valor entre `getDateCreated()` e `getLastUpdated()` para cada arquivo
- Garante que arquivos recém-criados E arquivos recém-editados sejam processados

**Erros resolvidos durante implementação:**

|Erro|Causa|Solução|
|---|---|---|
|`Drive is not defined`|Drive API v2 não ativada|Ativar em Serviços → Drive API v2|
|`User rate limit exceeded for OCR`|Muitas chamadas ao OCR|Abandonar OCR — ler `.md` direto com `getBlob().getDataAsString()`|
|`gemini-1.5-pro is not found`|Modelo descontinuado|Migrar para `gemini-2.5-flash`|
|`gemini-2.5-flash-preview-04-17 is not found`|Nome de preview desatualizado|Usar nome estável: `gemini-2.5-flash`|
|Nenhum arquivo encontrado|`getFilesByType('text/plain')` não pega `.md`|Usar `getFiles()` sem filtro de tipo MIME|

**Decisões de arquitetura:**

- Leitura direta de `.md` via `getBlob().getDataAsString('UTF-8')` — evita OCR e rate limits
- Pasta única de resumos sem separação por disciplina — detecção feita pelo nome do arquivo
- Script separado do Script de Resumo — triggers e ciclos de vida independentes
- Sem Drive API v2 neste script — não necessária para leitura de `.md`

---

### 2.5 Sistema de Geração de Cortes Cirúrgicos (pipeline paralelo)

```
NotebookLM (roteiro de leitura por objetivo)
        ↓
Gemini ou Claude (converte roteiro → config.json com offsets aplicados)
        ↓
Google Colab (recorta PDFs, monta capa + separadores + índice)
        ↓
saida/ no Google Drive (PDFs prontos para entrega)
```

**Estrutura de pastas no Drive:**

```
MyDrive/
└── [Nome da Disciplina]/
    ├── Parte_1_Livro.pdf
    ├── Parte_2_Livro.pdf
    ├── saida/
    ├── config.json
    └── offsets.json
```

> **Conceito de offset:** PDFs acadêmicos têm páginas extras no início (capa, sumário, prefácio). O offset é mapeado uma única vez por livro, salvo automaticamente em `offsets.json` e reutilizado em todos os módulos seguintes.

---

### 2.6 Tecnologias do Stack Completo

|Componente|Tecnologia|
|---|---|
|Transcrição|Whisper large-v3 (OpenAI)|
|OCR|Tesseract via pytesseract + pdf2image|
|Extração de PDF|PyPDF2|
|Geração de conteúdo IA|Gemini 2.5 Flash (Google)|
|Geração de PDFs de corte|pypdf + reportlab|
|Orquestração automática|Google Apps Script (Time-Driven Trigger)|
|Resistência a falhas|Exponential Backoff + trava de 4.5 min (Script de Resumo)|
|Codificação|UTF-8 via Blob (preserva símbolos médicos)|
|Armazenamento|Google Drive|
|Ambiente de execução|Google Colab Pro|
|Active Recall|Obsidian + plugin Spaced Repetition|

---

## 3. Estrutura de Pastas do Google Drive

```
MyDrive/
├── Transcricoes_Medicina/       ← entrada: .txt gerados pelo Colab
├── Resumos_Prontos/             ← saída: resumo OCANES (.md)  [ID: 1QnAfngespsRRQfEHouqcXq1x2MTxgPa6]
├── Flashcards_Prontos/          ← saída: flashcards Obsidian (.md) ✅  [ID: 1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA]
├── Questoes_Prontas/            ← saída: questões para venda (.md) ⏳
├── Arquivados/                  ← .txt processados  [ID: 1R58WOeO0p3U51T05g-d-N9svziLSf9fL]
├── Áudios aulas/                ← áudios originais (arquivados após processamento)  [ID: 1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC]
└── [Disciplina]/
    ├── saida/                   ← Cortes Cirúrgicos em PDF
    ├── config.json
    └── offsets.json
```

---

## 4. Padrão de Nomenclatura

**Script de Resumo** — padrão gerado por `formatar_nome_saida()`:

```
03 - Miíase e Escabiose (Resumo).md
03 - Miíase e Escabiose (Questões).md
```

**Script de Flashcards** — padrão baseado no nome do resumo de origem:

```
Radiologia - Radiografia de Torax.md          ← resumo (entrada)
Radiologia - Radiografia de Torax - Flashcards.md   ← flashcard (saída)

Parasitologia - Amebiase e Giardiase.md
Parasitologia - Amebiase e Giardiase - Flashcards.md

LHM - Estatica Fetal.md
LHM - Estatica Fetal - Flashcards.md
```

> **Atenção:** existe uma divergência de padrão de nomenclatura entre os dois scripts. O Script de Resumo usa o formato `03 - Tema (Tipo)`, enquanto o Script de Flashcards usa `Disciplina - Tema - Flashcards`. Unificar esses padrões é um ponto pendente de médio prazo.

---

## 5. Fluxo de Produção a Cada Módulo

Otimizado para não drenar a bateria cognitiva do criador.

1. **Captura** — Gravar aula + baixar slides (delegável ao parceiro operacional).
2. **Pipeline de transcrição (Colab — Célula 3)** — Configurar aula, rodar. O sistema transcreve com Whisper, extrai slides com OCR híbrido e deposita `.txt` no Drive.
3. **Pipeline de conteúdo (Apps Script — automático)** — Trigger detecta o `.txt`, envia ao Gemini 2.5 Flash e gera Resumo em `.md`. Áudios e `.txt` arquivados automaticamente.
4. **Pipeline de flashcards (Apps Script — automático)** ✅ — Trigger independente detecta os resumos novos em `Resumos_Prontos/`, envia ao Gemini 2.5 Flash e gera flashcards em `Flashcards_Prontos/`. Sem intervenção manual.
5. **Cortes Cirúrgicos (Colab — pipeline paralelo)** — NotebookLM gera roteiro → Gemini/Claude converte em `config.json` → Colab recorta PDFs dos livros e monta capa com índice.
6. **Refino** — Criar o Mapa Mental no Obsidian (momento de estudo ativo do criador).
7. **Entrega** — Organizar Drive → link/script de WhatsApp para a turma.

---

## 6. Modelo Financeiro (Barbell Strategy)

|Modalidade|Preço|Público-alvo|Lógica|
|---|---|---|---|
|**Combo do Módulo**|R$ 80,00|O aluno organizado e o ansioso|Garante caixa rápido e fidelidade. Meta: 10–20 alunos = R$ 800–R$ 1.600|
|**Aula Avulsa**|R$ 15,00|O aluno que faltou ou está desesperado|Margem alta por unidade. Resolve uma dor aguda imediata|

O Combo inclui: Resumo OCANES + Flashcards + Questões (PDF para venda) + Corte Cirúrgico + Mapa Mental.

---

## 7. Estratégia de Lançamento

**Tática: "Degustação com Prazo de Validade"**

- Liberar acesso gratuito a uma pasta "Degustação" com material das primeiras semanas.
- A pasta tem data para "explodir" — quando o prazo acaba, os arquivos são movidos para a pasta paga.
- Quem quiser continuar paga os R$ 80,00.

**Canal principal:** o roteiro de leitura gerado pelo NotebookLM, formatado para envio no grupo do WhatsApp da turma — funciona como preview do produto e comunicação de valor recorrente a cada módulo.

---

## 8. Operacional & Logística

**Entrega no Drive:**

- Pasta Módulo (pai): acesso restrito (só e-mails pagantes), trava de edição ativada.
- PDFs de objetivos (filhos): compartilhamento permite download/cópia (para funcionar no GoodNotes/iPad).
- `.md` de Resumo, Flashcards e Questões: gerados e entregues automaticamente sem intervenção manual.

**Segurança (anti-pirataria):** Sem DRM complexo. Marca d'água planejada nos PDFs gerados (`Drive de Apoio – Turma X`). O peso social de ser monitor/líder inibe o repasse.

**Gestão de clientes:** Planilha simples para marcar quem pagou e quem recebeu acesso. Comunicação via WhatsApp em tom informal e próximo.

---

## 9. Status das Implementações

### ✅ Concluído

**Pipeline de Transcrição (Colab)**

- Suporte a múltiplas partes de áudio por aula
- OCR automático em páginas escaneadas
- Validação de caminhos antes de executar
- Relatório final com tempo por aula e motivo de falha
- Logging estruturado com timestamp

**Pipeline de Conteúdo — Resumo (Apps Script)**

- Geração automática do Resumo OCANES via Gemini 2.5 Flash
- Arquivamento automático de áudios e `.txt` após processamento
- Exponential Backoff com tratamento de erros 429 e 5xx
- Trava de sobrevivência de 4.5 min
- Nomeação automática no padrão `03 - Tema (Tipo)`
- Blob UTF-8 para preservar símbolos médicos

**Pipeline de Flashcards (Apps Script)** ✅ _novo nesta versão_

- Leitura direta de `.md` via `getBlob().getDataAsString('UTF-8')`
- Filtro temporal por janela de horas configurável
- Detecção automática de disciplina por dicionário de palavras-chave
- Anti-duplicata: verifica existência antes de gerar
- Prompt de elite com atomização estrita e encoding de High-Order Thinking
- Formato Obsidian Spaced Repetition com cabeçalho padronizado
- Relatório de execução com contagem de processados, pulados e erros
- Modelo `gemini-2.5-flash` com safety settings `BLOCK_NONE` para conteúdo médico

**Cortes Cirúrgicos (Colab paralelo)**

- Livros flexíveis — sem lista fixa, adiciona/remove no JSON a cada módulo
- Capa com índice de navegação (posição no PDF em azul + capítulo + seção)
- Separador visual entre fontes com livro, capítulo e seção
- Offset mapeado uma única vez por livro e reutilizado automaticamente
- Célula 5.5 de preview antes de gerar
- Ordenação didática automática (conceito → mecanismo → clínica)
- Verificação de duplicatas entre objetivos

---

### ⏳ Pendente — Alta Prioridade

|Item|Componente|
|---|---|
|Adicionar instruções personalizadas de sistema ao `buildPrompt()` do Script de Flashcards|Apps Script|
|Questões de múltipla escolha para venda em PDF|Apps Script|
|Notificação por e-mail ao concluir processamento|Apps Script|
|Numeração de página no rodapé dos PDFs de corte (`p. 3 de 18`)|Colab Cortes|
|Marca d'água discreta nos PDFs gerados|Colab Cortes|
|Configurar Time-Driven Trigger para o Script de Flashcards|Apps Script|

### ⏳ Pendente — Média Prioridade

|Item|Componente|
|---|---|
|Unificar padrão de nomenclatura entre Script de Resumo e Script de Flashcards|Apps Script|
|Expandir dicionário `DISCIPLINAS` conforme novas matérias|Apps Script|
|Roteamento automático por disciplina (LHM/LMF)|Apps Script|
|Painel de controle no Google Sheets|Apps Script|
|Subpastas por módulo em `saida/`|Colab Cortes|
|Log de geração salvo em `log.json`|Colab Cortes|

### ⏳ Pendente — Baixa Prioridade

|Item|Componente|
|---|---|
|Índice automático no Obsidian|Obsidian|
|Flashcards referenciando o PDF (`Ver: Objetivo 01, p. 4`)|Apps Script|
|Célula de busca de título de seção por número de página|Colab Cortes|
|Estimativa de tempo de leitura na capa dos Cortes|Colab Cortes|

---

## 10. Regras Inegociáveis do Sistema

1. Nunca editar a Célula 4 do Colab — apenas a Célula 3
2. `caminhos_audios` é sempre uma lista `[]`, mesmo com 1 áudio
3. `caminho_pdf` aceita caminho string ou `None`
4. Nunca alterar `PASTA_SAIDA_DRIVE`, `WHISPER_CONFIG` ou o prompt OCANES sem o usuário pedir
5. O Apps Script usa `gemini-2.5-flash` em ambos os scripts — não trocar para Pro sem o usuário pedir
6. Preservar sempre: Exponential Backoff, UTF-8 via Blob, trava de 4.5 min e arquivamento transacional (Script de Resumo)
7. Ao adicionar aula no lote, sempre separar com comentário `# ── AULA N ──`
8. Nunca remover o cabeçalho `AUDIOS_ORIGEM` do `.txt` — o Apps Script depende dele para arquivar os áudios
9. Ao propor refatorações, preservar a lógica de arquivamento de áudios e a estrutura UTF-8 via Blobs
10. No Script de Flashcards: não usar `getFilesByType()` para encontrar `.md` — usar `getFiles()` sem filtro de tipo MIME
11. No Script de Flashcards: safety settings sempre `BLOCK_NONE` — necessário para conteúdo médico técnico não ser bloqueado

---

## 11. Parceria Estratégica

- **Você (Cérebro):** prompts, validação técnica, mapas mentais, configuração do pipeline, curadoria dos objetivos.
- **Parceiro (Músculo/Front):** rodar o Colab, organizar o Drive, responder dúvidas no WhatsApp, cobrar os PIX.

---

> Este negócio é **sustentável**, **escalável** e **compatível com a rotina de estudante de medicina**. O pipeline automatiza 80% da produção — Resumo, Flashcards e Questões saem sozinhos para cada aula gravada. Você transformou a necessidade de estudar em um ativo financeiro com infraestrutura de IA. 🚀