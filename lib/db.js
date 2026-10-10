import { Pool } from "pg";
import bcrypt from "bcryptjs";

let pool;
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

// Default users created on first run (password is hashed before saving)
const DEFAULT_USERS = [
  { name: "Admin", email: "admin@example.com", password: "admin123", role: "admin" },
  { name: "Alice", email: "alice@example.com", password: "user123", role: "user" },
  { name: "Bob", email: "bob@example.com", password: "user123", role: "user" },
];

let ready;

// Creates tables and default users if they don't exist yet.
// Runs once per server instance, so no manual migration step is needed.
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
      await query(`
        CREATE TABLE IF NOT EXISTS issues (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
          created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);
      await query(`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          issue_id INT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`);

      for (const u of DEFAULT_USERS) {
        const hash = await bcrypt.hash(u.password, 10);
        await query(
          `INSERT INTO users (name, email, password_hash, role)
           VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
          [u.name, u.email, hash, u.role]
        );
      }
    })().catch((err) => {
      ready = undefined; // allow retry on next request
      throw err;
    });
  }
  return ready;
}
