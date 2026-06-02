"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BookingDraft {
  doctorId?: string;
  doctorName?: string;
  spec?: string;
  date?: string;
  time?: string;
  room?: string;
  notes?: string;
  paymentRequired?: boolean;
  fee?: string;
  patientName?: string;
  patientContact?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("smartclinic-booking-draft");
    if (!raw) {
      setError("No payment draft found. Please choose a doctor and try again.");
      return;
    }

    try {
      const data = JSON.parse(raw) as BookingDraft;
      setDraft(data);
    } catch (err) {
      setError("Unable to load payment details.");
    }
  }, []);

  const handlePay = async () => {
    if (!draft) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${window.location.origin}/api/appointments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, paymentCompleted: true }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Payment failed.");
      }

      sessionStorage.removeItem("smartclinic-booking-draft");
      router.push("/patient-home");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)", padding: 32, fontFamily: "'Segoe UI',sans-serif" }}>
      <div style={{ margin: "0 auto", maxWidth: 720, background: "#FFFFFF", borderRadius: 24, boxShadow: "0 24px 70px rgba(15,23,42,0.08)", padding: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12, color: "#0F172A" }}>Confirm Payment</h1>
        <p style={{ fontSize: 15, color: "#475569", marginBottom: 24 }}>Complete payment for your appointment and confirm your booking.</p>

        {error && (
          <div style={{ marginBottom: 20, padding: 16, background: "rgba(239,68,68,0.12)", color: "#b91c1c", borderRadius: 14 }}>
            {error}
          </div>
        )}

        {!draft ? (
          <div style={{ padding: 24, background: "#f8fafc", borderRadius: 16, color: "#334155" }}>
            No draft appointment is available. Please go back and select a doctor first.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#475569", fontSize: 13 }}>Doctor</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{draft.doctorName}</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#475569", fontSize: 13 }}>Specialization</div>
              <div style={{ fontSize: 16, color: "#334155" }}>{draft.spec || "General"}</div>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div style={{ color: "#475569", fontSize: 13 }}>Date</div>
                <div style={{ fontSize: 16, color: "#334155" }}>{draft.date}</div>
              </div>
              <div>
                <div style={{ color: "#475569", fontSize: 13 }}>Time</div>
                <div style={{ fontSize: 16, color: "#334155" }}>{draft.time}</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#475569", fontSize: 13 }}>Total Amount</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A" }}>{draft.fee || "$0"}</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#475569", fontSize: 13 }}>Payment Status</div>
              <div style={{ padding: "10px 14px", borderRadius: 16, background: draft.paymentRequired ? "#FEE2E2" : "#DCFCE7", color: draft.paymentRequired ? "#B91C1C" : "#166534", fontWeight: 700, width: "fit-content" }}>
                {draft.paymentRequired ? "Payment Required" : "Free"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button onClick={handlePay} disabled={loading} style={{ flex: 1, minWidth: 140, border: "none", borderRadius: 18, background: "#2563EB", color: "#fff", padding: "16px 20px", cursor: "pointer", fontSize: 15, fontWeight: 700, boxShadow: "0 14px 32px rgba(37,99,235,0.2)" }}>
                {loading ? "Processing..." : "Pay & Confirm"}
              </button>
              <button onClick={() => router.push("/appointment-booking")} style={{ flex: 1, minWidth: 140, border: "2px solid #E2E8F0", borderRadius: 18, background: "#fff", color: "#0F172A", padding: "16px 20px", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
                Edit Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
