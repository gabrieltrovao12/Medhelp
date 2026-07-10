---
name: "criar-flashcards-obsidian"
description: "Gera flashcards estruturados no formato Q&A para o plugin Obsidian Spaced Repetition a partir de matérias de estudo (slides, transcrições e mapas mentais) seguindo as regras de formatação local e o framework OCANES."
---

# Skill: criar-flashcards-obsidian

Esta habilidade orienta o assistente Antigravity na conversão de materiais de estudo médicos em flashcards atômicos de alta qualidade para o Obsidian, seja de forma direta ou através da orquestração de subagentes independentes para múltiplos problemas acadêmicos.

## Como Acionar
A habilidade é ativada quando o usuário solicita:
- "gerar flashcards", "criar flashcards" ou "fábrica de flashcards"
- "converter aula em cards" ou "criar cards para o obsidian"
- "gerar flashcards por subagentes", "um subagente por problema" ou similar.

---

## Mapeamento de Destinos Físicos (Vault Obsidian)
Os flashcards gerados localmente devem ser salvos nas pastas corretas para garantir a indexação automática pelo cofre local do Obsidian:
- **Caminho do Vault do Obsidian**: `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1`
- **Diretório de Negócios (Padrão de Fábrica de Cards)**: `📈Negócio/Flashcards`
- **Caminho Físico Completo**: `/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1/📈Negócio/Flashcards/`
- **Sincronização**: Os arquivos salvos localmente são carregados na nuvem (Google Drive) através da rotina do daemon de sincronização Overgrive.

---

## Processo de Orquestração com Subagentes (Multi-Problemas)
Quando o processamento envolver múltiplos problemas, módulos ou temas extensos:
1. **Divisão em Subagentes**: Instanciar um subagente especialista simulado ou real para cada problema ou tema.
2. **Meta por Subagente**: Cada subagente deve focar em gerar exatamente entre **55 e 60 flashcards** atômicos de alta qualidade para o seu respectivo problema.
3. **Execução e Consolidação**: Cada subagente escreve seu arquivo `.md` independente na pasta de destino final.
4. **Validação de Quantidade**: Sempre verificar se a contagem final de cartões por arquivo atende à meta especificada (55-60) antes de dar a tarefa por encerrada.

---

## Processo de Execução (Delegação para o SDK)

Sempre que esta habilidade for ativada pelo usuário (fornecendo o texto, mapa mental ou referências), execute OBRIGATORIAMENTE os seguintes passos:

1. **Criar Arquivo Fonte**: Pegue todo o conteúdo/texto fornecido pelo usuário e salve-o em um arquivo temporário no diretório raiz do projeto: `/home/vvgfilhos/medhelp/entrada_temporaria.txt`. (Use a tool `write_to_file`).
2. **Executar Orquestrador**: Execute o seguinte comando no terminal (usando a tool `run_command`):
   ```bash
   python /home/vvgfilhos/medhelp/scripts/orquestrador_academico.py --tipo flashcards --fonte /home/vvgfilhos/medhelp/entrada_temporaria.txt
   ```
3. **Notificar o Usuário**: Após o comando terminar com sucesso (ou seja, os subagentes terminarem a geração), apenas informe ao usuário que os cartões foram salvos diretamente na pasta `📈Negócio/Flashcards` do Obsidian.

**NÃO** tente gerar os cartões manualmente na resposta do chat. Confie exclusivamente na execução do script Python para garantir o paralelismo e o volume de 55-60 cartões.
