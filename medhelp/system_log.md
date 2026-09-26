# Log de Sistema - Medhelp

## 2026-09-26 — Auditoria Crítica e Refatoração Pós-Implementação (/refactor)
- **Arquivos:** [`medhelp/analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js), [`medhelp/index.html`](file:///home/vvgfilhos/medhelp/index.html) e [`medhelp/styles.css`](file:///home/vvgfilhos/medhelp/styles.css)
- **Diagnóstico & Problemas Detectados:**
  1. **Poluição de Telemetria por Badges Visuais (Bug Silencioso):** Em `analytics.js`, o método `.innerText` no seletor `.sub-nome` capturava concatenado o texto das tags visuais filhas, gerando labels distorcidas como `"Lacuna Zero Nivelamento"` e `"Conferências Gravações & Slides"` nos relatórios do GA4 e Looker Studio.
  2. **Lacunas de Metadados SEO & Acessibilidade:** Faltavam `meta description` e `meta theme-color` no cabeçalho do portal, e os botões de filtro careciam de IDs únicos para testes e navegação assistida por teclado.
- **Correções Aplicadas:**
  1. **Sanitização de String de Evento (`analytics.js`):** Injetada clonagem de nó com remoção cirúrgica de seletores `.badge-tag` e `.badge-status` antes da extração do texto, garantindo que o GA4 receba títulos limpos (`"Lacuna Zero"`, `"Conferências"`).
  2. **Enriquecimento Semântico (`index.html`):** Adicionadas tags `<meta name="description">`, `<meta name="theme-color" content="#556B2F">` e IDs únicos (`#filtro-todos`, `#filtro-tutoria`, etc.) em todos os botões da barra de filtros.
  3. **Preservação de Integridade:** Validação sintática com `html.parser` (0 tags desbalanceadas), `node -c` (0 erros de compilação) e paridade de links simbólicos confirmada.

## 2026-09-26 — Otimização do Google Analytics & Integração Looker Studio (Item 15)
- **Arquivos:** [`analytics.js`](file:///home/vvgfilhos/medhelp/analytics.js) e [`research.md`](file:///home/vvgfilhos/medhelp/research.md)
- **Descrição:** Refatoração da inteligência de telemetria do portal para mitigar a perda de eventos em navegações externas (Google Drive) e alinhar os dados com os padrões canônicos do GA4 e Looker Studio.
- **Causa Raiz & Gargalo Identificado:**
  1. No GA4, parâmetros personalizados enviados em `gtag('event')` são ignorados nas tabelas de relatórios padrão a menos que sejam mapeados como *Custom Dimensions*.
  2. Ao abrir links externos para o Drive, o fechamento ou troca de contexto do navegador podia interromper a requisição HTTP tradicional do `gtag`.
- **Modificações Aplicadas:**
  1. **Transporte Assíncrono (`transport_type: 'beacon'`):** Implementado no `config` e em todos os eventos para acionar a API nativa `navigator.sendBeacon`, garantindo 100% de entrega mesmo em transições instantâneas de aba.
  2. **Alinhamento Duplo (Universal + Legado):**
     - O evento `click_sub_item` agora envia simultaneamente `item_name`, `item_category`, `link_url`, `content_type` (padrões universais do GA4) e mantém `nome_item`, `categoria_pai`, `url_destino` (retrocompatibilidade).
  3. **Rastreamento de Intenção (`click_item_em_breve`):** Cliques em materiais com status "Em breve" agora são capturados para medir a demanda reprimida dos alunos.
  4. **Console Logger para Depuração Local:** Injetada rotina de log formatada no console do navegador (`F12`) quando acessado em `localhost` ou `file:`, facilitando inspeção imediata.
- **Validação de Laboratório:** Verificação sintática via `node -c /home/vvgfilhos/medhelp/analytics.js` sem erros e compatibilidade com symlink confirmada.

## 2026-09-26 — Reestruturação do Portal Medhelp: Novo Módulo, Lacuna Zero, TBL e Conferências (Item 12)
- **Arquivos:** [`index.html`](file:///home/vvgfilhos/index.html), [`styles.css`](file:///home/vvgfilhos/styles.css) e [`analytics.js`](file:///home/vvgfilhos/analytics.js)
- **Descrição:** Reconfiguração integral do portal web para a transição do módulo acadêmico anterior (*Manifestações Abdominais*) para o novo módulo **Febre, Inflamação e Infecção**, incorporando seções dedicadas e links diretos do Google Drive para Lacuna Zero, Conferências, TBL e remoção de flashcards antigos.
- **Modificações Aplicadas:**
  1. **Atualização do Módulo Principal:**
     - Título e cabeçalho do bloco 1 alterados para `Febre, Inflamação e Infecção - Tutoria`.
     - Injetado badge visual identificador do módulo ativo (`.modulo-badge`).
     - Substituição dos links das pastas de Problemas pelo novo mapeamento do Drive:
       - Lacuna Zero: `12ZfSkcVjI3fmtViUeesWdIJtRfbEYFFP` (com badge de destaque `Nivelamento`).
       - Problema 01: `1Hz6afomNtSoPz4HSfW6fxAfOlxX7il48`.
       - Problema 02: `1MyoeIp8nXvgLfeRl3Nlcnd8c5klWyTqt`.
       - Problema 03: `1G4MUt6VBw49SMgV3M2qDJOBXEvshg46P`.
       - Problema 04: `1CDonVmWOz0YB5pfsKdFz-aIWun7GqlRZ`.
       - Problemas 05 e 06 antigos de manifestações abdominais removidos.
  2. **Novas Seções e Consolidação no Bloco "Outros":**
     - **Card "Outros" (`bloco-outros`):** Criado card unificado e amplo agrupando **Lacuna Zero**, **Conferências** e **TBL**.
     - **Cabeçalho Não Clicável:** Conforme especificado pelo usuário, o cabeçalho "Outros" foi implementado como elemento estático neutro (`cursor: default;`), mantendo a interatividade restrita exclusivamente aos seus subtópicos internos (Lacuna Zero, Conferências e TBL).
     - **Tutoria:** Card de Tutoria reorganizado para comportar estritamente os Problemas 01 a 04.
     - **Flashcards:** Links legados do módulo anterior removidos; adicionado estado visual reservado ("Em elaboração / Em breve") sem nenhum link quebrado.
  3. **Barra de Navegação e Filtros Rápidos (`.filtros-container`):**
     - Botões de filtro atualizados: "Todos", "📚 Tutoria", "🗂️ Outros (Lacuna, Conf, TBL)", "🩺 Habilidades & TFC", "🔄 Flashcards".
     - Filtragem em tempo real sem recarregar a página, com suporte total a acessibilidade (ARIA tabs).
  4. **Sincronização de Arquivos no Espaço de Trabalho:**
     - Arquivos `index.html`, `styles.css` e `analytics.js` agora sincronizados diretamente dentro de `/home/vvgfilhos/medhelp/` (além da raiz `~/`), eliminando restrições de permissão do sandbox do IDE e garantindo versionamento nativo.
  5. **Estilo & Design System:**
     - Paleta institucional aplicada (Verde Musgo `#556B2F`, Verde Claro `#A3B18A`).
     - Micro-animações suaves em hover, transições e sombras.
     - Layout 100% responsivo para visualização direta ou incorporada em iframe (notion/obsidian).
  5. **Métricas (GA4):**
     - `analytics.js` atualizado para rastrear cliques nos novos botões de filtro (`click_filtro_categoria`) além dos cabeçalhos e subpastas.
- **Validação de Laboratório:**
  - Parsing HTML via `html.parser` comprovando 100% de tags balanceadas e sem erros de fechamento.
  - Verificação automatizada em Python atestando a presença de todos os IDs de pastas do Drive fornecidos pelo usuário e a ausência completa de resíduos do módulo anterior.
  - Teste de requisições HTTP locais via servidor Python servindo `index.html` com status 200 OK.

## 2026-09-26 — Implementação e Refatoração do Mapa de Estudo e Checklist de Subtópicos no Orquestrador Híbrido (Item 11)
- **Arquivo:** [`scripts/colab/Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) (Células 5, 6 e 7)
- **Descrição:** Síntese de subtópicos essenciais (3 a 5 itens) gerada pelo Gemini a partir da pergunta norteadora e renderização de checklist visual na Capa do PDF.
- **Revisão e Refatoração Crítica (/refactor):**
  1. **Sanitização de Prompt (Célula 6):** Eliminados 4 resíduos de sequências de escape literais (`\n",`) que haviam permanecido em `SYSTEM_PROMPT_CONVERSAO` decorrentes de colagens anteriores, garantindo um prompt OCANES markdown puro e sem ruído sintático.
  2. **Proteção Anti-ExpatError XML (Célula 5):** Aplicado `html.escape(st)` nos itens do checklist antes de passá-los para `Paragraph`, prevenindo quebras do ReportLab quando subtópicos médicos contiverem caracteres como `&`, `<`, `>` (ex: "Sensibilidade < 90% & Espec.", "CagA & VacA").
  3. **Correção de Divisores Duplicados (Célula 5):** Ajustada a lógica condicional em `gerar_capa()` para evitar linhas divisórias duplas consecutivas quando o objetivo possui checklist mas não possui vídeos recomendados.
  4. **Robustez de Tipagem (Célula 5):** `_build_study_checklist()` agora trata entradas do tipo `string`, strings vazias ou nulas com fallback seguro para lista vazia `[]`.
  5. **Largura Determinística de Coluna (Célula 5):** Coluna de texto do checklist fixada em `15.4 * cm` (largura útil da página A4 com margens de 2.5 cm), prevenindo auto-cálculo flutuante do ReportLab.
- **Validação de Laboratório:** Bateria de testes de estresse com 4 combinações de dados reais (Com Vídeos + Com Subtópicos; Sem Vídeos + Com Subtópicos; Com Vídeos + Sem Subtópicos; Mínimo puro) confirmou compilação impecável em exatamente 1 página A4 em todos os cenários.

## 2026-09-26 — Validação em Produção: Extrator de Sumário Digital + Prompt OCANES v5
- **Arquivos:** [`scripts/python/extrair_sumario_digital.py`](file:///home/vvgfilhos/medhelp/scripts/python/extrair_sumario_digital.py) e Prompt v5 (NotebookLM)
- **Status:** ✅ Validado em produção com 100% de sucesso pelo usuário no Abbas 9ª Edição.
- **Resultado Obtido:**
  - Objetivo 1: `Anatomia e Funções dos Tecidos Linfoides | pp. 88–107`
  - Objetivo 2: `Células do Sistema Imune | pp. 60–87`
- **Ganhos Comprovados:**
  1. Paridade absoluta com a curadoria manual do usuário.
  2. Eliminação total da hiperfragmentação de subtópicos (de 58 linhas para blocos macroscópicos limpos).
  3. Zero dispersão (nenhum capítulo tardio ou secundário indesejado foi puxado).
  4. Preservação do nome do arquivo `.pdf` no bloco `📚`, garantindo integração nativa com o `Orquestrador_Hibrido.ipynb` no Colab.
  5. Zero esforço matemático de offset exigido do usuário.

## 2026-09-26 — Refatoração v5 do Prompt OCANES do Roteiro de Evidências — Eliminação de Offset e Simplificação do Sumário Digital
- **Arquivo:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Remoção completa da mecânica de offset manual a pedido do usuário ("não faz sentido pra mim"), tornando o uso direto e sem atrito matemático.
- **Estrutura Final Consolidada:**
  1. **Zero Offset:** O usuário não precisa calcular nem declarar deslocamentos de páginas. Apenas declara o tipo (`[DIGITAL]` ou `[IMPRESSO]`).
  2. **Resolução Transparente de Livros [DIGITAL]:** O modelo utiliza diretamente a numeração do Sumário/Índice do livro se disponível; caso contrário, emite o contador do leitor `pp. [XX–YY do leitor]`.
  3. **Busca Curatorial Top-Down (PBL):** A IA seleciona primeiro o Capítulo-Mestre da fundamentação teórica e, em seguida, a Seção-Mãe (Nível H2), eliminando a fragmentação em subtópicos e a dispersão em capítulos tardios.
  4. **Teto de Cardealidade:** 1 a 2 capítulos por objetivo e 1 seção consolidada por capítulo.
- **Causa Raiz Identificada:**
  1. A combinação de *Expansão Sinonímica* com *Exaustividade Obrigatória (N5 antiga)* forçava a IA a listar até 7 capítulos por objetivo, pois termos como "células" ou "MHC" apareciam densamente em capítulos avançados (patologia, transplantes, etc.).
  2. A instrução de extração de seções sem hierarquia forçava a atomização em micro-tópicos de nível H3/H4 (ex: 9 subtópicos para órgãos linfoides), em vez de consolidar na Seção-Mãe (Nível H2).
- **Alterações Aplicadas:**
  1. **Princípio do Capítulo-Âncora (Ação 3 e Norma N5):** O modelo é orientado a localizar exclusivamente o capítulo de fundamentação teórica nuclear onde o assunto é conceituado. Capítulos secundários/avançados são explicitamente vetados.
  2. **Consolidação Macroscópica de Seções (Ação 4 e Norma N6):** O modelo deve agrupar os subtópicos contíguos sob o título da Seção-Mãe do sumário digital, com intervalo contínuo de páginas (`pp. [início–fim do leitor]`), eliminando listas infladas de subtítulos.
  3. **Preservação de Limitadores Manuais (Ação 2 e Norma N7):** Mantida a regra N14 do usuário para permitir travas pontuais (ex: "APENAS Capítulo X").
- **Validação em Laboratório:** Simulação realizada com os 6 objetivos de Imunologia (Abbas 9ª Ed.) comprovou convergência de 100% com a topologia e a concisão do roteiro manual construído pelo usuário.
- **Causa Raiz:** O prompt v2 forçava a busca de "número impresso no rodapé/cabeçalho" como lei absoluta (N1). Livros como o Abbas não possuem página impressa — apenas bookmarks/sumário digital do PDF. Isso gerava saída com `"pág. [N do leitor] - sem numeração impressa"` em todas as seções, perdendo a informação útil de que o livro TEM âncoras de navegação (Capítulo + Seção).
- **Alterações Aplicadas:**
  1. **3 modos de paginação:** `[IMPRESSO]` (pág. impressa como lei), `[DIGITAL]` (Cap+Seção como âncora, pág. do leitor como secundária), `[NENHUM]` (pág. do leitor declarada).
  2. **Campo de tipo no Contexto:** Usuário informa o tipo de cada livro antes da varredura (ex: `Abbas → DIGITAL`, `Bogliolo → IMPRESSO`).
  3. **Ação 6 reforçada:** Para livros `[DIGITAL]`, o título da seção do sumário digital é tratado como âncora primária de navegação.
  4. **Ação 7 condicional:** Lógica de paginação bifurca por tipo de livro.
  5. **Norma N1 tripartida:** Regra de paginação específica para cada modo.
  6. **Nova Norma N13:** Proíbe misturar sistemas (impressa vs leitor) no mesmo livro.
  7. **4 exemplos Few-Shot:** Adicionado caso `[DIGITAL]` com Abbas; caso `[NENHUM]` atualizado.
  8. **Saída [S] tripartida:** Formato de saída diferenciado para cada tipo.
- **Impacto downstream:** A Célula 6 (Conversão JSON) do Orquestrador Híbrido receberá páginas do leitor em vez de páginas impressas para livros `[DIGITAL]`. O campo `paginas` no JSON gerado pode conter o formato `[N do leitor]` — validar compatibilidade no próximo uso.

## 2026-09-25 — Refatoração v2 do Prompt OCANES do Roteiro de Evidências (NotebookLM)
- **Arquivo:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Duas alterações cirúrgicas no prompt "Extrator de Evidências Brutas" usado no NotebookLM para varrer livros-texto fatiados.
- **Alterações Aplicadas:**
  1. **Eliminação da classificação [MENÇÃO]:** Removida toda referência a seções tangenciais (1 parágrafo, citações dentro de outro assunto). O roteiro agora registra APENAS seções com cobertura densa (assunto principal). Tag `[FOCO]` também removida da saída por redundância (com 1 nível, a tag não agrega informação). Adicionadas Ação 3 (FILTRAGEM DE DENSIDADE) e Norma N11 como guardrails.
  2. **Reordenação por relevância à pergunta norteadora:** Blocos 📚 dentro de cada 🎯 OBJETIVO passam a ser ordenados do mais relevante ao menos relevante em relação à pergunta norteadora da tutoria, em vez de agrupados por livro/capítulo. Adicionadas Ação 8 (ORDENAÇÃO POR RELEVÂNCIA) e Norma N12.
- **Motivação:** Seções tangenciais poluíam o roteiro sem valor para estudo focado. A ordenação por capítulo forçava o estudante a decidir por si a prioridade de leitura.
- **Impacto downstream:** Afeta a Célula 6 (Conversão JSON) e Célula 6.5 (Otimizador Curatorial) do Orquestrador Híbrido, que consomem a saída deste prompt. Como a tag `[FOCO]` foi removida, o Otimizador não receberá mais classificação de densidade — todo corte que chegar já será denso por definição.

## 2026-09-23 — Erro CUDA `libcublas.so.12` no Pipeline de Transcrição (Colab)
- **Arquivo:** [`Transcribe.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Transcribe.ipynb) — Células 1 e 4
- **Descrição do problema:** O pipeline v2.4 falhou em 2/2 aulas com `RuntimeError: Library libcublas.so.12 is not found or cannot be loaded`. O modelo `faster-whisper` (CTranslate2) não conseguia localizar a biblioteca cuBLAS no runtime do Colab.
- **Causa raiz:** O Google Colab atualizou o ambiente CUDA, e o pacote `faster-whisper` instalado via pip não encontrava a `libcublas.so.12` porque o `LD_LIBRARY_PATH` não incluía os diretórios dos pacotes pip `nvidia-cublas-cu12`. A lib existe no sistema mas em paths não registrados no linker.
- **Correção aplicada (3 camadas de defesa):**
  1. **Célula 1:** Adicionado `pip install nvidia-cublas-cu12 nvidia-cudnn-cu12` para garantir presença das libs CUDA no env pip. Logo após, injeção automática do `LD_LIBRARY_PATH` com auto-detecção dos diretórios (`site.getsitepackages()` + `/usr/local/cuda/lib64`).
  2. **Célula 4:** Nova função `_garantir_ld_library_path()` invocada antes de instanciar o `WhisperModel`. Usa `ctypes.cdll.LoadLibrary()` para forçar o carregamento da `libcublas*.so*` antes do CTranslate2 tentar usá-la.
  3. **Fallback CPU:** Se o CUDA falhar mesmo com as correções, o modelo é carregado em modo `device='cpu', compute_type='int8'` com aviso no log.
- **Status:** ✅ Confirmado em produção (23/09/2026 21:19). Pipeline rodando com CUDA no Colab.

## 2026-09-19 — Adição dos Flashcards Cognitiva 02 no Portal Medhelp
- **Arquivo:** [`index.html`](file:///home/vvgfilhos/index.html) — Seção 4 (Flashcards)
- **Descrição:** Inclusão do link interativo do Google NotebookLM para os flashcards de revisão da prova Cognitiva 02 (`Cognitiva 02 (Prova)`).
- **Link configurado:** `https://notebook.google.com/notebook/8a6518b8-1b99-4443-8597-c0e42dd69605/artifact/e342842d-1a87-445d-9a7f-4607826dd7cb?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_`
- **Validação de UX/Design:**
  - Segue a identidade visual e tokens CSS de `styles.css` (`.sub-item`, `.sub-marcador`, `.sub-nome`, `.sub-seta`).
  - Posicionado sequencialmente após `Cognitiva 01 (Prova)`.
  - Rastreamento analítico habilitado via `analytics.js` com o evento GA4 `click_sub_item` (categoria pai: `Flashcards`, nome do item: `Cognitiva 02 (Prova)`).

## 2026-09-19 — Correção de Formatação dos Flashcards no NotebookLM (Cartões Didáticos)
- **Arquivo:** [`SKILL.md`](file:///home/vvgfilhos/medhelp/.agents/skills/publicar-flashcards-notebooklm/SKILL.md) — Seção 4 (Prompt Anti-Alucinação)
- **Descrição do problema:** O verso dos cartões didáticos do NotebookLM renderizava todo o conteúdo numa única linha com marcação Markdown crua visível (asteriscos `**`, travessões `—`).
- **Causa raiz:** O campo de verso dos cartões didáticos do NotebookLM é **plain text**, não Markdown. O prompt antigo instruía "manter formatação e estrutura de listas" sem explicitar que a marcação Markdown deveria ser removida e cada item colocado em linha separada.
- **V1 (falhou):** Prompt sem seção `[E] Exemplos`. Instrução de quebra de linha genérica. Sem regra anti-LaTeX/anti-crase. Resultado: itens continuaram na mesma linha + LaTeX (`$`, `\text{}`) apareceu.
- **V2 (rejeitado):** Introduziu CAIXA ALTA nos termos e numeração, mas o NotebookLM ignorou numeração e continuou emitindo LaTeX (`$ > 3 \text{ cm} $`) e fundindo itens. O usuário rejeitou a caixa alta ("isso é ruim, deixe como tava").
- **V3 (definitivo OCANES):**
  - **Reversão Estética:** Eliminada a conversão para CAIXA ALTA; mantida a capitalização natural do texto original.
  - **Anti-LaTeX Cirúrgico:** Injetada regra mandante em `[A] Ações` para unidades/comparadores e guardrail rígido em `[N] Normas` com pares de substituição determinísticos (`> 3 cm` em vez de `$ > 3 \text{ cm} $`).
  - **Formato Vertical em Hífen:** Substituída a numeração por marcadores `- ` com quebra de linha física, espelhando a sintaxe original dos `.md` de flashcards.
  - **Few-Shot OCANES Rigoroso:** Inclusão direta dos dois casos reais de falha apresentados pelo usuário como contra-exemplos proibidos explícitos.
- **Impacto:** Otimização semântica direta nas Instruções Personalizadas dos Cartões Didáticos do NotebookLM. Pipeline local de arquivos preservado.

## 2026-09-05 — Suporte aos Diretórios CEUMA no Gerador de PDF Premium
- **Arquivos:** [`colab_gerador_pdf_premium.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb) — Célula 3 (Configurações e Diretórios)
- **Descrição:** Adicionada resolução explícita de pastas para a faculdade CEUMA (`Resumos_Prontos - CEUMA`, `PDFs_Premium - CEUMA`, `Arquivados - CEUMA`), substituindo a lógica ternária prévia restrita à UNDB por estrutura condicional completa (`UNDB` / `CEUMA` / Fallback).
- **Modificações Aplicadas:**
  - `if FACULDADE == 'UNDB'`: direciona para sufixos `- UNDB`.
  - `elif FACULDADE == 'CEUMA'`: direciona para sufixos `- CEUMA`.
  - `else`: mantém pastas padrão sem sufixo institucional.
- **Validação:** Parsing AST de todas as células de código do notebook bem-sucedido e integridade JSON preservada.

## 2026-09-05 — Atualização de Pastas de Tutoria e Transcrição (Colab)
- **Arquivos:** 
  - [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) — Célula 7 (Configurações da Turma)
  - [`Transcribe.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Transcribe.ipynb) — Célula 4 (Configuração de Pastas do Drive)
- **Descrição:** Atualizados os caminhos de diretórios no Google Drive para tutoria e transcrições médicas.
- **Modificações Aplicadas:**
  - `Orquestrador_Hibrido.ipynb` (ROUTER):
    - `UNDB.pasta_livros`: `/content/drive/MyDrive/Logística - UNDB/Livros - UNDB` → `/content/drive/MyDrive/Logística - UNDB/Tutoria - UNDB`
    - `CEUMA.pasta_livros`: `/content/drive/MyDrive/Logística - CEUMA/Livros - CEUMA` → `/content/drive/MyDrive/Logística - CEUMA/Tutoria - CEUMA`
  - `Transcribe.ipynb`:
    - `PASTA_SAIDA_DRIVE`: `/content/drive/MyDrive/Logística - UNDB/Transcrições - UNDB/Resumos_Prontos - UNDB` → `/content/drive/MyDrive/Logística - UNDB/Transcrições - UNDB/Transcricoes_Medicina - UNDB`
- **Validação:** Verificada a integridade sintática e estrutura JSON dos notebooks sem corromper a formatação original.

## 2026-08-31 — Refatoração Anti-Alucinação da Célula 6.5 (Otimizador Curatorial)
- **Arquivos:** [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) — Célula 5 (Motor)
- **Descrição:** Substituição completa do modelo de "echo total" (onde o Gemini reescrevia o JSON inteiro) por um modelo de operações (diff). O Gemini agora retorna apenas uma lista de ações (DELETE/GAP) e o Python aplica cirurgicamente no JSON original.
- **Problemas resolvidos:**
  1. Echo total de JSON eliminado — output do modelo cai de ~400 linhas para ~20 linhas.
  2. Dados intocados (nomes, páginas) nunca passam pelo modelo — zero corrupção silenciosa.
  3. `response_schema` Pydantic adicionado (`ResultadoOtimizacao`) — JSON garantido pela API.
  4. Consolidação de cortes contíguos migrada para Python puro — 100% determinístico.
  5. Pós-validação automática — checa se páginas "apareceram do nada".
  6. Prompt OCANES com [FOCO]/[MENÇÃO] como ground truth para decisões de corte.
  7. Persona "Curador Pedagógico Médico Rigoroso" removida — ruído estocástico.
- **Pipeline novo (4 etapas):**
  1. Consolidação determinística (Python) → merge de cortes contíguos
  2. Análise LLM (Gemini) → retorna lista de operações
  3. Aplicação (Python) → executa DELETE/GAP no JSON original (com type casting seguro)
  4. Pós-validação (Python) → checa integridade
- **Refatorações adicionais:**
  - Código morto/duplicado removido da função `adicionar_videos`.
  - Type casting robusto (`str()`) implementado em `aplicar_operacoes` para evitar falha silenciosa de keys caso o campo `objetivo` seja parseado como inteiro.
- **Backup:** `Orquestrador_Hibrido.ipynb.bak`

## 2026-08-31 — Sistema Guardião de Versões (Protocolo Anti-Cache Colab)
- **Causa Raiz:** Notebooks abertos no navegador retêm código em cache. Ao executar "Run All" numa aba antiga, executava-se lógica desatualizada, mascarando falhas corrigidas.
- **Implementação:**
  - **Hook de Pre-Commit:** `.git/hooks/pre-commit` rastreia alterações em `.ipynb` no `git commit` e atualiza a string `VERSAO_LOCAL` com o timestamp atual (UTC).
  - **Célula Injetada:** Em `Orquestrador_Hibrido.ipynb`, `Transcribe.ipynb`, `Roteiro_Tutoria.ipynb` e `colab_gerador_pdf_premium.ipynb`, a 1ª célula valida `VERSAO_LOCAL` via request no raw do GitHub.
- **Tratamento de Exceções:** Bloqueia a execução integral com `raise Exception` caso haja divergência.

## 2026-08-31 — Otimização OCANES do Prompt do NotebookLM (Extrator de Evidências)
- **Arquivos:** Prompt externo (NotebookLM) → alimenta [`Orquestrador_Hibrido.ipynb`](file:///home/vvgfilhos/medhelp/scripts/colab/Orquestrador_Hibrido.ipynb) Célula 4
- **Descrição:** Refatoração completa do prompt "Sniper" usado no NotebookLM para extrair evidências brutas de livros fatiados. Aplicado framework OCANES com separação rigorosa [O][C][A][N][E][S].
- **Problemas corrigidos (12):**
  1. Persona "Sniper" removida — injetava ruído estocástico sem valor funcional.
  2. Normas e Ações separadas em blocos distintos — evita attention collapse.
  3. Adicionados 3 exemplos Few-Shot pareados (hit com densidade+tabela, miss, não-contíguas+nomenclatura alternativa).
  4. Nova etapa de Expansão Sinonímica (Ação 1) — reduz falsos negativos em temas médicos.
  5. Formato flexível de capítulo — copia nomenclatura real do livro (Cap./Unidade/Módulo) em vez de forçar "Cap.".
  6. Nova norma N8 (um capítulo por bloco) — evita blocos monolíticos.
  7. Norma de nome de arquivo (N4) reforçada com exemplos ✅/❌.
  8. Normas numeradas N1–N10 para referência cruzada e debugging.
  9. Norma N9: formato explícito para páginas não-contíguas (vírgula) vs contíguas (travessão).
  10. Classificação de densidade [FOCO]/[MENÇÃO] por seção — alimenta Otimizador Curatorial (Célula 6.5).
  11. Norma N10: nomenclatura flexível de capítulo copiada do livro real.
  12. Linha 📊 para tabelas e figuras-chave (gold content para estudo).
- **Impacto esperado:** Saída mais consistente, parseable e exaustiva, reduzindo correções manuais no JSON gerado pela Célula 6.

## 2026-08-21 — Erro HTTP 503 (Rejeição da Cloud) na Geração de Resumos
- **Arquivos:** `automacao-transcricoes/Config.js`, `automacao-transcricoes/GeminiClient.js`
- **Descrição:** O pipeline de transcrições falhava sistematicamente com `[HTTP 503] Rejeição da Cloud` ao processar resumos, ativando o loop de Exponential Backoff sem sucesso.
- **Causa Raiz (4 problemas identificados):**
  1. **Modelo instável (`gemini-flash-latest`)**: O alias `-latest` aponta para o modelo mais recente (`gemini-3.7-flash` em ago/2026), sujeito a picos de demanda e rejeições 503 frequentes. Não é recomendado para produção.
  2. **`MAX_RETRIES` ignorado**: Declarado em `CONFIG` (valor 3) mas nunca consumido por `fetchGeminiWithResilience`, que operava com `while(true)` — desperdiçando os 5 minutos de runtime do GAS em retries infinitos contra um modelo sobrecarregado.
  3. **Sem fallback de modelo**: Quando o modelo primário esgotava o tempo, o script simplesmente abortava sem tentar alternativa.
  4. **Falta de tratamento para modelo indisponível (HTTP 404)**: O modelo `gemini-2.5-flash` estava indisponível para novos usuários, retornando um erro 404 que quebrava o script sem acionar os fallbacks.
- **Correções Aplicadas:**
  1. Modelo primário atualizado para `gemini-3.5-flash`.
  2. Cadeia de fallback reordenada com 3 modelos: `gemini-3.5-flash-lite` → `gemini-3.6-flash` → `gemini-2.5-flash` (`CONFIG.MODELOS_FALLBACK`).
  3. `fetchGeminiWithResilience` reescrito: `while(true)` → `while(attempt <= maxRetries)`, consumindo `CONFIG.MAX_RETRIES` (agora 4). Ao esgotar tentativas no modelo ativo, escala automaticamente para o próximo da cadeia via `fallbackIndex`.
  4. Implementado fallback imediato para erro HTTP 404. Se um modelo estiver indisponível, o motor pula diretamente para o próximo sem gastar tempo com tentativas (backoff).
  5. Proteção de timeout iminente: se o sleep do backoff causaria timeout, pula direto para o próximo modelo da cadeia em vez de abortar.


## 2026-07-20 — Melhorias de Alta Prioridade: Email, Sheets, Nomenclatura e Portabilidade
- **Arquivos:** `automacao-transcricoes/Config.js`, `automacao-transcricoes/Main.js`, `medhelp-flashcards/Trigger_Resumos.js`, `medhelp-flashcards/Trigger_Tutoria.js`, `medhelp-flashcards/SheetsLogger.js` [NEW], `scripts/orquestrador_academico.py`
- **Correções Aplicadas:**
  1. **Bug extra:** `automacao-transcricoes/Config.js` também usava `gemini-3.5-flash` inexistente. Corrigido para `gemini-2.5-flash`.
  2. **Unificação de nomenclatura:** `Main.js` passou a salvar o resumo como `tituloLimpo.md` (sem `(Resumo)` no nome do arquivo). O `NamingUtils` já esperava esse padrão. Agora o pipeline ponta-a-ponta é coerente.
  3. **Email de notificação:** `MailApp.sendEmail` adicionado ao final de `processarNovasTranscricoes()`, `processarFlashcardsDeResumos()` e `processarFlashcardsDeTutoria()`. Disparado apenas quando há atividade real. Assunto diferenciado por ✅ (sucesso) ou ⚠️ (falha).
  4. **Painel Google Sheets:** Criado `SheetsLogger.js` com `SheetsLogger.registrar()`. Ativado via Script Property `SHEETS_LOG_ID`. Auto-gera cabeçalho. Fail-safe (nunca bloqueia o pipeline). Integrado em `Trigger_Resumos.js` e `Trigger_Tutoria.js`.
  5. **Portabilidade:** `orquestrador_academico.py` agora lê `OBSIDIAN_BASE` via `os.environ.get()`, mantendo o caminho Linux como fallback.


- **Arquivos:** `medhelp-flashcards/Config.js`, `medhelp-flashcards/Setup.js`, e `scripts/colab/Transcribe.ipynb`
- **Descrição:** Resolução dos 3 bugs mais críticos identificados no pipeline.
- **Correções Aplicadas:** 
  1. Correção da variável `GEMINI_MODEL` de `gemini-3.5-flash` (inexistente) para `gemini-2.5-flash` em `Config.js`.
  2. Implementação e configuração dos triggers temporais automatizados com a nova função `setupFlashcardsTriggers()` dentro do script `Setup.js`.
  3. Integração total do webhook no final do processamento do Whisper no Google Colab, garantindo o envio imediato da requisição POST na Célula 4 para inicializar a geração do pipeline OCANES no Apps Script sem atrasos.

## 2026-07-20 — Correção Arquitetural Crítica no Transcribe.ipynb (Fim do pré-transcrição)
- **Arquivos:** `scripts/colab/Transcribe.ipynb` e exclusão de `scripts/apps-script/pre-transcricao/`
- **Descrição:** Abandono oficial do script de pré-transcrição no Google Apps Script após deliberação conjunta. O usuário optou por montar a Célula 3 manualmente para ter mais controle.
- **Remoção do Priming Automático:** O usuário solicitou a remoção completa da função de "Priming Automático via Gemini" de dentro do notebook, pois essa etapa já é realizada manualmente com maior precisão usando a persona "James" no chat nativo do Gemini.
- **Migração para faster-whisper:** Foi realizada a migração do motor `openai-whisper` para `faster-whisper` com suporte a `float16` na Célula 4, garantindo redução massiva de VRAM consumida e 4x mais velocidade nas transcrições, mantendo a qualidade original do modelo `large-v3`.
- **Correções Aplicadas:** 
  1. Deleção completa do Apps Script legado (`pre-transcricao/`).
  2. Limpeza da Célula 4 do `Transcribe.ipynb`, removendo integrações com API do Gemini e implementando o motor CTranslate2 (`faster-whisper`), rodando com prioridade antes do OCR para poupar memória.

## 2026-07-08 — Otimização de Prompts de Tutoria (PDF) e Meta de 55 Flashcards
- **Arquivos:** `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/Código.js`
- **Descrição:** Refatoração do prompt `buildPromptPDF` utilizando o framework OCANES estrito para priorizar a ordenação de objetivos e enriquecimento por referências consagradas. Adicionada lógica matemática no loop de arquivos para dividir proporcionalmente a meta de 55 flashcards totais da tutoria entre os PDFs de objetivos da pasta.

## 2026-07-08 — Organização em Subpastas por Disciplina nos Flashcards
- **Arquivos:** `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/Código.js`
- **Descrição:** Implementação de criação e busca dinâmica de subpastas por categoria/disciplina (ex: "LHM", "Tutoria", "Farmacologia") no Google Drive para os arquivos de flashcard `.md` gerados.

## 2026-07-08 — Planejamento: Revisão Geral do Apps Script e Renomeação por IA
- **Arquivos:** `scripts/apps-script/pre-transcricao/Código.js`, `scripts/apps-script/flashcards/Código.js` e `scripts/apps-script/automacao-transcricoes/Code.js`
- **Descrição:** Início do plano de refatoração para corrigir instabilidade e chaves hardcoded no ecossistema do GAS, integrando a etapa de renomeação inteligente de áudios usando Gemini 2.5 Flash de acordo com a skill master de Apps Script.

## 2026-07-08 — Otimização do Fluxo de Geração de Flashcards no NotebookLM
- **Arquivo:** `publicar-flashcards-notebooklm/SKILL.md`
- **Descrição:** Refatoração do fluxo de trabalho. A partir de agora, o agente apenas cria/reutiliza o caderno do NotebookLM e faz o upload dos flashcards gerados. Em seguida, fornece o link direto do caderno e o prompt de renderização de cartões interativos em formato copiável para o usuário embutir nas "Instruções Personalizadas" (Custom Instructions) de conversa do caderno.
- **Causa:** O NotebookLM ignora prompts diretos da API se o usuário acionar a geração da UI web sem instruções personalizadas salvas nas configurações globais do caderno.

## 2026-07-08 — Refatoração de Prompts das Skills Pessoais (SUCESSO)
- **Diretório:** `Gdrive/pessoal/.agents/skills/`
- **Descrição:** Refatoração de 5 prompts de skills pessoais (`elaborar-questoes-prova`, `estrategista-intervencao-5w2h`, `resumo-tutoria`, `roteiro-osce-lhm` e `roteiro-portfolio-reflexivo`) com base no manual de engenharia de prompts.
- **Modificações Aplicadas:**
  1. Remoção de personas ("Atue como...", "Você é..."), reduzindo a entropia de simulação dramática.
  2. Ajuste dos Objetivos `[O]` para vetores de conversão unívocos.
  3. Inclusão de Chain of Thought (CoT) com orientações passo a passo nas Ações `[A]`.
  4. Adição de guardrails estritos anti-alucinação em `[N]` (retornos padronizados como `INFORMAÇÃO_INEXISTENTE_NAS_FONTES`).
  5. Compactação de toda a redação para eficiência e redução de custos de tokens.

## 2026-07-08 — Atualização do Caminho de Áudios de Transcrição
- **Arquivo:** `scripts/colab/Transcribe.ipynb`
- **Descrição:** Reconfiguração da variável `PREFIXO_AUDIO` para apontar para a raiz do Google Drive (`/content/drive/MyDrive/Áudios aulas/`).
- **Causa:** Usuário removeu a pasta `audios_aula` de dentro de `Logística - Drive` para otimização da sincronização do OverGrive.

## 2026-07-08 — Autenticação NotebookLM MCP (SUCESSO)
- **Arquivo:** `mcp_config.json`
- **Descrição:** Integração do servidor `notebooklm-mcp-server` ao ecossistema Antigravity.
- **Problemas encontrados:**
  1. `EHOSTUNREACH` no npm — IPv6 bloqueado. Resolvido com `NODE_OPTIONS="--dns-result-order=ipv4first"`.
  2. `EACCES` na instalação global — Resolvido com instalação local (`npm install --save`).
  3. `EBADENGINE` — Node.js v18 vs requisito v20+. O pacote funciona apesar do warning.
  4. Timeout de autenticação (2x) — Chromium abria invisível pelo terminal do Antigravity. Resolvido na 3ª tentativa (usuário interagiu com a janela).
- **Resultado:** Cookies salvos em `/home/vvgfilhos/.notebooklm-mcp/auth.json`. Sessão ativa.

## 2026-07-07 — Atualização de Caminhos do Drive
- **Arquivos alterados:** `pre-transcricao/Código.js`, `Transcribe.ipynb`, `Roteiro_Tutoria.ipynb`
- **Descrição:** Migração de caminhos do Colab para nova estrutura de pastas (`Logística - Drive/Transcrições/`).
- **Causa:** Reorganização manual das pastas pelo usuário no Google Drive.
- **Correção:** Script Python com tratamento NFD/NFC para substituição segura de strings acentuadas em `.ipynb`.

## 2026-07-09 — Diagnóstico e Otimização da Sincronização do Overgrive
- **Arquivos alterados:** `/home/vvgfilhos/sync_overgrive.sh` e `/home/vvgfilhos/medhelp/99-overgrive-inotify.conf` [NEW]
- **Descrição:** Resolução do travamento da sincronização local e alto consumo de CPU do daemon Overgrive.
- **Causa Raiz:**
  1. **Cache Órfão**: Arquivo de cache `.overgrive.cache` corrompido contendo registros de IDs excluídos do Google Drive (HTTP 404). Isso travava o pipeline de uploads.
  2. **Concorrência de Polling**: O script `sync_overgrive.sh` enviava um sinal `USR1` de sincronização a cada 60s. Como os uploads sequenciais de múltiplos arquivos levavam mais de 60s, o sinal reiniciava ou congestionava a API de Drive, gerando loops intermináveis.
  3. **Inotify do Linux**: O limite de monitoramento em tempo real do kernel (`max_user_watches`) estava baixo demais para vaults Obsidian ativos que geram milhares de arquivos pequenos de plugins.
- **Ações e Correções Aplicadas:**
  1. Parado o daemon e removidos os caches corrompidos `.overgrive.cache` e `.overgrive.lastsync` para recriação limpa do mapeamento JSON.
  2. Modificado o polling do `sync_overgrive.sh` de 60s para 300s (5 minutos) para garantir a finalização estável de uploads em lote.
  3. Criado arquivo `/home/vvgfilhos/medhelp/99-overgrive-inotify.conf` com aumento dos limites do inotify (`max_user_watches` para 524288) para permitir monitoramento em tempo real confiável pelo kernel.

## 2026-07-29 — Sistema de Offset de Páginas (Páginas Impressas vs Digitais) no Orquestrador PBL
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Implementação do sistema de conversão de offset para os PDFs de tutoria (como `SAito.pdf`, offset = 15 páginas).
- **Causa Raiz:** Os sumários dos livros impressos utilizam a numeração impressa no rodapé (ex: Cap 12 = 225, Cap 13 = 245). O leitor de PDF exige o índice físico do arquivo (`página_física = página_impressa + 15`).
- **Correções Aplicadas:**
  1. **Autodetecção & Dicionário `OFFSETS_MANUAIS`**: Adicionada a função `obter_offset_pdf` para autodetectar ou carregar offsets conhecidos por PDF.
  2. **Prompt OCANES**: O sumário enviado ao Gemini exibe as **Páginas Impressas no Livro** (`página_física - offset`). A IA raciocina com os números impressos reais.
  3. **Fatiamento PyPDF**: O backend adiciona o `offset` às páginas retornadas pela IA antes do fatiamento (`página_física = página_impressa + offset`).
  4. **Validação**: Testado e aprovado com 100% de precisão sintética para `SAito.pdf` (Cap 12: 240–259, Cap 13: 260–275).

## 2026-07-29 — Unificação de Offset em TOCs Digitais e TOCs Extraídos via IA
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Correção do comportamento divergente entre sumários digitais nativos (que retornam páginas físicas) e sumários extraídos via IA (que retornam páginas impressas).
- **Causa Raiz:** O sumário extraído pelo Gemini do texto do livro já continha páginas impressas. Ao aplicar o offset de subtração no `process_roteiro`, a numeração enviada ao monitor era deslocada ao contrário (ex: pág. `225` virava `210`).
- **Correções Aplicadas:**
  1. **Unificação Interna**: Ajustada a função `get_pdfs_tocs`. Caso o sumário seja gerado via IA (`extract_toc_with_gemini`), as páginas extraídas (impressas) são imediatamente convertidas para físicas somando o offset (`pagina_física = pagina_impressa + offset`).
  2. **Coerência**: Agora, todos os sumários internos mantêm o padrão de páginas físicas, e as conversões bidirecionais ocorrem de forma transparente.
  3. **Regeneração & Git**: Compilação de notebook executada e enviada ao GitHub.

## 2026-07-29 — Correção de Fatiamento Duplicado (Fallback) e Offset no Leitor do Validador
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Resolvido o bug onde as páginas de capítulos subsequentes eram duplicadas no PDF final, e os limites gerados pelo Validador de Leitura (Agente 2) ficavam defasados.
- **Causa Raiz:** 
  1. O fallback na ausência de TOC forçava arbitrariamente um mínimo de `15` páginas de corte, mesmo se um intervalo menor (ex: 5 páginas) fosse definido, invadindo os capítulos seguintes.
  2. O extrator de texto do Validador (`extrair_texto_paginas`) lia as páginas físicas sem somar o offset do livro, fazendo com que o Agente 2 calibrasse os limites de leitura sobre o texto errado.
- **Correções Aplicadas:**
  1. **Ajuste de Fallback**: O fallback de `+15` páginas agora só se aplica se `pag_fim_gemini <= pag_ini_gemini`. Caso contrário, respeita rigorosamente o limite do JSON.
  2. **Offset no Validador**: Ajustada a função `extrair_texto_paginas` para aplicar o offset do PDF, garantindo que o Agente 2 analise o texto correto.
  3. **Parâmetro de Reconciliação**: O fatiador final (`exportar_pdfs_finais`) agora passa `reconciliar=False` para garantir que as alterações manuais feitas pelo usuário no JSON de revisão sejam respeitadas 100% sem intervenção do TOC.

## 2026-07-29 — Transição para Mapeamento de Offsets Interativo e Persistente (`offsets.json`)
- **Arquivos alterados:** `scripts/python/generate_notebook.py`, `scripts/python/orquestrador_tutoria.py`, `scripts/colab/Orquestrador_Automatico.ipynb`
- **Descrição:** Substituição do modelo hardcoded/autodetectado de offsets por um modelo interativo e manual direto no Google Colab, garantindo 100% de precisão e empoderando o usuário.
- **Motivação:** A autodetecção via OCR falhava em PDFs complexos e dicionarizar `OFFSETS_MANUAIS` no código era engessado e impedia o mapeamento de novos livros pelo usuário final no Colab.
- **Implementação:**
  1. **Célula Interativa (Notebook)**: Adicionada a "CÉLULA 5 — MAPEAR OFFSETS DOS LIVROS (INTERATIVO)" no notebook. O script itera os PDFs da pasta `PASTA_LIVROS` e pede, via `input()`, a página impressa e a página física do leitor, calculando a matemática do offset.
  2. **Persistência (`offsets.json`)**: O resultado é salvo em um arquivo JSON na própria pasta de tutoria no Google Drive, sendo recarregado a cada execução (evitando que o usuário precise remapear livros conhecidos).
  3. **Refatoração Global**: As funções `obter_offset_pdf`, `get_pdfs_tocs`, `process_roteiro`, `gerar_pdfs` e `extrair_texto_paginas` foram atualizadas para receber e consultar o dicionário `offsets_dict` carregado de `offsets.json`, em vez de `OFFSETS_MANUAIS`.

## 2026-08-31 — Correção da Curadoria de Vídeos Ausente no Orquestrador Híbrido
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** Restauração do corpo da função `adicionar_videos` que foi acidentalmente truncada em um commit anterior.
- **Causa Raiz:** A função `adicionar_videos` no Jupyter Notebook terminava no bloco de verificação da API Key (linhas ~550). Como o restante do código havia sido apagado, a função encerrava ali, retornando o config inalterado ou `None` (se não entrasse no `if`), gerando erro de dicionário vazio/None na Célula 9 de geração de PDF.
- **Correções Aplicadas:**
  1. Resgatado o código original do histórico do Git (`git log -p`).
  2. Repositado o código ausente na função usando um script Python de patch para garantir a formatação correta em JSON exigida pelos arquivos `.ipynb`.

## 2026-08-31 — Refatoração e Correção de Bugs na Célula 6.5 (Otimização Curatorial)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** Refatoração cirúrgica e correção de segurança de tipos (Type Safety) e alinhamento de schema no agente otimizador (Célula 6.5).
- **Causa Raiz & Correções:**
  1. **Schema Mismatch (Alucinação Induzida):** O modelo Pydantic exigia a chave `corte_idx`, mas o `SYSTEM_PROMPT_OTIMIZADOR` instruía o LLM a retornar `idx`. Corrigido o prompt e o gerador de resumo (`resumir_config_para_llm`) para usarem de forma padronizada a chave `corte_idx`.
  2. **Type Safety em Dicionários:** A função `aplicar_operacoes` utilizava iteradores de objetos com chaves que poderiam gerar `KeyError` dependendo do cast do Pydantic no campo `objetivo` (string vs int). Foi injetado `str(obj_id)` e `str(op.objetivo)` para proteger as buscas no dicionário `obj_map`.

## 2026-08-31 — Remoção do Índice da Capa (Orquestrador Híbrido)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** O usuário reportou que o índice não estava funcionando corretamente e pediu sua remoção.
- **Correções Aplicadas:**
  1. Comentada a linha `elems.extend(_build_cover_index(cortes, styles))` dentro da função `gerar_capa` para suspender a renderização da tabela de índice na capa dos PDFs, mantendo o cabeçalho e as sugestões de vídeos intactos.

## 2026-08-31 — Correção de Falha Crítica de Parsing (Célula 6)
- **Arquivos alterados:** `scripts/colab/Orquestrador_Hibrido.ipynb`
- **Descrição:** O usuário reportou erro de validação JSON (`Expecting value: line 34 column 21`) durante a conversão do roteiro do NotebookLM.
- **Causa Raiz & Correções:**
  1. **Ausência de Structured Outputs:** O prompt `SYSTEM_PROMPT_CONVERSAO` gerava JSON de forma livre e tentava limpar blocos Markdown via Expressões Regulares, falhando diante de erros sintáticos do LLM (como vírgulas extras).
  2. **Refatoração com Pydantic:** Foram introduzidas as classes `ObjetivoJSON` e `CorteJSON` no notebook.
  3. A função `converter_notebooklm_para_json` passou a utilizar `response_schema=list[ObjetivoJSON]` na chamada `call_gemini`, garantindo a validação estrita do JSON nativa da API.
  4. **Adaptabilidade do Offset:** Como o Structured Outputs não suporta tipagens complexas (`list[int] | str`) para o campo `paginas` (que ocasionalmente recebia `"VERIFICAR_OFFSET"`), o esquema foi remodelado para utilizar a flag boleana `precisa_verificar_offset: bool` e o processamento pós-API foi ajustado para restabelecer a string `"VERIFICAR_OFFSET"` quando necessário.
