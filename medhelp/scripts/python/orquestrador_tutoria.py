import argparse
import asyncio
import logging
import json
import os
import io
import re
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
logging.getLogger("pypdf").setLevel(logging.ERROR)

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

class ValidacaoCorte(pydantic.BaseModel):
    pagina_inicial_ajustada: int = pydantic.Field(description="Página real onde a explicação técnica do objetivo inicia no PDF")
    pagina_final_ajustada: int = pydantic.Field(description="Página real onde a explicação técnica do objetivo termina no PDF")
    resumo_cobertura: str = pydantic.Field(description="Síntese curta em 1 frase dos tópicos do objetivo validados no capítulo")

class TocItem(pydantic.BaseModel):
    nivel: int
    titulo: str
    pagina: int

class TocExtracted(pydantic.BaseModel):
    itens: list[TocItem]

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

async def extract_toc_with_gemini(pdf_path: str) -> list:
    """Extrai o sumário filtrando especificamente as páginas de sumário do PDF via LLM"""
    try:
        doc = fitz.open(pdf_path)
        toc_text = ""
        toc_pages = []
        max_scan = min(35, len(doc))
        for i in range(max_scan):
            page_text = doc[i].get_text("text")
            page_lower = page_text.lower()
            if any(kw in page_lower for kw in ["sumário", "sumario", "índice", "indice", "table of contents", "conteúdo", "conteudo"]):
                toc_pages.append(i)
        if toc_pages:
            selected_indices = set()
            for p in toc_pages:
                for offset in range(-1, 5):
                    idx = p + offset
                    if 0 <= idx < len(doc):
                        selected_indices.add(idx)
            for idx in sorted(selected_indices):
                toc_text += f"\n--- PÁGINA {idx+1} ---\n" + doc[idx].get_text("text")
        else:
            for i in range(min(25, len(doc))):
                toc_text += f"\n--- PÁGINA {i+1} ---\n" + doc[i].get_text("text")
        doc.close()
        
        if not toc_text.strip():
            return []
            
        sys_prompt = """Você é um especialista em estruturação de metadados de PDFs de medicina.
Sua missão é extrair o Sumário (Table of Contents - TOC) do texto fornecido.
O texto fornecido representa as primeiras páginas do livro.
REGRAS OCANES:
1. Encontre a seção "Sumário" ou "Índice".
2. Extraia CADA item do sumário.
3. Para cada item, determine o Nível Hierárquico (ex: Parte I = 1, Capítulo 1 = 2, Subseção = 3).
4. Para cada item, extraia o Título.
5. Para cada item, extraia a PÁGINA. Tente retornar a página REAL do PDF (ex: página do sumário + deslocamento das páginas iniciais).
6. Retorne estritamente o Schema JSON exigido."""

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key: return []

        config = LocalAgentConfig(
            response_schema=TocExtracted,
            system_instructions=sys_prompt,
            model="gemini-3.5-flash",
            api_key=api_key
        )
        
        async with Agent(config) as agent:
            logging.info(f"Extraindo TOC de {os.path.basename(pdf_path)} via LLM...")
            prompt = f"TEXTO DO SUMÁRIO DO LIVRO:\n{toc_text}"
            response = await agent.chat(prompt)
            data = await response.structured_output()
            
            toc = []
            if data and data.itens:
                for item in data.itens:
                    toc.append([item.nivel, item.titulo, item.pagina])
            return toc
    except Exception as e:
        logging.error(f"Erro na extração de TOC via LLM para {pdf_path}: {e}")
        return []

async def get_pdfs_tocs(folder_path: str):
    """Lê a pasta de referências e extrai o sumário de todos os PDFs."""
    tocs = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(folder_path, filename)
            try:
                doc = fitz.open(filepath)
                toc = doc.get_toc()
                doc.close()
                if not toc or len(toc) < 15:
                    logging.warning(f"O arquivo {filename} não possui um sumário (TOC) digital válido. Iniciando extração via IA...")
                    toc = await extract_toc_with_gemini(filepath)
                    if not toc:
                        logging.warning(f"A IA também falhou ao extrair TOC de {filename}.")
                tocs[filename] = toc
            except Exception as e:
                logging.error(f"Erro ao ler TOC de {filename}: {e}")
    return tocs

