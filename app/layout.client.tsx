"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          background: "rgba(15, 23, 42, 0.94)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>SmartClinic</div>
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>
              Home
            </Link>
            <a href="/#about" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>
              About
            </a>
            <a href="/#services" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: 14 }}>
              Services
            </a>
          </nav>
        </div>

      </header>
      {children}
    </div>
  );
}
