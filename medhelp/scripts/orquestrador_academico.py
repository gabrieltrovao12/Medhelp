import argparse
import asyncio
import logging
import json
import os
import pydantic
from google.antigravity import Agent, LocalAgentConfig, types

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# ==============================================================================
# SCHEMAS (STRUCTURED OUTPUT)
# ==============================================================================

class Flashcard(pydantic.BaseModel):
    pergunta: str
    resposta_topicos: list[str]

class FlashcardSet(pydantic.BaseModel):
    cartoes: list[Flashcard]

class Afirmativa(pydantic.BaseModel):
    numero_romano: str
    texto_afirmativa: str
    verdadeira: bool
    justificativa_tecnica: str

class Alternativa(pydantic.BaseModel):
    letra: str
    conteudo: str

class QuestaoProva(pydantic.BaseModel):
    caso_clinico: str
    afirmativas: list[Afirmativa]
    alternativas: list[Alternativa]
    alternativa_correta: str
    raciocinio_clinico: str

class ProvaSet(pydantic.BaseModel):
    questoes: list[QuestaoProva]

# ==============================================================================
# AGENT RUNNERS
# ==============================================================================

async def process_flashcards(fonte_text):
    config = LocalAgentConfig(
        response_schema=FlashcardSet,
        capabilities=types.CapabilitiesConfig(enable_subagents=True),
        system_instructions="""Você é o Orquestrador de Flashcards Médicos.
Sua missão é ler o texto acadêmico e gerar um volume denso de flashcards atômicos de altíssima qualidade (Verdade Terrestre Estendida).
Use subagentes em paralelo para fatiar o texto longo e processar diferentes seções simultaneamente.
Extraia os conceitos chave, fisiopatologia, dosagens (em mg/kg) e exames.
- Aplique marcações markdown em negrito nos conceitos principais.
- Aplique formatação `código` em dosagens e fármacos.
- Retorne a consolidação absoluta de todos os subagentes no schema final."""
    )
    
    async with Agent(config) as agent:
        logging.info("Solicitando flashcards aos subagentes...")
        response = await agent.chat(f"Por favor, acione subagentes para processar o seguinte texto e me retorne de 55 a 60 flashcards formatados de forma rica:\n\n{fonte_text}")
        data = await response.structured_output()
        return data

async def process_questoes(fonte_text):
    config = LocalAgentConfig(
        response_schema=ProvaSet,
        capabilities=types.CapabilitiesConfig(enable_subagents=True),
        system_instructions="""Você é o Orquestrador de Questões de Prova Médica (Clinical Vignettes).
Sua missão é criar questões de alta fidelidade com nível cognitivo de Aplicação, Análise e Síntese a partir do material base.
Use subagentes em paralelo para criar as questões a partir do texto fornecido.
Regras OCANES:
1. Construa Casos Clínicos densos (idades, exames com valores de referência entre parênteses).
2. Crie distratores de alta complexidade (falsos positivos, etc).
3. Nunca use absolutismos (sempre, nunca, apenas).
4. Retorne a consolidação das questões e seus gabaritos no schema final."""
    )
    
    async with Agent(config) as agent:
        logging.info("Solicitando questões aos subagentes...")
        response = await agent.chat(f"Por favor, acione subagentes para processar o seguinte texto e me retorne questões médicas complexas baseadas em casos clínicos:\n\n{fonte_text}")
        data = await response.structured_output()
        return data

# ==============================================================================
# RENDERIZADORES OBSIDIAN
# ==============================================================================

def save_flashcards(data, output_file):
    md_text = ""
    for card in data.get("cartoes", []):
        md_text += f"{card['pergunta']}\n?\n"
        for item in card['resposta_topicos']:
            # Replace blank lines within the topic to avoid breaking the card renderer
            clean_item = item.replace('\n', ' ')
            md_text += f"- {clean_item}\n"
        md_text += "\n"
    
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(md_text)
    logging.info(f"Flashcards salvos com sucesso em: {output_file}")

def save_questoes(data, output_file):
    md_text = ""
    for i, q in enumerate(data.get("questoes", [])):
        md_text += f"## Questão {i+1} (1,0 ponto)\n{q['caso_clinico']}\n\n"
        md_text += "A partir do caso exposto, julgue as afirmativas a seguir em Verdadeiras (V) ou Falsas (F) e justifique sua resposta:\n"
        
        for afir in q['afirmativas']:
            md_text += f"{afir['numero_romano']}. {afir['texto_afirmativa']}\n"
        
        md_text += "\nAssinale a alternativa que apresenta a sequência correta:\n"
        for alt in q['alternativas']:
            md_text += f"{alt['letra']}) {alt['conteudo']}\n"
            
        md_text += "\n---\n### Gabarito\n"
        md_text += f"**Resposta Correta:** {q['alternativa_correta']}\n"
        md_text += "**Análise das Alternativas:**\n"
        
        for afir in q['afirmativas']:
            status = "Verdadeira" if afir['verdadeira'] else "Falsa"
            md_text += f"- **Afirmativa {afir['numero_romano']} ({status}):** {afir['justificativa_tecnica']}\n"
            
        md_text += f"**Raciocínio Clínico:** {q['raciocinio_clinico']}\n\n"
        
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(md_text)
    logging.info(f"Questões salvas com sucesso em: {output_file}")

# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================

async def main():
    parser = argparse.ArgumentParser(description="Orquestrador Acadêmico Medhelp via Antigravity SDK")
    parser.add_argument("--tipo", choices=["flashcards", "questoes"], required=True)
    parser.add_argument("--fonte", help="Caminho para o arquivo de texto de entrada", required=True)
    args = parser.parse_args()

    if not os.path.exists(args.fonte):
        logging.error(f"Arquivo fonte não encontrado no caminho: {args.fonte}")
        return

    with open(args.fonte, "r", encoding="utf-8") as f:
        fonte_text = f.read()

    # Cofre Padrão
    base_dir = "/home/vvgfilhos/Gdrive/Obsidian/Faculdade de Medicina1/📈Negócio"
    
    # Derivar nome do arquivo final do nome do arquivo fonte
    base_name = os.path.splitext(os.path.basename(args.fonte))[0]

    if args.tipo == "flashcards":
        data = await process_flashcards(fonte_text)
        if data:
            output_dir = os.path.join(base_dir, "Flashcards")
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, f"{base_name}_flashcards.md")
            save_flashcards(data, output_file)
        else:
            logging.error("Falha ao gerar flashcards: validação de Schema pydantic falhou ou vazia.")
            
    elif args.tipo == "questoes":
        data = await process_questoes(fonte_text)
        if data:
            output_dir = os.path.join(base_dir, "Questões")
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, f"{base_name}_questoes.md")
            save_questoes(data, output_file)
        else:
            logging.error("Falha ao gerar questões: validação de Schema pydantic falhou ou vazia.")

if __name__ == "__main__":
    asyncio.run(main())
