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

export default function PharmacyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrescriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pharmacy/prescriptions");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to load prescriptions.");
      }
      setPrescriptions(Array.isArray(data.prescriptions) ? data.prescriptions : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const confirmDispense = async (id: string) => {
    try {
      const res = await fetch(`/api/pharmacy/prescriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dispensed" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to confirm dispense.");
      }
      loadPrescriptions();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>All Prescriptions</h1>
      <p style={{ marginBottom: 24, color: "#64748B" }}>View and manage prescriptions collected from completed consultations.</p>

      {loading && <div style={{ color: "#475569" }}>Loading prescriptions...</div>}
      {error && <div style={{ color: "#EF4444", marginBottom: 20 }}>{error}</div>}
      {!loading && !error && prescriptions.length === 0 && (
        <div style={{ padding: 18, borderRadius: 14, background: "#f8fafc", color: "#475569" }}>
          No prescriptions found yet. Completed consultations will appear here once the doctor saves them.
        </div>
      )}

      <div style={{ display: "grid", gap: 18 }}>
        {prescriptions.map((prescription) => (
          <div key={prescription.id} style={{ border: "1px solid #CBD5E1", borderRadius: 16, padding: 24, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{prescription.patientName || prescription.patient || "Unknown patient"}</div>
                <div style={{ fontSize: 14, color: "#64748B" }}>{prescription.doctor || prescription.doctorName || "Unknown doctor"} • {prescription.doctorSpecialization || "General"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: prescription.status === "Dispensed" ? "#047857" : "#334155" }}>
                  {prescription.status}
                </span>
              </div>
            </div>

            <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>Appointment ID: {prescription.appointmentId || "Not assigned"}</div>

            <div style={{ display: "grid", gap: 12 }}>
              {prescription.medicines.map((medicine) => (
                <div key={medicine.id || medicine.name} style={{ padding: 16, borderRadius: 12, border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{medicine.name}</div>
                  {medicine.dosage ? <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>Dosage: {medicine.dosage}</div> : null}
                  {(medicine.frequency && medicine.duration) ? (
                    <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{medicine.frequency} time{medicine.frequency === 1 ? "" : "s"} per day × {medicine.duration} day{medicine.duration === 1 ? "" : "s"}</div>
                  ) : null}
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Total quantity: {medicine.totalQuantity ?? "--"}</div>
                  {medicine.specialNotes ? <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>Notes: {medicine.specialNotes}</div> : null}
                </div>
              ))}
            </div>

            {prescription.status !== "Dispensed" && (
              <button
                onClick={() => confirmDispense(prescription.id)}
                style={{ marginTop: 20, padding: "12px 18px", borderRadius: 14, border: "none", background: "#10B981", color: "#fff", cursor: "pointer" }}
              >
                Confirm Dispensed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
