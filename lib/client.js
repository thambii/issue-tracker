"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// fetch wrapper: returns parsed JSON, throws Error(message) on failure
export async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Loads the logged-in user; sends to /login if not logged in
export function useMe() {
  const router = useRouter();
  const [me, setMe] = useState(null);

  useEffect(() => {
    api("/api/auth/me")
      .then((d) => setMe(d.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  return me;
}

export function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
