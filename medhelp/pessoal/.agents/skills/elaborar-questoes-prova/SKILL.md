---
name: "elaborar-questoes-prova"
description: "Gera questões de prova de medicina baseadas em casos clínicos (clinical vignettes) com formato de julgamento de proposições (V/F) e múltipla escolha, acompanhadas de gabarito técnico detalhado e raciocínio clínico."
---

# Skill: elaborar-questoes-prova

Esta habilidade orienta o compilador semântico a processar insumos e gerar questões de avaliação médica de alta fidelidade e rigor técnico.

## Como Acionar
A habilidade é ativada quando solicitado:
- "criar questões de prova", "elaborar questão de medicina" ou "gerar questões de caso clínico"
- "fazedor de questões de prova" ou "gerar proposições V/F para questão"

---

## Processo de Execução (Delegação para o SDK)

Sempre que esta habilidade for ativada pelo usuário (fornecendo o texto ou caso clínico), execute OBRIGATORIAMENTE os seguintes passos:

1. **Criar Arquivo Fonte**: Pegue todo o conteúdo/texto fornecido pelo usuário e salve-o em um arquivo temporário no diretório raiz do projeto: `/home/vvgfilhos/medhelp/entrada_temporaria_questoes.txt`. (Use a tool `write_to_file`).
2. **Executar Orquestrador**: Execute o seguinte comando no terminal (usando a tool `run_command`):
   ```bash
   python /home/vvgfilhos/medhelp/scripts/orquestrador_academico.py --tipo questoes --fonte /home/vvgfilhos/medhelp/entrada_temporaria_questoes.txt
   ```
3. **Notificar o Usuário**: Após o comando terminar com sucesso (ou seja, os subagentes terminarem a geração), apenas informe ao usuário que as questões foram salvas diretamente na pasta `📈Negócio/Questões` do Obsidian.

**NÃO** tente gerar as questões manualmente na resposta do chat. Confie exclusivamente na execução do script Python para garantir os distratores complexos e o gabarito.
