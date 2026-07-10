# Regras de Customização do Projeto - Medhelp (Framework OCANES & Protocolo V.L.A.E.G.)

Este arquivo define as regras de comportamento e desenvolvimento que o assistente Antigravity deve seguir rigorosamente durante a manutenção e evolução deste repositório.

## 1. Engenharia de Prompts (Framework OCANES)
Ao criar, depurar ou evoluir qualquer prompt para as integrações com LLMs (como o prompt em `automacao-transcricoes/Code.js` ou `flashcards/Código.js`), siga as diretrizes abaixo para mitigar a entropia inferencial e evitar o colapso dos pesos de atenção (*attention heads*):

*   **[O] - Objetivo**: Defina de forma unívoca o vetor direcional da tarefa. **Nunca utilize personas ou simulação de papéis** (ex: "Aja como um médico"), pois isso injeta ruído estocástico e viés tonal. Trate o modelo como um compilador semântico subordinado a objetivos objetivos.
*   **[C] - Contexto**: Forneça os limites epistemológicos da tarefa. Insira o conteúdo de slides, transcrições ou PDFs como verdade terrestre absoluta (*ground truth*), proibindo explicitamente o uso de dados externos.
*   **[A] - Ações**: Mapeie sequencialmente e de forma granular as suboperações mecânicas da tarefa, induzindo o raciocínio por etapas (*Chain of Thought*).
*   **[N] - Normas (Guardrails e Restrições)**: Agrupe todas as proibições e limites de segurança de forma isolada das ações. Use *Negative Prompting* estrito para impedir alucinações. Se um dado estiver ausente ou incerto, exija um retorno determinístico predefinido (ex: `DADO_AUSENTE` ou `INFORMAÇÃO_INEXISTENTE`) e a suspensão da inferência criativa.
*   **[E] - Exemplos**: Inclua amostras empíricas pareadas de entradas e saídas esperadas (*Few-Shot Prompting*) para fixar o estilo e a topologia sintática da resposta.
*   **[S] - Saída**: Envelope o resultado final em formatos rígidos (como tabelas Markdown, objetos JSON ou YAML) e exija a eliminação completa de saudações, explicações introdutórias ou notas de rodapé educadas.

---

## 2. Lógica e Ciclo de Desenvolvimento (Protocolo V.L.A.E.G. & Protocolo Zero)
Para evitar desorganização informacional nos diretórios e perda de coesão do código, adote os protocolos de desenvolvimento abaixo:

