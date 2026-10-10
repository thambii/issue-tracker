import { query } from "@/lib/db";
import { handler, requireUser, readBody, HttpError, json, listIssues, findIssue } from "@/lib/api";

export const dynamic = "force-dynamic";

// Everyone logged in can see all issues
export const GET = handler(async () => {
  await requireUser();
  return json({ issues: await listIssues() });
});

// Everyone logged in can create an issue (starts as Open, unassigned)
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { title, description } = await readBody(req);
  if (!title?.trim()) throw new HttpError(400, "Title is required");

  const [created] = await query(
    `INSERT INTO issues (title, description, created_by)
     VALUES ($1, $2, $3) RETURNING id`,
    [title.trim(), (description || "").trim(), user.id]
  );
  return json({ issue: await findIssue(created.id) }, 201);
});
