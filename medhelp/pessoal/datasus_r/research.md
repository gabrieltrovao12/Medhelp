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

## 4. Estudo Específico: K55 (Transtornos Vasculares do Intestino) no Maranhão
- **CID-10 Alvo**: `K55` (K55.0 Isquemia mesentérica aguda, K55.1 Transtornos vasculares crônicos, K55.2 Angiodisplasia, K55.8 Outros, K55.9 Não especificado).
- **Característica Clínica**: Condição hiperaguda, tempo-dependente. Atrasos no diagnóstico e na intervenção cirúrgica/terapêutica elevam exponencialmente a letalidade hospitalar.
- **Bases de Dados Necessárias**:
  1. `SIH-RD` (Sistema de Informações Hospitalares - Reduzida):
     - Variáveis-chave:
       - `DIAG_PRINC`: Diagnóstico principal de internação (inicia com "K55").
       - `CAR_INT`: Caráter da internação (`01` = Eletivo, `02` = Urgência/Emergência).
       - `DIAS_PERM`: Tempo de permanência hospitalar (dias).
       - `MORTE`: Desfecho hospitalar (`1` = Óbito, `0` = Não óbito) -> Permite calcular a **Taxa de Mortalidade Institucional** (`(Mortes SIH / Total Internações) * 100`).
       - `MUNIC_RES`: Município de residência do paciente (código IBGE 6 dígitos).
       - `MUNIC_MOV`: Município do estabelecimento executor da internação (detecta polo de atração hospitalar).
       - `DT_INTER`: Data de internação.
  2. `SIM-DO` (Sistema de Informações sobre Mortalidade):
     - Variáveis-chave:
       - `CAUSABAS`: Causa básica de óbito ("K55" ou subcategorias).
       - `CODMUNRES`: Município de residência do falecido.
       - `CODMUNOCOR`: Município onde ocorreu o óbito.
       - Razão `Residência x Ocorrência`: Evasão de óbitos (óbitos fora do município de residência indicam necessidade de transferência de emergência ou vazio assistencial nos municípios periféricos).
  3. `IBGE / Demografia / Geobr`:
     - População residente por município/macrorregião para cálculo de Taxas de Internação e Mortalidade por 100.000 hab.
     - Malha espacial do Maranhão dividida pelas 3 Macrorregiões de Saúde (Norte, Leste e Sul) ou 19 Regiões de Saúde.

## 5. Recorte Espaço-Temporal Proposto
- **Espacial**: Estado do Maranhão (217 municípios), estratificado pelas 3 Macrorregiões de Saúde (Norte - Polo São Luís; Leste - Polos Caxias/Timon; Sul - Polos Imperatriz/Balsas).
- **Temporal Sugerido**: Últimos 5 a 10 anos consolidados (ex: 2014 a 2023 ou 2018 a 2023) para garantir estabilidade estatística e suficiência de eventos n.

## 6. Fontes Auxiliares Localizadas (Passo 3)
- **Base Territorial DATASUS**: `ftp://ftp.datasus.gov.br/territorio/tabelas/<ano>/` — zip com `rl_municip_macsaud`, `rl_municip_regsaud`, `tb_municip` (inclui `NU_DISTANC`, lat/long). Encoding misto UTF-8/latin1; layout `.txt` desatualizado.
- **POPSVS**: `ftp://ftp.datasus.gov.br/dissemin/publicos/IBGE/POPSVS/POPSBRaa.zip` (2000-2025), município 7 díg. × sexo × idade simples. Nome do DBF varia (`pop21.dbf`/`POP22.dbf`).

## 7. Achados de Qualidade dos Dados (auditoria Passo 3)
- SIH: 532 AIHs, todas `IDENT = 1`, sem `N_AIH` duplicado, sem idade/sexo/residência ausentes.
- Subcategorias: SIH K55.0 = 318 (60%), K55.8/K55.9/K55 = 196; SIM K55.0 = 335 (75%).
- **Coerência SIH × SIM**: apenas 82 óbitos em AIH K55 vs 365 óbitos hospitalares K55 no SIM (razão 0,22; Sul 0,14). Hipóteses: leitos não-SUS, AIH com outro diagnóstico principal (abdome agudo, peritonite, obstrução), óbito sem AIH processada. Extensão possível: re-extrair SIH filtrando também `DIAG_SECUN`/`CID_MORTE` = K55.
- Mortalidade institucional K55.0 = 21,4% vs K55.8/9 = 5,6% → justifica análise de sensibilidade.

