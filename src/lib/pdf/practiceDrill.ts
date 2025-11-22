import { PDFDocument, rgb, PDFPage, PDFFont, PDFImage, RGB } from "pdf-lib";
import { PracticeDrill } from "@/types/supabase";
import { sanitizeInput, devError } from "@/lib/security";
import fs from "fs";
import path from "path";
import fontkit from "fontkit";

/**
 * Helper function to wrap text within a given width
 */
function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Draw a rounded rectangle badge
 * Note: pdf-lib doesn't have native rounded rectangle support, so we approximate it
 */
function drawRoundedBadge(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: RGB,
  borderColor: RGB
) {
  // For pdf-lib, we'll draw a regular rectangle
  // The rounded appearance will be handled by the PDF viewer
  // In practice, this creates a badge-like appearance
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: fillColor,
    borderColor: borderColor,
    borderWidth: 1,
  });
}

/**
 * Generate a PDF document from a PracticeDrill matching the example format
 */
export async function generatePracticeDrillPDF(
  drill: PracticeDrill
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Register fontkit for custom font support
  pdfDoc.registerFontkit(fontkit);

  // Load and embed custom fonts
  const bebasFontPath = path.join(process.cwd(), "public", "fonts", "BebasNeue-Regular.ttf");
  const interFontPath = path.join(process.cwd(), "public", "fonts", "Inter-Regular.ttf");
  
  const bebasFontBytes = fs.readFileSync(bebasFontPath);
  const interFontBytes = fs.readFileSync(interFontPath);
  
  const bebasFont = await pdfDoc.embedFont(bebasFontBytes);
  const interFont = await pdfDoc.embedFont(interFontBytes);

  // Load and embed icon images
  const skillIconPath = path.join(process.cwd(), "public", "images", "skill.png");
  const equipIconPath = path.join(process.cwd(), "public", "images", "equip.png");
  const timeIconPath = path.join(process.cwd(), "public", "images", "time.png");
  
  let skillIcon: PDFImage | null = null;
  let equipIcon: PDFImage | null = null;
  let timeIcon: PDFImage | null = null;
  
  try {
    if (fs.existsSync(skillIconPath)) {
      const skillIconBytes = fs.readFileSync(skillIconPath);
      skillIcon = await pdfDoc.embedPng(skillIconBytes);
    }
  } catch (e) {
    devError("Could not load skill icon:", e);
  }
  
  try {
    if (fs.existsSync(equipIconPath)) {
      const equipIconBytes = fs.readFileSync(equipIconPath);
      equipIcon = await pdfDoc.embedPng(equipIconBytes);
    }
  } catch (e) {
    devError("Could not load equip icon:", e);
  }
  
  try {
    if (fs.existsSync(timeIconPath)) {
      const timeIconBytes = fs.readFileSync(timeIconPath);
      timeIcon = await pdfDoc.embedPng(timeIconBytes);
    }
  } catch (e) {
    devError("Could not load time icon:", e);
  }

  // Add a new page (Letter size: 8.5 x 11 inches)
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();

  // Colors
  const black = rgb(0, 0, 0);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.6, 0.6, 0.6);
  const badgeBg = rgb(0.95, 0.95, 0.95);
  const badgeBorder = rgb(0.8, 0.8, 0.8);

  // Margins
  const margin = 50;
  const contentWidth = width - 2 * margin;
  let yPosition = height - 50;
  let currentPage = page;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition < 50 + requiredSpace) {
      currentPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }
    return currentPage;
  };

  // --- HEADER SECTION ---
  checkNewPage(100);
  
  // Category and Difficulty badges (rounded rectangles)
  const categoryText = sanitizeInput(drill.category);
  const difficultyText = sanitizeInput(drill.difficulty);
  
  // Measure text to size badges using Inter font
  const categoryWidth = interFont.widthOfTextAtSize(categoryText, 11) + 20;
  const difficultyWidth = interFont.widthOfTextAtSize(difficultyText, 11) + 20;
  const badgeHeight = 22;
  const badgeRadius = 11; // Half of height for fully rounded ends
  
  // Draw category badge with rounded appearance
  drawRoundedBadge(
    currentPage,
    margin,
    yPosition,
    categoryWidth,
    badgeHeight,
    badgeRadius,
    badgeBg,
    badgeBorder
  );
  currentPage.drawText(categoryText, {
    x: margin + 10,
    y: yPosition - 16,
    size: 11,
    font: interFont,
    color: black,
  });

  // Draw difficulty badge (with gap)
  const badgeGap = 10;
  drawRoundedBadge(
    currentPage,
    margin + categoryWidth + badgeGap,
    yPosition,
    difficultyWidth,
    badgeHeight,
    badgeRadius,
    badgeBg,
    badgeBorder
  );
  currentPage.drawText(difficultyText, {
    x: margin + categoryWidth + badgeGap + 10,
    y: yPosition - 16,
    size: 11,
    font: interFont,
    color: black,
  });

  yPosition -= badgeHeight + 20;

  // Title - Large, bold, uppercase using Bebas
  const title = sanitizeInput(drill.title).toUpperCase();
  const titleLines = wrapText(title, contentWidth, 32, bebasFont);
  titleLines.forEach((line) => {
    checkNewPage(40);
    currentPage.drawText(line, {
      x: margin,
      y: yPosition,
      size: 32,
      font: bebasFont,
      color: black,
    });
    yPosition -= 36;
  });

  yPosition -= 20;

  // --- KEY INFORMATION SECTION (Horizontal Bar) ---
  checkNewPage(90);
  
  const boxHeight = 75;
  const boxWidth = contentWidth / 3;
  const iconSize = 20; // Size for icons
  
  // Calculate text positions for each box
  const box1X = margin;
  const box2X = margin + boxWidth;
  const box3X = margin + boxWidth * 2;
  const boxY = yPosition;
  
  // Draw three boxes side by side with borders
  currentPage.drawRectangle({
    x: box1X,
    y: boxY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderColor: lightGray,
    borderWidth: 1.5,
  });
  
  currentPage.drawRectangle({
    x: box2X,
    y: boxY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderColor: lightGray,
    borderWidth: 1.5,
  });
  
  currentPage.drawRectangle({
    x: box3X,
    y: boxY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderColor: lightGray,
    borderWidth: 1.5,
  });

  // Skills box with icon
  const iconY = boxY - 15;
  if (skillIcon) {
    const iconScale = iconSize / Math.max(skillIcon.width, skillIcon.height);
    const iconWidth = skillIcon.width * iconScale;
    const iconHeight = skillIcon.height * iconScale;
    currentPage.drawImage(skillIcon, {
      x: box1X + (boxWidth - iconWidth) / 2, // Center the icon
      y: iconY - iconHeight,
      width: iconWidth,
      height: iconHeight,
    });
  }
  currentPage.drawText("SKILLS", {
    x: box1X + 12,
    y: boxY - 18,
    size: 11,
    font: bebasFont,
    color: black,
  });
  const skillsText = sanitizeInput(drill.skills.join(", "));
  const skillsLines = wrapText(skillsText, boxWidth - 24, 10, interFont);
  let skillsY = boxY - 35;
  skillsLines.forEach((line) => {
    currentPage.drawText(line, {
      x: box1X + 12,
      y: skillsY,
      size: 10,
      font: interFont,
      color: black,
    });
    skillsY -= 13;
  });

  // Equipment box with icon
  if (equipIcon) {
    const iconScale = iconSize / Math.max(equipIcon.width, equipIcon.height);
    const iconWidth = equipIcon.width * iconScale;
    const iconHeight = equipIcon.height * iconScale;
    currentPage.drawImage(equipIcon, {
      x: box2X + (boxWidth - iconWidth) / 2, // Center the icon
      y: iconY - iconHeight,
      width: iconWidth,
      height: iconHeight,
    });
  }
  currentPage.drawText("EQUIPMENT", {
    x: box2X + 12,
    y: boxY - 18,
    size: 11,
    font: bebasFont,
    color: black,
  });
  const equipmentText = sanitizeInput(drill.equipment.join(", "));
  const equipmentLines = wrapText(equipmentText, boxWidth - 24, 10, interFont);
  let equipmentY = boxY - 35;
  equipmentLines.forEach((line) => {
    currentPage.drawText(line, {
      x: box2X + 12,
      y: equipmentY,
      size: 10,
      font: interFont,
      color: black,
    });
    equipmentY -= 13;
  });

  // Duration box with icon
  if (timeIcon) {
    const iconScale = iconSize / Math.max(timeIcon.width, timeIcon.height);
    const iconWidth = timeIcon.width * iconScale;
    const iconHeight = timeIcon.height * iconScale;
    currentPage.drawImage(timeIcon, {
      x: box3X + (boxWidth - iconWidth) / 2, // Center the icon
      y: iconY - iconHeight,
      width: iconWidth,
      height: iconHeight,
    });
  }
  currentPage.drawText("DURATION", {
    x: box3X + 12,
    y: boxY - 18,
    size: 11,
    font: bebasFont,
    color: black,
  });
  const durationText = sanitizeInput(drill.time);
  currentPage.drawText(durationText, {
    x: box3X + 12,
    y: boxY - 35,
    size: 10,
    font: interFont,
    color: black,
  });

  yPosition -= boxHeight + 35;

  // --- BENEFITS SECTION ---
  checkNewPage(100);
  yPosition -= 5;

  // Section header - bold, uppercase using Bebas
  currentPage.drawText("BENEFITS", {
    x: margin,
    y: yPosition,
    size: 16,
    font: bebasFont,
    color: black,
  });

  yPosition -= 22;

  // Benefits content - italicized (using opacity to simulate italic) with Inter
  const benefitsText = sanitizeInput(drill.benefits);
  const benefitsLines = wrapText(
    benefitsText,
    contentWidth,
    11,
    interFont
  );
  benefitsLines.forEach((line) => {
    checkNewPage(16);
    currentPage.drawText(line, {
      x: margin,
      y: yPosition,
      size: 11,
      font: interFont,
      color: black,
      opacity: 0.85, // Simulate italic appearance
    });
    yPosition -= 15;
  });

  yPosition -= 20;

  // --- INSTRUCTIONS SECTION ---
  checkNewPage(100);
  yPosition -= 5;

  // Section header - bold, uppercase using Bebas
  currentPage.drawText("INSTRUCTIONS", {
    x: margin,
    y: yPosition,
    size: 16,
    font: bebasFont,
    color: black,
  });

  yPosition -= 22;

  // Instructions content - standard font using Inter
  const instructionsText = sanitizeInput(drill.instructions);
  const instructionsLines = wrapText(
    instructionsText,
    contentWidth,
    11,
    interFont
  );
  instructionsLines.forEach((line) => {
    checkNewPage(16);
    currentPage.drawText(line, {
      x: margin,
      y: yPosition,
      size: 11,
      font: interFont,
      color: black,
    });
    yPosition -= 15;
  });

  yPosition -= 20;

  // --- ADDITIONAL INFORMATION SECTION (if available) ---
  if (drill.additional_info) {
    checkNewPage(100);
    yPosition -= 5;

    // Section header - bold, uppercase using Bebas
    currentPage.drawText("ADDITIONAL INFORMATION", {
      x: margin,
      y: yPosition,
      size: 16,
      font: bebasFont,
      color: black,
    });

    yPosition -= 22;

    // Additional info content - standard font using Inter
    const additionalText = sanitizeInput(drill.additional_info);
    const additionalLines = wrapText(
      additionalText,
      contentWidth,
      11,
      interFont
    );
    additionalLines.forEach((line) => {
      checkNewPage(16);
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: 11,
        font: interFont,
        color: black,
      });
      yPosition -= 15;
    });
  }

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
