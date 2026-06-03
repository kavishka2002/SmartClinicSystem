import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

const computeStockStatus = (quantity: number) => {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 20) return "Low Stock";
  return "In Stock";
};

const isCompletedStatus = (status: string) => {
  const normalized = status.toLowerCase();
  return ["completed", "done", "closed", "finished"].includes(normalized);
};

const isConsultationStatus = (status: string) => {
  const normalized = status.toLowerCase();
  return ["in consultation", "with doctor", "ongoing", "started", "under consultation"].includes(normalized);
};

const buildScheduledAt = (date?: string, time?: string, existingDate?: string, existingTime?: string) => {
  const dateString = date?.trim() || existingDate?.trim();
  const timeString = time?.trim() || existingTime?.trim();

  if (!dateString) return null;
  const combined = timeString ? `${dateString} ${timeString}` : dateString;
  const parsed = new Date(combined);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
};

export async function PATCH(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
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
    const docRef = firestore.collection("appointments").doc(appointmentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    const data = doc.data() || {};
    const doctorUid = data.doctorUid;
    const patientUid = data.patientUid;

    // Authorization: staff/admin or related doctor/patient
    const allowedRoles = ["staff", "admin"];
    if (!(allowedRoles.includes(user.role) || user.uid === doctorUid || user.uid === patientUid)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const updates: any = {};
    const stockDeductions: Array<{ ref: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>; newQty: number }> = [];
    const bodyStatus = typeof body.status === "string" ? body.status : null;
    const existingStatus = typeof data.status === "string" ? data.status : "Pending";
    const existingStatusLower = existingStatus.toLowerCase();
    const isCompletingNow = bodyStatus !== null && isCompletedStatus(bodyStatus) && !isCompletedStatus(existingStatusLower);
    const isStartingNow = bodyStatus !== null && isConsultationStatus(bodyStatus) && !isConsultationStatus(existingStatusLower);

    if (body.status) updates.status = body.status;
    if (typeof body.paid !== "undefined") updates.paid = !!body.paid;
    if (typeof body.notes !== "undefined") updates.notes = body.notes;
    if (typeof body.date !== "undefined") updates.date = body.date;
    if (typeof body.time !== "undefined") updates.time = body.time;
    if (typeof body.room !== "undefined") updates.room = body.room;
    if (typeof body.symptoms !== "undefined") updates.symptoms = body.symptoms;
    if (typeof body.diseaseDescription !== "undefined") updates.diseaseDescription = body.diseaseDescription;
    if (typeof body.clinicalObservations !== "undefined") updates.clinicalObservations = body.clinicalObservations;
    if (typeof body.bloodPressure !== "undefined") updates.bloodPressure = body.bloodPressure;
    if (typeof body.weight !== "undefined") updates.weight = body.weight;
    if (typeof body.temperature !== "undefined") updates.temperature = body.temperature;
    if (typeof body.diagnosis !== "undefined") updates.diagnosis = body.diagnosis;
    if (typeof body.prescription !== "undefined") updates.prescription = body.prescription;
    if (typeof body.prescriptionId !== "undefined") updates.prescriptionId = body.prescriptionId;
    if (typeof body.consultationNotes !== "undefined") updates.consultationNotes = body.consultationNotes;

    const scheduledAt = buildScheduledAt(body.date, body.time, data.date, data.time);
    if (scheduledAt !== null) {
      updates.scheduledAt = scheduledAt;
    }

    const statusHistory = Array.isArray(data.statusHistory) ? [...data.statusHistory] : [{ status: existingStatus, at: data.createdAt || new Date(), by: user.uid }];
    if (body.status && body.status !== existingStatus) {
      statusHistory.push({ status: body.status, at: new Date(), by: user.uid });
      updates.statusHistory = statusHistory;
    }

    if (body.status === "In Consultation" && isStartingNow) {
      updates.consultationStartedAt = new Date();
    }

    if (body.status && isCompletingNow) {
      updates.consultationCompletedAt = new Date();
      updates.reportGeneratedAt = new Date();
      updates.reportUrl = `/api/reports/consultation/${appointmentId}`;
    }

    if (body.paid && !data.paid) {
      updates.paid = true;
      updates.status = body.status || "Confirmed";
    }

    const existingPrescriptionId = typeof body.prescriptionId !== "undefined" ? body.prescriptionId : data.prescriptionId;
    const prescriptionPayload = {
      patientId: data.patientUid || null,
      patientName: data.patientName || data.patient || "",
      patientNameLower: (data.patientName || data.patient || "").toLowerCase(),
      appointmentId,
      doctorId: data.doctorUid || null,
      doctorName: data.doctorName || data.doctor || "",
      doctorNameLower: (data.doctorName || data.doctor || "").toLowerCase(),
      doctorSpecialization: data.spec || data.specialization || "",
      medicines: [] as any[],
      notes: typeof body.consultationNotes !== "undefined" ? body.consultationNotes : data.consultationNotes || "",
      prescriptionText: typeof body.prescription !== "undefined" ? body.prescription : data.prescription || "",
      status: isCompletedStatus(body.status || existingStatus) ? "Completed" : "Pending",
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const shouldCreateOrUpdatePrescription = Array.isArray(body.medicines) || typeof body.prescription !== "undefined" || typeof body.consultationNotes !== "undefined";

    if (Array.isArray(body.medicines)) {
      const medicines = body.medicines.map((med: any) => {
        const frequency = Math.max(1, Number(med.frequency ?? 1));
        const duration = Math.max(1, Number(med.duration ?? 1));
        const requestedQty = Number(med.totalQuantity ?? med.qty ?? med.quantity ?? frequency * duration);
        const totalQuantity = Math.max(1, Number.isNaN(requestedQty) ? frequency * duration : requestedQty);

        return {
          id: med.id || med.name || `${med.name || "medicine"}-${Math.random().toString(36).slice(2, 8)}`,
          name: med.name || "Unnamed medicine",
          dosage: med.dosage || "",
          frequency,
          duration,
          totalQuantity,
          specialNotes: med.specialNotes || "",
          usage: med.usage || "",
          availableStock: Number(med.availableStock ?? med.qty ?? med.stock ?? 0),
        };
      });

      updates.medicines = medicines;
      prescriptionPayload.medicines = medicines;

      if (isCompletingNow) {
        for (const medicine of medicines) {
          if (!medicine.id) {
            return NextResponse.json({ success: false, message: `Medicine id is required for ${medicine.name || "unknown"}.` }, { status: 400 });
          }

          const stockRef = firestore.collection("pharmacyStock").doc(medicine.id);
          const stockDoc = await stockRef.get();
          if (!stockDoc.exists) {
            return NextResponse.json({ success: false, message: `Medicine not found: ${medicine.name}.` }, { status: 404 });
          }

          const stockData = stockDoc.data() || {};
          const currentQty = Number(stockData.qty ?? 0);
          if (currentQty < medicine.totalQuantity) {
            return NextResponse.json({
              success: false,
              message: `Not enough stock for ${medicine.name}. Required ${medicine.totalQuantity}, available ${currentQty}.`,
            }, { status: 400 });
          }

          stockDeductions.push({ ref: stockRef, newQty: currentQty - medicine.totalQuantity });
        }
      }
    }

    if (!Array.isArray(body.medicines)) {
      prescriptionPayload.medicines = Array.isArray(data.medicines) ? data.medicines : [];
    }

    if (shouldCreateOrUpdatePrescription) {
      if (existingPrescriptionId) {
        const prescriptionRef = firestore.collection("pharmacyPrescriptions").doc(existingPrescriptionId);
        updates.prescriptionId = existingPrescriptionId;
        prescriptionPayload.updatedAt = new Date();
        await prescriptionRef.set(prescriptionPayload, { merge: true });
      } else {
        const prescriptionRef = firestore.collection("pharmacyPrescriptions").doc();
        updates.prescriptionId = prescriptionRef.id;
        prescriptionPayload.createdAt = new Date();
        prescriptionPayload.updatedAt = new Date();
        await prescriptionRef.set(prescriptionPayload);
      }
    }

    const consultationPayload = {
      appointmentId,
      patientUid: data.patientUid || null,
      patientName: data.patientName || data.patient || "",
      doctorUid: data.doctorUid || null,
      doctorName: data.doctorName || data.doctor || "",
      doctorSpecialization: data.spec || data.specialization || "",
      diagnosis: typeof body.diagnosis !== "undefined" ? body.diagnosis : data.diagnosis || "",
      notes: typeof body.consultationNotes !== "undefined" ? body.consultationNotes : data.consultationNotes || "",
      prescription: typeof body.prescription !== "undefined" ? body.prescription : data.prescription || "",
      medicines: prescriptionPayload.medicines,
      status: updates.status || existingStatus,
      consultationStartedAt: updates.consultationStartedAt || data.consultationStartedAt || null,
      consultationCompletedAt: updates.consultationCompletedAt || data.consultationCompletedAt || null,
      reportUrl: updates.reportUrl || data.reportUrl || null,
      reportGeneratedAt: updates.reportGeneratedAt || data.reportGeneratedAt || null,
      updatedAt: new Date(),
      createdAt: data.consultationCreatedAt || new Date(),
      createdBy: data.consultationCreatedBy || user.uid,
    };

    if (isCompletingNow) {
      consultationPayload.consultationCompletedAt = updates.consultationCompletedAt;
    }

    if (shouldCreateOrUpdatePrescription || isCompletingNow || body.diagnosis || body.consultationNotes) {
      const consultationRef = firestore.collection("consultations").doc(appointmentId);
      await consultationRef.set(consultationPayload, { merge: true });
    }

    if (Array.isArray(body.uploadedFiles)) {
      // store minimal file metadata and base64 content in appointments doc
      // expected shape: [{ name, type, dataBase64 }]
      updates.uploadedFiles = body.uploadedFiles.map((f: any) => ({
        name: String(f.name || ""),
        type: String(f.type || ""),
        dataBase64: String(f.dataBase64 || ""),
        uploadedAt: new Date(),
        uploadedBy: user.uid,
      }));
    }

    if (stockDeductions.length > 0) {
      await firestore.runTransaction(async (tx: any) => {
        tx.update(docRef, updates);
        for (const deduction of stockDeductions) {
          tx.update(deduction.ref, {
            qty: deduction.newQty,
            status: computeStockStatus(deduction.newQty),
          });
        }
      });
    } else {
      await docRef.update(updates);
    }

    const updatedDoc = await docRef.get();
    const updatedAppointmentData = updatedDoc.data() || {};
    return NextResponse.json({
      success: true,
      appointment: Object.assign({ id: updatedDoc.id }, updatedAppointmentData),
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update appointment." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const params = await Promise.resolve(context.params);

  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const appointmentId = params.id;
    const docRef = firestore.collection("appointments").doc(appointmentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    const body = await request.json();
    const reason = typeof body.reason === "string" ? body.reason : "Soft deleted by admin.";
    const data = doc.data() || {};
    const statusHistory = Array.isArray(data.statusHistory) ? [...data.statusHistory] : [{ status: data.status || "Pending", at: data.createdAt || new Date(), by: user.uid }];

    statusHistory.push({ status: "Deleted", at: new Date(), by: user.uid });

    await docRef.update({
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: user.uid,
      deletedReason: reason,
      status: "Deleted",
      statusHistory,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Appointment soft deleted." });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to delete appointment." }, { status: 500 });
  }
}
