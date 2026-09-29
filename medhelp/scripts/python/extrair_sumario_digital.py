#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medhelp — Extrator de Sumário Digital (Bookmarks) para NotebookLM
Gera arquivos Markdown (.md) macroscópicos com Partes, Capítulos e Seções com intervalos de páginas calculados.
Suporta:
1. Livros padrão de 2 níveis (Capítulos e Seções — Abbas, Robbins, Junqueira);
2. Tratados e livros estruturados em Partes/Unidades (Harrison, Guyton);
3. Detecção e reestruturação genérica de índices com marcadores achatados (Flattened TOC).
"""

import sys
import os
import argparse
import re
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

    if not output_path:
        diretorio = os.path.dirname(caminho_pdf) or "."
        output_path = os.path.join(diretorio, f"{nome_base} - Sumario_Digital.md")

    lvl1_titulos = [item[1].strip() for item in toc if item[0] == 1]
    
    # 1. Detectar tratados com Partes/Unidades (Nível 1 = Parte, Nível 2 = Seção, Nível 3 = Capítulo)
    tem_partes = any(
        re.match(r"^(parte|part|unidade|m[oó]dulo)\s+([0-9]+|[ivxlcdm]+)\b", t, re.IGNORECASE)
        for t in lvl1_titulos
    )
    tem_lvl3 = any(item[0] == 3 for item in toc)

    # 2. Detectar se os marcadores vieram achatados (ex: >80% nível 1, mas contendo capítulos numerados)
    lvl1_count = sum(1 for item in toc if item[0] == 1)
    is_flattened = (lvl1_count / max(1, len(toc))) > 0.8
    capitulos_numerados = [
        item for item in toc
        if re.match(r"^(\d{1,2}|capítulo\s+\d+)\b", item[1].strip(), re.IGNORECASE)
    ]
    is_flattened_numbered = is_flattened and len(capitulos_numerados) >= 3

    preliminares_ignorar = {
        "capa", "rosto", "página de rosto", "folha de rosto", "frontispício", 
        "créditos", "nota", "dedicatória", "dedicação", "revisão técnica", 
        "revisão científica e tradução", "revisão técnica e tradução",
        "organizadores", "organizadores das edições anteriores", "autores", 
        "colaboradores", "prefácio", "agradecimentos", "material suplementar", 
        "sumário", "sumário de vídeos e áudios", "gen"
    }

    itens_filtrados = []

    if is_flattened_numbered:
        in_chapter = False
        for item in toc:
            lvl, title, page = item[0], normalizar_espacos(item[1]), item[2]
            if title.lower() in preliminares_ignorar or re.search(r"\(\d{4}[–-]\d{4}\)", title):
                continue
            is_cap = bool(re.match(r"^(\d{1,2}|capítulo\s+\d+)\b", title, re.IGNORECASE))
            if is_cap:
                in_chapter = True
                itens_filtrados.append({"lvl": 1, "title": title, "page": page})
            elif in_chapter:
                itens_filtrados.append({"lvl": 2, "title": title, "page": page})
    else:
        for item in toc:
            lvl, title, page = item[0], normalizar_espacos(item[1]), item[2]
            if title.lower() in preliminares_ignorar or re.search(r"\(\d{4}[–-]\d{4}\)", title):
                continue
            
            if tem_partes and tem_lvl3:
                if lvl in (1, 2, 3):
                    itens_filtrados.append({"lvl": lvl, "title": title, "page": page})
            elif tem_partes and not tem_lvl3:
                if lvl in (1, 2):
                    itens_filtrados.append({"lvl": lvl, "title": title, "page": page})
            else:
                if lvl in (1, 2):
                    itens_filtrados.append({"lvl": lvl, "title": title, "page": page})

    if not itens_filtrados:
        print(f"⚠️ Nenhum capítulo/seção identificado na hierarquia de '{nome_arquivo}'.")
        return ""

    # Calcular intervalos de páginas (início e fim)
    for i in range(len(itens_filtrados)):
        atual = itens_filtrados[i]
        prox_pagina = total_paginas
        for j in range(i + 1, len(itens_filtrados)):
            if itens_filtrados[j]["page"] > atual["page"]:
                prox_pagina = itens_filtrados[j]["page"] - 1
                break
        atual["end_page"] = max(atual["page"], prox_pagina)

    # Para livros padrão de 2 níveis (ou achatados), o nível 1 (Capítulo) deve cobrir todo o capítulo até o próximo
    if not (tem_partes and tem_lvl3):
        for i in range(len(itens_filtrados)):
            if itens_filtrados[i]["lvl"] == 1:
                cap_end = total_paginas
                for j in range(i + 1, len(itens_filtrados)):
                    if itens_filtrados[j]["lvl"] == 1:
                        cap_end = itens_filtrados[j]["page"] - 1
                        break
                itens_filtrados[i]["end_page"] = cap_end

    # Construir Markdown Estruturado
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

    for item in itens_filtrados:
        p_inicio = item["page"]
        p_fim = item["end_page"]
        pag_str = f"pp. {p_inicio}–{p_fim}" if p_inicio != p_fim else f"pág. {p_inicio}"
        title = item["title"]
        lvl = item["lvl"]

        if tem_partes and tem_lvl3:
            if lvl == 1:
                linhas_md.append(f"\n## 📚 {title} | 📄 {pag_str}")
            elif lvl == 2:
                if any(w in title.lower() for w in ("seção", "secao")):
                    linhas_md.append(f"\n### {title} | 📄 {pag_str}")
                elif "capítulo" in title.lower() or "capitulo" in title.lower():
                    linhas_md.append(f"\n## 📚 {title} | 📄 {pag_str}")
                else:
                    linhas_md.append(f"- 📂 **{title}** | 📄 {pag_str}")
            elif lvl == 3:
                linhas_md.append(f"- 📂 **{title}** | 📄 {pag_str}")
        else:
            if lvl == 1:
                linhas_md.append(f"\n## 📚 {title} | 📄 {pag_str}")
            elif lvl == 2:
                linhas_md.append(f"- 📂 **{title}** | 📄 {pag_str}")

    conteudo_final = "\n".join(linhas_md) + "\n"

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
        print(f"📂 Processando {len(pdfs)} arquivo(s) PDF...")
        for pdf in sorted(pdfs):
            extrair_sumario_pdf(pdf)
    else:
        print(f"❌ Caminho inválido: {caminho}")


if __name__ == "__main__":
    main()
