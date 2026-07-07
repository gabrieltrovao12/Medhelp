# Arquitetura e Esquema de Dados - Medhelp

## Fluxo de Processamento de Aulas
O sistema processa gravações de áudio e slides de apoio para gerar resumos em Markdown estruturados no formato Obsidian e flashcards no estilo Anki.

```
[1. Colab / Whisper GPU] 
       │
       ▼ (Salva .txt com transcrição no Drive)
[2. Colab Trigger] 
       │
       ▼ (HTTP POST Webhook)
[3. Apps Script (doPost)]
       │
       ▼ (Chama Gemini 2.5 Flash + Aplica OCANES)
[4. Geração de Arquivos] ──► [Resumo .md] ──► [Drive (Resumos_Prontos)]
                         ──► [Flashcards .md] ──► [Drive (Flashcards)]
       │
       ▼ (Movimentação física de arquivos no Drive)
[5. Limpeza de Áudio] ──► Move .txt para Arquivados, remove áudio de Entrada
       │
       ▼ (Sincronização via Overgrive)
[6. Obsidian Local] ──► Arquivos aparecem prontos na máquina local
```

## Configurações Ativas
- **IDs de Pastas**:
  - Entrada: `1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh`
  - Resumos: `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6`
  - Arquivados: `1R58WOeO0p3U51T05g-d-N9svziLSf9fL`
  - Áudios: `1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC`
- **Modelo Utilizado**: `gemini-2.5-flash`
- **Tempo Limite**: 4.5 minutos (270.000 ms) por execução do lote.
