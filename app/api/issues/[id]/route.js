import { query } from "@/lib/db";
import { handler, requireUser, readBody, HttpError, json, findIssue } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = handler(async (req, { params }) => {
  await requireUser();
  const { id } = await params;
  return json({ issue: await findIssue(id) });
});

// Edit: only the creator (or an admin)
export const PUT = handler(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const issue = await findIssue(id);
  if (issue.created_by !== user.id && user.role !== "admin") {
    throw new HttpError(403, "You can only edit issues you created");
  }

  const { title, description } = await readBody(req);
  if (!title?.trim()) throw new HttpError(400, "Title is required");

  await query(
    "UPDATE issues SET title = $1, description = $2, updated_at = NOW() WHERE id = $3",
    [title.trim(), (description || "").trim(), issue.id]
  );
  return json({ issue: await findIssue(issue.id) });
});

// Delete: only the creator (or an admin)
export const DELETE = handler(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const issue = await findIssue(id);
  if (issue.created_by !== user.id && user.role !== "admin") {
    throw new HttpError(403, "You can only delete issues you created");
  }
  await query("DELETE FROM issues WHERE id = $1", [issue.id]);
  return json({ ok: true });
});
