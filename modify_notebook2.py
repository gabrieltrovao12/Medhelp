import os

NOTEBOOK_PATH = r"c:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\colab\Orquestrador_Hibrido.ipynb"

def fix_notebook():
    with open(NOTEBOOK_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the problematic line
    old_line = "client = genai.Client(api_key=api_key, http_options={'timeout': 300.0})"
    new_line = "client = genai.Client(api_key=api_key, http_options={'timeout': 300000})"
    
    if old_line in content:
        content = content.replace(old_line, new_line)
        with open(NOTEBOOK_PATH, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Notebook updated successfully with timeout 300000.")
    else:
        print("Target line not found in the notebook.")

if __name__ == '__main__':
    fix_notebook()
