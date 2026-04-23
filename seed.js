/**
 * RenBoNow — Session 3 Test Data Seeder
 * Run: node seed.js
 * Requires backend running at http://localhost:8080
 */

const BASE = "http://localhost:8080"
const PASS = "Test1234!"   // meets 8-char minimum

// ── Test accounts ─────────────────────────────────────────────────

const OWNERS = [
  { firstName: "Ahmad",  lastName: "Razif",   email: "owner1@test.com", role: "OWNER" },
  { firstName: "Nurul",  lastName: "Ain",     email: "owner2@test.com", role: "OWNER" },
  { firstName: "Hafiz",  lastName: "Ismail",  email: "owner3@test.com", role: "OWNER" },
  { firstName: "Priya",  lastName: "Nair",    email: "owner4@test.com", role: "OWNER" },
  { firstName: "Siti",   lastName: "Hanim",   email: "owner5@test.com", role: "OWNER" },
]

const RENTERS = [
  { firstName: "Lee",    lastName: "Wei Ming", email: "renter1@test.com", role: "RENTER" },
  { firstName: "Raj",    lastName: "Kumar",    email: "renter2@test.com", role: "RENTER" },
  { firstName: "Kevin",  lastName: "Tan",      email: "renter3@test.com", role: "RENTER" },
]

// ── Sample items per owner ────────────────────────────────────────

const ITEMS_BY_OWNER = {
  "owner1@test.com": [
    { name: "Sony A7III Camera", description: "Full-frame mirrorless, 24.2MP. Includes 28-70mm kit lens, 2 batteries.", brand: "Sony", category: "Electronics", rate: 120, deposit: 500, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
    { name: "Epson Projector EB-X51", description: "3800 lumen XGA projector. Includes HDMI cable and carry bag.", brand: "Epson", category: "Electronics", rate: 90, deposit: 400, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
  ],
  "owner2@test.com": [
    { name: "DJI Mini 3 Pro Drone", description: "4K/60fps, obstacle sensing, 34min flight time. Includes carry case.", brand: "DJI", category: "Electronics", rate: 150, deposit: 800, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
    { name: "6-Person Camping Tent", description: "UV protection, waterproof fly, full-mesh inner. Great for families.", brand: "Coleman", category: "Outdoor", rate: 60, deposit: 200, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
  ],
  "owner3@test.com": [
    { name: "Canon EOS 5D Mark IV", description: "30.4MP DSLR. Includes 50mm f/1.4 lens, 2 batteries, CF card.", brand: "Canon", category: "Electronics", rate: 200, deposit: 1200, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
  ],
  "owner4@test.com": [
    { name: "Yamaha PSR-E473 Keyboard", description: "61-key portable keyboard, 622 voices. Includes stand and power adapter.", brand: "Yamaha", category: "Music", rate: 80, deposit: 300, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
    { name: "Badminton Racket Set", description: "2x Yonex rackets, 3 shuttle tubes, racket bag included.", brand: "Yonex", category: "Sports", rate: 20, deposit: 80, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 2 },
  ],
  "owner5@test.com": [
    { name: "Bosch Impact Drill Set", description: "900W impact drill with 20 accessories. Perfect for home renovation.", brand: "Bosch", category: "Tools", rate: 35, deposit: 150, availability: "AVAILABLE", pickupMethod: "Self Pickup", quantity: 1 },
    { name: "Portable PA Speaker", description: "500W, Bluetooth + mic input. Great for events and presentations.", brand: "JBL", category: "Event Gear", rate: 100, deposit: 350, availability: "AVAILABLE", pickupMethod: "Owner Delivery", quantity: 1 },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────

function log(msg)    { console.log(`  ✓  ${msg}`) }
function warn(msg)   { console.warn(`  ⚠  ${msg}`) }
function section(s)  { console.log(`\n──── ${s} ────`) }

async function post(path, body, token) {
  const headers = { "Content-Type": "application/json", accept: "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body: JSON.stringify(body) })
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
}

async function postForm(path, fields, token) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)) })
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    body: fd,
  })
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) }
}

// ── Steps ─────────────────────────────────────────────────────────

