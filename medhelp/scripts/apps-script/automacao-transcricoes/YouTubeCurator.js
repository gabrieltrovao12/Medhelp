/**
 * YouTubeCurator.js
 * Módulo responsável por buscar vídeos na YouTube Data API v3 e realizar a curadoria com o Gemini.
 */

const YouTubeCurator = {
  
  /**
   * Função principal que orquestra a busca e curadoria.
   * Retorna a string Markdown do rodapé ou string vazia.
   */
  obterRodapeDeVideo: function(tema, apiKeyGemini, apiKeyYoutube) {
    if (!apiKeyYoutube) {
      console.warn('[YouTubeCurator] YOUTUBE_API_KEY não fornecida. Pulando curadoria.');
      return '> ⚠️ **Aviso do Curador:** A chave `YOUTUBE_API_KEY` não está configurada nas propriedades do script.';
    }

    try {
      const videos = this.buscarVideosNoYouTube(tema, apiKeyYoutube);
      if (!videos || videos.length === 0) {
        console.log(`[YouTubeCurator] Nenhum vídeo encontrado para o tema: ${tema}`);
        return '> ⚠️ **Aviso do Curador:** A API do YouTube não retornou nenhum resultado para este tema ou ocorreu um erro na busca.';
      }

      const curadoria = this.avaliarComLLM(tema, videos, apiKeyGemini);
      
      if (curadoria && curadoria.video_escolhido_id && curadoria.video_escolhido_id !== "NENHUM") {
        console.log(`[YouTubeCurator] Vídeo curado com sucesso: ${curadoria.titulo_formatado}`);
        const url = `https://www.youtube.com/watch?v=${curadoria.video_escolhido_id}`;
        return `🎥 **Aula Sugerida:** [${curadoria.titulo_formatado}](${url})\n\n> *Justificativa do Curador:* ${curadoria.justificativa}`;
      } else if (curadoria && curadoria.video_escolhido_id === "NENHUM") {
        console.log(`[YouTubeCurator] Gemini rejeitou todos os vídeos para o tema: ${tema}`);
        return '> ⚠️ **Aviso do Curador:** O assistente avaliou os vídeos disponíveis no YouTube, mas nenhum atingiu o padrão de qualidade médica exigido (Regras OCANES).';
      } else {
        console.log(`[YouTubeCurator] Curadoria falhou ou retornou nulo.`);
        return '> ⚠️ **Aviso do Curador:** Ocorreu uma falha de comunicação com o LLM durante a curadoria do vídeo.';
      }
    } catch (e) {
      console.error(`[YouTubeCurator] Erro durante a curadoria: ${e.message}`);
      return `> ⚠️ **Aviso do Curador:** Ocorreu um erro interno durante a curadoria do vídeo: ${e.message}`;
    }
  },

  /**
   * Busca os top 5 vídeos na YouTube Data API v3.
   */
  buscarVideosNoYouTube: function(tema, apiKey) {
    console.log(`[YouTubeCurator] Buscando no YouTube API para: ${tema}`);
    const query = encodeURIComponent(`${tema} medicina aula`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=5&key=${apiKey}&relevanceLanguage=pt`;
    
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const code = response.getResponseCode();
    
    if (code !== 200) {
      console.error(`[YouTubeCurator] Erro na API do YouTube (HTTP ${code}): ${response.getContentText()}`);
      return [];
    }

    const data = JSON.parse(response.getContentText());
    const resultados = [];
    
    if (data.items) {
      for (const item of data.items) {
        const snippet = item.snippet || {};
        resultados.push({
          id: item.id.videoId,
          title: snippet.title || "",
          channel: snippet.channelTitle || "",
          description: snippet.description || ""
        });
      }
    }
    
    return resultados;
  },

  /**
   * Aciona a avaliação do Gemini usando a função JSON.
   */
  avaliarComLLM: function(tema, resultados, apiKeyGemini) {
    let resultadosTxt = "";
    resultados.forEach((vid, i) => {
      resultadosTxt += `\nOpção ${i+1}:\n- ID: ${vid.id}\n- Título: ${vid.title}\n- Canal: ${vid.channel}\n- Descrição: ${vid.description}\n`;
    });

    const systemPrompt = `Você é um curador acadêmico médico altamente rigoroso do ecossistema Medhelp.
Sua missão é receber uma lista de vídeos retornados pela API do YouTube e escolher O MELHOR vídeo para estudantes de medicina e residentes.

REGRAS OCANES DE SELEÇÃO:
1. PRIORIZE canais de educação médica consagrados (ex: SanarFlix, Jaleko, Estratégia MED, Medway, Sanches).
2. REJEITE sumariamente vídeos voltados para pacientes leigos ("dicas de saúde", "o que é a doença").
3. REJEITE aulas de biologia do ensino médio.
4. O vídeo escolhido deve abordar preferencialmente o tema com profundidade científica (fisiopatologia, diagnóstico, clínica).
5. Se não houver NENHUM vídeo adequado na lista, retorne a string 'NENHUM' na ID.
6. Retorne estritamente JSON.

Schema esperado:
{
  "video_escolhido_id": "string",
  "titulo_formatado": "string",
  "justificativa": "string"
}`;

    const userPrompt = `Tema da Aula/Objetivo: ${tema}\n\nAvalie e escolha a melhor opção entre os vídeos abaixo:\n${resultadosTxt}`;
    
    console.log(`[YouTubeCurator] Avaliando opções via LLM (Gemini)...`);
    return chamarGeminiJSON(userPrompt, apiKeyGemini, systemPrompt);
  }

};
