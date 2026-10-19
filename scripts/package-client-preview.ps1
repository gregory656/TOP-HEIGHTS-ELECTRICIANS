param(
  [string]$DestinationDirectory = (Join-Path $env:USERPROFILE 'Downloads'),
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$previewRepo = Split-Path -Parent $PSScriptRoot
$previewOutput = Join-Path $previewRepo 'preview-dist'
Push-Location -LiteralPath $previewRepo
try {
  if (-not $SkipBuild) {
    & npm.cmd run build:client-preview
    if ($LASTEXITCODE -ne 0) { throw 'Preview build failed. No ZIP created.' }
  }
  foreach ($requiredFile in @('index.html', 'vercel.json', 'robots.txt')) {
    if (-not (Test-Path -LiteralPath (Join-Path $previewOutput $requiredFile))) { throw "Missing preview file: $requiredFile" }
  }
  $previewHtml = Get-Content -LiteralPath (Join-Path $previewOutput 'index.html') -Raw
  if ($previewHtml -notmatch 'noindex' -or $previewHtml -notmatch "connect-src 'none'") { throw 'The preview isolation settings are missing.' }
  $unexpectedFiles = Get-ChildItem -LiteralPath $previewOutput -File -Recurse | Where-Object {
    $_.Name -match '^\.env|\.map$|\.(ts|tsx|ps1)$|^package(-lock)?\.json$' -or $_.FullName -match '[\\/](node_modules|\.git)[\\/]'
  }
  if ($unexpectedFiles) { throw 'The output contains source or configuration files that should not be shared.' }
  New-Item -ItemType Directory -Path $DestinationDirectory -Force | Out-Null
  $previewZip = Join-Path $DestinationDirectory ('Top-Heights-UI-Preview-{0:yyyyMMdd-HHmmss}.zip' -f (Get-Date))
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::CreateFromDirectory($previewOutput, $previewZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)
  $zipRead = [System.IO.Compression.ZipFile]::OpenRead($previewZip)
  try {
    if (-not ($zipRead.Entries | Where-Object FullName -eq 'index.html')) { throw 'index.html must be at the ZIP root.' }
    Write-Output "Created: $previewZip"
    Write-Output "Files: $($zipRead.Entries.Count)"
    Write-Output ('Size: {0:N1} MB' -f ((Get-Item -LiteralPath $previewZip).Length / 1MB))
  } finally { $zipRead.Dispose() }
} finally { Pop-Location }
