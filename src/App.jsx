import { useState, useEffect } from "react"
import { useAuth } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import { INITIAL_PAGE } from "./constants/nav"
import AppShell from "./components/layout/AppShell"

import LandingPage        from "./pages/LandingPage"
import LoginPage          from "./pages/auth/LoginPage"
import RegisterPage       from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage  from "./pages/auth/ResetPasswordPage"
import ProfilePage        from "./pages/profile/ProfilePage"

import OwnerDashboard  from "./pages/owner/OwnerDashboard"
import OwnerItems      from "./pages/owner/OwnerItems"
import OwnerItemForm   from "./pages/owner/OwnerItemForm"
import OwnerRequests   from "./pages/owner/OwnerRequests"
import OwnerReport     from "./pages/owner/OwnerReport"

import RenterBrowse     from "./pages/renter/RenterBrowse"
import RenterItemDetail from "./pages/renter/RenterItemDetail"
import RenterRequests   from "./pages/renter/RenterRequests"

import AdminDashboard    from "./pages/admin/AdminDashboard"
import AdminUsers        from "./pages/admin/AdminUsers"
import AdminTransactions from "./pages/admin/AdminTransactions"

function AppInner() {
  const { user, loading: authLoading } = useAuth()
  const [view, setView]                 = useState("landing")
  const [page, setPage]                 = useState("owner-dash")
  const [resetToken, setResetToken]     = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOwnerItem, setSelectedOwnerItem] = useState(null)

  // On mount: check URL for a password-reset token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get("token")
    if (token) {
      setResetToken(token)
      setView("reset-password")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  // Restore session
  useEffect(() => {
    if (authLoading) return
    if (user) {
      setPage(INITIAL_PAGE[user.role] || "renter-browse")
      setView("app")
    }
  }, [authLoading, user])

  function handleAuthSuccess(normalizedUser) {
    setPage(INITIAL_PAGE[normalizedUser.role] || "renter-browse")
    setView("app")
  }

  if (authLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
  }

  // ── Public views ──────────────────────────────────────────────────────────
  if (view === "landing")         return <LandingPage setView={setView} />
  if (view === "login")           return <LoginPage setView={setView} onSuccess={handleAuthSuccess} />
  if (view === "register")        return <RegisterPage setView={setView} />
  if (view === "forgot-password") return <ForgotPasswordPage setView={setView} />
  if (view === "reset-password")  return <ResetPasswordPage  setView={setView} token={resetToken} />

  // ── Authenticated shell ───────────────────────────────────────────────────
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
      case "profile":         return <ProfilePage />
      default: return (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-5xl mb-4">🗺️</span>
            <p className="font-semibold text-stone-700 text-lg">Page not found</p>
            <button
                onClick={() => setPage(INITIAL_PAGE[user?.role] || "renter-browse")}
                className="mt-4 text-sm text-orange-600 hover:underline"
            >
              Go to dashboard
            </button>
          </div>
      )
    }
  }

  return (
      <AppShell page={page} setPage={setPage} setView={setView}>
        {renderPage()}
      </AppShell>
  )
}

// ToastProvider wraps the whole app so any page can call useToast()
export default function App() {
  return (
      <ToastProvider>
        <AppInner />
      </ToastProvider>
  )
}