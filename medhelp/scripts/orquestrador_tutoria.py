import argparse
import asyncio
import logging
import json
import os
import io
import pydantic
import fitz
from dotenv import load_dotenv
from google.antigravity import Agent, LocalAgentConfig, types
from pypdf import PdfReader, PdfWriter, PageObject
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# Carrega variáveis de ambiente, incluindo GEMINI_API_KEY
load_dotenv()

# ==============================================================================
# SCHEMAS (STRUCTURED OUTPUT)
# ==============================================================================

class Corte(pydantic.BaseModel):
    arquivo: str = pydantic.Field(description="Nome do arquivo PDF correspondente")
    capitulo: str = pydantic.Field(description="Nome do capítulo ou seção")
    nivel: str = pydantic.Field(description="'conceito', 'mecanismo' ou 'clinica'")
    pagina_inicial: int = pydantic.Field(description="Página real de início no PDF (não a impressa)")
    pagina_final: int = pydantic.Field(description="Página real de fim no PDF (não a impressa)")

class Objetivo(pydantic.BaseModel):
    numero: str = pydantic.Field(description="Número do objetivo (ex: '01')")
    titulo: str = pydantic.Field(description="Título ou texto completo do objetivo")
    cortes: list[Corte] = pydantic.Field(description="Lista de recortes necessários para esse objetivo")

class RoteiroTutoria(pydantic.BaseModel):
    objetivos: list[Objetivo]

# ==============================================================================
# ESTÉTICA E REPORTLAB (Capas Premium)
# ==============================================================================

def draw_wrapped_text(c, text, width, x, y, font, size, line_height, color):
    """Função auxiliar para quebrar texto em múltiplas linhas"""
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split(' ')
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        if c.stringWidth(' '.join(current_line), font, size) > width:
            current_line.pop()
            lines.append(' '.join(current_line))
            current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
        
    for line in lines:
        c.drawString(x, y, line)
        y -= line_height
    return y

def create_cover_page(objetivo_numero: str, objetivo_titulo: str) -> PageObject:
    """Cria a página de Capa do Objetivo usando ReportLab e retorna um objeto de página do pypdf"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    
    # Fundo escuro (Tema Medhelp)
    c.setFillColorRGB(0.1, 0.12, 0.15)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Detalhe Visual (Barra lateral)
    c.setFillColorRGB(0.2, 0.6, 0.86) # Azul Medhelp
    c.rect(0, 0, 20, height, fill=1, stroke=0)
    
    # Textos
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 42)
    c.drawString(60, height - 120, f"OBJETIVO {objetivo_numero}")
    
    c.setFont("Helvetica", 18)
    c.setFillColorRGB(0.8, 0.8, 0.8)
    c.drawString(60, height - 160, "Roteiro de Tutoria - PBL")
    
    # Título do objetivo com quebra de linha
    y_start = height - 260
    draw_wrapped_text(c, objetivo_titulo, width - 120, 60, y_start, "Helvetica-Bold", 24, 32, colors.white)
    
    c.save()
    packet.seek(0)
    new_pdf = PdfReader(packet)
    return new_pdf.pages[0]

def create_separator_page(livro: str, capitulo: str) -> PageObject:
    """Cria uma página separadora para cada troca de livro/capítulo"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=A4)
    width, height = A4
    
    # Fundo cinza escuro
    c.setFillColorRGB(0.95, 0.96, 0.98)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Linha decorativa
    c.setStrokeColorRGB(0.2, 0.6, 0.86)
    c.setLineWidth(4)
    c.line(50, height/2 + 50, width-50, height/2 + 50)
    
    # Livro
    y = draw_wrapped_text(c, f"Livro: {livro}", width - 100, 50, height/2 + 80, "Helvetica", 14, 20, colors.darkgray)
    
    # Capítulo
    draw_wrapped_text(c, capitulo, width - 100, 50, height/2 - 20, "Helvetica-Bold", 20, 28, colors.black)
    
    c.save()
    packet.seek(0)
    new_pdf = PdfReader(packet)
    return new_pdf.pages[0]

# ==============================================================================
# PDF PROCESSING
# ==============================================================================

def get_pdfs_tocs(folder_path: str):
    """Lê a pasta de referências e extrai o sumário de todos os PDFs."""
    tocs = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(folder_path, filename)
            try:
                doc = fitz.open(filepath)
                toc = doc.get_toc()
                if not toc:
                    logging.warning(f"O arquivo {filename} não possui um sumário (TOC) digital válido. "
                                    f"Este arquivo será ignorado pelo orquestrador. Adicione um OCR/Bookmarks nele se precisar usá-lo.")
                tocs[filename] = toc
                doc.close()
            except Exception as e:
                logging.error(f"Erro ao ler TOC de {filename}: {e}")
    return tocs

def merge_and_sort_cortes(cortes: list[Corte]) -> list[Corte]:
    """Mescla cortes adjacentes do mesmo arquivo e ordena didaticamente."""
    if not cortes:
        return []
    
    from collections import defaultdict
    grouped = defaultdict(list)
    for c in cortes:
        grouped[c.arquivo].append(c)
        
    merged = []
    for arquivo, lista_cortes in grouped.items():
        lista_cortes.sort(key=lambda x: x.pagina_inicial)
        current_corte = lista_cortes[0]
        
        for next_corte in lista_cortes[1:]:
            if next_corte.pagina_inicial <= current_corte.pagina_final + 3:
                current_corte.pagina_final = max(current_corte.pagina_final, next_corte.pagina_final)
            else:
                merged.append(current_corte)
                current_corte = next_corte
        merged.append(current_corte)
        
    ordem = {"conceito": 0, "mecanismo": 1, "clinica": 2}
    merged.sort(key=lambda x: ordem.get(x.nivel, 99))
    return merged