def merge_and_sort_cortes(cortes: list[Corte]) -> list[Corte]:
    """Mescla cortes adjacentes do mesmo capítulo e ordena por página inicial."""
    if not cortes:
        return []
    
    from collections import defaultdict
    grouped = defaultdict(list)
    for c in cortes:
        grouped[(c.arquivo, c.capitulo)].append(c)
        
    merged = []
    for (arquivo, capitulo), lista_cortes in grouped.items():
        lista_cortes.sort(key=lambda x: x.pagina_inicial)
        current_corte = lista_cortes[0]
        
        for next_corte in lista_cortes[1:]:
            if next_corte.pagina_inicial <= current_corte.pagina_final + 1:
                current_corte.pagina_final = max(current_corte.pagina_final, next_corte.pagina_final)
            else:
                merged.append(current_corte)
                current_corte = next_corte
        merged.append(current_corte)
        
    ordem = {"conceito": 0, "mecanismo": 1, "clinica": 2}
    merged.sort(key=lambda x: (x.pagina_inicial, ordem.get(x.nivel, 99)))
    return merged

OFFSETS_MANUAIS = {
    "SAito.pdf": 15
}

def obter_offset_pdf(source_pdf: str, manual_offsets: dict = None) -> int:
    if manual_offsets is None:
        manual_offsets = OFFSETS_MANUAIS
    filename = os.path.basename(source_pdf)
    if filename in manual_offsets:
        return manual_offsets[filename]
    try:
        doc = fitz.open(source_pdf)
        toc = doc.get_toc()
        if toc:
            for item in toc:
                phys_page = item[2]
                if isinstance(phys_page, int) and 1 <= phys_page <= len(doc):
                    text = doc[phys_page - 1].get_text("text")
                    lines = [line.strip() for line in text.split('\n') if line.strip().isdigit()]
                    for num_str in lines:
                        printed_num = int(num_str)
                        diff = phys_page - printed_num
                        if 0 <= diff < 100:
                            doc.close()
                            return diff
        doc.close()
    except Exception as e:
        logging.warning(f"Erro ao autodetectar offset de {filename}: {e}")
    return 0

def reconciliar_e_calcular_limites_corte(source_pdf, capitulo_nome, pag_ini_gemini, pag_fim_gemini):
    offset = obter_offset_pdf(source_pdf, OFFSETS_MANUAIS)
    try:
        doc = fitz.open(source_pdf)
        toc = doc.get_toc()
        total_pages = len(doc)
        doc.close()
        
        p_ini_fisica_gemini = pag_ini_gemini + offset
        p_fim_fisica_gemini = pag_fim_gemini + offset
        
        if toc:
            toc_match_page = None
            cap_num_match = re.search(r'^\s*(\d+)', capitulo_nome)
            for item in toc:
                title = str(item[1])
                page_num = item[2]
                if isinstance(page_num, int):
                    if capitulo_nome.lower().strip() in title.lower().strip() or title.lower().strip() in capitulo_nome.lower().strip():
                        toc_match_page = page_num
                        break
                    elif cap_num_match:
                        item_num_match = re.search(r'^\s*(\d+)', title)
                        if item_num_match and item_num_match.group(1) == cap_num_match.group(1):
                            toc_match_page = page_num
                            break
            p_ini_real = p_ini_fisica_gemini
            if toc_match_page is not None and abs(toc_match_page - p_ini_fisica_gemini) > 3:
                logging.info(f"ℹ️ Self-Healing TOC: Reconciliando início de '{capitulo_nome}' de física {p_ini_fisica_gemini} para {toc_match_page} (Página Física do TOC).")
                p_ini_real = toc_match_page
            next_pages = sorted([item[2] for item in toc if isinstance(item[2], int) and item[2] > p_ini_real])
            if next_pages:
                p_fim_real = next_pages[0] - 1
            else:
                p_fim_real = max(p_fim_fisica_gemini, total_pages)
            return p_ini_real, max(p_fim_fisica_gemini, p_fim_real)
    except Exception as e:
        logging.warning(f"Falha na reconciliação de TOC para {source_pdf}: {e}")
    return pag_ini_gemini + offset, max(pag_fim_gemini + offset, pag_ini_gemini + offset + 15)

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

            # Reconciliação Defensiva e Aplicação de Offset (Página Impressa -> Página Física)
            p_ini_fisica, p_fim_fisica = reconciliar_e_calcular_limites_corte(source_pdf, corte.capitulo, corte.pagina_inicial, corte.pagina_final)
            logging.info(f"ℹ️ Fatiando '{corte.capitulo}' em '{corte.arquivo}': Impresso {corte.pagina_inicial}–{corte.pagina_final} -> Físico {p_ini_fisica}–{p_fim_fisica}.")
                
            current_book_chapter = f"{corte.arquivo}_{corte.capitulo}"
            
            # 2. Adicionar Separador se for um novo livro/capítulo
            if current_book_chapter != last_book_chapter:
                separador_page = create_separator_page(corte.arquivo, corte.capitulo)
                writer.add_page(separador_page)
                last_book_chapter = current_book_chapter
            
            # 3. Adicionar as Páginas Reais do PDF
            reader = PdfReader(source_pdf)
            total_pages = len(reader.pages)
            
            p_ini = max(0, p_ini_fisica - 1)
            p_fim = min(total_pages, p_fim_fisica)
            
            for p_num in range(p_ini, p_fim):
                writer.add_page(reader.pages[p_num])
                
        with open(obj_pdf_path, "wb") as f_out:
            writer.write(f_out)
        logging.info(f"Salvo: {obj_pdf_path} | Páginas: {len(writer.pages)}")

