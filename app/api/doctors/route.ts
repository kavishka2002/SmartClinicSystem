import { NextResponse } from "next/server";
import { firestore } from "../../lib/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await firestore.collection("doctors").get();
    const doctors = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const rawFee = typeof data.doctorCharges === "string" ? data.doctorCharges :
        typeof data.fee === "string" ? data.fee : data.fee != null ? String(data.fee) :
        typeof data.consultationFee === "string" ? data.consultationFee : data.consultationFee != null ? String(data.consultationFee) : "$0";
      const fee = rawFee.trim() || "$0";
      const paymentRequired = typeof data.paymentRequired === "boolean" ? data.paymentRequired : fee !== "$0";
      const status = typeof data.status === "string" ? data.status : Array.isArray(data.availability) && data.availability.length > 0 ? "Available" : "Busy";
      const availableDays = Array.isArray(data.availableDays)
      ? data.availableDays
      : Array.isArray(data.availability)
      ? data.availability
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const startTime = typeof data.startTime === "string" && data.startTime.trim() ? data.startTime.trim() : "08:00";
    const endTime = typeof data.endTime === "string" && data.endTime.trim() ? data.endTime.trim() : "16:00";
    const roomNumber = typeof data.roomNumber === "string" && data.roomNumber.trim() ? data.roomNumber.trim() : typeof data.room === "string" && data.room.trim() ? data.room.trim() : "03";
    const maxPatientsPerDay = Number.isFinite(Number(data.maxPatientsPerDay)) && Number(data.maxPatientsPerDay) > 0 ? Number(data.maxPatientsPerDay) : 30;
    const isActive = typeof data.isActive === "boolean" ? data.isActive : true;

    return {
        id: doc.id,
        name: data.fullName || data.username || "Unnamed Doctor",
        username: data.username || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        role: data.role || "doctor",
        specialization: data.specialization || "General Medicine",
        hospital: data.hospital || "Independent Clinic",
        category: data.category || "General",
        availability: availableDays,
        availableDays,
        startTime,
        endTime,
        roomNumber,
        maxPatientsPerDay,
        isActive,
        status,
        available: status === "Available" && isActive,
        fee,
        doctorCharges: typeof data.doctorCharges === "string" ? data.doctorCharges.trim() || fee : fee,
        paymentRequired,
      };
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load doctors.",
      },
      { status: 500 }
    );
  }
}
