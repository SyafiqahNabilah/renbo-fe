import { BASE_URL, authHeaders, parseApiResponse } from "./config"

/**
 * GET /report/owner/{ownerId}/earnings?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns OwnerEarningsReportDto — total earnings + per-item breakdown.
 * Only COMPLETED + PAID transactions in the date range are included.
 */
export async function fetchOwnerEarnings(ownerId, fromDate, toDate, token) {
  const params = new URLSearchParams({ from: fromDate, to: toDate })
  const res = await fetch(
    `${BASE_URL}/report/owner/${ownerId}/earnings?${params}`,
    { headers: authHeaders(token) }
  )
  return parseApiResponse(res, "Failed to load earnings report")
}

/**
 * GET /report/owner/{ownerId}/summary
 * Returns OwnerTransactionSummaryDto — lifetime counts per status.
 */
export async function fetchOwnerSummary(ownerId, token) {
  const res = await fetch(
    `${BASE_URL}/report/owner/${ownerId}/summary`,
    { headers: authHeaders(token) }
  )
  return parseApiResponse(res, "Failed to load transaction summary")
}

/**
 * GET /report/admin/system
 * Returns AdminSystemReportDto — platform-wide snapshot.
 */
export async function fetchAdminSystemReport(token) {
  const res = await fetch(
    `${BASE_URL}/report/admin/system`,
    { headers: authHeaders(token) }
  )
  return parseApiResponse(res, "Failed to load system report")
}
