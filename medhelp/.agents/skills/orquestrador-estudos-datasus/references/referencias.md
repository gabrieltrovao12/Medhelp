# Referencial Teórico para Análises Ecológicas e Epidemiológicas

Esta documentação serve de Ground Truth matemático e referencial técnico para a skill `orquestrador-estudos-datasus`. O agente deve se basear nestes princípios ao estruturar códigos R e redações metodológicas.

## 1. Terminologia e Taxas (Morgenstern, Antunes)
- **Taxa Bruta (Inadequada para pequenos n):** Sujeita à alta variabilidade (variância).
- **Proporção vs Razão:** Odds (chances) medem a razão entre a probabilidade de ocorrer vs não ocorrer. Prevalência/Incidência são proporções (ou taxas, se levam tempo em conta).

## 2. Delineamentos Epidemiológicos
- **Estudos Ecológicos:** Os agregados populacionais (municípios, anos) são a unidade de análise.
- **Falácia Ecológica:** É estritamente proibido inferir comportamento individual com base no dado do grupo. A discussão deve ser focada em "risco de agregados populacionais" ou correlações ambientais.

## 3. Séries Temporais e Regressão (Prais-Winsten e Segmentada)
- **Regressão Prais-Winsten:** Usada em epidemiologia para medir a Mudança Percentual Anual (APC) lidando com a autocorrelação serial dos resíduos.
- *Fórmula do APC:* `APC = [-1 + 10^(b1)] * 100%`, onde `b1` é o coeficiente angular.
- **Série Interrompida (Segmentada):** Avalia intervenções modelando o impacto imediato (degrau/nível) e progressivo (rampa/tendência).

## 4. Análise Espacial (Moran e Geoprocessamento)
- **Primeira Lei de Tobler:** Áreas vizinhas tendem a se assemelhar mais do que áreas distantes.
- **Autocorrelação Espacial e Índice de Moran:** É imperativo para medir a dependência espacial. Caso o Moran identifique *clusters*, regressões clássicas (OLS) falham por perda de independência.
- **R e Geobr:** Usar `geobr::read_state()`, `read_municipality()` ou afins para dados de fronteiras brasileiras, vinculando (join) os dados espaciais via código do IBGE.

## 5. Correção de Taxas (Modelos Bayesianos)
Para minimizar a variância em municípios pouco populosos:
- **Taxa Bayesiana Empírica (Global):** Utiliza a média ponderada do país ou região para suavizar a taxa local.
- **Taxa Bayesiana Espacial:** Utiliza a média dos vizinhos do município (autocorrelação) como *a priori*. É a medida recomendada para observação visual coerente de manchas da violência/mortalidade no Brasil.

## 6. Modelagem para Dados Hierárquicos (GLMM)
- Bases do DataSUS possuem estrutura naturalmente aninhada (ex: pacientes em municípios, municípios em estados).
- **Modelos Lineares Generalizados Mistos (GLMM):** Corrigem a violação do pressuposto de independência. Englobam Efeitos Fixos (as variáveis preditoras principais) e Efeitos Aleatórios (a variabilidade intrínseca de linha de base entre os diferentes clusters/municípios). Fundamental usar os pacotes `lme4` ou `glmmTMB` no R para essas correções.

## 7. Escrita Científica (IMRAD e STROBE)
- **Métodos (IMRAD):** Deve citar o formato DBC, extração via `microdatasus`, padronizações de taxas e mitigação de Big Data via uso nativo do pacote `arrow` e processamento particionado.
- **Discussão:** Deve interpretar as taxas corrigidas, ponderar e declarar explicitamente a Falácia Ecológica e a qualidade do preenchimento da base de dados (subnotificação do SIM, SIH, etc).
