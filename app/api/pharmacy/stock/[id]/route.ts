import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, SESSION_COOKIE_NAME } from "../../../../lib/authService";
import { firestore } from "../../../../lib/firebaseAdmin";

function computeStockStatus(quantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 20) return "Low Stock";
  return "In Stock";
}

export async function PATCH(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params);
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

    const payload = await request.json();
    const stockRef = firestore.collection("pharmacyStock").doc(params.id);
    const doc = await stockRef.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Stock item not found." }, { status: 404 });
    }

    const current = doc.data() || {};
    const qty = payload.qty !== undefined ? Number(payload.qty) : current.qty;
    const status = computeStockStatus(Number(qty));

    const updatePayload: Record<string, any> = {
      ...payload,
      qty,
      status,
    };

    if (updatePayload.name) {
      updatePayload.nameLower = String(updatePayload.name).toLowerCase();
    }

    await stockRef.update(updatePayload);
    const updated = await stockRef.get();
    return NextResponse.json({ success: true, item: { id: updated.id, ...(updated.data() || {}) } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to update stock item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params);
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

    const stockRef = firestore.collection("pharmacyStock").doc(params.id);
    const doc = await stockRef.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: "Stock item not found." }, { status: 404 });
    }

    await stockRef.delete();
    return NextResponse.json({ success: true, message: "Stock item removed." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to remove stock item." },
      { status: 500 }
    );
  }
}
