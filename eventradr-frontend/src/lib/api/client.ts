// Browser-side API client for Eventradr.
//
// IMPORTANT: use this from Client Components / browser-facing modules only.
// It relies on the browser sending the backend's HttpOnly cookies via the
// development rewrite proxy (see next.config.ts). Server Components do NOT
// inherit browser cookies, so do not call this from server code.

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiFetch<T>(
  path: `/api/${string}`,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // JSON.stringify(...) produces a string body. Other body types
  // (e.g. FormData or Blob) must keep their appropriate content type.
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: options.cache ?? "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    throw new ApiError(
      `API request failed (${response.status})`,
      response.status,
      data
    );
  }

  return data as T;
}
