# Arquitetura e Regras de Negócio - R DATASUS

Este arquivo define a estrutura de dados, o mapeamento de variáveis epidemiológicas e o fluxo de dados dos projetos e estudos.

## Fluxo Geral de Análise (V.L.A.E.G.)

```
[1. FTP DATASUS] ──► (microdatasus::fetch_datasus) ──► [.DBC brutos]
                                                           │
                                                           ▼ (microdatasus::process_...)
[2. Dataframe R] ──► (Filtragem por CIDs, UFs e Datas) ──► [Dados Limpos]
                                                           │
                                                           ▼ (ggplot2 + geobr)
[3. Visualização] ──► [Gráficos / Séries Temporais]
                  ──► [Mapas Coropléticos Estéticos]
```

## Regras de Negócio de Dados de Saúde (Ground Truth)
- **Classificação CID-10**: Filtrar registros com Diagnóstico Principal (`DIAG_PRINC` no SIH) e Causa Básica (`CAUSABAS` no SIM) iniciando por `K55` (Transtornos Vasculares do Intestino).
- **Indicadores de Morbidade Hospitalar (SIH-RD)**:
  - `N_INTERNACOES`: Contagem absoluta de AIH pagas/processadas no período.
  - `PROPORCAO_URGENCIA`: `(Internações com CAR_INT == '02' / Total de Internações) * 100`.
  - `TEMPO_MEDIO_PERMANENCIA`: Média e mediana da variável `DIAS_PERM`.
  - `TAXA_MORTALIDADE_INSTITUCIONAL`: `(Soma de MORTE == 1 no SIH / Total de Internações SIH) * 100`.
- **Indicadores de Mortalidade e Fluxo Geográfico (SIM-DO)**:
  - `OBITOS_RESIDENCIA`: Total de óbitos em que o falecido residia no município/macrorregião (`CODMUNRES`).
  - `OBITOS_OCORRENCIA`: Total de óbitos ocorridos fisicamente no município/macrorregião (`CODMUNOCOR`).
  - `RAZAO_EVASAO_FLUXO`: `(OBITOS_OCORRENCIA / OBITOS_RESIDENCIA)`. Razão > 1 indica município/macrorregião polo de atração terciária (pacientes migram e morrem no polo hospitalar); Razão < 1 indica esvaziamento e evasão de óbitos por ausência de suporte de alta complexidade.
- **Tratamento de Missing Data**: Ignorar ou categorizar dados ignorados/brancos sem enviesar a taxa total de incidência.

## Definições Operacionais Fixadas (Passo 3 — estudo K55/MA)
- **Território**: Base Territorial DATASUS 2023 (`rl_municip_macsaud`, `rl_municip_regsaud`). 217 municípios → 19 Regiões de Saúde → 3 Macros: Norte (`2110`, 113 mun.), Leste (`2111`, 61 mun.), Sul (`2109`, 43 mun.).
- **População**: POPSVS/MS 2014-2023 por município, sexo e faixa etária (`0-39, 40-49, 50-59, 60-69, 70-79, 80+`).
- **Ano**: SIH = `ANO_CMPT` (competência, padrão TABNET); SIM = ano de `DTOBITO`. Apenas AIH `IDENT == 1`.
- **Taxas**: por 100 mil pessoas-ano; padronização direta pela população mundial OMS 2000-2025; IC95% gama (Fay & Feuer). Proporções com IC95% de Wilson.
- **Subgrupos K55**: K55.0 (aguda) | K55.1-K55.2 (crônica/angiodisplasia) | K55.8-K55.9 (outras/NE). Análise de sensibilidade restrita a K55.0.
- **Limitação estrutural**: SIM extraído por UF de residência (DORES-MA) e SIH filtrado por `MUNIC_RES` do MA → óbitos/internações de não residentes atendidos no MA não entram. `OBITOS_OCORRENCIA` refere-se apenas a residentes do MA.
- **Scripts**: `00_funcoes.R` (utilitários) → `01_extracao.R` → `02_referencias.R` → `03_tratamento.R` → `04_indicadores.R`. Rodar de dentro de `k55_ma/`.
