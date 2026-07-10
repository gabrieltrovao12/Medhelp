# Script de Instalação de Pacotes R para Análise do DATASUS

# Configura diretório pessoal para salvar os pacotes
.libPaths("/home/vvgfilhos/R/packages")

options(repos = c(CRAN = "https://cloud.r-project.org"))

message("\n=== 1. Instalando Pacotes Base e Utilitários ===")
pacotes_cran <- c("tidyverse", "remotes", "languageserver", "gtsummary", "sf", "geobr")

for (pacote in pacotes_cran) {
  if (!requireNamespace(pacote, quietly = TRUE)) {
    message(paste("Instalando:", pacote))
    install.packages(pacote)
  } else {
    message(paste("Já instalado:", pacote))
  }
}

message("\n=== 2. Instalando microdatasus (via GitHub) ===")
if (!requireNamespace("microdatasus", quietly = TRUE)) {
  message("Instalando rvalerio/microdatasus...")
  remotes::install_github("rvalerio/microdatasus")
} else {
  message("microdatasus já instalado.")
}

message("\n=== Instalação concluída com sucesso! ===")
