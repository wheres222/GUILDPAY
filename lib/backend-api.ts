function normalizeBaseUrl(value?: string) {
  const raw = (value || "").trim()
  if (!raw) return ""
  return raw.replace(/\/+$/, "")
}

export function getApiBaseUrl() {
  const publicBase = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)
  const serverBase = normalizeBaseUrl(process.env.API_BASE_URL)

  if (process.env.NODE_ENV === "production") {
    if (publicBase) return publicBase

    if (serverBase && !/localhost|127\.0\.0\.1/i.test(serverBase)) {
      return serverBase
    }
  }

  return serverBase || publicBase || "http://localhost:3000/api"
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiBase = getApiBaseUrl()
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`${path} -> ${response.status}`)
  }

  return (await response.json()) as T
}

export function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}
