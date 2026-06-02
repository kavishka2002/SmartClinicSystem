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

type Doctor = {
  id?: string;
  name?: string;
  fullName?: string;
  username?: string;
  specialization?: string;
  category?: string;
  status?: string;
  available?: boolean;
  fee?: string;
  consultationFee?: string;
  exp?: string;
  experience?: string;
  paymentRequired?: boolean;
  availableDays?: string[];
  availability?: string[];
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
  room?: string;
  maxPatientsPerDay?: number;
  isActive?: boolean;
};

type AppointmentPayload = {
  doctorId?: string;
  doctorName?: string;
  spec?: string;
  date: string;
  time: string;
  queueNumber?: number;
  room: string;
  notes?: string;
  paymentRequired: boolean;
  fee: string;
  patientName: string;
  patientContact: string;
};

// Organic Card Component
function OrganicCard({ children, style = {}, hover = true, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean; delay?: number }) {
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
        animation: `fadeInUp 0.8s ease-out ${delay}s both`,
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

// Organic Button
function OrganicBtn({ children, primary, small, style = {}, onClick, disabled, loading }: { children: React.ReactNode; primary?: boolean; small?: boolean; style?: React.CSSProperties; onClick?: () => void; disabled?: boolean; loading?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: primary ? `0 8px 20px ${COLORS.primary}40` : `0 4px 12px ${COLORS.primary}20`,
        fontFamily: "'Nunito', sans-serif",
        transform: hover && !disabled ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      {loading ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : null}
      {children}
    </button>
  );
}

// Section Title
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: COLORS.deepSage,
        margin: "0 0 24px 0",
        fontFamily: "'Crimson Text', serif",
        letterSpacing: "-0.02em",
        position: "relative",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: -8,
          left: 0,
          width: 40,
          height: 3,
          background: `linear-gradient(90deg, ${COLORS.sage}, ${COLORS.lavender})`,
          borderRadius: "2px 8px 4px 6px",
        }}
      />
    </h2>
  );
}

