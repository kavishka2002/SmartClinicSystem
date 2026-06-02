"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const COLORS = {
  primary: "#2563EB",
  mint: "#DBEAFE",
  deepSage: "#1E40AF",
  textLight: "#64748B",
  border: "#E2E8F0",
  cardBg: "#FFFFFF",
  cream: "#F8FAFC",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12, color: COLORS.textLight, textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Unable to load profile");
      }
      const data = await res.json();
      setProfile(data.user || null);
      setForm(data.user || {});
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev: any) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(f);
  }

  async function save() {
    try {
      setSaving(true);
      const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Unable to save profile");
      setProfile(data.user || profile);
      setEditing(false);
      setMessage("Profile updated successfully.");
      // refresh to ensure UI shows latest backend state
      setTimeout(() => fetchProfile(), 400);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  if (loading && !profile) return <div style={{ padding: 24 }}>Loading profile...</div>;

  return (
    <div className="container" style={{ maxWidth: 900, marginTop: 24 }}>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ width: 260 }}>
          <div className="card" style={{ padding: 18, borderRadius: 14, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              <div style={{ width: 120, height: 120, borderRadius: 16, overflow: "hidden", background: COLORS.cream, display: "grid", placeItems: "center" }}>
                {form?.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ fontSize: 36, color: COLORS.primary, fontWeight: 800 }}>{(profile?.fullName || "").split(" ").map((n: string) => n[0]).join("").slice(0,2)}</div>
                )}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: COLORS.deepSage }}>{profile?.fullName}</div>
              <div style={{ color: COLORS.textLight }}>{profile?.email}</div>
              <div style={{ width: "100%", display: "flex", gap: 8 }}>
                <label style={{ flex: 1, cursor: "pointer", background: COLORS.mint, padding: "8px 10px", borderRadius: 8, textAlign: "center" }}>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
                </label>
                <button style={{ flex: 1 }} onClick={() => { setEditing((s) => !s); setForm(profile); }}>{editing ? "Cancel" : "Edit"}</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="card" style={{ padding: 18, borderRadius: 14, background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
            <h2 style={{ margin: 0, marginBottom: 12 }}>Profile</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <div className="form-row">
                <div className="form-col">
                  <label>Full name</label>
                  {editing ? <input className="input" value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /> : <div className="wrap-text">{profile?.fullName}</div>}
                </div>
                <div className="form-col">
                  <label>Email</label>
                  <div className="wrap-text">{profile?.email}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Phone</label>
                  {editing ? <input className="input" value={form.phoneNumber || ""} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /> : <div className="wrap-text">{profile?.phoneNumber || "Not set"}</div>}
                </div>
                <div className="form-col">
                  <label>Address</label>
                  {editing ? <input className="input" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /> : <div className="wrap-text">{profile?.address || "Not set"}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Date of birth</label>
                  {editing ? <input className="input" type="date" value={form.dob ? form.dob.split("T")[0] : ""} onChange={(e) => setForm({ ...form, dob: e.target.value })} /> : <div className="wrap-text">{profile?.dob || "Not set"}</div>}
                </div>
                <div className="form-col">
                  <label>Gender</label>
                  {editing ? (
                    <select className="input" value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="wrap-text">{profile?.gender || "Not set"}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <label>Role</label>
                  <div className="wrap-text">{profile?.role}</div>
                </div>
                <div className="form-col">
                  <label>Registered</label>
                  <div className="wrap-text">{profile?.createdAt ? new Date((profile.createdAt as any)?.toDate ? (profile.createdAt as any).toDate() : profile.createdAt).toLocaleDateString() : "Unknown"}</div>
                </div>
              </div>

              {editing && (
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <button className={"btn primary"} onClick={save} disabled={saving}>
                    {saving ? <span className="spinner" style={{ marginRight: 8 }}></span> : null}
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn ghost" onClick={() => { setEditing(false); setForm(profile); }} disabled={saving}>Cancel</button>
                </div>
              )}
              {message && <div style={{ marginTop: 12, color: COLORS.primary }}>{message}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
