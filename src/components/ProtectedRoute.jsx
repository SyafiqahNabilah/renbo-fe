import { useAuth } from "../context/AuthContext"
import LoginPage from "../pages/auth/LoginPage"

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-stone-400">
        Loading...
      </div>
    )
  }

  if (!user) return <LoginPage setView={() => {}} onSuccess={() => {}} />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 font-medium">Access denied.</p>
      </div>
    )
  }

  return children
}
