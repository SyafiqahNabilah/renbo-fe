const SIZES  = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" }
const COLORS = { orange: "bg-orange-100 text-orange-700", teal: "bg-teal-100 text-teal-700", purple: "bg-purple-100 text-purple-700", rose: "bg-rose-100 text-rose-700" }

function pickColor(initials) {
  const palette = ["orange", "teal", "purple", "rose"]
  const index   = (initials?.charCodeAt(0) ?? 0) % palette.length
  return palette[index]
}

export default function Avatar({ initials = "??", size = "md", color }) {
  const resolved = color || pickColor(initials)
  return (
    <div className={`${SIZES[size]} ${COLORS[resolved]} rounded-full flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  )
}
