import asyncio
import logging
import json
import pydantic
import sys
import os
import requests
from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# ==============================================================================
# SCHEMA DE RESPOSTA (O que o LLM vai devolver)
# ==============================================================================
class VideoCurado(pydantic.BaseModel):
    video_escolhido_id: str = pydantic.Field(description="Apenas a ID do vídeo escolhido (ex: dQw4w9WgXcQ)")
    titulo_formatado: str = pydantic.Field(description="O título formatado de forma limpa para exibição.")
    justificativa: str = pydantic.Field(description="Por que este vídeo foi escolhido em detrimento dos outros.")

# ==============================================================================
# BUSCA REAL (YouTube Data API v3)
# ==============================================================================
def obter_youtube_real(tema: str, api_key: str) -> list:
    print(f"\n[🔍 YouTube API] Buscando top 5 vídeos para '{tema}'...")
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{tema} medicina aula",
        "type": "video",
        "maxResults": 5,
        "key": api_key,
        "relevanceLanguage": "pt"
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    
    resultados = []
    for item in data.get("items", []):
        snippet = item.get("snippet", {})
        resultados.append({
            "id": item["id"]["videoId"],
            "title": snippet.get("title", ""),
            "channel": snippet.get("channelTitle", ""),
            "description": snippet.get("description", "")
        })
        
    return resultados

# ==============================================================================
# LÓGICA DE CURADORIA (Subagente LLM)
# ==============================================================================
def curar_melhor_video(tema: str, resultados: list, api_key: str) -> VideoCurado:
    resultados_txt = ""
    for i, vid in enumerate(resultados):
        resultados_txt += f"\nOpção {i+1}:\n- ID: {vid['id']}\n- Título: {vid['title']}\n- Canal: {vid['channel']}\n- Descrição: {vid['description']}\n"
    
    system_prompt = """Você é um curador acadêmico médico altamente rigoroso do ecossistema Medhelp.
Sua missão é receber uma lista de vídeos retornados pela API do YouTube e escolher O MELHOR vídeo para estudantes de medicina e residentes.

REGRAS OCANES DE SELEÇÃO:
1. PRIORIZE canais de educação médica consagrados (ex: SanarFlix, Jaleko, Estratégia MED, Medway, Sanches).
2. REJEITE sumariamente vídeos voltados para pacientes leigos ("dicas de saúde", "o que é a doença").
3. REJEITE aulas de biologia do ensino médio.
4. O vídeo escolhido deve abordar preferencialmente o tema com profundidade científica (fisiopatologia, diagnóstico, clínica).
5. Se não houver NENHUM vídeo adequado na lista, retorne a string 'NENHUM' na ID.
6. Retorne estritamente o Schema JSON solicitado."""

    user_prompt = f"Tema da Aula/Objetivo: {tema}\n\nAvalie e escolha a melhor opção entre os vídeos abaixo:\n{resultados_txt}"

    # Instanciando cliente oficial do Gemini
    client = genai.Client(api_key=api_key)
    
    print("\n[🤖 LLM] Avaliando opções de vídeo via Inteligência Artificial (Gemini)...")
    
    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=VideoCurado,
            temperature=0.0
        ),
    )
    
    # Fazendo parsing do JSON retornado usando Pydantic
    return VideoCurado.model_validate_json(response.text)

# ==============================================================================
# MAIN (Interativo)
# ==============================================================================
def main():
    print("=" * 60)
    print("🧠 MEDHELP: TESTE DE CURADORIA DE VÍDEOS (SUBAGENTE)")
    print("=" * 60)
    
    # 1. Chave da API do GEMINI (necessária para rodar localmente)
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("⚠️ Chave da API do Gemini (Google AI Studio) não encontrada no ambiente.")
        api_key = input("👉 Cole sua GEMINI_API_KEY aqui para testar (ou dê Ctrl+C para sair): ").strip()
        if not api_key:
            print("Erro: Chave obrigatória para rodar o modelo localmente.")
            sys.exit(1)

    # 2. Chave da API do YOUTUBE
    youtube_api_key = os.environ.get("YOUTUBE_API_KEY")
    if not youtube_api_key:
        print("⚠️ Chave da API do YouTube (Google Cloud Console) não encontrada no ambiente.")
        youtube_api_key = input("👉 Cole sua YOUTUBE_API_KEY aqui para testar (ou dê Ctrl+C para sair): ").strip()
        if not youtube_api_key:
            print("Erro: Chave obrigatória para rodar a busca no YouTube.")
            sys.exit(1)

    # 3. Interatividade do Tema
    try:
        tema = input("\nDigite o tema da aula que você quer testar (ex: 'Pneumonia'): ")
        if not tema.strip():
            tema = "Insuficiência Cardíaca"
    except EOFError:
        tema = "Insuficiência Cardíaca"

    try:
        # Busca real no YouTube
        resultados_reais = obter_youtube_real(tema, youtube_api_key)
        
        # Curadoria LLM
        resultado = curar_melhor_video(tema, resultados_reais, api_key)
        
        print("\n" + "=" * 60)
        if resultado and resultado.video_escolhido_id != "NENHUM":
            print("✅ VEREDITO DO SUBAGENTE CURADOR:")
            print(f"   > Vídeo Escolhido : {resultado.titulo_formatado}")
            print(f"   > Justificativa   : {resultado.justificativa}")
            print(f"   > ID do YouTube   : {resultado.video_escolhido_id}")
            
            # Simulação do rodapé Markdown
            url = f"https://www.youtube.com/watch?v={resultado.video_escolhido_id}"
            rodape_md = f"\n---\n🎥 **Aula Sugerida:** [{resultado.titulo_formatado}]({url})\n"
            
            print("\n📝 Bloco Markdown que será injetado no Resumo:")
            print(rodape_md)
        else:
            print("❌ O LLM rejeitou todos os vídeos. Nenhum alcançou o padrão de qualidade médica exigido.")
    except Exception as e:
        print(f"\n❌ Erro durante a execução: {e}")

if __name__ == "__main__":
    main()
