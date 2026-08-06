# ==========================================================================
# eMnet 3부 8팀 AE 대시보드 로컬 HTTP 서버 실행 스크립트
# ==========================================================================

$port = 8080
$url = "http://localhost:$port/"
$path = Get-Location

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " 🚀 eMnet 3부 8팀 AE 통합 대시보드 웹 서버를 시작합니다" -ForegroundColor Green
Write-Host " 🌐 접속 주소: $url" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

# 브라우저 자동 실행
Start-Process $url

# Simple PowerShell HTTP Listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "서버가 정상적으로 8080 포트에서 동작 중입니다. (종료하려면 Ctrl+C)" -ForegroundColor Gray

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $reqPath = $request.Url.LocalPath
        if ($reqPath -eq "/") { $reqPath = "/index.html" }

        $filePath = Join-Path $path $reqPath.TrimStart('/')

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Content Type Setup
            if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".json")) { $response.ContentType = "application/json" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            elseif ($filePath.EndsWith(".jpg")) { $response.ContentType = "image/jpeg" }

            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
