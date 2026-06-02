/* eslint-disable */
// @ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
  gradient: string;
}

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: string;
  token: string;
}

interface Appointment {
  id: string | number;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  status: string;
  paid?: boolean;
  paymentRequired?: boolean;
  fee?: string | number;
  patientContact?: string;
  doctorUid?: string;
  patientUid?: string;
  patientName?: string;
  token?: string;
  queueNumber?: number | null;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  category?: string;
  status: string;
  available: boolean;
  fee?: string;
  doctorCharges?: string;
  paymentRequired?: boolean;
  hospital?: string;
  email?: string;
  phoneNumber?: string;
}

interface Prescription {
  id: string | number;
  patient?: string;
  patientName?: string;
  doctor?: string;
  doctorName?: string;
  medicines: Array<string | {
    id?: string;
    name: string;
    dosage?: string;
    frequency?: number;
    duration?: number;
    totalQuantity?: number;
    specialNotes?: string;
    usage?: string;
  }>;
  date: string;
  status: string;
}

interface Stock {
  id: string | number;
  name: string;
  qty: number;
  unit: string;
  status: string;
}

interface MedicalHistory {
  date: string;
  diagnosis: string;
  doctor: string;
  prescription: string;
  notes: string;
}

interface User {
  role: string;
}

type ReportRange = "today" | "weekly" | "monthly" | "custom";
type ReportType = "patients" | "appointments" | "pharmacy" | "revenue";

interface Notification {
  msg: string;
  type: string;
}

const ROLES: Role[] = [
  { id: "patient", label: "Patient", icon: "🏥", color: "#0ea5e9", desc: "Book appointments & view records", gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)" },
  { id: "doctor", label: "Doctor", icon: "👨‍⚕️", color: "#10b981", desc: "Manage patients & prescriptions", gradient: "linear-gradient(135deg,#10b981,#059669)" },
  { id: "staff", label: "Staff", icon: "👩‍💼", color: "#8b5cf6", desc: "Appointments & queue management", gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)" },
  { id: "pharmacy", label: "Pharmacy", icon: "💊", color: "#f59e0b", desc: "Prescriptions & medicine stock", gradient: "linear-gradient(135deg,#f59e0b,#d97706)" },
  { id: "admin", label: "Admin", icon: "⚙️", color: "#ef4444", desc: "System management & reports", gradient: "linear-gradient(135deg,#ef4444,#dc2626)" },
];

const MEDICAL_HISTORY: MedicalHistory[] = [
  { date: "2026-04-10", diagnosis: "Hypertension", doctor: "Dr. Nimal Silva", prescription: "Amlodipine 5mg", notes: "Blood pressure: 145/90. Advised low-salt diet." },
  { date: "2026-02-20", diagnosis: "Common Cold", doctor: "Dr. Priya Fernando", prescription: "Paracetamol 500mg, Antihistamine", notes: "Mild symptoms. Rest recommended." },
];

