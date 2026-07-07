---
name: "Nova Automação Google Apps Script"
description: "Criar um novo script de automação em Google Apps Script para o ecossistema Medhelp. Usar quando o usuário pedir para criar um novo script, nova automação, novo trigger, novo processamento de arquivos, envio de emails, integração com Google Sheets, ou qualquer nova funcionalidade que rode no Google Apps Script. Também ativar para: novo script GAS, automatizar, agendar tarefa, criar webhook, monitorar pasta, processar lote."
---

# Skill: Nova Automação Google Apps Script

## Objetivo
Garantir que toda nova automação criada para o ecossistema Medhelp siga os padrões de qualidade, resiliência e organização já estabelecidos nos scripts existentes, aplicando rigorosamente o Protocolo V.L.A.E.G. e incorporando todas as proteções contra falhas comuns do Google Apps Script.

## Protocolo V.L.A.E.G. Aplicado

### V — Visão (Mapeamento de Entradas e Saídas)

Antes de escrever qualquer linha de código, responder e documentar:

1. **Qual é o gatilho?** (trigger manual, time-driven, webhook)
2. **Quais são as entradas?**
   - Pasta(s) do Drive de origem (IDs)
   - Tipo de arquivo consumido (.txt, .md, .pdf, .m4a)
   - Filtros aplicados (por data, por nome, por tipo MIME)
3. **Quais são as saídas?**
   - Pasta(s) do Drive de destino (IDs)
   - Tipo de arquivo gerado
   - Formato do conteúdo (Markdown, HTML, JSON)
4. **Quais APIs externas são utilizadas?** (Gemini, Whisper, etc.)
5. **Qual é o volume esperado?** (quantos arquivos por execução)

Apresentar este mapeamento ao usuário para validação antes de prosseguir.

### L — Link (Validação de Conectividade)

Antes de codificar a lógica de negócio:

1. **Credenciais**: Verificar se a `GEMINI_API_KEY` (ou outras chaves) está configurada nas Script Properties do projeto GAS.
2. **Permissões do Drive**: Confirmar que o script terá acesso às pastas de entrada e saída.
3. **Cotas da API**: Documentar os limites relevantes:
   - Gemini Flash: 15 RPM (requisições por minuto) na cota gratuita.
   - Gemini Pro: 2 RPM na cota gratuita.
   - GAS: 6 minutos de runtime máximo por execução.
   - Drive API: 20.000 chamadas/dia (conta gratuita).

### A — Arquitetura (Estrutura do Código)

Todo novo script deve seguir a **estrutura padrão de 5 seções** já utilizada nos scripts existentes:

```javascript
// ============================================================
// SEÇÃO 1: CONSTANTES DE CONFIGURAÇÃO
// ============================================================

const CONFIG = {
  // IDs de pastas do Drive
  ID_PASTA_ENTRADA:     'xxxxx',
  ID_PASTA_SAIDA:       'xxxxx',

  // Modelo Gemini
  MODELO_GEMINI:        'gemini-2.5-flash',

  // Trava de segurança: GAS mata scripts após 6 min. Usamos 4.5 min.
  TEMPO_LIMITE_MS:      4.5 * 60 * 1000,

  // Intervalo entre arquivos (Flash: 15 RPM => ~4s mínimo; usamos 6s)
  INTERVALO_ENTRE_ARQUIVOS_MS: 6000,

  // Tentativas máximas por arquivo antes de desistir
  MAX_RETRIES:          3,
};

// ============================================================
// SEÇÃO 2: PROMPT / SYSTEM INSTRUCTION (se aplicável)
// ============================================================

const SYSTEM_INSTRUCTION = `...`;

// ============================================================
// SEÇÃO 3: FUNÇÃO PRINCIPAL ORQUESTRADORA
// ============================================================

function funcaoPrincipal() {
  const tempoInicio = Date.now();
  // ... lógica de orquestração com verificação de tempo
}

// ============================================================
// SEÇÃO 4: INTEGRAÇÃO COM API (com Retry + Backoff)
// ============================================================

function chamarAPI(texto, nomeArquivo, apiKey) {
  // ... com exponential backoff
}

// ============================================================
// SEÇÃO 5: FUNÇÕES AUXILIARES
// ============================================================
```

#### Estrutura de Diretório (clasp)

```
scripts/apps-script/nome-da-automacao/
├── .clasp.json          ← ID do projeto GAS
├── appsscript.json      ← Manifesto (scopes e runtime)
└── Code.js              ← Código principal
```

### E — Estilo (Padrões de Código e Apresentação)

