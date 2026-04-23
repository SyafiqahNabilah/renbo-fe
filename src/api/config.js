export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

export async function parseApiResponse(res, fallbackMessage) {
  if (res.ok) {
    const contentType = res.headers.get("content-type") || ""
    return contentType.includes("application/json") ? res.json() : null
  }
  let message = fallbackMessage
  try {
    const err = await res.json()
    message = err.message || message
  } catch { /* non-JSON error body */ }
  throw new Error(message)
}

export function authHeaders(token) {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}
