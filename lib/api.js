import { NextResponse } from "next/server";
import { ensureSchema, query } from "./db";
import { getUser } from "./auth";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wraps a route handler: makes sure the DB is ready and turns errors into JSON responses.
export function handler(fn) {
  return async (req, ctx) => {
    try {
      await ensureSchema();
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ error: "Something went wrong on the server" }, { status: 500 });
    }
  };
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new HttpError(401, "Please log in first");
  return user;
}

export async function readBody(req) {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Invalid request body");
  }
}

export const STATUSES = ["Open", "In Progress", "Closed"];

const ISSUE_SELECT = `
  SELECT i.id, i.title, i.description, i.status, i.created_by, i.assigned_to,
         i.created_at, i.updated_at,
         c.name AS created_by_name, a.name AS assigned_to_name
  FROM issues i
  JOIN users c ON c.id = i.created_by
  LEFT JOIN users a ON a.id = i.assigned_to`;

export async function listIssues() {
  return query(`${ISSUE_SELECT} ORDER BY i.created_at DESC`);
}

export async function findIssue(id) {
  const n = Number(id);
  if (!Number.isInteger(n)) throw new HttpError(404, "Issue not found");
  const rows = await query(`${ISSUE_SELECT} WHERE i.id = $1`, [n]);
  if (!rows.length) throw new HttpError(404, "Issue not found");
  return rows[0];
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}
