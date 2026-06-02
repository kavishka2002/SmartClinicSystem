"use client";

import React, { useEffect, useState } from "react";

type Doctor = {
  id: string;
  name: string;
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
  available?: boolean;
};

export default function StaffDashboardClient() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetch("/api/doctors");
        const data = await res.json();
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      } catch (e) {
        console.error(e);
      }
    }
    loadDoctors();
  }, []);

  useEffect(() => {
    if (doctorId) {
      const doc = doctors.find((d) => d.id === doctorId);
      if (doc) {
        setRoom((r) => (r ? r : doc.roomNumber || ""));
      }
    }
  }, [doctorId, doctors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!doctorId) return setMessage("Please select a doctor.");
    if (!date) return setMessage("Please choose a date.");

    setLoading(true);
    try {
      const body = { doctorId, date, time, room, notes };
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message || data?.error || "Failed to create appointment.");
      } else {
        setMessage("Appointment created successfully.");
        setDoctorId("");
        setDate("");
        setTime("");
        setRoom("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
      setMessage("Unable to reach server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h1>Staff — Schedule Consultation</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} style={{ width: "100%" }}>
            <option value="">-- Select doctor --</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.available === false ? "(Unavailable)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
          </div>
          <div style={{ width: 160 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Room</label>
          <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 03 or A-1" style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%" }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "Scheduling..." : "Schedule Consultation"}
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
