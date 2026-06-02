import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { getPatientReport, generatePdfReport, generateExcelReport, ReportParams } from "../../../lib/reportService";

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

    const report = await getPatientReport(params);
    const exportType = request.nextUrl.searchParams.get("export")?.toLowerCase();

    if (exportType === "pdf") {
      const pdfBuffer = await generatePdfReport("Patient", report);
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="patient-report.pdf"`,
        },
      });
    }

    if (exportType === "excel") {
      const excelBuffer = await generateExcelReport("Patient", report);
      return new Response(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="patient-report.xlsx"`,
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to generate patient report." }, { status: 500 });
  }
}
