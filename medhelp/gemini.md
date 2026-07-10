# Configurações Ativas e Regras de Negócio - Medhelp

## Fábrica de Flashcards por Subagentes

### 1. Parâmetros do Modelo (Simulação Local)
- **Modelo de Simulação**: Gemini 3.5 Flash (utilizado via ambiente do chat ide de alta performance).
- **Target Quantitativo**: 55 a 60 flashcards por problema de forma a cobrir exaustivamente todos os objetivos.
- **Distribuição de Importância**: Ajustar a densidade de flashcards por objetivo baseado na relevância do tema (ex: no P4, calendário vacinal e ESAVI terão mais densidade do que conceitos gerais de imunização).

### 2. Mapeamento de Metadados e Arquivos Locais
- **Vault Obsidian Base**: `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1`
- **Subpasta de Saída**: `📈Negócio/Flashcards`
- **Arquivos a Criar**:
  1. `Problema 01 - Triagem Neonatal, Icterícia e Puericultura - Flashcards.md`
  2. `Problema 02 - Aleitamento Materno, Introdução Alimentar e Suplementação - Flashcards.md`
  3. `Problema 03 - Crescimento, Desenvolvimento e Vigilância Infantil - Flashcards.md`
  4. `Problema 04 - Vacinação, Calendários e ESAVI - Flashcards.md`
  5. `Problema 05 - Adolescência, Puberdade e Saúde do Adolescente - Flashcards.md`

### 3. Diretrizes de Coesão e Alinhamento
- As respostas dos flashcards devem conter **Verdade Terrestre Estendida** (referências consagradas incorporadas de forma a trazer detalhes de dosagens, mecanismos fisiopatológicos e condutas completas).
- Mantenha conformidade absoluta com o plugin **Obsidian Spaced Repetition** (linha `?` como delimitador, perguntas na linha superior, respostas em tópicos nas linhas seguintes, sem espaços em branco no corpo de resposta de um único card, e um pulo de linha simples entre cards).

### 4. Estrutura de Diretórios e Versionamento
- **Projetos Pessoais**: Todos os scripts, estudos e projetos pessoais (ex: análises em R, faculdade, etc.) estão agora unificados e versionados dentro de `~/medhelp/pessoal`. Esta decisão arquitetural evita problemas de sincronização e bagunça causados pelo Overgrive, centralizando o backup e o controle de versão diretamente no GitHub do projeto Medhelp.
