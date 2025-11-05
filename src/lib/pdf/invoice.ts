import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { devLog, devError } from "@/lib/security";

interface InvoiceData {
  invoiceDate: string;
  invoiceNumber: string;
  parentName: string;
  parentAddress: string;
  playerName: string;
  teamName: string;
  teamLogoUrl?: string | null;
  email: string;
  items: Array<{
    date: string;
    description: string;
    priceLabel: string;
    priceAmount: number;
    quantity: number;
    amountPaid: number;
  }>;
  subtotal: number;
  totalAmount: number;
  remaining: number;
  isPaidInFull?: boolean;
}

export async function generateInvoicePDF(
  data: InvoiceData
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add a new page
  const page = pdfDoc.addPage([612, 792]); // Letter size (8.5 x 11 inches)
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0, 0, 0);
  const gray = rgb(0.8, 0.8, 0.8);

  let yPosition = height - 60;

  // Header: INVOICE title (left) - large and bold
  page.drawText("INVOICE", {
    x: 50,
    y: yPosition,
    size: 48,
    font: helveticaBoldFont,
    color: black,
  });

  // Right side: WCS Logo and business info
  const rightColumnX = width - 200;
  let logoY = yPosition;

  try {
    // Load WCS logo from file system (public folder)
    const fs = await import("fs");
    const path = await import("path");
    const logoPath = path.join(process.cwd(), "public", "logo.png");

    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.3); // Scale down to fit
      page.drawImage(logoImage, {
        x: rightColumnX,
        y: logoY - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });
      logoY -= logoDims.height + 10;
    }
  } catch (error) {
    // Logo not found, continue without it
    devError("Could not load WCS logo:", error);
  }

  // Business address under logo
  const businessInfo = [
    "World Class Sports",
    "123 World Class Ave.",
    "Salina, KS 67401",
  ];

  businessInfo.forEach((line, idx) => {
    page.drawText(line, {
      x: rightColumnX,
      y: logoY - idx * 14,
      size: 11,
      font: helveticaFont,
      color: black,
    });
  });
  logoY -= businessInfo.length * 14 + 10;

  // Team logo if available
  if (data.teamLogoUrl) {
    try {
      const teamLogoResponse = await fetch(data.teamLogoUrl);
      if (teamLogoResponse.ok) {
        const teamLogoBytes = await teamLogoResponse.arrayBuffer();
        // Try PNG first, then JPG
        let teamLogoImage;
        try {
          teamLogoImage = await pdfDoc.embedPng(teamLogoBytes);
        } catch {
          teamLogoImage = await pdfDoc.embedJpg(teamLogoBytes);
        }
        const teamLogoDims = teamLogoImage.scale(0.15); // Smaller than main logo
        page.drawImage(teamLogoImage, {
          x: rightColumnX,
          y: logoY - teamLogoDims.height,
          width: teamLogoDims.width,
          height: teamLogoDims.height,
        });
        logoY -= teamLogoDims.height + 5;
      }
    } catch (error) {
      devError("Could not load team logo:", error);
    }
  }

  yPosition -= 80;

  // Date and Invoice # (left side) with "PAID IN FULL" badge on right (same Y level)
  const dateY = yPosition;
  page.drawText(`Date: ${data.invoiceDate}`, {
    x: 50,
    y: dateY,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  page.drawText(`Invoice #: ${data.invoiceNumber}`, {
    x: 50,
    y: dateY - 18,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  // "PAID IN FULL" badge (right side, aligned with Date/Invoice #) if paid in full
  if (data.isPaidInFull) {
    const badgeX = rightColumnX - 10; // Align with right column (business address)
    const badgeY = dateY; // Same Y as Date line
    const badgeWidth = 120;
    const badgeHeight = 30;

    // Draw green background box
    page.drawRectangle({
      x: badgeX,
      y: badgeY - badgeHeight,
      width: badgeWidth,
      height: badgeHeight,
      color: rgb(0.94, 1, 0.94), // Light green background
      borderColor: rgb(0, 0.6, 0), // Green border
      borderWidth: 2,
    });

    // Draw "PAID IN FULL" text
    page.drawText("PAID IN FULL", {
      x: badgeX + 10,
      y: badgeY - 20,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0.5, 0), // Green text
    });
  }

  yPosition -= 60;

  // Two-column layout: Bill to (left) and Player info (right)
  // Bill to section (left column)
  page.drawText("Bill to:", {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaBoldFont,
    color: black,
  });

  let billToY = yPosition - 18;
  page.drawText(data.parentName, {
    x: 50,
    y: billToY,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  // Handle address - split by comma if no newlines, or use newlines
  const addressLines = data.parentAddress.includes("\n")
    ? data.parentAddress.split("\n").filter((line) => line.trim())
    : data.parentAddress.split(", ").filter((line) => line.trim());

  billToY -= 16;
  addressLines.forEach((line) => {
    if (line.trim()) {
      page.drawText(line.trim(), {
        x: 50,
        y: billToY,
        size: 12,
        font: helveticaFont,
        color: black,
      });
      billToY -= 16;
    }
  });

  // Player info (right column) - positioned at center of page
  const playerInfoX = width / 2 + 50;
  page.drawText(`Player: ${data.playerName}`, {
    x: playerInfoX,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  page.drawText(`Team: ${data.teamName}`, {
    x: playerInfoX,
    y: yPosition - 18,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  page.drawText(data.email, {
    x: playerInfoX,
    y: yPosition - 36,
    size: 12,
    font: helveticaFont,
    color: black,
  });

  yPosition -= 100;

  // Items Table - matches website exactly with borders
  const tableTopY = yPosition;
  const tableStartX = 50;
  const tableWidth = width - 100;
  const colWidths = [80, 200, 100, 60, 80];
  const colX = [
    tableStartX,
    tableStartX + colWidths[0],
    tableStartX + colWidths[0] + colWidths[1],
    tableStartX + colWidths[0] + colWidths[1] + colWidths[2],
    tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
  ];

  // Table header
  const headerY = tableTopY;
  const rowHeight = 35; // Row height to match website
  const headerBgY = headerY - rowHeight;

  // Draw gray background for header (rgb(0.8, 0.8, 0.8) = gray)
  page.drawRectangle({
    x: tableStartX,
    y: headerBgY,
    width: tableWidth,
    height: rowHeight,
    color: gray,
  });

  // Draw border around entire table
  page.drawRectangle({
    x: tableStartX,
    y: headerBgY,
    width: tableWidth,
    height: rowHeight * (Math.max(data.items.length, 3) + 1), // +1 for header
    borderColor: black,
    borderWidth: 1,
  });

  // Header text - centered
  const headers = ["Date:", "Description", "Price", "Qty", "Amount"];
  headers.forEach((header, idx) => {
    // Calculate text width for centering (approximate)
    const textWidth = header.length * 6; // Approximate character width
    const cellWidth =
      idx < colWidths.length - 1
        ? colWidths[idx]
        : tableWidth - (colX[idx] - tableStartX);
    const textX = colX[idx] + (cellWidth - textWidth) / 2;

    page.drawText(header, {
      x: textX,
      y: headerY - 20,
      size: 11,
      font: helveticaBoldFont,
      color: black,
    });
  });

  // Table rows - always show at least 3 rows (matching website)
  let currentY = headerY - rowHeight;
  const minRows = 3;
  const itemsToShow =
    data.items.length > 0
      ? [
          ...data.items,
          ...Array(Math.max(minRows - data.items.length, 0)).fill(null),
        ]
      : Array(minRows).fill(null);

  itemsToShow.forEach((item, idx) => {
    // Draw cell borders for each row
    // Draw vertical lines between columns
    for (let i = 0; i <= colX.length; i++) {
      const lineX =
        i === 0
          ? tableStartX
          : i === colX.length
          ? tableStartX + tableWidth
          : colX[i];
      page.drawLine({
        start: { x: lineX, y: currentY },
        end: { x: lineX, y: currentY - rowHeight },
        thickness: 1,
        color: black,
      });
    }

    // Draw horizontal line for row
    page.drawLine({
      start: { x: tableStartX, y: currentY - rowHeight },
      end: { x: tableStartX + tableWidth, y: currentY - rowHeight },
      thickness: 1,
      color: black,
    });

    if (item) {
      // Draw item data - left aligned for Date and Description, right aligned for Price and Amount, center for Qty
      page.drawText(item.date, {
        x: colX[0] + 5,
        y: currentY - 20,
        size: 11,
        font: helveticaFont,
        color: black,
      });

      // Description - left aligned
      const description =
        item.description.length > 40
          ? item.description.substring(0, 37) + "..."
          : item.description;
      page.drawText(description, {
        x: colX[1] + 5,
        y: currentY - 20,
        size: 11,
        font: helveticaFont,
        color: black,
      });

      // Price - right aligned
      const priceText =
        item.priceLabel.length > 20
          ? item.priceLabel.substring(0, 17) + "..."
          : item.priceLabel;
      const priceWidth = priceText.length * 6;
      page.drawText(priceText, {
        x: colX[2] + colWidths[2] - priceWidth - 5,
        y: currentY - 20,
        size: 11,
        font: helveticaFont,
        color: black,
      });

      // Qty - center aligned
      const qtyText = item.quantity.toString();
      const qtyWidth = qtyText.length * 6;
      page.drawText(qtyText, {
        x: colX[3] + (colWidths[3] - qtyWidth) / 2,
        y: currentY - 20,
        size: 11,
        font: helveticaFont,
        color: black,
      });

      // Amount - right aligned
      const amountText = `$${item.amountPaid.toFixed(2)}`;
      const amountWidth = amountText.length * 6;
      page.drawText(amountText, {
        x: colX[4] + colWidths[4] - amountWidth - 5,
        y: currentY - 20,
        size: 11,
        font: helveticaFont,
        color: black,
      });
    }

    currentY -= rowHeight;
  });

  // Subtotal line - aligned right (half width from right edge)
  currentY -= 20;
  const subtotalY = currentY;
  const subtotalStartX = tableStartX + tableWidth * 0.5; // Start at half width
  const subtotalLineWidth = tableWidth * 0.5; // Half the table width

  // Draw horizontal line
  page.drawLine({
    start: { x: subtotalStartX, y: subtotalY },
    end: { x: tableStartX + tableWidth, y: subtotalY },
    thickness: 1,
    color: black,
  });

  // Subtotal label and value
  page.drawText("Subtotal:", {
    x: subtotalStartX + 10,
    y: subtotalY - 15,
    size: 11,
    font: helveticaBoldFont,
    color: black,
  });

  page.drawText(`$${data.subtotal.toFixed(2)}`, {
    x: tableStartX + tableWidth - 80,
    y: subtotalY - 15,
    size: 11,
    font: helveticaBoldFont,
    color: black,
  });

  currentY = subtotalY - 40;

  // Footer: Thank you message (left) and Total/Due boxes (right)
  const footerY = currentY - 20;
  let messageY = footerY;

  // Add "✓ PAID IN FULL" text if paid in full (green text with checkmark)
  // Note: Drawing checkmark using lines since WinAnsi can't encode ✓ symbol
  if (data.isPaidInFull) {
    // Draw checkmark shape using lines (green checkmark)
    const checkmarkX = 50;
    const checkmarkY = messageY + 8; // Slightly above text baseline
    const checkmarkSize = 10;

    // Draw checkmark using two lines forming a V shape
    // First line: from bottom-left to middle
    page.drawLine({
      start: { x: checkmarkX, y: checkmarkY - checkmarkSize * 0.3 },
      end: {
        x: checkmarkX + checkmarkSize * 0.35,
        y: checkmarkY - checkmarkSize * 0.65,
      },
      thickness: 2,
      color: rgb(0, 0.5, 0),
    });
    // Second line: from middle to top-right
    page.drawLine({
      start: {
        x: checkmarkX + checkmarkSize * 0.35,
        y: checkmarkY - checkmarkSize * 0.65,
      },
      end: { x: checkmarkX + checkmarkSize, y: checkmarkY - checkmarkSize },
      thickness: 2,
      color: rgb(0, 0.5, 0),
    });

    // Draw "PAID IN FULL" text after checkmark
    page.drawText("PAID IN FULL", {
      x: checkmarkX + checkmarkSize + 6,
      y: messageY,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0.5, 0), // Green color
    });
    messageY -= 18;
  }

  const thankYouMessage = data.isPaidInFull
    ? "This invoice has been paid in full. Thank you for your commitment to our club and players!"
    : "We're grateful for your commitment to our club and players—thank you for your payment.";

  // Split message into multiple lines if needed
  const words = thankYouMessage.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length < 50) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  lines.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: messageY,
      size: 11,
      font: helveticaFont,
      color: black,
    });
    messageY -= 14;
  });

  // Total and Due boxes (right side, positioned at top of footer section)
  const totalBoxX = width - 200;
  const totalBoxY = footerY;
  const totalBoxWidth = 150;
  const totalBoxHeight = 50;
  const dueBoxHeight = 50;
  const boxSpacing = 10;

  // Draw border around total box (2px border to match website)
  page.drawRectangle({
    x: totalBoxX,
    y: totalBoxY - totalBoxHeight,
    width: totalBoxWidth,
    height: totalBoxHeight,
    borderColor: black,
    borderWidth: 2,
  });

  page.drawText("Total:", {
    x: totalBoxX + 10,
    y: totalBoxY - 20,
    size: 11,
    font: helveticaBoldFont,
    color: black,
  });

  page.drawText(`$${data.totalAmount.toFixed(2)}`, {
    x: totalBoxX + 10,
    y: totalBoxY - 40,
    size: 16,
    font: helveticaBoldFont,
    color: black,
  });

  // Add "PAID" indicator if paid in full (smaller, gray-green text below amount)
  if (data.isPaidInFull) {
    page.drawText("PAID", {
      x: totalBoxX + 10,
      y: totalBoxY - 55,
      size: 9,
      font: helveticaBoldFont,
      color: rgb(0, 0.5, 0), // Green color
    });
  }

  // Draw border around Due box (below Total box)
  const dueBoxY = totalBoxY - totalBoxHeight - boxSpacing - dueBoxHeight;
  page.drawRectangle({
    x: totalBoxX,
    y: dueBoxY - dueBoxHeight,
    width: totalBoxWidth,
    height: dueBoxHeight,
    borderColor: black,
    borderWidth: 2,
  });

  page.drawText("Due:", {
    x: totalBoxX + 10,
    y: dueBoxY - 20,
    size: 11,
    font: helveticaBoldFont,
    color: black,
  });

  page.drawText(`$${data.remaining.toFixed(2)}`, {
    x: totalBoxX + 10,
    y: dueBoxY - 40,
    size: 16,
    font: helveticaBoldFont,
    color: black,
  });

  // Footer: Payment Terms and Contact Info (reduced size)
  const contactFooterStartY = 80;
  let contactFooterY = contactFooterStartY;

  // Payment Terms
  page.drawText("Payment Terms:", {
    x: 50,
    y: contactFooterY,
    size: 9,
    font: helveticaBoldFont,
    color: black,
  });
  contactFooterY -= 12;
  const paymentTermsText = data.isPaidInFull
    ? "This invoice has been paid in full. No further payment is required."
    : "Payment is due upon receipt. Payments can be made online via Stripe.";
  page.drawText(paymentTermsText, {
    x: 50,
    y: contactFooterY,
    size: 8,
    font: helveticaFont,
    color: black,
  });
  contactFooterY -= 10;

  // Contact Information (reduced size)
  page.drawText("Contact Information:", {
    x: 50,
    y: contactFooterY,
    size: 9,
    font: helveticaBoldFont,
    color: black,
  });
  contactFooterY -= 12;
  page.drawText("Email: info@wcsbasketball.com | Phone: (785) 123-4567", {
    x: 50,
    y: contactFooterY,
    size: 8,
    font: helveticaFont,
    color: black,
  });
  contactFooterY -= 10;

  // Tax ID (if applicable - you may want to make this configurable)
  page.drawText("Tax ID: [To be added if applicable]", {
    x: 50,
    y: contactFooterY,
    size: 8,
    font: helveticaFont,
    color: black,
  });
  contactFooterY -= 15;

  // Thank you message
  page.drawText("Thank you for your business!", {
    x: 50,
    y: contactFooterY,
    size: 9,
    font: helveticaFont,
    color: black,
  });

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
