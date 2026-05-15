import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"

const ToastContext = createContext(null)

const ICONS = {
    success: CheckCircle,
    error:   AlertTriangle,
    info:    Info,
}

const STYLES = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error:   "bg-red-50 border-red-200 text-red-800",
    info:    "bg-sky-50 border-sky-200 text-sky-800",
}

const ICON_STYLES = {
    success: "text-emerald-500",
    error:   "text-red-500",
    info:    "text-sky-500",
}

function ToastItem({ toast, onDismiss }) {
    const Icon = ICONS[toast.type] || Info
    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm
        animate-in slide-in-from-right-5 fade-in duration-200
        ${STYLES[toast.type] || STYLES.info}`}
        >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${ICON_STYLES[toast.type]}`} />
            <p className="flex-1 leading-snug font-medium">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = useCallback((message, type = "info", duration = 4000) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev.slice(-4), { id, message, type }]) // max 5 toasts
        if (duration > 0) setTimeout(() => dismiss(id), duration)
        return id
    }, [dismiss])

    // Convenience methods
    toast.success = (msg, dur) => toast(msg, "success", dur)
    toast.error   = (msg, dur) => toast(msg, "error",   dur ?? 6000) // errors stay longer
    toast.info    = (msg, dur) => toast(msg, "info",    dur)

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            {/* Toast container — bottom-right */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)] pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used inside ToastProvider")
    return ctx.toast
}