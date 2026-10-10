import { clearSession } from "@/lib/auth";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return json({ ok: true });
}
