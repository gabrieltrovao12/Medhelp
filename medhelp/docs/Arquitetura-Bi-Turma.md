# 🏗️ Arquitetura Bi-Turma — Medhelp
> **Versão:** 1.1 — Atualizado após implementação da Fase 1 (Apps Script)
> **Status:** Fase 1 Concluída
> **Escopo:** UNDB (Turma A — você) + CEUMA (Turma B — monitor parceiro)

---

## 1. Contexto e Problema

O sistema Medhelp foi construído com arquitetura de **instância única e hardcoded**: IDs de pasta do Drive fixados diretamente nos `Config.js` de cada módulo Apps Script, e a string de autoria (`© Conteúdo Autoral • João Gabriel R. Trovão`) hardcoded nos notebooks do Colab.

Para escalar para uma segunda turma, essa estrutura exige:
- Copiar manualmente os projetos Apps Script
- Editar 10+ IDs em cada `Config.js`
- Criar pastas no Drive com estrutura idêntica
- Editar strings de autoria manualmente em cada notebook

**Isso é O(n) de esforço manual para cada nova turma — inaceitável.**

---

## 2. Premissas e Restrições (Não-Negociáveis)

| Premissa | Detalhe |
|---|---|
| **Operador técnico único** | Você controla todos os scripts. O monitor parceiro nunca edita Apps Script |
| **Apenas 2 turmas** | YAGNI — não projetar para 10. Simplicidade acima de tudo |
| **Conta Google única** | Tudo roda exclusivamente na sua conta Google. As pastas de ambas as turmas residem no seu Drive |
| **Custo zero adicional** | Tudo no GAS + Drive existente. Sem servidores, sem APIs pagas |
| **Ambulatório SOAP fora do escopo** | Produto exclusivo seu, sem alteração |

---

## 3. Decisão de Arquitetura: `TurmaRouter`

### 3.2 A Solução: Config-by-Turma (Dois Contextos)

Um novo arquivo `TurmaRouter.js`, adicionado a ambos os módulos Apps Script, centraliza todas as configurações por turma. Como cada módulo tem responsabilidades diferentes, os IDs mapeados são específicos para o contexto do módulo. O `Config.js` existente passa a ser apenas para configurações globais de tempo de execução (timeouts, modelos de IA, etc.).

**Módulo 1: automacao-transcricoes (`TurmaRouter.js`)**
```javascript
const TURMAS = {
  'UNDB': {
    ID_PASTA_ENTRADA:    '1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh',
    ID_PASTA_RESUMOS:    '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',
    ID_PASTA_ARQUIVADOS: '1R58WOeO0p3U51T05g-d-N9svziLSf9fL',
    ID_PASTA_AUDIOS:     '1rXV-eovjzQvAQxVNWQtROIh7L_1oNAEC',
    MONITOR:             'João Gabriel R. Trovão',
  },
  'CEUMA': { /* [PENDENTE] */ }
};
```

**Módulo 2: medhelp-flashcards (`TurmaRouter.js`)**
```javascript
const TURMAS = {
  'UNDB': {
    ID_PASTA_ENTRADA_RESUMOS:  '1QnAfngespsRRQfEHouqcXq1x2MTxgPa6',
    ID_PASTA_ENTRADA_TUTORIA:  '1woWImU-UQFDEEFPUBrOu9S1s7LJU16TB',
    ID_PASTA_SAIDA_FLASHCARDS: '1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA',
    PASTAS_SAIDA_CATEGORIAS: {
      'TFC': '1MU8tqPAss0E8gAkky15eVQjStQWbhJEa',
      'LHM': '1xeKf5DCbIWl_OTLggw5PHeeN4XTRU9dZ',
      // ... outras subpastas específicas
    },
    MONITOR: 'João Gabriel R. Trovão',
  },
  'CEUMA': { /* [PENDENTE] */ }
};
```

O método `detectarTurma(nomeArquivo, pastaId)` utiliza um sistema híbrido para garantir robustez, retornando a sigla da turma ou `'QUARENTENA'` se o arquivo não for reconhecido.

