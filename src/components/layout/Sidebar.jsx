import { ShoppingBag, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { NAV } from "../../constants/nav"
import Avatar from "../ui/Avatar"

export default function Sidebar({ page, setPage, setView }) {
  const { user, logout } = useAuth()
  const role     = user?.role || "Renter"
  const navItems = NAV[role] || []

  function handleLogout() {
    logout()
    setView("landing")
  }

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  return (
    <div className="w-60 shrink-0 bg-stone-950 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">RenBoNow</span>
        </div>
      </div>

      {/* Role label — display only, no switcher */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-stone-500 text-xs font-medium uppercase tracking-wider">
          {role} Account
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
              ${page === id
                ? "bg-orange-500/20 text-orange-400"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"}`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${page === id ? "text-orange-400" : "text-stone-500 group-hover:text-stone-300"}`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-stone-800">
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-stone-200 text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-stone-500 text-xs truncate">{user?.email || ""}</p>
          </div>
          <button onClick={handleLogout} className="text-stone-500 hover:text-stone-300 transition-colors" title="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
