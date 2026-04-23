import { useState } from "react"
import { useData } from "../../hooks/useData"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import Avatar from "../../components/ui/Avatar"
import StatusBadge from "../../components/ui/StatusBadge"

const FILTER_OPTIONS = ["All", "Pending", "Approved", "Active", "Completed", "Cancelled"]

export default function AdminTransactions() {
  const { transactions, loading } = useData()
  // FIX: filter state is now wired — buttons actually filter the table
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = activeFilter === "All"
    ? transactions
    : transactions.filter(t => t.transactionStatus === activeFilter)

  if (loading) return <div className="p-6 text-center text-stone-500">Loading transactions…</div>

  if (!transactions.length) return (
    <div>
      <Header title="All Transactions" subtitle="No transactions on the platform yet" />
      <div className="text-center py-20 text-stone-400">No transactions yet.</div>
    </div>
  )

  return (
    <div>
      <Header
        title="All Transactions"
        subtitle={`${filtered.length} of ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
      />

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeFilter === f
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1 opacity-60">
                ({transactions.filter(t => t.transactionStatus === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {["TXN ID", "Item", "Owner", "Renter", "Type", "Dates", "Total", "Payment", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-stone-400 text-sm">
                    No {activeFilter.toLowerCase()} transactions
                  </td>
                </tr>
              ) : filtered.map(t => (
                <tr key={t.transactionID} className="border-b border-stone-50 hover:bg-stone-50/50">
                  <td className="px-5 py-4 font-mono text-xs text-stone-500">{t.transactionID}</td>
                  <td className="px-5 py-4 font-medium text-stone-800 whitespace-nowrap">{t.itemName}</td>
                  <td className="px-5 py-4 text-stone-600 whitespace-nowrap">{t.ownerName}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Avatar initials={t.renterAvatar || "??"} size="sm" />
                      {t.renterName}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      t.type === "Rent" ? "bg-purple-50 text-purple-700" : "bg-sky-50 text-sky-700"
                    }`}>{t.type}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-stone-500 whitespace-nowrap">{t.startDate} – {t.endDate}</td>
                  <td className="px-5 py-4 font-semibold text-stone-800">RM {t.totalAmount}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      t.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
                    }`}>
                      {t.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={t.transactionStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
