import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME, registerPatient, getRedirectForRole } from "../../../lib/authService";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let creatorRole: string | null = null;

  // If a session cookie is present, verify it is valid but do not restrict by role.
  // This allows any authenticated user (or public callers without a session) to register patients.
  if (sessionCookie) {
    try {
      await getUserFromSession(sessionCookie);
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid authentication session." }, { status: 401 });
    }
  }

  try {
    const profile = await registerPatient({
      fullName: body.fullName,
      username: body.username,
      phoneNumber: body.phoneNumber,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Patient account created successfully.",
        uid: profile.uid,
        redirectTo: getRedirectForRole(profile.role),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create patient account.",
      },
      { status: 400 }
    );
  }
}
