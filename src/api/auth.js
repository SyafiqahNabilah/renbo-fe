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

/**
 * Step 1 — request a reset link.
 * Backend always responds 200 regardless of whether the email exists
 * (prevents user enumeration), so we never throw on success.
 */
export async function forgotPassword(email) {
  const res = await fetch(`${BASE_URL}/user/forgot-password`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    let message = "Something went wrong. Please try again."
    try { message = (await res.json()).message || message } catch { /* noop */ }
    throw new Error(message)
  }
  // Returns plain-text confirmation — no need to parse
}

/**
 * Step 2 — submit the token + new password pair.
 * @param {string} token          The opaque token from the reset-link URL param
 * @param {string} newPassword
 * @param {string} confirmPassword
 */
export async function resetPassword(token, newPassword, confirmPassword) {
  const res = await fetch(`${BASE_URL}/user/reset-password`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  })
  if (!res.ok) {
    let message = "Password reset failed. The link may have expired."
    try { message = (await res.json()).message || message } catch { /* noop */ }
    throw new Error(message)
  }
}