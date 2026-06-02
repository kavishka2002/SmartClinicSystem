import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/session";
import { getRedirectForRole } from "../../lib/authService";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect(getRedirectForRole(user.role) || "/login");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050816", color: "#fff", padding: "40px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 32 }}>
          <div>
            <p style={{ margin: 0, color: "#f472b6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>Admin Console</p>
            <h1 style={{ margin: "12px 0 0", fontSize: "clamp(2rem, 3vw, 3rem)" }}>Welcome, {user.fullName}</h1>
            <p style={{ color: "#94a3b8", marginTop: 12, maxWidth: 680 }}>Manage users, review reports, and oversee system settings from the administration dashboard.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Role</div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>Admin</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { title: "User Management", description: "View staff, doctors, and patients." },
            { title: "Reports", description: "Review clinic performance metrics." },
            { title: "System Settings", description: "Adjust application settings and access." },
          ].map((card) => (
            <div key={card.title} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{card.title}</h2>
              <p style={{ marginTop: 10, color: "#cbd5e1" }}>{card.description}</p>
            </div>
          ))}
        </div>

        <section style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 30 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Admin actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 20 }}>
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255,255,255,0.03)" }}>
              <p style={{ margin: 0, color: "#94a3b8" }}>Review clinic analytics</p>
            </div>
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255,255,255,0.03)" }}>
              <p style={{ margin: 0, color: "#94a3b8" }}>Manage account roles</p>
            </div>
            <div style={{ padding: 20, borderRadius: 18, background: "rgba(255,255,255,0.03)" }}>
              <p style={{ margin: 0, color: "#94a3b8" }}>Approve system changes</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
