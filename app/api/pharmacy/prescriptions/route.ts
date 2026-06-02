import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await getUserFromSession(sessionCookie);
    const search = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const status = request.nextUrl.searchParams.get("status")?.trim();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = firestore.collection("pharmacyPrescriptions");

    if (status) {
      query = query.where("status", "==", status);
    }

    if (search) {
      const start = search;
      const end = search + "\uf8ff";
      query = query.where("patientNameLower", ">=", start).where("patientNameLower", "<=", end);
    }

    const snapshot = await query.limit(200).get();
    const prescriptions = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FirebaseFirestore.DocumentData) }));
    return NextResponse.json({ success: true, prescriptions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to load prescriptions." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const patientName = (body.patientName || "").trim();
    const doctor = (body.doctor || "").trim();
    const medicines = Array.isArray(body.medicines) ? body.medicines : [];
    const notes = (body.notes || "").trim();
    const status = body.status || "Pending";

    if (!patientName || !doctor || medicines.length === 0) {
      return NextResponse.json({ success: false, message: "Patient name, doctor, and medicines are required." }, { status: 400 });
    }

    const patientId = body.patientId || null;
    const doctorId = body.doctorId || null;
    const doctorSpecialization = (body.doctorSpecialization || body.doctorSpec || "").trim();
    const createdAt = new Date();
    const prescriptionRef = await firestore.collection("pharmacyPrescriptions").add({
      patientId,
      patientName,
      patientNameLower: patientName.toLowerCase(),
      doctorId,
      doctor,
      doctorSpecialization,
      appointmentId: body.appointmentId || null,
      medicines,
      notes,
      status,
      createdBy: user.uid,
      createdAt,
      updatedAt: createdAt,
    });

    const created = await prescriptionRef.get();
    return NextResponse.json({ success: true, prescription: { id: prescriptionRef.id, ...(created.data() || {}) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to create prescription." },
      { status: 500 }
    );
  }
}
