"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface Patient {
  name: string;
  firstName: string;
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string[];
  conditions: string[];
  medicines: number;
  status: string;
}

interface PatientProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt?: string;
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
  scheduledAt?: string | number;
  bloodPressure?: string;
  weight?: string | number;
  temperature?: string | number;
  medicines?: Array<Record<string, any>>;
  deliveryConfirmed?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital?: string;
  availability?: string[];
  status?: string;
  available: boolean;
  exp?: string;
  rating?: number;
}

interface Notification {
  id: number;
  type: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  color: string;
  bg: string;
}

// Organic Avatar with flowing shape
function OrganicAvatar({ name, size = 48, fontSize = 20 }: { name: string; size?: number; fontSize?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "60% 40% 50% 45%",
        background: `linear-gradient(135deg, ${COLORS.sage}, ${COLORS.mint})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.deepSage,
        fontWeight: 800,
        fontSize,
        flexShrink: 0,
        boxShadow: `0 8px 24px ${COLORS.sage}40`,
        fontFamily: "'Nunito', sans-serif",
        animation: "gentleFloat 6s ease-in-out infinite",
      }}
    >
      {initials}
    </div>
  );
}

// Flowing Badge
function FlowingBadge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        borderRadius: "20px 15px 18px 22px",
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        boxShadow: `0 4px 12px ${color}30`,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

// Organic Card with subtle curves
function OrganicCard({ children, style = {}, hover = true, delay = 0, onClick, onMouseEnter, onMouseLeave }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean; delay?: number; onClick?: (e: React.MouseEvent<HTMLDivElement>) => void; onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void; onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          setHovered(true);
        }
        if (onMouseEnter) {
          onMouseEnter(e);
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          setHovered(false);
        }
        if (onMouseLeave) {
          onMouseLeave(e);
        }
      }}
      style={{
        background: COLORS.cardBg,
        borderRadius: "24px 18px 20px 26px",
        border: `2px solid ${COLORS.border}`,
        boxShadow: hovered ? `0 20px 40px ${COLORS.primary}15` : `0 8px 20px ${COLORS.primary}10`,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px) rotate(1deg)" : "translateY(0) rotate(0deg)",
        animation: `fadeInUp 0.8s ease-out ${delay}s both`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Subtle organic pattern overlay */}
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

// Flowing Section Title
function FlowingSectionTitle({ children, action }: { children: React.ReactNode; action?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.deepSage,
          margin: 0,
          fontFamily: "'Crimson Text', serif",
          letterSpacing: "-0.02em",
          position: "relative",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            bottom: -4,
            left: 0,
            width: 60,
            height: 3,
            background: `linear-gradient(90deg, ${COLORS.sage}, ${COLORS.lavender})`,
            borderRadius: "2px 8px 4px 6px",
          }}
        />
      </h2>
      {action && (
        <button
          style={{
            border: "none",
            borderRadius: "16px 12px 14px 18px",
            background: COLORS.mint,
            color: COLORS.deepSage,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
            transition: "all 0.3s ease",
            boxShadow: `0 4px 12px ${COLORS.sage}30`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 6px 16px ${COLORS.sage}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.sage}30`;
          }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

// Organic Button
function OrganicBtn({ children, primary, small, style = {}, onClick }: { children: React.ReactNode; primary?: boolean; small?: boolean; style?: React.CSSProperties; onClick?: () => void }) {
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
        padding: small ? "12px 20px" : "16px 24px",
        fontSize: small ? 14 : 16,
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

export default function PatientHomeScreen() {
  const router = useRouter();
  const [notifVisible, setNotifVisible] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [consultationSearch, setConsultationSearch] = useState("");
  const [consultationStatusFilter, setConsultationStatusFilter] = useState("All");
  const [consultationDateFrom, setConsultationDateFrom] = useState<string | null>(null);
  const [consultationDateTo, setConsultationDateTo] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Patient demo data removed. Live patient summary is derived from profile and appointments below.

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await fetch("/api/doctors");
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "Unable to load doctors.");
        }
        const data = await response.json();
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      } catch (error) {
        setDoctorsError(error instanceof Error ? error.message : "Unable to load doctors.");
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const apiUrl = `${window.location.origin}/api/appointments`;
        const response = await fetch(apiUrl, { credentials: "include" });
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "Unable to load appointments.");
        }
        const data = await response.json();
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } catch (error) {
        setAppointmentsError(error instanceof Error ? error.message : "Unable to load appointments.");
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadAppointments();
  }, [router]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setPatientLoading(true);
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(errorBody?.message || "Unable to load patient profile.");
        }

        const data = await response.json();
        setPatientProfile(data.user || null);
      } catch (error) {
        setPatientError(error instanceof Error ? error.message : "Unable to load patient profile.");
      } finally {
        setPatientLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const profileName = patientProfile?.fullName ?? "Patient";

  const upcomingAppointments = appointments.filter((appt) => appt.status.toLowerCase() !== "completed" && appt.status.toLowerCase() !== "done");
  const nextAppointment = upcomingAppointments.length ? upcomingAppointments[0] : null;
  const completedConsultations = appointments.filter((appt) => appt.status.toLowerCase() === "completed" || appt.status.toLowerCase() === "done");

  // Derive latest vitals and a small patient summary from live appointments/profile
  const latestVitalsAppointment = appointments
    .slice()
    .sort((a, b) => (Number(b.scheduledAt || 0) - Number(a.scheduledAt || 0)))
    .find((a) => a.bloodPressure || a.weight || a.temperature) || null;

  const patientSummary = {
    bloodGroup: (patientProfile as any)?.bloodGroup || "Unknown",
    height: (patientProfile as any)?.height || (latestVitalsAppointment as any)?.height || "Unknown",
    weight: (latestVitalsAppointment as any)?.weight || (patientProfile as any)?.weight || "Unknown",
    medicines: completedConsultations.reduce((acc, c) => acc + (Array.isArray((c as any).medicines) ? (c as any).medicines.length : 0), 0),
  };

  // Derive notifications from upcoming appointments and recent consultations (real data only)
  const notifications: Notification[] = [];
  upcomingAppointments.slice(0, 4).forEach((appt, i) => {
    const timeText = appt.date ? appt.date : "Upcoming";
    notifications.push({ id: 100 + i, type: "appointment", icon: "📅", title: `Upcoming: ${appt.doctor}`, desc: `${appt.spec} • ${appt.time || "TBD"}`, time: timeText, color: COLORS.sky, bg: COLORS.mint });
  });
  completedConsultations.slice(0, 4).forEach((c, i) => {
    const idx = 200 + i;
    notifications.push({ id: idx, type: "consultation", icon: "🩺", title: `Consulted: ${c.doctor}`, desc: `${c.diagnosis || "Summary not available"}`, time: c.date || "Recent", color: COLORS.lavender, bg: COLORS.peach });
  });

  const quickActions = [
    { icon: "🌱", label: "Book Appointment", desc: "Schedule a visit", color: COLORS.sky, bg: COLORS.mint, route: "/appointment-booking" },
    { icon: "📖", label: "Medical History", desc: "Past records", color: COLORS.lavender, bg: COLORS.peach, route: "/medical-records" },
    { icon: "💐", label: "Prescriptions", desc: "Current & past Rx", color: COLORS.coral, bg: COLORS.sky, route: "/medical-records" },
    { icon: "🌿", label: "Lab Reports", desc: "Test results", color: COLORS.sage, bg: COLORS.cream, route: "/medical-records" },
    { icon: "🔐", label: "Login", desc: "Access your account", color: COLORS.deepSage, bg: COLORS.mint, route: "/login" },
    { icon: "�🚨", label: "Emergency Help", desc: "Urgent care", color: COLORS.deepSage, bg: COLORS.mint, route: "#" },
    { icon: "💳", label: "Payments", desc: "Bills & invoices", color: COLORS.softNavy, bg: COLORS.peach, route: "#" },
  ];

  const navItems = [
    { icon: "🏠", label: "Home" },
    { icon: "📅", label: "Appointments" },
    { icon: "🧪", label: "Reports" },
    { icon: "👤", label: "Profile" },
  ];

  const specializations = [
    "All",
    ...Array.from(new Set(doctors.map((doc) => doc.specialization || ""))).filter(Boolean),
  ];

  function formatShortDate(d?: string | number | null) {
    if (!d) return "";
    const dt = typeof d === "number" ? new Date(d) : new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString();
  }

  const filtered = doctors.filter((doc) =>
    (filter === "All" || doc.specialization === filter) &&
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
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
          background: ${COLORS.cream}; 
        }
        ::-webkit-scrollbar-thumb { 
          background: ${COLORS.primary}; 
          border-radius: 20px; 
        }
        
        input:focus, textarea:focus { 
          outline: none; 
          border-color: ${COLORS.primary} !important; 
          box-shadow: 0 0 0 4px ${COLORS.mint}80 !important; 
        }
        
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
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
        
        @keyframes waveFlow {
          0% { transform: translateX(-100%) translateY(0); }
          100% { transform: translateX(100%) translateY(-20px); }
        }
        
        .floating-leaf {
          animation: gentleFloat 8s ease-in-out infinite;
        }
        
        .wave-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: -1;
        }
        
        .wave {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(45deg, ${COLORS.mint}40, ${COLORS.sky}30);
          border-radius: 50%;
          animation: waveFlow 20s linear infinite;
        }
        
        .wave:nth-child(1) {
          top: -50%;
          left: -50%;
          animation-delay: 0s;
        }
        
        .wave:nth-child(2) {
          top: -30%;
          left: -30%;
          animation-delay: -10s;
          background: linear-gradient(45deg, ${COLORS.lavender}30, ${COLORS.peach}40);
        }
      `}</style>

      <div style={{ minHeight: "100vh", position: "relative" }}>
        {/* Animated Background Waves */}
        <div className="wave-bg">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div style={{ position: "absolute", top: "10%", right: "8%", zIndex: -1 }}>
          <div className="floating-leaf" style={{ fontSize: "3rem", opacity: 0.3 }}>🌿</div>
        </div>
        <div style={{ position: "absolute", top: "60%", left: "5%", zIndex: -1 }}>
          <div className="floating-leaf" style={{ fontSize: "2.5rem", opacity: 0.2, animationDelay: "2s" }}>🌸</div>
        </div>
        <div style={{ position: "absolute", bottom: "20%", right: "12%", zIndex: -1 }}>
          <div className="floating-leaf" style={{ fontSize: "2rem", opacity: 0.25, animationDelay: "4s" }}>🍃</div>
        </div>

        <nav style={{ 
          position: "sticky", 
          top: 0, 
          zIndex: 50, 
          background: `rgba(248, 250, 252, 0.95)`, 
          backdropFilter: "blur(20px)", 
          borderBottom: `2px solid ${COLORS.border}`,
          borderRadius: "0 0 24px 18px"
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "20px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ 
                width: 50, 
                height: 50, 
                borderRadius: "25px 20px 22px 28px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, 
                color: "white", 
                fontSize: 22,
                boxShadow: `0 6px 16px ${COLORS.primary}40`
              }}>
                🌱
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Crimson Text', serif" }}>BloomCare</div>
                <div style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Patient Sanctuary</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 12, 
                padding: "12px 18px", 
                borderRadius: "16px 14px 18px 20px", 
                background: COLORS.cream, 
                border: `2px solid ${COLORS.border}`,
                boxShadow: `0 4px 12px ${COLORS.sage}20`
              }}>
                <span style={{ fontSize: 18 }}>🌿</span>
                <span style={{ fontSize: 14, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{today}</span>
              </div>
              <button
                onClick={() => setNotifVisible((prev) => !prev)}
                style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: "20px 16px 18px 22px", 
                  border: "none", 
                  background: notifVisible ? COLORS.mint : COLORS.border, 
                  cursor: "pointer", 
                  display: "grid", 
                  placeItems: "center", 
                  fontSize: 20,
                  transition: "all 0.3s ease",
                  boxShadow: notifVisible ? `0 6px 16px ${COLORS.sage}40` : "none"
                }}
              >
                🔔
              </button>
            </div>
          </div>
        </nav>

        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px 140px", position: "relative" }}>
          {/* Hero Welcome Section */}
          <section style={{ marginBottom: 48 }}>
            <OrganicCard 
              style={{ 
                padding: "48px 40px", 
                position: "relative", 
                overflow: "hidden", 
                background: `linear-gradient(135deg, ${COLORS.deepSage} 0%, ${COLORS.softNavy} 100%)`, 
                color: "white",
                borderRadius: "28px 20px 24px 32px"
              }} 
              hover={false}
            >
              {/* Decorative elements */}
              <div style={{ 
                position: "absolute", 
                width: 180, 
                height: 180, 
                borderRadius: "50% 40% 45% 55%", 
                background: `linear-gradient(45deg, ${COLORS.mint}60, ${COLORS.sky}40)`, 
                top: -40, 
                right: -40,
                animation: "gentleFloat 10s ease-in-out infinite"
              }} />
              <div style={{ 
                position: "absolute", 
                width: 120, 
                height: 120, 
                borderRadius: "40% 50% 35% 45%", 
                background: `linear-gradient(45deg, ${COLORS.lavender}50, ${COLORS.peach}40)`, 
                bottom: -30, 
                left: -30,
                animation: "gentleFloat 12s ease-in-out infinite reverse"
              }} />
              
              <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
                <OrganicAvatar name={profileName} size={90} fontSize={32} />
                <div>
                  <h1 style={{ 
                    fontSize: 40, 
                    fontWeight: 700, 
                    lineHeight: 1.1, 
                    marginBottom: 16,
                    fontFamily: "'Crimson Text', serif",
                    letterSpacing: "-0.02em"
                  }}>
                    Welcome back, {profileName} 🌱
                  </h1>
                  <p style={{ 
                    maxWidth: 550, 
                    fontSize: 16, 
                    color: "rgba(255,255,255,0.9)", 
                    marginBottom: 24,
                    fontFamily: "'Nunito', sans-serif",
                    lineHeight: 1.6
                  }}>
                    Your health sanctuary awaits. Nurture your well-being with personalized care and gentle guidance.
                  </p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <OrganicBtn primary onClick={() => router.push("/appointment-booking")}>Book Appointment</OrganicBtn>
                    <OrganicBtn style={{ 
                      background: "rgba(255,255,255,0.15)", 
                      color: "white", 
                      border: "2px solid rgba(255,255,255,0.3)",
                      backdropFilter: "blur(10px)"
                    }} onClick={() => router.push("/medical-records")}>
                      View Records
                    </OrganicBtn>
                  </div>
                </div>
              </div>
            </OrganicCard>
          </section>

          {patientError ? (
            <OrganicCard style={{ padding: 24, marginBottom: 32, borderColor: COLORS.error }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.error, fontFamily: "'Nunito', sans-serif" }}>
                Could not load your profile
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                {patientError}
              </p>
            </OrganicCard>
          ) : null}

          {patientProfile ? (
            <OrganicCard style={{ padding: 28, marginBottom: 32 }} delay={0.1}>
              <FlowingSectionTitle>Your Health Profile</FlowingSectionTitle>
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Full Name</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>{patientProfile.fullName}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Username</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>{patientProfile.username}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Email</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>{patientProfile.email}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Phone</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>{patientProfile.phoneNumber}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Nunito', sans-serif" }}>Role</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>{patientProfile.role}</span>
                </div>
              </div>
            </OrganicCard>
          ) : patientLoading ? (
            <OrganicCard style={{ padding: 24, marginBottom: 32 }}>
              <p style={{ fontSize: 14, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Loading your patient profile...</p>
            </OrganicCard>
          ) : null}

          {/* Quick Actions */}
          <section style={{ marginBottom: 48 }}>
            <FlowingSectionTitle>Nurture Your Health</FlowingSectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {quickActions.map((action, index) => (
                <OrganicCard 
                  key={index} 
                  style={{ 
                    padding: 24, 
                    borderLeft: `4px solid ${action.color}`,
                    background: action.bg,
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }} 
                  delay={index * 0.1}
                  onClick={() => {
                    if (action.route && action.route !== "#") {
                      router.push(action.route);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = "translateY(-4px) rotate(1deg) scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = "translateY(0) rotate(0deg) scale(1)";
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 16, textAlign: "center" }}>{action.icon}</div>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 700, 
                    color: COLORS.deepSage, 
                    marginBottom: 8,
                    fontFamily: "'Crimson Text', serif",
                    textAlign: "center"
                  }}>
                    {action.label}
                  </div>
                  <div style={{ 
                    fontSize: 14, 
                    color: COLORS.textLight,
                    fontFamily: "'Nunito', sans-serif",
                    textAlign: "center"
                  }}>
                    {action.desc}
                  </div>
                </OrganicCard>
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 32 }}>
              {/* Upcoming Appointments (list) */}
              <OrganicCard style={{ padding: 24 }}>
                <FlowingSectionTitle>Upcoming Appointments</FlowingSectionTitle>
                {appointmentsLoading ? (
                  <p style={{ color: COLORS.textLight }}>Loading your upcoming appointments...</p>
                ) : upcomingAppointments.length === 0 ? (
                  <p style={{ color: COLORS.textLight }}>No upcoming appointments. Book a visit to get started.</p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {upcomingAppointments.map((appt) => (
                      <div key={appt.id} style={{ display: "flex", gap: 12, padding: 14, borderRadius: 14, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, alignItems: "center" }}>
                        <OrganicAvatar name={appt.doctor} size={56} fontSize={18} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 800, color: COLORS.deepSage }}>{appt.doctor}</div>
                              <div style={{ fontSize: 13, color: COLORS.textLight }}>{appt.spec}</div>
                            </div>
                            <div style={{ textAlign: "right", fontSize: 13, color: COLORS.textLight }}>
                              <div>📅 {appt.date}</div>
                              <div>Token: {appt.token || "N/A"}</div>
                            </div>
                          </div>
                          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <FlowingBadge color={appt.status === "Pending" ? COLORS.coral : COLORS.softNavy} bg={appt.status === "Pending" ? COLORS.peach : COLORS.mint}>{appt.status}</FlowingBadge>
                            {appt.paymentRequired && <FlowingBadge color={COLORS.coral} bg={COLORS.peach}>Payment Required</FlowingBadge>}
                            <OrganicBtn small onClick={() => router.push(`/appointments/${appt.id}`)} style={{ minWidth: 120 }}>View</OrganicBtn>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </OrganicCard>

              <OrganicCard style={{ padding: 28 }} delay={0.25}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <FlowingSectionTitle>Completed Consultations</FlowingSectionTitle>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input value={consultationSearch} onChange={(e) => setConsultationSearch(e.target.value)} placeholder="Search consultations..." style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}`, width: 220 }} />
                    <select value={consultationStatusFilter} onChange={(e) => setConsultationStatusFilter(e.target.value)} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                      <option>All</option>
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>In Consultation</option>
                      <option>Completed</option>
                    </select>
                    <input type="date" onChange={(e) => setConsultationDateFrom(e.target.value || null)} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}` }} />
                    <input type="date" onChange={(e) => setConsultationDateTo(e.target.value || null)} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.border}` }} />
                  </div>
                </div>
                {appointmentsLoading ? (
                  <p style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Loading completed appointments...</p>
                ) : completedConsultations.length === 0 ? (
                  <p style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>No completed consultations yet. Your notes and prescriptions will appear here after your visit.</p>
                ) : (
                  <div style={{ display: "grid", gap: 16 }}>
                    {completedConsultations
                      .filter((appointment) => {
                        const q = consultationSearch.trim().toLowerCase();
                        if (q) {
                          const hay = `${appointment.doctor} ${appointment.diagnosis || ""} ${appointment.prescription || ""} ${appointment.consultationNotes || ""}`.toLowerCase();
                          if (!hay.includes(q)) return false;
                        }
                        if (consultationStatusFilter && consultationStatusFilter !== "All") {
                          if ((appointment.status || "").toLowerCase() !== consultationStatusFilter.toLowerCase()) return false;
                        }
                        if (consultationDateFrom) {
                          const from = new Date(consultationDateFrom);
                          const apd = new Date(appointment.date || appointment.scheduledAt || Date.now());
                          if (apd < from) return false;
                        }
                        if (consultationDateTo) {
                          const to = new Date(consultationDateTo);
                          const apd = new Date(appointment.date || appointment.scheduledAt || Date.now());
                          if (apd > to) return false;
                        }
                        return true;
                      })
                      .slice(0, 6)
                      .map((appointment, index) => (
                        <div key={appointment.id} style={{ padding: 18, borderRadius: 20, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                            <div>
                              <h3 style={{ fontSize: 16, margin: 0, color: COLORS.deepSage, fontFamily: "'Crimson Text', serif" }}>{appointment.doctor}</h3>
                              <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>{appointment.date} • {appointment.time}</p>
                            </div>
                            <FlowingBadge color={COLORS.sage} bg={COLORS.mint}>{appointment.status || 'Completed'}</FlowingBadge>
                          </div>
                          <div style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 8 }}>
                            This consultation is completed. View the report for medication and note details.
                          </div>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                            {appointment.deliveryConfirmed ? (
                              <FlowingBadge color={COLORS.softNavy} bg={COLORS.mint}>Delivered</FlowingBadge>
                            ) : (
                              <FlowingBadge color={COLORS.coral} bg={COLORS.peach}>Awaiting Pharmacy</FlowingBadge>
                            )}
                            <OrganicBtn
                              primary
                              small
                              style={{ minWidth: 160 }}
                              onClick={() => window.open(`/api/reports/consultation/${appointment.id}`, "_blank")}
                            >
                              Download Report
                            </OrganicBtn>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </OrganicCard>

              {/* Health Summary */}
              <OrganicCard style={{ padding: 28 }} delay={0.3}>
                <FlowingSectionTitle>Wellness Overview</FlowingSectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
                  {[
                    { label: "Blood Type", value: patientSummary.bloodGroup, icon: "🩸", color: COLORS.coral, bg: COLORS.peach },
                    { label: "Medications", value: `${patientSummary.medicines} active`, icon: "🌿", color: COLORS.lavender, bg: COLORS.sky },
                    { label: "Height", value: patientSummary.height, icon: "📏", color: COLORS.sage, bg: COLORS.mint },
                    { label: "Weight", value: patientSummary.weight, icon: "⚖️", color: COLORS.softNavy, bg: COLORS.cream },
                  ].map((item, index) => (
                    <div 
                      key={item.label} 
                      style={{ 
                        display: "flex", 
                        gap: 16, 
                        alignItems: "center", 
                        padding: 16, 
                        borderRadius: "18px 14px 16px 20px", 
                        background: item.bg,
                        animation: `fadeInUp 0.6s ease-out ${0.4 + index * 0.1}s both`
                      }}
                    >
                      <div style={{ 
                        width: 52, 
                        height: 52, 
                        borderRadius: "20px 16px 18px 22px", 
                        display: "grid", 
                        placeItems: "center", 
                        background: "white", 
                        fontSize: 22,
                        boxShadow: `0 4px 12px ${item.color}30`
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: 12, 
                          textTransform: "uppercase", 
                          color: COLORS.textLight, 
                          fontWeight: 700, 
                          marginBottom: 6,
                          fontFamily: "'Nunito', sans-serif"
                        }}>
                          {item.label}
                        </div>
                        <div style={{ 
                          fontSize: 18, 
                          fontWeight: 800, 
                          color: item.color,
                          fontFamily: "'Crimson Text', serif"
                        }}>
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </OrganicCard>
            </div>

            <div style={{ display: "grid", gap: 32 }}>
              {/* Medical Records */}
              <OrganicCard style={{ padding: 28 }} delay={0.35}>
                <FlowingSectionTitle>Medical Records</FlowingSectionTitle>
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 8 }}>Recent Vitals</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {appointments
                        .slice()
                        .filter((a) => a.bloodPressure || a.weight || a.temperature)
                        .slice(-5)
                        .reverse()
                        .map((a) => (
                          <div key={`${a.id}-vitals`} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderRadius: 12, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                            <div style={{ fontWeight: 700, color: COLORS.deepSage }}>{a.date || formatShortDate(a.scheduledAt) || 'Unknown'}</div>
                            <div style={{ color: COLORS.textLight, fontSize: 13 }}>
                              {a.bloodPressure ? `BP: ${a.bloodPressure} ` : ""}
                              {a.weight ? `• Wt: ${a.weight}kg ` : ""}
                              {a.temperature ? `• Temp: ${a.temperature}°C` : ""}
                            </div>
                          </div>
                        ))}
                      {appointments.filter((a) => a.bloodPressure || a.weight || a.temperature).length === 0 && (
                        <div style={{ color: COLORS.textLight }}>No vitals recorded yet.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 8 }}>Consultation Reports</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {completedConsultations.slice(0, 6).map((c) => (
                        <div key={`${c.id}-report`} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderRadius: 12, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                          <div>
                            <div style={{ fontWeight: 800, color: COLORS.deepSage }}>{c.doctor}</div>
                            <div style={{ fontSize: 13, color: COLORS.textLight }}>{c.date || formatShortDate(c.scheduledAt)}</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <OrganicBtn small onClick={() => window.open(`/api/reports/consultation/${c.id}`, "_blank")}>Download</OrganicBtn>
                          </div>
                        </div>
                      ))}
                      {completedConsultations.length === 0 && <div style={{ color: COLORS.textLight }}>No reports available yet.</div>}
                    </div>
                  </div>
                </div>
              </OrganicCard>

              {/* Recent Notifications */}
              <OrganicCard style={{ padding: 28 }} delay={0.4}>
                <FlowingSectionTitle>Gentle Reminders</FlowingSectionTitle>
                <div style={{ display: "grid", gap: 14 }}>
                  {notifications.slice(0, 4).map((item, index) => (
                    <OrganicCard 
                      key={item.id} 
                      style={{ 
                        padding: 18, 
                        borderRadius: "16px 12px 14px 18px", 
                        background: item.bg, 
                        border: `2px solid ${item.color}40`,
                        animation: `fadeInUp 0.5s ease-out ${0.5 + index * 0.1}s both`
                      }} 
                      hover={false}
                    >
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: "18px 14px 16px 20px", 
                          background: "white", 
                          display: "grid", 
                          placeItems: "center", 
                          fontSize: 22,
                          boxShadow: `0 4px 12px ${item.color}30`
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: 15, 
                            fontWeight: 700, 
                            color: COLORS.deepSage,
                            fontFamily: "'Crimson Text', serif"
                          }}>
                            {item.title}
                          </div>
                          <div style={{ 
                            fontSize: 13, 
                            color: COLORS.text, 
                            marginBottom: 8,
                            fontFamily: "'Nunito', sans-serif"
                          }}>
                            {item.desc}
                          </div>
                          <div style={{ 
                            fontSize: 12, 
                            color: COLORS.textLight,
                            fontFamily: "'Nunito', sans-serif"
                          }}>
                            {item.time}
                          </div>
                        </div>
                      </div>
                    </OrganicCard>
                  ))}
                </div>
              </OrganicCard>

              {/* Book a Doctor */}
              <OrganicCard style={{ padding: 28 }} delay={0.5}>
                <FlowingSectionTitle>Find Care</FlowingSectionTitle>
                <div style={{ display: "grid", gap: 16 }}>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search healers..."
                    style={{ 
                      width: "100%", 
                      padding: "16px 18px", 
                      borderRadius: "16px 12px 14px 18px", 
                      border: `2px solid ${COLORS.border}`, 
                      fontSize: 15, 
                      background: COLORS.cream,
                      fontFamily: "'Nunito', sans-serif"
                    }}
                  />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {specializations.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => setFilter(spec)}
                        style={{
                          borderRadius: "14px 10px 12px 16px",
                          border: "none",
                          padding: "10px 16px",
                          background: filter === spec ? COLORS.sage : COLORS.cream,
                          color: filter === spec ? COLORS.cream : COLORS.deepSage,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'Nunito', sans-serif",
                          boxShadow: filter === spec ? `0 4px 12px ${COLORS.sage}40` : `0 2px 8px ${COLORS.sage}20`,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gap: 14 }}>
                    {doctorsLoading ? (
                      <div style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Loading registered doctors...</div>
                    ) : doctorsError ? (
                      <div style={{ color: COLORS.error, fontFamily: "'Nunito', sans-serif" }}>{doctorsError}</div>
                    ) : filtered.length === 0 ? (
                      <div style={{ color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>No registered doctors found matching your search.</div>
                    ) : (
                      filtered.slice(0, 3).map((doctor, index) => {
                        const status = doctor.status || (doctor.available ? "Available" : "Busy");
                        const available = status === "Available";
                        const availabilityText = doctor.availability?.length
                          ? doctor.availability.join(" • ")
                          : "No availability set";

                        return (
                          <div 
                            key={doctor.id} 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: 18, 
                              padding: 18, 
                              borderRadius: "18px 14px 16px 20px", 
                              border: `2px solid ${COLORS.border}`, 
                              background: COLORS.cream,
                              animation: `fadeInUp 0.5s ease-out ${0.6 + index * 0.1}s both`
                            }}
                          >
                            <OrganicAvatar name={doctor.name} size={54} fontSize={18} />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: 700, 
                                color: COLORS.deepSage,
                                fontFamily: "'Crimson Text', serif"
                              }}>
                                {doctor.name}
                              </div>
                              <div style={{
                                fontSize: 13,
                                color: COLORS.textLight,
                                fontFamily: "'Nunito', sans-serif",
                                marginBottom: 8,
                              }}>
                                {doctor.specialization}
                              </div>
                              <div style={{
                                fontSize: 12,
                                color: COLORS.textLight,
                                fontFamily: "'Nunito', sans-serif",
                              }}>
                                {doctor.hospital || "Independent Clinic"}
                              </div>
                              <div style={{
                                marginTop: 6,
                                fontSize: 12,
                                color: COLORS.textLight,
                                fontFamily: "'Nunito', sans-serif",
                              }}>
                                {availabilityText}
                              </div>
                            </div>
                            <FlowingBadge 
                              color={available ? COLORS.sage : COLORS.softNavy} 
                              bg={available ? COLORS.mint : COLORS.peach}
                            >
                              {available ? "Available" : "Busy"}
                            </FlowingBadge>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <OrganicBtn primary onClick={() => router.push("/appointment-booking")}>Explore All Healers</OrganicBtn>
                </div>
              </OrganicCard>
            </div>
          </div>
        </main>

        {/* Footer navigation moved to root layout (BottomNav) */}

        {/* Organic Notifications Modal */}
        {notifVisible && (
          <div
            onClick={() => setNotifVisible(false)}
            style={{ 
              position: "fixed", 
              inset: 0, 
              background: `rgba(168, 218, 220, 0.4)`, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              padding: 32, 
              zIndex: 60,
              backdropFilter: "blur(8px)"
            }}
          >
            <OrganicCard
              onClick={(e) => e.stopPropagation()}
              style={{ 
                width: "100%", 
                maxWidth: 540, 
                borderRadius: "24px 18px 20px 26px", 
                background: COLORS.cream, 
                padding: 32, 
                boxShadow: `0 24px 64px ${COLORS.sage}30`,
                animation: "fadeInUp 0.5s ease-out"
              }}
              hover={false}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ 
                  fontSize: 24, 
                  fontWeight: 700, 
                  color: COLORS.deepSage, 
                  margin: 0,
                  fontFamily: "'Crimson Text', serif"
                }}>
                  Gentle Reminders
                </h2>
                <button 
                  onClick={() => setNotifVisible(false)} 
                  style={{ 
                    border: "none", 
                    background: COLORS.border, 
                    borderRadius: "14px 10px 12px 16px", 
                    width: 38, 
                    height: 38, 
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 16,
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotate(90deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(0deg)";
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {notifications.map((item, index) => (
                  <OrganicCard 
                    key={item.id} 
                    style={{ 
                      borderRadius: "16px 12px 14px 18px", 
                      padding: 20, 
                      background: item.bg, 
                      border: `2px solid ${item.color}40`,
                      animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                    }}
                    hover={false}
                  >
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: "18px 14px 16px 20px", 
                        background: "white", 
                        display: "grid", 
                        placeItems: "center", 
                        fontSize: 22,
                        boxShadow: `0 4px 12px ${item.color}30`
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ 
                          fontSize: 16, 
                          fontWeight: 700, 
                          color: COLORS.deepSage,
                          fontFamily: "'Crimson Text', serif"
                        }}>
                          {item.title}
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          color: COLORS.text, 
                          marginTop: 6,
                          fontFamily: "'Nunito', sans-serif"
                        }}>
                          {item.desc}
                        </div>
                        <div style={{ 
                          fontSize: 12, 
                          color: COLORS.textLight, 
                          marginTop: 8,
                          fontFamily: "'Nunito', sans-serif"
                        }}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </OrganicCard>
                ))}
              </div>
            </OrganicCard>
          </div>
        )}
      </div>
    </>
  );
}
