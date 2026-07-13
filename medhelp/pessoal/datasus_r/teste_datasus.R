# Script de Teste e Validação - R DATASUS

library(microdatasus)
library(tidyverse)
library(geobr)

message("\n=== 1. Iniciando teste de download do DATASUS (SINASC - Roraima) ===")

tryCatch({
  # Baixa os nascidos vivos de Roraima (RR) de Janeiro de 2020 (arquivo pequeno para teste rápido)
  dados_rr <- fetch_datasus(
    year_start = 2020, 
    year_end = 2020, 
    month_start = 1, 
    month_end = 1, 
    uf = "RR", 
    information_system = "SINASC"
  )
  
  message("✓ Download concluído! Registros obtidos: ", nrow(dados_rr))
  
  message("\n=== 2. Processando dados (microdatasus) ===")
  dados_processados <- process_sinasc(dados_rr)
  
  message("✓ Processamento concluído! Variáveis disponíveis: ", ncol(dados_processados))
  
  message("\n=== 3. Teste do geobr (Carregando mapa de RR) ===")
  mapa_rr <- read_state(code_state = "RR", year = 2020, showProgress = FALSE)
  message("✓ Mapa do estado de ", unique(mapa_rr$name_state), " carregado com sucesso!")
  
  message("\n=== TUDO PRONTO: CONFIGURAÇÃO R DATASUS 100% VALIDADA! ===")
}, error = function(e) {
  message("\n✗ Ocorreu um erro durante a validação: ", e$message)
})
