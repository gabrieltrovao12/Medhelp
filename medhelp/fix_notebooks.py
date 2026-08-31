import json

def replace_in_notebook(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = f.read()
    
    for old, new in replacements:
        data = data.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(data)

replace_in_notebook(
    "/home/vvgfilhos/medhelp/scripts/colab/pdf-premium/colab_gerador_pdf_premium.ipynb",
    [
        ("RESUMOS_DIR = f\\\"{BASE_DIR}/Resumos_Prontos\\\"", "RESUMOS_DIR = f\\\"{BASE_DIR}/Resumos_Prontos - UNDB\\\" if FACULDADE == 'UNDB' else f\\\"{BASE_DIR}/Resumos_Prontos\\\""),
        ("PDFS_DIR = f\\\"{BASE_DIR}/PDFs_Premium\\\"", "PDFS_DIR = f\\\"{BASE_DIR}/PDFs_Premium - UNDB\\\" if FACULDADE == 'UNDB' else f\\\"{BASE_DIR}/PDFs_Premium\\\""),
        ("ARQUIVO_DIR = f\\\"{BASE_DIR}/Resumos_Prontos/Arquivados\\\"", "ARQUIVO_DIR = f\\\"{BASE_DIR}/Arquivados - UNDB\\\" if FACULDADE == 'UNDB' else f\\\"{BASE_DIR}/Resumos_Prontos/Arquivados\\\"")
    ]
)

print("Replacement complete.")
