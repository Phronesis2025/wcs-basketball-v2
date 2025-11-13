import { NextRequest, NextResponse } from "next/server";
import { generateDrillPDFFromHTML } from "@/lib/pdf/puppeteer-drill";
import { PracticeDrill } from "@/types/supabase";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const drill: PracticeDrill = await request.json();

    if (!drill || !drill.id) {
      return NextResponse.json(
        { error: "Drill data is required" },
        { status: 400 }
      );
    }

    devLog("generate-drill-pdf: Generating PDF", { drillId: drill.id });

    // Generate PDF using Puppeteer (renders HTML drill page)
    const pdfBytes = await generateDrillPDFFromHTML(drill.id);

    devLog("generate-drill-pdf: PDF generated successfully", { drillId: drill.id });

    // Create a safe filename from the drill title
    const safeTitle = drill.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .substring(0, 50);

    // Return PDF as response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
      },
    });
  } catch (error) {
    devError("generate-drill-pdf: Exception", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

