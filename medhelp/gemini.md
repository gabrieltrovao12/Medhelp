# Arquitetura e Esquema de Dados - Medhelp

## Fluxo de Processamento de Aulas
O sistema processa gravações de áudio e slides de apoio para gerar resumos em Markdown estruturados no formato Obsidian e flashcards no estilo Anki.

```
[0. Renomeação Inteligente (Gemini)] ◄── (Áudios salvos com nome rápido no celular)
       │
       ▼ (Renomeia fisicamente no Drive para padrão definitivo)
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
                         ──► [Flashcards .md] ──► [Drive (Flashcards)] ──► [Subpastas por Disciplina]
       │
       ▼ (Movimentação física de arquivos no Drive)
[5. Limpeza de Áudio] ──► Move .txt para Arquivados, remove áudio de Entrada
       │
       ▼ (Sincronização via Overgrive)
[6. Obsidian Local] ──► Arquivos aparecem prontos na máquina local
```

## Convenção de Nomenclatura Final (Áudios)
`[Matéria/Área] - [Nome da Aula] - [Tipo (Teórica/Prática)] - Parte [01/02]`
*Exemplos de mapeamento por IA:*
- `cardio - beta - pratica` ──► `LHM - Beta-bloqueadores - Prática - Parte 01.m4a`
- `cirurgia hernia teorica p2` ──► `Cirurgia - Hérnias da Parede Abdominal - Teórica - Parte 02.m4a`

## Configurações Ativas
- **IDs de Pastas**:
  - Entrada: `1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh`
  - Resumos: `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6`
  - Arquivados: `1R58WOeO0p3U51T05g-d-N9svziLSf9fL`
  - Áudios: `1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC`
- **Novos Caminhos Colab**:
  - Base Tutoria: `/content/drive/MyDrive/Logística - Drive/Tutoria`
  - Áudios Aulas: `/content/drive/MyDrive/Logística - Drive/Transcrições/Áudios aulas/`
  - Transcrições Medicina: `/content/drive/MyDrive/Logística - Drive/Transcrições/Transcricoes_Medicina`
  - Semestre letivo: `2026.2 - M6` (antigo `2026.1`)
- **Modelo Utilizado**: `gemini-2.5-flash`
- **Tempo Limite**: 4.5 minutos (270.000 ms) por execução do lote.

