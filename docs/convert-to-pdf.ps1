# PowerShell script to convert markdown manuals to PDF using Pandoc
# Make sure Pandoc is installed before running this script

Write-Host "Converting WCS Basketball User Manuals to PDF..." -ForegroundColor Green

# Check if Pandoc is installed
try {
    $pandocVersion = pandoc --version 2>&1
    Write-Host "Pandoc found!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Pandoc is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Pandoc first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://pandoc.org/installing.html" -ForegroundColor Yellow
    Write-Host "2. Or install via Chocolatey: choco install pandoc" -ForegroundColor Yellow
    Write-Host "3. Or install via winget: winget install --id JohnMacFarlane.Pandoc" -ForegroundColor Yellow
    exit 1
}

# Convert Admin User Manual
Write-Host ""
Write-Host "Converting ADMIN_USER_MANUAL.md to PDF..." -ForegroundColor Cyan
$adminArgs = @(
    "docs/ADMIN_USER_MANUAL.md",
    "-o", "docs/ADMIN_USER_MANUAL.pdf",
    "--toc",
    "--toc-depth=3",
    "-V", "geometry:margin=1in",
    "-V", "titlepage=true",
    "-V", "toc-title=Table of Contents",
    "--standalone"
)
& pandoc $adminArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ ADMIN_USER_MANUAL.pdf created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create ADMIN_USER_MANUAL.pdf" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Yellow
}

# Convert Coach User Manual
Write-Host ""
Write-Host "Converting COACH_USER_MANUAL.md to PDF..." -ForegroundColor Cyan
$coachArgs = @(
    "docs/COACH_USER_MANUAL.md",
    "-o", "docs/COACH_USER_MANUAL.pdf",
    "--toc",
    "--toc-depth=3",
    "-V", "geometry:margin=1in",
    "-V", "titlepage=true",
    "-V", "toc-title=Table of Contents",
    "--standalone"
)
& pandoc $coachArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ COACH_USER_MANUAL.pdf created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create COACH_USER_MANUAL.pdf" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host "PDF files are located in the docs/ directory" -ForegroundColor Cyan

