# Pesquisas e Limites Técnicos - Medhelp

## 1. Webhooks no Google Apps Script (GAS)
- **Método**: Funções `doPost(e)` ou `doGet(e)` são reservadas para responder a requisições HTTP externas quando o script é publicado como um **Aplicativo da Web** (Web App).
- **Publicação**: 
  - Executar no editor: *Implantar > Nova implantação*.
  - Tipo: *Aplicativo da Web*.
  - Executar como: *Eu (seu e-mail)*.
  - Quem tem acesso: *Qualquer pessoa* (necessário para que o Colab consiga acessar sem login Google complexo).
- **Retorno**: Deve retornar um objeto `TextOutput` formatado em JSON para que o cliente (Python) possa ler a resposta de forma estruturada.

## 2. Limites do Google Apps Script
- **Runtime máximo**: 6 minutos por execução (4.5 min definidos no `CONFIG` por segurança).
- **Chamadas de rede simultâneas**: Se múltiplas requisições chegarem ao mesmo tempo, o GAS as colocará em fila automaticamente, mas é recomendável rodar em lote sequencial ou ter trava de concorrência.
- **Tratamento de exceções**: A função `doPost` deve envelopar a lógica em `try/catch` para retornar `status: "erro"` com status HTTP adequado em vez de lançar um erro de execução silencioso.

## 3. Serviços Avançados do Drive API (v2)
- **Descrição**: O script usa `Drive.Files.insert` para criar um Google Doc temporário a partir de um PDF de slide (OCR/conversão de formato).
- **Ativação**: No editor do Google Apps Script, na barra lateral esquerda, clique no sinal de **+** ao lado de **Serviços**, selecione **Drive API** e clique em **Adicionar**. Sem isso, o script falhará com `ReferenceError: Drive is not defined`.

## 4. Cotas do Gemini 2.5 Flash
- **Limites**: O modelo `gemini-2.5-flash` tem uma cota padrão de 15 requisições por minuto (RPM).
- **Tratamento**: Adicionar throttle (`Utilities.sleep(6000)`) entre processamento de arquivos para evitar erros de HTTP 429.

