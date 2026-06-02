import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "Default user seeding is disabled in this environment." }, { status: 410 });
}
