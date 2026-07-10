# Configurar diretório pessoal do R para não exigir senha (sudo)
local_lib <- Sys.getenv("R_LIBS_USER")
dir.create(local_lib, recursive = TRUE, showWarnings = FALSE)
.libPaths(local_lib)

# Instalação de pacotes fundamentais
install.packages(c("remotes", "tidyverse", "geobr", "languageserver"), repos = "http://cran.us.r-project.org", lib = local_lib)

# Instalação do microdatasus via GitHub (conforme orientação do PDF)
remotes::install_github("rfsaldanha/microdatasus", lib = local_lib)
