import { BASE_URL, authHeaders, parseApiResponse } from "./config"

// ── Read ──────────────────────────────────────────────────────────

export async function fetchTransactions(token, status) {
  const url = new URL(`${BASE_URL}/transaction/all`)
  if (status) url.searchParams.set("status", status)
  const res = await fetch(url, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch transactions")
}

export async function fetchTransactionsByOwner(token, status) {
  const url = new URL(`${BASE_URL}/transaction/owner`)
  if (status) url.searchParams.set("status", status)
  const res = await fetch(url, { headers: authHeaders(token) })
  return parseApiResponse(res, "Failed to fetch owner transactions")
}

export async function fetchTransactionsByRenter(token) {
  const res = await fetch(`${BASE_URL}/transaction/renter`, {
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to fetch renter transactions")
}

// ── Create ────────────────────────────────────────────────────────

// RentalRequestDto: itemId, startDate, endDate, transactionType (RENT|BORROW), renterNote
// totalAmount is NOT part of this DTO — backend calculates it from item rate
export async function requestRent(token, payload) {
  const res = await fetch(`${BASE_URL}/transaction/request`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      itemId:          payload.itemId,
      startDate:       payload.startDate,
      endDate:         payload.endDate,
      transactionType: payload.transactionType ?? "RENT",
      renterNote:      payload.renterNote ?? "",
    }),
  })
  return parseApiResponse(res, "Failed to submit rental request")
}

// ── Owner actions ─────────────────────────────────────────────────
// approve/reject pass ownerNote as a QUERY PARAM (not request body)

export async function approveRequest(token, transactionId, ownerNote = "") {
  const url = new URL(`${BASE_URL}/transaction/${transactionId}/approve`)
  if (ownerNote) url.searchParams.set("ownerNote", ownerNote)
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to approve request")
}

export async function rejectRequest(token, transactionId, ownerNote = "") {
  const url = new URL(`${BASE_URL}/transaction/${transactionId}/reject`)
  if (ownerNote) url.searchParams.set("ownerNote", ownerNote)
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to reject request")
}

export async function activateTransaction(token, transactionId) {
  const res = await fetch(`${BASE_URL}/transaction/${transactionId}/activate`, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to activate transaction")
}

export async function completeTransaction(token, transactionId) {
  const res = await fetch(`${BASE_URL}/transaction/${transactionId}/complete`, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to complete transaction")
}

// ── Renter actions ────────────────────────────────────────────────

// cancel passes note as QUERY PARAM
export async function cancelTransaction(token, transactionId, note = "") {
  const url = new URL(`${BASE_URL}/transaction/${transactionId}/cancel`)
  if (note) url.searchParams.set("note", note)
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to cancel transaction")
}

// paymentRef is a QUERY PARAM (not request body)
export async function markTransactionPaid(token, transactionId, paymentRef) {
  const ref = paymentRef || `CASH-${Date.now()}`
  const url = new URL(`${BASE_URL}/transaction/${transactionId}/payment`)
  url.searchParams.set("paymentRef", ref)
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(token),
  })
  return parseApiResponse(res, "Failed to record payment")
}
