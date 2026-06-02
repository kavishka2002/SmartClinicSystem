import { NextRequest, NextResponse } from "next/server";
import { firestore } from "../../../../lib/firebaseAdmin";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../../lib/authService";

function bufferPdf(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

function formatDateTime(rawDate: unknown, fallbackDate?: string, fallbackTime?: string) {
  if (rawDate && typeof rawDate === "object" && rawDate !== null && "toDate" in rawDate && typeof (rawDate as any).toDate === "function") {
    const dt = (rawDate as any).toDate();
    return {
      date: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      time: dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  }

  if (typeof rawDate === "string") {
    const dt = new Date(rawDate);
    if (!Number.isNaN(dt.getTime())) {
      return {
        date: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        time: dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
    }
  }

  return {
    date: fallbackDate || "",
    time: fallbackTime || "",
  };
}

export async function GET(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const params = await Promise.resolve(context.params);

  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const appointmentId = params.id;
    const appointmentRef = firestore.collection("appointments").doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      return NextResponse.json({ message: "Consultation not found." }, { status: 404 });
    }

    const appointmentData = appointmentDoc.data() as Record<string, any>;
    const patientUid = appointmentData.patientUid;
    const doctorUid = appointmentData.doctorUid;

    if (user.role === "patient" && user.uid !== patientUid) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [patientDoc, doctorDoc, doctorUserDoc] = await Promise.all([
      firestore.collection("users").doc(patientUid).get(),
      firestore.collection("doctors").doc(doctorUid).get(),
      firestore.collection("users").doc(doctorUid).get(),
    ]);

    const patientRecord = patientDoc.exists ? (patientDoc.data() as Record<string, any>) : {};
    const patientDetailsDoc = await firestore.collection("patients").doc(patientUid).get();
    const patientDetails = patientDetailsDoc.exists ? (patientDetailsDoc.data() as Record<string, any>) : {};
    const doctorRecord = doctorDoc.exists ? (doctorDoc.data() as Record<string, any>) : {};
    const doctorUser = doctorUserDoc.exists ? (doctorUserDoc.data() as Record<string, any>) : {};

    const patientName = appointmentData.patientName || appointmentData.patient || patientRecord.fullName || "Unknown";
    const doctorName = appointmentData.doctorName || appointmentData.doctor || doctorUser.fullName || "Unknown";
    const doctorSpecialization = appointmentData.doctorSpecialization || appointmentData.spec || doctorRecord.specialization || "General Medicine";
    const doctorRegNo = doctorRecord.registrationNumber || doctorRecord.registrationNo || doctorRecord.regNumber || "N/A";
    const hospitalName = doctorRecord.hospital || "Smart Clinic";
    const hospitalAddress = doctorRecord.hospitalAddress || doctorRecord.address || "123 Health Avenue, Colombo";
    const hospitalContact = doctorRecord.hospitalPhone || doctorRecord.phoneNumber || "000 000 0000";
    const consultationDate = formatDateTime(appointmentData.scheduledAt || appointmentData.date || appointmentData.dateTime, appointmentData.date, appointmentData.time);

    const medicines = Array.isArray(appointmentData.medicines) ? appointmentData.medicines : [];

    // Use pdf-lib (pure JS) to generate the PDF on the server without fontkit.
    const pdfLib = await import('pdf-lib');
    const { PDFDocument, StandardFonts, rgb } = pdfLib as any;

    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4 size in points
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const titleSize = 18;
    let y = 800;

    const draw = (text: string, size = 11, gap = 18, color = rgb(0.04, 0.14, 0.28)) => {
      page.drawText(text, { x: 50, y, size, font: helvetica, color });
      y -= gap;
    };

    draw('Medical Consultation Report', titleSize, 30, rgb(0.04, 0.14, 0.28));
    draw(`Report generated for: ${patientName}`, 10, 14);
    draw(`Consultation ID: ${appointmentId}`, 10, 14);
    draw(`Date: ${consultationDate.date} ${consultationDate.time}`, 10, 20);

    draw('Patient Information', 12, 16);
    draw(`Name: ${patientName}`);
    draw(`Email: ${patientRecord.email || appointmentData.patientEmail || 'Not available'}`);
    draw(`Phone: ${patientRecord.phoneNumber || appointmentData.patientContact || 'Not available'}`);
    draw(`Gender: ${patientDetails.gender || 'Not available'}`);
    draw(`Age: ${patientDetails.age || patientDetails.dob || 'Not available'}`);

    draw('Doctor Information', 12, 16);
    draw(`Name: Dr. ${doctorName}`);
    draw(`Specialization: ${doctorSpecialization}`);
    draw(`Registration Number: ${doctorRegNo}`);
    draw(`Contact: ${doctorUser.phoneNumber || 'Not available'}`);

    draw('Clinic Information', 12, 16);
    draw(`Clinic: ${hospitalName}`);
    draw(`Address: ${hospitalAddress}`);
    draw(`Contact: ${hospitalContact}`);

    draw('Consultation Details', 12, 16);
    draw(`Symptoms: ${appointmentData.symptoms || 'Not available'}`);
    draw(`Diagnosis: ${appointmentData.diagnosis || 'Not available'}`);
    draw(`Clinical Notes: ${appointmentData.consultationNotes || appointmentData.notes || 'Not available'}`);
    draw(`Blood Pressure: ${appointmentData.bloodPressure || 'Not available'}`);
    draw(`Weight: ${appointmentData.weight || 'Not available'}`);
    draw(`Temperature: ${appointmentData.temperature || 'Not available'}`);

    draw('Prescription Details', 12, 16);
    if (medicines.length === 0) {
      draw('No medicines prescribed.');
    } else {
      medicines.forEach((medicine: any, index: number) => {
        draw(`${index + 1}. ${medicine.name || medicine.medName || 'Medicine'}`);
        draw(`   Dosage: ${medicine.dosage || medicine.dose || 'Not available'}`);
        draw(`   Quantity: ${medicine.totalQuantity ?? medicine.qty ?? medicine.quantity ?? 'Not available'}`);
        draw(`   Instructions: ${medicine.usage || medicine.specialNotes || 'Not available'}`);
      });
    }

    if (appointmentData.prescription) {
      draw(`Prescription Notes: ${appointmentData.prescription}`);
    }

    const pdfBytes = await doc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="medical-report-${appointmentId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to generate medical report.",
      },
      { status: 500 }
    );
  }
}
