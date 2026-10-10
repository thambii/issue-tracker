import { getUser } from "@/lib/auth";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  if (!user) return json({ error: "Not logged in" }, 401);
  return json({ user });
}
