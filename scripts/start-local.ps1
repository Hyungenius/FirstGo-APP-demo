param([switch]$UseSystemProxy)

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

# Node does not automatically use the Windows proxy. Opt in for this process only.
if ($UseSystemProxy) {
    $proxySettings = Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'
    if (-not $proxySettings.ProxyEnable -or -not $proxySettings.ProxyServer) {
        throw 'No enabled Windows system proxy was found. Run without -UseSystemProxy for a direct connection.'
    }
    $proxyAddress = [string]$proxySettings.ProxyServer
    if ($proxyAddress.Contains('=')) {
        $proxyMap = @{}
        foreach ($entry in $proxyAddress.Split(';')) {
            $pair = $entry.Split('=', 2)
            if ($pair.Length -eq 2) { $proxyMap[$pair[0]] = $pair[1] }
        }
        $proxyAddress = $proxyMap['https']
        if (-not $proxyAddress) { $proxyAddress = $proxyMap['http'] }
    }
    if (-not $proxyAddress) { throw 'No HTTP or HTTPS proxy was found.' }
    if ($proxyAddress -notmatch '^https?://') { $proxyAddress = 'http://' + $proxyAddress }
    $env:HTTP_PROXY = $proxyAddress
    $env:HTTPS_PROXY = $proxyAddress
    $env:NODE_USE_ENV_PROXY = '1'
    $env:NO_PROXY = (@($env:NO_PROXY, 'localhost', '127.0.0.1', '::1') | Where-Object { $_ }) -join ','
    Write-Host 'Using the existing Windows proxy for this local server.'
}

& npm.cmd run dev -- --hostname 127.0.0.1
exit $LASTEXITCODE
