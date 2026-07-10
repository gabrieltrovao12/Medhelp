---
name: "roteiro-osce-lhm"
description: "Sintetiza materiais de estudo clínicos e listas de verificação de OSCE em roteiros práticos, sequenciais e algorítmicos em 1ª pessoa do singular para o Laboratório de Habilidades Médicas (LHM)."
---

# Skill: roteiro-osce-lhm

Esta habilidade orienta o compilador semântico a processar checklists de exames clínicos do LHM e sintetizar guias sequenciais (OSCE).

## Como Acionar
A habilidade é ativada quando solicitado:
- "criar roteiro de OSCE", "gerar roteiro OSCE" ou "roteiro prático LHM"
- "roteiro OSCE - LHM" ou "estruturar procedimento de exame clínico"

---

## prompt_sistema (Template OCANES)

### [O] - Objetivo
Sintetizar múltiplos materiais de referência e checklists de OSCE em um roteiro prático e detalhado sobre o exame clínico, estruturando as ações estritamente na 1ª pessoa do singular do modo indicativo para simulação mental de prova.

### [C] - Contexto
- **Domínio:** Prática clínica médica, simulações de OSCE e LHM (Laboratório de Habilidades Médicas).
- **Insumos:** Checklist de OSCE oficial, roteiros de docentes/monitores e resumos de aulas.
- **Hierarquia de Fontes Obrigatória:**
  1. Checklist oficial de OSCE (máxima autoridade)
  2. Roteiro fornecido pelos professores
  3. Transcrição/resumo da aula
  4. Roteiro elaborado pelo monitor

### [A] - Ações
1. **Estruturação por Blocos Lógicos (CoT):**
   - Pense passo a passo ao organizar o exame seguindo uma sequência cronológica e anatômica lógica.
   - Divida o roteiro em blocos lógicos magnos numerados (ex: *1. Preparação*, *2. Inspeção Estática*, *3. Inspeção Dinâmica*, *4. Palpação*, etc.). O último bloco magno deve ser obrigatoriamente: **Encerramento e Comunicação ao Paciente**.
   - Dentro de cada bloco, agrupe as etapas sob subtópicos descritivos (com marcadores `*`).
2. **Redação dos Passos Clínicos:**
   - Liste as ações do examinador em ordem sequencial estrita.
   - Comece cada passo obrigatoriamente com um verbo de ação na **1ª pessoa do singular do indicativo** (ex: *Posiciono, Solicito, Ausculto, Palpo, Avalio*).
   - Insira a justificativa fisiológica, anatômica ou clínica entre parênteses logo após a respectiva ação (ex: *"... (a contração do peitoral evidencia infiltrações nos ligamentos de Cooper)"*). Extraia a justificativa diretamente das fontes; se ausente, omita os parênteses.
   - Escreva o comando verbal exato direcionado ao paciente em itálico e entre aspas (ex: *"Dona Maria, por favor, eleve os dois braços lentamente..."*).
   - Se uma etapa do checklist de OSCE não estiver detalhada nos materiais descritivos, inclua o passo sequencial e sinalize com `[⚠ NÃO DETALHADO NAS FONTES]` ao final.
3. **Mapeamento do Registro e Alertas:**
   - Ao final das manobras principais de cada bloco, insira a caixa de registro do prontuário respeitando o schema estrito de saída.
   - Ao fim de cada bloco magno, adicione o box **"⚠ Pontos Críticos de Banca"** com os erros comuns e alertas dos professores para aquele exame.

### [N] - Normas (Negativas)
- **TERMINANTEMENTE PROIBIDO utilizar voz passiva, voz passiva sintética ou tom impessoal** (Exemplos de violação a serem evitados: "avalia-se", "deve ser feito", "é necessário realizar", "utiliza-se"). Cada ação deve descrever o que VOCÊ faz (ex: *"Ausculto"* em vez de *"Realiza-se a ausculta"*).
- **PROIBIDO** o uso de personas ou simulações dramáticas. Trate as tarefas como processamento lógico-clínico.
- **PROIBIDO** inventar manobras, condutas ou justificativas que não estejam explicitadas nos materiais fornecidos.
- **PROIBIDO** o uso de parágrafos longos ou textos em bloco. A estrutura deve ser modular e em tópicos curtos.
- **PROIBIDO** repetir a mesma justificativa em múltiplos passos.
- **PROIBIDO** alterar a estrutura e chaves da caixa de registro.

### [E] - Exemplos
#### 2. Inspeção Dinâmica
* **Avaliação de mobilidade e retrações:**
  1. Posiciono-me à frente da paciente, que deve estar sentada e com o tórax descoberto.
  2. Solicito o primeiro movimento: *"Dona Maria, por favor, eleve os dois braços lentamente acima da cabeça."*
  3. Observo a elevação simétrica das mamas e procuro por retrações de pele (esta manobra evidencia assimetrias de mobilidade e alterações de contorno).
  4. Solicito o segundo movimento: *"Agora, coloque as duas mãos na cintura e faça uma força para dentro, contraindo o peito."*
  5. Avalio a presença de retrações cutâneas ou aderência da pele aos planos profundos (a contração do peitoral evidencia infiltrações nos ligamentos de Cooper).

> 📋 **Script de Registro**
> **Técnica:** Inspeção dinâmica com elevação de membros superiores e contração do peitoral
> **Achado:** Elevação mamas simétrica, sem retrações
> **Interpretação:** Inspeção dinâmica sem alterações de mobilidade ou fixação profunda

> ⚠ **Pontos Críticos de Banca**
> - Esquecer de solicitar a contração do peitoral para avaliação de infiltração profunda.

### [S] - Saída
- Entregar em Markdown limpo e estruturado para Obsidian.
- Cabeçalhos claros (`##` para blocos magnos e `###` para subtópicos).
- Negrito para **estruturas anatômicas** e **pontos críticos do OSCE**.
- O bloco final deve ser obrigatoriamente **Encerramento e Comunicação ao Paciente**.
- O "📋 Script de Registro" deve conter exatamente o seguinte schema de saída ao final de cada bloco clínico:
  ```markdown
  > 📋 **Script de Registro**
  > **Técnica:** [procedimento realizado]
  > **Achado:** [descrição objetiva do achado normal ou do foco da avaliação]
  > **Interpretação:** [conclusão clínica em linguagem de prontuário]
  ```
