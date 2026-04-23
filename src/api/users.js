import { BASE_URL, authHeaders, parseApiResponse } from "./config"

export async function fetchUsers(token) {
  const res = await fetch(`${BASE_URL}/user/all`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch users")
}

export async function fetchUsersByRole(token, role) {
  const res = await fetch(`${BASE_URL}/user/${role}`, { headers: authHeaders(token) })
  return parseApiResponse(res, `Failed to fetch ${role} users`)
}

// PUT /user/deactive/{id}  (note: backend spells it "deactive")
export async function deactivateUser(token, userId) {
  const res = await fetch(`${BASE_URL}/user/deactive/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to deactivate user")
}
