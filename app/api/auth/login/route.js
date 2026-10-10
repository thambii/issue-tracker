import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handler, readBody, HttpError, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const { email, password } = await readBody(req);
  if (!email || !password) throw new HttpError(400, "Email and password are required");

  const rows = await query(
    "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
    [email.trim().toLowerCase()]
  );
  const row = rows[0];
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    throw new HttpError(401, "Wrong email or password");
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  await createSession(user);
  return json({ user });
});
