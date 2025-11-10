import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { devLog, devError } from "@/lib/security";

interface InvoiceData {
  invoiceDate: string;
  invoiceNumber: string;
  parentName: string;
  parentAddress: string; // may be multi-line or comma-separated
  playerName: string;
  teamName: string;
  teamLogoUrl?: string | null;
  email: string;
  items: Array<{
    date: string;
    playerName?: string;
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
  const pdfDoc = await PDFDocument.create();
  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // US Letter
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0, 0, 0);
  const headerGray = rgb(0.95, 0.95, 0.95);
  const borderGray = rgb(0.7, 0.7, 0.7);

  // --- PAGE MARGINS & GRID ---
  const M = 40;
  let y = height - 50;

  // --- RIGHT HEADER BLOCK (WCS logo + team logo stacked) ---
  const rightX = width - M - 100;
  let cursorY = y;

  // WCS Logo
  let wcsLogoHeight = 0;
  let wcsLogoWidth = 0;
  try {
    const fs = await import("fs");
    const path = await import("path");
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logo = await pdfDoc.embedPng(logoBytes);
      const dims = logo.scale(0.18);
      wcsLogoHeight = dims.height;
      wcsLogoWidth = dims.width;
      page.drawImage(logo, {
        x: rightX,
        y: cursorY - dims.height,
        width: dims.width,
        height: dims.height,
      });
      cursorY -= dims.height + 8;
    }
  } catch (e) {
    devError("WCS logo load fail", e);
  }

  // Team logo removed - no longer displayed on invoices

  // --- TITLE - top aligned with WCS logo ---
  page.drawText("INVOICE", {
    x: M,
    y: y - wcsLogoHeight + 10,
    size: 36,
    font: helvB,
    color: black,
  });

  // --- META ROW (Date, Invoice #) ---
  y -= 70;
  page.drawText(`Date: ${data.invoiceDate}`, {
    x: M,
    y,
    size: 10,
    font: helv,
    color: black,
  });
  page.drawText(`Invoice #: ${data.invoiceNumber}`, {
    x: M,
    y: y - 14,
    size: 10,
    font: helv,
    color: black,
  });

  // --- BILL TO (LEFT) / PLAYER (RIGHT) ---
  y -= 50;

  page.drawText("Bill to:", {
    x: M,
    y,
    size: 10,
    font: helvB,
    color: black,
  });
  let by = y - 16;

  page.drawText(data.parentName, {
    x: M,
    y: by,
    size: 10,
    font: helv,
    color: black,
  });
  by -= 14;

  // Split address into multiple lines if needed
  const addrParts = data.parentAddress
    .replace(/\n/g, ", ")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const addrLine = addrParts.join(", ");
  page.drawText(addrLine, {
    x: M,
    y: by,
    size: 10,
    font: helv,
    color: black,
  });

  const rx = width - M - 200;
  page.drawText(`Player: ${data.playerName}`, {
    x: rx,
    y,
    size: 10,
    font: helv,
    color: black,
  });
  page.drawText(`Team: ${data.teamName}`, {
    x: rx,
    y: y - 16,
    size: 10,
    font: helv,
    color: black,
  });
  page.drawText(data.email, {
    x: rx,
    y: y - 32,
    size: 10,
    font: helv,
    color: black,
  });

  // --- ITEMS TABLE ---
  y -= 90;
  const tX = M;
  const tW = width - M * 2;
  const rowH = 40;

  // Column widths: Date, Player, Description, Price, Qty, Amount
  const cw = [70, 80, 180, 80, 40, 70];
  const cx = [
    tX,
    tX + cw[0],
    tX + cw[0] + cw[1],
    tX + cw[0] + cw[1] + cw[2],
    tX + cw[0] + cw[1] + cw[2] + cw[3],
    tX + cw[0] + cw[1] + cw[2] + cw[3] + cw[4],
  ];

  // Ensure at least 2 empty rows for clean look
  const nRows = Math.max(3, data.items.length);

  // Outer border
  page.drawRectangle({
    x: tX,
    y: y - rowH * (nRows + 1),
    width: tW,
    height: rowH * (nRows + 1),
    borderColor: black,
    borderWidth: 1.5,
  });

  // Header band
  page.drawRectangle({
    x: tX,
    y: y - rowH,
    width: tW,
    height: rowH,
    color: headerGray,
  });

  const headers = ["Date:", "Player", "Description", "Price", "Qty", "Amount"];
  headers.forEach((h, i) => {
    const cellW = cw[i];
    const textW = helvB.widthOfTextAtSize(h, 10);
    const textX = cx[i] + (cellW - textW) / 2;
    page.drawText(h, {
      x: textX,
      y: y - 24,
      size: 10,
      font: helvB,
      color: black,
    });
  });

  // Column lines
  for (let i = 1; i < cx.length; i++) {
    page.drawLine({
      start: { x: cx[i], y },
      end: { x: cx[i], y: y - rowH * (nRows + 1) },
      thickness: 1.5,
      color: black,
    });
  }

  // Header bottom
  page.drawLine({
    start: { x: tX, y: y - rowH },
    end: { x: tX + tW, y: y - rowH },
    thickness: 1.5,
    color: black,
  });

  // Rows
  let ry = y - rowH;
  const rows = [
    ...data.items,
    ...Array(Math.max(0, 3 - data.items.length)).fill(null),
  ];

  rows.forEach((item) => {
    // row bottom line
    page.drawLine({
      start: { x: tX, y: ry - rowH },
      end: { x: tX + tW, y: ry - rowH },
      thickness: 1.5,
      color: black,
    });

    if (item) {
      // Date
      page.drawText(item.date, {
        x: cx[0] + 8,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });

      // Player name
      const playerName = item.playerName || "";
      const playerNameText =
        playerName.length > 15 ? playerName.slice(0, 12) + "..." : playerName;
      page.drawText(playerNameText, {
        x: cx[1] + 8,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });

      // Description
      const desc =
        item.description.length > 40
          ? item.description.slice(0, 37) + "..."
          : item.description;
      page.drawText(desc, {
        x: cx[2] + 8,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });

      // Price
      const priceLabel =
        item.priceLabel.length > 18
          ? item.priceLabel.slice(0, 15) + "..."
          : item.priceLabel;
      const priceW = helv.widthOfTextAtSize(priceLabel, 10);
      page.drawText(priceLabel, {
        x: cx[3] + (cw[3] - priceW) / 2,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });

      // Quantity
      const qtyText = String(item.quantity);
      const qtyW = helv.widthOfTextAtSize(qtyText, 10);
      page.drawText(qtyText, {
        x: cx[4] + (cw[4] - qtyW) / 2,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });

      // Amount
      const amtText = `$${item.amountPaid.toFixed(2)}`;
      const amtW = helv.widthOfTextAtSize(amtText, 10);
      page.drawText(amtText, {
        x: cx[5] + cw[5] - amtW - 8,
        y: ry - 24,
        size: 10,
        font: helv,
        color: black,
      });
    }
    ry -= rowH;
  });

  // --- SUBTOTAL LINE ---
  const subY = ry - 20;
  page.drawLine({
    start: { x: tX, y: subY },
    end: { x: tX + tW, y: subY },
    thickness: 1,
    color: borderGray,
  });

  const subLabel = "Subtotal:";
  const subLabelW = helvB.widthOfTextAtSize(subLabel, 10);
  page.drawText(subLabel, {
    x: tX + tW / 2 - 80,
    y: subY - 16,
    size: 10,
    font: helvB,
    color: black,
  });

  const subVal = `$${data.subtotal.toFixed(2)}`;
  const subValW = helvB.widthOfTextAtSize(subVal, 10);
  page.drawText(subVal, {
    x: tX + tW - subValW - 8,
    y: subY - 16,
    size: 10,
    font: helvB,
    color: black,
  });

  // --- THANK-YOU MESSAGE ---
  let msgY = subY - 50;
  const msg1 =
    "We're grateful for your commitment to our club and players—thank you for";
  const msg2 = "your payment.";

  page.drawText(msg1, {
    x: M,
    y: msgY,
    size: 10,
    font: helv,
    color: black,
  });
  page.drawText(msg2, {
    x: M,
    y: msgY - 14,
    size: 10,
    font: helv,
    color: black,
  });

  // --- TOTALS BOXES ---
  const boxX = width - M - 160;
  const totalTop = msgY + 10;
  const boxW = 160;
  const totalH = 60;
  const dueH = 60;

  // Total box
  page.drawRectangle({
    x: boxX,
    y: totalTop - totalH,
    width: boxW,
    height: totalH,
    borderColor: black,
    borderWidth: 1.5,
  });
  page.drawText("Total:", {
    x: boxX + 12,
    y: totalTop - 24,
    size: 10,
    font: helvB,
    color: black,
  });
  page.drawText(`${data.totalAmount.toFixed(2)}`, {
    x: boxX + 12,
    y: totalTop - 48,
    size: 18,
    font: helvB,
    color: black,
  });

  // Due box
  const dueTop = totalTop - totalH - 12;
  const dueBottom = dueTop - dueH;
  page.drawRectangle({
    x: boxX,
    y: dueBottom,
    width: boxW,
    height: dueH,
    borderColor: black,
    borderWidth: 1.5,
  });
  page.drawText("Due:", {
    x: boxX + 12,
    y: dueTop - 24,
    size: 10,
    font: helvB,
    color: black,
  });
  page.drawText(`${data.remaining.toFixed(2)}`, {
    x: boxX + 12,
    y: dueTop - 48,
    size: 18,
    font: helvB,
    color: black,
  });

  // --- FOOTER SECTION ---
  const footerY = dueBottom - 20;
  page.drawLine({
    start: { x: M, y: footerY },
    end: { x: width - M, y: footerY },
    thickness: 1,
    color: borderGray,
  });

  let fy = footerY - 20;

  // Business address on the right side, aligned under Due box
  const bizAddressX = boxX;
  page.drawText("World Class Sports", {
    x: bizAddressX,
    y: fy,
    size: 9,
    font: helv,
    color: black,
  });
  page.drawText("123 World Class Ave.", {
    x: bizAddressX,
    y: fy - 11,
    size: 9,
    font: helv,
    color: black,
  });
  page.drawText("Salina, KS 67401", {
    x: bizAddressX,
    y: fy - 22,
    size: 9,
    font: helv,
    color: black,
  });

  page.drawText("Payment Terms:", {
    x: M,
    y: fy,
    size: 9,
    font: helvB,
    color: black,
  });
  fy -= 12;
  const terms = data.isPaidInFull
    ? "This invoice has been paid in full. No further payment is required."
    : "Payment is due upon receipt. Payments can be made online via Stripe.";
  page.drawText(terms, {
    x: M,
    y: fy,
    size: 8,
    font: helv,
    color: black,
  });

  fy -= 16;
  page.drawText("Contact information:", {
    x: M,
    y: fy,
    size: 9,
    font: helvB,
    color: black,
  });
  fy -= 12;
  page.drawText("Email: info@wcsbasketball.com | Phone: (785) 123-4567", {
    x: M,
    y: fy,
    size: 8,
    font: helv,
    color: black,
  });
  fy -= 10;
  page.drawText("Tax ID: [To be added if applicable]", {
    x: M,
    y: fy,
    size: 8,
    font: helv,
    color: black,
  });
  fy -= 16;
  page.drawText("Thank you for your business!", {
    x: M,
    y: fy,
    size: 9,
    font: helv,
    color: black,
  });

  return pdfDoc.save();
}
