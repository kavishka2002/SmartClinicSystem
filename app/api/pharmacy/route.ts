import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../lib/authService";
import { firestore } from "../../lib/firebaseAdmin";

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

    const search = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const pharmacyRef = firestore.collection("pharmacy");
    let query: FirebaseFirestore.Query = pharmacyRef;

    if (search) {
      const start = search;
      const end = search + "\uf8ff";
      query = pharmacyRef.where("nameLower", ">=", start).where("nameLower", "<=", end);
    }

    const snapshot = await query.limit(100).get();
    const medicines = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as FirebaseFirestore.DocumentData) }));

    return NextResponse.json({ medicines });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to load pharmacy medicines." },
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

    if (!["pharmacy", "staff", "admin"].includes(user.role)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const name = (body.name || "").trim();
    const brand = (body.brand || "").trim();
    const dosage = (body.dosage || "").trim();
    const price = body.price || "";
    const stock = Number(body.stock) || 0;
    const usage = (body.usage || "").trim();

    if (!name) {
      return NextResponse.json({ success: false, message: "Medicine name is required." }, { status: 400 });
    }

    const docRef = await firestore.collection("pharmacy").add({
      name,
      nameLower: name.toLowerCase(),
      brand,
      dosage,
      price,
      stock,
      usage,
      createdBy: user.uid,
      createdAt: new Date(),
    });

    const created = await docRef.get();
    return NextResponse.json({ success: true, medicine: { id: docRef.id, ...(created.data() || {}) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to create pharmacy medicine." },
      { status: 500 }
    );
  }
}
