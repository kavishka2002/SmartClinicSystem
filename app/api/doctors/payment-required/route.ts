import * as admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

export async function PATCH(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const doctorId = String(body?.doctorId || "").trim();
    const rawPaymentRequired = body?.paymentRequired;
    const paymentRequired = rawPaymentRequired === true || rawPaymentRequired === "true" || rawPaymentRequired === 1 || rawPaymentRequired === "1";
    const fee = typeof body?.fee === "string" ? body.fee.trim() || "$0" : body?.fee || "$0";

    if (!doctorId) {
      return NextResponse.json({ success: false, message: "doctorId is required." }, { status: 400 });
    }

    if (paymentRequired && (!fee || fee === "$0")) {
      return NextResponse.json({ success: false, message: "A valid fee is required when payment is required." }, { status: 400 });
    }

    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isDoctorOwner = user.role === "doctor" && user.uid === doctorId;
    const isStaffOrAdmin = user.role === "staff" || user.role === "admin";

    if (!isStaffOrAdmin && !isDoctorOwner) {
      return NextResponse.json({ success: false, message: "Only staff, admin, or the doctor owner can change payment settings." }, { status: 403 });
    }

    const updateData: { paymentRequired: boolean; fee?: string | admin.firestore.FieldValue; doctorCharges?: string | admin.firestore.FieldValue } = { paymentRequired };
    const isFeeValid = fee && fee !== "$0";
    const responseFee = isFeeValid ? fee : undefined;

    if (paymentRequired) {
      updateData.fee = fee;
      updateData.doctorCharges = fee;
    } else {
      updateData.fee = admin.firestore.FieldValue.delete();
      updateData.doctorCharges = admin.firestore.FieldValue.delete();
    }

    await firestore.collection("doctors").doc(doctorId).update(updateData);

    return NextResponse.json({ success: true, doctorId, paymentRequired, fee: responseFee, doctorCharges: responseFee });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to update payment setting." },
      { status: 500 }
    );
  }
}
