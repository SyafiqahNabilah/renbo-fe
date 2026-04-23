import { useState, useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import { INITIAL_PAGE } from "./constants/nav"
import AppShell from "./components/layout/AppShell"

import LandingPage       from "./pages/LandingPage"
import LoginPage         from "./pages/auth/LoginPage"
import RegisterPage      from "./pages/auth/RegisterPage"

import OwnerDashboard    from "./pages/owner/OwnerDashboard"
import OwnerItems        from "./pages/owner/OwnerItems"
import OwnerItemForm     from "./pages/owner/OwnerItemForm"
import OwnerRequests     from "./pages/owner/OwnerRequests"
import OwnerReport       from "./pages/owner/OwnerReport"

import RenterBrowse      from "./pages/renter/RenterBrowse"
import RenterItemDetail  from "./pages/renter/RenterItemDetail"
import RenterRequests    from "./pages/renter/RenterRequests"

import AdminDashboard    from "./pages/admin/AdminDashboard"
import AdminUsers        from "./pages/admin/AdminUsers"
import AdminTransactions from "./pages/admin/AdminTransactions"

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const [view, setView] = useState("landing")
  const [page, setPage] = useState("owner-dash")
  const [selectedItem, setSelectedItem]           = useState(null)
  const [selectedOwnerItem, setSelectedOwnerItem] = useState(null)

  // FIX: on mount, if auth has restored a session from localStorage, jump straight to app
  useEffect(() => {
    if (authLoading) return
    if (user) {
      setPage(prev => {
        // Only set initial page if still on the default — don't overwrite navigation
        const validPages = Object.values(INITIAL_PAGE)
        if (prev === "owner-dash" && !validPages.includes(prev)) return prev
        return INITIAL_PAGE[user.role] || "renter-browse"
      })
      setView("app")
    }
  }, [authLoading, user])

  // Called by LoginPage on successful auth
  function handleAuthSuccess(normalizedUser) {
    setPage(INITIAL_PAGE[normalizedUser.role] || "renter-browse")
    setView("app")
  }

  // Show nothing while auth is restoring from localStorage (prevents flash of landing)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (view === "landing") return <LandingPage setView={setView} />
  if (view === "login")    return <LoginPage setView={setView} onSuccess={handleAuthSuccess} />
  if (view === "register") return <RegisterPage setView={setView} />

  function renderPage() {
    switch (page) {
      case "owner-dash":      return <OwnerDashboard setPage={setPage} />
      case "owner-items":     return <OwnerItems setPage={setPage} setSelectedOwnerItem={setSelectedOwnerItem} />
      case "owner-add":       return <OwnerItemForm setPage={setPage} selectedOwnerItem={selectedOwnerItem} setSelectedOwnerItem={setSelectedOwnerItem} />
      case "owner-requests":  return <OwnerRequests />
      case "owner-report":    return <OwnerReport />
      case "renter-browse":   return <RenterBrowse setPage={setPage} setSelectedItem={setSelectedItem} />
      case "renter-detail":   return <RenterItemDetail item={selectedItem} setPage={setPage} />
      case "renter-requests": return <RenterRequests />
      case "admin-dash":      return <AdminDashboard setPage={setPage} />
      case "admin-users":     return <AdminUsers />
      case "admin-txn":       return <AdminTransactions />
      default:                return <div className="text-stone-400 text-center py-20">Page not found</div>
    }
  }

  return (
    <AppShell page={page} setPage={setPage} setView={setView}>
      {renderPage()}
    </AppShell>
  )
}