#### Padrões de Logging
Usar o sistema de tags já padronizado no projeto:
```javascript
console.log(`[INÍCIO] Processando: "${nomeArquivo}"`);
console.log(`[SUCESSO] "${nomeArquivo}" salvo.`);
console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s...`);
console.warn(`[AVISO] Tempo limite de 4.5 min atingido.`);
console.error(`[ERRO] Falha ao processar "${nomeArquivo}": ${e.message}`);
console.error(`[FATAL] API key não encontrada. Abortando.`);
console.log(`[FIM] Ciclo concluído. Processados: ${ok} | Falhas: ${falhas}`);
```

#### Padrões de Saída
- Para emails: HTML rico com cabeçalhos contrastantes, tabelas estilizadas e links diretos.
- Para Obsidian: Markdown puro com `##` para seções, `**negrito**` para termos-chave e `->` para fluxos causais.
- Para Sheets: Escrita em lote com `setValues()` em vez de célula a célula.

#### Nomenclatura de Chaves de API
- Sempre armazenar em `PropertiesService.getScriptProperties()`.
- Nunca hardcodar chaves no código (com exceção de scripts de uso pessoal local já existentes).
- Validar a presença da chave no início da execução com mensagem `[FATAL]` se ausente.

### G — Gatilho (Automação e Resiliência)

#### Proteção contra Timeout (Obrigatório)
```javascript
// Dentro do loop principal:
if (Date.now() - tempoInicio > CONFIG.TEMPO_LIMITE_MS) {
  console.warn('[AVISO] Tempo limite de 4.5 min atingido. ' +
    'O restante será processado no próximo ciclo agendado.');
  break;
}
```

#### Exponential Backoff para APIs (Obrigatório)
```javascript
function chamarComRetry(fn, maxRetries, nomeArquivo) {
  for (let tentativa = 1; tentativa <= maxRetries; tentativa++) {
    try {
      return fn();
    } catch (e) {
      const statusCode = e.message.match(/(\d{3})/)?.[1];
      
      if (statusCode === '429' || statusCode?.startsWith('5')) {
        const espera = Math.pow(2, tentativa) * 1000 + Math.random() * 1000;
        console.warn(`[RETRY ${tentativa}/${maxRetries}] "${nomeArquivo}" — ` +
          `Erro ${statusCode}. Aguardando ${(espera/1000).toFixed(1)}s...`);
        Utilities.sleep(espera);
      } else {
        console.error(`[ERRO] "${nomeArquivo}" — Erro não recuperável: ${e.message}`);
        return null;
      }
    }
  }
  console.error(`[FALHA] "${nomeArquivo}" — Todas as ${maxRetries} tentativas esgotadas.`);
  return null;
}
```

#### Pausa entre Arquivos (Obrigatório)
```javascript
if (arquivos.hasNext()) {
  console.log(`[ESPERA] Aguardando ${CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS / 1000}s...`);
  Utilities.sleep(CONFIG.INTERVALO_ENTRE_ARQUIVOS_MS);
}
```

#### Try/Catch em Operações de I/O (Obrigatório)
Toda operação de leitura/escrita de arquivo e toda chamada de rede deve estar dentro de um `try/catch`:
```javascript
let conteudo;
try {
  conteudo = arquivo.getBlob().getDataAsString('UTF-8');
} catch (e) {
  console.error(`[ERRO] Falha ao ler "${nomeArquivo}": ${e.message}`);
  falhas++;
  continue;
}
```

## Checklist Final (Antes de entregar o código)

- [ ] O objeto `CONFIG` contém todos os IDs de pasta e parâmetros configuráveis?
- [ ] A chave de API é lida de `PropertiesService`, não hardcoded?
- [ ] O loop principal verifica `Date.now()` contra `TEMPO_LIMITE_MS`?
- [ ] Chamadas à API usam exponential backoff com `MAX_RETRIES`?
- [ ] Há `Utilities.sleep()` entre processamentos de arquivos?
- [ ] Todo I/O de arquivo e rede está dentro de `try/catch`?
- [ ] O logging segue o padrão de tags `[INÍCIO]`, `[SUCESSO]`, `[ERRO]`, `[FIM]`?
- [ ] O prompt (se aplicável) segue o framework OCANES com separação de Ações e Normas?
- [ ] A pasta do `clasp` foi criada com `.clasp.json` e `appsscript.json`?
- [ ] A alteração foi registrada no `task.md`?

## Regras de Segurança

- **NUNCA** criar um script sem a trava de timeout de 4.5 min.
- **NUNCA** fazer chamadas à API sem retry com backoff.
- **NUNCA** processar arquivos sem intervalo entre eles.
- **NUNCA** hardcodar IDs de pasta sem documentar no CONFIG.
- **NUNCA** ignorar erros silenciosamente — todo `catch` deve logar com `[ERRO]`.
- Se o script precisar de mais de 4.5 min para processar todos os arquivos, implementar processamento em lote com continuação no próximo ciclo agendado.
