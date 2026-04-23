import { useAuth } from "../../context/AuthContext"
import { useData } from "../../hooks/useData"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"

function formatMonth(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-MY", { month: "short", year: "numeric" })
}

export default function OwnerReport() {
  const { user } = useAuth()
  const { transactions, loading } = useData()

  const myCompleted = transactions.filter(
    t => t.ownerName === user?.name && t.transactionStatus === "Completed"
  )

  const totalEarned   = myCompleted.reduce((sum, t) => sum + (t.totalAmount || 0), 0)
  const avgPerRental  = myCompleted.length ? totalEarned / myCompleted.length : 0

  // Group by month (startDate)
  const byMonth = {}
  myCompleted.forEach(t => {
    const month = formatMonth(t.startDate)
    if (!byMonth[month]) byMonth[month] = { earned: 0, count: 0 }
    byMonth[month].earned += t.totalAmount || 0
    byMonth[month].count  += 1
  })
  const months = Object.entries(byMonth)
    .map(([m, v]) => ({ m, earned: Math.round(v.earned), txn: v.count }))
    .slice(-6)   // last 6 months

  // Current month
  const now         = new Date()
  const thisMonth   = now.toLocaleDateString("en-MY", { month: "short", year: "numeric" })
  const thisMonthData = byMonth[thisMonth]
  const thisMonthEarned = thisMonthData?.earned ?? 0

  // By item
  const byItem = {}
  myCompleted.forEach(t => {
    if (!byItem[t.itemName]) byItem[t.itemName] = 0
    byItem[t.itemName] += t.totalAmount || 0
  })
  const topItems = Object.entries(byItem)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  const maxItemEarned = topItems[0]?.[1] || 1

  const maxMonthEarned = Math.max(...months.map(m => m.earned), 1)

  if (loading) return <div className="p-6 text-center text-stone-500">Loading earnings…</div>

  return (
    <div>
      <Header title="Earnings Report" subtitle="Your rental income from completed transactions" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-stone-900">RM {totalEarned.toFixed(2)}</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">{myCompleted.length} completed rental{myCompleted.length !== 1 ? "s" : ""}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">This Month</p>
          <p className="text-2xl font-bold text-stone-900">RM {thisMonthEarned.toFixed(2)}</p>
          <p className="text-xs text-stone-400 mt-1 font-medium">{thisMonth}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-stone-500 font-medium mb-1">Avg per Rental</p>
          <p className="text-2xl font-bold text-stone-900">RM {avgPerRental.toFixed(2)}</p>
          <p className="text-xs text-stone-400 mt-1 font-medium">Based on {myCompleted.length} transactions</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-semibold text-stone-800 mb-5">Monthly Earnings</h2>
          {months.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-10">No completed transactions yet</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {months.map(m => (
                <div key={m.m} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-stone-700">RM{m.earned}</span>
                  <div
                    className="w-full bg-orange-500 rounded-t-lg hover:bg-orange-400 transition-colors"
                    style={{ height: `${(m.earned / maxMonthEarned) * 120}px` }}
                    title={`${m.m}: RM${m.earned} (${m.txn} txn)`}
                  />
                  <span className="text-xs text-stone-400 whitespace-nowrap">{m.m.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-stone-800 mb-4">By Item</h2>
          {topItems.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-10">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems.map(([name, earned]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-700 font-medium truncate pr-2">{name}</span>
                    <span className="text-stone-500 shrink-0">RM {earned.toFixed(0)}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full"
                      style={{ width: `${(earned / maxItemEarned) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
