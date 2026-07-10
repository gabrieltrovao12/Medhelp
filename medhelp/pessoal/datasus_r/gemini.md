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
- **Classificação CID-10**: Para análises epidemiológicas, sempre filtrar usando os códigos CID-10 correspondentes à condição (ex: Doenças Cardiovasculares I00-I99).
- **Tratamento de Missing Data**: Ignorar ou categorizar dados ignorados/brancos (especialmente em variáveis de raça/cor ou escolaridade que possuem alta taxa de preenchimento em branco) sem enviesar a taxa total de incidência.
