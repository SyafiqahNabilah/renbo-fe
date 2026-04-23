import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { signUp } from "../../api/auth"
import { Card, PrimaryBtn } from "../../components/ui/Buttons"

export default function RegisterPage({ setView }) {
  // FIX: initialise as title-case to match button labels; API layer converts to UPPER
  const [role, setRole]           = useState("Renter")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")
  // Register returns UserResponseDto (no token) — redirect to login after success
  async function handleRegister() {
    setError("")
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    try {
      setLoading(true)
      await signUp({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password, role })
      setView("login")
    } catch (err) {
      setError(err.message || "Unable to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Create account</h1>
          <p className="text-stone-500 text-sm mt-1">Join RenBoNow for free</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ahmad" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Razif" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ahmad@mail.com" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-2">
                {["Owner", "Renter"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      role === r ? "border-orange-500 bg-orange-50 text-orange-700" : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    {r === "Owner" ? "🏷️ List Items" : "🛍️ Rent Items"}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <PrimaryBtn onClick={handleRegister} disabled={loading} className="w-full justify-center text-center">
              {loading ? "Creating account…" : "Create Account & Sign In"}
            </PrimaryBtn>
          </div>

          <p className="text-center text-sm text-stone-500 mt-5">
            Already have an account?{" "}
            <button onClick={() => setView("login")} className="text-orange-600 font-semibold hover:underline">Sign in</button>
          </p>
        </Card>
      </div>
    </div>
  )
}
