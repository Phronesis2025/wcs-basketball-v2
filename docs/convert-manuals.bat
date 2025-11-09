@echo off
echo Converting WCS Basketball User Manuals to PDF...
echo.

cd /d %~dp0

echo Converting ADMIN_USER_MANUAL.md...
pandoc ADMIN_USER_MANUAL.md -o ADMIN_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
if %errorlevel% equ 0 (
    echo [SUCCESS] ADMIN_USER_MANUAL.pdf created!
) else (
    echo [ERROR] Failed to create ADMIN_USER_MANUAL.pdf
    echo Make sure Pandoc is installed and in your PATH
)
echo.

echo Converting COACH_USER_MANUAL.md...
pandoc COACH_USER_MANUAL.md -o COACH_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
if %errorlevel% equ 0 (
    echo [SUCCESS] COACH_USER_MANUAL.pdf created!
) else (
    echo [ERROR] Failed to create COACH_USER_MANUAL.pdf
    echo Make sure Pandoc is installed and in your PATH
)
echo.

echo Conversion complete!
echo PDF files are in the docs\ directory
pause

