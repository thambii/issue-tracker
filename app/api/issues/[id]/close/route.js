import { query } from "@/lib/db";
import { handler, requireUser, HttpError, json, findIssue } from "@/lib/api";

export const dynamic = "force-dynamic";

// The assigned user (or an admin) marks the issue as Closed
export const POST = handler(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const issue = await findIssue(id);

  if (issue.assigned_to !== user.id && user.role !== "admin") {
    throw new HttpError(403, "Only the assigned user can close this issue");
  }
  if (issue.status === "Closed") throw new HttpError(400, "This issue is already closed");

  await query("UPDATE issues SET status = 'Closed', updated_at = NOW() WHERE id = $1", [issue.id]);
  return json({ issue: await findIssue(issue.id) });
});
