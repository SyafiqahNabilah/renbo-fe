import { useState, useEffect, useCallback } from "react"
import { Calendar, TrendingUp, Package, RefreshCw, AlertTriangle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { fetchOwnerEarnings } from "../../api/reports"
import { Card, PrimaryBtn, GhostBtn } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"

// ── Date helpers ──────────────────────────────────────────────────────────────

function today()        { return new Date().toISOString().slice(0, 10) }
function firstOfYear()  { return `${new Date().getFullYear()}-01-01` }
function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}
function fmt(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })
}
function fmtRM(num) {
  return `RM ${Number(num ?? 0).toFixed(2)}`
}

// ── Quick-range presets ───────────────────────────────────────────────────────

const PRESETS = [
  { label: "This month",  from: firstOfMonth, to: today },
  { label: "This year",   from: firstOfYear,  to: today },
  { label: "Last 30 days",
    from: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10) },
    to: today },
  { label: "Last 90 days",
    from: () => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().slice(0, 10) },
    to: today },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function OwnerReport() {
  const { user, token } = useAuth()

  const [fromDate, setFromDate] = useState(firstOfYear())
  const [toDate,   setToDate]   = useState(today())
  const [report,   setReport]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const [activePreset, setActivePreset] = useState("This year")

  const loadReport = useCallback(async (from, to) => {
    if (!user?.id) return
    setError("")
    setLoading(true)
    try {
      const data = await fetchOwnerEarnings(user.id, from, to, token)
      setReport(data)
    } catch (err) {
      setError(err.message || "Failed to load earnings report.")
    } finally {
      setLoading(false)
    }
  }, [user?.id, token])

  // Load on mount with default range
  useEffect(() => { loadReport(fromDate, toDate) }, [])  // eslint-disable-line

  function applyPreset(preset) {
    const from = preset.from()
    const to   = preset.to()
    setFromDate(from)
    setToDate(to)
    setActivePreset(preset.label)
    loadReport(from, to)
  }

  function handleApply() {
    if (fromDate > toDate) { setError("Start date must be before end date."); return }
    setActivePreset("")
    loadReport(fromDate, toDate)
  }

  // Derived from report data
  const totalEarnings  = Number(report?.totalEarnings ?? 0)
  const txCount        = report?.completedTransactionCount ?? 0
  const avgPerRental   = txCount > 0 ? totalEarnings / txCount : 0
  const breakdown      = report?.itemBreakdown ?? []
  const maxEarned      = Math.max(...breakdown.map(i => Number(i.totalEarnings)), 1)

  // Build bar chart data from breakdown (group already done server-side)
  const chartItems = breakdown.slice(0, 6)

  return (
    <div>
      <Header
        title="Earnings Report"
        subtitle="Your rental income from completed & paid transactions"
      />

      {/* ── Date range controls ───────────────────────────────────────────── */}
      <Card className="p-4 mb-5">
        <div className="flex flex-wrap items-end gap-4">

          {/* Quick presets */}
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Quick range</p>
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                    activePreset === p.label
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-10 w-px bg-stone-200" />

          {/* Custom date inputs */}
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">From</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={e => { setFromDate(e.target.value); setActivePreset("") }}
                  className="pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">To</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={today()}
                  onChange={e => { setToDate(e.target.value); setActivePreset("") }}
                  className="pl-8 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
            <PrimaryBtn onClick={handleApply} disabled={loading} small>
              {loading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin inline mr-1.5" />Loading…</>
                : "Apply"}
            </PrimaryBtn>
          </div>

          {/* Date range display */}
          {report && (
            <p className="text-xs text-stone-400 ml-auto self-end pb-1 hidden lg:block">
              {fmt(report.fromDate)} — {fmt(report.toDate)}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
      </Card>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && !report && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <Card key={i} className="p-5">
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-3 animate-pulse" />
                <div className="h-7 bg-stone-100 rounded w-2/3 animate-pulse" />
              </Card>
            ))}
          </div>
          <Card className="p-5 h-52 animate-pulse bg-stone-50" />
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      {report && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <Card className="p-5">
              <p className="text-xs text-stone-500 font-medium mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-stone-900">{fmtRM(totalEarnings)}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {txCount} completed rental{txCount !== 1 ? "s" : ""}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-stone-500 font-medium mb-1">Avg per Rental</p>
              <p className="text-2xl font-bold text-stone-900">{fmtRM(avgPerRental)}</p>
              <p className="text-xs text-stone-400 mt-1">Based on {txCount} transactions</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-stone-500 font-medium mb-1">Items with Earnings</p>
              <p className="text-2xl font-bold text-stone-900">{breakdown.length}</p>
              <p className="text-xs text-stone-400 mt-1">
                {breakdown.length > 0 ? `Top: ${breakdown[0].itemName}` : "No data"}
              </p>
            </Card>
          </div>

          {/* ── Charts ─────────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Bar chart — per item earnings */}
            <Card className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-stone-800">Earnings by Item</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {fmt(report.fromDate)} — {fmt(report.toDate)}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-stone-300" />
              </div>

              {chartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-10 h-10 text-stone-200 mb-3" />
                  <p className="text-stone-400 text-sm">No completed transactions in this period</p>
                  <p className="text-stone-300 text-xs mt-1">Try expanding the date range</p>
                </div>
              ) : (
                <div className="flex items-end gap-4 h-44">
                  {chartItems.map(item => {
                    const earned = Number(item.totalEarnings)
                    const heightPct = (earned / maxEarned) * 100
                    return (
                      <div key={item.itemId} className="flex-1 flex flex-col items-center gap-2 min-w-0 group">
                        <span className="text-xs font-semibold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {fmtRM(earned)}
                        </span>
                        <div className="w-full relative">
                          {/* Hover tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {fmtRM(earned)} · {item.completedTransactionCount} txn
                          </div>
                          <div
                            className="w-full bg-orange-500 rounded-t-lg hover:bg-orange-400 transition-colors cursor-default"
                            style={{ height: `${Math.max(heightPct * 1.4, 6)}px` }}
                          />
                        </div>
                        <span className="text-xs text-stone-400 truncate w-full text-center leading-tight">
                          {item.itemName}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Item breakdown list */}
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 mb-4">Item Breakdown</h2>

              {breakdown.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-10">No data yet</p>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-56 pr-1">
                  {breakdown.map((item, idx) => (
                    <div key={item.itemId}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-stone-400 font-medium w-4 shrink-0">#{idx + 1}</span>
                          <span className="text-stone-700 font-medium truncate">{item.itemName}</span>
                        </div>
                        <span className="text-stone-600 font-semibold shrink-0 ml-2">
                          {fmtRM(item.totalEarnings)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-500"
                          style={{ width: `${(Number(item.totalEarnings) / maxEarned) * 100}%` }}
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-stone-400">
                          {item.completedTransactionCount} rental{item.completedTransactionCount !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-stone-400">
                          {item.totalDays} day{item.totalDays !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Report footer ─────────────────────────────────────────── */}
          <p className="text-xs text-stone-300 text-right mt-4">
            Generated {report.generatedAt
              ? new Date(report.generatedAt).toLocaleString("en-MY")
              : "—"}
          </p>
        </>
      )}
    </div>
  )
}