async function registerUser(user) {
  const { ok, status, data } = await post("/user/signup/register", { ...user, password: PASS })
  if (ok) {
    log(`Registered ${user.role}: ${user.firstName} ${user.lastName} (${user.email})`)
    return true
  }
  if (status === 409) {
    warn(`${user.email} already exists — skipping`)
    return true
  }
  warn(`Failed to register ${user.email}: ${JSON.stringify(data)}`)
  return false
}

async function loginUser(email) {
  const { ok, data } = await post("/user/login", { email, password: PASS })
  if (ok && data.token) return data
  warn(`Login failed for ${email}: ${JSON.stringify(data)}`)
  return null
}

async function createItemForOwner(token, ownerId, item) {
  const { ok, data } = await postForm("/item/create", { ...item, ownerId }, token)
  if (ok) log(`  Item created: "${item.name}"`)
  else    warn(`  Failed to create "${item.name}": ${JSON.stringify(data)}`)
  return ok ? data : null
}

async function getAllItems(token) {
  const res = await fetch(`${BASE}/item/all`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  })
  return res.ok ? res.json() : []
}

async function submitRequest(token, itemId, startDate, endDate, renterNote) {
  const { ok, data } = await post("/transaction/request", {
    itemId,
    startDate,
    endDate,
    transactionType: "RENT",
    renterNote,
  }, token)
  if (ok) log(`  Request submitted for item ${itemId} (${startDate} → ${endDate})`)
  else    warn(`  Failed to submit request: ${JSON.stringify(data)}`)
  return ok ? data : null
}

function futureDate(daysFromNow) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split("T")[0]
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log("╔═══════════════════════════════════════╗")
  console.log("║   RenBoNow Session 3 — Data Seeder    ║")
  console.log("╚═══════════════════════════════════════╝")

  // 1. Register all users
  section("Registering Owners")
  for (const o of OWNERS) await registerUser(o)

  section("Registering Renters")
  for (const r of RENTERS) await registerUser(r)

  // 2. Login each owner and create their items
  section("Creating Items")
  const ownerTokens = {}
  const ownerIds    = {}

  for (const owner of OWNERS) {
    const session = await loginUser(owner.email)
    if (!session) continue
    ownerTokens[owner.email] = session.token
    ownerIds[owner.email]    = session.userId
    const items = ITEMS_BY_OWNER[owner.email] || []
    for (const item of items) {
      await createItemForOwner(session.token, session.userId, item)
    }
  }

  // 3. Login each renter and submit rental requests
  section("Submitting Rental Requests")

  // Use first owner's token to fetch item list
  const firstToken = Object.values(ownerTokens)[0]
  const allItems   = firstToken ? await getAllItems(firstToken) : []

  if (!allItems.length) {
    warn("No items found — skipping rental requests. Check item creation above.")
  } else {
    const pick = (idx) => allItems[idx % allItems.length]

    for (let i = 0; i < RENTERS.length; i++) {
      const renter  = RENTERS[i]
      const session = await loginUser(renter.email)
      if (!session) continue

      // Each renter submits 2 requests on different items / date ranges
      const item1 = pick(i)
      const item2 = pick(i + 3)
      const start1 = futureDate(3 + i)
      const end1   = futureDate(6 + i)
      const start2 = futureDate(10 + i)
      const end2   = futureDate(12 + i)

      await submitRequest(session.token, item1.id, start1, end1, `Hi, I'd like to rent this for a trip.`)
      if (item2.id !== item1.id) {
        await submitRequest(session.token, item2.id, start2, end2, `Need this for a weekend project.`)
      }
    }
  }

  // 4. Summary
  section("Seed Complete — Test Credentials")
  console.log("")
  console.log("  OWNERS (5)")
  OWNERS.forEach(o => console.log(`  ${o.email.padEnd(24)} password: ${PASS}   name: ${o.firstName} ${o.lastName}`))
  console.log("")
  console.log("  RENTERS (3)")
  RENTERS.forEach(r => console.log(`  ${r.email.padEnd(24)} password: ${PASS}   name: ${r.firstName} ${r.lastName}`))
  console.log("")
  console.log("  Items created: ~9   |   Requests submitted: ~6")
  console.log("")
  console.log("  Start backend: mvn spring-boot:run")
  console.log("  Start frontend: npm run dev")
  console.log("  Then run:       node seed.js")
  console.log("")
}

main().catch(err => {
  console.error("\n  FATAL:", err.message)
  process.exit(1)
})
