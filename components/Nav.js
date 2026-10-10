"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export default function Nav({ me }) {
  const router = useRouter();

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header className="nav">
      <Link href="/" className="brand">
        <span className="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="16" />
            <path d="M16.5 24.5l5.2 5.2 9.8-10.4" />
          </svg>
        </span>
        TRACKIFY
      </Link>
      <div className="nav-right">
        <span className="who">
          <span className="who-name">{me.name}</span>
          <span className={`badge role-${me.role}`}>{me.role}</span>
        </span>
        <button className="btn secondary small" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}