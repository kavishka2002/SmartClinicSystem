import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../../lib/authService";
import { firestore } from "../../../../lib/firebaseAdmin";

export async function PATCH(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const prescriptionRef = firestore.collection("pharmacyPrescriptions").doc(params.id);
    const doc = await prescriptionRef.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Prescription not found." }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      ...payload,
      updatedAt: new Date(),
    };

    if (payload.patientName) {
      updatePayload.patientNameLower = String(payload.patientName).toLowerCase();
    }

    if (payload.status === "Dispensed") {
      const allowedRoles = ["pharmacy", "staff", "admin"];
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
      }
      
      updatePayload.dispensedAt = new Date();
      updatePayload.dispensedBy = user.uid;
    }

    await prescriptionRef.update(updatePayload);

    // If pharmacy confirms dispensing, update any linked appointment(s)
    if (payload.status === "Dispensed") {
      try {
        const apptQuery = await firestore.collection("appointments").where("prescriptionId", "==", params.id).get();
        const updates: Promise<any>[] = [];
        apptQuery.forEach((apptDoc) => {
          const apptRef = firestore.collection("appointments").doc(apptDoc.id);
          const apptUpdate: Record<string, any> = {
            status: "Completed",
            deliveryConfirmed: true,
            deliveredAt: new Date(),
            deliveredBy: user.uid,
          };
          updates.push(apptRef.update(apptUpdate));
        });
        await Promise.all(updates);
      } catch (e) {
        // non-fatal: continue even if appointment update fails
        console.warn("Failed to update linked appointments after dispensing:", e);
      }
    }

    const updated = await prescriptionRef.get();
    return NextResponse.json({ success: true, prescription: { id: updated.id, ...(updated.data() || {}) } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to update prescription." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const prescriptionRef = firestore.collection("pharmacyPrescriptions").doc(params.id);
    const doc = await prescriptionRef.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Prescription not found." }, { status: 404 });
    }

    await prescriptionRef.delete();
    return NextResponse.json({ success: true, message: "Prescription removed." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to remove prescription." },
      { status: 500 }
    );
  }
}
