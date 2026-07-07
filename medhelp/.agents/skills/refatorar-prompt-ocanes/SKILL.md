---
name: "Refatorar Prompt OCANES"
description: "Refatorar, evoluir, melhorar, adicionar seções ou modificar qualquer prompt OCANES do sistema Medhelp. Usar quando o usuário pedir para alterar prompts de resumo, flashcards, priming ou qualquer system instruction que utilize o framework OCANES. Também ativar quando o usuário mencionar: melhorar prompt, adicionar seção, refatorar instrução, ajustar saída do Gemini, mudar formato de resposta, adicionar extração de dados."
---

# Skill: Refatorar Prompt OCANES

## Objetivo
Garantir que toda alteração em um prompt OCANES do ecossistema Medhelp seja feita de forma controlada, rastreável e sem regressões, preservando a integridade das seções existentes e a coerência entre vetores positivos (Ações) e negativos (Normas).

## Inventário de Prompts OCANES no Projeto

| Arquivo | Variável | Função |
|:---|:---|:---|
| `scripts/apps-script/automacao-transcricoes/Code.js` | `SYSTEM_INSTRUCTION` | Gera resumos estruturados de aulas para o Obsidian |
| `scripts/apps-script/flashcards/Código.js` | Prompt inline na função de chamada ao Gemini | Gera flashcards a partir dos resumos `.md` |
| `scripts/apps-script/pre-transcricao/Código.js` | Prompt inline na função `gerarPrimingGemini()` | Extrai termos médicos dos slides para priming do Whisper |

## Protocolo de Refatoração (Checklist Obrigatório)

### FASE 1 — Diagnóstico (Antes de tocar no prompt)

1. **Identificar o prompt-alvo**: Qual dos 3 prompts listados acima será alterado?
2. **Ler o prompt completo**: Carregar e analisar todas as linhas do prompt atual, identificando:
   - Quantas **Ações** (`[A]`) existem e qual a numeração atual.
   - Quantas **Normas** (`[N]`) existem e quais são seus guardrails.
   - Qual é o **formato de Saída** (`[S]`) esperado (seções Markdown, tabelas, etc.).
3. **Classificar a alteração** em uma das categorias:
   - `ADIÇÃO`: Nova seção, novo campo de extração, nova tabela.
   - `MODIFICAÇÃO`: Alterar comportamento de uma seção existente.
   - `REMOÇÃO`: Eliminar uma seção ou regra.
   - `CORREÇÃO`: Corrigir um bug ou ambiguidade no prompt atual.
4. **Avaliar impacto cruzado**: Verificar se a alteração proposta conflita com alguma Norma existente. Documentar conflitos encontrados.

### FASE 2 — Planejamento (Propor antes de executar)

5. **Redigir a alteração proposta** em formato de diff legível, mostrando:
   - O trecho original do prompt (linhas exatas).
   - O trecho modificado proposto.
   - Justificativa técnica da mudança.
6. **Verificar coerência OCANES**:
   - [ ] A alteração está na seção correta? (Ação em `[A]`, restrição em `[N]`, formato em `[S]`)
   - [ ] Se uma nova Ação foi adicionada, ela possui numeração sequencial correta?
   - [ ] Se uma nova extração de dados foi adicionada, existe um bloco correspondente na Saída `[S]`?
   - [ ] Se um novo guardrail foi adicionado, ele está isolado nas Normas `[N]` e não misturado nas Ações?
   - [ ] O token de escape para dados ausentes está definido? (ex: `DADO_AUSENTE`, `INFORMAÇÃO_INEXISTENTE`)
7. **Estimar impacto na janela de contexto**: Calcular o número aproximado de tokens adicionados e verificar se o prompt total permanece dentro dos limites do modelo configurado.

### FASE 3 — Execução (Aplicar a alteração)

8. **Aplicar a edição** no arquivo correto usando as ferramentas de edição da IDE.
9. **Preservar todos os comentários e docstrings** existentes que não são afetados pela alteração.
10. **Manter a formatação de escape** do Google Apps Script (uso correto de `\\` para backticks e caracteres especiais dentro de template literals).

### FASE 4 — Validação (Depois de aplicar)

11. **Revisão visual do prompt completo**: Reler o prompt alterado do início ao fim para verificar:
    - Fluxo lógico das Ações (a nova ação faz sentido na sequência?).
    - Ausência de contradições entre Ações e Normas.
    - Integridade do template de Saída (todas as seções referenciadas nas Ações têm bloco correspondente na Saída).
12. **Registrar a alteração** no arquivo `system_log.md` com:
    - Data e hora.
    - Arquivo alterado e linhas modificadas.
    - Descrição da mudança e justificativa.
    - Categoria da alteração (ADIÇÃO/MODIFICAÇÃO/REMOÇÃO/CORREÇÃO).

## Regras de Segurança

- **NUNCA** substituir o prompt inteiro. Sempre fazer edições cirúrgicas e localizadas.
- **NUNCA** remover uma Norma sem aprovação explícita do usuário.
- **NUNCA** adicionar uma Ação que contradiga uma Norma existente sem sinalizar o conflito.
- **NUNCA** alterar o formato de Saída sem verificar se todas as Ações que o referenciam foram atualizadas.
- Se houver dúvida sobre o impacto da alteração, **PARAR e perguntar ao usuário** antes de executar.

## Exemplo de Fluxo

**Pedido do usuário:** "Adicione extração de doses de medicamentos no resumo."

**Execução da skill:**
1. Identifico o prompt-alvo: `SYSTEM_INSTRUCTION` em `automacao-transcricoes/Code.js`.
2. Leio o prompt e identifico que existem 8 Ações e 5 Normas.
3. Classifico como `ADIÇÃO`.
4. Verifico que a Norma 1 ("Contenção Teórica") proíbe inferir dados não declarados pelo docente — a nova extração deve respeitar isso.
5. Proponho adicionar uma sub-seção em "Correlação Clínica" (Ação 6) com o formato: `[Fármaco] → [Dose citada] → [Via de administração]`.
6. Verifico que preciso adicionar um bloco correspondente na Saída (Seção 5).
7. Apresento o diff ao usuário para aprovação.
8. Após aprovação, aplico a edição.
9. Registro no `system_log.md`.
