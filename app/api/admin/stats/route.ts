import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Fetch basic counts
    const [usersSnap, patientsSnap, doctorsSnap, appointmentsSnap, prescriptionsSnap, stockSnap] = await Promise.all([
      firestore.collection("users").get(),
      firestore.collection("patients").get(),
      firestore.collection("doctors").get(),
      firestore.collection("appointments").get(),
      firestore.collection("pharmacyPrescriptions").get(),
      firestore.collection("pharmacyStock").get(),
    ]);

    // Simple revenue: sum of paid appointment fees (attempt to parse numeric value)
    let revenue = 0;
    appointmentsSnap.docs.forEach((doc: any) => {
      const data = doc.data() as any;
      if (data.paid) {
        const feeRaw = String(data.fee || data.consultationFee || "$0");
        const num = Number(feeRaw.replace(/[^0-9.]/g, "")) || 0;
        revenue += num;
      }
    });

    const lowStockCount = stockSnap.docs.filter((d: any) => {
      const data = d.data() as any;
      const qty = Number(data.qty ?? data.stock ?? 0);
      return qty <= 20;
    }).length;

    const stats = {
      totalUsers: usersSnap.size,
      totalPatients: patientsSnap.size,
      totalDoctors: doctorsSnap.size,
      totalAppointments: appointmentsSnap.size,
      pendingPrescriptions: prescriptionsSnap.docs.filter((d: any) => (d.data() as any).status !== "Dispensed").length,
      lowStockCount,
      revenue,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to load admin stats." }, { status: 500 });
  }
}
