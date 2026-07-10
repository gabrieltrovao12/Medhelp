# Tarefas do Projeto - Medhelp (Fábrica de Flashcards por Subagentes)

- [x] [V.L.A.E.G.] Geração dos Flashcards por Subagentes Individuais
  - [x] **Visão**: Mapear os objetivos e os mapas mentais anexados de cada problema (P1 a P5)
  - [x] **Link**: Definir o caminho de destino local dos flashcards em `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1/📈Negócio/Flashcards/`
  - [x] **Arquitetura**: Projetar e simular 5 subagentes especialistas estruturados, um para cada problema, aplicando as regras de estilização da skill `criar-flashcards-obsidian`
  - [x] **Estilo**: Formatar cada arquivo com 55-60 flashcards atômicos de alta qualidade (conceitos em **negrito**, fármacos/doses em `código`, alertas em ==marcação dupla==, setas lógicas `->` ou `=>`, lista com `-` compacta)
  - [x] **Gatilho**: Escrever fisicamente os arquivos no diretório de destino do vault local do Obsidian

- [x] Detalhamento das Etapas de Execução:
  - [x] Executar Subagente do **Problema 01** (Triagem Neonatal, Icterícia, Puericultura, 1100 dias) -> Gerar 55-60 cards
  - [x] Executar Subagente do **Problema 02** (Aleitamento Materno, Micronutrientes, Suplementações) -> Gerar 55-60 cards
  - [x] Executar Subagente do **Problema 03** (Crescimento e Desenvolvimento, Curvas, Baixa Estatura, M-CHAT-R) -> Gerar 55-60 cards
  - [x] Executar Subagente do **Problema 04** (Vacinação, Princípios, Calendários PNI/SBP, ESAVI) -> Gerar 55-60 cards
  - [x] Executar Subagente do **Problema 05** (Adolescência e Puberdade, Tanner, HEADSS, Saúde do Adolescente) -> Gerar 55-60 cards

- [x] Verificação e Validação:
  - [x] Validar a quantidade exata de cards gerados (55-60 por arquivo)
  - [x] Auditar a formatação sintática do Obsidian Spaced Repetition (sem tags HTML, sem emojis, linha `?` isolada, sem linhas em branco intermediárias na resposta)