### 3.3 Identificação de Turma (Sistema Híbrido)

| Sinal | Como funciona | Quando falha |
|---|---|---|
| **Primário — Prefixo no nome** | `UNDB - TFC Clínico - Fisiologia.m4a` | Arquivo nomeado sem convenção |
| **Secundário — Pasta de origem** | Script verifica de qual pasta de entrada o arquivo veio | Arquivo na pasta errada |
| **Falha total → QUARENTENA** | Arquivo vai para pasta de erro | Logger registra `TURMA_DESCONHECIDA` |

> ⚠️ **Convenção obrigatória de nomenclatura de áudios:**
> `[SIGLA] - [TIPO] - [Tema].m4a`
> Exemplos: `UNDB - TFC - Fisiologia Digestiva.m4a` | `CEUMA - LMF - Cardiologia Básica.m4a`

---

## 4. Autoria nos PDFs e Notebooks (Colab)

### Problema
A string de autoria está hardcoded em três lugares:
- `Orquestrador_Hibrido.ipynb` — linha 294
- `Roteiro_Tutoria.ipynb` — linha 1487
- `orquestrador_cells.txt` — linha 224

### Solução
Cada notebook ganha uma **célula de configuração no topo** — a única célula que o monitor precisa editar antes de rodar:

```python
# ╔══════════════════════════════════╗
# ║   CONFIGURAÇÕES DA TURMA         ║
# ╚══════════════════════════════════╝
MONITOR_NOME = "João Gabriel R. Trovão"  # ← monitor muda só aqui
FACULDADE    = "UNDB"

# Gerado automaticamente — não editar abaixo
AUTORIA = f"© Conteúdo Autoral  •  {MONITOR_NOME}"
```

---

## 5. Modelo de Drive

```
Conta Google: SUA CONTA
├── Logística - Drive (UNDB)
│   ├── Transcrições
│   │   ├── Transcricoes_Medicina/ (Entrada)
│   │   ├── Resumos_Prontos/
│   │   ├── PDFs_Premium/
│   │   └── Arquivados/
│   ├── Flashcards/
│   ├── Tutoria/
│   │   └── saida/
│   └── Livros/
│
└── Logística - CEUMA
    ├── Transcrições - CEUMA
    │   ├── Transcricoes_Medicina - CEUMA/ (Entrada)
    │   ├── Resumos_Prontos - CEUMA/
    │   ├── PDFs_Premium - CEUMA/
    │   └── Arquivados - CEUMA/
    ├── Flashcards - CEUMA/
    ├── Tutoria - CEUMA/
    │   └── saida - CEUMA/
    └── Livros - CEUMA/
```

Toda a operação se mantém isolada no seu ecossistema. O monitor atuará apenas recebendo os links gerados ou baixando os materiais prontos.

---

## 6. Diagrama de Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                      VOCÊ (Operador Técnico)                    │
├──────────────────────────────┬──────────────────────────────────┤
│         TURMA UNDB           │          TURMA CEUMA             │
│  Drive: sua conta            │  Drive: sua conta                │
│  (pastas exclusivas UNDB)    │  (pastas exclusivas CEUMA)       │
├──────────────────────────────┴──────────────────────────────────┤
│                                                                  │
│  [Áudio depositado na pasta de entrada]                         │
│       ↓ você roda Transcribe.ipynb                              │
│       ↓ Whisper transcreve                                      │
│       ↓ Webhook dispara → GAS recebe                            │
│                                                                  │
│  [GAS — TurmaRouter.js]                                         │
│       ↓ detecta turma pelo prefixo do arquivo                   │
│       ↓ fallback: detecta pela pasta de entrada                 │
│       ↓ carrega CONFIG da turma correta                         │
│       ↓ gera resumo .md → pasta Resumos da turma               │
│       ↓ SheetsLogger registra com coluna "turma"               │
│                                                                  │
│  [GAS — Flashcards + TurmaRouter.js]                            │
│       ↓ detecta turma pela pasta de origem do resumo            │
│       ↓ salva .md na pasta de flashcards da turma correta      │
│                                                                  │
│  [Colab — Orquestrador Híbrido / PDF Premium]                   │
│       ↓ MONITOR_NOME na célula de config = nome correto        │
│       ↓ AUTORIA gerada dinamicamente no PDF                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Divisão Operacional de Trabalho

