import * as admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../lib/authService";
import { firestore } from "../../lib/firebaseAdmin";

function normalizeDateTime(rawDate: unknown, fallbackDate?: string, fallbackTime?: string) {
  if (rawDate && typeof rawDate === "object" && rawDate !== null && "toDate" in rawDate && typeof (rawDate as any).toDate === "function") {
    const dt = (rawDate as any).toDate();
    return {
      date: dt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      time: dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      timestamp: dt.getTime(),
    };
  }

  if (typeof rawDate === "string") {
    const dateValue = new Date(rawDate);
    if (!Number.isNaN(dateValue.getTime())) {
      return {
        date: dateValue.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
        time: dateValue.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        timestamp: dateValue.getTime(),
      };
    }
  }

  if (fallbackDate || fallbackTime) {
    return {
      date: fallbackDate || "",
      time: fallbackTime || "",
      timestamp: 0,
    };
  }

  return {
    date: "",
    time: "",
    timestamp: 0,
  };
}

function parseQueueNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.trunc(numberValue) : null;
}

function normalizeDayName(value: unknown) {
  if (!value || typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function parseIsoDate(dateString: string) {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

async function getTakenQueueNumbers(doctorId: string, date: string) {
  const snapshot = await firestore
    .collection("appointments")
    .where("doctorUid", "==", doctorId)
    .where("date", "==", date)
    .get();

  const taken = new Set<number>();
  snapshot.docs.forEach((doc: any) => {
    const data = doc.data() as Record<string, unknown>;
    const queueNumber = parseQueueNumber(data.queueNumber);
    const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
    if (queueNumber && status !== "cancelled") {
      taken.add(queueNumber);
    }
  });

  return taken;
}

function buildToken(queueNumber: number) {
  return `T-${String(queueNumber).padStart(3, "0")}`;
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

    const appointmentsRef = firestore.collection("appointments");
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = appointmentsRef;

    if (user.role === "patient") {
      query = query.where("patientUid", "==", user.uid);
    } else if (user.role === "doctor") {
      query = query.where("doctorUid", "==", user.uid);
    }

    const dateParam = request.nextUrl.searchParams.get("date");
    const selectedDate = dateParam ? new Date(dateParam) : null;
    const selectedDateISO = selectedDate && !Number.isNaN(selectedDate.getTime())
      ? selectedDate.toISOString().slice(0, 10)
      : null;

    const includeDeleted = user.role === "admin" && request.nextUrl.searchParams.get("includeDeleted") === "true";

    const getAppointmentDateISO = (apptDate: string, scheduledAt: number) => {
      if (scheduledAt && Number(scheduledAt) > 0) {
        return new Date(Number(scheduledAt)).toISOString().slice(0, 10);
      }
      if (apptDate) {
        const parsed = new Date(apptDate);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toISOString().slice(0, 10);
        }
      }
      return null;
    };

    let snapshot = await query.get();
    let appointmentDocs = snapshot.docs;

    // Legacy fallback: if patient has no patientUid in stored appointment documents,
    // try matching by patient contact or patient name.
    if (user.role === "patient" && snapshot.empty && user.phoneNumber) {
      const emptySnapshot = {
        docs: [],
        empty: true,
        size: 0,
        query: appointmentsRef,
        readTime: admin.firestore.Timestamp.now(),
        metadata: { fromCache: false, hasPendingWrites: false },
        docChanges: () => [],
        forEach: () => {},
        isEqual: () => false,
      } as unknown as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

      const nameQuery = user.fullName
        ? appointmentsRef.where("patientName", "==", user.fullName).get()
        : Promise.resolve(emptySnapshot);

      const [contactSnapshot, nameSnapshot] = await Promise.all([
        appointmentsRef.where("patientContact", "==", user.phoneNumber).get(),
        nameQuery,
      ]);

      const combinedDocs = [...contactSnapshot.docs, ...nameSnapshot.docs];
      const seenIds = new Set<string>();
      appointmentDocs = combinedDocs.filter((doc) => {
        if (seenIds.has(doc.id)) return false;
        seenIds.add(doc.id);
        return true;
      });
    }

    const appointments = appointmentDocs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        const dateAndTime = normalizeDateTime(
          data.scheduledAt ?? data.dateTime ?? data.date,
          typeof data.date === "string" ? data.date : undefined,
          typeof data.time === "string" ? data.time : undefined
        );
        const queueNumber = parseQueueNumber(data.queueNumber);

        return {
          id: doc.id,
          doctor: data.doctorName || data.doctor || "",
          spec: data.spec || data.specialization || data.specification || "",
          date: dateAndTime.date,
          time: dateAndTime.time,
          room: data.room || data.roomNumber || "",
          status: data.status || (data.paymentRequired && data.paid ? "Confirmed" : "Pending") || "Pending",
          notes: data.notes || "",
          paid: !!data.paid,
          paymentRequired: !!data.paymentRequired,
          fee: data.fee || data.consultationFee || "$0",
          patient: data.patientName || "",
          patientContact: data.patientContact || "",
          doctorUid: data.doctorUid || "",
          patientUid: data.patientUid || "",
          queueNumber,
          token: data.token || (queueNumber ? buildToken(queueNumber) : undefined),
          symptoms: data.symptoms || "",
          diagnosis: data.diagnosis || "",
          prescription: data.prescription || "",
          medicines: Array.isArray(data.medicines) ? data.medicines : [],
          consultationNotes: data.consultationNotes || "",
          consultationStartedAt: data.consultationStartedAt || null,
          consultationCompletedAt: data.consultationCompletedAt || null,
          reportUrl: data.reportUrl || null,
          reportGeneratedAt: data.reportGeneratedAt || null,
          statusHistory: Array.isArray(data.statusHistory) ? data.statusHistory : [],
          isDeleted: !!data.isDeleted,
          deletedAt: data.deletedAt || null,
          deletedBy: data.deletedBy || null,
          deletedReason: data.deletedReason || null,
          scheduledAt: dateAndTime.timestamp,
        };
      })
      .filter((appt) => {
        if (!includeDeleted && appt.isDeleted) return false;
        if (!selectedDateISO) return true;
        const apptDateISO = getAppointmentDateISO(appt.date, appt.scheduledAt);
        return apptDateISO === selectedDateISO;
      })
      .sort((a, b) => (Number(a.scheduledAt || 0) - Number(b.scheduledAt || 0)));

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load appointments.",
      },
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

    const doctorId = body.doctorId || body.doctorUid || null;
    const doctorName = body.doctorName || body.doctor || "";
    const spec = body.spec || body.specialization || "";
    const date = body.date || "";
    const time = body.time || "";
    const room = body.room || "";
    const notes = body.notes || "";
    const fee = body.fee || "$0";
    const paymentRequired = !!body.paymentRequired;
    const paymentCompleted = !!body.paymentCompleted;

    let patientUid = null;
    let patientName = body.patientName || "";
    let patientContact = body.patientContact || "";

    if (user.role === "patient") {
      patientUid = user.uid;
      patientName = patientName || user.fullName || "";
      patientContact = patientContact || user.phoneNumber || "";
    } else {
      // Allow staff/admin/other roles to provide patientUid to book for someone else.
      // Do not default to the staff user's own uid, which would incorrectly associate the appointment.
      patientUid = body.patientUid || null;
      if (!patientName) {
        patientName = body.patientName || user.fullName || "";
      }
      if (!patientContact) {
        patientContact = body.patientContact || user.phoneNumber || "";
      }
    }

    if (!doctorId) {
      return NextResponse.json({ success: false, message: "doctorId is required." }, { status: 400 });
    }

    const doctorSnapshot = await firestore.collection("doctors").doc(doctorId).get();
    if (!doctorSnapshot.exists) {
      return NextResponse.json({ success: false, message: "Doctor not found." }, { status: 404 });
    }

    const doctorData = doctorSnapshot.data() || {};
    const availableDays = Array.isArray(doctorData.availableDays)
      ? doctorData.availableDays
      : Array.isArray(doctorData.availability)
      ? doctorData.availability
      : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const normalizedAvailableDays = availableDays.map(normalizeDayName).filter(Boolean);
    const maxPatientsPerDay = Number.isFinite(Number(doctorData.maxPatientsPerDay)) && Number(doctorData.maxPatientsPerDay) > 0
      ? Number(doctorData.maxPatientsPerDay)
      : 30;
    const isActive = typeof doctorData.isActive === "boolean" ? doctorData.isActive : true;

    const parsedRequestedDate = parseIsoDate(date);
    if (!parsedRequestedDate) {
      return NextResponse.json({ success: false, message: "Invalid appointment date." }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedRequestedDate < today) {
      return NextResponse.json({ success: false, message: "Cannot book appointments in the past." }, { status: 400 });
    }

    if (!isActive) {
      return NextResponse.json({ success: false, message: "This doctor is currently unavailable for booking." }, { status: 400 });
    }

    const requestedDayName = parsedRequestedDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!normalizedAvailableDays.includes(requestedDayName.toLowerCase())) {
      return NextResponse.json({ success: false, message: `Doctor is not available on ${requestedDayName}. Please choose another date.` }, { status: 400 });
    }

    if (paymentRequired && !paymentCompleted) {
      return NextResponse.json({ success: false, message: "Payment required before confirming appointment." }, { status: 402 });
    }

    const takenQueueNumbers = await getTakenQueueNumbers(doctorId, date);
    if (takenQueueNumbers.size >= maxPatientsPerDay) {
      return NextResponse.json({ success: false, message: "This doctor has reached capacity for the selected date." }, { status: 400 });
    }

    const existingAppointmentSnapshot = await firestore
      .collection("appointments")
      .where("doctorUid", "==", doctorId)
      .where("date", "==", date)
      .get();
    const existingAppointments = existingAppointmentSnapshot.docs.map((doc: any) => doc.data() as Record<string, unknown>);

    const duplicateAppointment = existingAppointments.some((appt: any) => {
      if (typeof appt.status === "string" && appt.status.toLowerCase() === "cancelled") {
        return false;
      }
      const contactMatch = typeof appt.patientContact === "string" && appt.patientContact === patientContact;
      const nameMatch = typeof appt.patientName === "string" && appt.patientName === patientName;
      return contactMatch || nameMatch;
    });

    if (duplicateAppointment) {
      return NextResponse.json({ success: false, message: "A booking already exists for this patient with the selected doctor and date." }, { status: 400 });
    }

    const requestedQueueNumber = parseQueueNumber(body.queueNumber);
    const effectiveQueueNumber = requestedQueueNumber && !takenQueueNumbers.has(requestedQueueNumber)
      ? requestedQueueNumber
      : (() => {
          let nextToken = 1;
          while (takenQueueNumbers.has(nextToken)) {
            nextToken += 1;
          }
          return nextToken;
        })();

    const scheduledAt = parsedRequestedDate;
    const symptoms = body.symptoms || "";
    const diagnosis = body.diagnosis || "";
    const prescription = body.prescription || "";
    const medicines = Array.isArray(body.medicines) ? body.medicines : [];
    const consultationNotes = body.consultationNotes || "";

    const initialStatus = paymentRequired ? (paymentCompleted ? "Confirmed" : "Pending") : "Confirmed";
    const docRef = await firestore.collection("appointments").add({
      doctorUid: doctorId || null,
      doctorName,
      spec,
      patientUid,
      patientName,
      patientContact,
      date,
      time: time || `Queue #${effectiveQueueNumber}`,
      queueNumber: effectiveQueueNumber,
      token: buildToken(effectiveQueueNumber),
      room: room || (typeof doctorData.roomNumber === "string" ? doctorData.roomNumber : typeof doctorData.room === "string" ? doctorData.room : ""),
      notes,
      paymentRequired,
      fee: fee || "$0",
      paid: paymentCompleted,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          at: new Date(),
          by: user.uid,
        },
      ],
      symptoms,
      diagnosis,
      prescription,
      medicines,
      consultationNotes,
      scheduledAt,
      createdAt: new Date(),
      createdBy: user.uid,
    });

    const created = await docRef.get();
    return NextResponse.json({ success: true, id: docRef.id, appointment: { id: docRef.id, ...(created.data() || {}) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to create appointment." }, { status: 500 });
  }
}
