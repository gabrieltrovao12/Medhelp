$globalConfigPath = "$env:USERPROFILE\.gemini\config\mcp_config.json"
$workspaceRoot = (Resolve-Path "$PSScriptRoot\..").Path

# Verifica se o arquivo global existe, senão cria um básico
if (-not (Test-Path $globalConfigPath)) {
    Write-Host "Criando mcp_config.json global..."
    $dir = Split-Path $globalConfigPath
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    "{ `"mcpServers`": {} }" | Set-Content $globalConfigPath
}

Write-Host "Atualizando mcp_config.json global com todos os servidores do Medhelp..."
$config = Get-Content $globalConfigPath -Raw | ConvertFrom-Json

if ($null -eq $config.mcpServers) {
    $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue (New-Object PSObject)
}

$servers = @{
    "github-mcp-server" = [PSCustomObject]@{
        command = "docker"
        args = @("run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server")
        env = [PSCustomObject]@{ GITHUB_PERSONAL_ACCESS_TOKEN = "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" }
    }
    "pubmed" = [PSCustomObject]@{
        command = "npx.cmd"
        args = @("-y", "@smithery/cli", "run", "@jackkuo666/pubmed-mcp-server")
    }
    "consensus" = [PSCustomObject]@{
        command = "npx.cmd"
        args = @("-y", "@smithery/cli", "run", "consensus")
    }

    "google-drive" = [PSCustomObject]@{
        command = "node"
        args = @("$workspaceRoot\scripts\mcp_servers\google-drive-mcp\dist\index.js")
    }
    "brave-search" = [PSCustomObject]@{
        command = "node"
        args = @("$workspaceRoot\scripts\mcp_servers\brave-search-mcp-server\dist\index.js")
        env = [PSCustomObject]@{ BRAVE_API_KEY = "COLE_SUA_CHAVE_AQUI_DEPOIS" }
    }
}

foreach ($key in $servers.Keys) {
    if ($config.mcpServers.PSObject.Properties.Match($key).Count) {
        $config.mcpServers.$key = $servers[$key]
    } else {
        $config.mcpServers | Add-Member -NotePropertyName $key -NotePropertyValue $servers[$key]
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content $globalConfigPath
Write-Host "✅ Todos os MCPs configurados com sucesso no config global!"

Write-Host "Instalando dependências Node.js (npm install) para servidores locais..."
$currentLoc = Get-Location

$gdPath = "$workspaceRoot\scripts\mcp_servers\google-drive-mcp"
if (Test-Path "$gdPath\package.json") { 
    Set-Location $gdPath
    npm install
}

$bsPath = "$workspaceRoot\scripts\mcp_servers\brave-search-mcp-server"
if (Test-Path "$bsPath\package.json") { 
    Set-Location $bsPath
    npm install
}

Set-Location $currentLoc

Write-Host "Verificando dependências Python..."
pip install -r "$workspaceRoot\requirements.txt"

Write-Host "✅ Sincronização concluída! Lembre-se de dar um Reload Window no IDE (Ctrl+Shift+P -> Developer: Reload Window)."
