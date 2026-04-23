import { useState } from "react"
import { Search } from "lucide-react"
import { useData } from "../../hooks/useData"
import Header from "../../components/layout/Header"
import ItemCard from "../../components/ui/ItemCard"

const CATEGORIES = ["All", "Electronics", "Tools", "Outdoor", "Sports", "Music", "Event Gear"]

export default function RenterBrowse({ setPage, setSelectedItem }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const { items, loading } = useData()

  const filtered = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query
      || item.name.toLowerCase().includes(query)
      || (item.category || "").toLowerCase().includes(query)
      || (item.description || "").toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  if (loading) return <div className="p-6 text-center text-stone-500">Loading items…</div>

  return (
    <div>
      <Header title="Browse Items" subtitle="Find what you need from owners near you" />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search cameras, drills, tents…"
          className="w-full border border-stone-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === c
                ? "bg-orange-500 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-orange-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={i => { setSelectedItem(i); setPage("renter-detail") }}
          />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-stone-400">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-medium">
              {searchQuery ? `No items found for "${searchQuery}"` : "No items in this category yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