# ==============================================================================
# AGENT RUNNERS
# ==============================================================================

async def call_agent_with_fallback(system_prompt, prompt, response_schema, max_retries=6):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY não foi encontrada no ambiente ou arquivo .env!")

    models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']
    
    for tentativa in range(max_retries):
        model_to_use = models[min(tentativa, len(models)-1)]
        try:
            config = LocalAgentConfig(
                response_schema=response_schema,
                system_instructions=system_prompt,
                model=model_to_use,
                api_key=api_key
            )
            async with Agent(config) as agent:
                response = await agent.chat(prompt)
                data = await response.structured_output()
                if not data:
                    raise ValueError("O modelo não retornou um JSON válido.")
                return data
        except Exception as e:
            wait_time = 4 * (2 ** tentativa)
            logging.error(f"Erro na API do Gemini com {model_to_use} (Tentativa {tentativa+1}/{max_retries}): {e}")
            logging.info(f"Aguardando {wait_time}s antes da próxima tentativa com backoff exponencial...")
            await asyncio.sleep(wait_time)
            
    return None

async def process_roteiro(objetivos_text: str, tocs: dict, refs_dir: str = None):
    contexto_tocs = "SUMÁRIOS DISPONÍVEIS NAS REFERÊNCIAS:\n\n"
    has_valid_toc = False
    
    for arquivo, toc in tocs.items():
        if toc:
            has_valid_toc = True
            source_pdf = os.path.join(refs_dir, arquivo) if refs_dir else arquivo
            offset = obter_offset_pdf(source_pdf, OFFSETS_MANUAIS)
            contexto_tocs += f"Livro: {arquivo} (Offset de pré-texto: {offset} páginas)\n"
            for item in toc:
                nivel, titulo, phys_page = item
                indent = "  " * (nivel - 1)
                printed_page = max(1, phys_page - offset) if isinstance(phys_page, int) else phys_page
                contexto_tocs += f"{indent}- {titulo} (Página Impressa no Livro: {printed_page})\n"
            contexto_tocs += "\n"

    if not has_valid_toc:
        logging.error("Nenhum livro fornecido possui Sumário (TOC) válido. Abortando processo de LLM.")
        return None

    system_prompt = """[O]
Atuar como Orquestrador de Tutoria Médica (PBL), mapeando Objetivos de Aprendizagem para os capítulos cirurgicamente precisos dentro das literaturas disponíveis.

[C]
Você receberá os SUMÁRIOS DISPONÍVEIS e os OBJETIVOS DE APRENDIZAGEM A MAPEAR.
O sumário contém o título do capítulo e a PÁGINA IMPRESSA NO LIVRO (número no rodapé).

[A]
1. Analise o objetivo de aprendizagem.
2. Identifique na literatura qual(is) capítulo(s) o abordam perfeitamente.
3. Defina a `pagina_inicial` como a página IMPRESSA exata em que o capítulo inicia (fornecida no sumário).
4. Calcule rigorosamente a `pagina_final`: localize o capítulo IMEDIATAMENTE subsequente no sumário do mesmo nível e subtraia 1 da página impressa dele. 
5. Se for o último capítulo do livro, calcule `pagina_final` como pagina_inicial + 15.
6. Classifique o nível didático em 'conceito', 'mecanismo' ou 'clinica'.

[N]
- REGRA DE OURO: Use EXCLUSIVAMENTE os números de páginas impressas presentes no sumário para pagina_inicial e pagina_final. NUNCA aplique offsets por conta própria.
- NUNCA iguale a pagina_final com a pagina_inicial. Um capítulo sempre tem extensão de múltiplas páginas.
- NÃO invente capítulos, use APENAS os do sumário.
- Retorne EXATAMENTE os dados no schema JSON, sem blocos markdown ao redor.

[E]
Se o sumário tem: "- Metástase (Página Impressa no Livro: 245)" e logo depois "- Biomarcadores (Página Impressa no Livro: 261)"
Seu corte deve ser pagina_inicial: 245 e pagina_final: 260."""

    logging.info("Solicitando mapeamento estruturado via Fallback/Backoff...")
    prompt = f"{contexto_tocs}\n\nOBJETIVOS DE APRENDIZAGEM A MAPEAR:\n{objetivos_text}"
    data = await call_agent_with_fallback(system_prompt, prompt, RoteiroTutoria)
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
    tocs = await get_pdfs_tocs(args.refs)
    
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
