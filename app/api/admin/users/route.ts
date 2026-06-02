import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const user = await getUserFromSession(sessionCookie);
    if (!user || user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const snapshot = await firestore.collection("users").limit(500).get();
    const users = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const role = data.role || "patient";
      const roleDoc = role === "doctor" ? await firestore.collection("doctors").doc(doc.id).get() : role === "patient" ? await firestore.collection("patients").doc(doc.id).get() : null;
      return {
        id: doc.id,
        ...(data as Record<string, any>),
        roleData: roleDoc && roleDoc.exists ? roleDoc.data() : undefined,
      };
    }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to load users." }, { status: 500 });
  }
}