### A. Protocolo Zero (Alocação Prévia de Memória)
**Antes de escrever qualquer código lógico ou operacional**, o agente deve criar ou atualizar os 4 arquivos de fundação e obter o alinhamento com o usuário:
1.  **[task.md](file:///home/vvgfilhos/medhelp/task.md)**: Lista de tarefas a fazer, em andamento e concluídas, registrando a fase atual do projeto.
2.  **[research.md](file:///home/vvgfilhos/medhelp/research.md)**: Compilação de achados técnicos, documentação de APIs utilizadas, limites de cotas e regras de comunicação.
3.  **[system_log.md](file:///home/vvgfilhos/medhelp/system_log.md)**: Log de erros sistêmicos observados nos testes locais e os respectivos planos de reparo.
4.  **[gemini.md](file:///home/vvgfilhos/medhelp/gemini.md)**: O esquema de dados estruturado, mapeamento de variáveis, regras de negócio inflexíveis e a arquitetura geral do ecossistema.

### B. Ciclo Sequencial V.L.A.E.G.
Toda funcionalidade nova deve ser implementada respeitando a progressão das seguintes etapas:

1.  **Visão (V)**: Mapeamento de entradas e saídas de dados, definindo o escopo exato das integrações com serviços do Drive, Sheets, Gmail ou APIs externas.
2.  **Link (L)**: Validação e checagem antecipada de credenciais, chaves de API (`GEMINI_API_KEY`) e tokens de acesso para garantir conectividade robusta antes de codificar regras de negócio complexas.
3.  **Arquitetura (A)**: Planejamento e organização dos diretórios, separação lógica entre scripts de back-end (geralmente Python) e scripts de automação/front-end (Apps Script/Node.js).
4.  **Estilo (E)**: Refinamento visual da apresentação. Para emails gerados e painéis do Obsidian, aplique cabeçalhos com cromática contrastante escurecida, diagramação visualmente rica e links comerciais (ex: direcionamento direto para chats de WhatsApp com chancelas profissionais).
5.  **Gatilho (G)**: Automação do ciclo operacional através de webhooks, tarefas agendadas (GAS triggers) ou loops de escuta periódica (ex: o script "Vigia" rodando ciclicamente no servidor local ou em nuvem), acoplando rotinas de autocorreção em tempo de execução para falhas de rede ou limites de requisição.

---

## 3. Revisão de Código e Tratamento de Erros (Debugging & Self-Healing)
Ao analisar, depurar ou evoluir qualquer código na estrutura do projeto, siga as diretrizes abaixo para detecção precoce de anomalias logísticas e correção de falhas de execução:

*   **Detecção de Causa Raiz e Mitigação**:
    *   **Limites de Cota de API (Erro 429/Exaustão)**: Priorize a implementação de mecanismos defensivos de sleep estruturado com *Exponential Backoff* ou alteração dinâmica de modelos (ex: fazer transição para o `gemini-2.5-flash` ou `gemini-3-flash` caso a cota do `gemini-3.1-pro` se esgote).
    *   **Estouro de Tempo Limite (GAS Timeout)**: Para automações do Apps Script limitadas ao teto de 6 minutos de runtime, monitore rigorosamente a janela temporal decorrida (usando `Date.now()`) e realize a interrupção segura e controlada da execução antes do tempo limite (ex: 4.5 minutos), garantindo o salvamento e o processamento do lote residual na próxima iteração do ciclo agendado.
    *   **Tratamento de Exceções**: Imponha estruturas de `try/catch` robustas em todas as integrações de rede e I/O de arquivos. Capture erros silenciosos e registre-os de forma clara para que o fluxo de execução não quebre o pipeline de processamento em lote.
*   **Log de Erros e Histórico**:
    *   Toda falha interceptada durante simulações ou testes locais deve ser imediatamente catalogada com detalhes técnicos no arquivo [system_log.md](file:///home/vvgfilhos/medhelp/system_log.md).
    *   A documentação do erro deve incluir o arquivo de origem, a descrição do comportamento anormal, a causa-raiz identificada e as correções lógicas aplicadas.
*   **Protocolo de Validação de Laboratório**:
    *   Antes de propor o deploy final das automações (como `clasp push` no Apps Script), execute testes unitários e simulações com dados sintéticos no diretório temporário para comprovar a estabilidade do fluxo de dados.
    *   Verifique sempre a efetivação física de salvamento dos arquivos no disco rígido local (eliminando pendências visuais no editor com Ctrl+S) e force o recarregamento do espaço de trabalho (Reload Window) ao modificar drivers, tokens de credenciais ou arquivos `mcp_config.json`.
    *   **Polimento dos "Dez Por Cento"**: Entenda que testes automatizados cobrem apenas a estabilidade de backend. Para a experiência de visualização final (seja em emails em HTML ou cards de Obsidian), realize o polimento fino de layouts sobrepostos, espaçamentos, chaves monetárias (R$) e fluidez de navegação.

---

## 4. Política de Acesso a Arquivos (MCP vs Overgrive)
* **Regra de Ouro:** É terminantemente proibido utilizar a pasta local mapeada pelo Overgrive para procurar arquivos como padrão no ambiente Medhelp. 
* **Padrão de Busca:** Utilize SEMPRE as ferramentas do MCP (como o MCP do Google Drive e outros servidores configurados) para interações e buscas na nuvem.
* **Exceções Permitidas:** O uso da sincronização local (Overgrive) só está autorizado exclusivamente para os projetos pessoais de **Flashcards** e do **Fazedor de Questões**. Para todo o restante do ecossistema, o uso do MCP é obrigatório.
