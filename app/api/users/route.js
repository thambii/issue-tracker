import { query } from "@/lib/db";
import { handler, requireUser, json } from "@/lib/api";

export const dynamic = "force-dynamic";

// List of users (used by the admin's "assign to" dropdown)
export const GET = handler(async () => {
  await requireUser();
  const users = await query("SELECT id, name, email, role FROM users ORDER BY name");
  return json({ users });
});
