import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { devLog, devError } from "@/lib/security";

/**
 * Helper function to get the base URL for invoice page navigation
 * Matches the pattern used in emailTemplates.ts
 */
function getEmailBaseUrl(): string {
  // In production, always use the custom domain (never use Vercel URLs)
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;

  if (isProduction) {
    // In production, always use the custom domain
    return "https://www.wcsbasketball.site";
  }

  // Development: Try NEXT_PUBLIC_BASE_URL first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
    const withProtocol =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    // Only use if it's localhost (development)
    if (/localhost|127\.0\.0\.1/i.test(withProtocol)) {
      return withProtocol.replace(/\/+$/, "");
    }
    // If NEXT_PUBLIC_BASE_URL is set to the custom domain in dev, use it
    if (withProtocol.includes("wcsbasketball.site")) {
      return withProtocol.replace(/\/+$/, "");
    }
  }

  // Development fallback
  return "http://localhost:3000";
}

/**
 * Generate PDF invoice from HTML page using Puppeteer
 * This renders the actual invoice page to PDF, ensuring it matches exactly
 * 
 * @param playerId - The player ID to generate invoice for
 * @param isCombined - Whether this is a combined invoice for multiple players (default: false)
 * @returns PDF as Uint8Array
 */
export async function generateInvoicePDFFromHTML(
  playerId: string,
  isCombined: boolean = false
): Promise<Uint8Array> {
  let browser;
  
  try {
    const baseUrl = getEmailBaseUrl();
    const invoiceUrl = `${baseUrl}/payment/${playerId}?print=1`;
    
    devLog("generateInvoicePDFFromHTML: Starting PDF generation", {
      playerId,
      isCombined,
      invoiceUrl,
      isProduction: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
    });

    // Configure browser launch options
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
    
    const launchOptions: any = {
      headless: true,
      args: isProduction ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    // Use Vercel-optimized Chromium in production, system Chrome in development
    if (isProduction) {
      launchOptions.executablePath = await chromium.executablePath();
      launchOptions.defaultViewport = chromium.defaultViewport;
      launchOptions.headless = chromium.headless;
    } else {
      // In development, try to use system Chrome/Chromium
      // Common paths for Chrome on different systems
      const chromePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", // Windows 32-bit
        "/usr/bin/google-chrome", // Linux
        "/usr/bin/chromium-browser", // Linux
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS
      ];

      let executablePath: string | undefined;
      for (const path of chromePaths) {
        if (path) {
          const fs = await import("fs");
          try {
            if (fs.existsSync(path)) {
              executablePath = path;
              break;
            }
          } catch {
            // Continue to next path
          }
        }
      }

      if (executablePath) {
        launchOptions.executablePath = executablePath;
      } else {
        devError("generateInvoicePDFFromHTML: Chrome/Chromium not found. Please install Chrome or set PUPPETEER_EXECUTABLE_PATH");
        throw new Error("Chrome/Chromium executable not found");
      }
    }

    // Launch browser
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Navigate to invoice page
    devLog("generateInvoicePDFFromHTML: Navigating to invoice page", { invoiceUrl });
    
    // Set up network response tracking to wait for payment data API calls
    const apiResponses: Promise<void>[] = [];
    const responsePromises: Map<string, Promise<void>> = new Map();
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/parent/profile') || url.includes('/api/player/payments/') || url.includes('/api/parent/checkout-status')) {
        if (!responsePromises.has(url)) {
          devLog("generateInvoicePDFFromHTML: Detected payment API response", url);
          const promise = response.json().then(() => {
            devLog("generateInvoicePDFFromHTML: Payment API response completed", url);
          }).catch(() => {
            devLog("generateInvoicePDFFromHTML: Payment API response error", url);
          });
          responsePromises.set(url, promise);
          apiResponses.push(promise);
        }
      }
    });
    
    await page.goto(invoiceUrl, {
      waitUntil: "domcontentloaded", // Don't wait for all network - we'll wait for specific APIs
      timeout: 30000, // 30 second timeout
    });
    
    // Wait for the payment API responses to complete
    if (apiResponses.length > 0) {
      devLog("generateInvoicePDFFromHTML: Waiting for payment API responses", { count: apiResponses.length });
      try {
        await Promise.all(apiResponses);
        devLog("generateInvoicePDFFromHTML: All payment API responses completed");
        // Wait a bit for React to process the responses
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        devLog("generateInvoicePDFFromHTML: Error waiting for API responses", error);
      }
    } else {
      // If no API calls detected, wait a bit for them to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Check again
      if (apiResponses.length > 0) {
        await Promise.all(apiResponses);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Wait for the page to finish loading (wait for loading state to be false)
    devLog("generateInvoicePDFFromHTML: Waiting for page to finish loading");
    try {
      // Wait for the "Loading invoice..." text to disappear
      await page.waitForFunction(
        () => {
          const loadingText = document.body.textContent || '';
          return !loadingText.includes('Loading invoice...');
        },
        { timeout: 20000 }
      );
      devLog("generateInvoicePDFFromHTML: Loading state cleared");
      
      // Wait for payment data to actually appear in the table
      // The API calls might complete but React needs time to render
      // Wait for the subtotal to appear, which indicates data has loaded
      try {
        await page.waitForFunction(
          () => {
            // First check if subtotal is visible (more reliable indicator)
            const bodyText = document.body.textContent || '';
            const hasSubtotal = bodyText.includes('Subtotal:') && bodyText.match(/\$\d+\.\d{2}/);
            
            if (hasSubtotal) {
              // Also verify table has data
              const tbody = document.querySelector('table tbody');
              if (tbody) {
                const rows = tbody.querySelectorAll('tr');
                // Check if any row has actual payment data (amount with $ sign)
                for (const row of Array.from(rows)) {
                  const cells = row.querySelectorAll('td');
                  if (cells.length >= 6) {
                    const amountCell = cells[5];
                    const amountText = (amountCell.textContent || '').trim();
                    // Must have $ sign to be real payment data
                    if (amountText && amountText.includes('$') && amountText !== '$0.00') {
                      // Also verify player name cell has content
                      const playerCell = cells[1];
                      const playerText = (playerCell.textContent || '').trim();
                      if (playerText && playerText !== '') {
                        return true; // Found a real data row
                      }
                    }
                  }
                }
              }
            }
            return false;
          },
          { timeout: 40000, polling: 1000 } // Wait up to 40 seconds, check every second
        );
        devLog("generateInvoicePDFFromHTML: Payment data confirmed in table");
      } catch (error) {
        devLog("generateInvoicePDFFromHTML: Payment data wait timeout", error);
        // Log what we actually see in the table
        const tableDebug = await page.evaluate(() => {
          const tbody = document.querySelector('table tbody');
          if (!tbody) return { error: 'No tbody found' };
          const rows = Array.from(tbody.querySelectorAll('tr'));
          return rows.map((row, idx) => {
            const cells = Array.from(row.querySelectorAll('td'));
            return {
              row: idx,
              cells: cells.map((c, i) => ({
                index: i,
                text: (c.textContent || '').trim(),
                hasContent: (c.textContent || '').trim() !== ''
              }))
            };
          });
        });
        devLog("generateInvoicePDFFromHTML: Table debug info", JSON.stringify(tableDebug, null, 2));
      }
      
      // Wait a bit more for React to finish rendering all components
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      devLog("generateInvoicePDFFromHTML: Loading wait timeout, continuing anyway", error);
    }

    // Wait for the invoice table to be populated with data
    // This ensures React has finished rendering the payment items
    devLog("generateInvoicePDFFromHTML: Waiting for table data");
    
    // First, wait for the table element itself to exist
    try {
      await page.waitForSelector('table tbody', { timeout: 10000 });
      devLog("generateInvoicePDFFromHTML: Table element found");
    } catch (error) {
      devLog("generateInvoicePDFFromHTML: Table element not found, continuing anyway", error);
    }
    
    // Then wait for actual data in the table - but don't fail if there are no payments
    // The timeout is expected if there are no payments to show
    try {
      // Wait for table rows with actual payment data
      await page.waitForFunction(
        () => {
          const tbody = document.querySelector('table tbody');
          if (!tbody) return false;
          
          const rows = tbody.querySelectorAll('tr');
          if (rows.length === 0) return false;
          
          // Check if at least one row has actual payment data
          for (const row of Array.from(rows)) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 6) continue; // Need all 6 columns
            
            // Check specifically for amount cell (last one) to have $ sign
            // This is the most reliable indicator of actual payment data
            const amountCell = cells[5];
            const amountText = (amountCell.textContent || '').trim();
            const hasAmount = amountText !== '' && amountText.includes('$');
            
            // Also check that player name cell (2nd cell) has content
            const playerCell = cells[1];
            const playerText = (playerCell.textContent || '').trim();
            const hasPlayer = playerText !== '';
            
            // If we have both amount and player name, it's a real data row
            if (hasAmount && hasPlayer) {
              return true;
            }
          }
          
          return false;
        },
        { timeout: 20000, polling: 500 } // Wait up to 20 seconds, check every 500ms
      );
      devLog("generateInvoicePDFFromHTML: Table data loaded successfully");
    } catch (error) {
      // This is expected if there are no payments - don't treat it as a critical error
      devLog("generateInvoicePDFFromHTML: Table wait completed (may have no payments to display)", error);
      
      // Log table state for debugging - expand the arrays to see actual content
      try {
        const tableState = await page.evaluate(() => {
          const tbody = document.querySelector('table tbody');
          if (!tbody) return { found: false };
          const rows = tbody.querySelectorAll('tr');
          const rowData = Array.from(rows).slice(0, 5).map((row, idx) => {
            const cells = row.querySelectorAll('td');
            return {
              rowIndex: idx,
              cellCount: cells.length,
              cellTexts: Array.from(cells).map(c => (c.textContent || '').trim()),
              // Check specific cells
              date: cells[0] ? (cells[0].textContent || '').trim() : '',
              player: cells[1] ? (cells[1].textContent || '').trim() : '',
              amount: cells[5] ? (cells[5].textContent || '').trim() : '',
            };
          });
          return { found: true, rowCount: rows.length, sampleRows: rowData };
        });
        devLog("generateInvoicePDFFromHTML: Table state after timeout", JSON.stringify(tableState, null, 2));
      } catch (evalError) {
        devLog("generateInvoicePDFFromHTML: Could not evaluate table state", evalError);
      }
    }

    // Wait a bit more for any dynamic content to fully render
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Inject CSS to hide footer elements in PDF (more reliable than @media print)
    // Also hide via JavaScript as a backup
    await page.evaluate(() => {
      // Remove footer elements directly
      const footers = document.querySelectorAll('.invoice-footer');
      footers.forEach(footer => {
        if (footer && footer.parentNode) {
          footer.parentNode.removeChild(footer);
        }
      });
    });
    
    // Also add CSS style tag as backup
    await page.addStyleTag({
      content: `
        .invoice-footer {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `
    });

    // Measure invoice height to decide if we should restrict to a single page
    const marginsInches = { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 };
    const usableHeightPx = (11 - (marginsInches.top + marginsInches.bottom)) * 96; // Letter height minus margins
    const contentHeightPx = await page.evaluate(() => {
      const el = document.getElementById('invoice-root');
      if (el) {
        const rect = el.getBoundingClientRect();
        // Use scrollHeight if bigger than bounding rect height
        // for elements that may overflow their bounding box
        return Math.max(rect.height, (el as any).scrollHeight || rect.height);
      }
      return document.body.scrollHeight;
    });
    devLog("generateInvoicePDFFromHTML: Invoice height check", {
      contentHeightPx,
      usableHeightPx,
    });

    // Generate PDF
    devLog("generateInvoicePDFFromHTML: Generating PDF");
    const pdfOptions: any = {
      format: "Letter", // 8.5 x 11 inches
      printBackground: true, // Include background colors and images
      margin: {
        top: `${marginsInches.top}in`,
        right: `${marginsInches.right}in`,
        bottom: `${marginsInches.bottom}in`,
        left: `${marginsInches.left}in`,
      },
      preferCSSPageSize: false, // Use format instead of CSS page size
    };
    // If content fits within one page, restrict to first page to avoid blank second page
    if (contentHeightPx <= usableHeightPx - 2) {
      pdfOptions.pageRanges = "1";
      devLog("generateInvoicePDFFromHTML: Content fits a single page; restricting to page 1");
    }
    const pdf = await page.pdf(pdfOptions);

    devLog("generateInvoicePDFFromHTML: PDF generated successfully", {
      pdfSize: `${(pdf.length / 1024).toFixed(2)} KB`,
      playerId,
    });

    return new Uint8Array(pdf);
  } catch (error) {
    devError("generateInvoicePDFFromHTML: Error generating PDF", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

