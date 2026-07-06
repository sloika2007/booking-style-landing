# Подготовка и загрузка проекта на GitHub
Set-Location $PSScriptRoot
$ErrorActionPreference = "Stop"

function Find-Git {
    $candidates = @(
        (Get-Command git -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files (x86)\Git\bin\git.exe"
    )
    foreach ($path in $candidates) {
        if ($path -and (Test-Path $path)) { return $path }
    }
    return $null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Подготовка к GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Папка: $PWD"
Write-Host ""

$gitExe = Find-Git
if (-not $gitExe) {
    Write-Host "[!] Git не найден." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Установите: https://git-scm.com/download/win"
    Write-Host "Или загрузите проект вручную — см. GITHUB.md (способ 2)"
    Write-Host ""
    Read-Host "Enter для выхода"
    exit 1
}

Write-Host "[OK] Git: $(& $gitExe --version)" -ForegroundColor Green

if (-not (Test-Path "data\config.json")) {
    Copy-Item "data\config.example.json" "data\config.json"
    Write-Host "[OK] Создан data\config.json (локально, не в git)" -ForegroundColor Green
}

if (Test-Path "data\config.json") {
    $ignored = & $gitExe check-ignore -v "data/config.json" 2>$null
    if ($ignored) {
        Write-Host "[OK] data/config.json в .gitignore" -ForegroundColor Green
    } else {
        Write-Host "[!] ВНИМАНИЕ: data/config.json НЕ в .gitignore!" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path ".git")) {
    & $gitExe init
    & $gitExe branch -M main
    Write-Host "[OK] git init" -ForegroundColor Green
} else {
    Write-Host "[OK] Репозиторий .git уже есть" -ForegroundColor Green
}

Write-Host ""
Write-Host "Добавляю файлы (без node_modules и config.json)..."
& $gitExe add .
& $gitExe status

$stagedConfig = & $gitExe diff --cached --name-only | Select-String "data/config.json"
if ($stagedConfig) {
    Write-Host ""
    Write-Host "[!] ОШИБКА: data/config.json попал в индекс! Удалите его из коммита." -ForegroundColor Red
    & $gitExe reset HEAD data/config.json 2>$null
    exit 1
}

$hasCommit = $false
try {
    & $gitExe rev-parse HEAD 2>$null | Out-Null
    $hasCommit = $true
} catch {
    $hasCommit = $false
}

Write-Host ""
if (-not $hasCommit) {
    $answer = Read-Host "Создать первый коммит 'Initial commit'? (y/n)"
    if ($answer -match '^[yYдД]') {
        & $gitExe commit -m "Initial commit: booking style landing"
        Write-Host "[OK] Коммит создан" -ForegroundColor Green
    }
} else {
    $dirty = & $gitExe status --porcelain
    if ($dirty) {
        Write-Host "Есть незакоммиченные изменения. Выполните:" -ForegroundColor Yellow
        Write-Host '  git commit -m "Update"' -ForegroundColor White
    } else {
        Write-Host "[OK] Рабочая копия чистая" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Дальше на GitHub" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. https://github.com/new  (без README и .gitignore)"
Write-Host "2. Выполните:"
Write-Host ""
Write-Host '   git remote add origin https://github.com/USER/REPO.git' -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Подробнее: GITHUB.md"
Write-Host ""
Read-Host "Enter для выхода"
