# 🤝 Kit de Sobrevivência Med — Guia do Monitor Parceiro

> Esse documento explica tudo que você precisa saber para operar o sistema na sua faculdade.  
> Se tiver dúvida em qualquer parte, me chama.

---

## O que é o Kit de Sobrevivência Med?

É um **ecossistema de materiais de estudo gerados automaticamente por IA** para alunos de medicina. A ideia é simples: transformar as aulas em produtos de alto valor (resumos, flashcards, PDFs organizados) de forma quase automática, e vender o acesso a esses materiais para os colegas da turma.

### Os produtos que o sistema gera

| Produto | O que é |
|---|---|
| **Resumo da Aula** | Arquivo Markdown com os pontos-chave da aula, tabelas comparativas e curadoria de vídeos do YouTube |
| **Flashcards** | Cards de revisão no formato Obsidian Spaced Repetition, prontos para o NotebookLM |
| **PDF Premium** | PDF completo da tutoria PBL com capa, índice de navegação e ordenação didática |
| **Roteiro PBL** | Extração dos objetivos de aprendizado do problema para guiar os estudos |

---

## Como a Parceria Funciona

Somos dois operadores independentes, cada um na sua faculdade, usando **a mesma ferramenta**.

```
Você (CEUMA)              João Gabriel (UNDB)
     │                           │
     ▼                           ▼
Grava aulas              Grava aulas
Faz Roteiro PBL          Faz Roteiro PBL
     │                           │
     └──────────┬────────────────┘
                ▼
        Sistema Medhelp
        (IA + Automação)
                │
     ┌──────────┴────────────┐
     ▼                       ▼
Resumos/CEUMA         Resumos/UNDB
Flashcards/CEUMA      Flashcards/UNDB
PDFs/CEUMA            PDFs/UNDB
```

**Os materiais das turmas são completamente separados.** Nenhum aluno do CEUMA vê material do UNDB e vice-versa.

---

## O que Você Precisa Fazer (Divisão de Trabalho)

### ✅ Você faz sozinho (autônomo)

#### Roteiro PBL
1. Você acessa o notebook `Orquestrador_Hibrido.ipynb` no Google Colab (link no repositório)
2. Na primeira célula, edita **apenas duas linhas**:
   ```python
   MONITOR_NOME = "Seu Nome Aqui"
   FACULDADE    = "CEUMA"
   ```
3. Executa todas as células
4. O PDF do roteiro sai com **seu nome** na autoria automaticamente

#### Flashcards no NotebookLM
- Após os flashcards aparecerem na sua pasta do Drive, você pega o arquivo `.md` e publica no NotebookLM conforme o processo que já definimos

---

### 🤝 Fazemos juntos (você grava, eu processo)

#### Aulas (Transcrição + Resumo + PDF Premium)

**Sua parte:**
1. Você grava a aula normalmente
2. Nomeia o arquivo seguindo **obrigatoriamente** esse padrão:
   ```
   CEUMA - [TIPO] - [Tema da Aula]
   ```
   Exemplos:
   - `CEUMA - LMF - Fisiologia do Coração.m4a`
   - `CEUMA - TFC - Semiologia Respiratória.m4a`

   > ⚠️ **Importante:** O nome do arquivo precisa começar com `CEUMA -` (com espaço e traço). Isso é o que o sistema usa para saber que o material é da sua turma. Se não seguir esse padrão, o arquivo pode ir para o lugar errado.

3. Deposita o áudio e os slides na pasta do Drive que vou compartilhar com você
4. Me avisa no WhatsApp que os arquivos estão lá

**Minha parte:**
1. Eu rodo o processamento (transcrição + resumo + PDF Premium)
2. Te aviso quando estiver pronto (em até 48h)
3. Os arquivos aparecem na sua pasta de materiais prontos

---

## O que Você Precisa Criar (Setup Inicial)

Para o sistema funcionar, você precisa criar **4 pastas no seu Google Drive** e compartilhar com a minha conta (`meu-email@gmail.com`) como **Editor**:

| Pasta | Para que serve |
|---|---|
| `CEUMA - Entrada` | Onde você deposita os áudios e slides |
| `CEUMA - Resumos Prontos` | Onde os resumos `.md` aparecem |
| `CEUMA - Flashcards` | Onde os flashcards `.md` aparecem |
| `CEUMA - Arquivados` | Onde os áudios vão depois de processados |

Depois de criar, me manda os **IDs das pastas** (são os códigos que aparecem na URL quando você abre a pasta no Drive). Exemplo de ID: `1qRBLRtpsNRUDiOn99mg2wA5qhwLvRJIh`.

---

## Seu Site

Você vai ter uma **landing page própria** no GitHub Pages — igual à que eu tenho, mas com o seu nome, sua faculdade e seu WhatsApp.

Para isso, você vai:
1. Criar um repositório no GitHub a partir do template que vou disponibilizar
2. Editar um único arquivo chamado `config.yml` com suas informações:
   ```yaml
   monitor_nome: "Seu Nome"
   faculdade: "CEUMA"
   cidade: "São Luís, MA"
   whatsapp: "5598XXXXXXXXX"
   ```
3. Fazer push — o site fica online automaticamente em ~1 minuto

Para **atualizar o site** (mudar preço, adicionar módulo), você edita o `config.yml` e faz push novamente. São literalmente 2 comandos no terminal.

---

## Regras da Parceria

### Nomenclatura de arquivos (inegociável)
Todo arquivo depositado na pasta de entrada **deve** começar com `CEUMA -`. Arquivo sem esse prefixo vai para uma fila de erro e não é processado — você teria que renomear e recolocar.

### SLA de processamento
- Você deposita os áudios + me avisa no WhatsApp
- Eu processo e te aviso em **até 48 horas**
- Se eu não responder em 48h, pode me cobrar sem cerimônia

### Independência do Roteiro PBL
O Roteiro PBL é **completamente seu**. Você roda, você distribui, sem precisar de mim. Isso garante que você não trava em nada que dependa da minha disponibilidade para o produto mais frequente.

### Dados das turmas
Os materiais da sua turma ficam no **seu Drive**, sob o seu controle. Eu tenho acesso de Editor para processar, mas os arquivos são seus. Se a parceria encerrar por qualquer motivo, os materiais continuam na sua conta.

---

## Resumo Visual do Fluxo

```
Você grava a aula
        ↓
Nomeia: CEUMA - LMF - Tema.m4a
        ↓
Deposita na pasta CEUMA - Entrada
        ↓
Me avisa no WhatsApp
        ↓
Eu processo (Whisper + Gemini) — até 48h
        ↓
Arquivos aparecem em CEUMA - Resumos e CEUMA - Flashcards
        ↓
Você distribui para os alunos e publica os flashcards no NotebookLM
```

---

## Contato e Dúvidas

Qualquer coisa que não estiver claro aqui, me chama diretamente.  
O objetivo é que **você consiga operar 90% do sistema de forma autônoma** — sem precisar me acionar para cada etapa.
