import re

with open("scripts/generate_notebook.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update def process_roteiro signature
content = content.replace("async def process_roteiro(objetivos_text, tocs):", "async def process_roteiro(objetivos_text, tocs, refs_dir):")

# 2. Update context logic inside process_roteiro
old_context_logic = """    contexto = "SUMÁRIOS:\\n"
    for arquivo, toc in tocs.items():
        if toc:
            contexto += f"Livro: {arquivo}\\n"
            for item in toc:
                contexto += f"{'  '*(item[0]-1)}- {item[1]} (Página: {item[2]})\\n\""""

new_context_logic = """    contexto = "CONTEÚDO DOS LIVROS DISPONÍVEIS:\\n"
    for arquivo, toc in tocs.items():
        if toc:
            contexto += f"\\n--- LIVRO COM SUMÁRIO: {arquivo} ---\\n"
            for item in toc:
                contexto += f"{'  '*(item[0]-1)}- {item[1]} (Página: {item[2]})\\n"
        else:
            print(f"⚠️ Aviso: O livro '{arquivo}' não possui sumário digital. O agente extrairá o texto completo (isso pode demorar uns segundos).")
            contexto += f"\\n--- LIVRO SEM SUMÁRIO (TEXTO COMPLETO): {arquivo} ---\\n"
            pdf_path = os.path.join(refs_dir, arquivo)
            texto_bruto = extrair_texto_paginas(pdf_path, 1, 9999)
            contexto += f"Este livro não tem sumário estruturado. Abaixo está o texto bruto do livro:\\n{texto_bruto}\\n\""""

content = content.replace(old_context_logic, new_context_logic)

# 3. Update the call to process_roteiro
content = content.replace("roteiro = await process_roteiro(objetivos_text, tocs)", "roteiro = await process_roteiro(objetivos_text, tocs, refs_dir)")

# 4. Update the system_prompt entirely
old_prompt_start = '    system_prompt = """[O] - OBJETIVO'
old_prompt_end = 'Retorne o JSON puro e direto."""\n'

new_prompt = '''    system_prompt = """[O] - OBJETIVO
Você é um orquestrador algorítmico de Roteiros de Tutoria (PBL) de Medicina. Sua função é mapear Objetivos de Aprendizagem para as páginas exatas dos livros fornecidos, maximizando a precisão do corte.

[C] - CONTEXTO
Você recebe o conteúdo dos livros (Ground Truth).
- Para livros BEM FORMATADOS, você recebe o Sumário Digital (Nível Hierárquico, Título e Página Inicial).
- Para livros MAL FORMATADOS (Sem Sumário), você recebe o Texto Integral do livro com marcações '--- PÁGINA X ---'.

[A] - AÇÕES
Pense passo a passo para cada objetivo:
1. Desconstrua os temas centrais do objetivo de aprendizagem.
2. Varra os livros fornecidos buscando a subseção exata ou a primeira página exata que responde a cada tema.
3. Se o objetivo contiver múltiplos temas dispersos (ex: cocaína, álcool), fragmente-os em múltiplos cortes independentes.
4. Defina a `pagina_inicial` correspondente ao início do assunto.
5. Defina a `pagina_final` correspondente ao fim do assunto. Em sumários, é a página do item IMEDIATAMENTE SEGUINTE menos 1. No Texto Integral, é a página onde o assunto termina ou se dilui.
6. Classifique o nível didático do corte (`conceito`, `mecanismo` ou `clinica`).

[N] - NORMAS (CRÍTICO)
- NEGATIVO: NUNCA crie um corte gigante (ex: 30 páginas) para englobar temas distintos se houver "lixo" no meio. Crie objetos independentes.
- NEGATIVO: NUNCA invente páginas ou subseções que não estão no contexto fornecido.
- POSITIVO: Se o termo exato (ex: 'Metástase') não estiver no sumário, infira e mapeie o capítulo maior que logicamente engloba o assunto (ex: 'Neoplasias' ou 'Oncologia').
- POSITIVO: Para livros com TEXTO INTEGRAL, busque a PÁGINA exata onde a espinha dorsal semântica do assunto é discutida lendo as marcações '--- PÁGINA X ---'.
- POSITIVO: Busque cortes cirúrgicos de 2 a 10 páginas. O foco é a precisão absoluta.

[E] - EXEMPLOS (FEW-SHOT)
Exemplo 1 (Livro com Sumário):
Objetivo: "Efeitos da Maconha e Cocaína".
Contexto Fornecido:
--- LIVRO COM SUMÁRIO: Farmaco.pdf ---
Nível 1: Drogas
Nível 2: Cocaína (p.50)
Nível 2: Heroína (p.60)
Nível 2: Maconha (p.70)
Nível 2: Álcool (p.80)

Raciocínio: O objetivo pede Maconha e Cocaína. "Drogas" é muito amplo. Devo separar os temas. A seção de Cocaína vai da p.50 até p.59. A de Maconha da p.70 até p.79.
Cortes Gerados:
- Corte 1: "Cocaína" (p.50 até 59).
- Corte 2: "Maconha" (p.70 até 79).

[S] - SAÍDA
Retorne OBRIGATORIAMENTE os dados estruturados conforme o JSON Schema exigido pela API (`RoteiroTutoria`). NÃO encapsule a resposta em blocos de código Markdown (como ```json). Retorne o JSON puro e direto."""
'''

# Use regex to replace the system prompt
content = re.sub(r'    system_prompt = """\[O\] - OBJETIVO.*?Retorne o JSON puro e direto."""\n', new_prompt, content, flags=re.DOTALL)

with open("scripts/generate_notebook.py", "w", encoding="utf-8") as f:
    f.write(content)

print("generate_notebook.py updated!")
