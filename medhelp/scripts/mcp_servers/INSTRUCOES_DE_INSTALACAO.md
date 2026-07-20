# Guia Definitivo de Ativação dos MCPs - Medhelp

O ambiente em nuvem já foi preparado com o código-fonte dos servidores. O **Smithery em si é 100% gratuito** (é como se fosse a "App Store" de código aberto dos MCPs). Você não paga nada para baixar o Smithery.

Abaixo estão os comandos exatos com o **caminho absoluto do seu PC**. 

---

### 1. PubMed MCP (Totalmente Gratuito)
- **Atenção:** Como você está usando o **Antigravity IDE**, nós não vamos usar o `--client claude`. O Antigravity é muito mais inteligente e pode rodar os pacotes on-the-fly.
- **Como ativar no Antigravity:** 
  Vá nas Configurações da IDE (onde você gerencia os Servidores MCP) e adicione um novo servidor com o seguinte comando de execução:
  ```bash
  npx -y @smithery/cli run @jackkuo666/pubmed-mcp-server
  ```

---

### 2. Google Drive MCP (Gratuito, via Google Cloud)
- **Status:** 📁 Código baixado na pasta `google-drive-mcp`
- **Como compilar no PC:**
  Copie o bloco abaixo e cole no seu PowerShell:
  ```powershell
  cd C:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\mcp_servers\google-drive-mcp
  npm install
  npm run build
  ```
  Depois, adicione no painel de MCPs do Antigravity o comando: `node C:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\mcp_servers\google-drive-mcp\build\index.js`

**Como configurar o "Google Cloud" para o Drive:**
Como o Google Drive é seguro, a IA não pode acessar seus arquivos sem a sua permissão explícita. Para isso, criamos um "acesso de aplicativo" rápido:
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. No topo esquerdo, clique em **Select a Project** (Selecionar um projeto) e depois em **New Project** (Novo Projeto). Dê o nome de "Medhelp MCP" e crie.
3. No menu lateral, vá em **APIs & Services** > **Library** (Biblioteca).
4. Pesquise por **Google Drive API** e clique em **Enable** (Ativar).
5. No menu lateral, vá em **OAuth consent screen** (Tela de consentimento OAuth). Escolha **External** (Externo) e crie. Preencha apenas os nomes obrigatórios e coloque o seu e-mail como desenvolvedor e testador.
6. Vá em **Credentials** (Credenciais) > **Create Credentials** (Criar credenciais) > **OAuth client ID**.
7. Em tipo de aplicativo, escolha **Desktop app** (Aplicativo de computador).
8. Clique em **Download JSON**, renomeie o arquivo baixado para `credentials.json` e coloque-o dentro da pasta `C:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\mcp_servers\google-drive-mcp`.

---

### 3. Brave Search MCP (Freemium - 2.000 buscas grátis por mês)
- **Status:** 📁 Código baixado na pasta `brave-search-mcp-server`
- **Como compilar no PC:**
  Copie o bloco abaixo e cole no seu PowerShell:
  ```powershell
  cd C:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\mcp_servers\brave-search-mcp-server
  npm install
  npm run build
  ```
  Depois, adicione no painel de MCPs do Antigravity o comando: `node C:\Users\Trovao\.gemini\antigravity-ide\scratch\Medhelp\medhelp\scripts\mcp_servers\brave-search-mcp-server\build\index.js`
  **O que falta:** Acesse [api.search.brave.com](https://api.search.brave.com), crie uma conta gratuita (que te dá direito a 2 mil buscas mensais) e pegue sua "API Key". No seu Antigravity, adicione a variável de ambiente `BRAVE_API_KEY` com esse valor.

---

### 4. Consensus MCP (Freemium)
- **Status:** 🌐 Integração em Nuvem (Smithery)
- **Como ativar no Antigravity:** Assim como o PubMed, vá no painel de servidores MCP da IDE e adicione um novo servidor colando exatamente este comando de execução:
  ```bash
  npx -y @smithery/cli run @smithery/consensus
  ```
