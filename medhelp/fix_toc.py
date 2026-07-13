import re

with open("scripts/generate_notebook.py", "r", encoding="utf-8") as f:
    content = f.read()

old_func = """def get_pdfs_tocs(folder_path):
    tocs = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(folder_path, filename)
            try:
                doc = fitz.open(filepath)
                tocs[filename] = doc.get_toc()
                doc.close()
            except Exception as e:
                logging.error(f"Erro ao ler TOC de {filename}: {e}")
    return tocs"""

new_func = """def get_pdfs_tocs(folder_path):
    tocs = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(folder_path, filename)
            try:
                doc = fitz.open(filepath)
                toc = doc.get_toc()
                doc.close()
                if len(toc) < 15:
                    print(f"⚠️ Sumário de '{filename}' é muito pequeno ou inútil ({len(toc)} itens). Ignorando sumário digital.")
                    tocs[filename] = []
                else:
                    tocs[filename] = toc
            except Exception as e:
                logging.error(f"Erro ao ler TOC de {filename}: {e}")
    return tocs"""

content = content.replace(old_func, new_func)

with open("scripts/generate_notebook.py", "w", encoding="utf-8") as f:
    f.write(content)

print("generate_notebook.py updated!")
