"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { showProgress?: boolean } = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { showProgress, ...fetchOptions } = options;

  if (showProgress && typeof window !== "undefined") {
    window.dispatchEvent(new Event("apiRequestStart"));
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Request failed");
    }
    return data as T;
  } finally {
    if (showProgress && typeof window !== "undefined") {
      window.dispatchEvent(new Event("apiRequestEnd"));
    }
  }
}

export { API_URL };
