import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../hooks/useData"
import { deactivateUser } from "../../api/users"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import Avatar from "../../components/ui/Avatar"

const ROLE_FILTERS = ["All", "Owner", "Renter", "Admin"]

export default function AdminUsers() {
  const { token } = useAuth()
  const { users: backendUsers, loading } = useData()
  const [users, setUsers]         = useState([])
  const [actionId, setActionId]   = useState(null)
  const [error, setError]         = useState("")
  const [searchQuery, setSearch]  = useState("")
  const [roleFilter, setRole]     = useState("All")

  useEffect(() => {
    if (backendUsers.length > 0) setUsers(backendUsers)
  }, [backendUsers])

  // Filter users by search + role
  const filtered = users.filter(u => {
    const matchesRole   = roleFilter === "All" || u.role === roleFilter
    const q             = searchQuery.toLowerCase()
    const matchesSearch = !q
      || (u.fullName  || "").toLowerCase().includes(q)
      || (u.email     || "").toLowerCase().includes(q)
    return matchesRole && matchesSearch
  })

  async function handleToggle(user) {
    setActionId(user.id || user.email)
    setError("")
    try {
      if (user.status === "Active" && user.id) {
        await deactivateUser(token, user.id)
      }
      // Optimistic update — toggle in local state
      setUsers(prev => prev.map(u =>
        (u.id === user.id || u.email === user.email)
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      ))
    } catch (err) {
      setError(err.message || "Failed to update user status.")
    } finally {
      setActionId(null)
    }
  }

  if (loading) return <div className="p-6 text-center text-stone-500">Loading users…</div>

  return (
    <div>
      <Header
        title="User Management"
        subtitle={`${filtered.length} of ${users.length} user${users.length !== 1 ? "s" : ""}`}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
          />
        </div>
        {/* Role filter pills */}
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                roleFilter === r
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {r}
              {r !== "All" && (
                <span className="ml-1 opacity-60">
                  ({users.filter(u => u.role === r).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {!users.length ? (
        <div className="text-center py-20 text-stone-400">No registered users yet.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <span className="text-3xl block mb-2">🔍</span>
          <p>No users match "{searchQuery}"</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["User", "Role", "Joined", "Items", "Transactions", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id || u.email || idx} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={u.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-stone-800">{u.fullName}</p>
                          <p className="text-xs text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === "Owner" ? "bg-purple-50 text-purple-700"
                        : u.role === "Admin" ? "bg-orange-50 text-orange-600"
                        : "bg-sky-50 text-sky-700"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-xs">{u.joined}</td>
                    <td className="px-5 py-4 text-stone-700 text-xs">{u.items}</td>
                    <td className="px-5 py-4 text-stone-700 text-xs">{u.txn}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(u)}
                        disabled={actionId === (u.id || u.email)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                          u.status === "Active"
                            ? "border-red-100 text-red-500 hover:bg-red-50"
                            : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {actionId === (u.id || u.email) ? "…" : u.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
