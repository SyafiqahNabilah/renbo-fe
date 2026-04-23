export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function PrimaryBtn({ children, onClick, className = "", small = false, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all ${small ? "px-3 py-1.5 text-sm" : "px-5 py-2.5"} ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`border border-stone-200 hover:bg-stone-50 active:scale-95 text-stone-700 font-medium rounded-xl px-4 py-2 text-sm transition-all ${className}`}
    >
      {children}
    </button>
  )
}
