// ── Role / status normalisation ───────────────────────────────────
// Backend sends CAPSLOCK enums. Frontend uses Title Case everywhere.

export function normalizeRole(role) {
  if (!role) return "Renter"
  // OWNER → Owner, RENTER → Renter, ADMIN → Admin
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

export function normalizeStatus(value) {
  if (!value) return value
  // PENDING → Pending, APPROVED → Approved, UNPAID → Unpaid, etc.
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

// paymentStatus from backend: UNPAID | PAID | DEPOSIT_RETURNED
// Map to consistent display strings
export function normalizePaymentStatus(status) {
  if (!status) return "Unpaid"
  const map = {
    UNPAID:           "Unpaid",
    PAID:             "Paid",
    DEPOSIT_RETURNED: "Deposit Returned",
  }
  return map[status.toUpperCase()] ?? normalizeStatus(status)
}

// transactionStatus from backend: PENDING | APPROVED | ACTIVE | COMPLETED | CANCELLED
export function normalizeTransactionStatus(status) {
  if (!status) return "Pending"
  const map = {
    PENDING:   "Pending",
    APPROVED:  "Approved",
    ACTIVE:    "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }
  return map[status.toUpperCase()] ?? normalizeStatus(status)
}

// transactionType: RENT | BORROW
export function normalizeTransactionType(type) {
  if (!type) return "Rent"
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

// Derive 2-letter initials from a full name string
function nameToInitials(fullName = "") {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??"
}

// ── Item ─────────────────────────────────────────────────────────
// Maps ItemResponseDto fields to frontend shape

export function transformItem(item) {
  if (!item) return item

  // ItemResponseDto uses "id" (UUID string)
  const id = item.id ?? item.itemID ?? item.itemId ?? null

  const rawAvailability = (item.availability || "").toUpperCase()
  const available = rawAvailability === "AVAILABLE" || rawAvailability === "TRUE"

  // Images come back as base64 strings or URLs
  const images = [item.itemImage1, item.itemImage2, item.itemImage3].filter(Boolean)

  function toImageSrc(img) {
    if (!img) return null
    if (img.startsWith("data:") || img.startsWith("http")) return img
    return `data:image/jpeg;base64,${img}`
  }

  return {
    ...item,
    id,
    // Availability
    available,
    availability: item.availability ?? (available ? "AVAILABLE" : "UNAVAILABLE"),
    // Full-name aliases used by components
    category:    item.category,
    condition:   item.schema,        // ItemResponseDto field is "schema", display as "condition"
    description: item.description,
    location:    item.pickupMethod || "Pickup arrangement required",
    price:       item.rate  ?? 0,    // display field; backend field is "rate"
    deposit:     item.deposit ?? 0,
    rating:      item.rating  ?? null,
    reviews:     item.reviews ?? 0,
    // Images
    images:        images.map(toImageSrc),
    primaryImage:  toImageSrc(item.itemImage1) ?? null,
    itemImage1:    toImageSrc(item.itemImage1),
    itemImage2:    toImageSrc(item.itemImage2),
    itemImage3:    toImageSrc(item.itemImage3),
  }
}

// ── Transaction ───────────────────────────────────────────────────
// Maps TransactionResponseDto to frontend shape

export function transformTransaction(txn) {
  if (!txn) return txn

  // Derive initials for avatars (not provided by backend)
  const renterAvatar = nameToInitials(txn.renterName)
  const ownerAvatar  = nameToInitials(txn.ownerName)

  return {
    ...txn,
    // Normalise enum strings
    transactionStatus: normalizeTransactionStatus(txn.transactionStatus),
    paymentStatus:     normalizePaymentStatus(txn.paymentStatus),
    type:              normalizeTransactionType(txn.transactionType),
    // Derived UI fields
    renterAvatar,
    ownerAvatar,
    // Ensure numeric fields are numbers (API returns float)
    dailyRate:     Number(txn.dailyRate     ?? 0),
    depositAmount: Number(txn.depositAmount ?? 0),
    totalAmount:   Number(txn.totalAmount   ?? 0),
    totalDays:     Number(txn.totalDays     ?? 0),
  }
}

// ── User ──────────────────────────────────────────────────────────
// Maps UserResponseDto to frontend shape
// NOTE: UserResponseDto does NOT include a user id — this is a backend limitation.

export function transformUser(user) {
  if (!user) return user
  const fullName = user.fullName
    || `${user.firstName || ""} ${user.lastName || ""}`.trim()
    || "Unknown User"
  return {
    ...user,
    fullName,
    avatar: nameToInitials(fullName),
    role:   normalizeRole(user.role),
    status: normalizeStatus(user.status) ?? "Active",
    items:  user.itemCount        ?? user.items ?? 0,
    txn:    user.transactionCount ?? user.txn   ?? 0,
    joined: user.joined           ?? "—",
  }
}

// ── Arrays ────────────────────────────────────────────────────────
export function transformItems(items = [])       { return items.map(transformItem)       }
export function transformTransactions(txns = []) { return txns.map(transformTransaction) }
export function transformUsers(users = [])       { return users.map(transformUser)       }
