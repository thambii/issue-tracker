"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import StatusBadge from "@/components/StatusBadge";
import { api, useMe, formatDate } from "@/lib/client";

export default function IssuePage() {
  const { id } = useParams();
  const router = useRouter();
  const me = useMe();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "" });
  const [assignee, setAssignee] = useState("");
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [i, c] = await Promise.all([api(`/api/issues/${id}`), api(`/api/issues/${id}/comments`)]);
    setIssue(i.issue);
    setComments(c.comments);
  }, [id]);

  useEffect(() => {
    if (!me) return;
    load().catch((e) => setError(e.message));
    if (me.role === "admin") {
      api("/api/users").then((d) => setUsers(d.users)).catch(() => {});
    }
  }, [me, load]);

  // Runs an action, shows any error, refreshes the page data
  async function run(fn) {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  }

  const save = (e) =>
    run(async () => {
      e.preventDefault();
      const d = await api(`/api/issues/${id}`, { method: "PUT", body: draft });
      setIssue(d.issue);
      setEditing(false);
    });

  const remove = () =>
    run(async () => {
      if (!confirm("Delete this issue?")) return;
      await api(`/api/issues/${id}`, { method: "DELETE" });
      router.replace("/");
    });

  const assign = () =>
    run(async () => {
      if (!assignee) throw new Error("Please choose a user");
      const d = await api(`/api/issues/${id}/assign`, { method: "POST", body: { userId: assignee } });
      setIssue(d.issue);
    });

  const close = () =>
    run(async () => {
      const d = await api(`/api/issues/${id}/close`, { method: "POST" });
      setIssue(d.issue);
    });

  const addComment = (e) =>
    run(async () => {
      e.preventDefault();
      const d = await api(`/api/issues/${id}/comments`, { method: "POST", body: { text: commentText } });
      setComments([...comments, d.comment]);
      setCommentText("");
    });

  if (!me) return null;

  const isAdmin = me.role === "admin";
  const canEdit = issue && (issue.created_by === me.id || isAdmin);
  const canClose = issue && issue.status !== "Closed" && (issue.assigned_to === me.id || isAdmin);
  const canAssign = issue && isAdmin && issue.status !== "Closed";

  return (
    <>
      <Nav me={me} />
      <main className="container">
        <Link href="/" className="back-link">&larr; Back to all issues</Link>

        {error && <div className="error">{error}</div>}
        {!issue && !error && <div className="empty">Loading...</div>}

        {issue && (
          <>
            <div className="card">
              {editing ? (
                <form onSubmit={save}>
                  <label htmlFor="t">Title</label>
                  <input id="t" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
                  <label htmlFor="d">Description</label>
                  <textarea id="d" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
                  <div className="spacer" />
                  <div className="row">
                    <button className="btn">Save</button>
                    <button type="button" className="btn secondary" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="row between">
                    <h1 className="page-title" style={{ fontSize: 24, margin: 0 }}>#{issue.id} {issue.title}</h1>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="meta">
                    Created by {issue.created_by_name} on {formatDate(issue.created_at)}
                    {" · "}
                    {issue.assigned_to_name ? `Assigned to ${issue.assigned_to_name}` : "Unassigned"}
                  </p>
                  <p className="desc pre">{issue.description || "No description."}</p>

                  <div className="row">
                    {canClose && <button className="btn success" onClick={close}>Mark as Closed</button>}
                    {canEdit && (
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setDraft({ title: issue.title, description: issue.description });
                          setEditing(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canEdit && <button className="btn danger" onClick={remove}>Delete</button>}
                  </div>
                </>
              )}
            </div>

            {canAssign && (
              <div className="card">
                <h3>Assign issue (admin)</h3>
                <div className="row">
                  <select style={{ flex: 1, minWidth: 200 }} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                    <option value="">Choose a user...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                  <button className="btn" onClick={assign}>Assign</button>
                </div>
                <p className="meta">Assigning moves the issue to "In Progress".</p>
              </div>
            )}

            <div className="card">
              <h3>Comments ({comments.length})</h3>
              {comments.length === 0 && <div className="empty">No comments yet.</div>}
              {comments.map((c) => (
                <div key={c.id} className="comment">
                  <div className="comment-avatar" aria-hidden="true">{(c.user_name || "?").charAt(0).toUpperCase()}</div>
                  <div className="comment-body">
                    <div className="comment-head">
                      <strong>{c.user_name}</strong> · {formatDate(c.created_at)}
                    </div>
                    <div className="pre">{c.text}</div>
                  </div>
                </div>
              ))}
              <form className="comment-form" onSubmit={addComment}>
                <label htmlFor="c">Add a comment</label>
                <textarea id="c" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} required />
                <div className="spacer" />
                <button className="btn">Post comment</button>
              </form>
            </div>
          </>
        )}
      </main>
    </>
  );
}