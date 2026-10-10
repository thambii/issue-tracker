import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { handler, readBody, HttpError, json } from "@/lib/api";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const { name, email, password } = await readBody(req);
  if (!name?.trim() || !email?.trim() || !password) {
    throw new HttpError(400, "Name, email and password are required");
  }
  if (password.length < 6) throw new HttpError(400, "Password must be at least 6 characters");

  const cleanEmail = email.trim().toLowerCase();
  const exists = await query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
  if (exists.length) throw new HttpError(409, "This email is already registered");

  const hash = await bcrypt.hash(password, 10);
  // Public sign-up always creates a normal user. Admins come from the seeded defaults.
  const [user] = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'user') RETURNING id, name, email, role`,
    [name.trim(), cleanEmail, hash]
  );
  await createSession(user);
  return json({ user }, 201);
});
