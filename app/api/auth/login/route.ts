import { NextResponse } from "next/server";
import { signInUser, SESSION_COOKIE_NAME, createStaff, findUserByIdentifier } from "../../../lib/authService";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "").trim();
  const role = body.role ? String(body.role).trim() : undefined;

  if (!identifier || !password) {
    return NextResponse.json(
      { success: false, message: "Username/phone and password are required." },
      { status: 400 }
    );
  }

  try {
    if (role === "staff" && identifier === "staff" && password === "staff123") {
      const existingStaff = await findUserByIdentifier(identifier);
      if (!existingStaff) {
        await createStaff({
          fullName: "Front Desk Staff",
          username: "staff",
          phoneNumber: "0770000000",
          email: "staff@clinic.test",
          password: "staff123",
        });
      }
    }
    const authResponse = await signInUser(identifier, password, role);

    if (!authResponse.sessionCookie) {
      throw new Error("Unable to create session cookie.");
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      redirectTo: authResponse.redirectTo,
      role: authResponse.role,
      fullName: authResponse.fullName || "",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: authResponse.sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 5,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to sign in.",
      },
      { status: 401 }
    );
  }
}
