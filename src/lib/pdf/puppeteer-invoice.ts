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
    
    // Optimized: Wait for payment API responses with shorter timeout
    if (apiResponses.length > 0) {
      devLog("generateInvoicePDFFromHTML: Waiting for payment API responses", { count: apiResponses.length });
      try {
        await Promise.race([
          Promise.all(apiResponses),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 15000)) // 15s max
        ]);
        devLog("generateInvoicePDFFromHTML: All payment API responses completed");
        // Reduced wait for React to process - 500ms should be enough
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        devLog("generateInvoicePDFFromHTML: Error waiting for API responses, continuing", error);
      }
    } else {
      // If no API calls detected, wait briefly for them to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Check again with shorter timeout
      if (apiResponses.length > 0) {
        try {
          await Promise.race([
            Promise.all(apiResponses),
            new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 10000))
          ]);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          devLog("generateInvoicePDFFromHTML: API wait timeout, continuing", error);
        }
      }
    }

    // Optimized: Combined wait for loading state and data in single check
    devLog("generateInvoicePDFFromHTML: Waiting for page to finish loading and data to appear");
    try {
      // Wait for both loading to clear AND data to appear - more efficient single check
      await page.waitForFunction(
        () => {
          // First check loading is gone
          const loadingText = document.body.textContent || '';
          if (loadingText.includes('Loading invoice...')) return false;
          
          // Then check for subtotal (indicates data loaded)
          const hasSubtotal = loadingText.includes('Subtotal:') && loadingText.match(/\$\d+\.\d{2}/);
          if (!hasSubtotal) return false;
          
          // Finally verify table has actual data
          const tbody = document.querySelector('table tbody');
          if (!tbody) return false;
          
          const rows = tbody.querySelectorAll('tr');
          for (const row of Array.from(rows)) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) {
              const amountCell = cells[5];
              const amountText = (amountCell.textContent || '').trim();
              if (amountText && amountText.includes('$') && amountText !== '$0.00') {
                const playerCell = cells[1];
                const playerText = (playerCell.textContent || '').trim();
                if (playerText && playerText !== '') {
                  return true; // Found real data
                }
              }
            }
          }
          return false;
        },
        { timeout: 15000, polling: 200 } // Reduced timeout to 15s, check every 200ms (faster)
      );
      devLog("generateInvoicePDFFromHTML: Payment data confirmed in table");
      
      // Minimal wait for React to finish rendering - 200ms should be enough
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      devLog("generateInvoicePDFFromHTML: Payment data wait timeout, continuing anyway", error);
      // Log table state for debugging
      try {
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
      } catch (evalError) {
        devLog("generateInvoicePDFFromHTML: Could not evaluate table state", evalError);
      }
    }

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

