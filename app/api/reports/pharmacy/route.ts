import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { getPharmacyReport, generatePdfReport, generateExcelReport, ReportParams } from "../../../lib/reportService";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const params: ReportParams = {
      range: (request.nextUrl.searchParams.get("range") as any) || "monthly",
      startDate: request.nextUrl.searchParams.get("startDate") || undefined,
      endDate: request.nextUrl.searchParams.get("endDate") || undefined,
    };

    const report = await getPharmacyReport(params);
    const exportType = request.nextUrl.searchParams.get("export")?.toLowerCase();

    if (exportType === "pdf") {
      const pdfBuffer = await generatePdfReport("Pharmacy", report);
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="pharmacy-report.pdf"`,
        },
      });
    }

    if (exportType === "excel") {
      const excelBuffer = await generateExcelReport("Pharmacy", report);
      return new Response(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="pharmacy-report.xlsx"`,
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to generate pharmacy report." }, { status: 500 });
  }
}
