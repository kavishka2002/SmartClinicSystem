"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PatientDetail {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  bloodGroup?: string;
  age?: string;
  gender?: string;
  address?: string;
  allergies?: string[];
  conditions?: string[];
}

interface Appointment {
  id: string;
  doctor: string;
  spec: string;
  date: string;
  time: string;
  room: string;
  status: string;
  paymentRequired?: boolean;
  fee?: string | number;
  token?: string;
  prescription?: string;
  consultationNotes?: string;
  diagnosis?: string;
  symptoms?: string;
  medicines?: Array<Record<string, any>>;
  bloodPressure?: string;
  weight?: string;
  temperature?: string;
  patientUid?: string;
  doctorUid?: string;
  reportUrl?: string;
  reportGeneratedAt?: string;
}

// Medical Color Palette
const COLORS = {
  primary: "#2563EB",
  secondary: "#10B981",
  background: "#F8FAFC",
  cardBg: "#FFFFFF",
  text: "#1E293B",
  textLight: "#64748B",
  error: "#EF4444",
  border: "#E2E8F0",
  sage: "#10B981",
  mint: "#DBEAFE",
  lavender: "#DDD6FE",
  peach: "#FEEDDB",
  sky: "#E0F2FE",
  cream: "#F8FAFC",
  deepSage: "#2563EB",
  softNavy: "#1E40AF",
  coral: "#EF4444",
};

// Organic Card Component
function OrganicCard({ children, style = {}, hover = true }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: COLORS.cardBg,
        borderRadius: "24px 18px 20px 26px",
        border: `2px solid ${COLORS.border}`,
        boxShadow: hovered ? `0 20px 40px ${COLORS.primary}15` : `0 8px 20px ${COLORS.primary}10`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px) rotate(1deg)" : "translateY(0) rotate(0deg)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${COLORS.mint}20 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${COLORS.lavender}15 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// Organic Button
