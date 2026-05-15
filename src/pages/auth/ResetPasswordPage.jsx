import { useState, useEffect } from "react"
import { ShoppingBag, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { resetPassword } from "../../api/auth"
import { Card, PrimaryBtn } from "../../components/ui/Buttons"

const inputCls =
    "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm " +
    "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"

/**
 * ResetPasswordPage
 *
 * Reads the one-time token from the URL query string:
 *   http://localhost:5173/?view=reset-password&token=abc123
 *
 * The token is pre-filled and hidden from the user.
 * On success → redirects to login after a short delay.
 */
export default function ResetPasswordPage({ setView, token: tokenProp }) {
    const [token, setToken]               = useState(tokenProp || "")
    const [newPassword, setNewPassword]   = useState("")
    const [confirmPassword, setConfirm]   = useState("")
    const [showNew, setShowNew]           = useState(false)
    const [showConfirm, setShowConfirm]   = useState(false)
    const [loading, setLoading]           = useState(false)
    const [error, setError]               = useState("")
    const [success, setSuccess]           = useState(false)
    const [countdown, setCountdown]       = useState(5)

    // If token wasn't passed as prop, try reading from URL query string
    useEffect(() => {
        if (!tokenProp) {
            const params = new URLSearchParams(window.location.search)
            const urlToken = params.get("token")
            if (urlToken) setToken(urlToken)
        }
    }, [tokenProp])

    // Countdown + auto-redirect after success
    useEffect(() => {
        if (!success) return
        if (countdown <= 0) { setView("login"); return }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [success, countdown, setView])

    // Password strength indicator
    function strength(pw) {
        if (!pw) return null
        const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)]
        const score = checks.filter(Boolean).length
        if (score <= 1) return { label: "Weak",   color: "bg-red-400",    text: "text-red-500"    }
        if (score <= 2) return { label: "Fair",   color: "bg-amber-400",  text: "text-amber-600"  }
        if (score <= 3) return { label: "Good",   color: "bg-blue-400",   text: "text-blue-600"   }
        return             { label: "Strong", color: "bg-emerald-400", text: "text-emerald-600" }
    }

    const pwStrength = strength(newPassword)

    async function handleReset() {
        setError("")
        if (!token) {
            setError("Invalid or missing reset token. Please request a new reset link.")
            return
        }
        if (!newPassword) { setError("Please enter a new password."); return }
        if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return }
        if (newPassword !== confirmPassword) { setError("Passwords do not match."); return }

        setLoading(true)
        try {
            await resetPassword(token, newPassword, confirmPassword)
            setSuccess(true)
        } catch (err) {
            setError(err.message || "Password reset failed. The link may have expired.")
        } finally {
            setLoading(false)
        }
    }

    // ── Success state ──────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-stone-900">Password updated!</h1>
                        <p className="text-stone-500 text-sm mt-1">Your password has been reset successfully</p>
                    </div>

                    <Card className="p-6">
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm text-stone-600">
                                    You can now sign in with your new password.
                                </p>
                                <p className="text-xs text-stone-400">
                                    Redirecting to login in{" "}
                                    <span className="font-semibold text-orange-500">{countdown}s</span>…
                                </p>
                            </div>
                            <PrimaryBtn
                                onClick={() => setView("login")}
                                className="w-full justify-center text-center mt-2"
                            >
                                Sign In Now
                            </PrimaryBtn>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // ── Token missing warning ──────────────────────────────────────────────────
    if (!token) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <Card className="p-6">
                        <div className="flex flex-col items-center gap-4 text-center py-2">
                            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-amber-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-stone-800 mb-1">Invalid reset link</p>
                                <p className="text-sm text-stone-500">
                                    This link is missing a reset token. Please request a new password reset link.
                                </p>
                            </div>
                            <PrimaryBtn onClick={() => setView("forgot-password")} className="w-full justify-center">
                                Request New Link
                            </PrimaryBtn>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // ── Form state ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900">Set new password</h1>
                    <p className="text-stone-500 text-sm mt-1">Choose a strong password for your account</p>
                </div>

                <Card className="p-6">
                    <div className="space-y-4">

                        {/* New password */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                New password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setError("") }}
                                    className={`${inputCls} pr-11`}
                                    placeholder="Min. 8 characters"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {newPassword && pwStrength && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                                            style={{
                                                width: pwStrength.label === "Weak"   ? "25%"
                                                    : pwStrength.label === "Fair"   ? "50%"
                                                        : pwStrength.label === "Good"   ? "75%"
                                                            : "100%"
                                            }}
                                        />
                                    </div>
                                    <p className={`text-xs font-medium ${pwStrength.text}`}>{pwStrength.label}</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                Confirm new password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => { setConfirm(e.target.value); setError("") }}
                                    onKeyDown={e => e.key === "Enter" && handleReset()}
                                    className={`${inputCls} pr-11 ${
                                        confirmPassword && confirmPassword !== newPassword
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : confirmPassword && confirmPassword === newPassword
                                                ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                                                : ""
                                    }`}
                                    placeholder="Re-enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                            )}
                            {confirmPassword && confirmPassword === newPassword && (
                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        {/* Requirements hint */}
                        <ul className="text-xs text-stone-400 space-y-0.5 pl-1">
                            {[
                                ["At least 8 characters",          newPassword.length >= 8],
                                ["One uppercase letter",            /[A-Z]/.test(newPassword)],
                                ["One number",                      /[0-9]/.test(newPassword)],
                                ["One special character (optional)",/[^A-Za-z0-9]/.test(newPassword)],
                            ].map(([label, met]) => (
                                <li key={label} className={`flex items-center gap-1.5 ${met ? "text-emerald-600" : ""}`}>
                                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${met ? "bg-emerald-500" : "bg-stone-300"}`} />
                                    {label}
                                </li>
                            ))}
                        </ul>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <PrimaryBtn
                            onClick={handleReset}
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full justify-center text-center"
                        >
                            {loading ? "Updating password…" : "Update Password"}
                        </PrimaryBtn>

                        <p className="text-center text-sm text-stone-400 pt-1">
                            <button
                                onClick={() => setView("forgot-password")}
                                className="hover:text-stone-600 flex items-center gap-1 mx-auto transition-colors text-xs"
                            >
                                <ArrowLeft className="w-3 h-3" /> Request a new reset link
                            </button>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}