export type ApiResult<T> = { success: boolean; data?: T; message?: string };

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = options;
  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "include",
  });
  let payload: ApiResult<T> | null = null;
  try {
    payload = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${res.status})`);
  }
  return payload.data as T;
}

export function fmtMoney(n: number | string, currency = "PKR") {
  const val = typeof n === "string" ? Number(n) : n;
  return `${currency} ${Math.round(val).toLocaleString()}`;
}

export function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export function dateParts(d: string) {
  try {
    const dt = new Date(d + "T00:00:00");
    return {
      month: dt.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: dt.getDate(),
      weekday: dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    };
  } catch {
    return { month: "", day: "", weekday: "" };
  }
}
