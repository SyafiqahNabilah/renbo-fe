import { Users, Package, Activity, TrendingUp } from "lucide-react"
import { useData } from "../../hooks/useData"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import Avatar from "../../components/ui/Avatar"
import StatusBadge from "../../components/ui/StatusBadge"

export default function AdminDashboard({ setPage }) {
  const { transactions, users, loading } = useData()

  const stats = [
    { l: "Total Users",        v: String(users.length),        icon: Users,    color: "blue"    },
    { l: "Active Listings",    v: "—",                          icon: Package,  color: "orange"  },
    { l: "Total Transactions", v: String(transactions.length), icon: Activity, color: "purple"  },
    { l: "Platform Revenue",   v: "—",                          icon: TrendingUp,color:"emerald" },
  ]

  const colors = {
    blue:    "bg-blue-50 text-blue-600",
    orange:  "bg-orange-50 text-orange-600",
    purple:  "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-700",
  }

  if (loading) return <div className="p-6 text-center text-stone-500">Loading dashboard…</div>

  return (
    <div>
      <Header title="Admin Dashboard" subtitle="Platform overview — RenBoNow Malaysia" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.l} className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[s.color]}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{s.v}</p>
            <p className="text-stone-500 text-xs mt-0.5">{s.l}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Recent Transactions</h2>
            <button onClick={() => setPage("admin-txn")} className="text-orange-600 text-xs hover:underline font-semibold">View all →</button>
          </div>
          {transactions.length === 0
            ? <p className="text-stone-400 text-sm text-center py-6">No transactions yet</p>
            : (
              <div className="space-y-2">
                {transactions.slice(0, 4).map(t => (
                  <div key={t.transactionID} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <Avatar initials={t.renterAvatar || "??"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{t.itemName}</p>
                      <p className="text-xs text-stone-400">{t.renterName} · RM {t.totalAmount}</p>
                    </div>
                    <StatusBadge status={t.transactionStatus} />
                  </div>
                ))}
              </div>
            )
          }
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Registered Users</h2>
            <button onClick={() => setPage("admin-users")} className="text-orange-600 text-xs hover:underline font-semibold">Manage all →</button>
          </div>
          {users.length === 0
            ? <p className="text-stone-400 text-sm text-center py-6">No users yet</p>
            : (
              <div className="space-y-2">
                {users.slice(0, 4).map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <Avatar initials={u.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800">{u.fullName}</p>
                      <p className="text-xs text-stone-400">{u.role} · Joined {u.joined}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                      {u.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </Card>
      </div>
    </div>
  )
}
