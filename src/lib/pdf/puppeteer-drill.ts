import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { devLog, devError } from "@/lib/security";

/**
 * Helper function to get the base URL for drill page navigation
 */
function getEmailBaseUrl(): string {
  // In production, always use the custom domain (never use Vercel URLs)
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

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
 * Generate PDF drill from HTML page using Puppeteer
 * This renders the actual drill page to PDF, ensuring it matches exactly
 * 
 * @param drillId - The drill ID to generate PDF for
 * @returns PDF as Uint8Array
 */
export async function generateDrillPDFFromHTML(
  drillId: string
): Promise<Uint8Array> {
  let browser;
  
  try {
    const baseUrl = getEmailBaseUrl();
    const drillUrl = `${baseUrl}/drills/${drillId}?print=1`;
    
    devLog("generateDrillPDFFromHTML: Starting PDF generation", {
      drillId,
      drillUrl,
      isProduction: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
    });

    // Configure browser launch options
    const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    
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
      const chromePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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
        devError("generateDrillPDFFromHTML: Chrome/Chromium not found. Please install Chrome or set PUPPETEER_EXECUTABLE_PATH");
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

    // Navigate to drill page
    devLog("generateDrillPDFFromHTML: Navigating to drill page", { drillUrl });
    
    await page.goto(drillUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for content to load - check for drill title or content
    try {
      await page.waitForFunction(
        () => {
          const content = document.querySelector('[data-drill-content]');
          if (!content) return false;
          // Check if there's a title (h2) or any text content
          const hasTitle = content.querySelector('h2') !== null;
          const hasText = (content.textContent || '').trim().length > 0;
          return hasTitle || hasText;
        },
        { timeout: 10000 }
      );
      devLog("generateDrillPDFFromHTML: Drill content loaded");
    } catch (error) {
      devLog("generateDrillPDFFromHTML: Drill content wait timeout, continuing anyway", error);
    }

    // Wait a bit for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Hide elements that shouldn't appear in PDF (test banner, footer, navbar, etc.)
    await page.evaluate(() => {
      // Remove test banner (amber/yellow warning banner)
      const testBanner = document.querySelector('[class*="bg-amber-500"]') || 
                        document.querySelector('[class*="sticky"][class*="top-0"]');
      if (testBanner && testBanner.parentNode) {
        testBanner.parentNode.removeChild(testBanner);
      }
      
      // Remove footer elements
      const footer = document.querySelector('footer');
      if (footer && footer.parentNode) {
        footer.parentNode.removeChild(footer);
      }
      
      // Remove footer by class names
      const footerElements = document.querySelectorAll('[class*="footer"], [class*="Footer"]');
      footerElements.forEach((el) => {
        if (el && el.parentNode && el !== testBanner) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Remove navbar/header if present
      const nav = document.querySelector('nav, header, [class*="navbar"], [class*="Navbar"]');
      if (nav && nav.parentNode && nav !== testBanner) {
        nav.parentNode.removeChild(nav);
      }
    });
    
    // Also add CSS to hide these elements as backup
    await page.addStyleTag({
      content: `
        [class*="bg-amber-500"],
        [class*="TestSiteBanner"],
        [class*="sticky"][class*="top-0"][class*="z-"],
        footer,
        [class*="footer"],
        [class*="Footer"],
        nav,
        header,
        [class*="navbar"],
        [class*="Navbar"] {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
        }
      `
    });

    // Generate PDF
    devLog("generateDrillPDFFromHTML: Generating PDF");
    const pdfOptions: any = {
      format: "Letter", // 8.5 x 11 inches
      printBackground: true, // Include background colors and images
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
      preferCSSPageSize: false,
    };
    
    const pdf = await page.pdf(pdfOptions);

    devLog("generateDrillPDFFromHTML: PDF generated successfully", {
      pdfSize: `${(pdf.length / 1024).toFixed(2)} KB`,
      drillId,
    });

    return new Uint8Array(pdf);
  } catch (error) {
    devError("generateDrillPDFFromHTML: Error generating PDF", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

