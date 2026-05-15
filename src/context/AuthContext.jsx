import { createContext, useContext, useState, useEffect } from "react"
import { loginApi } from "../api/auth"
import { normalizeRole } from "../utils/dataTransform"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // { id, name, email, role }
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("renbo_token")
    const savedUser  = localStorage.getItem("renbo_user")
    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch {
        localStorage.removeItem("renbo_token")
        localStorage.removeItem("renbo_user")
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await loginApi(email, password)
    const normalizedUser = {
      id:    data.userId ?? null,
      name:  data.fullName,
      email: data.email ?? email,
      role:  normalizeRole(data.role),
      phoneNo: data.phoneNo,
      noAccount: data.noAccount,
      address: data.address
    }
    setToken(data.token)
    setUser(normalizedUser)
    localStorage.setItem("renbo_token", data.token)
    localStorage.setItem("renbo_user", JSON.stringify(normalizedUser))
    return normalizedUser
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem("renbo_token")
    localStorage.removeItem("renbo_user")
  }

  /**
   * Patches the in-memory + localStorage user after a profile update.
   * Only the fields present in `patch` are changed.
   * Called by ProfilePage after a successful PUT /user/profile.
   */
  function updateUser(patch) {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...patch }
      localStorage.setItem("renbo_user", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
