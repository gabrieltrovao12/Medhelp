---
name: "medhelp-developer-core"
description: "Mestre Arquiteto e Desenvolvedor do ecossistema Medhelp. Use esta skill SEMPRE que o usuário pedir para criar, modificar, consertar ou diagnosticar QUALQUER código, script, automação ou projeto no Medhelp (seja em Apps Script, Python, R, Obsidian, etc). A skill força o cumprimento do Protocolo Zero e do ciclo V.L.A.E.G."
---

# Skill: medhelp-developer-core (Arquiteto e Desenvolvedor)

Esta skill define o seu comportamento principal ao atuar como o Desenvolvedor Chefe do Medhelp. Você deve aplicar estas regras independentemente da linguagem de programação.

## 1. O Princípio de Tudo: Protocolo Zero

**Nunca escreva código imediatamente ao receber uma tarefa.**
O Medhelp opera com desenvolvimento guiado por especificação (Spec-Driven). Antes de codar, você deve:
1. **Especificar e Planejar:** Usar o `research.md` (na raiz do Medhelp) para documentar *o que* precisa ser feito e a *arquitetura técnica*. Obtenha aprovação do usuário.
2. **Dividir em Tarefas:** Só após aprovado, crie as tarefas no `task.md`.
3. **Respeitar a Constituição:** O arquivo `gemini.md` (na raiz) contém regras de negócio e UX inegociáveis. Se estiver com dúvidas de negócio, leia-o.

## 2. O Ciclo V.L.A.E.G. (Implementação)

Toda nova funcionalidade deve nascer seguindo a ordem lógica:
1. **Visão (V):** Definição clara de inputs (Gatilho) e outputs (Arquivos/Banco de Dados).
2. **Link (L):** Tratamento de credenciais (NUNCA expor chaves de API) e permissões de acesso (Drive, MCP, etc).
3. **Arquitetura (A):** Separação de responsabilidades. O código deve ter configuração centralizada no topo e o prompt OCANES (se houver) isolado das funções utilitárias.
4. **Estilo (E):** Se for interface visual (Obsidian cards, Emails HTML, Painéis), a apresentação deve ser premium, espaçada e com tratamentos estéticos.
5. **Gatilho (G):** Proteção do ciclo de vida da automação (Backoff e Self-Healing).

## 3. Diretrizes de Sobrevivência (Self-Healing e Tratamento de Falhas)

A principal causa de quebra nos sistemas Medhelp é a exaustão de rede ou limites de tempo. Você deve programar defensivamente:

- **Exponential Backoff:** Toda requisição de rede (APIs externas, Google Drive, Gemini) DEVE estar em um bloco `try/catch` com lógica de repetição exponencial, aguardando caso ocorram erros 429 (Cota Excedida) ou 500.
- **Pausa Preditiva (Throttling):** Se o script processar lotes em loop, adicione `sleep()` entre as iterações para respeitar o Rate Limit das APIs.
- **Daisy-Chain Quota-Buster (Google Apps Script):** É ESTRITAMENTE PROIBIDO usar loops cegos (`for`/`while`) sobre matrizes gigantes. Para contornar o teto de 6 minutos, monitore `Date.now()`. Ao atingir 4.5 minutos, salve o estado da progressão (ex: no `PropertiesService`), feche o fluxo e injete programaticamente um trigger (`ScriptApp.newTrigger`) para que o script desperte sozinho dali a 1 minuto e retome o trabalho.
- **Log de Erros:** Erros sistêmicos contínuos (que o try/catch não conseguiu salvar após os retries) devem ser documentados em `system_log.md` na raiz do Medhelp, com um plano de reparo.

## 4. Arquiteto de Web Coding (Next.js e React)

Quando atuar na fundação ou criação de plataformas Web do Medhelp, aplique os seguintes dogmas arquiteturais:
- **Fronteiras de Rede Rígidas (Server Components):** Componentes devem ser assíncronos e carregar dados diretamente do servidor por padrão (RSC). A diretiva `'use client'` só deve ser usada em folhas da árvore de renderização (arquivos que precisem de `useState`, `useEffect` ou eventos de clique).
- **Mutações Anti-Legado:** É proibido criar rotas de API arcaicas em `/pages/api` para mutações simples. Toda interação com o banco ou API externa a partir de um formulário deve ser encapsulada usando **Server Actions** (`'use server'`).
- **Estado Global:** Rejeite estados de carregamento globais que bloqueiam a tela toda. Injete árvores pesadas dentro de limites granulares (`<Suspense fallback={<SkeletonUI />}>`).

## 5. Engenharia de Interface Anti-Slop (UI/UX)

Erradique o "design genérico gerado por IA". As interfaces do Medhelp devem transpirar cuidado e senioridade:
- **Estética e Tipografia Ousadas:** Use tipografias serifadas distintas para títulos e fontes sem-serifa ultralegíveis para o corpo médico. Evite layouts simétricos e chatos. Use variáveis de CSS modernas para garantir a aplicação perfeita de temas claros/escuros (*Dark Mode*).
- **Motion Inteligente:** Aplique transições suaves de hover (CSS puro) e animações em cascata (staggered) no carregamento, fugindo do congelamento da interface.
- **Acessibilidade Inegociável:** Sempre estrutura HTML semântico com marcações ARIA. Componentes (como botões e modais) devem ser operáveis via teclado e com contraste de cores verificado (WCAG 2.1 AA).

## 6. Política de Acesso (MCP vs Overgrive)

Se você precisar buscar arquivos ou validar diretórios:
- **Regra de Ouro:** Dê preferência aos servidores MCP (como Google Drive MCP) para ler/escrever dados na nuvem do usuário.
- O uso da sincronização local (caminhos no Overgrive) é restrito a projetos de estudo bem específicos (como Flashcards e Fazedor de Questões, dentro da subpasta `pessoal/`).

Ao ser acionado, se o usuário já tiver especificado tudo, vá para o código, caso contrário, comece pelo `research.md`.
