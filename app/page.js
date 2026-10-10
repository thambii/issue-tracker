"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import StatusBadge from "@/components/StatusBadge";
import { api, useMe, formatDate } from "@/lib/client";

const FILTERS = ["All", "Open", "In Progress", "Closed"];

export default function HomePage() {
  const me = useMe();
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [s, i] = await Promise.all([api("/api/dashboard"), api("/api/issues")]);
    setStats(s);
    setIssues(i.issues);
  }, []);

  useEffect(() => {
    if (me) load().catch((e) => setError(e.message));
  }, [me, load]);
  
  async function create(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/issues", { method: "POST", body: form });
      setForm({ title: "", description: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (!me) return null;

  const shown = issues ? issues.filter((i) => filter === "All" || i.status === filter) : [];

  return (
    <>
      <Nav me={me} />
      <main className="container">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Overview of every issue across the team.</p>

        <div className="stats">
          <div className="stat">
            <div className="num">{stats?.total ?? "-"}</div>
            <div className="label">Total issues</div>
          </div>
          <div className="stat open">
            <div className="num">{stats?.open ?? "-"}</div>
            <div className="label">Open</div>
          </div>
          <div className="stat progress">
            <div className="num">{stats?.in_progress ?? "-"}</div>
            <div className="label">In Progress</div>
          </div>
          <div className="stat closed">
            <div className="num">{stats?.closed ?? "-"}</div>
            <div className="label">Closed</div>
          </div>
        </div>

        <form className="card" onSubmit={create}>
          <h3>Raise a new issue</h3>
          <label htmlFor="title">Title</label>
          <input id="title" placeholder="Short summary of the problem" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label htmlFor="desc">Description</label>
          <textarea id="desc" placeholder="What happened?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <div className="error">{error}</div>}
          <div className="spacer" />
          <button className="btn" disabled={busy}>{busy ? "Saving..." : "Create issue"}</button>
        </form>

        <div className="card">
          <div className="row between">
            <h3 style={{ margin: 0 }}>All issues</h3>
            <select style={{ width: "auto", minWidth: 150, height: 40, borderRadius: 999 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              {FILTERS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="spacer" />

          {!issues && <div className="empty">Loading...</div>}
          {issues && shown.length === 0 && <div className="empty">No issues to show.</div>}
          {shown.map((i) => (
            <Link key={i.id} href={`/issues/${i.id}`} className="issue-item">
              <div className="row between">
                <div className="issue-title"><span className="issue-id">#{i.id}</span>{i.title}</div>
                <StatusBadge status={i.status} />
              </div>
              <div className="meta">
                By {i.created_by_name} on {formatDate(i.created_at)}
                {" · "}
                {i.assigned_to_name ? `Assigned to ${i.assigned_to_name}` : "Unassigned"}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}