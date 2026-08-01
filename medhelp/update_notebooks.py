import json
import os

def update_orquestrador():
    path = "scripts/colab/Orquestrador_Hibrido.ipynb"
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace Colors (Orquestrador Capas/Separadores)
    content = content.replace("'#3b5bdb'", "'#556b2f'") # Azul -> Moss Green
    content = content.replace("'#1a1a2e'", "'#2c3e50'") # Preto -> Slate
    content = content.replace("'#2b8a3e'", "'#a3b18a'") # Verde Pg -> Light Green
    content = content.replace("'#1565c0'", "'#556b2f'") # Link Azul -> Moss Green
    content = content.replace("'#dddddd'", "'#e2e8f0'") # Divisor -> Subtle border
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Orquestrador_Hibrido atualizado.")

def update_gerador_premium():
    path = "scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb"
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    new_css = """CSS_PREMIUM = \\"\\"\\"
@page {
    size: A4;
    margin: 18mm 15mm 18mm 15mm;
    @bottom-center {
        content: counter(page);
        font-family: serif;
        font-size: 9pt;
        color: #94a3b8;
    }
    @bottom-left {
        content: "© Conteúdo Autoral • João Gabriel R. Trovão";
        font-family: serif;
        font-size: 8.5pt;
        color: #64748b;
    }
}

body {
    font-family: "Roboto", sans-serif;
    font-size: 10.5pt;
    line-height: 1.65;
    color: #2c3e50; /* Slate escuro orgânico */
    background-color: #ffffff;
}

/* ---- TÍTULOS E CABEÇALHOS (MIX EDITORIAL + CLEAN) ---- */
h1, h2, h3, h4 {
    font-family: "Roboto", serif; /* Serif para dar ar acadêmico/editorial */
    page-break-after: avoid;
}

h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.5px;
    padding-bottom: 8pt;
    margin-top: 0;
    margin-bottom: 1.2em;
    border-bottom: 1pt solid #cbd5e1; /* Hairline rule da Opção A */
}

h2 {
    font-size: 14pt;
    font-weight: 600;
    color: #556B2F; /* Verde Musgo */
    padding-bottom: 6pt;
    border-bottom: 0.5pt solid #e2e8f0; /* Linha de base limpa */
    margin-top: 2em;
    margin-bottom: 1em;
}

h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #2c3e50;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

strong {
    color: #1a1a1a;
    font-weight: 700;
}

/* Mistura B: Fundo pastel hiper-suave com borda da Opção A */
blockquote {
    border-left: 2pt solid #A3B18A; /* Verde Claro */
    margin: 1.5em 0;
    padding: 10pt 14pt;
    background-color: #fcfdfc; /* Fundo off-white areia/verde */
    color: #555555;
    font-style: italic;
    page-break-inside: avoid;
    border-radius: 0 4pt 4pt 0;
}

/* ---- TABELAS ---- */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
    font-size: 9.5pt;
    page-break-inside: auto;
}

tr {
    page-break-inside: avoid;
}

th {
    color: #1a1a1a;
    padding: 8pt 0;
    text-align: left;
    font-weight: 700;
    border-bottom: 1pt solid #1a1a1a;
}

td {
    padding: 8pt 0;
    border-bottom: 0.5pt solid #e2e8f0;
    vertical-align: top;
}

/* ---- LISTAS E BULLETS NATIVOS ---- */
ul {
    padding-left: 18pt;
    margin: 1em 0;
    list-style-type: disc;
}

ul li::marker {
    color: #556B2F; /* Verde Musgo */
}

ul ul {
    padding-left: 16pt;
    margin: 4pt 0 4pt 0;
    list-style-type: circle;
}

ul ul li::marker {
    color: #A3B18A;
}

ol {
    padding-left: 18pt;
    margin: 1em 0;
}

li {
    margin-bottom: 6pt;
    line-height: 1.55;
}

/* ---- FLUXOS E CASCATAS (A -> B -> C) Mix ---- */
/* Opção B: Continua como "chips" de apostila, mas muito mais elegante */
.fluxo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8pt;
    margin: 1em 0;
    page-break-inside: avoid;
}

.passo {
    background-color: #ffffff;
    border: 0.5pt solid #A3B18A; /* Borda Verde Claro */
    border-radius: 12pt;
    padding: 4pt 10pt;
    font-size: 9pt;
    color: #556B2F; /* Verde Musgo */
    font-weight: 600;
}

.seta {
    color: #A3B18A;
    font-weight: 800;
    font-size: 11pt;
}
\\"\\"\\"\n"""

    for cell in nb['cells']:
        if cell['cell_type'] == 'code':
            source = "".join(cell['source'])
            if 'CSS_PREMIUM =' in source:
                # Replace everything from CSS_PREMIUM = to the end of the string literal
                import re
                new_source = re.sub(r'CSS_PREMIUM = """.*?"""\n', new_css, source, flags=re.DOTALL)
                
                # Split back into lines
                lines = new_source.splitlines(True)
                cell['source'] = lines

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2, ensure_ascii=False)
        
    print("Gerador PDF Premium atualizado.")

if __name__ == "__main__":
    update_orquestrador()
    update_gerador_premium()
