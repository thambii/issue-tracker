import { query } from "@/lib/db";
import { handler, requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

// Global counts, same for every logged-in user
export const GET = handler(async () => {
  await requireUser();
  const [row] = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'Open')::int AS open,
      COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'Closed')::int AS closed
    FROM issues`);
  return json(row);
});
