# Pesquisas e Referências - R DATASUS

Este arquivo armazena descobertas sobre pacotes R, links de documentação, limites de APIs e comportamento do FTP do DATASUS.

## 1. Pacote `microdatasus` (rvalerio/microdatasus)
- **Função**: Baixa arquivos `.dbc` do FTP oficial do DATASUS, converte para `.dbf` e depois lê para o R como data frame.
- **Bancos Suportados**:
  - `SIM`: Sistema de Informações sobre Mortalidade (declarações de óbito).
  - `SINASC`: Sistema de Informações sobre Nascidos Vivos (declarações de nascido vivo).
  - `SIH`: Sistema de Informações Hospitalares (dados de AIH - autorizações de internação hospitalar).
  - `SINAN`: Sistema de Informações de Agravos de Notificação (doenças sob vigilância, ex: Dengue, Tuberculose).
- **Estrutura básica de uso**:
  ```R
  # Baixar dados
  dados_brutos <- fetch_datasus(year_start = 2022, year_end = 2022, month_start = 1, month_end = 12, uf = "RJ", information_system = "SIM-DO")
  # Processar (traduzir variáveis como sexo, raça, etc.)
  dados_limpos <- process_sim(dados_brutos)
  ```

## 2. Pacote `geobr` (ipeaGIT/geobr)
- **Função**: Permite baixar shapefiles espaciais do IBGE diretamente para o R como objetos `sf` (simple features), facilitando a criação de mapas.
- **Bancos Suportados**:
  - `read_municipality(code_muni = "all", year = 2020)`
  - `read_state(code_state = "all", year = 2020)`
  - `read_health_region(year = 2013)` (Regiões de Saúde para estudos epidemiológicos)

## 3. Limites de Download e Rede
- O FTP do DATASUS às vezes apresenta instabilidades de conexão ou bloqueia downloads excessivos e rápidos (erro HTTP/FTP).
- **Mitigação**: Fazer downloads particionados (ex: mês a mês, ou estado por estado) em vez de baixar o Brasil inteiro de uma vez em estudos transversais longos.
