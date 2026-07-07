import requests

# URL fornecida ao implantar o Apps Script como Aplicativo da Web
WEBHOOK_URL = "SUA_URL_DO_WEBAPP_AQUI"

def acionar_apps_script():
    print("📡 Acionando processamento de resumos no Google Apps Script...")
    try:
        # Envia a requisição HTTP POST para o Apps Script
        # A flag allow_redirects=True é crucial porque o GAS faz redirecionamentos temporários (302)
        response = requests.post(WEBHOOK_URL, allow_redirects=True)
        
        if response.status_code == 200:
            try:
                resultado = response.json()
                if resultado.get("status") == "sucesso":
                    print("✅ Sucesso! O processamento foi executado e os resumos foram salvos no Drive.")
                else:
                    print(f"⚠️ O Apps Script retornou um aviso: {resultado.get('mensagem')}")
            except ValueError:
                print("⚠️ Retorno recebido, mas não está no formato JSON esperado.")
                print(response.text)
        else:
            print(f"❌ Falha de comunicação. Código HTTP: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Falha ao conectar ao Webhook: {e}")

if __name__ == "__main__":
    acionar_apps_script()
