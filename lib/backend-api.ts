export function getApiBaseUrl() {
  return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"
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