def gerar_pdfs(roteiro: RoteiroTutoria, pdfs_dir: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    
    for obj in roteiro.objetivos:
        obj_pdf_path = os.path.join(output_dir, f"Objetivo {obj.numero}.pdf")
        writer = PdfWriter()
        
        # 1. Adicionar Capa
        capa_page = create_cover_page(obj.numero, obj.titulo)
        writer.add_page(capa_page)
        
        cortes_mesclados = merge_and_sort_cortes(obj.cortes)
        
        if not cortes_mesclados:
            logging.warning(f"Objetivo {obj.numero} não possui cortes.")
            continue
            
        last_book_chapter = ""
        
        for corte in cortes_mesclados:
            source_pdf = os.path.join(pdfs_dir, corte.arquivo)
            if not os.path.exists(source_pdf):
                logging.error(f"Arquivo não encontrado: {source_pdf}")
                continue
                
            current_book_chapter = f"{corte.arquivo}_{corte.capitulo}"
            
            # 2. Adicionar Separador se for um novo livro/capítulo
            if current_book_chapter != last_book_chapter:
                separador_page = create_separator_page(corte.arquivo, corte.capitulo)
                writer.add_page(separador_page)
                last_book_chapter = current_book_chapter
            
            # 3. Adicionar as Páginas Reais do PDF
            reader = PdfReader(source_pdf)
            total_pages = len(reader.pages)
            
            p_ini = max(0, corte.pagina_inicial - 1)
            p_fim = min(total_pages, corte.pagina_final)
            
            for p_num in range(p_ini, p_fim):
                writer.add_page(reader.pages[p_num])
                
        with open(obj_pdf_path, "wb") as f_out:
            writer.write(f_out)
        logging.info(f"Salvo: {obj_pdf_path} | Páginas: {len(writer.pages)}")

# ==============================================================================
# AGENT RUNNERS
# ==============================================================================

async def process_roteiro(objetivos_text: str, tocs: dict):
    contexto_tocs = "SUMÁRIOS DISPONÍVEIS NAS REFERÊNCIAS:\n\n"
    has_valid_toc = False
    
    for arquivo, toc in tocs.items():
        if toc:
            has_valid_toc = True
            contexto_tocs += f"Livro: {arquivo}\n"
            for item in toc:
                nivel, titulo, pagina = item
                indent = "  " * (nivel - 1)
                contexto_tocs += f"{indent}- {titulo} (Página real: {pagina})\n"
            contexto_tocs += "\n"

    if not has_valid_toc:
        logging.error("Nenhum livro fornecido possui Sumário (TOC) válido. Abortando processo de LLM.")
        return None

    system_prompt = """Você é um Orquestrador de Roteiros de Tutoria Médica.
Sua missão é mapear os Objetivos de Aprendizagem fornecidos para os capítulos corretos dos livros disponíveis.

REGRAS (OCANES):
1. Use APENAS as páginas fornecidas nos sumários (TOCs) do contexto. Nunca invente capítulos ou livros.
2. Como você tem o sumário completo com a página inicial de cada capítulo, defina a `pagina_final` do corte como a página inicial do capítulo/seção SEGUINTE menos 1. Se for o último do livro, estime +15 páginas.
3. Se um objetivo abranger múltiplas doenças, crie cortes separados para cada doença/livro.
4. Classifique o nível didático rigorosamente como 'conceito', 'mecanismo' ou 'clinica'.
5. Retorne os dados EXATAMENTE no schema JSON solicitado."""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY não foi encontrada no ambiente ou arquivo .env!")

    config = LocalAgentConfig(
        response_schema=RoteiroTutoria,
        system_instructions=system_prompt,
        model="gemini-3.5-flash",
        api_key=api_key
    )
    
    async with Agent(config) as agent:
        logging.info("Solicitando mapeamento estruturado ao Gemini 3.5 Pro...")
        prompt = f"{contexto_tocs}\n\nOBJETIVOS DE APRENDIZAGEM A MAPEAR:\n{objetivos_text}"
        response = await agent.chat(prompt)
        data = await response.structured_output()
        return data

# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================

async def main():
    parser = argparse.ArgumentParser(description="Gerador Local de Roteiros de Tutoria")
    parser.add_argument("--objetivos", help="Arquivo txt/md com os objetivos", required=True)
    parser.add_argument("--refs", help="Pasta com os PDFs de referência", required=True)
    parser.add_argument("--saida", help="Pasta de saída para os PDFs gerados", required=True)
    args = parser.parse_args()

    if not os.path.exists(args.objetivos):
        logging.error(f"Arquivo de objetivos não encontrado: {args.objetivos}")
        return

    with open(args.objetivos, "r", encoding="utf-8") as f:
        objetivos_text = f.read()

    logging.info(f"Lendo PDFs da pasta: {args.refs}")
    tocs = get_pdfs_tocs(args.refs)
    
    data = await process_roteiro(objetivos_text, tocs)
    
    if data:
        logging.info("Mapeamento recebido com sucesso. Construindo PDFs (Capas e Cortes)...")
        gerar_pdfs(data, args.refs, args.saida)
        
        json_path = os.path.join(args.saida, "roteiro_gerado_auditoria.json")
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(data.model_dump_json(indent=2))
        logging.info("Processo 100% finalizado com Sucesso!")

if __name__ == "__main__":
    asyncio.run(main())
