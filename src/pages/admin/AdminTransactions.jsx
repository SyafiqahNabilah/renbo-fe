import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { useData } from "../../hooks/useData"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import Avatar from "../../components/ui/Avatar"
import StatusBadge from "../../components/ui/StatusBadge"

const STATUS_FILTERS = ["All", "Pending", "Approved", "Active", "Completed", "Cancelled"]

export default function AdminTransactions() {
  const { transactions, loading } = useData()
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery,  setSearchQuery]  = useState("")

  // Counts per status for badge labels — computed once
  const statusCounts = useMemo(() =>
    STATUS_FILTERS.reduce((acc, s) => {
      acc[s] = s === "All"
        ? transactions.length
        : transactions.filter(t => t.transactionStatus === s).length
      return acc
    }, {}),
  [transactions])

  // Filter by status + search (item name, owner name, renter name)
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return transactions.filter(t => {
      const matchesStatus = statusFilter === "All" || t.transactionStatus === statusFilter
      const matchesSearch = !q
        || (t.itemName   || "").toLowerCase().includes(q)
        || (t.ownerName  || "").toLowerCase().includes(q)
        || (t.renterName || "").toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [transactions, statusFilter, searchQuery])

  if (loading) return <div className="p-6 text-center text-stone-500">Loading transactions…</div>

  return (
    <div>
      <Header
        title="All Transactions"
        subtitle={`${filtered.length} of ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
      />

      {/* ── Search + status filters ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search item, owner or renter…"
            className="w-full border border-stone-200 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === f
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {f}
              <span className="ml-1 opacity-60">({statusCounts[f] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {!transactions.length ? (
        <div className="text-center py-20 text-stone-400">No transactions on the platform yet.</div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["TXN ID","Item","Owner","Renter","Type","Dates","Total","Payment","Status"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <span className="text-3xl block mb-2">🔍</span>
                      <p className="text-stone-400 text-sm">
                        {searchQuery
                          ? `No transactions matching "${searchQuery}"`
                          : `No ${statusFilter.toLowerCase()} transactions`}
                      </p>
                      {(searchQuery || statusFilter !== "All") && (
                        <button
                          onClick={() => { setSearchQuery(""); setStatusFilter("All") }}
                          className="mt-3 text-xs text-orange-600 hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map(t => (
                    <tr key={t.transactionID} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-5 py-4 font-mono text-xs text-stone-500">{t.transactionID}</td>
                      <td className="px-5 py-4 font-medium text-stone-800 whitespace-nowrap max-w-[160px] truncate">
                        {t.itemName}
                      </td>
                      <td className="px-5 py-4 text-stone-600 whitespace-nowrap text-xs">{t.ownerName}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Avatar initials={t.renterAvatar || "??"} size="sm" />
                          <span className="text-xs">{t.renterName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          t.type === "Rent" ? "bg-purple-50 text-purple-700" : "bg-sky-50 text-sky-700"
                        }`}>{t.type}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-stone-500 whitespace-nowrap">
                        {t.startDate} – {t.endDate}
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-800 text-xs">RM {t.totalAmount}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          t.paymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {t.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={t.transactionStatus} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Result count footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-stone-100 text-xs text-stone-400">
              Showing {filtered.length} of {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
              {(searchQuery || statusFilter !== "All") && (
                <button
                  onClick={() => { setSearchQuery(""); setStatusFilter("All") }}
                  className="ml-3 text-orange-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
