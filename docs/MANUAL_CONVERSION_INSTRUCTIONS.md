# Manual PDF Conversion Instructions

Since Pandoc may not be in your PATH yet, here are instructions to convert the manuals to PDF.

## Option 1: Restart Terminal and Run Script

1. **Close and reopen your PowerShell/Command Prompt** (this refreshes the PATH)
2. Navigate to the project directory:
   ```powershell
   cd c:\dev\wcsv2.0-new
   ```
3. Run the batch file:
   ```cmd
   docs\convert-manuals.bat
   ```

## Option 2: Run Commands Manually

After restarting your terminal, run these commands from the project root:

**Admin Manual:**

```powershell
cd docs
pandoc ADMIN_USER_MANUAL.md -o ADMIN_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
```

**Coach Manual:**

```powershell
pandoc COACH_USER_MANUAL.md -o COACH_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
```

## Option 3: Use Full Path to Pandoc

If you know where Pandoc is installed, use the full path:

```powershell
cd docs
& "C:\Program Files\Pandoc\pandoc.exe" ADMIN_USER_MANUAL.md -o ADMIN_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
& "C:\Program Files\Pandoc\pandoc.exe" COACH_USER_MANUAL.md -o COACH_USER_MANUAL.pdf --toc --toc-depth=3 -V geometry:margin=1in --standalone
```

## Finding Pandoc Installation

To find where Pandoc is installed:

1. Check common locations:

   - `C:\Program Files\Pandoc\`
   - `C:\Users\[YourUsername]\AppData\Local\Pandoc\`
   - `C:\ProgramData\chocolatey\bin\` (if installed via Chocolatey)

2. Or search for it:
   ```powershell
   Get-ChildItem -Path "C:\" -Filter "pandoc.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 FullName
   ```

## What the Commands Do

- `--toc` - Creates a table of contents
- `--toc-depth=3` - Includes headings up to level 3 in the TOC
- `-V geometry:margin=1in` - Sets 1-inch margins
- `--standalone` - Creates a complete document (not a fragment)

## Expected Output

After successful conversion, you should see:

- `docs/ADMIN_USER_MANUAL.pdf`
- `docs/COACH_USER_MANUAL.pdf`

Both PDFs will have:

- ✅ Clickable table of contents
- ✅ Title pages
- ✅ Proper page breaks
- ✅ All sections properly formatted

## Troubleshooting

**"pandoc is not recognized"**

- Restart your terminal/PowerShell
- Verify Pandoc is installed: Check Add/Remove Programs
- Add Pandoc to PATH manually if needed

**PDF generation fails**

- Make sure you're in the `docs` directory
- Check that the markdown files exist
- Try running with `--verbose` flag to see errors

**TOC not clickable**

- Some PDF viewers handle TOC links differently
- Adobe Reader, Chrome PDF viewer, and most modern viewers support clickable TOC
- The TOC links are embedded in the PDF structure
