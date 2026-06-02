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
    const status = body?.status;

    if (status !== "Available" && status !== "Busy") {
      return NextResponse.json(
        { success: false, message: "Status must be either Available or Busy." },
        { status: 400 }
      );
    }

    const user = await getUserFromSession(sessionCookie);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "doctor") {
      return NextResponse.json({ success: false, message: "Only doctors can change availability status." }, { status: 403 });
    }

    await firestore.collection("doctors").doc(user.uid).update({ status });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to update availability status.",
      },
      { status: 500 }
    );
  }
}
