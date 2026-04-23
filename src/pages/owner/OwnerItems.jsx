import { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { fetchItemsByOwner, deleteItem } from "../../api/items"
import { transformItems } from "../../utils/dataTransform"
import { isItemAvailable, getItemImageSrc } from "../../components/ui/helpers"
import { Card, PrimaryBtn, GhostBtn } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"

export default function OwnerItems({ setPage, setSelectedOwnerItem }) {
  const { user, token } = useAuth()
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => {
    if (!token || !user?.id) return
    setLoading(true)
    fetchItemsByOwner(token, user.id)
      .then(r => setItems(transformItems(r || [])))
      .catch(err => setError(err.message || "Failed to load items."))
      .finally(() => setLoading(false))
  }, [token, user?.id])

  async function handleDelete(itemId) {
    setDeletingId(itemId)
    setError("")
    try {
      await deleteItem(token, itemId)
      // FIX: use String() comparison so UUID type differences don't block the filter
      setItems(prev => prev.filter(item => String(item.id) !== String(itemId)))
    } catch (err) {
      setError(err.message || "Failed to delete item.")
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  function openAdd()       { setSelectedOwnerItem(null); setPage("owner-add") }
  function openEdit(item)  { setSelectedOwnerItem(item); setPage("owner-add") }

  if (loading) return <div className="p-6 text-center text-stone-500">Loading items…</div>

  return (
    <div>
      <Header
        title="My Items"
        subtitle={`${items.length} listing${items.length !== 1 ? "s" : ""}`}
        action={
          <PrimaryBtn onClick={openAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Item
          </PrimaryBtn>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-stone-900 mb-2">Delete this item?</h3>
            <p className="text-sm text-stone-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2 rounded-xl text-sm transition-all"
              >
                {deletingId === confirmDeleteId ? "Deleting…" : "Yes, Delete"}
              </button>
              <GhostBtn onClick={() => setConfirmDeleteId(null)} className="flex-1">Cancel</GhostBtn>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => {
          const imageSrc  = getItemImageSrc(item)
          const available = isItemAvailable(item)
          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                {imageSrc
                  ? <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
                  : <span className="text-5xl">{item.emoji || "📦"}</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900">{item.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{item.category} · {item.pickupMethod}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${available ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                    {available ? "Available" : "Rented Out"}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                  <span className="font-bold text-orange-600">RM {item.price}<span className="text-xs font-normal text-stone-400">/day</span></span>
                  <div className="flex gap-2">
                    <GhostBtn onClick={() => openEdit(item)} className="!px-2.5 !py-1.5"><Edit className="w-3.5 h-3.5" /></GhostBtn>
                    <GhostBtn
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="!px-2.5 !py-1.5 !text-red-400 !border-red-100 hover:!bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </GhostBtn>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        <button onClick={openAdd} className="border-2 border-dashed border-stone-200 hover:border-orange-300 rounded-2xl flex flex-col items-center justify-center p-8 gap-3 transition-colors group min-h-[240px]">
          <div className="w-12 h-12 bg-stone-100 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-stone-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <p className="text-sm font-medium text-stone-500 group-hover:text-orange-600 transition-colors">Add new item</p>
        </button>
      </div>
    </div>
  )
}
