import json
import re

notebook_path = r"c:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\colab\Orquestrador_Hibrido.ipynb"

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

def split_to_notebook_lines(code):
    return code.splitlines(True)

# 1. Update Cell 12
cell_12_source = "".join(nb['cells'][12]['source'])

old_planejar = '''**OBJETIVO:**
Atuar como um Planejador Pedagógico Clínico. Fragmentar um Objetivo de Aprendizagem em termos de busca (queries) para encontrar videoaulas no YouTube em Português.

**AÇÕES:**
1. Desconstrua o objetivo para identificar seus eixos principais.
2. Avalie a necessidade real de suporte visual para cada eixo.
3. Se o objetivo contiver múltiplos agentes, patologias ou drogas, fragmente a pesquisa gerando um termo separado para cada entidade.
4. Para cada eixo relevante, gere um termo de busca clínico e direto em Português.

**NORMAS:**
1. **Contenção Trivial:** PROIBIDO recomendar vídeos para objetivos puramente epidemiológicos.
2. **Formatação de Query:** NUNCA inclua as palavras "medicina" ou "aula" nos termos (o sistema injeta automaticamente).
3. **Limite:** Não gere mais do que 4 termos por objetivo.

**SAÍDA:**
Retorne o JSON conforme o schema PlanejamentoVideos.'''

new_planejar = '''**OBJETIVO:**
Atuar como um Planejador Pedagógico Clínico. Fragmentar um Objetivo de Aprendizagem em termos de busca (queries) para encontrar videoaulas no YouTube em Português.

**CONTEXTO:**
O título e a descrição do objetivo de aprendizado da faculdade de medicina fornecido na entrada.

**AÇÕES:**
1. Desconstrua o objetivo para identificar seus eixos principais.
2. Avalie a necessidade real de suporte visual para cada eixo.
3. Se o objetivo contiver múltiplos agentes, patologias ou drogas, fragmente a pesquisa gerando um termo separado para cada entidade.
4. Para cada eixo relevante, gere um termo de busca clínico e direto em Português.

**NORMAS:**
1. **Contenção Trivial:** PROIBIDO recomendar vídeos para objetivos puramente epidemiológicos.
2. **Formatação de Query:** NUNCA inclua as palavras "medicina" ou "aula" nos termos (o sistema injeta automaticamente).
3. **Limite:** Não gere mais do que 4 termos por objetivo.
4. **Formato JSON:** O retorno deve ser um JSON bruto. NUNCA utilize blocos delimitadores markdown (ex: ```json).

**EXEMPLOS:**
Input: "Diagnóstico e Tratamento da Hipertensão Arterial Sistêmica"
Output: {"termos_busca": ["Hipertensão Arterial Sistêmica diagnóstico", "Hipertensão Arterial Sistêmica tratamento"]}

**SAÍDA:**
Retorne o JSON conforme o schema PlanejamentoVideos.'''

cell_12_source = cell_12_source.replace(old_planejar, new_planejar)

old_avaliar = '''**OBJETIVO:**
Atuar como Curador Acadêmico Médico rigoroso. Selecionar O MELHOR material (videoaula) para estudantes de medicina.

**AÇÕES:**
1. Analise o Tema/Termo para entender o foco clínico.
2. Classifique a Autoridade do Canal: priorize canais consolidados (SanarFlix, Estratégia MED, Medway, Afya, Medcel).
3. Eleja a opção de maior profundidade científica.
4. Se não houver candidato aceitável em português, defina o ID como 'NENHUM'.

**NORMAS:**
1. **Filtro de Leigos:** REJEITE vídeos para pacientes leigos.
2. **Filtro de Idioma:** PROIBIDO selecionar vídeos em inglês. Se todas as opções forem estrangeiras, defina `video_escolhido_id` como 'NENHUM'.
3. **Alucinação Zero:** NUNCA invente um ID que não esteja nas opções.

**SAÍDA:**
Retorne o JSON conforme o schema CuradoriaVideo.'''

