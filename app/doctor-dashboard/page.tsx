"use client";
import React, { useEffect, useState } from "react";
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

const inputAreaStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  borderRadius: "18px",
  border: `2px solid ${COLORS.border}`,
  background: COLORS.background,
  color: COLORS.text,
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  resize: "vertical",
};

const inputBasicStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "18px",
  border: `2px solid ${COLORS.border}`,
  background: COLORS.background,
  color: COLORS.text,
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
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
function OrganicBtn({ children, primary, small, disabled, style = {}, onClick }: { children: React.ReactNode; primary?: boolean; small?: boolean; disabled?: boolean; style?: React.CSSProperties; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  const disabledStyle = disabled ? { cursor: "not-allowed", opacity: 0.65 } : {};
  return (
    <button
      type="button"
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
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
        ...disabledStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Status Badge
function normalizeStatusLabel(status: string) {
  const lower = status.toLowerCase();
  if (lower.includes("in consultation") || lower.includes("with doctor") || lower.includes("ongoing") || lower.includes("started") || lower.includes("under consultation")) {
    return "In Progress";
  }
  if (lower.includes("completed") || lower.includes("done") || lower.includes("closed") || lower.includes("finished")) {
    return "Completed";
  }
  if (lower.includes("cancelled") || lower.includes("canceled") || lower.includes("no-show") || lower.includes("missed") || lower.includes("absent")) {
    return "Cancelled";
  }
  if (lower.includes("confirmed")) {
    return "Confirmed";
  }
  return "Pending";
}

function isAppointmentCompleted(status: string) {
  const normalized = normalizeStatusLabel(status);
  return normalized === "Completed";
}

function StatusBadge({ status }: { status: string }) {
  const normalizedLabel = normalizeStatusLabel(status);
  const statusKey = normalizedLabel.toLowerCase();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "confirmed":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "in progress":
        return { bg: "#DBEAFE", text: "#2563EB" };
      case "completed":
        return { bg: "#D1FAE5", text: "#065F46" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B" };
      default:
        return { bg: COLORS.background, text: COLORS.text };
    }
  };

  const colors = getStatusColor(statusKey);

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "12px",
        background: colors.bg,
        color: colors.text,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {status}
    </span>
  );
}

type Appointment = {
  id: string;
  patient: string;
  patientContact: string;
  date: string;
  time: string;
  room: string;
  status: string;
  notes: string;
  paid: boolean;
  paymentRequired: boolean;
  fee: string;
  queueNumber?: number | null;
  token?: string;
  spec: string;
  doctor: string;
  doctorUid: string;
  patientUid: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  medicines?: Array<{ id: string; name: string; dosage?: string }>;
  consultationNotes?: string;
  scheduledAt: number;
  diseaseDescription?: string;
  clinicalObservations?: string;
  bloodPressure?: string;
  weight?: string;
  temperature?: string;
  prescriptionId?: string;
  patientName?: string;
  doctorName?: string;
  consultationStartedAt?: string | number | Date | null;
  consultationCompletedAt?: string | number | Date | null;
};

type Medicine = {
  id: string;
  name: string;
  dosage?: string;
  brand?: string;
  price?: string;
  qty?: number;
  stock?: number;
};

type PrescriptionItem = {
  id: string;
  name: string;
  dosage?: string;
  frequency: number;
  duration: number;
  totalQuantity: number;
  specialNotes: string;
  usage: string;
  availableStock: number;
};

const parseAppointmentDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  const parts = dateString.split(/[\/\.\-]/).map((part) => part.trim());
  if (parts.length === 3) {
    const [first, second, third] = parts;
    if (first.length === 4) {
      return new Date(`${first}-${second.padStart(2, "0")}-${third.padStart(2, "0")}`);
    }
    return new Date(`${third}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`);
  }
  return null;
};

const isAppointmentOnSelectedDate = (appointment: Appointment, selectedDateKey: string): boolean => {
  if (!selectedDateKey) return true;

  if (typeof appointment.scheduledAt === "number" && appointment.scheduledAt > 0) {
    const appointmentDate = new Date(appointment.scheduledAt);
    return appointmentDate.toISOString().slice(0, 10) === selectedDateKey;
  }

  const parsedDate = parseAppointmentDate(appointment.date);
  return parsedDate ? parsedDate.toISOString().slice(0, 10) === selectedDateKey : false;
};

type DoctorTab =
  | "Dashboard"
  | "Patients"
  | "Appointments"
  | "Consultation"
  | "Prescriptions"
  | "Reports"
  | "Availability"
  | "Notifications";