function OrganicBtn({ children, primary, style = {}, onClick }: { children: React.ReactNode; primary?: boolean; style?: React.CSSProperties; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: "18px 14px 16px 20px",
        border: primary ? "none" : `2px solid ${COLORS.border}`,
        background: primary ? (hover ? COLORS.softNavy : COLORS.primary) : COLORS.background,
        color: primary ? COLORS.cardBg : COLORS.text,
        padding: "12px 20px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: primary ? `0 8px 20px ${COLORS.primary}40` : `0 4px 12px ${COLORS.primary}20`,
        fontFamily: "'Nunito', sans-serif",
        transform: hover ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function MedicalRecordsUI() {
  const router = useRouter();
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [patientData, setPatientData] = useState<PatientDetail | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const origin = window.location.origin;
      const [profileRes, appointmentsRes] = await Promise.all([
          fetch(`${origin}/api/auth/me`, { credentials: "include" }),
          fetch(`${origin}/api/appointments`, { credentials: "include" }),
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            router.push("/login");
            return;
          }
          const body = await profileRes.json().catch(() => null);
          throw new Error(body?.message || "Unable to load profile.");
        }

        if (!appointmentsRes.ok) {
          const body = await appointmentsRes.json().catch(() => null);
          throw new Error(body?.message || "Unable to load appointments.");
        }

        const profileData = await profileRes.json();
        const appointmentData = await appointmentsRes.json();

        setPatientData(profileData.user || null);
        setAppointments(Array.isArray(appointmentData.appointments) ? appointmentData.appointments : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load medical records.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const completedConsultations = appointments.filter((appointment) => appointment.status.toLowerCase() === "completed" || appointment.status.toLowerCase() === "done");
  const latestCompleted = completedConsultations[0] || null;
  const activeMedications = Array.from(
    new Map(
      completedConsultations
        .flatMap((appointment) => appointment.medicines || [])
        .map((medicine) => [medicine.id || medicine.name || `${medicine.name}-${Math.random()}`, medicine])
    ).values()
  );

  const patientIdLabel = patientData?.uid ? `PT-${patientData.uid.slice(0, 8).toUpperCase()}` : "Patient ID not available";
  const patientAllergies = patientData?.allergies?.length ? patientData.allergies.join(", ") : "Not available";
  const patientConditions = patientData?.conditions?.length ? patientData.conditions.join(", ") : "Not available";

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBg} 100%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
          background: linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBg} 100%);
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar { 
          width: 8px; 
          height: 8px; 
        }
        ::-webkit-scrollbar-track { 
          background: ${COLORS.background}; 
        }
        ::-webkit-scrollbar-thumb { 
          background: ${COLORS.primary}; 
          border-radius: 20px; 
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: `rgba(248, 250, 252, 0.95)`, backdropFilter: "blur(20px)", borderBottom: `2px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>
              ← Back
            </button>
            <div style={{ width: 1, height: 24, background: COLORS.border }} />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.deepSage, margin: 0, fontFamily: "'Crimson Text', serif" }}>
              Medical Records
            </h1>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
        {/* Patient Info Header */}
        <OrganicCard style={{ padding: 32, marginBottom: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  boxShadow: `0 8px 24px ${COLORS.primary}30`,
                }}
              >
                👤
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                  {patientData?.fullName || "Patient Name"}
                </h2>
                <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                  {patientIdLabel}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: COLORS.background, padding: 16, borderRadius: "16px 12px 14px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Blood Group</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                  {patientData?.bloodGroup || "Not available"}
                </h3>
              </div>
              <div style={{ background: COLORS.background, padding: 16, borderRadius: "16px 12px 14px 18px", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Age</p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                  {patientData?.age || "Not available"}
                </h3>
              </div>
            </div>
          </div>
        </OrganicCard>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, marginBottom: 40 }}>
          {/* Medical History */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                Medical History
              </h2>
              <OrganicBtn
                primary={true}
                onClick={() => {
                  if (latestCompleted) {
                    window.open(`/api/reports/consultation/${latestCompleted.id}`, "_blank");
                  }
                }}
                style={{ opacity: latestCompleted ? 1 : 0.5, cursor: latestCompleted ? "pointer" : "default" }}
              >
                📥 {latestCompleted ? "Download Latest Report" : "No Completed Reports"}
              </OrganicBtn>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {completedConsultations.length === 0 ? (
                <OrganicCard style={{ padding: 24 }}>
                  <p style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>
                    No completed consultations found yet. Your medical record will appear here after your visit.
                  </p>
                </OrganicCard>
              ) : (
                completedConsultations.map((record, index) => (
                  <OrganicCard key={record.id} style={{ padding: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>
                          {record.diagnosis || "Consultation Summary"}
                        </h3>
                        <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                          👨‍⚕️ {record.doctor || "Doctor details unavailable"}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: "8px 16px",
                          borderRadius: "20px",
                          background: COLORS.mint,
                          color: COLORS.primary,
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          fontFamily: "'Nunito', sans-serif",
                        }}
                      >
                        📅 {record.date}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div style={{ background: COLORS.background, padding: 12, borderRadius: "14px", borderLeft: `4px solid ${COLORS.primary}` }}>
                        <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Prescription</p>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                          {record.prescription || "Not available"}
                        </h4>
                      </div>
                      <div style={{ background: COLORS.background, padding: 12, borderRadius: "14px", borderLeft: `4px solid ${COLORS.secondary}` }}>
                        <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Status</p>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: COLORS.secondary, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                          ✓ {record.status}
                        </h4>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ padding: 16, background: COLORS.background, borderRadius: "18px" }}>
                        <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Doctor</p>
                        <strong style={{ display: "block", marginTop: 8, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{record.doctor || "N/A"}</strong>
                      </div>
                      <div style={{ padding: 16, background: COLORS.background, borderRadius: "18px" }}>
                        <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Notes</p>
                        <strong style={{ display: "block", marginTop: 8, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{record.consultationNotes || "No notes available"}</strong>
                      </div>
                    </div>

                    {record.medicines && record.medicines.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif", marginBottom: 8 }}>Medicines</p>
                        <div style={{ display: "grid", gap: 10 }}>
                          {record.medicines.map((medicine, medIndex) => (
                            <div key={`${record.id}-med-${medIndex}`} style={{ padding: 14, borderRadius: 18, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                                <strong style={{ color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{medicine.name || "Medicine"}</strong>
                                <span style={{ color: COLORS.textLight, fontSize: 12 }}>{medicine.totalQuantity ? `Qty: ${medicine.totalQuantity}` : "Qty: N/A"}</span>
                              </div>
                              <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>{medicine.dosage || medicine.usage || "Usage not set"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                      <OrganicBtn
                        primary
                        onClick={() => window.open(`/api/reports/consultation/${record.id}`, "_blank")}
                        style={{ minWidth: 180 }}
                      >
                        Download Report
                      </OrganicBtn>
                    </div>
                  </OrganicCard>
                ))
              )}
            </div>
          </div>

          {/* Health Summary Sidebar */}
          <div>
            <OrganicCard style={{ padding: 24, position: "sticky", top: 100 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16, fontFamily: "'Crimson Text', serif" }}>
                Health Summary
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: COLORS.background, padding: 12, borderRadius: "14px" }}>
                  <p style={{ fontSize: 11, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Blood Pressure</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                    {latestCompleted?.bloodPressure || "Not available"}
                  </h3>
                </div>
                <div style={{ background: COLORS.background, padding: 12, borderRadius: "14px" }}>
                  <p style={{ fontSize: 11, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Weight</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                    {latestCompleted?.weight || "Not available"}
                  </h3>
                </div>
                <div style={{ background: COLORS.background, padding: 12, borderRadius: "14px" }}>
                  <p style={{ fontSize: 11, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Allergies</p>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                    {patientAllergies}
                  </h3>
                </div>
              </div>
            </OrganicCard>
          </div>
        </div>

        {/* Current Medications */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 24, fontFamily: "'Crimson Text', serif" }}>
            Current Medications
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {activeMedications.length === 0 ? (
              <OrganicCard style={{ padding: 24 }}>
                <p style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>
                  No medication records are available yet. Completed prescriptions will appear here.
                </p>
              </OrganicCard>
            ) : (
              activeMedications.map((med, index) => (
                <OrganicCard key={index} style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>
                    💊 {med.name || "Medicine"}
                  </h3>
                  <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                    {med.dosage || med.usage || "Dosage details not available"}
                  </p>
                  <div
                    style={{
                      marginTop: 12,
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      background: `${COLORS.secondary}20`,
                      color: COLORS.secondary,
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    ✓ {med.totalQuantity ? `Qty: ${med.totalQuantity}` : "Quantity not set"}
                  </div>
                </OrganicCard>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 24, fontFamily: "'Crimson Text', serif" }}>
            Notifications
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <OrganicCard style={{ padding: 20, borderLeft: `4px solid ${COLORS.primary}` }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary, fontFamily: "'Nunito', sans-serif" }}>
                📅 Upcoming Appointment
              </h3>
              <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                Appointment with Dr. Silva tomorrow at 10:30 AM.
              </p>
            </OrganicCard>

            <OrganicCard style={{ padding: 20, borderLeft: `4px solid ${COLORS.secondary}` }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.secondary, fontFamily: "'Nunito', sans-serif" }}>
                ✓ Lab Report Ready
              </h3>
              <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                Your blood test report is now available for download.
              </p>
            </OrganicCard>
          </div>
        </div>
      </main>
    </div>
  );
}
