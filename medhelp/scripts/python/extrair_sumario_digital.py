#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medhelp — Extrator de Sumário Digital (Bookmarks) para NotebookLM
Gera um arquivo Markdown macroscópico (.md) com Capítulos e Seções-Mãe com intervalos de páginas calculados.
"""

import sys
import os
import argparse
import fitz  # PyMuPDF


def normalizar_espacos(texto: str) -> str:
    return " ".join(texto.strip().split())


def extrair_sumario_pdf(caminho_pdf: str, output_path: str = None) -> str:
    if not os.path.exists(caminho_pdf):
        print(f"❌ Erro: Arquivo não encontrado: {caminho_pdf}")
        return ""

    nome_arquivo = os.path.basename(caminho_pdf)
    nome_base = os.path.splitext(nome_arquivo)[0]

    try:
        doc = fitz.open(caminho_pdf)
    except Exception as e:
        print(f"❌ Erro ao abrir PDF '{nome_arquivo}': {e}")
        return ""

    toc = doc.get_toc()
    total_paginas = doc.page_count
    doc.close()

    if not toc:
        print(f"⚠️ Aviso: '{nome_arquivo}' não possui bookmarks/sumário digital embutido.")
        return ""

    # Detectar hierarquia: identificar qual nível representa Capítulos e qual representa Seções
    import re
    contagem_niveis = {}
    for item in toc:
        lvl = item[0]
        contagem_niveis[lvl] = contagem_niveis.get(lvl, 0) + 1

    lvl1_titulos = [item[1].strip() for item in toc if item[0] == 1]
    
    # Se nível 1 tiver poucos itens (<= 8) e contiver 'Parte'/'Unidade', então Lvl 1 = Partes, Lvl 2 = Capítulos
    tem_partes = (
        len(lvl1_titulos) <= 8 and
        any(re.match(r"^(parte|part|unidade|m[oó]dulo)\s+([0-9]+|[ivxlcdm]+)\b", t, re.IGNORECASE) for t in lvl1_titulos)
    )
    
    nivel_capitulo = 2 if tem_partes else 1
    nivel_secao = 3 if tem_partes else 2

    # Filtrar apenas os itens de interesse (Capítulos e Seções-Mãe)
    # Ignorar páginas preliminares triviais se estiverem soltas
    preliminares_ignorar = {"capa", "rosto", "créditos", "nota", "dedicatória", "revisão técnica e tradução"}

    itens_filtrados = []
    for item in toc:
        lvl, title, page = item[0], normalizar_espacos(item[1]), item[2]
        if title.lower() in preliminares_ignorar:
            continue
        if lvl == nivel_capitulo:
            itens_filtrados.append({
                "lvl": lvl,
                "title": title,
                "page": page,
                "is_cap": True
            })
        elif lvl == nivel_secao:
            itens_filtrados.append({
                "lvl": lvl,
                "title": title,
                "page": page,
                "is_cap": False
            })

    if not itens_filtrados:
        print(f"⚠️ Nenhum capítulo/seção identificado na hierarquia de '{nome_arquivo}'.")
        return ""

    # Calcular intervalos de páginas (início e fim)
    for i in range(len(itens_filtrados)):
        atual = itens_filtrados[i]
        # Próximo item com página maior
        prox_pagina = total_paginas
        for j in range(i + 1, len(itens_filtrados)):
            if itens_filtrados[j]["page"] > atual["page"]:
                prox_pagina = itens_filtrados[j]["page"] - 1
                break
        atual["end_page"] = max(atual["page"], prox_pagina)

    # Construir Markdown Macroscópico
    linhas_md = [
        f"# Sumário Estruturado — {nome_base}",
        f"**Documento:** `{nome_arquivo}` | **Total de Páginas:** {total_paginas}",
        "",
        "> Este arquivo serve como mapa de navegação para a IA no NotebookLM.",
        "> Utilize os títulos das seções e as páginas abaixo como âncoras absolutas de evidência.",
        "",
        "---",
        ""
    ]

    cap_atual = None
    for item in itens_filtrados:
        p_inicio = item["page"]
        p_fim = item["end_page"]
        pag_str = f"pp. {p_inicio}–{p_fim}" if p_inicio != p_fim else f"pág. {p_inicio}"

        if item["is_cap"]:
            cap_atual = item["title"]
            linhas_md.append(f"\n## 📚 {cap_atual} | 📄 {pag_str}")
        else:
            linhas_md.append(f"- 📂 **{item['title']}** | 📄 {pag_str}")

    conteudo_final = "\n".join(linhas_md) + "\n"

    # Salvar arquivo
    if not output_path:
        diretorio = os.path.dirname(caminho_pdf) or "."
        output_path = os.path.join(diretorio, f"{nome_base} - Sumario_Digital.md")

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(conteudo_final)
        print(f"✅ Sumário gerado com sucesso ({len(itens_filtrados)} tópicos):")
        print(f"   📄 {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Erro ao salvar arquivo '{output_path}': {e}")
        return ""


def main():
    parser = argparse.ArgumentParser(
        description="Medhelp — Extrator de Sumário Digital de Livros-Texto Médicos para NotebookLM"
    )
    parser.add_argument("caminho", help="Caminho do arquivo PDF ou pasta contendo PDFs")
    parser.add_argument("-o", "--output", help="Arquivo ou pasta de destino para os .md gerados", default=None)

    args = parser.parse_args()
    caminho = args.caminho

    if os.path.isfile(caminho):
        if caminho.lower().endswith(".pdf"):
            extrair_sumario_pdf(caminho, args.output)
        else:
            print("❌ O arquivo informado não é um PDF.")
    elif os.path.isdir(caminho):
        pdfs = [os.path.join(caminho, f) for f in os.listdir(caminho) if f.lower().endswith(".pdf")]
        if not pdfs:
            print(f"⚠️ Nenhum PDF encontrado na pasta: {caminho}")
            return
        print(f"📂 Processando {len(pdfs)} arquivos PDF...")
        for pdf in sorted(pdfs):
            extrair_sumario_pdf(pdf)
    else:
        print(f"❌ Caminho inválido: {caminho}")


if __name__ == "__main__":
    main()
