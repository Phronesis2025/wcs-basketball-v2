# Pandoc Installation Guide

This guide will help you install Pandoc on Windows so you can convert the user manuals to PDF format.

## Installation Options

### Option 1: Using winget (Recommended for Windows 10/11)

1. Open PowerShell or Command Prompt as Administrator
2. Run the following command:
   ```powershell
   winget install --id JohnMacFarlane.Pandoc
   ```
3. Verify installation:
   ```powershell
   pandoc --version
   ```

### Option 2: Using Chocolatey

1. Install Chocolatey (if not already installed): https://chocolatey.org/install
2. Open PowerShell as Administrator
3. Run:
   ```powershell
   choco install pandoc
   ```
4. Verify installation:
   ```powershell
   pandoc --version
   ```

### Option 3: Manual Installation

1. Download the Windows installer from: https://github.com/jgm/pandoc/releases/latest
2. Look for the `.msi` file (e.g., `pandoc-3.x.x-windows-x86_64.msi`)
3. Run the installer
4. Follow the installation wizard
5. Verify installation by opening a new PowerShell window and running:
   ```powershell
   pandoc --version
   ```

## PDF Engine Options

Pandoc needs a PDF engine to create PDFs. You have several options:

### Option 1: wkhtmltopdf (Recommended)

1. Download from: https://wkhtmltopdf.org/downloads.html
2. Install the Windows version
3. The conversion script will use this automatically

### Option 2: LaTeX (More complex but better formatting)

1. Install MiKTeX: https://miktex.org/download
2. Pandoc will use LaTeX to generate PDFs
3. First run may take longer as LaTeX downloads packages

### Option 3: Use HTML to PDF conversion

If you have issues with PDF engines, you can:

1. Convert markdown to HTML first
2. Use a browser to print to PDF (with TOC)

## Converting the Manuals

Once Pandoc is installed, you can convert the manuals using one of these methods:

### Method 1: Using the PowerShell Script (Easiest)

1. Open PowerShell in the project root directory
2. Run:
   ```powershell
   .\docs\convert-to-pdf.ps1
   ```

### Method 2: Manual Conversion

Run these commands in PowerShell from the project root:

**Admin Manual:**

```powershell
pandoc docs/ADMIN_USER_MANUAL.md -o docs/ADMIN_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
```

**Coach Manual:**

```powershell
pandoc docs/COACH_USER_MANUAL.md -o docs/COACH_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
```

### Method 3: With Advanced Formatting

For better formatting with title page and custom styling:

**Admin Manual:**

```powershell
pandoc docs/ADMIN_USER_MANUAL.md `
    -o docs/ADMIN_USER_MANUAL.pdf `
    --toc `
    --toc-depth=3 `
    -V geometry:margin=1in `
    -V titlepage=true `
    -V toc-title="Table of Contents" `
    --standalone
```

**Coach Manual:**

```powershell
pandoc docs/COACH_USER_MANUAL.md `
    -o docs/COACH_USER_MANUAL.pdf `
    --toc `
    --toc-depth=3 `
    -V geometry:margin=1in `
    -V titlepage=true `
    -V toc-title="Table of Contents" `
    --standalone
```

## Troubleshooting

### "pandoc is not recognized"

- Make sure Pandoc is installed
- Close and reopen your terminal/PowerShell
- Check that Pandoc is in your PATH environment variable

### PDF generation fails

- Install a PDF engine (wkhtmltopdf or LaTeX)
- Try the alternative PDF engine option in the script
- Check that the markdown files exist in the docs/ directory

### TOC links don't work

- Make sure you're using `--toc` flag
- PDF viewers may vary in TOC link support
- Adobe Reader and most modern PDF viewers support clickable TOC

### Formatting issues

- Adjust margins with `-V geometry:margin=1in`
- Use `--pdf-engine=wkhtmltopdf` for better HTML rendering
- Use LaTeX engine for more advanced formatting options

## Alternative: Online Conversion

If you prefer not to install Pandoc locally, you can use online services:

1. Upload the markdown file to a service like Dillinger.io
2. Export as PDF
3. Note: TOC may not be clickable with online converters

## Need Help?

- Pandoc documentation: https://pandoc.org/MANUAL.html
- Pandoc GitHub: https://github.com/jgm/pandoc
