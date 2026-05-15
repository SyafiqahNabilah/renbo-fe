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

/**
 * GET /item/search?keyword=&category=&minPrice=&maxPrice=
 * All params are optional — omit (pass null/undefined) to skip that filter.
 */
export async function searchItems(token, { keyword, category, minPrice, maxPrice } = {}) {
  const params = new URLSearchParams()
  if (keyword)  params.set("keyword",  keyword)
  if (category && category !== "All") params.set("category", category)
  if (minPrice != null) params.set("minPrice", String(minPrice))
  if (maxPrice != null) params.set("maxPrice", String(maxPrice))

  const url = `${BASE_URL}/item/search${params.toString() ? `?${params}` : ""}`
  const res  = await fetch(url, { headers: authHeaders(token) })
  return parseApiResponse(res, "Search failed")
}

/**
 * GET /item/categories
 * Returns a string[] of distinct category values in use.
 */
export async function fetchCategories(token) {
  const res = await fetch(`${BASE_URL}/item/categories`, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch categories")
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

// PUT /item/update/{id}
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
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || "Failed to delete item")
  }
  return true
}