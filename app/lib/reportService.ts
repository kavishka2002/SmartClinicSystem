import { firestore } from "./firebaseAdmin";

export type ReportRange = "today" | "weekly" | "monthly" | "custom";
export interface ReportParams {
  range?: ReportRange;
  startDate?: string;
  endDate?: string;
}

export interface ReportRangeInfo {
  range: ReportRange;
  label: string;
  start: Date;
  end: Date;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRange(params: ReportParams): ReportRangeInfo {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const range = params.range || "monthly";

  if (range === "today") {
    return { range, label: "Today", start: todayStart, end: todayEnd };
  }

  if (range === "weekly") {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 6);
    return { range, label: "Last 7 Days", start, end: todayEnd };
  }

  if (range === "custom") {
    const start = parseDate(params.startDate) ?? todayStart;
    const end = parseDate(params.endDate) ?? todayEnd;
    end.setHours(23, 59, 59, 999);
    return { range, label: `Custom: ${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`, start, end };
  }

  const monthStart = new Date(todayStart);
  monthStart.setDate(1);
  return { range: "monthly", label: "This Month", start: monthStart, end: todayEnd };
}

function formatDateKey(date: Date, range: ReportRange) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (range === "monthly") {
    return `${year}-${month}`;
  }

  if (range === "weekly" || range === "today" || range === "custom") {
    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}-${day}`;
}

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function safeNumber(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function groupByLabel(items: any[], labelFn: (item: any) => string) {
  return items.reduce((acc: Record<string, number>, item) => {
    const label = labelFn(item) || "Unknown";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function buildTrend(items: Date[], range: ReportRange) {
  const buckets: Record<string, number> = {};
  items.forEach((item) => {
    const key = formatDateKey(item, range);
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count }));
}

function countByRange(items: Date[], rangeInfo: ReportRangeInfo) {
  return items.filter((item) => item >= rangeInfo.start && item <= rangeInfo.end).length;
}

function buildPdfResponse(title: string, generatedAt: string, sections: Array<{ heading: string; rows: Array<{ label: string; value: string | number }>; }>): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfLib = await import("pdf-lib");
      const { PDFDocument, StandardFonts, rgb } = pdfLib as any;
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const margin = 40;
      let y = 800;
      const drawText = (text: string, size = 11, color = rgb(0.1, 0.1, 0.12), gap = 16) => {
        page.drawText(text, { x: margin, y, size, font, color });
        y -= gap;
      };
      drawText(title, 18, rgb(0.01, 0.24, 0.48), 26);
      drawText(`Generated: ${generatedAt}`, 10, rgb(0.4, 0.4, 0.45), 18);

      sections.forEach((section) => {
        y -= 8;
        if (y < 120) {
          page.addPage([595.28, 841.89]);
          y = 800;
        }
        drawText(section.heading, 13, rgb(0.05, 0.15, 0.35), 18);
        section.rows.forEach((row) => {
          if (y < 90) {
            page.addPage([595.28, 841.89]);
            y = 800;
          }
          drawText(`${row.label}: ${row.value}`, 10, rgb(0.15, 0.15, 0.18), 14);
        });
      });

      const pdfBytes = await doc.save();
      resolve(Buffer.from(pdfBytes));
    } catch (error) {
      reject(error);
    }
  });
}

async function buildExcelResponse(sheets: Array<{ name: string; headers: string[]; rows: Array<Array<string | number>> }>) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  sheets.forEach((sheetData) => {
    const sheet = workbook.addWorksheet(sheetData.name);
    sheet.addRow(sheetData.headers);
    sheetData.rows.forEach((row) => sheet.addRow(row));
    sheet.columns?.forEach((col: any) => {
      if (col && typeof col.width === "undefined") col.width = 24;
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function getPatientReport(params: ReportParams) {
  const rangeInfo = normalizeRange(params);
  const snapshot = await firestore.collection("patients").select("createdAt", "gender", "age", "dob").get();
  const allPatients = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    const createdAt = toDate(data.createdAt) ?? new Date();
    const age = typeof data.age === "number" ? data.age : data.dob ? computeAge(data.dob) : null;
    return { createdAt, gender: String(data.gender || data.sex || "Unknown").trim() || "Unknown", age };
  });

  const totalPatients = allPatients.length;
  const newPatientsThisMonth = countByRange(allPatients.map((p) => p.createdAt), rangeInfo);
  const genderDistribution = groupByLabel(allPatients, (patient) => patient.gender || "Unknown");
  const ageDistribution = allPatients.reduce((acc: Record<string, number>, patient) => {
    const age = patient.age;
    const bucket = age === null ? "Unknown" : age <= 17 ? "0-17" : age <= 35 ? "18-35" : age <= 55 ? "36-55" : "56+";
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const registrationTrends = buildTrend(allPatients.map((p) => p.createdAt), rangeInfo.range);

  return {
    success: true,
    type: "patients",
    range: { label: rangeInfo.label, start: rangeInfo.start.toISOString(), end: rangeInfo.end.toISOString() },
    generatedAt: new Date().toISOString(),
    summary: {
      totalPatients,
      newPatientsThisMonth,
      reportDate: new Date().toISOString(),
    },
    genderDistribution,
    ageDistribution,
    registrationTrends,
  };
}

export async function getAppointmentReport(params: ReportParams) {
  const rangeInfo = normalizeRange(params);
  const snapshot = await firestore.collection("appointments").select("status", "doctorUid", "doctorName", "scheduledAt", "createdAt").get();
  const allAppointments = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    const status = String(data.status || "Pending").trim();
    const doctorName = String(data.doctorName || data.doctor || "Unknown").trim() || "Unknown";
    const scheduledAt = toDate(data.scheduledAt) ?? toDate(data.createdAt) ?? new Date();
    return { status, doctorName, scheduledAt };
  });

  const totalAppointments = allAppointments.length;
  const statusCounts = groupByLabel(allAppointments, (appt) => appt.status || "Pending");
  const appointmentTrends = buildTrend(allAppointments.map((appt) => appt.scheduledAt), rangeInfo.range);
  const doctorCounts = allAppointments.reduce((acc: Record<string, number>, appt) => {
    acc[appt.doctorName] = (acc[appt.doctorName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    success: true,
    type: "appointments",
    range: { label: rangeInfo.label, start: rangeInfo.start.toISOString(), end: rangeInfo.end.toISOString() },
    generatedAt: new Date().toISOString(),
    summary: {
      totalAppointments,
      pendingAppointments: statusCounts["Pending"] || 0,
      confirmedAppointments: statusCounts["Confirmed"] || 0,
      completedAppointments: statusCounts["Completed"] || 0,
      cancelledAppointments: statusCounts["Cancelled"] || 0,
    },
    appointmentTrends,
    doctorCounts,
    statusCounts,
  };
}

export async function getPharmacyReport(params: ReportParams) {
  const rangeInfo = normalizeRange(params);
  const [stockSnapshot, prescriptionSnapshot] = await Promise.all([
    firestore.collection("pharmacyStock").select("name", "qty", "unit", "createdAt").get(),
    firestore.collection("pharmacyPrescriptions").select("medicines", "status", "createdAt", "patientName", "doctor").get(),
  ]);

  const stockItems = stockSnapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    return { name: String(data.name || "Unknown"), qty: safeNumber(data.qty), unit: String(data.unit || "units") };
  });

  const totalMedicines = stockItems.length;
  const lowStockMedicines = stockItems.filter((item) => item.qty > 0 && item.qty <= 20).length;
  const outOfStockMedicines = stockItems.filter((item) => item.qty <= 0).length;

  const prescriptions = prescriptionSnapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    const createdAt = toDate(data.createdAt) ?? new Date();
    return { medicines: Array.isArray(data.medicines) ? data.medicines : [], status: String(data.status || "Pending"), createdAt, patientName: String(data.patientName || "Unknown"), doctor: String(data.doctor || "Unknown") };
  });

  const medicineCounts: Record<string, number> = {};
  prescriptions.forEach((pres) => {
    pres.medicines.forEach((med: any) => {
      const name = String(med.name || med.medName || med.medicine || "Unknown").trim();
      if (!name) return;
      medicineCounts[name] = (medicineCounts[name] || 0) + 1;
    });
  });

  const mostPrescribedMedicines = Object.entries(medicineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const dispensingHistory = prescriptions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)
    .map((pres) => ({ doctor: pres.doctor, patient: pres.patientName, createdAt: pres.createdAt.toISOString(), status: pres.status, medicines: pres.medicines.length }));

  return {
    success: true,
    type: "pharmacy",
    range: { label: rangeInfo.label, start: rangeInfo.start.toISOString(), end: rangeInfo.end.toISOString() },
    generatedAt: new Date().toISOString(),
    summary: { totalMedicines, lowStockMedicines, outOfStockMedicines, reportDate: new Date().toISOString() },
    mostPrescribedMedicines,
    dispensingHistory,
    stockItems,
  };
}

export async function getRevenueReport(params: ReportParams) {
  const rangeInfo = normalizeRange(params);
  const snapshot = await firestore.collection("appointments").select("paid", "fee", "consultationFee", "doctorUid", "doctorName", "scheduledAt", "createdAt", "status").get();
  const appointments = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;
    const paid = Boolean(data.paid);
    const feeRaw = data.fee || data.consultationFee || "$0";
    const fee = safeNumber(String(feeRaw).replace(/[^0-9.]/g, ""));
    const doctorName = String(data.doctorName || data.doctor || "Unknown").trim() || "Unknown";
    const scheduledAt = toDate(data.scheduledAt) ?? toDate(data.createdAt) ?? new Date();
    const status = String(data.status || "Pending");
    return { paid, fee, doctorName, scheduledAt, status };
  });

  const paidAppointments = appointments.filter((appt) => appt.paid);
  const totalRevenue = paidAppointments.reduce((sum, appt) => sum + appt.fee, 0);
  const dailyRevenue = paidAppointments.reduce((acc: Record<string, number>, appt) => {
    const key = formatDateKey(appt.scheduledAt, "weekly");
    acc[key] = (acc[key] || 0) + appt.fee;
    return acc;
  }, {} as Record<string, number>);
  const monthlyRevenue = paidAppointments.reduce((acc: Record<string, number>, appt) => {
    const key = formatDateKey(appt.scheduledAt, "monthly");
    acc[key] = (acc[key] || 0) + appt.fee;
    return acc;
  }, {} as Record<string, number>);
  const doctorEarningsSummary = paidAppointments.reduce((acc: Record<string, number>, appt) => {
    acc[appt.doctorName] = (acc[appt.doctorName] || 0) + appt.fee;
    return acc;
  }, {} as Record<string, number>);
  const paymentStatusSummary = {
    paid: appointments.filter((appt) => appt.paid).length,
    unpaid: appointments.filter((appt) => !appt.paid).length,
    pending: appointments.filter((appt) => String(appt.status).toLowerCase() === "pending").length,
    confirmed: appointments.filter((appt) => String(appt.status).toLowerCase() === "confirmed").length,
  };
  const revenueTrends = Object.entries(dailyRevenue).sort(([a], [b]) => a.localeCompare(b)).map(([label, amount]) => ({ label, amount }));

  return {
    success: true,
    type: "revenue",
    range: { label: rangeInfo.label, start: rangeInfo.start.toISOString(), end: rangeInfo.end.toISOString() },
    generatedAt: new Date().toISOString(),
    summary: { totalRevenue, paidAppointments: paymentStatusSummary.paid, unpaidAppointments: paymentStatusSummary.unpaid, reportDate: new Date().toISOString() },
    dailyRevenue,
    monthlyRevenue,
    doctorEarningsSummary,
    paymentStatusSummary,
    revenueTrends,
  };
}

export async function generatePdfReport(reportType: string, payload: any) {
  const sections = Object.entries(payload.summary || {}).map(([label, value]) => ({ heading: reportType.replace(/\w/, (m) => m.toUpperCase()), rows: [{ label, value }] }));
  return buildPdfResponse(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, payload.generatedAt, [
    { heading: "Summary", rows: Object.keys(payload.summary || {}).map((key) => ({ label: key.replace(/([A-Z])/g, " $1"), value: String((payload.summary || {})[key]) })) },
  ]);
}

export async function generateExcelReport(reportType: string, payload: any) {
  const sheets: Array<{ name: string; headers: string[]; rows: Array<Array<string | number>> }> = [];
  const summaryRows = Object.entries(payload.summary || {}).map(([key, value]) => [key.replace(/([A-Z])/g, " $1"), String(value || "")]);
  sheets.push({ name: "Summary", headers: ["Metric", "Value"], rows: summaryRows });

  if (payload.registrationTrends) {
    sheets.push({ name: "Registration Trends", headers: ["Period", "Count"], rows: payload.registrationTrends.map((item: any) => [item.label, item.count]) });
  }
  if (payload.appointmentTrends) {
    sheets.push({ name: "Appointment Trends", headers: ["Period", "Count"], rows: payload.appointmentTrends.map((item: any) => [item.label, item.count]) });
  }
  if (payload.mostPrescribedMedicines) {
    sheets.push({ name: "Most Prescribed", headers: ["Medicine", "Count"], rows: payload.mostPrescribedMedicines.map((item: any) => [item.name, item.count]) });
  }
  if (payload.dispensingHistory) {
    sheets.push({ name: "Dispensing History", headers: ["Patient", "Doctor", "Created At", "Status", "Medicines"], rows: payload.dispensingHistory.map((row: any) => [row.patient, row.doctor, row.createdAt, row.status, String(row.medicines)]) });
  }
  if (payload.doctorEarningsSummary) {
    sheets.push({ name: "Doctor Earnings", headers: ["Doctor", "Revenue"], rows: Object.entries(payload.doctorEarningsSummary).map(([key, value]) => [key, String(value)]) });
  }

  return buildExcelResponse(sheets);
}

function computeAge(dob: any) {
  const date = toDate(dob);
  if (!date) return null;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}
