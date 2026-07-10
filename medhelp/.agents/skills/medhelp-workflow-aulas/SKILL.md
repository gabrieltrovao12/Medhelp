---
name: "medhelp-workflow-aulas"
description: "Guia completo para processamento e orquestração de aulas no ecossistema Medhelp. Vai da validação do áudio e slide, passando pela transcrição (Whisper via Colab), até a geração de resumos ricos (Obsidian) e flashcards (Anki). Acionar quando o usuário pedir para processar gravação, gerar aula, formatar material educacional ou resolver problemas de transcrição."
---

# Skill: medhelp-workflow-aulas (Processamento de Aulas)

## 1. Objetivo
Guiar a IA no processamento end-to-end de gravações e materiais educacionais. O fluxo transforma arquivos brutos (áudios + slides) em documentação estruturada, módulos de estudo interativos (lessons), e flashcards.

---

## 2. Inventário de Caminhos (Drive / Colab)
Sempre utilize a estrutura do semestre ativo (**2026.2 - M6**):

*   **Entrada Lote (brutos):** `/content/drive/MyDrive/Logística - Drive/Transcricoes/`
*   **Áudios Aulas:** `/content/drive/MyDrive/Logística - Drive/Transcricoes/Áudios aulas/`
*   **Slides (PDF):** `/content/drive/MyDrive/2026.2 - M6/...`
*   **Resumos Prontos (.md):** `/content/drive/MyDrive/Logística - Drive/Transcricoes/Resumos_Prontos/`
*   **Flashcards Gerados:** `/content/drive/MyDrive/Logística - Drive/Transcricoes/Transcricoes_Medicina/`

---

## 3. O Pipeline de Processamento (Passo a Passo)

### FASE 1 — Descoberta e Validação (Local/Drive)
Se houver interação com arquivos de áudio diretamente:
1. **Verificar formato e tamanho:**
   - Garantir que é áudio compatível (.mp3, .m4a, .wav). Se local, use `ffmpeg` para obter a duração e validar.
2. **Validar casamento (Áudio + Slide):**
   - O nome do áudio e do slide no Drive devem compartilhar palavras-chave essenciais.
   - O script `pre-transcricao` (Apps Script) faz a varredura e monta o bloco de `prompt_whisper` extraído do PDF.

### FASE 2 — Transcrição (Whisper via Colab)
O processamento pesado ocorre no Colab (`Transcribe.ipynb`):
1. Assegure a sintaxe do bloco gerado para o Whisper, que faz o *priming* com os jargões médicos:
   ```python
   {
       "nome_saida": "LHM - Insuficiência Cardíaca",
       "caminhos_audios": [ PREFIXO_AUDIO + "audio.m4a" ],
       "caminho_pdf": "/content/drive/MyDrive/2026.2 - M6/Cardio/Slides.pdf",
       "prompt_whisper": "insuficiência, betabloqueador, diurético..."
   }
   ```
2. Após rodar o notebook, um `.txt` bruto é salvo na pasta de entrada do Apps Script.

### FASE 3 — Síntese e Módulos Educacionais (Apps Script / Gemini)
Quando acionado o pipeline via webhook ou trigger, o Gemini consolida os dados:
1. **Resumo (Obsidian)**:
   - Extrai Tópicos Discutidos, Metadados (duração/speakers).
   - Ignora enrolação introdutória. Inicia direto no `#` da matéria.
   - Aplica tabelas para diagnósticos e sintomas.
2. **Flashcards (Anki)**:
   - Segue o Princípio da Informação Mínima: Um fato anatômico/clínico por card.
   - Usa Cloze Deletion obrigatoriamente (ex: `O tratamento principal é {{c1::fármaco X}}.`).
3. **Módulos de Aula (Lessons)**:
   - Caso seja requisitado um "Mini-Curso" ou "Roteiro de Estudo Interativo", as saídas estruturadas do Gemini devem ser quebradas em "Lições" lógicas: 
     - Objetivos de Aprendizagem
     - Conceitos-Chave (Explanation)
     - Knowledge Checks (Quizzes)
     - Flashcards atrelados à lição

### FASE 4 — Limpeza (Arquivamento)
Após geração de todos os subprodutos:
- O `.txt` transcrito é movido para Arquivados.
- O `.m4a` pode ser agendado para deleção (ou arquivamento) se a variável de auto-cleanup estiver habilitada.

---

## 4. Diretrizes de Geração de Conteúdo

*   **Seja Fiel à Verdade (Ground Truth):** Se o professor falou "X" e o slide diz "Y", aponte a discrepância se for gritante, mas a base documental principal é a aula transcrita.
*   **Formatos Ricos:** Use Markdown avançado. Listas aninhadas, `> citações importantes`, e `==highlights==` se suportados pelo Obsidian.
*   **Semântica de Estudo:** Para quizzes, dê feedback imediato na resposta. Para flashcards, proíba redundância extrema.