| Produto | Responsável | Fluxo |
|---|---|---|
| **Roteiro PBL** | Monitor (autônomo) | Fork do Orquestrador Híbrido via Git, edita `MONITOR_NOME`, roda por conta própria |
| **Transcrição das Aulas** | Você | Ele deposita áudios/slides na pasta CEUMA + avisa no WhatsApp → você roda o Transcribe |
| **PDF Premium** | Você | Você roda após a transcrição → avisa ele quando estiver pronto |
| **Flashcards** | GAS (automático) | Gerados automaticamente após o resumo; ele pega da pasta e publica no NotebookLM |
| **Site/Landing Page** | Monitor (com template) | Ele usa o template parametrizável, edita `config.yml`, faz push |

### SLA Informal (Sugerido)
- Você se compromete a processar as aulas em **até 48h** após o aviso no WhatsApp
- Ele se compromete a nomear os arquivos conforme a convenção antes de depositar

---

## 8. Site do Monitor (GitHub Pages — Template Parametrizável)

```yaml
# config.yml — único arquivo que o monitor edita
monitor_nome: "Nome do Parceiro"
faculdade: "CEUMA"
cidade: "São Luís, MA"
cor_primaria: "#1a73e8"
whatsapp: "5598XXXXXXXXX"
modulos:
  - "Roteiro PBL"
  - "Resumo de Aulas"
  - "Flashcards"
```

Para atualizar o site, o monitor edita o arquivo e faz:
```bash
git add .
git commit -m "atualiza config"
git push
```
GitHub Pages publica automaticamente em ~1 minuto.

---

## 9. Mapa de Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Arquivo nomeado sem prefixo | Alta | Baixo | `QUARENTENA` + alerta no Logger |
| Monitor tirar compartilhamento | Baixa | Alto | Conversa de expectativas + contrato |
| Você virar gargalo nas aulas | Média | Médio | SLA informal 48h + WhatsApp |
| Site dele desatualizado | Média | Baixo | Template + 2 comandos Git |
| Autoria cruzada nos PDFs | Baixa | Alto | Célula de config obrigatória no topo do notebook |

---

## 10. Roteiro de Implementação

> Não alterar nada até decisão de executar.

### Fase 1 — Apps Script (bi-turma) [CONCLUÍDO ✅]
- [x] Criar `TurmaRouter.js` em `automacao-transcricoes/`
- [x] Criar `TurmaRouter.js` em `medhelp-flashcards/`
- [x] Refatorar `Config.js` de ambos os módulos (remover IDs hardcoded)
- [x] Adaptar `Main.js` para injetar config via `TurmaRouter`
- [x] Separar lógica de "Quarentena" (arquivos mal nomeados) do contador de "Falhas"
- [x] Atualizar `DriveUtils.js` e lógicas de salvar arquivos para ser turma-agnóstico
- [x] `clasp push` em ambos os módulos + novo deploy do Webhook

### Fase 2 — Colab (autoria parametrizável)
- [ ] Adicionar célula de config no topo do `Orquestrador_Hibrido.ipynb`
- [ ] Adicionar célula de config no topo do `Roteiro_Tutoria.ipynb`
- [ ] Testar geração de PDF com `MONITOR_NOME` diferente
- [ ] Commitar e subir para o Git (monitor faz fork)

### Fase 3 — Drive (setup CEUMA)
- [ ] Você cria a estrutura de 4 pastas da turma CEUMA no seu próprio Drive
- [ ] Você copia os IDs gerados e preenche o bloco `CEUMA` no `TurmaRouter.js`

### Fase 4 — Site (template)
- [ ] Criar repositório template `medhelp-site-template` no GitHub
- [ ] Parametrizar com `config.yml`
- [ ] Monitor faz fork, edita config, publica no GitHub Pages
