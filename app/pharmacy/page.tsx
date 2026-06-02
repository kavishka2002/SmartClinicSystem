                                                                                                                                                                                                                                                                                                                                                                                                                            "use client";
import React, { useEffect, useState } from "react";

type Medicine = {
  id: string;
  name: string;
  dosage?: string;
  frequency?: number;
  duration?: number;
  totalQuantity?: number;
  specialNotes?: string;
};

type Prescription = {
  id: string;
  patientName: string;
  patient?: string;
  doctor: string;
  doctorName?: string;
  doctorSpecialization?: string;
  appointmentId?: string | null;
  medicines: Medicine[];
  status: string;
  createdAt?: string;
};

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadPrescriptions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pharmacy/prescriptions`);
      const data = await res.json();
      if (data.success) setPrescriptions(data.prescriptions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchPrescriptions = async () => {
      await loadPrescriptions();
    };
    fetchPrescriptions();
  }, []);

  async function confirmDispense(id: string) {
    try {
      const res = await fetch(`/api/pharmacy/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dispensed" }),
      });
      const data = await res.json();
      if (data.success) {
        setPrescriptions((p) => p.map((pr) => (pr.id === id ? { ...pr, status: "Dispensed" } : pr)));
        // refresh to pick up appointment changes
        setTimeout(loadPrescriptions, 300);
      } else {
        alert(data.message || "Unable to confirm dispense.");
      }
    } catch (e) {
      console.error(e);
      alert("Error confirming dispense");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Pharmacy Prescriptions</h1>
      {loading && <div>Loading...</div>}
      {!loading && prescriptions.length === 0 && <div>No prescriptions found.</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {prescriptions.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{p.patientName || p.patient || "Unknown patient"}</div>
                <div style={{ color: "#64748B", fontSize: 13 }}>{p.doctor || p.doctorName || "Unknown doctor"} • {p.doctorSpecialization || "General"}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{p.status}</div>
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>Appointment ID: {p.appointmentId || "N/A"}</div>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {(Array.isArray(p.medicines) ? p.medicines : []).map((m) => (
                <div key={m.id || m.name} style={{ padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{m.name}</div>
                  {m.dosage ? <div style={{ fontSize: 13, color: "#475569" }}>Dosage: {m.dosage}</div> : null}
                  {(m.frequency && m.duration) ? (
                    <div style={{ fontSize: 13, color: "#475569" }}>{m.frequency} time{m.frequency === 1 ? "" : "s"} per day × {m.duration} day{m.duration === 1 ? "" : "s"}</div>
                  ) : null}
                  {m.totalQuantity ? <div style={{ fontSize: 13, color: "#475569" }}>Total quantity: {m.totalQuantity}</div> : null}
                  {m.specialNotes ? <div style={{ fontSize: 13, color: "#475569" }}>Notes: {m.specialNotes}</div> : null}
                </div>
              ))}
            </div>
            {p.status !== "Dispensed" && (
              <button onClick={() => confirmDispense(p.id)}>Confirm Dispensed</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