new_avaliar = '''**OBJETIVO:**
Atuar como Curador Acadêmico Médico rigoroso. Selecionar O MELHOR material (videoaula) para estudantes de medicina.

**CONTEXTO:**
Lista de resultados de pesquisa do YouTube com ID, Título, Canal e Descrição.

**AÇÕES:**
1. Analise o Tema/Termo para entender o foco clínico.
2. Classifique a Autoridade do Canal: priorize canais consolidados (SanarFlix, Estratégia MED, Medway, Afya, Medcel).
3. Eleja a opção de maior profundidade científica.
4. Se não houver candidato aceitável em português, defina o ID como 'NENHUM'.

**NORMAS:**
1. **Filtro de Leigos:** REJEITE vídeos para pacientes leigos.
2. **Filtro de Idioma:** PROIBIDO selecionar vídeos em inglês. Se todas as opções forem estrangeiras, defina `video_escolhido_id` como 'NENHUM'.
3. **Alucinação Zero:** NUNCA invente um ID que não esteja nas opções.
4. **Formato JSON:** O retorno deve ser um JSON bruto. NUNCA utilize blocos delimitadores markdown.

**EXEMPLOS:**
Input: [Opções de vídeos sobre fisiopatologia]
Output: {"video_escolhido_id": "dQw4w9WgXcQ", "titulo_formatado": "Fisiopatologia da ICC"}

**SAÍDA:**
Retorne o JSON conforme o schema CuradoriaVideo.'''

cell_12_source = cell_12_source.replace(old_avaliar, new_avaliar)
nb['cells'][12]['source'] = split_to_notebook_lines(cell_12_source)


# 2. Update Cell 14
cell_14_source = "".join(nb['cells'][14]['source'])

new_conversao = """SYSTEM_PROMPT_CONVERSAO = '''**OBJETIVO:**
Você vai atuar como um Analista de Estruturação Acadêmica. O objetivo é converter um roteiro de leitura bruto (gerado no NotebookLM) para JSON rigorosamente estruturado para uso no Google Colab.

**CONTEXTO:**
O Roteiro a converter será fornecido na entrada.
ARQUIVOS DISPONÍVEIS NO DRIVE E SEUS OFFSETS:
{tabela_offsets}

**AÇÕES:**
1. **Análise de Fusão:** Analise todos os objetivos em conjunto. Se houver cortes do mesmo capítulo/arquivo em objetivos diferentes, e os temas forem complementares, marque para fusão. Ao fundir, agrupe por CAPÍTULO e ordene (conceito -> mecanismo -> clinica). Adicione o campo "fusao" como lista com os títulos originais.
2. **Análise de Sobreposição:** Registre internamente todas as páginas alocadas por arquivo. Para cada novo corte, verifique se alguma página já foi alocada; se houver sobreposição, remova a página duplicada do corte atual. NUNCA repita a mesma página do mesmo arquivo.
3. **Cálculo de Paginação (Offsets):** Para a chave "paginas":
   - Localize o arquivo e o offset na tabela do contexto.
   - Expanda o intervalo do roteiro para lista completa ANTES de aplicar o offset.
   - Se o texto indicar "sem numeração impressa", o offset é 0 (use direto o número fornecido).
   - Some o offset a CADA número individualmente. Se algum número resultante for <= 0, preencha a chave paginas apenas com a string "VERIFICAR_OFFSET". O campo recebe APENAS os números já convertidos.
4. **Classificação de Nível:** Para cada corte, defina o "nivel" como "conceito", "mecanismo" ou "clinica".

**NORMAS:**
- Se um objetivo tiver "⚠️ SEM COBERTURA", ignore-o no JSON (não o inclua na lista final).
- O retorno deve ser um JSON bruto. NUNCA utilize blocos delimitadores markdown (ex: ```json).
- NUNCA inclua texto explicativo antes ou depois do JSON.
- As chaves "objetivo", "titulo", "arquivo", "capitulo" e "secao" devem ser preenchidas estritamente conforme regras anteriores.

**EXEMPLOS:**
Input: Roteiro com cortes.
Output: (Vide seção SAÍDA).

**SAÍDA:**
Retorne a saída exclusivamente na seguinte estrutura JSON:
[
  {
    "objetivo": "01",
    "titulo": "Título unificado se houve fusão, ou original",
    "fusao": ["Obj. 01 — Titulo A", "Obj. 03 — Titulo B"],
    "cortes": [
      {
        "arquivo": "Parte_1_Saito.pdf",
        "capitulo": "Cap. 13",
        "secao": "Processo Metastático",
        "nivel": "conceito",
        "paginas": [261, 262]
      }
    ]
  }
]
'''"""

cell_14_source = re.sub(r"SYSTEM_PROMPT_CONVERSAO = '''(.*?)'''", new_conversao, cell_14_source, flags=re.DOTALL)
nb['cells'][14]['source'] = split_to_notebook_lines(cell_14_source)

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)
    f.write('\n')
