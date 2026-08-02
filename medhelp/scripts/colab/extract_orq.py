import json
import os

notebook_path = r"c:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\colab\Orquestrador_Hibrido.ipynb"
output_path = r"c:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\colab\orquestrador_cells.txt"

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

with open(output_path, 'w', encoding='utf-8') as out:
    for i, cell in enumerate(nb['cells']):
        if cell['cell_type'] == 'code':
            out.write(f"\n\n--- CELL {i} ---\n")
            out.write("".join(cell['source']))
