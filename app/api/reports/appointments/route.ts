import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { getAppointmentReport, generatePdfReport, generateExcelReport, ReportParams } from "../../../lib/reportService";

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

    const report = await getAppointmentReport(params);
    const exportType = request.nextUrl.searchParams.get("export")?.toLowerCase();

    if (exportType === "pdf") {
      const pdfBuffer = await generatePdfReport("Appointment", report);
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="appointment-report.pdf"`,
        },
      });
    }

    if (exportType === "excel") {
      const excelBuffer = await generateExcelReport("Appointment", report);
      return new Response(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="appointment-report.xlsx"`,
        },
      });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to generate appointment report." }, { status: 500 });
  }
}