// Input Component
function OrganicInput({ label, type = "text", placeholder, value, onChange, inputProps = {} }: { label?: string; type?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; inputProps?: React.InputHTMLAttributes<HTMLInputElement>; }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.deepSage, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input"
        {...inputProps}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = COLORS.sage;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.mint}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = COLORS.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function isDateValidForDoctor(dateString: string, availableDays: string[] = [], isActive = true) {
  const selectedDate = new Date(dateString);
  if (!dateString || Number.isNaN(selectedDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  if (selectedDate < today) return false;
  if (!isActive) return false;
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  return availableDays.map((day) => day.toLowerCase()).includes(dayName);
}

function buildTimeSlots(startTime: string, endTime: string, intervalMinutes = 30) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  if ([startHour, startMinute, endHour, endMinute].some((part) => Number.isNaN(part))) {
    return [];
  }

  const slots = [];
  const start = new Date();
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  while (start < end) {
    const next = new Date(start);
    next.setMinutes(next.getMinutes() + intervalMinutes);
    if (next > end) break;
    slots.push(`${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} - ${next.getHours().toString().padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`);
    start.setMinutes(start.getMinutes() + intervalMinutes);
  }

  return slots;
}

export default function AppointmentBookingUI() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [predictedQueueNumber, setPredictedQueueNumber] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [consultType, setConsultType] = useState("in-person");
  const [currentQueueInfo, setCurrentQueueInfo] = useState<{
    nextQueueNumber: number | null;
    queueLength: number;
    busyTokens: number[];
    remainingSlots?: number;
    capacity?: number;
    futureAvailability?: {
      date: string;
      day: string;
      status: string;
      bookedCount: number;
      remainingSlots: number;
    }[];
  }>({ nextQueueNumber: null, queueLength: 0, busyTokens: [], remainingSlots: undefined, capacity: undefined, futureAvailability: [] });
  const [queueInfoLoading, setQueueInfoLoading] = useState(false);
  const [queueInfoError, setQueueInfoError] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);
  const doctorAvailableDays = selectedDoctorObj?.availableDays || selectedDoctorObj?.availability || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const doctorStartTime = selectedDoctorObj?.startTime || "08:00";
  const doctorEndTime = selectedDoctorObj?.endTime || "16:00";
  const doctorRoomNumber = selectedDoctorObj?.roomNumber || selectedDoctorObj?.room || "03";
  const doctorCapacity = selectedDoctorObj?.maxPatientsPerDay ?? 30;
  const doctorIsActive = selectedDoctorObj?.isActive ?? true;

  const todayISO = new Date().toISOString().slice(0, 10);
  const isSelectedDateValid = selectedDate ? isDateValidForDoctor(selectedDate, doctorAvailableDays, doctorIsActive) : false;
  const upcomingSlots = buildTimeSlots(doctorStartTime, doctorEndTime, 30);

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
      } catch (err) {
        console.error(err);
        setDoctorsError(err instanceof Error ? err.message : String(err));
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    const loadQueueNumbers = async () => {
      if (!selectedDoctor || !selectedDate) {
        setCurrentQueueInfo({ nextQueueNumber: null, queueLength: 0, busyTokens: [], remainingSlots: undefined, capacity: undefined, futureAvailability: [] });
        setPredictedQueueNumber(null);
        return;
      }

      try {
        setQueueInfoLoading(true);
        setQueueInfoError(null);
        const response = await fetch(`${window.location.origin}/api/appointments/queue?doctorId=${encodeURIComponent(selectedDoctor)}&date=${encodeURIComponent(selectedDate)}`, { credentials: "include" });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.message || "Unable to load queue details.");
        }
        const data = await response.json();
        const bestNext = Array.isArray(data.availableQueueNumbers) && data.availableQueueNumbers.length ? data.availableQueueNumbers[0] : null;
        setCurrentQueueInfo({
          nextQueueNumber: bestNext,
          queueLength: Number(data.queueLength) || 0,
          busyTokens: Array.isArray(data.busyTokens) ? data.busyTokens : [],
          remainingSlots: typeof data.remainingSlots === "number" ? data.remainingSlots : undefined,
          capacity: typeof data.capacity === "number" ? data.capacity : undefined,
          futureAvailability: Array.isArray(data.futureAvailability) ? data.futureAvailability : [],
        });
        setPredictedQueueNumber(bestNext);
      } catch (err) {
        setQueueInfoError(err instanceof Error ? err.message : String(err));
      } finally {
        setQueueInfoLoading(false);
      }
    };

    loadQueueNumbers();
  }, [selectedDoctor, selectedDate]);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBg} 100%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Nunito:wght@400;500;600;700&display=swap');
        
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

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .floating-leaf {
          animation: gentleFloat 6s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Decorative Elements */}
      <div style={{ position: "fixed", top: "5%", right: "8%", zIndex: -1 }}>
        <div className="floating-leaf" style={{ fontSize: "4rem", opacity: 0.2 }}>🌿</div>
      </div>
      <div style={{ position: "fixed", bottom: "15%", left: "5%", zIndex: -1 }}>
        <div className="floating-leaf" style={{ fontSize: "3rem", opacity: 0.15, animationDelay: "2s" }}>🌸</div>
      </div>
      <div style={{ position: "fixed", bottom: "10%", right: "10%", zIndex: -1 }}>
        <div className="floating-leaf" style={{ fontSize: "2.5rem", opacity: 0.2, animationDelay: "4s" }}>🍃</div>
      </div>

      {/* Header removed for distraction-free booking */}
      <div style={{ height: 0 }} />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px 80px", position: "relative" }}>
        <div className="responsive-three" style={{ marginBottom: 48 }}>
          {/* Doctor Selection */}
          <div className="span-2">
            <SectionTitle>Select Your Doctor</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {doctorsLoading ? (
                <div style={{ gridColumn: "1 / -1", color: COLORS.textLight }}>Loading doctors...</div>
              ) : doctorsError ? (
                <div style={{ gridColumn: "1 / -1", color: COLORS.error }}>{doctorsError}</div>
              ) : doctors.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", color: COLORS.textLight }}>No registered doctors found.</div>
              ) : (
                doctors.map((doctor: Doctor, index: number) => {
                  const name = doctor.name || doctor.fullName || doctor.username || `Doctor ${index + 1}`;
                  const status = doctor.status || (doctor.available ? "Available" : "Busy");
                  const fee = doctor.fee || doctor.consultationFee || "$0";

                  return (
                    <OrganicCard
                      key={doctor.id || index}
                      delay={index * 0.1}
                      hover={true}
                      style={{
                        padding: 20,
                        cursor: "pointer",
                        border: selectedDoctor === (doctor.id || name) ? `3px solid ${COLORS.sage}` : `2px solid ${COLORS.border}`,
                        background: selectedDoctor === (doctor.id || name) ? COLORS.mint : COLORS.cream,
                      }}
                    >
                      <div onClick={() => {
                        setSelectedDoctor(doctor.id || name);
                        setPredictedQueueNumber(null);
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>
                              {name}
                            </div>
                            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4, fontFamily: "'Nunito', sans-serif" }}>
                              {doctor.specialization || doctor.category || "General"
                              }
                            </div>
                          </div>
                          <span style={{ fontSize: 28 }}>👨‍⚕️</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                          <div style={{ fontSize: 11, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>
                            {doctor.exp || doctor.experience || "-"}
                          </div>
                          <div>
                            <FlowingBadge color={status === "Available" ? COLORS.sage : COLORS.softNavy} bg={status === "Available" ? COLORS.mint : COLORS.peach}>
                              {status}
                            </FlowingBadge>
                          </div>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>
                            {fee}
                          </div>
                          <FlowingBadge
                            color={doctor.paymentRequired ? COLORS.coral : COLORS.deepSage}
                            bg={doctor.paymentRequired ? COLORS.peach : COLORS.mint}
                          >
                            {doctor.paymentRequired ? "Payment Required" : "Free"}
                          </FlowingBadge>
                        </div>
                      </div>
                    </OrganicCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <OrganicCard style={{ padding: 24, position: "sticky", top: 100 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.deepSage, marginBottom: 20, fontFamily: "'Crimson Text', serif" }}>
                Booking Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>
                    Doctor
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>
                    {selectedDoctorObj ? selectedDoctorObj.name || selectedDoctorObj.fullName || selectedDoctorObj.username : "Not selected"}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>
                    Date
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>
                    {selectedDate || "Not selected"}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>
                    Queue Number
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, fontFamily: "'Nunito', sans-serif" }}>
                    {predictedQueueNumber ? `#${predictedQueueNumber}` : "Not selected"}
                  </div>
                </div>
                <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textLight }}>Room</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage }}>{doctorRoomNumber}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textLight }}>Schedule</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage }}>{`${doctorStartTime} - ${doctorEndTime}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textLight }}>Days Open</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage }}>{doctorAvailableDays.join(", ")}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textLight }}>Daily Capacity</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage }}>{doctorCapacity} slots</span>
                  </div>
                  {currentQueueInfo.remainingSlots !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: COLORS.textLight }}>Remaining slots</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: currentQueueInfo.remainingSlots > 0 ? COLORS.sage : COLORS.coral }}>{currentQueueInfo.remainingSlots}</span>
                    </div>
                  )}
                </div>
                <div style={{ borderTop: `2px solid ${COLORS.border}`, paddingTop: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>
                      Consultation Fee
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.coral, fontFamily: "'Nunito', sans-serif" }}>
                      {selectedDoctorObj?.fee || selectedDoctorObj?.consultationFee || "$0"}
                    </div>
                  </div>
                </div>
                {selectedDoctorObj && (
                  <FlowingBadge
                    color={selectedDoctorObj.paymentRequired ? COLORS.coral : COLORS.deepSage}
                    bg={selectedDoctorObj.paymentRequired ? COLORS.peach : COLORS.mint}
                  >
                    {selectedDoctorObj.paymentRequired ? "🔒 Payment Required" : "✓ Free Booking"}
                  </FlowingBadge>
                )}
                {selectedDoctorObj && upcomingSlots.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
                      Example time slots
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      {upcomingSlots.slice(0, 4).map((slot) => (
                        <div key={slot} style={{ padding: 12, borderRadius: 14, background: COLORS.cream, border: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textLight }}>
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </OrganicCard>
          </div>
        </div>

        {/* Appointment Details */}
        <OrganicCard style={{ padding: 32, marginBottom: 32 }}>
          <SectionTitle>Appointment Details</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <OrganicInput
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              inputProps={{ min: todayISO }}
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.deepSage, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
                Next Queue Token
              </label>
              <div style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px 12px 14px 18px",
                border: `2px solid ${COLORS.border}`,
                background: COLORS.cream,
                color: COLORS.text,
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                minHeight: 56,
                display: "flex",
                alignItems: "center",
              }}>
                {queueInfoLoading
                  ? "Fetching queue estimate..."
                  : predictedQueueNumber
                  ? `#${predictedQueueNumber}`
                  : "Select a doctor and date to reserve the next available queue number"}
              </div>
              {queueInfoLoading && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.textLight }}>
                  Loading queue details...
                </div>
              )}
              {queueInfoError && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.error }}>
                  {queueInfoError}
                </div>
              )}
              {!queueInfoLoading && selectedDate && selectedDoctor && predictedQueueNumber === null && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.coral }}>
                  No queue numbers are available for the selected doctor and date.
                </div>
              )}
              {selectedDoctor && !doctorIsActive && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.coral }}>
                  Selected doctor is currently unavailable for booking.
                </div>
              )}
              {selectedDoctor && selectedDate && !isSelectedDateValid && doctorIsActive && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.coral }}>
                  {`Doctor is not available on ${new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })}. Please choose another available day.`}
                </div>
              )}
              {!queueInfoLoading && currentQueueInfo.remainingSlots === 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLORS.coral }}>
                  This date is fully booked. Please choose another day or doctor.
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.5 }}>
                Queue length: {currentQueueInfo.queueLength}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.5 }}>
                Busy tokens: {currentQueueInfo.busyTokens.slice(0, 5).map((num) => `#${num}`).join(", ") || "None"}
              </div>
            </div>
            {Array.isArray(currentQueueInfo.futureAvailability) && currentQueueInfo.futureAvailability.length > 0 && (
              <div style={{ marginTop: 20, padding: 20, borderRadius: 18, background: COLORS.mint, border: `1px dashed ${COLORS.sage}` }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, marginBottom: 10 }}>Upcoming Availability</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                  {currentQueueInfo.futureAvailability.slice(0, 4).map((slot) => (
                    <div key={slot.date} style={{ padding: 12, borderRadius: 16, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: 12, color: COLORS.textLight }}>{slot.day}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage }}>{slot.date}</div>
                      <div style={{ fontSize: 12, color: slot.status === "Available" ? COLORS.sage : slot.status === "Fully Booked" ? COLORS.coral : COLORS.softNavy, marginTop: 6 }}>
                        {slot.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.deepSage, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
              Consultation Type
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                <input
                  type="radio"
                  name="consult"
                  value="in-person"
                  checked={consultType === "in-person"}
                  onChange={(e) => setConsultType(e.target.value)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, color: COLORS.text }}>In-Person</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                <input
                  type="radio"
                  name="consult"
                  value="online"
                  checked={consultType === "online"}
                  onChange={(e) => setConsultType(e.target.value)}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, color: COLORS.text }}>Online</span>
              </label>
            </div>
          </div>
        </OrganicCard>

        {/* Patient Information */}
        <OrganicCard style={{ padding: 32, marginBottom: 32 }}>
          <SectionTitle>Your Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <OrganicInput label="Full Name" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <OrganicInput label="Phone Number" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div style={{ gridColumn: "1 / 3" }}>
              <OrganicInput label="Email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / 3" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: COLORS.deepSage, marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
                Reason for Visit
              </label>
              <textarea
                placeholder="Describe your symptoms or reason for appointment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 14,
                  border: `2px solid ${COLORS.border}`,
                  borderRadius: "16px 12px 14px 18px",
                  background: COLORS.cream,
                  color: COLORS.text,
                  fontFamily: "'Nunito', sans-serif",
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.sage;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.mint}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        </OrganicCard>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <OrganicBtn primary={true} onClick={() => router.back()} disabled={booking}>
            ← Go Back
          </OrganicBtn>
          <OrganicBtn primary={true} onClick={async () => {
            setBooking(true);
            try {
              if (!selectedDoctor || !selectedDate || !fullName || !email) {
                alert("Please fill in all required fields.");
                setBooking(false);
                return;
              }

              if (!doctorIsActive) {
                alert("Selected doctor is currently unavailable.");
                setBooking(false);
                return;
              }

              if (!isSelectedDateValid) {
                alert("Selected date is not available for this doctor. Please choose another date.");
                setBooking(false);
                return;
              }

              if (currentQueueInfo.remainingSlots !== undefined && currentQueueInfo.remainingSlots <= 0) {
                alert("This doctor has no remaining slots on the chosen date. Please select another date.");
                setBooking(false);
                return;
              }

              if (!predictedQueueNumber) {
                alert("Unable to reserve a queue token for the selected doctor and date. Please choose another date.");
                setBooking(false);
                return;
              }

              const doctor = doctors.find((d) => d.id === selectedDoctor);
              const requiresPayment = !!doctor?.paymentRequired;
              const feeValue = doctor?.fee || doctor?.consultationFee || "$0";

              const payload: AppointmentPayload = {
                doctorId: doctor?.id,
                doctorName: doctor?.name || doctor?.fullName || doctor?.username || "",
                spec: doctor?.specialization || doctor?.category || "",
                date: selectedDate,
                time: `Queue #${predictedQueueNumber}`,
                room: doctorRoomNumber,
                notes: reason,
                paymentRequired: requiresPayment,
                fee: feeValue,
                patientName: fullName,
                patientContact: phone || "",
              };

              if (requiresPayment) {
                sessionStorage.setItem("smartclinic-booking-draft", JSON.stringify(payload));
                router.push("/payment");
                setBooking(false);
                return;
              }

              const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, paymentCompleted: false }),
              });

              if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message || 'Unable to book appointment.');
              }

              alert('Appointment booked successfully!');
              router.push('/patient-home');
            } catch (err) {
              console.error(err);
              alert(err instanceof Error ? err.message : String(err));
            } finally {
              setBooking(false);
            }
          }} loading={booking} disabled={booking}>
            {booking ? "Booking..." : "Confirm Appointment"}
          </OrganicBtn>
        </div>
      </main>
    </div>
  );
}
