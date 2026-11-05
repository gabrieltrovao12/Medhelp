# Log do Sistema e Erros - R DATASUS

Este arquivo cataloga erros de execução, falhas em compilação de pacotes R e problemas de infraestrutura observados nos testes locais.

## Histórico de Erros e Correções

### [2026-07-09] Ausência do binário R no sistema
- **Descrição**: O comando `R --version` falhou com erro 127 (R: comando não encontrado).
- **Causa Raiz**: O compilador R base não está instalado no sistema Linux Mint local.
- **Correção Proposta**: Executar `apt install r-base r-base-dev` com privilégios administrativos.

### [2026-10-10] geobr 2.0.1: "A file must have been corrupted during download"
- **Arquivo**: chamadas `read_municipality()` / `read_health_region()`.
- **Causa Raiz**: geobr 2.x baixa `.parquet` e exige o pacote `arrow`, que não estava instalado. A mensagem de "arquivo corrompido" é enganosa.
- **Correção**: instalar `arrow` binário via Posit Package Manager (`https://packagemanager.posit.co/cran/__linux__/noble/latest`) com `HTTPUserAgent` configurado. Sem o user agent o PPM entrega o fonte e a compilação C++ leva 30-60 min.

### [2026-10-10] Lock em `/home/vvgfilhos/R/packages/00LOCK-arrow`
- **Causa Raiz**: instalação anterior interrompida.
- **Correção**: `rm -rf /home/vvgfilhos/R/packages/00LOCK*` antes de reinstalar.

### [2026-10-10] Rscript fora de `datasus_r/` não encontra `microdatasus`
- **Causa Raiz**: o `.Rprofile` com `.libPaths()` só é lido quando o diretório de trabalho é `datasus_r/`.
- **Correção**: em subpastas, rodar `Rscript -e ".libPaths(c('/home/vvgfilhos/R/packages', .libPaths())); source('script.R')"`.

### [2026-10-11] `k55_ma/02_referencias.R` — coluna de nome inexistente em `tb_municip.csv`
- **Sintoma**: `select()`: "Selections can't have missing values".
- **Causa Raiz**: o CSV da base territorial 2023 usa `NO_MUNICIP`, mas o `tb_municip_layout.txt` documenta `DS_NOME` (layout desatualizado).
- **Correção**: seleção explícita de `CO_MUNICIP`, `NO_MUNICIP`, `ST_CAPITAL`, `NU_DISTANC`, `NU_LATITUD`, `NU_LONGITU`.

### [2026-10-11] `k55_ma/02_referencias.R` — encoding misto na base territorial DATASUS
- **Sintoma**: nomes de regiões como `SÃ£o LuÃ­s` (UTF-8 lido como latin1).
- **Causa Raiz**: `tb_regsaud.csv` está em UTF-8 e `tb_macsaud.csv` em latin1; alguns arquivos misturam ambos.
- **Correção**: ler com `encoding = "bytes"` e converter só strings onde `validUTF8()` é FALSE. Nomes das macros fixados manualmente no script.

### [2026-10-11] `k55_ma/02_referencias.R` — "unable to open DBF file" (POPSVS 2022)
- **Causa Raiz**: o nome interno do arquivo varia entre anos (`pop21.dbf` vs `POP22.dbf`); o sistema de arquivos Linux diferencia maiúsculas.
- **Correção**: obter o nome via `unzip(zip, list = TRUE)` com `grep(..., ignore.case = TRUE)`. Obs.: `(?i)` no `grep` do R base só funciona com `perl = TRUE`.
