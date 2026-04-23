import { BASE_URL, authHeaders, parseApiResponse } from "./config"

function buildItemFormData(payload) {
  const fd = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === "images" && Array.isArray(value)) {
      value.slice(0, 3).forEach((file, i) => fd.append(`itemImage${i + 1}`, file))
      return
    }
    fd.append(key, String(value))
  })
  return fd
}

export async function fetchItems(token) {
  const res = await fetch(`${BASE_URL}/item/all`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch items")
}

export async function fetchItemsByOwner(token, ownerId) {
  const res = await fetch(`${BASE_URL}/item/all/${ownerId}`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch owner items")
}

export async function fetchItemDetails(token, itemId) {
  const res = await fetch(`${BASE_URL}/item/details/${itemId}`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch item details")
}

// POST /item/create — multipart/form-data
export async function createItem(token, payload) {
  const res = await fetch(`${BASE_URL}/item/create`, {
    method: "POST",
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    body: buildItemFormData(payload),
  })
  return parseApiResponse(res, "Failed to create item")
}

// PUT /item/update/{id} — also multipart/form-data
// Backend uses @ModelAttribute (not @RequestBody), ItemRequestDto has MultipartFile fields
// Images are optional on update — only sent if new files are selected
export async function updateItem(token, itemId, payload) {
  const res = await fetch(`${BASE_URL}/item/update/${itemId}`, {
    method: "PUT",
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    body: buildItemFormData(payload),
  })
  return parseApiResponse(res, "Failed to update item")
}

// DELETE /item/delete/{id}
export async function deleteItem(token, itemId) {
  const res = await fetch(`${BASE_URL}/item/delete/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  })
  // Backend returns plain text "Successful deleted." — parseApiResponse handles non-JSON ok response
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || "Failed to delete item")
  }
  return true
}
