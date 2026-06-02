import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

function normalizeQueueNumber(raw: unknown) {
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? Math.trunc(num) : null;
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId");
    const date = url.searchParams.get("date");

    if (!doctorId || !date) {
      return NextResponse.json({ success: false, message: "doctorId and date are required." }, { status: 400 });
    }

    const doctorSnap = await firestore.collection("doctors").doc(doctorId).get();
    if (!doctorSnap.exists) {
      return NextResponse.json({ success: false, message: "Doctor not found." }, { status: 404 });
    }

    const doctorData = doctorSnap.data() || {};
    const availableDays = Array.isArray(doctorData.availableDays)
      ? doctorData.availableDays
      : Array.isArray(doctorData.availability)
      ? doctorData.availability
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const maxPatientsPerDay = Number.isFinite(Number(doctorData.maxPatientsPerDay)) && Number(doctorData.maxPatientsPerDay) > 0
      ? Number(doctorData.maxPatientsPerDay)
      : 30;
    const startTime = typeof doctorData.startTime === "string" && doctorData.startTime.trim() ? doctorData.startTime.trim() : "08:00";
    const endTime = typeof doctorData.endTime === "string" && doctorData.endTime.trim() ? doctorData.endTime.trim() : "16:00";
    const roomNumber = typeof doctorData.roomNumber === "string" && doctorData.roomNumber.trim()
      ? doctorData.roomNumber.trim()
      : typeof doctorData.room === "string" && doctorData.room.trim()
      ? doctorData.room.trim()
      : "03";
    const isActive = typeof doctorData.isActive === "boolean" ? doctorData.isActive : true;

    const appointmentsSnapshot = await firestore.collection("appointments").where("doctorUid", "==", doctorId).get();
    const allAppointments = appointmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as Record<string, unknown> & { id: string });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalizeDateString = (raw: unknown) => {
      if (typeof raw === "string") {
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          parsed.setHours(0, 0, 0, 0);
          return parsed.toISOString().slice(0, 10);
        }
      }
      return null;
    };

    const takenQueueNumbersForDate = new Set<number>();
    const appointmentsForDate = allAppointments.filter((appt) => normalizeDateString(appt.date) === date);
    appointmentsForDate.forEach((appt) => {
      const queueNumber = normalizeQueueNumber(appt.queueNumber);
      const status = typeof appt.status === "string" ? appt.status.toLowerCase() : "";
      if (queueNumber && status !== "cancelled") {
        takenQueueNumbersForDate.add(queueNumber);
      }
    });

    const capacity = Math.max(1, maxPatientsPerDay);
    const bookedCount = takenQueueNumbersForDate.size;
    const remainingSlots = Math.max(0, capacity - bookedCount);

    const availableQueueNumbers = Array.from({ length: capacity }, (_, index) => index + 1)
      .filter((token) => !takenQueueNumbersForDate.has(token));

    const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const normalizedAvailableDays = availableDays.map((day) => String(day).trim().toLowerCase());
    const isAllowedDay = normalizedAvailableDays.includes(dayName.toLowerCase());

    const getStatusForDate = (targetDate: string) => {
      const targetDay = new Date(targetDate).toLocaleDateString("en-US", { weekday: "long" });
      const allowed = normalizedAvailableDays.includes(targetDay.toLowerCase());
      if (!allowed || !isActive) return "Unavailable";
      const dailyBooked = allAppointments.filter((appt) => normalizeDateString(appt.date) === targetDate)
        .filter((appt) => {
          const status = typeof appt.status === "string" ? appt.status.toLowerCase() : "";
          return status !== "cancelled";
        }).length;
      if (dailyBooked >= capacity) return "Fully Booked";
      if (dailyBooked > 0) return "Partially Booked";
      return "Available";
    };

    const futureAvailability = Array.from({ length: 7 }, (_, offset) => {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() + offset);
      const dateKey = entryDate.toISOString().slice(0, 10);
      const status = getStatusForDate(dateKey);
      const dayBooked = allAppointments.filter((appt) => normalizeDateString(appt.date) === dateKey)
        .filter((appt) => {
          const status = typeof appt.status === "string" ? appt.status.toLowerCase() : "";
          return status !== "cancelled";
        }).length;
      return {
        date: dateKey,
        day: entryDate.toLocaleDateString("en-US", { weekday: "short" }),
        status,
        bookedCount: dayBooked,
        remainingSlots: Math.max(0, capacity - dayBooked),
      };
    });

    const currentAppointment = appointmentsForDate
      .filter((appt) => typeof appt.queueNumber !== "undefined" && appt.queueNumber !== null)
      .sort((a, b) => (Number(a.queueNumber) || 0) - (Number(b.queueNumber) || 0))
      .find((appt) => typeof appt.status === "string" && appt.status.toLowerCase() === "with doctor")
      || appointmentsForDate
      .filter((appt) => typeof appt.queueNumber !== "undefined" && appt.queueNumber !== null)
      .sort((a, b) => (Number(a.queueNumber) || 0) - (Number(b.queueNumber) || 0))[0];

    return NextResponse.json({
      success: true,
      availableQueueNumbers,
      currentToken: currentAppointment ? normalizeQueueNumber(currentAppointment.queueNumber) : null,
      queueLength: bookedCount,
      bookedCount,
      remainingSlots,
      capacity,
      roomNumber,
      startTime,
      endTime,
      availableDays,
      isActive,
      isAllowedDay,
      futureAvailability,
      todayStatus: getStatusForDate(today.toISOString().slice(0, 10)),
      busyTokens: Array.from(takenQueueNumbersForDate).sort((a, b) => a - b),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load queue numbers.",
      },
      { status: 500 }
    );
  }
}
