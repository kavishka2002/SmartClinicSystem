"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DemoUser {
  phone: string;
  password: string;
  name: string;
  age?: number;
  gender?: string;
  address?: string;
}

interface Notification {
  msg: string;
  type: string;
}

const DEMO_PATIENTS: Record<string, DemoUser> = {
  patient: {
    phone: "0771234567",
    password: "patient123",
    name: "Amal Perera",
    age: 32,
    gender: "Male",
    address: "123 Kandy Rd, Colombo",
  },
};

export default function PatientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");

  const notify = (msg: string, type: string = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedPhone || !trimmedPassword) {
      setError("Phone number and password are required.");
      setIsLoading(false);
      return;
    }

    // Check demo account
    try {
      const demoUser = DEMO_PATIENTS.patient;
      if (trimmedPhone === demoUser.phone && trimmedPassword === demoUser.password) {
        notify("Logged into demo account successfully!");
        setTimeout(() => {
          router.push("/patient/dashboard");
        }, 800);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Continue to real login
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier: trimmedPhone, password: trimmedPassword, role: "patient" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      notify("Login successful! Redirecting...");
      setTimeout(() => {
        router.push(data.redirectTo || "/patient/dashboard");
      }, 800);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    const { name, phone: regPhone, age, gender, address, password: regPassword, confirmPassword } = registerForm;

    if (!name || !regPhone || !regPassword || !confirmPassword) {
      setRegisterError("Name, phone, and password are required.");
      return;
    }

    if (regPassword !== confirmPassword) {
      setRegisterError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 6) {
      setRegisterError("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone: regPhone,
          password: regPassword,
          name,
          age: age ? parseInt(age) : undefined,
          gender,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      notify("Registration successful! You can now login.");
      setShowRegister(false);
      setRegisterForm({
        name: "",
        phone: "",
        age: "",
        gender: "Male",
        address: "",
        password: "",
        confirmPassword: "",
      });
      setPhone(regPhone);
      setPassword(regPassword);
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .form-container { animation: fadeIn 0.6s ease; }
        .notify-toast { animation: slideLeft 0.4s ease; }
        input, button { outline: none; }
        input:focus { border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2) !important; }
        button:hover { transform: translateY(-2px); }
        button:active { transform: scale(0.98); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
      `}</style>

      {/* Animated background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)",
            top: -200,
            right: -200,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
            bottom: -100,
            left: -100,
          }}
        />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className="notify-toast"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: notification.type === "success" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 300,
          }}
        >
          <span>{notification.type === "success" ? "✓" : "✕"}</span>
          {notification.msg}
        </div>
      )}

      {/* Back to home link */}
      <div style={{ position: "fixed", top: 20, left: 20, zIndex: 100 }}>
        <Link
          href="/"
          style={{
            color: "#0ea5e9",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = "#0284c7";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = "#0ea5e9";
          }}
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main container */}
      <div
        className="form-container"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(14, 165, 233, 0.2)",
          borderRadius: 16,
          padding: "40px",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ color: "#fff", fontSize: 28, margin: "0 0 8px 0", fontWeight: 700 }}>Patient Portal</h1>
          <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14, margin: 0 }}>Login to manage your health</p>
        </div>

        {!showRegister ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255, 255, 255, 0.6)" }}>
              Don'Nt have an account?{" "}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0ea5e9",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Register here
              </button>
            </div>

            <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", textAlign: "center", marginTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 12 }}>
              <strong>Demo Credentials:</strong>
              <br />
              Phone: 0771234567
              <br />
              Password: patient123
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Full Name</label>
              <input
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Enter your full name"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Phone Number</label>
              <input
                type="tel"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="Enter your phone number"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Age</label>
                <input
                  type="number"
                  value={registerForm.age}
                  onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                  placeholder="Age"
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Gender</label>
                <select
                  value={registerForm.gender}
                  onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 14,
                  }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Address</label>
              <input
                type="text"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                placeholder="Enter your address"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="Enter a password"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontWeight: 500 }}>Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                style={{
                  padding: "10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            {registerError && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#fca5a5", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
                {registerError}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => setShowRegister(false)}
              style={{
                background: "none",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.8)",
                borderRadius: 8,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