## 8. Achados da Cartografia Temática Espacial (Passo 4.2)
- **Topologia de Polos Atratores (Razão Ocorrência / Residência > 1.05)**:
  * São Luís (Norte): Razão 1,40 (265 óbitos ocorridos vs 189 de residentes). Concentra a alta complexidade cirúrgica vascular e suporte intensivo terciário do estado.
  * Imperatriz (Sul): Razão 1,12 (47 óbitos ocorridos vs 42 de residentes), operando como polo terciário regional do Sudoeste maranhense.
  * Presidente Dutra (Leste/Centro): Razão 1,12 (29 óbitos ocorridos vs 26 de residentes), polo estratégico de urgência pelo Hospital Regional (entroncamento BR-135/BR-226).
- **Vazamento Interestadual para o Piauí**:
  * 17 óbitos de residentes do Maranhão ocorreram no Piauí (especialmente pacientes das regiões de Timon e Caxias que cruzam o Rio Parnaíba em busca de socorro em Teresina). Total interestadual = 24 óbitos.
- **Desertos Assistenciais Críticos (Razão < 0.15)**:
  * Viana: Razão 0,00 (100% de evasão regional; nenhum óbito por K55 ocorreu na CIR).
  * Chapadinha: Razão 0,12 (88,9% de evasão regional).
  * Zé Doca: Razão 0,17 (84,6% de evasão regional).
  * Rosário: Razão 0,21 (90,3% de evasão regional).
  * Itapecuru Mirim: Razão 0,24 (86,4% de evasão regional).
- **Gradiente da Taxa Padronizada de Mortalidade (OMS 2000-2025)**:
  * São Luís: 1,47 / 100 mil hab-ano (maior taxa do estado; reflete alta capacidade diagnóstica, angiotomografia precoce e declaração hospitalar fidedigna).
  * Interior / Desertos: Bacabal (0,23 / 100k), Pedreiras (0,27 / 100k), São João dos Patos (0,29 / 100k), Pinheiro (0,29 / 100k) evidenciam **subdiagnóstico severo** por falta de acesso a tomografia computadorizada e cirurgia vascular de emergência (óbito classificado como parada cardiorrespiratória indeterminada ou choque séptico de foco obscuro).

## 9. Achados de Deslocamento e Séries Temporais (Passos 4.3 e 5)
- **Letalidade Hospitalar por Nível de Deslocamento (SIH)**:
  * Local (mesmo município): 14,1% (41 óbitos em 291 AIHs; tempo médio 6,3 dias);
  * Mesma Região de Saúde (outro mun): 15,6% (12 óbitos em 77 AIHs; 7,1 dias);
  * Inter-regional (outra CIR): 19,7% (23 óbitos em 117 AIHs; 10,5 dias; 42,7% UTI; custo R$ 4.151,73);
  * Interestadual (PI/TO): 20,0% (3 óbitos em 15 AIHs; 12,5 dias; 46,7% UTI);
  * **Odds Ratio Ajustado para Morte Hospitalar em Transferência Inter-regional**: OR = 2,45 (IC95%: 1,32–4,55; p = 0,0045).
- **Tendência Temporal Prais-Winsten (2014-2023)**:
  * SIH Internação Padronizada (MA): APC = +0,63% ao ano (IC95%: -3,97% a +5,46%; p = 0,764) -> Estacionária;
  * SIM Mortalidade Padronizada (MA): APC = +2,60% ao ano (IC95%: -4,70% a +10,45%; p = 0,446) -> Estacionária;
  * Todas as macrorregiões apresentaram comportamento estacionário (inércia secular sem descentralização no decênio).

## 10. Produtos Finais Entregues (Passo 5 - Gatilho)
- `resumo_expandido_k55_ma.md`: Resumo Expandido ABNT/IMRAD/STROBE (6 páginas, rigor metodológico, 15 referências acadêmicas, salvaguarda expressa contra a Falácia Ecológica e 4 recomendações para o SUS-MA).
- `banner_cientifico_k55_ma.md`: Roteiro modular em 3 colunas para confecção e defesa de Banner Científico 90x120cm em congressos médicos.
- `banner_apresentacao_visual.html`: Pôster acadêmico interativo de alto impacto visual, estilizado em CSS moderno e contendo as 4 figuras de 300 DPI já integradas para visualização em navegador ou impressão PDF/A0.
