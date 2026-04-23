import { useState } from "react"
import { ShoppingBag, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { Card, PrimaryBtn } from "../../components/ui/Buttons"

export default function LoginPage({ setView, onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]           = useState("")
  const [loading, setLoading]       = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError("Please enter your email and password."); return }
    setError("")
    setLoading(true)
    try {
      const user = await login(email, password)
      onSuccess(user)
    } catch (err) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to your RenBoNow account</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className={`${inputCls} pr-11`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <PrimaryBtn onClick={handleLogin} disabled={loading} className="w-full justify-center text-center">
              {loading ? "Signing in…" : "Sign In"}
            </PrimaryBtn>
          </div>

          <p className="text-center text-sm text-stone-500 mt-5">
            Don't have an account?{" "}
            <button onClick={() => setView("register")} className="text-orange-600 font-semibold hover:underline">Sign up</button>
          </p>
        </Card>

        <p className="text-center text-xs text-stone-400 mt-4">
          <button onClick={() => setView("landing")} className="hover:text-stone-600">← Back to home</button>
        </p>
      </div>
    </div>
  )
}