## 5. Troubleshooting Comum
- Se uma aula não gerou, verifique se o arquivo `.txt` caiu na pasta correta ou foi barrado por acentuação (Unicode issue em nomes de arquivo).
- Se arquivos de áudio não forem reconhecidos, cheque o charset no Python do Colab.

---

## 6. Geração do Bloco Python (Célula 3 - Colab) & Manipulação de Arquivos

Sempre que o usuário enviar imagens de diretórios contendo gravações de aulas, ou uma lista textual de arquivos brutos, e solicitar a Célula 3 do Colab ou manipulações de documentos (Ghostscript e Pandoc), siga este protocolo:

### A. Geração do Bloco Python (Célula 3 - Google Colab)
1. **Extração e concatenação:** Extraia o nome exato com extensão de cada arquivo visível e concatene com `PREFIXO_AUDIO = "/content/drive/MyDrive/Áudios aulas/"` (usando o caminho da raiz do Google Drive).
2. **Agrupamento:** Se uma aula for dividida em partes (ex: Parte 1 e Parte 2), agrupe-as em uma única entrada, declarando os arquivos em uma lista em `caminhos_audios`.
3. **Nomenclatura da Saída (`nome_saida`):** Infira dinamicamente com base na Convenção de Nomenclatura do `gemini.md`: `[Matéria/Área] - [Nome da Aula] - [Tipo (Teórica/Prática)] - Parte [01/02]`. Remova underscores, timestamps ou prefixos numéricos do nome do arquivo original.
4. **Caminho do PDF (`caminho_pdf`):** Defina como `None` por padrão, a menos que o usuário forneça o caminho do slide correspondente.
5. **Geração do Prompt do Whisper (`prompt_whisper`):** Deve ser iniciado por `Aula de Medicina: `. Deve conter exatamente **40 termos médicos de alta complexidade** (fármacos, patologias, semiologia, latim, etc.) diretamente associados ao tema da aula, garantindo priming fonético perfeito para o Whisper. Nunca deixe vazio ou com menos de 40 termos.
6. **Comentários Estruturais:** Preceda cada bloco de aula com o comentário `# ── AULA N ──` (onde N é o índice incremental a partir de 1).
7. **Formato de Saída:** Retorne **estritamente o bloco de código Python** (uma lista de dicionários Python atribuída à variável `aulas_para_processar`), sem saudações ou explicações adjacentes.

#### Exemplo de Output:
```python
aulas_para_processar = [
    # ── AULA 1 ──
    {
        "nome_saida": "Cardiologia - Betabloqueadores - Teórica - Parte 01",
        "caminhos_audios": [
            PREFIXO_AUDIO + "cardio_beta_teorica_p1.m4a",
        ],
        "caminho_pdf": None,
        "prompt_whisper": "Aula de Medicina: carvedilol, metoprolol, propranolol, atenolol, nebivolol, cronotropismo negativo, inotropismo negativo, bradicardia, broncoespasmo, asma brônquica, DPOC, bloqueio atrioventricular, insuficiência cardíaca congestiva, fração de ejeção, receptor beta-1, receptor beta-2, vasoconstrição periférica, hipertensão arterial, angina de peito, infarto agudo do miocárdio, taquiarritmia, rebote adrenérgico, claudicação intermitente, disfunção erétil, hipoglicemia mascarada, choque cardiogênico, remodelamento cardíaco, estimulação simpática, norepinefrina, epinefrina, cardioproteção, seletividade cardíaca, lipossolubilidade, depuração hepática, excreção renal, efeito de primeira passagem, posologia, descontinuação abrupta, hipotensão ortostática, intolerância ao exercício, tonus simpático...",
    },
]
```

### B. Manipulação de Arquivos via Ghostscript (Terminal Linux)
Sempre que solicitado recorte ou compressão de PDF, retorne a instrução pronta usando Ghostscript (`gs`):
- **Recortar páginas:**
  `gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dFirstPage=[PAG_INICIAL] -dLastPage=[PAG_FINAL] -sOutputFile=[SAIDA.pdf] [ENTRADA.pdf]`
- **Comprimir PDF:**
  `gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/[QUALIDADE] -sOutputFile=[SAIDA.pdf] [ENTRADA.pdf]`
  *Qualidades (PDFSETTINGS):*
  - `/prepress` (alta qualidade)
  - `/printer` (qualidade de impressão)
  - `/ebook` (equilíbrio médio)
  - `/screen` (menor tamanho)

### C. Conversão de Documentos via Pandoc (Terminal Linux)
Sempre que solicitada a conversão de formatos de arquivos documentais, retorne o comando Pandoc direto:
- **PDF para Word (.docx):** `pandoc entrada.pdf -o saida.docx`
- **PDF para Markdown (.md):** `pandoc entrada.pdf -o saida.md`
- **Markdown para Word (.docx):** `pandoc entrada.md -o saida.docx`
