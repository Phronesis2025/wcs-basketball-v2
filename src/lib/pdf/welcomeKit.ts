import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface WelcomeKitData {
  playerName: string;
  teamName?: string;
  parentName: string;
  parentEmail: string;
  season?: string;
  coachName?: string;
  coachEmail?: string;
  practiceSchedule?: string;
  gameSchedule?: string;
}

export async function generateWelcomeKitPDF(data: WelcomeKitData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add a new page
  const page = pdfDoc.addPage([612, 792]); // Letter size (8.5 x 11 inches)
  const { width, height } = page.getSize();

  // Colors
  const navy = rgb(0.0588, 0.1333, 0.2235); // #0F2238 (navy)
  const red = rgb(0.8627, 0.1490, 0.1490); // #dc2626 (red)
  const gray = rgb(0.5, 0.5, 0.5);

  let yPosition = height - 60;

  // Title
  page.drawText("Welcome to WCS Basketball!", {
    x: 50,
    y: yPosition,
    size: 28,
    font: helveticaBoldFont,
    color: navy,
  });

  yPosition -= 50;

  // Subtitle
  page.drawText("Official Welcome Kit", {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaFont,
    color: gray,
  });

  yPosition -= 60;

  // Player Information Section
  page.drawText("Player Information", {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBoldFont,
    color: navy,
  });

  yPosition -= 30;

  page.drawText(`Player Name: ${data.playerName}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  if (data.teamName) {
    page.drawText(`Team: ${data.teamName}`, {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
  }

  if (data.season) {
    page.drawText(`Season: ${data.season}`, {
      x: 60,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
  }

  yPosition -= 30;

  // Parent Information Section
  page.drawText("Parent/Guardian Information", {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBoldFont,
    color: navy,
  });

  yPosition -= 30;

  page.drawText(`Name: ${data.parentName}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 20;

  page.drawText(`Email: ${data.parentEmail}`, {
    x: 60,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  yPosition -= 40;

  // Program Overview Section
  page.drawText("Program Overview", {
    x: 50,
    y: yPosition,
    size: 16,
    font: helveticaBoldFont,
    color: navy,
  });

  yPosition -= 30;

  const overviewText = [
    "Welcome to WCS Basketball! We're excited to have you join our championship",
    "development program. This welcome kit contains important information about",
    "your child's participation in our program.",
    "",
    "Our mission is to develop champions both on and off the court. We focus on:",
    "",
    "• Skill Development - Building fundamental basketball skills",
    "• Teamwork - Learning to work together as a team",
    "• Sportsmanship - Respecting opponents and officials",
    "• Character - Building confidence and leadership",
    "• Fun - Making basketball enjoyable and engaging",
  ];

  overviewText.forEach((line) => {
    if (yPosition < 100) {
      // Start a new page if needed
      const newPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 60;
    }
    page.drawText(line, {
      x: 60,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 18;
  });

  yPosition -= 20;

  // Coach Information (if available)
  if (data.coachName || data.coachEmail) {
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 60;
    }

    page.drawText("Coach Information", {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: navy,
    });

    yPosition -= 30;

    if (data.coachName) {
      page.drawText(`Coach: ${data.coachName}`, {
        x: 60,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    if (data.coachEmail) {
      page.drawText(`Email: ${data.coachEmail}`, {
        x: 60,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    yPosition -= 30;
  }

  // Schedule Information (if available)
  if (data.practiceSchedule || data.gameSchedule) {
    if (yPosition < 150) {
      const newPage = pdfDoc.addPage([612, 792]);
      yPosition = height - 60;
    }

    page.drawText("Schedule Information", {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: navy,
    });

    yPosition -= 30;

    if (data.practiceSchedule) {
      page.drawText("Practice Schedule:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const practiceLines = data.practiceSchedule.split("\n");
      practiceLines.forEach((line) => {
        page.drawText(line, {
          x: 70,
          y: yPosition,
          size: 11,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 16;
      });

      yPosition -= 10;
    }

    if (data.gameSchedule) {
      page.drawText("Game Schedule:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const gameLines = data.gameSchedule.split("\n");
      gameLines.forEach((line) => {
        page.drawText(line, {
          x: 70,
          y: yPosition,
          size: 11,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 16;
      });
    }

    yPosition -= 30;
  }

  // Footer on last page
  if (yPosition < 100) {
    const newPage = pdfDoc.addPage([612, 792]);
    yPosition = height - 60;
  }

  yPosition = 50;

  page.drawText("Thank you for being part of WCS Basketball!", {
    x: 50,
    y: yPosition,
    size: 14,
    font: helveticaBoldFont,
    color: navy,
  });

  yPosition -= 30;

  page.drawText("Questions? Contact us at wcsbts@gmail.com", {
    x: 50,
    y: yPosition,
    size: 11,
    font: helveticaFont,
    color: gray,
  });

  yPosition -= 20;

  page.drawText("WCS Basketball - Where Champions Start", {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: gray,
  });

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

