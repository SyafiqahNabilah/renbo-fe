import { useState } from "react"
import { ShoppingBag, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { forgotPassword } from "../../api/auth"
import { Card, PrimaryBtn } from "../../components/ui/Buttons"

const inputCls =
    "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm " +
    "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"

export default function ForgotPasswordPage({ setView }) {
    const [email, setEmail]     = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState("")
    const [sent, setSent]       = useState(false)

    async function handleSubmit() {
        const trimmed = email.trim()
        if (!trimmed) { setError("Please enter your email address."); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("Please enter a valid email address.")
            return
        }

        setError("")
        setLoading(true)
        try {
            await forgotPassword(trimmed)
            setSent(true)
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-stone-900">
                        {sent ? "Check your email" : "Forgot password?"}
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        {sent
                            ? "We've sent a reset link to your inbox"
                            : "Enter your email and we'll send you a reset link"}
                    </p>
                </div>

                <Card className="p-6">
                    {/* ── Success state ── */}
                    {sent ? (
                        <div className="space-y-5">
                            <div className="flex flex-col items-center gap-3 py-2">
                                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-stone-700 font-medium">Email sent to</p>
                                    <p className="text-sm text-orange-600 font-semibold mt-0.5">{email}</p>
                                </div>
                                <p className="text-xs text-stone-400 text-center leading-relaxed">
                                    The link expires in <span className="font-medium text-stone-500">1 hour</span>.
                                    Check your spam folder if you don't see it.
                                </p>
                            </div>

                            <div className="border-t border-stone-100 pt-4 space-y-2">
                                <button
                                    onClick={() => { setSent(false); setEmail("") }}
                                    className="w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors py-1"
                                >
                                    Didn't receive it? Try a different email
                                </button>
                                <PrimaryBtn
                                    onClick={() => setView("login")}
                                    className="w-full justify-center text-center"
                                >
                                    Back to Sign In
                                </PrimaryBtn>
                            </div>
                        </div>

                    ) : (
                        /* ── Form state ── */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError("") }}
                                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                        className={`${inputCls} pl-10`}
                                        placeholder="you@example.com"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm flex items-center gap-1.5">
                                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full flex-shrink-0 mt-0.5" />
                                    {error}
                                </p>
                            )}

                            <PrimaryBtn
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full justify-center text-center"
                            >
                                {loading ? "Sending…" : "Send Reset Link"}
                            </PrimaryBtn>

                            <p className="text-center text-sm text-stone-500 pt-1">
                                Remember your password?{" "}
                                <button
                                    onClick={() => setView("login")}
                                    className="text-orange-600 font-semibold hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    )}
                </Card>

                <p className="text-center text-xs text-stone-400 mt-4">
                    <button
                        onClick={() => setView("landing")}
                        className="hover:text-stone-600 flex items-center gap-1 mx-auto transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to home
                    </button>
                </p>
            </div>
        </div>
    )
}