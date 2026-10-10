import { query } from "@/lib/db";
import { handler, requireUser, readBody, HttpError, json, findIssue } from "@/lib/api";

export const dynamic = "force-dynamic";

const COMMENT_SELECT = `
  SELECT c.id, c.issue_id, c.user_id, c.text, c.created_at, u.name AS user_name
  FROM comments c JOIN users u ON u.id = c.user_id`;

export const GET = handler(async (req, { params }) => {
  await requireUser();
  const { id } = await params;
  const issue = await findIssue(id);
  const comments = await query(`${COMMENT_SELECT} WHERE c.issue_id = $1 ORDER BY c.created_at ASC`, [
    issue.id,
  ]);
  return json({ comments });
});

// Any logged-in user can comment
export const POST = handler(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const issue = await findIssue(id);
  const { text } = await readBody(req);
  if (!text?.trim()) throw new HttpError(400, "Comment cannot be empty");

  const [created] = await query(
    "INSERT INTO comments (issue_id, user_id, text) VALUES ($1, $2, $3) RETURNING id",
    [issue.id, user.id, text.trim()]
  );
  const [comment] = await query(`${COMMENT_SELECT} WHERE c.id = $1`, [created.id]);
  return json({ comment }, 201);
});
