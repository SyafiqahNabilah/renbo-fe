import { Package, Inbox, TrendingUp, CheckCircle, ArrowUpRight, Plus, BarChart2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../hooks/useData"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import Avatar from "../../components/ui/Avatar"
import StatusBadge from "../../components/ui/StatusBadge"

export default function OwnerDashboard({ setPage }) {
  const { user } = useAuth()
  const { transactions, loading } = useData()

  // Derive real counts from transaction data
  // TODO Session 2: replace hardcoded active listings + earnings with real API data
  const myTransactions  = transactions.filter(t => t.ownerName === user?.name)
  const pendingCount    = myTransactions.filter(t => t.transactionStatus === "Pending").length
  const completedCount  = myTransactions.filter(t => t.transactionStatus === "Completed").length
  const recentRequests  = myTransactions.slice(0, 3)

  const stats = [
    { label: "Active Listings",    value: "—",           icon: Package,      change: "See My Items", color: "orange" },
    { label: "Pending Requests",   value: String(pendingCount),   icon: Inbox,        change: pendingCount > 0 ? "Needs review" : "All clear", color: "amber"   },
    { label: "This Month Earnings",value: "—",           icon: TrendingUp,   change: "See Earnings", color: "emerald" },
    { label: "Completed Rentals",  value: String(completedCount), icon: CheckCircle,  change: "All time",     color: "blue"    },
  ]

  const colorMap = {
    orange:  "bg-orange-50 text-orange-600",
    amber:   "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-700",
    blue:    "bg-blue-50 text-blue-600",
  }

  if (loading) return <div className="p-6 text-center text-stone-500">Loading dashboard…</div>

  return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back, ${user?.name || "Owner"} 👋`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-stone-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />{s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="text-stone-500 text-xs mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Recent Requests</h2>
            <button onClick={() => setPage("owner-requests")} className="text-orange-600 text-xs font-semibold hover:underline">View all →</button>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-8">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map(t => (
                <div key={t.transactionID} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Avatar initials={t.renterAvatar || "??"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{t.itemName}</p>
                    <p className="text-xs text-stone-500">{t.renterName} · {t.startDate}</p>
                  </div>
                  <StatusBadge status={t.transactionStatus} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-stone-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { page: "owner-items",    icon: Plus,      bg: "bg-orange-100", ic: "text-orange-600", title: "Add New Item",      sub: "List something to rent" },
              { page: "owner-requests", icon: Inbox,     bg: "bg-amber-100",  ic: "text-amber-600",  title: "Review Requests",   sub: `${pendingCount} pending approval` },
              { page: "owner-report",   icon: BarChart2, bg: "bg-emerald-100",ic: "text-emerald-600",title: "View Earnings",     sub: "Monthly report" },
            ].map(({ page, icon: Icon, bg, ic, title, sub }) => (
              <button key={page} onClick={() => setPage(page)} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors text-left">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}><Icon className={`w-4 h-4 ${ic}`} /></div>
                <div><p className="text-sm font-medium text-stone-800">{title}</p><p className="text-xs text-stone-400">{sub}</p></div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
