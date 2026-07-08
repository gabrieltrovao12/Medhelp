---
name: "Publicar Flashcards no NotebookLM"
description: "Automatizar o upload de arquivos .md de flashcards gerados pelo Medhelp para cadernos do NotebookLM, criando uma experiência interativa de estudo para clientes. Ativar quando o usuário pedir para publicar flashcards, subir cards para o NotebookLM, criar caderno de produto, preparar material interativo para clientes ou organizar cadernos de venda. Também ativar para: publicar cards, produto NotebookLM, caderno cliente, subir flashcards."
---

# Skill: Publicar Flashcards no NotebookLM

## Objetivo
Automatizar o processo de upload dos arquivos `.md` de flashcards (gerados pelo pipeline Medhelp) para cadernos dedicados no NotebookLM, criando uma experiência de estudo interativa e consultável para os clientes que adquirem o produto. O NotebookLM **não deve criar conteúdo novo** — deve apenas transformar os flashcards prontos em formato interativo.

---

## 1. Fluxo de Trabalho Automatizado

```
[1. Apps Script gera os flashcards .md e salva no Drive]
       │
       ▼
[2. Usuário pede para publicar no NotebookLM]
       │
       ▼ (via MCP — ferramenta notebook_list)
[3. Antigravity verifica se já existe um caderno para a matéria]
       │
       ├── SIM → Usa o caderno existente (caderno único por matéria)
       └── NÃO → Cria um novo caderno (notebook_create)
       │
       ▼ (via MCP — ferramenta notebook_add_drive ou notebook_add_local_file)
[4. Faz upload do .md dos flashcards como fonte no caderno]
       │
       ▼
[5. Apresenta a URL do caderno e o prompt de flashcards para o usuário]
```


---

## 2. Caminhos e Configurações Ativas

* **Pasta de Flashcards Gerados (Drive):**
  - ID: `1SR34LW4W_hcxm4nXbt1uqyQF8z3O2PfA`
* **Pasta de Resumos Fonte (Drive):**
  - ID: `1QnAfngespsRRQfEHouqcXq1x2MTxgPa6`
* **Semestre Ativo:** `2026.2 - M6`

---

## 3. Regra Fundamental: Caderno Único por Matéria

Cada matéria/disciplina possui **um único caderno** no NotebookLM que acumula todos os flashcards de todas as aulas daquela matéria ao longo do semestre.

**Padrão de nomenclatura dos cadernos:**
```
Flashcards M6 - [Nome da Disciplina]
```

**Exemplos:**
- `Flashcards M6 - Farmacologia` (contém flashcards de drogas de abuso, antineoplásicos, etc.)
- `Flashcards M6 - Parasitologia` (contém flashcards de amebíase, giardíase, etc.)
- `Flashcards M6 - LMF - Radiologia` (contém flashcards de radiografia de tórax, rastreio, etc.)
- `Flashcards M6 - Patologia`
- `Flashcards M6 - LHM - Clínica`

---

## 4. Prompt de Instrução para o NotebookLM (Flashcards)

Ao fazer o upload dos flashcards, o Antigravity **não** deve disparar a criação do artefato via API do Estúdio, pois isso causaria a geração criativa padrão do Google. Em vez disso, ele deve instruir o usuário a colar o prompt a seguir nas **Instruções Personalizadas do Caderno (Configurar as conversas -> Personalizado)** na interface do NotebookLM:

```
Tarefa: Converter o documento PDF anexado em flashcards interativos, renderizando cada par pergunta/resposta com fidelidade absoluta ao texto fonte.

Regras de extração:
- Frente do cartão: Extraia a pergunta original, palavra por palavra, sem alterações
- Verso do cartão: Extraia a resposta original, mantendo toda a terminologia, formatação e estrutura de listas presentes no documento

Regra de bloqueio — cumprimento obrigatório:
- Zero geração criativa: é estritamente proibido resumir, parafrasear, fragmentar, reordenar ou alterar qualquer conceito clínico
- Cobertura total: todos os pares pergunta/resposta do documento devem ser convertidos, sem omissões
- Fidelidade terminológica: nomes de fármacos, valores numéricos, classificações e condutas devem ser transcritos exatamente como aparecem no documento fonte
- Sem preâmbulo: a saída deve começar diretamente no primeiro flashcard, sem introdução ou comentário

Você receberá um ou mais arquivos .md contendo flashcards no formato pergunta/resposta. Sua tarefa é única e não admite desvio: transcrever cada par exatamente como está escrito, sem resumir, reescrever, combinar ou omitir nenhum cartão.

Para cada flashcard encontrado nos arquivos, gere:

Frente: [pergunta copiada palavra por palavra, com pontuação e formatação originais]
Verso: [resposta copiada palavra por palavra, com toda a terminologia, valores e listas originais]

Regras invioláveis:
- Copie o texto original — nunca o reescreva com suas próprias palavras
- Se a resposta tiver múltiplos itens ou linhas, copie todos
- Não funde dois cartões em um
- Não omita nenhum cartão, mesmo que pareça repetido ou incompleto
- O número de cartões gerados deve ser idêntico ao número de pares presentes nos arquivos

Ao final, informe: "Total gerado: N cartões."
```

---

## 5. Protocolo de Execução

### FASE 1 — Identificação dos Flashcards
1. Listar os arquivos `.md` de flashcards disponíveis na pasta de destino do Drive.
2. Perguntar ao usuário quais arquivos ele deseja publicar (todos os recentes ou específicos).
3. Mapear o nome do arquivo para a disciplina usando o dicionário `DISCIPLINAS`.

### FASE 2 — Gestão de Cadernos (Caderno Único por Matéria)
1. Usar `notebook_list` para verificar cadernos existentes.
2. Se já existir um caderno com o nome da disciplina (ex: `Flashcards M6 - Farmacologia`), **reutilizá-lo** — apenas adicionar as novas fontes.
3. Se não existir, criar um novo caderno via `notebook_create`.

### FASE 3 — Upload e Entrega
1. Fazer upload de cada `.md` como fonte no caderno correspondente.
2. Verificar se o upload foi aceito.
3. Apresentar o link do caderno ao usuário junto com o prompt de instruções personalizadas acima em um bloco copiável, ensinando-o a colar nas configurações de conversa e clicar no botão "Cartões..." na UI web para disparar a geração fiel.

---

## 6. Mapeamento de Disciplinas (Referência)

Replicado da configuração do Apps Script (`flashcards/Código.js`):

| Palavra-chave no Nome | Disciplina |
|:---|:---|
| `radiologia`, `rastreio`, `torax` | LMF - Radiologia |
| `patologia` | Patologia |
| `parasito`, `amebias`, `giardia` | Parasitologia |
| `farmaco`, `antimetab`, `antineopla` | Farmacologia |
| `clinica`, `fetal`, `obstetri` | LHM - Clínica |

> Este mapeamento deve ser atualizado junto com a constante `DISCIPLINAS` no `Código.js` sempre que novas matérias forem adicionadas no semestre.

---

## 7. Regras de Segurança

* **NUNCA** sobrescrever ou deletar fontes já existentes em cadernos de clientes. Apenas adicionar novas fontes.
* **NUNCA** fazer upload de arquivos de rascunho ou incompletos.
* **NUNCA** instruir o NotebookLM a gerar ou reformular flashcards — os cards devem ser usados exatamente como foram gerados pelo pipeline.
* **SEMPRE** confirmar com o usuário a lista de arquivos antes de iniciar o upload em lote.
* **SEMPRE** verificar se a autenticação do MCP está ativa antes de iniciar o fluxo.
