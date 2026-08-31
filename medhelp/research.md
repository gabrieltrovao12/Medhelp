# Pesquisa: Mecanismo "Guardião de Versão" para Colabs

## O Problema
Colabs abertos na web (via GitHub) ficam em cache na aba do navegador. Se o repositório no GitHub for atualizado e o usuário rodar a aba antiga, ele executará código desatualizado, gerando bugs difíceis de rastrear.

## Requisitos (Protocolo V.L.A.E.G)
1. **Bloqueio rígido:** Deve interromper a execução (`raise Exception`) se estiver desatualizado.
2. **Invisível no desenvolvimento:** Não deve exigir que o desenvolvedor atualize strings de versão manualmente a cada edição.
3. **Escalável:** Aplicável a todos os notebooks do Medhelp (Orquestrador, PDF Premium, Extrator, Transcribe, etc).

## A Solução Proposta
1. **O Guardião (A Célula):** 
   Injetar uma célula no topo de cada notebook com o seguinte código:
   ```python
   # 🛡️ GUARDIÃO DE VERSÃO
   VERSAO_LOCAL = "TIMESTAMP_AQUI"
   # ... baixa versão do GitHub, extrai VERSAO_REMOTA e compara. Se diferente -> raise Exception.
   ```
2. **O Gatilho Automático (Git Pre-commit Hook):**
   Para evitar trabalho manual, criaremos um script `pre-commit` no repositório local. Toda vez que um `git commit` for disparado contendo mudanças em um arquivo `.ipynb`, o hook automaticamente injetará um novo `TIMESTAMP` atualizado naquele notebook antes de selar o commit.

## Viabilidade
- O hook de pre-commit em `.git/hooks/pre-commit` é suportado nativamente pelo Linux/Git.
- A célula do Guardião usa apenas bibliotecas nativas (`urllib`, `re`) para não exigir `pip install` antes de rodar.
- Cadastramento de notebooks suportados: podemos rodar um script inicial (bootstrap) que injeta o código do Guardião em todos os notebooks da pasta `scripts/colab`.
