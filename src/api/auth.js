import { BASE_URL } from "./config"

export async function loginApi(email, password) {
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Invalid credentials")
  }
  return res.json()
}

export async function signUp(payload) {
  const res = await fetch(`${BASE_URL}/user/signup/register`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    // Normalise role to UPPER_CASE for backend (OWNER / RENTER)
    body: JSON.stringify({ ...payload, role: payload.role.toUpperCase() }),
  })
  if (!res.ok) {
    let message = "Registration failed"
    try {
      const err = await res.json()
      message = err.message || message
    } catch {
      message = (await res.text().catch(() => "")) || message
    }
    throw new Error(message)
  }
  return res.json()
}
