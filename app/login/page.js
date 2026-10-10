"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import "./login.css";

// Quick-fill buttons for the demo accounts
const DEMO = [
  { label: "Admin", email: "admin@example.com", password: "admin123" },
  { label: "Alice", email: "alice@example.com", password: "user123" },
  { label: "Bob", email: "bob@example.com", password: "user123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  function fillDemo(account) {
    setForm({ ...form, email: account.email, password: account.password });
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        body: form,
      });
      router.replace("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="lp">
      <section className="lp-card">
        <div className="lp-brand">
          <div className="lp-logo" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="16" />
              <path d="M16.5 24.5l5.2 5.2 9.8-10.4" />
            </svg>
          </div>
          <div className="lp-wordmark">TRACKIFY</div>
        </div>

        <h1 className="lp-title">{isLogin ? "Welcome back" : "Create your account"}</h1>

        <form className="lp-form" onSubmit={submit}>
          {!isLogin && (
            <div className="lp-field">
              <label htmlFor="name">Full name</label>
              <input id="name" autoComplete="name" value={form.name} onChange={set("name")} required />
            </div>
          )}

          <div className="lp-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
          </div>

          <div className="lp-field">
            <label htmlFor="password">Password</label>
            <div className="lp-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={form.password}
                onChange={set("password")}
                required
              />
              <button
                type="button"
                className="lp-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c5 0 8.5 4 9.5 7a11.7 11.7 0 0 1-2.6 4.1M6.6 6.6A11.8 11.8 0 0 0 2.5 12c1 3 4.5 7 9.5 7a9.7 9.7 0 0 0 4.2-.9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 12C3.5 9 7 5 12 5s8.5 4 9.5 7c-1 3-4.5 7-9.5 7s-8.5-4-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="lp-error" role="alert">
              {error}
            </div>
          )}

          <button className="lp-btn" disabled={busy}>
            {busy && <span className="lp-spinner" aria-hidden="true" />}
            {busy ? "Please wait" : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="lp-switch">
          {isLogin ? "Are you a new member?" : "Already a member?"}{" "}
          <button type="button" onClick={() => switchMode(isLogin ? "register" : "login")}>
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>

        {isLogin && (
          <div className="lp-demo">
            <span>Demo accounts · tap to fill</span>
            <div className="lp-chips">
              {DEMO.map((d) => (
                <button key={d.label} type="button" className="lp-chip" onClick={() => fillDemo(d)}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}