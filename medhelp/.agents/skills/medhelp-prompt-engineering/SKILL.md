---
name: "medhelp-prompt-engineering"
description: "Manual definitivo de engenharia de prompts OCANES no Medhelp. Usar para criar, refatorar, depurar ou otimizar system instructions (prompts) para LLMs (Gemini, etc). Aborda o framework OCANES, extração de dados estruturados (JSON/Markdown), redução de tokens e mitigação de alucinações."
---

# Skill: medhelp-prompt-engineering (Engenharia de Prompts Medhelp)

## 1. Visão Geral
Esta skill consolida as melhores práticas de Engenharia de Prompts adaptadas para as restrições e padrões do projeto Medhelp. Deve ser acionada sempre que for necessário criar ou alterar um prompt (como em `automacao-transcricoes/Code.js`, `flashcards/Código.js` ou `pre-transcricao/Código.js`).

## 2. O Framework OCANES (Obrigatório)
Qualquer prompt no Medhelp deve seguir estritamente o framework OCANES para controle de entropia. Evite personas ("Aja como um médico"), trate o LLM como um compilador semântico.

*   **[O] - Objetivo**: Definição unívoca e matemática do vetor direcional. O que deve ser alcançado.
*   **[C] - Contexto**: Metadados, premissas do domínio e limites (ground truth). Ex: Forneça slides/transcrições.
*   **[A] - Ações**: Etapas sequenciais (Chain of Thought). Mapeamento granular das tarefas.
*   **[N] - Normas (Guardrails)**: Proibições, regras de formato, limites de segurança. Exija fallback para dúvidas (ex: `DADO_AUSENTE`).
*   **[E] - Exemplos**: Few-shot prompting. Amostras pareadas de entrada e saída.
*   **[S] - Saída**: Formato final (Markdown, JSON, XML). Sem saudações ou explicações.

### 2.1. Otimização e Compressão (Técnicas Adicionais)
- **Chain of Thought (CoT)**: Em tarefas lógicas, inclua na Ação instruções como "Pense passo a passo".
- **Redução de Hallucination**: Em Normas, adicione: "Responda baseando-se APENAS no contexto fornecido. Se a resposta não estiver no contexto, retorne 'INFORMAÇÃO_INEXISTENTE'".
- **Compressão**: Remova verborragia ("Por favor, você poderia analisar...") e use linguagem imperativa ("Analise:").

## 3. Saídas Estruturadas (Structured Output)
Quando o pipeline (ex: Apps Script) exigir que o LLM retorne dados estruturados em vez de texto livre, siga as seguintes regras de extração:

1. **Definição de Schema**: Especifique todas as chaves desejadas na seção `[S] - Saída` ou `[N] - Normas`. No Gemini, utilize `generationConfig.responseSchema` se aplicável via API.
2. **Descrições de Campos**: Nunca use chaves genéricas como `status`. Use algo como `status (string): Indica o estado, deve ser 'ativo' ou 'inativo'`. As descrições funcionam como parte do prompt.
3. **Markdown Limpo**: Se pedir tabelas ou blocos YAML/JSON, defina nas Normas que o modelo NUNCA deve incluir blocos Markdown englobantes (ex: ````json`) caso o código consumidor não faça o parse.
4. **Validação**: Ensine o código consumidor a lidar com falhas de schema ou ausência de campos (usando try/catch no `JSON.parse` ou tratamento de strings).

## 4. Protocolo de Refatoração (Alteração de Prompts Existentes)

### FASE 1 — Diagnóstico e Classificação
1. Identifique o prompt-alvo. Leia o código atual. Conte as Ações (`[A]`) e Normas (`[N]`).
2. Classifique a mudança: ADIÇÃO, MODIFICAÇÃO, REMOÇÃO, CORREÇÃO.
3. Avalie o impacto cruzado: A nova ação entra em conflito com alguma norma?

### FASE 2 — Planejamento
1. Apresente ao usuário (via Diff ou markdown) como ficará o prompt modificado, com justificativa.
2. Verifique:
   - A nova Ação está na ordem correta?
   - Os escapes de template string (ex: `\\n`, `\\` no GAS) estão corretos?
   - O limite de tokens aumentou muito?

### FASE 3 — Execução e Validação
1. Modifique o código. NÃO substitua o prompt inteiro se a alteração for cirúrgica.
2. Não delete comentários existentes a não ser que os altere.
3. Após editar, revise logicamente: O prompt continua fluindo da Ação 1 para a última sem contradições? O bloco de Saída contém chaves referenciadas nas Ações novas?
4. Registre a mudança em `system_log.md`.

## 5. Exemplo Rápido de Prompt OCANES Otimizado

```
[O]
Extrair dados vitais do texto do paciente.

[C]
Texto bruto transcrito de atendimento emergencial.

[A]
1. Identifique a Pressão Arterial (PA).
2. Identifique a Frequência Cardíaca (FC).

[N]
- Não invente dados.
- Se não houver o dado no texto, retorne 'DADO_AUSENTE'.
- Retorne apenas em formato JSON.

[E]
Input: "Paciente chegou com PA 12 por 8 e FC 90"
Output: {"PA": "120/80", "FC": "90"}

[S]
Retornar um objeto JSON com as chaves "PA" e "FC".
```
