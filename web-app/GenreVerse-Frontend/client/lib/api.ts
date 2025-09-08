import { getToken } from "./auth";

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(opts.headers || {}),
  };
  if (!(opts.body instanceof FormData)) headers["Content-Type"] = headers["Content-Type"] || "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const data = await res.json();
      msg = (data as any).error || msg;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}