function LoginPageInner() {
  const router = useRouter();
  const [screen, setScreen] = useState<string>("landing");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", phone: "", password: "" });
  const [loginError, setLoginError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string>("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [diagForm, setDiagForm] = useState({ patient: "", diagnosis: "", prescription: "", notes: "" });
  const [bookForm, setBookForm] = useState({ doctor: "Dr. Nimal Silva", date: "", time: "" });
  const [newPatientForm, setNewPatientForm] = useState({ name: "", phone: "", age: "", gender: "Male", address: "", password: "", confirmPassword: "" });

  const notify = (msg: string, type: string = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadAppointments = async () => {
      try {
        const apiUrl = `${window.location.origin}/api/appointments`;
        const response = await fetch(apiUrl, { credentials: "include" });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (response.status === 401) {
            // not authenticated for appointments
            return;
          }
          throw new Error(body?.message || "Unable to load appointments.");
        }
        const data = await response.json();
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };

    loadAppointments();
    const intervalId = window.setInterval(loadAppointments, 8000);
    return () => window.clearInterval(intervalId);
  }, [user]);

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
        console.error("Failed to load doctors:", err);
        setDoctorsError(err instanceof Error ? err.message : String(err));
      } finally {
        setDoctorsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    const onDoctorsUpdated = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (Array.isArray(detail)) setDoctors(detail);
      } catch (_) {}
    };
    window.addEventListener('doctors-updated', onDoctorsUpdated as EventListener);
    return () => window.removeEventListener('doctors-updated', onDoctorsUpdated as EventListener);
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setScreen("login");
    setLoginError("");
    setLoginForm({ username: "", phone: "", password: "" });
  };

  const handleLogin = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    setLoginError("");

    const identifier = selectedRole.id === "patient" ? loginForm.phone.trim() : loginForm.username.trim();
    const password = loginForm.password.trim();

    if (!identifier || !password) {
      setLoginError("Username/phone and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password, role: selectedRole?.id }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      setUser({
        role: data.role,
        username: loginForm.username,
        phone: loginForm.phone,
        password: loginForm.password,
        name: data.fullName || selectedRole.label,
      });

      notify("Welcome back! Redirecting you now...");

      if (data.redirectTo && selectedRole.id !== "staff") {
        router.push(data.redirectTo);
      } else if (selectedRole.id === "patient") {
        router.push("/patient-home");
      } else if (selectedRole.id === "doctor") {
        router.push("/doctor-dashboard");
      } else {
        // Show the embedded staff/admin dashboard inside this page
        setScreen("dashboard");
        setActiveTab("dashboard");
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedRole(null);
    setScreen("landing");
    setActiveTab("dashboard");
  };

  const roleColor = selectedRole?.color || "#0ea5e9";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", fontFamily: "'Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(14,165,233,0.3)} 50%{box-shadow:0 0 40px rgba(14,165,233,0.6)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes bgMove { 0%{transform:translate(0,0) rotate(0deg)} 100%{transform:translate(-50px,50px) rotate(10deg)} }
        .role-card:hover { transform:translateY(-6px) scale(1.03)!important; box-shadow:0 20px 40px rgba(0,0,0,0.4)!important; }
        .role-card:active { transform:scale(0.97)!important; }
        .tab-btn:hover { background:rgba(255,255,255,0.1)!important; }
        .action-btn:hover { filter:brightness(1.1); transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.3); }
        .action-btn:active { transform:scale(0.97); }
        .table-row:hover { background:rgba(255,255,255,0.05)!important; }
        input,select,textarea { outline:none!important; }
        input:focus,select:focus,textarea:focus { border-color:${roleColor}!important; box-shadow:0 0 0 3px ${roleColor}33!important; }
        .notify-toast { animation:slideLeft 0.4s ease; }
        .card-anim { animation:fadeIn 0.5s ease; }
        .spinner { animation:spin 0.8s linear infinite; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:rgba(255,255,255,0.05); } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.2); border-radius:3px; }
      `}</style>

      {/* Animated background orbs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.08),transparent 70%)", top:-200, right:-200, animation:"bgMove 20s linear infinite alternate" }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.08),transparent 70%)", bottom:-100, left:-100, animation:"bgMove 25s linear infinite alternate-reverse" }} />
        <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(16,185,129,0.06),transparent 70%)", top:"40%", left:"40%", animation:"bgMove 30s linear infinite alternate" }} />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="notify-toast" style={{ position:"fixed", top:20, right:20, zIndex:9999, background: notification.type==="success" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:500, boxShadow:"0 10px 30px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", gap:8, maxWidth:300 }}>
          <span>{notification.type==="success"?"✓":"✕"}</span>
          {notification.msg}
        </div>
      )}

      {/* LANDING SCREEN */}
      {screen === "landing" && (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", animation:"fadeIn 0.6s ease" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:64, marginBottom:16, animation:"float 3s ease-in-out infinite" }}>🏥</div>
            <h1 style={{ fontSize:42, fontWeight:800, color:"#fff", margin:0, letterSpacing:-1 }}>SmartClinic</h1>
            <p style={{ color:"#94a3b8", fontSize:16, margin:"8px 0 0", fontWeight:400 }}>Advanced Healthcare Management System</p>
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16, flexWrap:"wrap" }}>
              {["HIPAA Secure","Real-time","Multi-role"].map(t=>(
                <span key={t} style={{ background:"rgba(14,165,233,0.15)", color:"#38bdf8", padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid rgba(14,165,233,0.3)" }}>{t}</span>
              ))}
            </div>
          </div>

          <p style={{ color:"#64748b", fontSize:15, marginBottom:32, fontWeight:500, letterSpacing:1, textTransform:"uppercase" }}>Select Your Role to Continue</p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:16, width:"100%", maxWidth:920 }}>
            {ROLES.map((role, i) => (
              <div key={role.id} className="role-card" onClick={() => handleRoleSelect(role)}
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:22, padding:"22px 18px", cursor:"pointer", transition:"all 0.3s ease", animation:`fadeIn 0.5s ease ${i*0.08}s both`, backdropFilter:"blur(14px)", textAlign:"center", minHeight:170, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                <div style={{ fontSize:36, marginBottom:10, animation:"float 3s ease-in-out infinite", animationDelay:`${i*0.5}s` }}>{role.icon}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>{role.label}</div>
                  <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{role.desc}</div>
                </div>
                <div style={{ marginTop:16, width:42, height:4, background:role.gradient, borderRadius:6, margin:"0 auto" }} />
              </div>
            ))}
          </div>

          <p style={{ color:"#374151", fontSize:12, marginTop:48, textAlign:"center" }}>© 2026 SmartClinic · Dambulla, Central Province, Sri Lanka</p>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {screen === "login" && (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:380, animation:"fadeIn 0.5s ease" }}>
            <button onClick={()=>setScreen("landing")} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:"#94a3b8", padding:"8px 16px", borderRadius:10, cursor:"pointer", fontSize:13, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
              ← Back to Role Selection
            </button>

            {!showRegister ? (
              <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:26, padding:34, backdropFilter:"blur(22px)" }}>
                <div style={{ textAlign:"center", marginBottom:32 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>{selectedRole?.icon}</div>
                  <div style={{ fontSize:22, fontWeight:700, color:"#fff" }}>{selectedRole?.label} Login</div>
                  <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>{selectedRole?.desc}</div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {selectedRole?.id === "patient" ? (
                    <div>
                      <label style={{ color:"#94a3b8", fontSize:13, fontWeight:500, marginBottom:6, display:"block" }}>Phone Number</label>
                      <input value={loginForm.phone} onChange={e=>setLoginForm({...loginForm,phone:e.target.value})}
                        placeholder="07X XXXXXXX" style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, boxSizing:"border-box", transition:"all 0.2s" }} />
                    </div>
                  ) : (
                    <div>
                      <label style={{ color:"#94a3b8", fontSize:13, fontWeight:500, marginBottom:6, display:"block" }}>Username</label>
                      <input value={loginForm.username} onChange={e=>setLoginForm({...loginForm,username:e.target.value})}
                        placeholder="Enter username" style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, boxSizing:"border-box", transition:"all 0.2s" }} />
                    </div>
                  )}
                  <div>
                    <label style={{ color:"#94a3b8", fontSize:13, fontWeight:500, marginBottom:6, display:"block" }}>Password</label>
                    <input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                      placeholder="Enter password" onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                      style={{ width:"100%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, boxSizing:"border-box", transition:"all 0.2s" }} />
                  </div>
                  {loginError && <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#f87171", fontSize:13 }}>{loginError}</div>}

                  <button className="action-btn" onClick={handleLogin} disabled={isLoading}
                    style={{ background:selectedRole?.gradient, border:"none", borderRadius:16, padding:"15px", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    {isLoading ? <><div className="spinner" style={{ width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%" }} /> Signing in...</> : "Sign In →"}
                  </button>

                  <div style={{ textAlign:"center", color:"#64748b", fontSize:12, marginTop:8 }}>
                    Use your registered account credentials to sign in.
                  </div>
                </div>

                {(selectedRole?.id === "patient" || selectedRole?.id === "doctor") && (
                  <div style={{ marginTop:24, paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>
                    <span style={{ color:"#64748b", fontSize:13 }}>{selectedRole?.id === "patient" ? "New patient?" : "New doctor?"} </span>
                    <button onClick={()=>setShowRegister(true)} style={{ background:"none", border:"none", color:roleColor, fontSize:13, fontWeight:700, cursor:"pointer" }}>{selectedRole?.id === "patient" ? "Register here →" : "Create account →"}</button>
                  </div>
                )}
              </div>
            ) : (
              selectedRole?.id === "doctor" ? (
                <DoctorRegisterForm onBack={()=>setShowRegister(false)} roleColor={roleColor} onSuccess={()=>{setShowRegister(false);notify("Doctor account created! Please login.");}} />
              ) : (
                <PatientRegisterForm onBack={()=>setShowRegister(false)} roleColor={roleColor} onSuccess={()=>{setShowRegister(false);notify("Registration successful! Please login.");}} />
              )
            )}
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {screen === "dashboard" && user && (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
          {/* Topbar */}
          <div style={{ background:"rgba(15,23,42,0.95)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:100 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>🏥</span>
              <span style={{ color:"#fff", fontWeight:800, fontSize:18 }}>SmartClinic</span>
              <span style={{ background:ROLES.find(r=>r.id===user.role)?.gradient, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:0.5 }}>{user.role.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{user.name}</div>
                <div style={{ color:"#64748b", fontSize:11 }}>{new Date().toLocaleDateString("en-LK",{weekday:"long",month:"short",day:"numeric"})}</div>
              </div>
              <div style={{ width:38, height:38, borderRadius:"50%", background:ROLES.find(r=>r.id===user.role)?.gradient, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>{user.name.charAt(0)}</div>
              <button onClick={handleLogout} style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#f87171", padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600 }}>Logout</button>
            </div>
          </div>

          <div style={{ display:"flex", flex:1 }}>
            {/* Sidebar */}
            <div style={{ width:220, background:"rgba(15,23,42,0.8)", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"24px 12px", display:"flex", flexDirection:"column", gap:4 }}>
              {getNavItems(user.role).map(item => (
                <button key={item.id} className="tab-btn" onClick={()=>setActiveTab(item.id)}
                  style={{ background: activeTab===item.id ? ROLES.find(r=>r.id===user.role)?.gradient : "transparent", border:"none", borderRadius:10, padding:"10px 14px", color: activeTab===item.id ? "#fff" : "#64748b", cursor:"pointer", fontSize:13, fontWeight: activeTab===item.id ? 600 : 400, display:"flex", alignItems:"center", gap:10, textAlign:"left", transition:"all 0.2s" }}>
                  <span style={{ fontSize:18 }}>{item.icon}</span>{item.label}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div style={{ flex:1, padding:28, overflowY:"auto" }}>
              {/* PATIENT DASHBOARD */}
              {user.role==="patient" && (
                <PatientDashboard user={user} activeTab={activeTab} appointments={appointments} doctors={doctors} setAppointments={setAppointments} bookForm={bookForm} setBookForm={setBookForm} notify={notify} />
              )}
              {/* DOCTOR DASHBOARD */}
              {user.role==="doctor" && (
                <DoctorDashboard user={user} activeTab={activeTab} patients={patients} diagForm={diagForm} setDiagForm={setDiagForm} prescriptions={prescriptions} notify={notify} />
              )}
              {/* STAFF DASHBOARD */}
              {user.role==="staff" && (
                <StaffDashboard
                  user={user}
                  activeTab={activeTab}
                  doctors={doctors}
                  patients={patients}
                  setPatients={setPatients}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  newPatientForm={newPatientForm}
                  setNewPatientForm={setNewPatientForm}
                  notify={notify}
                />
              )}
              {/* PHARMACY DASHBOARD */}
              {user.role==="pharmacy" && (
                <PharmacyDashboard activeTab={activeTab} prescriptions={prescriptions} setPrescriptions={setPrescriptions} stock={stock} setStock={setStock} notify={notify} user={user} />
              )}
              {/* ADMIN DASHBOARD */}
              {user.role==="admin" && (
                <AdminDashboard activeTab={activeTab} patients={patients} appointments={appointments} notify={notify} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNavItems(role: string) {
  const maps: Record<string, { id: string; icon: string; label: string }[]> = {
    patient: [{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"profile",icon:"👤",label:"My Profile"},{id:"book",icon:"📅",label:"Book Appointment"},{id:"history",icon:"📋",label:"Medical History"}],
    doctor: [{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"patients",icon:"👥",label:"My Patients"},{id:"diagnose",icon:"🩺",label:"Add Diagnosis"},{id:"prescriptions",icon:"💊",label:"Prescriptions"}],
    staff: [{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"appointments",icon:"📅",label:"All Appointments"},{id:"register",icon:"➕",label:"Register Patient"},{id:"queue",icon:"🔢",label:"Queue System"}],
    pharmacy: [{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"prescriptions",icon:"📋",label:"Prescriptions"},{id:"stock",icon:"📦",label:"Medicine Stock"},{id:"dispense",icon:"✅",label:"Dispense"}],
    admin: [{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"users",icon:"👥",label:"All Users"},{id:"reports",icon:"📈",label:"Reports"},{id:"settings",icon:"⚙️",label:"Settings"}],
  };
  return maps[role] || [];
}

function PatientDashboard({ user, activeTab, appointments, doctors, setAppointments, bookForm, setBookForm, notify }: { user: any; activeTab: string; appointments: Appointment[]; doctors: Doctor[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; bookForm: { doctor: string; date: string; time: string }; setBookForm: React.Dispatch<React.SetStateAction<{ doctor: string; date: string; time: string }>>; notify: (msg: string, type?: string) => void }) {
  if (activeTab === "dashboard") {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <SectionTitle title="Patient Dashboard" sub="Your appointments, history, and doctor updates" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
          <StatCard icon="📅" label="Upcoming Appointments" value={appointments.filter((a) => a.status !== "Cancelled").length} color="#10b981" />
          <StatCard icon="👨‍⚕️" label="Available Doctors" value={doctors.filter((d) => d.available).length} color="#0ea5e9" />
          <StatCard icon="💸" label="Payment Required" value={appointments.filter((a) => a.paymentRequired && !a.paid).length} color="#ef4444" />
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          {appointments.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>No appointments found yet.</div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} style={{ display: "grid", gap: 6, padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{a.doctor}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{a.date} · {a.time}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge text={a.status} type={a.status === "Confirmed" ? "success" : "warning"} />
                  <Badge text={a.paymentRequired ? "Payment Required" : "Free"} type={a.paymentRequired ? "danger" : "success"} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "profile") {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <SectionTitle title="My Profile" sub="Your patient account details" />
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, maxWidth: 520 }}>
          <div style={{ color: "#fff", marginBottom: 12 }}>Name: {user.name}</div>
          <div style={{ color: "#94a3b8", marginBottom: 12 }}>Email: {user.email || "Not available"}</div>
          <div style={{ color: "#94a3b8", marginBottom: 12 }}>Role: Patient</div>
          <div style={{ color: "#94a3b8" }}>Use the booking page to select a doctor and complete appointment requests.</div>
        </div>
      </div>
    );
  }

  if (activeTab === "book") {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <SectionTitle title="Book Appointment" sub="Use the dedicated booking page for fee and payment details" />
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, maxWidth: 520 }}>
          <div style={{ color: "#94a3b8", marginBottom: 18 }}>To make a new booking, please use the patient appointment form at:</div>
          <button onClick={() => window.location.href = "/appointment-booking"} style={{ background: "#10b981", border: "none", borderRadius: 12, padding: "12px 18px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Go to Appointment Booking</button>
        </div>
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <SectionTitle title="Medical History" sub="Your recent appointment records" />
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <div style={{ color: "#94a3b8", marginBottom: 16 }}>Recent appointments are shown on the main dashboard above.</div>
          {appointments.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>No history to display.</div>
          ) : (
            appointments.map((a) => (
              <div key={a.id} style={{ display: "grid", gap: 6, padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{a.doctor}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{a.date} · {a.time}</div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Status: {a.status}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
}

function DoctorDashboard({ user, activeTab, patients, diagForm, setDiagForm, prescriptions, notify }: { user: any; activeTab: string; patients: Patient[]; diagForm: { patient: string; diagnosis: string; prescription: string; notes: string }; setDiagForm: React.Dispatch<React.SetStateAction<{ patient: string; diagnosis: string; prescription: string; notes: string }>>; prescriptions: Prescription[]; notify: (msg: string, type?: string) => void }) {
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({ symptoms: "", bp: "", weight: "", temp: "", diagnosis: "", notes: "" });
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [pharmacyQuery, setPharmacyQuery] = useState("");
  const [pharmacyResults, setPharmacyResults] = useState<any[]>([]);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const [isSavingConsultation, setIsSavingConsultation] = useState(false);
  const [consultationError, setConsultationError] = useState<string | null>(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `${window.location.origin}/api/appointments`;
      const res = await fetch(apiUrl, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message || "Unable to load appointments");
      const data = await res.json();
      setAppointmentsList(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    loadAppointments();
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    searchPharmacy("");
  }, [activeTab, user]);

  const openConsultation = (appt: any) => {
    setSelected(appt);
    setForm({ symptoms: appt.symptoms || "", bp: "", weight: "", temp: "", diagnosis: appt.diagnosis || "", notes: appt.consultationNotes || "" });
    setPrescriptionItems(Array.isArray(appt.medicines) ? appt.medicines.map((m: any) => ({ ...m })) : []);
    setUploadedFiles([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const searchPharmacy = async (q: string) => {
    setPharmacyQuery(q);
    setPharmacyLoading(true);
    setPharmacyError(null);
    try {
      const apiUrl = q ? `/api/pharmacy/stock?q=${encodeURIComponent(q)}` : "/api/pharmacy/stock";
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to search pharmacy");
      setPharmacyResults(Array.isArray(data.stock) ? data.stock.filter((s: any) => Number(s.qty) > 0) : []);
    } catch (err) {
      setPharmacyResults([]);
      setPharmacyError(err instanceof Error ? err.message : "Unable to load pharmacy items.");
    } finally {
      setPharmacyLoading(false);
    }
  };

  const addMedicine = (stockItem: any) => {
    const existing = prescriptionItems.find((p) => p.stockId === stockItem.id);
    if (existing) return;
    setPrescriptionItems([...prescriptionItems, { stockId: stockItem.id, name: stockItem.name, qty: 1, dosage: stockItem.dosage || "", usage: stockItem.usage || "", availableQty: stockItem.qty }]);
  };

  const updatePrescriptionItem = (index: number, patch: any) => {
    const copy = [...prescriptionItems];
    copy[index] = { ...copy[index], ...patch };
    setPrescriptionItems(copy);
  };

  const removePrescriptionItem = (index: number) => {
    const copy = [...prescriptionItems];
    copy.splice(index, 1);
    setPrescriptionItems(copy);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers: Promise<any>[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      readers.push(
        new Promise((res) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base = String(reader.result || "");
            const dataBase64 = base.startsWith("data:") ? base.split(",")[1] : base;
            res({ name: f.name, type: f.type, dataBase64 });
          };
          reader.readAsDataURL(f);
        })
      );
    }
    Promise.all(readers).then((arr) => setUploadedFiles([...uploadedFiles, ...arr]));
  };

  const completeConsultation = async () => {
    if (!selected) return;
    setConsultationError(null);
    setIsSavingConsultation(true);
    // validate stock availability
    for (const item of prescriptionItems) {
      if (Number(item.qty) > Number(item.availableQty || 0)) {
        notify(`Insufficient stock for ${item.name}`,"error");
        return;
      }
    }

    try {
      // create pharmacy prescription
      const presRes = await fetch("/api/pharmacy/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: selected.patient || selected.patientName || "",
          doctor: user?.name || user?.fullName || "",
          medicines: prescriptionItems,
          notes: form.notes || "",
          appointmentId: selected.id,
        }),
      });
      const presData = await presRes.json();
      if (!presRes.ok) throw new Error(presData.message || "Unable to create prescription");

      // prepare uploaded files payload
      const uploadedPayload = uploadedFiles.map((f) => ({ name: f.name, type: f.type, dataBase64: f.dataBase64 }));

      // update appointment
      const updateRes = await fetch(`${window.location.origin}/api/appointments/${selected.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed", diagnosis: form.diagnosis, symptoms: form.symptoms, consultationNotes: form.notes, medicines: prescriptionItems, prescriptionId: presData.prescription?.id || null, uploadedFiles: uploadedPayload }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.message || "Unable to complete consultation");

      notify("Consultation completed", "success");
      closeModal();
      loadAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setConsultationError(message);
      notify(message, "error");
    } finally {
      setIsSavingConsultation(false);
    }
  };

  if (activeTab !== "dashboard") return null;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <SectionTitle title="Doctor Dashboard" sub="Appointments & Consultations" />
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 12, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input placeholder="Search appointments or patient" onChange={(e) => { const q = e.target.value.toLowerCase(); setAppointmentsList((prev)=>prev); /* keep simple - client-side filter can be added */ }} style={{ flex: 1, padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }} />
            <button onClick={loadAppointments} className="action-btn">Refresh</button>
          </div>

          {loading ? <div style={{ color: "#94a3b8" }}>Loading appointments...</div> : (
            appointmentsList.length === 0 ? <div style={{ color: "#94a3b8" }}>No appointments found.</div> : (
              appointmentsList.map((a) => (
                <div key={a.id} style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700 }}>{a.patient}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>{a.date} · {a.time} · {a.token || ''}</div>
                    <div style={{ marginTop: 6 }}><Badge text={a.status} type={a.status === "Completed" ? "success" : a.status === "In Consultation" ? "info" : "warning"} /></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => openConsultation(a)} className="action-btn">Start Consultation</button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
          <SectionTitle title="Active Consultation" sub={selected ? `Appointment: ${selected.patient}` : "Select an appointment to begin"} />
          {!selected ? (
            <div style={{ color: "#94a3b8" }}>Select an appointment from the left to view patient details and start consultation.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#fff", fontWeight: 700 }}>{selected.patient}</div>
              <div style={{ color: "#94a3b8" }}>Queue: {selected.token || selected.queueNumber} · {selected.date} · {selected.time}</div>

              <FormInput label="Symptoms / Description" value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} as="textarea" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <FormInput label="Blood Pressure" value={form.bp} onChange={(v) => setForm({ ...form, bp: v })} />
                <FormInput label="Weight" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
                <FormInput label="Temperature" value={form.temp} onChange={(v) => setForm({ ...form, temp: v })} />
              </div>
              <FormInput label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} />
              <FormInput label="Medical Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} as="textarea" />

              {consultationError && (
                <div style={{ color: "#f87171", background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 10, padding: 10 }}>{consultationError}</div>
              )}

              <div>
                <div style={{ color: "#94a3b8", marginBottom: 6 }}>Upload Reports</div>
                <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} style={{ width: "100%", color: "#fff", marginBottom: 8 }} />
                <div style={{ marginTop: 8 }}>{uploadedFiles.map((f,i)=>(<div key={i} style={{ color: "#fff" }}>{f.name}</div>))}</div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ color: "#94a3b8", fontWeight: 700 }}>Prescription</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Search medicines" value={pharmacyQuery} onChange={(e)=>searchPharmacy(e.target.value)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", flex: 1 }} />
                  </div>
                </div>

                <div style={{ maxHeight: 160, overflowY: "auto", marginTop: 8 }}>
                  {pharmacyError && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>{pharmacyError}</div>}
                  {pharmacyLoading ? <div style={{ color: "#94a3b8" }}>Searching...</div> : (
                    pharmacyResults.length === 0 ? <div style={{ color: "#94a3b8" }}>No medicines found.</div> : pharmacyResults.map((s) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <div style={{ color: "#fff", fontWeight: 700 }}>{s.name}</div>
                          <div style={{ color: "#94a3b8", fontSize: 12 }}>Available: {s.qty}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <button onClick={() => addMedicine(s)} className="action-btn">Add</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: 8 }}>
                  {prescriptionItems.map((it, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 120px 40px", gap: 8, alignItems: "center", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ color: "#fff" }}>{it.name}</div>
                      <input type="number" value={it.qty} min={1} max={it.availableQty} onChange={e=>updatePrescriptionItem(idx,{qty: Number(e.target.value)})} style={{ padding:6, borderRadius:6, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff" }} />
                      <input value={it.dosage} onChange={e=>updatePrescriptionItem(idx,{dosage:e.target.value})} placeholder="Dosage" style={{ padding:6, borderRadius:6, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff" }} />
                      <input value={it.usage} onChange={e=>updatePrescriptionItem(idx,{usage:e.target.value})} placeholder="Usage" style={{ padding:6, borderRadius:6, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff" }} />
                      <button onClick={()=>removePrescriptionItem(idx)} style={{ background:"rgba(239,68,68,0.12)", border:"none", padding:6, borderRadius:6, color:"#f87171" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={closeModal} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", padding: "10px 14px", borderRadius: 8 }}>Cancel</button>
                <button onClick={completeConsultation} disabled={isSavingConsultation} style={{ background: isSavingConsultation ? "rgba(16,185,129,0.6)" : "#10b981", border: "none", color: "#fff", padding: "10px 14px", borderRadius: 8, cursor: isSavingConsultation ? "not-allowed" : "pointer" }}>{isSavingConsultation ? "Saving..." : "Complete Consultation"}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for consultation (also used when opening) */}
      {showModal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ width: "90%", maxWidth: 980, maxHeight: "90vh", overflowY: "auto", background: "#0b1220", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: 800 }}>Consultation — {selected.patient}</div>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {/* Reuse main consultation UI by rendering selected content */}
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ color: "#94a3b8" }}>Patient: {selected.patient} · Contact: {selected.patientContact}</div>
                <FormInput label="Symptoms / Description" value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} as="textarea" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <FormInput label="Blood Pressure" value={form.bp} onChange={(v) => setForm({ ...form, bp: v })} />
                  <FormInput label="Weight" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
                  <FormInput label="Temperature" value={form.temp} onChange={(v) => setForm({ ...form, temp: v })} />
                </div>
                <FormInput label="Diagnosis" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} />
                <FormInput label="Medical Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} as="textarea" />
                <div>
                  <div style={{ color: "#94a3b8", marginBottom: 6 }}>Upload Reports</div>
                  <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
                </div>
                <div>
                  <div style={{ color: "#94a3b8", marginBottom: 6 }}>Prescription Items</div>
                  {prescriptionItems.map((it, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ color: "#fff", flex: 1 }}>{it.name}</div>
                      <input type="number" value={it.qty} min={1} max={it.availableQty} onChange={e=>updatePrescriptionItem(idx,{qty:Number(e.target.value)})} style={{ width:80 }} />
                      <input value={it.dosage} onChange={e=>updatePrescriptionItem(idx,{dosage:e.target.value})} placeholder="Dosage" style={{ width:140 }} />
                      <input value={it.usage} onChange={e=>updatePrescriptionItem(idx,{usage:e.target.value})} placeholder="Usage" style={{ width:200 }} />
                      <button onClick={()=>removePrescriptionItem(idx)} style={{ background:"transparent", border:"none", color:"#f87171" }}>Remove</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => { setShowModal(false); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", padding: "10px 14px", borderRadius: 8 }}>Close</button>
                  <button onClick={completeConsultation} style={{ background: "#10b981", border: "none", color: "#fff", padding: "10px 14px", borderRadius: 8 }}>Complete Consultation</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- SHARED COMPONENTS ----
function StatCard({ icon, label, value, color, sub }: { icon: string; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="card-anim" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"20px 24px", display:"flex", alignItems:"center", gap:16, transition:"all 0.2s" }}>
      <div style={{ width:50, height:50, borderRadius:14, background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ color:"#94a3b8", fontSize:12, fontWeight:500, marginBottom:2 }}>{label}</div>
        <div style={{ color:"#fff", fontSize:26, fontWeight:800, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ color:"#64748b", fontSize:11, marginTop:4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h2 style={{ color:"#fff", fontSize:20, fontWeight:700, margin:0 }}>{title}</h2>
      {sub && <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Badge({ text, type }: { text: string; type: string }) {
  const colors: Record<string, string[]> = {
    success:["#10b981","rgba(16,185,129,0.15)"],warning:["#f59e0b","rgba(245,158,11,0.15)"],danger:["#ef4444","rgba(239,68,68,0.15)"],info:["#0ea5e9","rgba(14,165,233,0.15)"],default:["#8b5cf6","rgba(139,92,246,0.15)"]
  };
  const [text_c,bg] = colors[type]||colors.default;
  return <span style={{ background:bg, color:text_c, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, border:`1px solid ${text_c}33` }}>{text}</span>;
}

function FormInput({ label, value, onChange, placeholder, type="text", as="input", options }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; as?: string; options?: string[] }) {
  const baseStyle: React.CSSProperties = { width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:14, boxSizing:"border-box", transition:"all 0.2s" };
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ color:"#94a3b8", fontSize:12, fontWeight:600, marginBottom:6, display:"block", letterSpacing:0.3 }}>{label}</label>
      {as==="select" ? (
        <select value={value} onChange={e=>onChange(e.target.value)} style={{ ...baseStyle, appearance:"none" } as React.CSSProperties}>
          {options?.map(o=><option key={o} value={o} style={{ background:"#1e293b" }}>{o}</option>)}
        </select>
      ) : as==="textarea" ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...baseStyle, resize:"vertical" } as React.CSSProperties} />
      ) : (
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={baseStyle} />
      )}
    </div>
  );
}

function ActionBtn({ label, onClick, color="#0ea5e9", icon }: { label: string; onClick: () => void; color?: string; icon?: string }) {
  return (
    <button className="action-btn" onClick={onClick} style={{ background:`linear-gradient(135deg,${color},${color}cc)`, border:"none", borderRadius:10, padding:"10px 20px", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:6 }}>
      {icon && <span>{icon}</span>}{label}
    </button>
  );
}

//
// ---- PATIENT REGISTER ----
function PatientRegisterForm({ onBack, roleColor, onSuccess }: { onBack: () => void; roleColor: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", confirmPassword: "", age: "", gender: "Male", address: "" });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.username || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register-patient", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          username: form.username,
          phoneNumber: form.phone,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 36, backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Patient Registration</div>
      <FormInput label="Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Your full name" />
      <FormInput label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="Preferred username" />
      <FormInput label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="name@example.com" type="email" />
      <FormInput label="Phone Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="07X XXXXXXX" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormInput label="Age" value={form.age} onChange={v => setForm({ ...form, age: v })} placeholder="Age" type="number" />
        <FormInput label="Gender" value={form.gender} onChange={v => setForm({ ...form, gender: v })} as="select" options={["Male", "Female", "Other"]} />
      </div>
      <FormInput label="Address" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="Full address" />
      <FormInput label="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Create password" type="password" />
      <FormInput label="Confirm Password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} placeholder="Confirm password" type="password" />
      {error && <div style={{ marginTop: 12, color: "#f87171", fontSize: 13, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px" }}>{error}</div>}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <ActionBtn label={isLoading ? "Registering..." : "Register"} color={roleColor} icon="✓" onClick={handleRegister} />
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Back to Login</button>
      </div>
    </div>
  );
}

function DoctorRegisterForm({ onBack, roleColor, onSuccess }: { onBack: () => void; roleColor: string; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", specialization: "General Medicine", category: "General", hospital: "", fee: "$0", paymentRequired: false, password: "", confirmPassword: "" });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.username || !form.email || !form.phone || !form.password || !form.confirmPassword || !form.specialization) {
      setError("Please complete all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          username: form.username,
          phoneNumber: form.phone,
          email: form.email,
          specialization: form.specialization,
          hospital: form.hospital,
          category: form.category,
          fee: form.fee,
          paymentRequired: form.paymentRequired,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 36, backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>Doctor Account Registration</div>
      <FormInput label="Doctor Full Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Dr. A. Perera" />
      <FormInput label="Username" value={form.username} onChange={v => setForm({ ...form, username: v })} placeholder="doctor.username" />
      <FormInput label="Email Address" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="name@hospital.com" type="email" />
      <FormInput label="Phone Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="07X XXXXXXX" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormInput label="Specialization" value={form.specialization} onChange={v => setForm({ ...form, specialization: v })} placeholder="Cardiology, Pediatrics..." />
        <FormInput label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} as="select" options={["General", "Cardiology", "Pediatrics", "Orthopedics", "Neurology", "Surgery"]} />
      </div>
      <FormInput label="Hospital" value={form.hospital} onChange={v => setForm({ ...form, hospital: v })} placeholder="City General Hospital" />
      <FormInput label="Consultation Fee" value={form.fee} onChange={v => setForm({ ...form, fee: v })} placeholder="$0" />
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <input type="checkbox" checked={form.paymentRequired} onChange={(e) => setForm({ ...form, paymentRequired: e.target.checked })} />
        <span style={{ color: "#fff", fontSize: 13 }}>Payment Required</span>
      </label>
      <FormInput label="Password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Create password" type="password" />
      <FormInput label="Confirm Password" value={form.confirmPassword} onChange={v => setForm({ ...form, confirmPassword: v })} placeholder="Confirm password" type="password" />
      {error && <div style={{ marginTop: 12, color: "#f87171", fontSize: 13, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px" }}>{error}</div>}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <ActionBtn label={isLoading ? "Creating..." : "Create Account"} color={roleColor} icon="🩺" onClick={handleRegister} />
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Back to Login</button>
      </div>
    </div>
  );
}

// ---- DOCTOR DASHBOARD ----

// ---- STAFF DASHBOARD ----
function StaffDashboard({ user, activeTab, doctors, patients, setPatients, appointments, setAppointments, newPatientForm, setNewPatientForm, notify }: { user: User | null; activeTab: string; doctors: Doctor[]; patients: Patient[]; setPatients: React.Dispatch<React.SetStateAction<Patient[]>>; appointments: Appointment[]; setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; newPatientForm: { name: string; phone: string; age: string; gender: string; address: string; password: string; confirmPassword: string }; setNewPatientForm: React.Dispatch<React.SetStateAction<{ name: string; phone: string; age: string; gender: string; address: string; password: string; confirmPassword: string }>>; notify: (msg: string, type?: string) => void }) {
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string>("");
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [showAppointmentEditor, setShowAppointmentEditor] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editableAppointmentDate, setEditableAppointmentDate] = useState<string>("");
  const [editableAppointmentTime, setEditableAppointmentTime] = useState<string>("");
  const [editableAppointmentStatus, setEditableAppointmentStatus] = useState<string>("Pending");
  const [editableAppointmentPaid, setEditableAppointmentPaid] = useState<boolean>(false);
  const [appointmentEditError, setAppointmentEditError] = useState<string | null>(null);

  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [editingDoctorPaymentRequired, setEditingDoctorPaymentRequired] = useState<boolean>(false);
  const [editingDoctorFee, setEditingDoctorFee] = useState<string>("");

  // Queue Management States
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const openDoctorModal = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setEditingDoctorPaymentRequired(!!doc.paymentRequired);
    setEditingDoctorFee(String(doc.doctorCharges || doc.fee || "$0"));
    setShowDoctorModal(true);
  };

  const doctorTotals = doctors.map((doc) => {
    const doctorAppointments = appointments.filter((appt) => appt.doctor === doc.name);
    const totalEarned = doctorAppointments.reduce((sum, appt) => {
      const feeNumber = parseFloat(String(appt.fee || "0").replace(/[^0-9.]/g, "")) || 0;
      return sum + (appt.paid ? feeNumber : 0);
    }, 0);
    return {
      ...doc,
      totalAppointments: doctorAppointments.length,
      totalEarned,
    };
  });
  const uniquePatientCount = new Set(appointments.map((appt) => appt.patientUid || appt.patient || "")).size;

  const formatAppointmentDate = (dateString: string) => {
    const parsed = new Date(dateString);
    if (!dateString || Number.isNaN(parsed.getTime())) return dateString || "No date";
    return parsed.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const openAppointmentEditor = (appt: Appointment) => {
    setEditingAppointment(appt);
    setEditableAppointmentDate(appt.date || "");
    setEditableAppointmentTime(appt.time || "");
    setEditableAppointmentStatus(appt.status || "Pending");
    setEditableAppointmentPaid(!!appt.paid);
    setAppointmentEditError(null);
    setShowAppointmentEditor(true);
  };

  const closeAppointmentEditor = () => {
    setShowAppointmentEditor(false);
    setEditingAppointment(null);
    setAppointmentEditError(null);
  };

  const saveAppointmentEdit = async () => {
    if (!editingAppointment) return;
    setAppointmentEditError(null);
    setUpdatingAppointmentId(String(editingAppointment.id));
    try {
      const response = await fetch(`${window.location.origin}/api/appointments/${editingAppointment.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editableAppointmentDate,
          time: editableAppointmentTime,
          status: editableAppointmentStatus,
          paid: editableAppointmentPaid,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to update appointment");
      }
      const updatedAppointment = {
        ...editingAppointment,
        ...(data.appointment || {}),
        status: data.appointment?.status || editingAppointment.status,
        paid: data.appointment?.paid ?? editingAppointment.paid,
      };
      setAppointments((prev) => prev.map((a) => (a.id === editingAppointment.id ? updatedAppointment : a)));
      notify("Appointment updated successfully!");
      closeAppointmentEditor();
    } catch (err) {
      setAppointmentEditError(err instanceof Error ? err.message : String(err));
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  const startDoctorEdit = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setEditingDoctorPaymentRequired(!!doc.paymentRequired);
  };

  const cancelDoctorEdit = () => {
    setEditingDoctorId(null);
    setEditingDoctorPaymentRequired(false);
    setEditingDoctorFee("");
    setShowDoctorModal(false);
  };

  const saveDoctorEdit = async (doc: Doctor) => {
    setUpdatingAppointmentId(doc.id);
    try {
      const normalizedFee = String(editingDoctorFee || "$0").trim() || "$0";
      const res = await fetch('/api/doctors/payment-required', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ doctorId: doc.id, paymentRequired: !!editingDoctorPaymentRequired, fee: normalizedFee }),
      });
      const data = await res.json();
      if (res.ok) {
        // server accepted change — reflect server value if provided
        const updatedFromServer = Array.isArray(data?.doctors)
          ? data.doctors
          : doctors.map(d => d.id === doc.id ? { ...d, paymentRequired: !!data.paymentRequired, fee: data.fee || normalizedFee, doctorCharges: data.doctorCharges || normalizedFee } : d);
        window.dispatchEvent(new CustomEvent('doctors-updated', { detail: updatedFromServer }));
        notify('Doctor payment settings updated');
        setEditingDoctorId(null);
      } else {
        notify(data?.message || 'Unable to update doctor settings. Please sign in and try again.', 'danger');
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), 'danger');
    } finally {
      setUpdatingAppointmentId('');
    }
  };

  const updateAppointmentStatus = async (appointmentId: number | string, updates: { status?: string; paid?: boolean }) => {
    setUpdatingAppointmentId(String(appointmentId));
    try {
      const response = await fetch(`${window.location.origin}/api/appointments/${appointmentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        notify(data?.message || "Unable to update appointment", "danger");
        return;
      }
      setAppointments((prev: Appointment[]) => prev.map(a => a.id === appointmentId ? { ...a, ...(data.appointment || {}), status: data.appointment?.status || a.status, paid: data.appointment?.paid ?? a.paid } : a));
      notify("Appointment updated successfully!");
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "danger");
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  if (activeTab==="dashboard" && !showDoctorModal) return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Staff Dashboard 👩‍💼" sub="Reception & Queue Management" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        <StatCard icon="👥" label="Total Patients" value={uniquePatientCount} color="#8b5cf6" />
        <StatCard icon="📅" label="Appointments Today" value={appointments.length} color="#0ea5e9" />
        <StatCard icon="👨‍⚕️" label="Registered Doctors" value={doctors.length} color="#10b981" />
        <StatCard icon="✅" label="Available Doctors" value={doctors.filter(d=>d.available).length} color="#f59e0b" />
      </div>
      <div style={{ display:"grid", gap:16, marginBottom:28 }}>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Doctor Earnings</div>
          {doctorTotals.length === 0 && <div style={{ color:"#94a3b8" }}>No doctors available.</div>}
          {doctorTotals.map((doc)=>(
            <div key={doc.id} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{doc.name}</div>
                <div style={{ color:"#64748b", fontSize:12 }}>{doc.specialization} · Fee: {doc.doctorCharges || doc.fee || "$0"}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <div style={{ color:"#94a3b8", fontSize:13 }}>Earned: Rs. {doc.totalEarned.toFixed(2)}</div>
                <div style={{ color:"#94a3b8", fontSize:13 }}>{doc.totalAppointments} appts</div>
                <button onClick={()=>openDoctorModal(doc)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", padding:"6px 10px", borderRadius:8 }}>Manage</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Today&apos;s Appointments</div>
          {appointments.length === 0 && <div style={{ color:"#94a3b8" }}>No appointments yet.</div>}
          {appointments.map((a) => (
            <div key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{a.patient}</div>
                <div style={{ color:"#64748b", fontSize:12 }}>Doctor: {a.doctor} · {a.date} · {a.time}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <Badge text={a.status} type={a.status === "Confirmed" ? "success" : "warning"} />
                <Badge text={a.paid ? "Paid" : (a.paymentRequired ? "Pending Payment" : "Free")} type={a.paid ? "success" : (a.paymentRequired ? "danger" : "info")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (activeTab==="register") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Register New Patient" sub="Add patient to the system" />
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28, maxWidth:500 }}>
        <FormInput label="Full Name" value={newPatientForm.name} onChange={v=>setNewPatientForm({...newPatientForm,name:v})} placeholder="Patient's full name" />
        <FormInput label="Phone Number" value={newPatientForm.phone} onChange={v=>setNewPatientForm({...newPatientForm,phone:v})} placeholder="07X XXXXXXX" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <FormInput label="Age" value={newPatientForm.age} onChange={v=>setNewPatientForm({...newPatientForm,age:v})} type="number" placeholder="Age" />
          <FormInput label="Gender" value={newPatientForm.gender} onChange={v=>setNewPatientForm({...newPatientForm,gender:v})} as="select" options={["Male","Female","Other"]} />
        </div>
        <FormInput label="Address" value={newPatientForm.address} onChange={v=>setNewPatientForm({...newPatientForm,address:v})} placeholder="Full address" />
        <FormInput label="Password" value={newPatientForm.password} onChange={v=>setNewPatientForm({...newPatientForm,password:v})} placeholder="Create password" type="password" />
        <FormInput label="Confirm Password" value={newPatientForm.confirmPassword} onChange={v=>setNewPatientForm({...newPatientForm,confirmPassword:v})} placeholder="Confirm password" type="password" />
        <div style={{ marginTop:8 }}>
          <ActionBtn label="Register Patient" color="#8b5cf6" icon="➕" onClick={async () => {
            if (!newPatientForm.name || !newPatientForm.phone || !newPatientForm.password || !newPatientForm.confirmPassword) {
              notify("Please fill all required fields, including password.", "danger");
              return;
            }

            try {
              const response = await fetch('/api/auth/register-patient', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fullName: newPatientForm.name,
                  phoneNumber: newPatientForm.phone,
                  password: newPatientForm.password,
                  confirmPassword: newPatientForm.confirmPassword,
                }),
              });

              const data = await response.json();
              if (!response.ok || !data.success) {
                throw new Error(data.message || 'Unable to register patient.');
              }

              const newP: Patient = {
                id: data.uid || Date.now(),
                name: newPatientForm.name,
                age: parseInt(newPatientForm.age) || 0,
                gender: newPatientForm.gender,
                phone: newPatientForm.phone,
                status: 'Waiting',
                token: `T-00${patients.length + 1}`,
              };
              setPatients((prev: Patient[]) => [...prev, newP]);
              setNewPatientForm({ name:'', phone:'', age:'', gender:'Male', address:'', password:'', confirmPassword:'' });
              notify('Patient registered successfully!', 'success');
            } catch (err) {
              notify(err instanceof Error ? err.message : String(err), 'danger');
            }
          }} />
        </div>
      </div>
    </div>
  );

  if (showDoctorModal) {
    const selectedDoctor = doctors.find((doc) => doc.id === editingDoctorId);
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 }}>
        <div style={{ width: "100%", maxWidth: 520, background: "rgba(15,23,42,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 28, boxShadow: "0 30px 80px rgba(0,0,0,0.4)", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Doctor Payment Details</div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{selectedDoctor?.specialization || "General"}</div>
            </div>
            <button onClick={cancelDoctorEdit} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 12, padding: "8px 12px", cursor: "pointer" }}>Close</button>
          </div>
          {selectedDoctor ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{selectedDoctor.name}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{selectedDoctor.hospital || "Independent Clinic"}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>Fee</div>
                  <div style={{ fontWeight: 700 }}>{selectedDoctor.doctorCharges || selectedDoctor.fee || "$0"}</div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 10, padding: 18, background: "rgba(255,255,255,0.04)", borderRadius: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 13 }}>
                  <span>Total Appointments</span>
                  <span>{appointments.filter((appt) => appt.doctor === selectedDoctor.name).length}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 13 }}>
                  <span>Total Earned</span>
                  <span>Rs. {doctorTotals.find((doc) => doc.id === selectedDoctor.id)?.totalEarned.toFixed(2) ?? "0.00"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: 13 }}>
                  <span>Current Status</span>
                  <span>{selectedDoctor.paymentRequired ? "Payment Required" : "Free"}</span>
                </div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 13, color: "#94a3b8" }}>Consultation Fee</label>
                  <input
                    type="text"
                    value={editingDoctorFee}
                    onChange={(e) => setEditingDoctorFee(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff" }}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", padding: "10px 14px", borderRadius: 14 }}>
                  <input type="checkbox" checked={editingDoctorPaymentRequired} onChange={(e) => setEditingDoctorPaymentRequired(e.target.checked)} />
                  <span style={{ color: "#fff", fontSize: 13 }}>Payment Required</span>
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button onClick={cancelDoctorEdit} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 12, padding: "10px 18px", cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { saveDoctorEdit(selectedDoctor); setShowDoctorModal(false); }} style={{ background: "#10b981", border: "none", color: "#fff", borderRadius: 12, padding: "10px 18px", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          ) : (
            <div style={{ color: "#94a3b8" }}>Doctor information is unavailable.</div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab==="appointments") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Appointment Summary" sub="All booked appointments with editable details" />
      <div style={{ display:"grid", gap:14 }}>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Appointment Overview</div>
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:12 }}>
              <span>Total Appointments</span>
              <span>{appointments.length}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:12 }}>
              <span>Confirmed</span>
              <span>{appointments.filter((a) => a.status === "Confirmed").length}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:12 }}>
              <span>Pending</span>
              <span>{appointments.filter((a) => a.status === "Pending").length}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:12 }}>
              <span>Cancelled</span>
              <span>{appointments.filter((a) => a.status === "Cancelled").length}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:12 }}>
              <span>Awaiting Payment</span>
              <span>{appointments.filter((a) => a.paymentRequired && !a.paid).length}</span>
            </div>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>All Appointments</div>
          {appointments.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>No appointments found.</div>
          ) : (
            <div style={{ display:"grid", gap:12 }}>
              {appointments.map((a) => (
                <div key={a.id} style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, padding:16, borderRadius:14, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <div style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{a.patient || a.patientName || "Unknown Patient"}</div>
                    <div style={{ color:"#94a3b8", fontSize:12, marginTop:6 }}>{formatAppointmentDate(a.date)} • {a.time || "No time"}</div>
                    <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>{a.doctor ? `Doctor: ${a.doctor}` : "Doctor not assigned"}</div>
                    <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>Status: {a.status || "Pending"} • {a.paid ? "Paid" : a.paymentRequired ? "Payment pending" : "No payment"}</div>
                  </div>
                  <div style={{ display:"grid", gap:10, justifyContent:"end" }}>
                    <button onClick={() => openAppointmentEditor(a)} style={{ background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)", color:"#60a5fa", padding:"8px 12px", borderRadius:10, cursor:"pointer", fontSize:12 }}>Edit</button>
                    <button onClick={() => updateAppointmentStatus(a.id, { status: a.status === "Completed" ? "Pending" : "Completed" })} style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", color:"#4ade80", padding:"8px 12px", borderRadius:10, cursor:"pointer", fontSize:12 }}>
                      {a.status === "Completed" ? "Reopen" : "Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAppointmentEditor && editingAppointment ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ width:"100%", maxWidth:560, background:"rgba(15,23,42,0.98)", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)", padding:24, color:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, marginBottom:18 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:700 }}>Edit Appointment</div>
                <div style={{ color:"#94a3b8", fontSize:13, marginTop:6 }}>{editingAppointment.patient || editingAppointment.patientName || "Patient"}</div>
              </div>
              <button onClick={closeAppointmentEditor} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", padding:"8px 12px", borderRadius:12, cursor:"pointer" }}>Close</button>
            </div>
            <div style={{ display:"grid", gap:14 }}>
              <label style={{ display:"grid", gap:8, fontSize:13, color:"#94a3b8" }}>
                Date
                <input type="date" value={editableAppointmentDate} onChange={(e) => setEditableAppointmentDate(e.target.value)} style={{ padding:"12px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#fff" }} />
              </label>
              <label style={{ display:"grid", gap:8, fontSize:13, color:"#94a3b8" }}>
                Time
                <input type="time" value={editableAppointmentTime} onChange={(e) => setEditableAppointmentTime(e.target.value)} style={{ padding:"12px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#fff" }} />
              </label>
              <label style={{ display:"grid", gap:8, fontSize:13, color:"#94a3b8" }}>
                Status
                <select value={editableAppointmentStatus} onChange={(e) => setEditableAppointmentStatus(e.target.value)} style={{ padding:"12px 14px", borderRadius:12, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"#fff" }}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="With Doctor">With Doctor</option>
                  <option value="In Consultation">In Consultation</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
              <label style={{ display:"grid", gap:8, fontSize:13, color:"#94a3b8" }}>
                Paid
                <input type="checkbox" checked={editableAppointmentPaid} onChange={(e) => setEditableAppointmentPaid(e.target.checked)} style={{ width:18, height:18 }} />
              </label>
              {appointmentEditError ? <div style={{ color: "#f87171", fontSize:13 }}>{appointmentEditError}</div> : null}
              <div style={{ display:"flex", justifyContent:"flex-end", gap:12, flexWrap:"wrap" }}>
                <button onClick={closeAppointmentEditor} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", padding:"10px 16px", borderRadius:12, cursor:"pointer" }}>Cancel</button>
                <button onClick={saveAppointmentEdit} style={{ background:"#10b981", border:"none", color:"#fff", padding:"10px 16px", borderRadius:12, cursor:"pointer" }}>
                  {updatingAppointmentId === String(editingAppointment.id) ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (activeTab==="queue") {
    const getDoctorAppointmentsForDate = (doctorId: string, date: string) => {
      const selectedDateObj = new Date(date);
      selectedDateObj.setHours(0, 0, 0, 0);
      const selectedDateMs = selectedDateObj.getTime();

      return appointments.filter((appt) => {
        if (appt.doctorUid !== doctorId && appt.doctor?.toLowerCase() !== selectedDoctor?.name.toLowerCase()) return false;
        
        if (appt.scheduledAt && typeof appt.scheduledAt === "number") {
          const apptDate = new Date(appt.scheduledAt);
          apptDate.setHours(0, 0, 0, 0);
          return apptDate.getTime() === selectedDateMs;
        }
        
        if (appt.date) {
          const dateMatch = appt.date.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)/);
          if (dateMatch) {
            const apptDateObj = new Date(`${dateMatch[2]} ${dateMatch[3]}, ${dateMatch[4]}`);
            apptDateObj.setHours(0, 0, 0, 0);
            return apptDateObj.getTime() === selectedDateMs;
          }
        }
        
        return false;
      });
    };

    const getQueueStats = () => {
      if (!selectedDoctor) return null;
      const appointmentsForDate = getDoctorAppointmentsForDate(selectedDoctor.id, selectedDate);
      const total = appointmentsForDate.length;
      const completed = appointmentsForDate.filter((a) => a.status?.toLowerCase() === "completed" || a.status?.toLowerCase() === "done").length;
      const pending = appointmentsForDate.filter((a) => a.status?.toLowerCase() === "pending" || a.status?.toLowerCase() === "waiting" || a.status?.toLowerCase() === "confirmed").length;
      const cancelled = appointmentsForDate.filter((a) => a.status?.toLowerCase() === "cancelled").length;
      const nextQueue = Math.max(...appointmentsForDate.map((a) => a.queueNumber || 0), 0) + 1;
      const currentQueue = appointmentsForDate.find((a) => a.status?.toLowerCase() === "with doctor" || a.status?.toLowerCase() === "in consultation")?.queueNumber || null;
      const remainingSlots = 30 - pending; // Assuming max 30 appointments per day
      
      return { total, completed, pending, cancelled, nextQueue, currentQueue, remainingSlots, appointmentsForDate };
    };

    const stats = getQueueStats();

    return (
      <div style={{ animation:"fadeIn 0.4s ease" }}>
        <SectionTitle title="👨‍⚕️ Doctor Queue Management" sub="Real-time appointment queue and scheduling" />
        
        {/* Doctor & Date Selection */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, marginBottom:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={{ color:"#94a3b8", fontSize:13, fontWeight:600, marginBottom:8, display:"block" }}>Select Doctor</label>
              <select value={selectedDoctor?.id || ""} onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === e.target.value) || null)} 
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14 }}>
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color:"#94a3b8", fontSize:13, fontWeight:600, marginBottom:8, display:"block" }}>Select Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} 
                style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14 }} />
            </div>
          </div>
        </div>

        {selectedDoctor && stats ? (
          <div>
            {/* Queue Statistics Cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 }}>
              <div style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(124,58,237,0.1))", border:"1px solid rgba(139,92,246,0.3)", borderRadius:14, padding:16 }}>
                <div style={{ color:"#a78bfa", fontSize:12, fontWeight:600, marginBottom:6 }}>Total Appointments</div>
                <div style={{ color:"#fff", fontSize:28, fontWeight:700 }}>{stats.total}</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))", border:"1px solid rgba(16,185,129,0.3)", borderRadius:14, padding:16 }}>
                <div style={{ color:"#6ee7b7", fontSize:12, fontWeight:600, marginBottom:6 }}>Completed</div>
                <div style={{ color:"#fff", fontSize:28, fontWeight:700 }}>{stats.completed}</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(14,165,233,0.15),rgba(2,132,199,0.1))", border:"1px solid rgba(14,165,233,0.3)", borderRadius:14, padding:16 }}>
                <div style={{ color:"#7dd3fc", fontSize:12, fontWeight:600, marginBottom:6 }}>Pending</div>
                <div style={{ color:"#fff", fontSize:28, fontWeight:700 }}>{stats.pending}</div>
              </div>
              <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.1))", border:"1px solid rgba(239,68,68,0.3)", borderRadius:14, padding:16 }}>
                <div style={{ color:"#fca5a5", fontSize:12, fontWeight:600, marginBottom:6 }}>Cancelled</div>
                <div style={{ color:"#fff", fontSize:28, fontWeight:700 }}>{stats.cancelled}</div>
              </div>
            </div>

            {/* Current & Next Queue */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, textAlign:"center" }}>
                <div style={{ color:"#94a3b8", fontSize:12, fontWeight:600, marginBottom:10 }}>Current Queue Number</div>
                <div style={{ fontSize:48, fontWeight:800, color: stats.currentQueue ? "#34d399" : "#64748b" }}>
                  {stats.currentQueue ? `T-${String(stats.currentQueue).padStart(3, "0")}` : "No one"}
                </div>
                <div style={{ color:"#64748b", fontSize:12, marginTop:8 }}>In consultation with doctor</div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, textAlign:"center" }}>
                <div style={{ color:"#94a3b8", fontSize:12, fontWeight:600, marginBottom:10 }}>Next Available Queue</div>
                <div style={{ fontSize:48, fontWeight:800, color:"#38bdf8" }}>T-{String(stats.nextQueue).padStart(3, "0")}</div>
                <div style={{ color:"#64748b", fontSize:12, marginTop:8 }}>{stats.remainingSlots} slots available</div>
              </div>
            </div>

            {/* Queue Management Table */}
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, overflowX:"auto" }}>
              <div style={{ color:"#fff", fontWeight:600, marginBottom:16, fontSize:14 }}>📋 Queue List for {selectedDoctor.name}</div>
              {stats.appointmentsForDate.length === 0 ? (
                <div style={{ color:"#94a3b8", textAlign:"center", padding:"20px" }}>No appointments scheduled for this date</div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 0", fontWeight:600 }}>Queue</th>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 8px", fontWeight:600 }}>Patient</th>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 8px", fontWeight:600 }}>Time</th>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 8px", fontWeight:600 }}>Status</th>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 8px", fontWeight:600 }}>Payment</th>
                      <th style={{ color:"#94a3b8", textAlign:"left", padding:"10px 8px", fontWeight:600 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.appointmentsForDate.sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0)).map((appt) => (
                      <tr key={appt.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", transition:"background 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding:"12px 0", color:"#fff", fontWeight:700 }}>
                          <div style={{ background:"rgba(139,92,246,0.2)", color:"#8b5cf6", padding:"4px 8px", borderRadius:6, width:"fit-content", fontSize:12, fontWeight:600 }}>
                            T-{String(appt.queueNumber || 0).padStart(3, "0")}
                          </div>
                        </td>
                        <td style={{ padding:"12px 8px", color:"#fff" }}>{appt.patient || "Unknown"}</td>
                        <td style={{ padding:"12px 8px", color:"#94a3b8" }}>{appt.time || "--"}</td>
                        <td style={{ padding:"12px 8px" }}>
                          <Badge text={appt.status || "Pending"} type={appt.status === "Completed" ? "success" : appt.status === "Cancelled" ? "danger" : appt.status === "With Doctor" || appt.status === "In Consultation" ? "info" : "warning"} />
                        </td>
                        <td style={{ padding:"12px 8px" }}>
                          <Badge text={appt.paid ? "Paid" : (appt.paymentRequired ? "Pending" : "Free")} type={appt.paid ? "success" : (appt.paymentRequired ? "warning" : "info")} />
                        </td>
                        <td style={{ padding:"12px 8px" }}>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {(appt.status || "").toLowerCase() !== "with doctor" && (appt.status || "").toLowerCase() !== "in consultation" && (appt.status || "").toLowerCase() !== "completed" && (
                              <button onClick={() => updateAppointmentStatus(appt.id, { status: "With Doctor" })} style={{ background:"rgba(14,165,233,0.2)", border:"none", color:"#38bdf8", padding:"4px 8px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:600 }}>Call</button>
                            )}
                            {(appt.status || "").toLowerCase() !== "completed" && (appt.status || "").toLowerCase() !== "cancelled" && (
                              <button onClick={() => updateAppointmentStatus(appt.id, { status: "Completed" })} style={{ background:"rgba(16,185,129,0.2)", border:"none", color:"#34d399", padding:"4px 8px", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:600 }}>Done</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:40, textAlign:"center" }}>
            <div style={{ color:"#94a3b8", fontSize:16 }}>👨‍⚕️ Select a doctor to view queue management</div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

// ---- PHARMACY DASHBOARD ----
function PharmacyDashboard({ activeTab, prescriptions, setPrescriptions, stock, setStock, notify, user }: { activeTab: string; prescriptions: Prescription[]; setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>; stock: Stock[]; setStock: React.Dispatch<React.SetStateAction<Stock[]>>; notify: (msg: string, type?: string) => void; user: User | null; }) {
  const [addMed, setAddMed] = useState({ name:"", qty:"", unit:"tablets" });
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [pharmacyError, setPharmacyError] = useState<string | null>(null);
  const pending = prescriptions.filter(p=>p.status==="Pending");

  const loadPharmacyData = async () => {
    if (!user || user.role !== "pharmacy") return;
    setPharmacyError(null);
    setLoadingStock(true);
    setLoadingPrescriptions(true);

    try {
      const [stockRes, prescriptionsRes] = await Promise.all([
        fetch("/api/pharmacy/stock"),
        fetch("/api/pharmacy/prescriptions"),
      ]);

      if (stockRes.ok) {
        const data = await stockRes.json();
        if (Array.isArray(data.stock)) {
          setStock(data.stock);
        }
      } else {
        const body = await stockRes.json().catch(() => null);
        setPharmacyError(body?.message || "Unable to load stock.");
      }

      if (prescriptionsRes.ok) {
        const data = await prescriptionsRes.json();
        if (Array.isArray(data.prescriptions)) {
          setPrescriptions(data.prescriptions);
        }
      } else {
        const body = await prescriptionsRes.json().catch(() => null);
        setPharmacyError(body?.message || "Unable to load prescriptions.");
      }
    } catch (error) {
      setPharmacyError(error instanceof Error ? error.message : "Unable to load pharmacy data.");
    } finally {
      setLoadingStock(false);
      setLoadingPrescriptions(false);
    }
  };

  useEffect(() => {
    loadPharmacyData();
  }, [user]);

  const addStockItem = async () => {
    if (!addMed.name || !addMed.qty) {
      notify("Please fill required fields", "danger");
      return;
    }

    setPharmacyError(null);
    setLoadingStock(true);

    try {
      const response = await fetch("/api/pharmacy/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addMed.name,
          qty: Number(addMed.qty),
          unit: addMed.unit,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Unable to add medicine to stock.");
      }

      setStock((prev) => [...prev, data.item]);
      setAddMed({ name: "", qty: "", unit: "tablets" });
      notify("Medicine added to stock!");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to add medicine to stock.", "danger");
    } finally {
      setLoadingStock(false);
    }
  };

  const markPrescriptionDispensed = async (id: string | number) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${String(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dispensed" }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Unable to update prescription status.");
      }

      setPrescriptions((prev) => prev.map((prescription) => (prescription.id === id ? { ...prescription, status: "Dispensed" } : prescription)));
      notify("Prescription marked as dispensed.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to update prescription status.", "danger");
    }
  };

  if (activeTab==="dashboard") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Pharmacy Dashboard 💊" sub="Prescription & Stock Management" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:28 }}>
        <StatCard icon="📋" label="Pending Prescriptions" value={pending.length} color="#f59e0b" />
        <StatCard icon="✅" label="Dispensed Today" value={prescriptions.filter(p=>p.status==="Dispensed").length} color="#10b981" />
        <StatCard icon="📦" label="Total Medicines" value={stock.length} color="#0ea5e9" />
        <StatCard icon="⚠️" label="Low Stock" value={stock.filter(s=>s.status==="Low Stock"||s.status==="Out of Stock").length} color="#ef4444" />
      </div>
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
        <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Pending Prescriptions</div>
        {pending.map(p=>(
          <div key={p.id} className="table-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ flex:1 }}>
              <div style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{p.patientName || p.patient || "Unknown patient"}</div>
              <div style={{ color:"#64748b", fontSize:12 }}>{p.doctorName || p.doctor || "Unknown doctor"} · {p.date}</div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {p.medicines.map((m, idx) => {
                const medicine = typeof m === "string" ? { name: m } : m;
                const key = typeof m === "string" ? `${m}-${idx}` : medicine.id || `${medicine.name}-${idx}`;
                return (
                  <span key={key} style={{ background:"rgba(245,158,11,0.12)", color:"#fbbf24", padding:"3px 8px", borderRadius:6, fontSize:11 }}>
                    {medicine.name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (activeTab==="prescriptions") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="All Prescriptions" sub="View and manage prescriptions" />
      {prescriptions.map(p=>(
        <div key={p.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ color:"#fff", fontSize:15, fontWeight:600 }}>{p.patientName || p.patient || "Unknown patient"}</div>
              <div style={{ color:"#64748b", fontSize:12 }}>{p.doctorName || p.doctor || "Unknown doctor"} · {p.date}</div>
            </div>
            <Badge text={p.status} type={p.status==="Dispensed"?"success":"warning"} />
          </div>
          <div style={{ display:"grid", gap:10, marginBottom:12 }}>
            {p.medicines.map((m, idx) => {
              const medicine = typeof m === "string" ? { name: m } : m;
              const key = typeof m === "string" ? `${m}-${idx}` : medicine.id || `${medicine.name}-${idx}`;
              return (
                <div key={key} style={{ background:"rgba(14,165,233,0.12)", color:"#0f172a", padding:"12px", borderRadius:12, fontSize:12, display:"grid", gap:4 }}>
                  <div style={{ fontWeight:700 }}>{medicine.name}</div>
                  {medicine.dosage ? <div>Dosage: {medicine.dosage}</div> : null}
                  {medicine.frequency && medicine.duration ? (
                    <div>{medicine.frequency} time{medicine.frequency === 1 ? "" : "s"} per day × {medicine.duration} day{medicine.duration === 1 ? "" : "s"}</div>
                  ) : null}
                  {medicine.totalQuantity ? <div>Total quantity: {medicine.totalQuantity}</div> : null}
                  {medicine.specialNotes ? <div>Notes: {medicine.specialNotes}</div> : null}
                </div>
              );
            })}
          </div>
          {p.status==="Pending" && <ActionBtn label="Mark as Dispensed" color="#f59e0b" icon="✅" onClick={()=>markPrescriptionDispensed(p.id)} />}
        </div>
      ))}
    </div>
  );

  if (activeTab==="stock") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Medicine Stock" sub="Inventory management" />
      <div style={{ display:"grid", gap:12 }}>
        {stock.map(s=>(
          <div key={s.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:24 }}>💊</span>
            <div style={{ flex:1 }}><div style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{s.name}</div><div style={{ color:"#64748b", fontSize:12 }}>{s.qty} {s.unit}</div></div>
            <Badge text={s.status} type={s.status==="In Stock"?"success":s.status==="Low Stock"?"warning":"danger"} />
          </div>
        ))}
      </div>
    </div>
  );

  if (activeTab==="dispense") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Dispense Medicine" sub="Issue medicines and update stock" />
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28, maxWidth:480 }}>
        <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Add Medicine to Stock</div>
        <FormInput label="Medicine Name" value={addMed.name} onChange={v=>setAddMed({...addMed,name:v})} placeholder="e.g. Paracetamol 500mg" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <FormInput label="Quantity" value={addMed.qty} onChange={v=>setAddMed({...addMed,qty:v})} type="number" placeholder="Units" />
          <FormInput label="Unit" value={addMed.unit} onChange={v=>setAddMed({...addMed,unit:v})} as="select" options={["tablets","capsules","bottles","vials","sachets"]} />
        </div>
        <ActionBtn label={loadingStock ? "Saving..." : "Add to Stock"} color="#f59e0b" icon="📦" onClick={addStockItem} />
      </div>
    </div>
  );
  return null;
}

// ---- ADMIN DASHBOARD ----
function AdminDashboard({ activeTab, patients, appointments, notify }: { activeTab: string; patients: Patient[]; appointments: Appointment[]; notify: (msg: string, type?: string) => void }) {
  const [stats, setStats] = useState<any | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [reportFilter, setReportFilter] = useState<ReportRange>("monthly");
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<any | null>(null);
  const [activeReportType, setActiveReportType] = useState<ReportType | "">("patients");

  const buildReportUrl = (type: ReportType, exportType?: string) => {
    const url = new URL(`/api/reports/${type}`, window.location.origin);
    url.searchParams.set("range", reportFilter);
    if (reportFilter === "custom") {
      if (customStartDate) url.searchParams.set("startDate", customStartDate);
      if (customEndDate) url.searchParams.set("endDate", customEndDate);
    }
    if (exportType) {
      url.searchParams.set("export", exportType);
    }
    return url.toString();
  };

  const loadReport = async (type: ReportType) => {
    setActiveReportType(type);
    setReportError(null);
    setReportLoading(true);
    setReportResult(null);
    try {
      const response = await fetch(buildReportUrl(type));
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Unable to load report.");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Unable to load report.");
      }
      setReportResult(data);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : String(error));
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = async (type: ReportType, exportType: "pdf" | "excel") => {
    setReportError(null);
    try {
      const response = await fetch(buildReportUrl(type, exportType));
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Download failed.");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${type}-report.${exportType === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setReportError(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || null);
        }
      } catch (e) {}
      setLoadingStats(false);
    };

    loadStats();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch('/api/admin/users');
        if (res.ok) {
          const data = await res.json();
          setAllUsers(Array.isArray(data.users) ? data.users : []);
        }
      } catch (e) {}
      setLoadingUsers(false);
    };

    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  if (activeTab==="dashboard") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="Admin Control Center ⚙️" sub="System overview & management" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Users" value={stats ? stats.totalUsers : allUsers.length} color="#ef4444" />
        <StatCard icon="🏥" label="Total Patients" value={stats ? stats.totalPatients : patients.length} color="#0ea5e9" />
        <StatCard icon="📅" label="Appointments" value={stats ? stats.totalAppointments : appointments.length} color="#10b981" />
        <StatCard icon="✅" label="System Health" value={stats ? "Online" : "Unknown"} color="#8b5cf6" sub="All services running" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>Quick Stats</div>
          {[["Active Doctors","2","✅"],["On-duty Staff","3","✅"],["Pending Prescriptions","1","⚠️"],["Low Stock Alerts","2","⚠️"]].map(([k,v,i])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>{i} {k}</span>
              <span style={{ color:"#fff", fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20 }}>
          <div style={{ color:"#fff", fontWeight:600, marginBottom:16 }}>System Services</div>
          {["Patient Management","Appointment System","Pharmacy Module","Queue System","Reports Engine"].map(s=>(
            <div key={s} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>{s}</span>
              <Badge text="Online" type="success" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (activeTab==="users") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="All Users" sub="Manage system users and roles" />
      <div style={{ display:"grid", gap:12 }}>
        {loadingUsers ? (
          <div style={{ color: "#94a3b8" }}>Loading users…</div>
        ) : allUsers.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>No users available.</div>
        ) : (
          allUsers.map((u,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#ef4444,#dc2626)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700 }}>{String(u.fullName || (u.username || u.email || 'U')).charAt(0)}</div>
              <div style={{ flex:1 }}><div style={{ color:"#fff", fontSize:14, fontWeight:600 }}>{u.fullName || u.username || u.email}</div><div style={{ color:"#64748b", fontSize:12 }}>Role: {u.role || 'user'}</div></div>
              <Badge text={u.role} type={u.role==="doctor"?"success":u.role==="patient"?"info":u.role==="admin"?"danger":"default"} />
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (activeTab==="reports") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="System Reports" sub="Analytics & insights" />
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:20 }}>
        {[["today","Today"],["weekly","Weekly"],["monthly","Monthly"],["custom","Custom"]].map(([value,label]) => (
          <button key={String(value)} onClick={() => setReportFilter(value as ReportRange)}
            style={{ background: reportFilter === value ? "linear-gradient(135deg,#0ea5e9,#3b82f6)" : "rgba(255,255,255,0.06)", color: reportFilter === value ? "#fff" : "#cbd5e1", border: "1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            {label}
          </button>
        ))}
      </div>

      {reportFilter === "custom" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
          <FormInput label="Start date" value={customStartDate} onChange={setCustomStartDate} type="date" />
          <FormInput label="End date" value={customEndDate} onChange={setCustomEndDate} type="date" />
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16, marginBottom:24 }}>
        {[
          { id: "patients", title: "Patient Report", desc: "Registrations, demographics, and growth", icon: "👥", color: "#0ea5e9" },
          { id: "appointments", title: "Appointment Report", desc: "Status trends and doctor load", icon: "📅", color: "#10b981" },
          { id: "pharmacy", title: "Pharmacy Report", desc: "Stock, prescriptions, and dispensing", icon: "💊", color: "#f59e0b" },
          { id: "revenue", title: "Revenue Report", desc: "Billing, earnings, and cash flow", icon: "💰", color: "#8b5cf6" },
        ].map((report) => (
          <div key={report.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:22, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:28, marginBottom:12 }}>{report.icon}</div>
              <div style={{ color:"#fff", fontSize:16, fontWeight:700, marginBottom:6 }}>{report.title}</div>
              <div style={{ color:"#94a3b8", fontSize:13, lineHeight:1.6 }}>{report.desc}</div>
            </div>
            <ActionBtn label="Generate" color={report.color} icon="📊" onClick={() => loadReport(report.id as ReportType)} />
          </div>
        ))}
      </div>

      {reportLoading && (
        <div style={{ padding:24, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, color:"#94a3b8" }}>Generating report, please wait…</div>
      )}

      {reportError && (
        <div style={{ padding:20, borderRadius:14, background:"rgba(239,68,68,0.14)", color:"#f87171", fontSize:13, marginBottom:20 }}>{reportError}</div>
      )}

      {reportResult && (
        <div style={{ display:"grid", gap:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div>
              <div style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Report Preview</div>
              <div style={{ color:"#fff", fontSize:20, fontWeight:700 }}>{activeReportType === "patients" ? "Patient Report" : activeReportType === "appointments" ? "Appointment Report" : activeReportType === "pharmacy" ? "Pharmacy Report" : "Revenue Report"}</div>
              <div style={{ color:"#64748b", fontSize:13, marginTop:4 }}>{reportResult.range?.label || "Current period"}</div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <ActionBtn label="Download PDF" color="#0ea5e9" icon="📄" onClick={() => downloadReport(activeReportType || "patients", "pdf")} />
              <ActionBtn label="Download Excel" color="#14b8a6" icon="📥" onClick={() => downloadReport(activeReportType || "patients", "excel")} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
            {Object.entries(reportResult.summary || {}).map(([label, value]) => (
              <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:18 }}>
                <div style={{ color:"#94a3b8", fontSize:12, marginBottom:6, textTransform:"capitalize" }}>{label.replace(/([A-Z])/g, " $1")}</div>
                <div style={{ color:"#fff", fontSize:26, fontWeight:700 }}>{String(value)}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {reportResult.genderDistribution && (
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:18 }}>
                <div style={{ color:"#94a3b8", fontSize:13, marginBottom:14 }}>Gender Distribution</div>
                {Object.entries(reportResult.genderDistribution).map(([label,value]) => (
                  <div key={label} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", fontSize:13, marginBottom:4 }}><span>{label}</span><span>{String(value)}</span></div>
                    <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:999 }}><div style={{ width:`${Math.min(100, Number(value) * 10)}%`, height:8, background:"#38bdf8", borderRadius:999 }} /></div>
                  </div>
                ))}
              </div>
            )}

            {reportResult.ageDistribution && (
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:18 }}>
                <div style={{ color:"#94a3b8", fontSize:13, marginBottom:14 }}>Age Distribution</div>
                {Object.entries(reportResult.ageDistribution).map(([label,value]) => (
                  <div key={label} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", fontSize:13, marginBottom:4 }}><span>{label}</span><span>{String(value)}</span></div>
                    <div style={{ height:8, background:"rgba(255,255,255,0.08)", borderRadius:999 }}><div style={{ width:`${Math.min(100, Number(value) * 8)}%`, height:8, background:"#f97316", borderRadius:999 }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {reportResult.appointmentTrends && (
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:18 }}>
              <div style={{ color:"#94a3b8", fontSize:13, marginBottom:14 }}>Trend Overview</div>
              {reportResult.appointmentTrends.map((item: any) => (
                <div key={item.label} style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:10, color:"#fff", fontSize:13 }}>
                  <span>{item.label}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (activeTab==="settings") return (
    <div style={{ animation:"fadeIn 0.4s ease" }}>
      <SectionTitle title="System Settings" sub="Configure clinic settings" />
      <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:28, maxWidth:520 }}>
        {[{label:"Clinic Name",val:"SmartClinic Dambulla"},{label:"Address",val:"123 Hospital Rd, Dambulla, Central Province"},{label:"Phone",val:"+94 66 228 1234"},{label:"Email",val:"info@smartclinic.lk"},{label:"Working Hours",val:"8:00 AM – 6:00 PM"}].map(s=>(
          <div key={s.label} style={{ marginBottom:16 }}>
            <label style={{ color:"#64748b", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>{s.label}</label>
            <input defaultValue={s.val} style={{ width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:14, boxSizing:"border-box" }} />
          </div>
        ))}
        <ActionBtn label="Save Settings" color="#ef4444" icon="💾" onClick={()=>notify("Settings saved!")} />
      </div>
    </div>
  );
  return null;
}

export default function LoginPage() {
  return <LoginPageInner />;
}