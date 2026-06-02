import { NextResponse } from "next/server";
import { registerDoctor, getRedirectForRole } from "../../../lib/authService";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const profile = await registerDoctor({
      fullName: body.fullName,
      username: body.username,
      phoneNumber: body.phoneNumber,
      email: body.email,
      specialization: body.specialization,
      hospital: body.hospital,
      category: body.category,
      password: body.password,
      confirmPassword: body.confirmPassword,
      fee: body.fee,
      paymentRequired: Boolean(body.paymentRequired),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Doctor account created successfully.",
        uid: profile.uid,
        redirectTo: getRedirectForRole(profile.role),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create doctor account.",
      },
      { status: 400 }
    );
  }
}