export default function DoctorDashboardUI() {
  const [activeTab, setActiveTab] = useState<DoctorTab>("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled">("All");
  const [availabilityStatus, setAvailabilityStatus] = useState<"Available" | "Busy">("Available");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editableDate, setEditableDate] = useState("");
  const [editableTime, setEditableTime] = useState("");
  const [editableRoom, setEditableRoom] = useState("");
  const [editableStatus, setEditableStatus] = useState<Appointment["status"]>("Pending");
  const [activeAppointmentCategory, setActiveAppointmentCategory] = useState<"All" | "Upcoming" | "In Consultation" | "Completed" | "Cancelled">("All");
  const [symptoms, setSymptoms] = useState("");
  const [diseaseDescription, setDiseaseDescription] = useState("");
  const [additionalObservations, setAdditionalObservations] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<PrescriptionItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicineResults, setMedicineResults] = useState<Medicine[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState<string | null>(null);
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  interface DoctorProfile {
    uid: string;
    fullName: string;
    username: string;
    phoneNumber: string;
    phoneNumberNormalized: string;
    email: string;
    role: string;
    specialization?: string;
    availability?: string[];
    status?: string;
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.message || "Unable to load profile.");
        }
        const data = await response.json();
        setDoctorProfile(data.user || null);
        if (data.user?.status === "Available" || data.user?.status === "Busy") {
          setAvailabilityStatus(data.user.status);
        }
      } catch (error) {
        setProfileError(error instanceof Error ? error.message : "Unable to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [router]);

  const loadAppointments = async (forceLoading = false) => {
    const shouldShowLoading = forceLoading || appointments.length === 0;
    try {
      if (shouldShowLoading) {
        setAppointmentsLoading(true);
      }
      const response = await fetch(`/api/appointments?date=${encodeURIComponent(selectedDate)}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Unable to load appointments.");
      }
      const data = await response.json();
      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (error) {
      setAppointmentsError(error instanceof Error ? error.message : "Unable to load appointments.");
    } finally {
      if (shouldShowLoading) {
        setAppointmentsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAppointments(true);
  }, [selectedDate]);

  const updateDoctorAvailability = async (status: "Available" | "Busy") => {
    setStatusError(null);
    setStatusSaving(true);

    try {
      const response = await fetch("/api/doctors/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Unable to update availability status.");
      }

      setAvailabilityStatus(status);
      setDoctorProfile((prev) => (prev ? { ...prev, status } : prev));
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Unable to update availability status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const doctorName = doctorProfile?.fullName ?? "Doctor";
  const doctorSpecialization = doctorProfile?.specialization ?? "General Practitioner";

  const selectedAppointment = appointments.find((appt) => appt.id === selectedAppointmentId) ?? null;

  const loadMedicineOptions = async (query: string) => {
    setMedicineError(null);
    setMedicineLoading(true);

    try {
      const endpoint = `/api/pharmacy/stock?q=${encodeURIComponent(query || "")}`;
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load medicines.");
      }

      const rawStock = Array.isArray(data.stock) ? data.stock : [];
      const availableStockItems = rawStock
        .map((item: any) => ({
          ...item,
          stock: Number(item.qty ?? item.stock ?? 0),
        }))
        .filter((item: any) => Number(item.stock) > 0);

      setMedicineResults(availableStockItems);
    } catch (error) {
      setMedicineError(error instanceof Error ? error.message : "Unable to load medicines.");
      setMedicineResults([]);
    } finally {
      setMedicineLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadMedicineOptions(medicineSearch);
  }, [medicineSearch]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!selectedAppointment) {
      setSymptoms("");
      setDiagnosis("");
      setConsultationNotes("");
      setPrescriptionText("");
      setSelectedMedicines([]);
      return;
    }

    setSymptoms(selectedAppointment.symptoms || "");
    setDiseaseDescription(selectedAppointment.diseaseDescription || "");
    setAdditionalObservations(selectedAppointment.clinicalObservations || "");
    setBloodPressure(selectedAppointment.bloodPressure || "");
    setWeight(selectedAppointment.weight || "");
    setTemperature(selectedAppointment.temperature || "");
    setDiagnosis(selectedAppointment.diagnosis || "");
    setConsultationNotes(selectedAppointment.consultationNotes || "");
    setPrescriptionText(selectedAppointment.prescription || "");
    setSelectedMedicines(
      Array.isArray(selectedAppointment.medicines)
        ? selectedAppointment.medicines.map((med: any) => {
            const frequency = Number(med.frequency ?? 1);
            const duration = Number(med.duration ?? 1);
            const totalQuantity = Math.max(1, frequency * duration);
            return {
              id: med.id || med.name || med,
              name: med.name || med,
              dosage: med.dosage || "",
              frequency,
              duration,
              totalQuantity,
              specialNotes: med.specialNotes || "",
              usage: med.usage || "",
              availableStock: Number(med.availableStock ?? med.stock ?? med.qty ?? 0),
            };
          })
        : []
    );

    setEditableDate(selectedAppointment.date || "");
    setEditableTime(selectedAppointment.time || "");
    setEditableRoom(selectedAppointment.room || "");
    setEditableStatus(selectedAppointment.status || "Pending");
  }, [selectedAppointment]);

  const computeTotalQuantity = (item: PrescriptionItem) => Math.max(1, Number(item.frequency || 1) * Number(item.duration || 1));

  const selectAppointment = (appointment: Appointment) => {
    setSelectedAppointmentId(appointment.id);
    setShowModal(true);
  };

  const updateAppointmentList = (updatedAppointment: Appointment) => {
    setAppointments((prev) => prev.map((appt) => (appt.id === updatedAppointment.id ? updatedAppointment : appt)));
    setSelectedAppointmentId(updatedAppointment.id);
  };

  const saveAppointment = async (status?: string) => {
    if (!selectedAppointment) {
      setAppointmentError("Select an appointment before saving consultation details.");
      return;
    }

    const invalidMedicine = selectedMedicines.find((item) => item.totalQuantity > item.availableStock);
    if (invalidMedicine) {
      setAppointmentError(`Requested quantity for ${invalidMedicine.name} exceeds available stock.`);
      return;
    }

    setAppointmentError(null);
    setAppointmentSaving(true);

    try {
          const finalStatus = status || editableStatus;
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          date: editableDate,
          time: editableTime,
          room: editableRoom,
          symptoms,
          diseaseDescription,
          clinicalObservations: additionalObservations,
          bloodPressure,
          weight,
          temperature,
          diagnosis,
          consultationNotes,
          prescription: prescriptionText,
          medicines: selectedMedicines,
          prescriptionId: selectedAppointment.prescriptionId,
          patientName: selectedAppointment.patient || selectedAppointment.patientName || "",
          doctorName: selectedAppointment.doctor || selectedAppointment.doctorName || "",
          doctorSpecialization: selectedAppointment.spec || (selectedAppointment as any).doctorSpecialization || "",
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "Unable to save consultation.");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Unable to save consultation.");
      }

      const updated = data.appointment;
      const mergedAppointment = {
        ...selectedAppointment,
        ...updated,
        status: updated.status || selectedAppointment.status,
        symptoms: updated.symptoms || symptoms,
        diagnosis: updated.diagnosis || diagnosis,
        consultationNotes: updated.consultationNotes || consultationNotes,
        prescription: updated.prescription || prescriptionText,
        medicines: updated.medicines || selectedMedicines,
      };

      if (!isAppointmentOnSelectedDate(mergedAppointment, selectedDateKey)) {
        setAppointments((prev) => prev.filter((appt) => appt.id !== mergedAppointment.id));
      } else {
        updateAppointmentList(mergedAppointment);
      }

      if (updated.status !== selectedAppointment.status || updated.date !== selectedAppointment.date || updated.time !== selectedAppointment.time) {
        await loadAppointments();
      }
    } catch (error) {
      setAppointmentError(error instanceof Error ? error.message : "Unable to save consultation.");
    } finally {
      setAppointmentSaving(false);
    }
  };

  const addMedicineToPrescription = (medicine: Medicine) => {
    const availableStock = Number(medicine.stock ?? medicine.qty ?? 0);
    if (availableStock <= 0) return;
    if (selectedMedicines.some((med) => med.id === medicine.id)) return;

    const newMedicine: PrescriptionItem = {
      id: medicine.id,
      name: medicine.name,
      dosage: medicine.dosage || "",
      frequency: 1,
      duration: 1,
      totalQuantity: 1,
      specialNotes: "",
      usage: "",
      availableStock,
    };

    setSelectedMedicines((prev) => [...prev, newMedicine]);
    setPrescriptionText((prev) =>
      prev ? `${prev}\n${medicine.name}${medicine.dosage ? ` - ${medicine.dosage}` : ""}` : `${medicine.name}${medicine.dosage ? ` - ${medicine.dosage}` : ""}`
    );
  };

  const removeMedicineFromPrescription = (id: string) => {
    setSelectedMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  const currentlySelectedStatus = selectedAppointment ? normalizeStatusLabel(selectedAppointment.status) : "No Appointment Selected";
  const selectedDateKey = selectedDate;
  const selectedDateLabel = selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }) : "All Dates";

  const appointmentsForDate = appointments
    .filter((appointment) => activeAppointmentCategory === "Completed" ? true : isAppointmentOnSelectedDate(appointment, selectedDateKey))
    .sort((a, b) => (Number(a.scheduledAt || 0) - Number(b.scheduledAt || 0)));

  const appointmentsInScope = statusFilter === "All"
    ? appointmentsForDate
    : appointmentsForDate.filter((appointment) => normalizeStatusLabel(appointment.status) === statusFilter);

  const waitingAppointments = appointmentsInScope.filter((appointment) => {
    const status = appointment.status.toLowerCase();
    return (
      status === "waiting" ||
      status === "pending" ||
      status === "confirmed" ||
      status === "scheduled" ||
      status === "booked" ||
      status === "new"
    );
  });

  const inConsultationAppointments = appointmentsInScope.filter((appointment) => {
    const status = appointment.status.toLowerCase();
    return (
      status === "in consultation" ||
      status === "with doctor" ||
      status === "ongoing" ||
      status === "started" ||
      status === "under consultation"
    );
  });

  const completedAppointments = appointmentsInScope.filter((appointment) => {
    const status = appointment.status.toLowerCase();
    return (
      status === "completed" ||
      status === "done" ||
      status === "closed" ||
      status === "finished"
    );
  });

  const cancelledAppointments = appointmentsInScope.filter((appointment) => {
    const status = appointment.status.toLowerCase();
    return (
      status === "cancelled" ||
      status === "canceled" ||
      status === "no-show" ||
      status === "missed" ||
      status === "absent"
    );
  });

  const nextQueueAppointment = waitingAppointments.length > 0 ? waitingAppointments[0] : null;

  const appointmentCategoryCounts = {
    All: appointmentsForDate.length,
    Upcoming: waitingAppointments.length,
    "In Consultation": inConsultationAppointments.length,
    Completed: completedAppointments.length,
    Cancelled: cancelledAppointments.length,
  } as const;

  const displayedAppointments =
    activeAppointmentCategory === "All"
      ? appointmentsForDate
      : activeAppointmentCategory === "Upcoming"
      ? waitingAppointments
      : activeAppointmentCategory === "In Consultation"
      ? inConsultationAppointments
      : activeAppointmentCategory === "Completed"
      ? completedAppointments
      : cancelledAppointments;

  const dashboardStats = [
    {
      title: "Total Appointments",
      value: appointmentsForDate.length,
      color: COLORS.primary,
      bg: COLORS.mint,
    },
    {
      title: "Waiting Queue",
      value: waitingAppointments.length,
      color: COLORS.secondary,
      bg: "#D1FAE5",
    },
    {
      title: "In Consultation",
      value: inConsultationAppointments.length,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
    {
      title: "Completed",
      value: completedAppointments.length,
      color: COLORS.secondary,
      bg: "#D1FAE5",
    },
  ];

  const sidebarItems: DoctorTab[] = [
    "Dashboard",
    "Patients",
    "Appointments",
    "Consultation",
    "Prescriptions",
    "Reports",
    "Availability",
    "Notifications",
  ];

  const searchTermNormalized = searchTerm.trim().toLowerCase();

  const matchesSearch = (appointment: Appointment) => {
    if (!searchTermNormalized) return true;
    return (
      appointment.patient.toLowerCase().includes(searchTermNormalized) ||
      appointment.patientContact.toLowerCase().includes(searchTermNormalized) ||
      appointment.status.toLowerCase().includes(searchTermNormalized) ||
      (appointment.token ?? "").toLowerCase().includes(searchTermNormalized) ||
      appointment.date.toLowerCase().includes(searchTermNormalized) ||
      appointment.time.toLowerCase().includes(searchTermNormalized)
    );
  };

  const uniquePatients = Array.from(
    new Map(
      appointments
        .filter(matchesSearch)
        .map((appointment) => [appointment.patient, appointment]),
    ).values(),
  );

  const filteredAppointments = displayedAppointments.filter(matchesSearch);
  const filteredUpcomingAppointments = waitingAppointments.filter(matchesSearch);
  const filteredInConsultationAppointments = inConsultationAppointments.filter(matchesSearch);
  const filteredCompletedAppointments = completedAppointments.filter(matchesSearch);
  const filteredCancelledAppointments = cancelledAppointments.filter(matchesSearch);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div style={{ display: "grid", gap: 24 }}>
            <OrganicCard style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                    Dashboard Overview
                  </h2>
                  <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                    Quick access to your appointments, patient queue, and clinic status.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <OrganicBtn onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>Today</OrganicBtn>
                  <OrganicBtn onClick={() => setSelectedDate("")}>All Dates</OrganicBtn>
                </div>
              </div>

              <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {dashboardStats.map((stat) => (
                  <OrganicCard key={stat.title} style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 18, background: stat.bg, display: "grid", placeItems: "center", color: stat.color, fontSize: 18, fontWeight: 700 }}>
                        {stat.value}
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: COLORS.textLight }}>{stat.title}</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{stat.value}</p>
                      </div>
                    </div>
                  </OrganicCard>
                ))}
              </div>
            </OrganicCard>

            <OrganicCard style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>Upcoming Queue</h3>
                  <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 4 }}>Patients waiting for the next consultation.</p>
                </div>
                <span style={{ color: COLORS.textLight }}>{filteredUpcomingAppointments.length} waiting</span>
              </div>

              {filteredUpcomingAppointments.length === 0 ? (
                <p style={{ marginTop: 20, color: COLORS.textLight }}>No patients are currently waiting. Check the appointments tab to manage the schedule.</p>
              ) : (
                <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                  {filteredUpcomingAppointments.slice(0, 4).map((appointment) => (
                    <OrganicCard key={appointment.id} style={{ padding: 18, background: COLORS.background }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{appointment.patient}</div>
                          <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>{appointment.date} • {appointment.time}</div>
                        </div>
                        <OrganicBtn onClick={() => selectAppointment(appointment)}>Consult</OrganicBtn>
                      </div>
                    </OrganicCard>
                  ))}
                </div>
              )}
            </OrganicCard>
          </div>
        );

      case "Patients":
        return (
          <>
            <OrganicCard style={{ padding: 28, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                    Patient Roster
                  </h2>
                  <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                    Monitor patients in the queue, review recent consultations, and access patient summaries quickly.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: 260,
                    padding: "14px 18px",
                    borderRadius: 18,
                    border: `2px solid ${COLORS.border}`,
                    background: COLORS.background,
                    fontSize: 14,
                    outline: "none",
                    color: COLORS.text,
                  }}
                />
              </div>
            </OrganicCard>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {uniquePatients.length === 0 ? (
                <OrganicCard style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: COLORS.textLight }}>No matching patients found. Try a different search term.</p>
                </OrganicCard>
              ) : uniquePatients.map((patient, index) => (
                <OrganicCard key={`${patient.patient}-${index}`} style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{patient.patient}</h3>
                      <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>{patient.patientContact}</p>
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.textLight, background: COLORS.cardBg, padding: "8px 12px", borderRadius: 999 }}>
                      {patient.status}
                    </span>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ padding: 16, borderRadius: 20, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                      <p style={{ fontSize: 12, color: COLORS.textLight }}>Last appointment</p>
                      <strong style={{ fontSize: 14, color: COLORS.text }}>{patient.date} • {patient.time}</strong>
                    </div>
                    <OrganicBtn onClick={() => selectAppointment(patient)}>
                      Open consultation
                    </OrganicBtn>
                  </div>
                </OrganicCard>
              ))}
            </div>
          </>
        );

      case "Appointments":
        return (
          <OrganicCard style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                  Appointment Schedule
                </h2>
                <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
                  Review today’s bookings, manage the queue, and keep the clinic moving smoothly.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <OrganicBtn onClick={() => {
                  const previous = new Date(selectedDate || new Date().toISOString().slice(0, 10));
                  previous.setDate(previous.getDate() - 1);
                  setSelectedDate(previous.toISOString().slice(0, 10));
                }}>
                  Previous Day
                </OrganicBtn>
                <OrganicBtn onClick={() => {
                  const next = new Date(selectedDate || new Date().toISOString().slice(0, 10));
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(next.toISOString().slice(0, 10));
                }}>
                  Next Day
                </OrganicBtn>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px",
                    border: `2px solid ${COLORS.border}`,
                    background: COLORS.background,
                    fontSize: 14,
                    outline: "none",
                    color: COLORS.text,
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {( ["All", "Upcoming", "In Consultation", "Completed", "Cancelled"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveAppointmentCategory(category)}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "10px 18px",
                    background: activeAppointmentCategory === category ? COLORS.primary : COLORS.background,
                    color: activeAppointmentCategory === category ? COLORS.cardBg : COLORS.text,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {category} ({appointmentCategoryCounts[category]})
                </button>
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, color: COLORS.textLight }}>Showing</p>
                <h3 style={{ marginTop: 6, fontSize: 20, color: COLORS.text }}>{appointmentsForDate.length} appointments</h3>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    minWidth: 260,
                    padding: "14px 18px",
                    borderRadius: 18,
                    border: `2px solid ${COLORS.border}`,
                    background: COLORS.background,
                    outline: "none",
                    color: COLORS.text,
                  }}
                />
                <OrganicBtn onClick={() => setSearchTerm("")}>Clear</OrganicBtn>
              </div>
            </div>

            <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
              {appointmentsLoading ? (
                <div style={{ color: COLORS.textLight }}>Loading appointments...</div>
              ) : filteredAppointments.length === 0 ? (
                <div style={{ color: COLORS.textLight, padding: 24, borderRadius: 20, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                  No appointments found for this filter.
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <OrganicCard key={appointment.id} style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{appointment.patient}</div>
                        <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>{appointment.date} • {appointment.time}</div>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ padding: "10px 14px", borderRadius: 16, background: COLORS.background, border: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textLight }}>
                          {normalizeStatusLabel(appointment.status)}
                        </span>
                        <OrganicBtn onClick={() => selectAppointment(appointment)}>
                          Consult
                        </OrganicBtn>
                      </div>
                    </div>
                  </OrganicCard>
                ))
              )}
            </div>
          </OrganicCard>
        );

      case "Consultation":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
            <OrganicCard style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Consultation Workspace</h2>
              <p style={{ marginTop: 10, fontSize: 14, color: COLORS.textLight }}>Open a patient record to review vitals, notes, and prescription details.</p>

              <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={{ fontSize: 12, color: COLORS.textLight }}>Selected Appointment</label>
                  <div style={{ padding: 20, borderRadius: 20, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                    {selectedAppointment ? (
                      <>
                        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{selectedAppointment.patient}</div>
                        <div style={{ marginTop: 8, color: COLORS.textLight }}>{selectedAppointment.date} • {selectedAppointment.time}</div>
                        <div style={{ marginTop: 8, color: COLORS.textLight }}>Status: {normalizeStatusLabel(selectedAppointment.status)}</div>
                      </>
                    ) : (
                      <span style={{ color: COLORS.textLight }}>Select an appointment from the Appointments tab to begin.</span>
                    )}
                  </div>
                </div>
                <OrganicBtn
                  primary
                  onClick={() => selectedAppointment && setShowModal(true)}
                  disabled={!selectedAppointment}
                  style={{ width: "100%", opacity: selectedAppointment ? 1 : 0.65, cursor: selectedAppointment ? "pointer" : "not-allowed" }}
                >
                  {selectedAppointment ? "Open Consultation Modal" : "Select Appointment to Open"}
                </OrganicBtn>
              </div>
            </OrganicCard>

            <OrganicCard style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Appointment Snapshot</h2>
              <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
                {selectedAppointment ? (
                  [
                    { label: "Room", value: selectedAppointment.room || "TBD" },
                    { label: "Patient Contact", value: selectedAppointment.patientContact },
                    { label: "Token", value: selectedAppointment.token || `T-${String(selectedAppointment.queueNumber || 0).padStart(3, "0")}` },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: 16, borderRadius: 20, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                      <p style={{ fontSize: 12, color: COLORS.textLight }}>{item.label}</p>
                      <p style={{ marginTop: 6, fontWeight: 700, color: COLORS.text }}>{item.value}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: COLORS.textLight }}>No appointment selected yet.</p>
                )}
              </div>
            </OrganicCard>
          </div>
        );

      case "Prescriptions":
        return (
          <OrganicCard style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>
                  Prescriptions
                </h2>
                <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8 }}>Review active patient prescriptions and prepare follow-up medication instructions.</p>
              </div>
              <OrganicBtn onClick={() => setPrescriptionText(selectedAppointment?.prescription || "")}>Refresh</OrganicBtn>
            </div>

            {selectedAppointment ? (
              <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gap: 12 }}>
                  <p style={{ fontSize: 12, color: COLORS.textLight }}>Selected patient</p>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{selectedAppointment.patient}</div>
                </div>
                <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>Prescription Notes</h3>
                  <p style={{ marginTop: 12, color: COLORS.textLight, lineHeight: 1.7 }}>{selectedAppointment.prescription || "No prescription notes available."}</p>
                </OrganicCard>
                <div style={{ display: "grid", gap: 16 }}>
                  {(selectedAppointment.medicines || []).length === 0 ? (
                    <div style={{ color: COLORS.textLight }}>No medicines added yet.</div>
                  ) : (
                    (selectedAppointment.medicines || []).map((medicine: any, index: number) => (
                      <OrganicCard key={index} style={{ padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{medicine.name}</div>
                            <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 6 }}>{medicine.dosage || "Dosage not set"}</div>
                          </div>
                          <span style={{ fontSize: 12, color: COLORS.textLight, background: COLORS.cardBg, padding: "8px 12px", borderRadius: 999 }}>{medicine.frequency || "Daily"}</span>
                        </div>
                      </OrganicCard>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: 24, borderRadius: 20, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                <p style={{ color: COLORS.textLight }}>Select a patient from the Appointments tab to view prescriptions.</p>
              </div>
            )}
          </OrganicCard>
        );

      case "Reports":
        return (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {dashboardStats.map((stat) => (
                <OrganicCard key={stat.title} style={{ padding: 24 }}>
                  <p style={{ fontSize: 12, color: COLORS.textLight }}>{stat.title}</p>
                  <p style={{ marginTop: 16, fontSize: 30, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                </OrganicCard>
              ))}
            </div>
            <OrganicCard style={{ padding: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Weekly Care Report</h2>
              <p style={{ marginTop: 12, color: COLORS.textLight }}>Keep an eye on patient throughput, consultation load, and completed cases for the week.</p>
              <div style={{ marginTop: 24, minHeight: 220, borderRadius: 28, background: COLORS.background, border: `1px solid ${COLORS.border}`, display: "grid", placeItems: "center" }}>
                <span style={{ color: COLORS.textLight }}>Chart preview coming soon</span>
              </div>
            </OrganicCard>
          </div>
        );

      case "Availability":
        return (
          <OrganicCard style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Manage Availability</h2>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8 }}>Set your clinic availability and update your on-duty status for the day.</p>
            <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <OrganicBtn primary onClick={() => updateDoctorAvailability("Available")} style={{ width: "100%" }}>Set Available</OrganicBtn>
                <OrganicBtn onClick={() => updateDoctorAvailability("Busy")} style={{ width: "100%" }}>Set Busy</OrganicBtn>
              </div>
              <div style={{ padding: 24, borderRadius: 24, background: COLORS.background, border: `1px solid ${COLORS.border}` }}>
                <p style={{ fontSize: 12, color: COLORS.textLight }}>Current status</p>
                <p style={{ marginTop: 12, fontSize: 22, fontWeight: 700, color: COLORS.text }}>{availabilityStatus}</p>
              </div>
              <OrganicBtn primary style={{ width: "100%" }}>{statusSaving ? "Saving..." : "Update availability"}</OrganicBtn>
            </div>
            {statusError ? (
              <p style={{ marginTop: 12, color: COLORS.error }}>{statusError}</p>
            ) : null}
          </OrganicCard>
        );

      case "Notifications":
        return (
          <OrganicCard style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Notifications</h2>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8 }}>Stay on top of urgent requests and new patient updates.</p>
            <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
              <div style={{ padding: 24, borderRadius: 24, background: "#FEF3C7", border: `1px solid ${COLORS.primary}22` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>New Lab Report</h3>
                <p style={{ marginTop: 8, color: COLORS.textLight }}>A patient lab report is ready for review. Open the consultation workspace to review details.</p>
              </div>
              <div style={{ padding: 24, borderRadius: 24, background: "#ECFDF5", border: `1px solid ${COLORS.secondary}22` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.secondary }}>Emergency Request</h3>
                <p style={{ marginTop: 8, color: COLORS.textLight }}>A priority patient has entered the queue. Check the appointments tab to respond immediately.</p>
              </div>
            </div>
          </OrganicCard>
        );

      default:
        return (
          <OrganicCard style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "'Crimson Text', serif" }}>Doctor Dashboard</h2>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8 }}>Select a section from the sidebar to manage your workflow.</p>
          </OrganicCard>
        );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.background} 0%, ${COLORS.cardBg} 100%)`, display: "flex" }}>
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
      `}</style>

      {/* Sidebar */}
      <aside className="hidden lg:flex" style={{
        flexDirection: "column",
        width: 288,
        background: COLORS.cardBg,
        borderRight: `2px solid ${COLORS.border}`,
        padding: 24,
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.primary,
            fontFamily: "'Crimson Text', serif"
          }}>
            Smart Clinic
          </h1>
          <p style={{
            fontSize: 14,
            color: COLORS.textLight,
            marginTop: 8,
            fontFamily: "'Nunito', sans-serif"
          }}>
            Doctor Panel
          </p>
        </div>

        <nav style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(item)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "16px 20px",
                borderRadius: "16px 12px 14px 18px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: activeTab === item ? COLORS.primary : "transparent",
                color: activeTab === item ? COLORS.cardBg : COLORS.text,
                border: activeTab === item ? "none" : `2px solid ${COLORS.border}`,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:p-10" style={{
        flex: 1,
        padding: "24px 32px",
        overflowY: "auto",
      }}>
        {/* Header */}
        <OrganicCard style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  boxShadow: `0 8px 24px ${COLORS.primary}30`,
                }}
              >
                👨‍⚕️
              </div>
              <div>
                <h1 style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: COLORS.text,
                  fontFamily: "'Crimson Text', serif"
                }}>
                  {loadingProfile ? "Welcome Back" : `Welcome Back, ${doctorName} 👋`}
                </h1>
                <p style={{
                  fontSize: 14,
                  color: COLORS.textLight,
                  marginTop: 4,
                  fontFamily: "'Nunito', sans-serif"
                }}>
                  {loadingProfile ? "Loading profile..." : `${doctorSpecialization} • ${new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <OrganicBtn primary style={{ padding: "12px 24px" }}>
                {doctorProfile ? `Status: ${availabilityStatus}` : "Available Today"}
              </OrganicBtn>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px 12px 14px 18px",
                  background: COLORS.background,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: `2px solid ${COLORS.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = COLORS.mint;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = COLORS.background;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                🔔
              </div>
            </div>
          </div>
        </OrganicCard>

        {profileError ? (
          <OrganicCard style={{ padding: 24, marginBottom: 32, borderColor: COLORS.error }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.error, fontFamily: "'Nunito', sans-serif" }}>
              Unable to load doctor profile
            </h2>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
              {profileError}
            </p>
          </OrganicCard>
        ) : null}

        {doctorProfile ? (
          <OrganicCard style={{ padding: 24, marginBottom: 32 }}>
            <h2 style={{
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: 12,
              fontFamily: "'Crimson Text', serif"
            }}>
              Your Profile
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 13, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Name</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{doctorProfile.fullName}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 13, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Specialization</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{doctorProfile.specialization || "Not specified"}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 13, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Email</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{doctorProfile.email}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 13, color: COLORS.textLight, fontFamily: "'Nunito', sans-serif" }}>Phone</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, fontFamily: "'Nunito', sans-serif" }}>{doctorProfile.phoneNumber}</p>
              </div>
            </div>
          </OrganicCard>
        ) : null}

        <div style={{ display: "grid", gap: 24 }}>
          {renderTabContent()}
        </div>
      </main>

      {showModal && selectedAppointment ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 1080, maxHeight: "90vh", overflowY: "auto", background: COLORS.cardBg, borderRadius: 28, boxShadow: "0 30px 80px rgba(15,23,42,0.25)", padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Consultation for {selectedAppointment.patient}</h2>
                <p style={{ fontSize: 14, color: COLORS.textLight }}>{selectedAppointment.date} • {selectedAppointment.time} • Token {selectedAppointment.token || `T-${String(selectedAppointment.queueNumber || 0).padStart(3, "0")}`}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ border: "none", background: "transparent", color: COLORS.textLight, fontSize: 26, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Consultation Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, color: COLORS.textLight }}>Patient</span>
                    <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 700 }}>{selectedAppointment.patient}</span>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, color: COLORS.textLight }}>Contact</span>
                    <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 700 }}>{selectedAppointment.patientContact}</span>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 12, color: COLORS.textLight }}>Queue</span>
                    <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 700 }}>{selectedAppointment.token || `T-${String(selectedAppointment.queueNumber || 0).padStart(3, "0")}`}</span>
                  </div>
                </div>
              </OrganicCard>

              <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Appointment Details</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      type="text"
                      value={editableDate}
                      onChange={(e) => setEditableDate(e.target.value)}
                      placeholder="Date"
                      style={inputBasicStyle}
                    />
                    <input
                      type="text"
                      value={editableTime}
                      onChange={(e) => setEditableTime(e.target.value)}
                      placeholder="Time"
                      style={inputBasicStyle}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      type="text"
                      value={editableRoom}
                      onChange={(e) => setEditableRoom(e.target.value)}
                      placeholder="Room"
                      style={inputBasicStyle}
                    />
                    <select
                      value={editableStatus}
                      onChange={(e) => setEditableStatus(e.target.value as Appointment["status"])}
                      style={inputBasicStyle}
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Consultation">In Consultation</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No-show">No-show</option>
                    </select>
                  </div>
                </div>
              </OrganicCard>

              <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Clinical Notes</h3>
                <div style={{ display: "grid", gap: 16 }}>
                  <textarea rows={3} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Symptoms / primary complaint" style={inputAreaStyle} />
                  <textarea rows={3} value={diseaseDescription} onChange={(e) => setDiseaseDescription(e.target.value)} placeholder="Disease description" style={inputAreaStyle} />
                  <textarea rows={3} value={consultationNotes} onChange={(e) => setConsultationNotes(e.target.value)} placeholder="Medical history / notes" style={inputAreaStyle} />
                  <textarea rows={3} value={additionalObservations} onChange={(e) => setAdditionalObservations(e.target.value)} placeholder="Additional observations" style={inputAreaStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                    <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="Blood pressure" style={inputBasicStyle} />
                    <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" style={inputBasicStyle} />
                    <input type="text" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="Temperature" style={inputBasicStyle} />
                  </div>
                </div>
              </OrganicCard>

              <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Pharmacy Prescription</h3>
                <div style={{ display: "grid", gap: 16 }}>
                  <textarea rows={4} value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)} placeholder="Prescription summary and instructions" style={inputAreaStyle} />
                  <div style={{ display: "grid", gap: 12 }}>
                    <input type="text" value={medicineSearch} onChange={(e) => setMedicineSearch(e.target.value)} placeholder="Search pharmacy medicines" style={inputBasicStyle} />
                    {medicineError ? <div style={{ color: COLORS.error, fontSize: 13 }}>{medicineError}</div> : null}
                    <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 10 }}>
                      {medicineLoading ? (
                        <div style={{ color: COLORS.textLight }}>Searching medicines…</div>
                      ) : medicineResults.length === 0 ? (
                        <div style={{ color: COLORS.textLight }}>No medicines found.</div>
                      ) : (
                        medicineResults.slice(0, 8).map((medicine) => (
                          <div key={medicine.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "12px 16px", borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.cardBg }}>
                            <div>
                              <strong style={{ fontSize: 14, color: COLORS.text }}>{medicine.name}</strong>
                              <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                                {medicine.dosage || medicine.brand || "Medicine"}
                                {medicine.stock !== undefined ? ` • Stock: ${medicine.stock}` : ""}
                              </div>
                            </div>
                            <OrganicBtn small disabled={Number(medicine.stock ?? 0) <= 0} onClick={() => addMedicineToPrescription(medicine)}>
                              Add
                            </OrganicBtn>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </OrganicCard>

              <OrganicCard style={{ padding: 24, background: COLORS.background }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Selected Medicines</h3>
                {selectedMedicines.length === 0 ? (
                  <div style={{ color: COLORS.textLight }}>No medicines have been added yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {selectedMedicines.map((medicine) => (
                      <div key={medicine.id} style={{ display: "grid", gap: 10, padding: "12px 14px", borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.cardBg }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "center" }}>
                          <div>
                            <strong style={{ color: COLORS.text }}>{medicine.name}</strong>
                            <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>{medicine.dosage || "No dosage specified"}</div>
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={medicine.availableStock}
                            value={medicine.frequency}
                            onChange={(e) => {
                              const frequency = Math.max(1, Number(e.target.value) || 1);
                              setSelectedMedicines((prev) => prev.map((item) => item.id === medicine.id ? {
                                ...item,
                                frequency,
                                totalQuantity: Math.max(1, frequency * item.duration),
                              } : item));
                            }}
                            placeholder="Freq/day"
                            style={inputBasicStyle}
                          />
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={medicine.duration}
                            onChange={(e) => {
                              const duration = Math.max(1, Number(e.target.value) || 1);
                              setSelectedMedicines((prev) => prev.map((item) => item.id === medicine.id ? {
                                ...item,
                                duration,
                                totalQuantity: Math.max(1, duration * item.frequency),
                              } : item));
                            }}
                            placeholder="Days"
                            style={inputBasicStyle}
                          />
                          <OrganicBtn small onClick={() => removeMedicineFromPrescription(medicine.id)} style={{ minWidth: 90 }}>
                            Remove
                          </OrganicBtn>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                          <input
                            type="text"
                            value={medicine.dosage}
                            onChange={(e) => setSelectedMedicines((prev) => prev.map((item) => item.id === medicine.id ? { ...item, dosage: e.target.value } : item))}
                            placeholder="Dosage amount"
                            style={inputBasicStyle}
                          />
                          <input
                            type="text"
                            value={medicine.usage}
                            onChange={(e) => setSelectedMedicines((prev) => prev.map((item) => item.id === medicine.id ? { ...item, usage: e.target.value } : item))}
                            placeholder="Usage / instructions"
                            style={inputBasicStyle}
                          />
                          <input
                            type="text"
                            value={medicine.specialNotes}
                            onChange={(e) => setSelectedMedicines((prev) => prev.map((item) => item.id === medicine.id ? { ...item, specialNotes: e.target.value } : item))}
                            placeholder="Special notes / warnings"
                            style={inputBasicStyle}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: COLORS.textLight }}>
                          <span>Total qty: {medicine.totalQuantity}</span>
                          <span style={{ color: medicine.totalQuantity > medicine.availableStock ? COLORS.error : COLORS.textLight }}>
                            {medicine.availableStock} in stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </OrganicCard>

              {appointmentError ? <div style={{ color: COLORS.error, fontSize: 13 }}>{appointmentError}</div> : null}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <OrganicBtn onClick={() => saveAppointment()} style={{ width: "100%", minWidth: 140 }}>
                  {appointmentSaving ? "Saving…" : "Save Changes"}
                </OrganicBtn>
                <OrganicBtn onClick={() => saveAppointment("In Consultation")} style={{ width: "100%", minWidth: 140 }}>
                  {appointmentSaving ? "Saving…" : "Start Consultation"}
                </OrganicBtn>
                <OrganicBtn primary onClick={() => saveAppointment("Completed")} style={{ width: "100%", minWidth: 140 }}>
                  {appointmentSaving ? "Saving…" : "Complete Consultation"}
                </OrganicBtn>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
