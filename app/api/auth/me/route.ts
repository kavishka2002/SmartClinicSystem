import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile: Record<string, unknown> = { ...user };

    if (user.role === "patient") {
      const patientDoc = await firestore.collection("patients").doc(user.uid).get();
      if (patientDoc.exists) {
        Object.assign(profile, patientDoc.data());
      }
    }

    if (user.role === "doctor") {
      const doctorDoc = await firestore.collection("doctors").doc(user.uid).get();
      if (doctorDoc.exists) {
        Object.assign(profile, doctorDoc.data());
      }
    }

    return NextResponse.json({ authenticated: true, user: profile });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        message: error instanceof Error ? error.message : "Invalid session.",
      },
      { status: 401 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    const allowedUserFields: Record<string, any> = {};
    const allowedPatientFields: Record<string, any> = {};

    // Whitelist editable fields
    const userFields = ["fullName", "phoneNumber", "email"];
    const patientFields = ["address", "dob", "gender", "photo", "height", "weight"];

    userFields.forEach((k) => {
      if (k in body) allowedUserFields[k] = (body as any)[k];
    });

    patientFields.forEach((k) => {
      if (k in body) allowedPatientFields[k] = (body as any)[k];
    });

    // Update users collection basic profile
    if (Object.keys(allowedUserFields).length > 0) {
      await firestore.collection("users").doc(user.uid).set(allowedUserFields, { merge: true });
    }

    // Update role-specific document
    if (user.role === "patient" && Object.keys(allowedPatientFields).length > 0) {
      await firestore.collection("patients").doc(user.uid).set(allowedPatientFields, { merge: true });
    }

    if (user.role === "doctor" && Object.keys(allowedPatientFields).length > 0) {
      // doctors store some profile fields in doctors collection
      await firestore.collection("doctors").doc(user.uid).set(allowedPatientFields, { merge: true });
    }

    // Return updated profile
    const updatedUserDoc = await firestore.collection("users").doc(user.uid).get();
    const profile = (updatedUserDoc.exists ? updatedUserDoc.data() : {}) as Record<string, any>;

    if (user.role === "patient") {
      const p = await firestore.collection("patients").doc(user.uid).get();
      if (p.exists) Object.assign(profile, p.data());
    }

    if (user.role === "doctor") {
      const d = await firestore.collection("doctors").doc(user.uid).get();
      if (d.exists) Object.assign(profile, d.data());
    }

    return NextResponse.json({ message: "Profile updated", user: profile });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to update profile" }, { status: 500 });
  }
}
