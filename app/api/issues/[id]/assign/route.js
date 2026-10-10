import { query } from "@/lib/db";
import { handler, requireUser, readBody, HttpError, json, findIssue } from "@/lib/api";

export const dynamic = "force-dynamic";

// Admin only: assign an issue to a user. Status becomes "In Progress".
export const POST = handler(async (req, { params }) => {
  const user = await requireUser();
  if (user.role !== "admin") throw new HttpError(403, "Only an admin can assign issues");

  const { id } = await params;
  const issue = await findIssue(id);
  if (issue.status === "Closed") throw new HttpError(400, "This issue is already closed");

  const { userId } = await readBody(req);
  const target = await query("SELECT id FROM users WHERE id = $1", [Number(userId)]);
  if (!target.length) throw new HttpError(400, "Please choose a valid user");

  await query(
    `UPDATE issues SET assigned_to = $1, status = 'In Progress', updated_at = NOW() WHERE id = $2`,
    [target[0].id, issue.id]
  );
  return json({ issue: await findIssue(issue.id) });
});
