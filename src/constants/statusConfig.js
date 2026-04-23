// Keyed on normalised (title-case) status strings as returned by transformTransaction()
export const STATUS_CONFIG = {
  Pending:         { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  Approved:        { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  Active:          { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Completed:       { bg: "bg-stone-100",  text: "text-stone-600",   border: "border-stone-200",   dot: "bg-stone-400"   },
  Cancelled:       { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     dot: "bg-red-500"     },
}
