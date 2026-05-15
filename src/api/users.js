import { BASE_URL, authHeaders, parseApiResponse } from "./config"

export async function fetchUsers(token) {
  const res = await fetch(`${BASE_URL}/user/all`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch users")
}

export async function fetchUsersByRole(token, role) {
  const res = await fetch(`${BASE_URL}/user/${role}`, { headers: authHeaders(token) })
  return parseApiResponse(res, `Failed to fetch ${role} users`)
}

// PUT /user/deactive/{id}
export async function deactivateUser(token, userId) {
  const res = await fetch(`${BASE_URL}/user/deactive/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to deactivate user")
}

// PUT /user/activate/{id}
export async function activateUser(token, userId) {
  const res = await fetch(`${BASE_URL}/user/activate/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to activate user")
}

// DELETE /user/{id}  — admin only; admin accounts cannot be deleted (backend guards this)
export async function deleteUser(token, userId) {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  if (!res.ok) {
    let message = "Failed to delete user"
    try { message = (await res.json()).message || message } catch { /* noop */ }
    throw new Error(message)
  }
}

// PUT /user/profile/{id}
export async function updateProfile(token, userId, payload) {
  const res = await fetch(`${BASE_URL}/user/profile/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseApiResponse(res, "Failed to update profile")
}