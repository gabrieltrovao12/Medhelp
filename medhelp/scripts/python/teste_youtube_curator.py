import asyncio
import logging
import json
import pydantic
import sys
import os
import requests
import re
from google import genai
from google.genai import types

# Corrige erro de exibição de emojis no console do Windows (UnicodeEncodeError)
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

# ==============================================================================
# SCHEMA DE RESPOSTA (O que o LLM vai devolver)
# ==============================================================================
class VideoCurado(pydantic.BaseModel):
    video_escolhido_id: str = pydantic.Field(description="Apenas a ID do vídeo escolhido (ex: dQw4w9WgXcQ)")
    titulo_formatado: str = pydantic.Field(description="O título formatado de forma limpa para exibição.")

# ==============================================================================
# UTILITÁRIO DE DURAÇÃO (ISO 8601 -> Segundos)
# ==============================================================================
def parse_iso_duration(duration_str: str) -> int:
    """Converte formato ISO 8601 (ex: PT14M35S) em segundos totais."""
    if not duration_str:
        return 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str, re.IGNORECASE)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds

# ==============================================================================
# BUSCA REAL (YouTube Data API v3)
# ==============================================================================
def obter_youtube_real(tema: str, api_key: str) -> list:
    # Limpa prefixos comuns (ex: "LHM - Síndromes Tóxicas" -> "Síndromes Tóxicas")
    tema_limpo = re.sub(r'^.*?-\s*', '', tema).strip() or tema
    
    print(f"\n[🔍 YouTube API] Buscando vídeos de aula para '{tema_limpo}'...")
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{tema_limpo} medicina aula",
        "type": "video",
        "maxResults": 10,
        "key": api_key,
        "relevanceLanguage": "pt"
    }
    
    response = requests.get(search_url, params=params)
    response.raise_for_status()
    data = response.json()
    
    items = data.get("items", [])
    if not items:
        return []
    
    video_ids = [item["id"]["videoId"] for item in items if "id" in item and "videoId" in item["id"]]
    if not video_ids:
        return []
    
    # Consulta secundária aos detalhes do vídeo para obter duração (contentDetails)
    details_url = "https://www.googleapis.com/youtube/v3/videos"
    details_params = {
        "part": "contentDetails,snippet",
        "id": ",".join(video_ids),
        "key": api_key
    }
    
    details_resp = requests.get(details_url, params=details_params)
    details_resp.raise_for_status()
    details_data = details_resp.json()
    
    resultados = []
    for item in details_data.get("items", []):
        snippet = item.get("snippet", {})
        content_details = item.get("contentDetails", {})
        duracao_segundos = parse_iso_duration(content_details.get("duration", ""))
        
        # Filtro de Duração Mínima: Apenas vídeos com 10 minutos (600s) ou mais
        if duracao_segundos < 600:
            logging.info(f"⏩ Descartando vídeo curto ({duracao_segundos // 60} min): '{snippet.get('title')}'")
            continue
            
        mins = duracao_segundos // 60
        secs = duracao_segundos % 60
        
        resultados.append({
            "id": item["id"],
            "title": snippet.get("title", ""),
            "channel": snippet.get("channelTitle", ""),
            "description": snippet.get("description", ""),
            "duration": f"{mins} min {secs} s"
        })
        
        if len(resultados) >= 5:
            break
            
    return resultados

# ==============================================================================
# LÓGICA DE CURADORIA (Subagente LLM)
# ==============================================================================
def curar_melhor_video(tema: str, resultados: list, api_key: str) -> VideoCurado:
    resultados_txt = ""
    for i, vid in enumerate(resultados):
        resultados_txt += f"\nOpção {i+1}:\n- ID: {vid['id']}\n- Título: {vid['title']}\n- Canal: {vid['channel']}\n- Duração: {vid['duration']}\n- Descrição: {vid['description']}\n"
    
    system_prompt = """**OBJETIVO:**
Atuar como Curador Acadêmico Médico rigoroso. Sua missão é analisar uma lista de vídeos e selecionar O MELHOR material para estudantes de medicina e residentes.

**CONTEXTO:**
Você receberá o TEMA DA AULA e opções pré-filtradas de vídeos longos (>= 10 minutos) retornadas pelo YouTube.

**AÇÕES:**
1. Leia o TEMA DA AULA para entender o foco clínico ou teórico.
2. Analise os metadados (Título, Canal, Duração, Descrição) de cada vídeo.
3. Filtre pela autoridade médica do canal (priorize cursinhos como SanarFlix, Estratégia MED, Medway, ou ligas acadêmicas).
4. Selecione o vídeo de maior profundidade científica e extensão adequada.
5. Se não houver candidato aceitável, defina o ID como 'NENHUM'.

**NORMAS:**
1. REJEITE sumariamente vídeos direcionados a pacientes leigos (ex: "sintomas", "como curar", "o que é").
2. REJEITE vídeos com duração inferior a 10 minutos ou cortes/shorts incompletos.
3. NUNCA invente um ID de vídeo que não esteja na lista.
4. Retorne APENAS o objeto JSON bruto. NUNCA utilize blocos delimitadores markdown (ex: ```json).

**SAÍDA:**
Retorne estritamente neste formato JSON:
{
  "video_escolhido_id": "ID do vídeo",
  "titulo_formatado": "Título profissional"
}"""

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
            print(f"   > Link            : https://www.youtube.com/watch?v={resultado.video_escolhido_id}")
            
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
