import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../lib/authService";
import { firestore } from "../../../lib/firebaseAdmin";

function computeStockStatus(quantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 20) return "Low Stock";
  return "In Stock";
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await getUserFromSession(sessionCookie);
    const search = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const stockRef = firestore.collection("pharmacyStock");
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = stockRef;

    if (search) {
      const start = search;
      const end = search + "\uf8ff";
      query = stockRef.where("nameLower", ">=", start).where("nameLower", "<=", end);
    }

    const snapshot = await query.limit(200).get();
    const stock = snapshot.docs
      .map((doc: any) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
      .map((item: any) => {
        const record = item as Record<string, any>;
        return { ...item, stock: Number(record.qty ?? record.stock ?? 0) };
      })
      .filter((item: any) => Number(item.stock) > 0);
    return NextResponse.json({ success: true, stock });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to load pharmacy stock." },
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
    const unit = (body.unit || "tablets").trim();
    const qty = Number(body.qty) || 0;
    const brand = (body.brand || "").trim();
    const dosage = (body.dosage || "").trim();
    const price = body.price || "";
    const usage = (body.usage || "").trim();

    if (!name) {
      return NextResponse.json({ success: false, message: "Medicine name is required." }, { status: 400 });
    }

    const status = computeStockStatus(qty);
    const docRef = await firestore.collection("pharmacyStock").add({
      name,
      nameLower: name.toLowerCase(),
      unit,
      qty,
      status,
      brand,
      dosage,
      price,
      usage,
      createdBy: user.uid,
      createdAt: new Date(),
    });

    const created = await docRef.get();
    return NextResponse.json({ success: true, item: { id: docRef.id, ...(created.data() || {}) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to create stock item." },
      { status: 500 }
    );
  }
}
