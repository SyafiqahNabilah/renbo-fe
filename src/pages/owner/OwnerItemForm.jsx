import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { createItem, updateItem, fetchCategories } from "../../api/items"
import { Card, PrimaryBtn, GhostBtn } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"

const FALLBACK_CATEGORIES = ["Electronics","Tools","Outdoor","Sports","Music","Event Gear","Furniture","Other"]

const EMPTY_FORM = {
  name: "", description: "", brand: "",
  height: "", width: "", depth: "", weight: "",
  category: "Electronics", quantity: 1, material: "",
  schema: "Good",
  rate: 0, deposit: 0,
  pickupMethod: "Self Pickup",
  availability: "Available",
  images: [],
}

const INPUT_CLS  = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
const SELECT_CLS = "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400"

export default function OwnerItemForm({ setPage, selectedOwnerItem, setSelectedOwnerItem }) {
  const { token, user }   = useAuth()
  const [form, setForm]   = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState("")
  const [imagePreviews, setImagePreviews] = useState([])

  // ── Dynamic categories from API ─────────────────────────────────
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  useEffect(() => {
    if (!token) return
    fetchCategories(token)
      .then(cats => {
        if (cats?.length > 0) setCategories(cats)
      })
      .catch(() => { /* silently keep fallback */ })
  }, [token])

  const editingId = selectedOwnerItem?.id ?? selectedOwnerItem?.itemID ?? selectedOwnerItem?.itemId ?? null
  const isEditing = Boolean(editingId)

  function field(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => imagePreviews.forEach(p => {
      if (p.url?.startsWith("blob:")) URL.revokeObjectURL(p.url)
    })
  }, []) // eslint-disable-line

  // Populate form when editing
  useEffect(() => {
    if (!selectedOwnerItem) { setForm(EMPTY_FORM); setImagePreviews([]); return }
    setForm({
      name:         selectedOwnerItem.name        || "",
      description:  selectedOwnerItem.description || selectedOwnerItem.desc || "",
      brand:        selectedOwnerItem.brand        || "",
      height:       selectedOwnerItem.height       || "",
      width:        selectedOwnerItem.width        || "",
      depth:        selectedOwnerItem.depth        || "",
      weight:       selectedOwnerItem.weight       || "",
      category:     selectedOwnerItem.category     || selectedOwnerItem.cat || categories[0],
      quantity:     selectedOwnerItem.quantity ?? 1,
      material:     selectedOwnerItem.material     || "",
      schema:       selectedOwnerItem.schema || selectedOwnerItem.condition || selectedOwnerItem.cond || "Good",
      rate:         selectedOwnerItem.rate ?? selectedOwnerItem.price ?? 0,
      deposit:      selectedOwnerItem.deposit ?? 0,
      pickupMethod: selectedOwnerItem.pickupMethod || "Self Pickup",
      availability: selectedOwnerItem.availability || (selectedOwnerItem.available ? "Available" : "Unavailable"),
      images: [],
    })
    const existing = [selectedOwnerItem.itemImage1, selectedOwnerItem.itemImage2, selectedOwnerItem.itemImage3]
      .filter(Boolean)
      .map((img, i) => ({
        name: `existing-${i}`,
        url: img.startsWith("data:") || img.startsWith("http") ? img : `data:image/*;base64,${img}`,
      }))
    setImagePreviews(existing)
  }, [selectedOwnerItem]) // eslint-disable-line

  function handleImages(e) {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) { setError("Upload up to 3 images."); return }
    // Revoke any existing blob URLs before replacing
    imagePreviews.forEach(p => { if (p.url?.startsWith("blob:")) URL.revokeObjectURL(p.url) })
    setForm(prev => ({ ...prev, images: files }))
    setImagePreviews(files.map(f => ({ name: `${f.name}-${f.lastModified}`, url: URL.createObjectURL(f) })))
    setError("")
  }

  function goBack() { setSelectedOwnerItem(null); setPage("owner-items") }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim() || !form.brand.trim()) {
      setError("Name, description, and brand are required.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        brand:       form.brand.trim(),
        height:      form.height,
        width:       form.width,
        depth:       form.depth,
        weight:      form.weight,
        category:    form.category,
        quantity:    Number(form.quantity) || 1,
        material:    form.material,
        schema:      form.schema,
        rate:        Number(form.rate)     || 0,
        deposit:     Number(form.deposit)  || 0,
        pickupMethod: form.pickupMethod,
        availability: form.availability,
        ownerId:     user?.id ?? "",
      }
      if (form.images.length > 0) payload.images = form.images
      if (isEditing) await updateItem(token, editingId, payload)
      else           await createItem(token, payload)
      goBack()
    } catch (err) {
      setError(err.message || "Failed to save item.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Header
        title={isEditing ? "Update Item" : "Add New Item"}
        subtitle={isEditing ? "Edit your listing details" : "Fill in the details to list your item"}
        action={<GhostBtn onClick={goBack}><ArrowLeft className="w-4 h-4 mr-1.5 inline" />Back</GhostBtn>}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-semibold text-stone-800 mb-5">Item Details</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => field("name", e.target.value)}
                  placeholder="e.g. Sony A7III Camera" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Brand *</label>
                <input value={form.brand} onChange={e => field("brand", e.target.value)}
                  placeholder="e.g. Sony" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
                {/* ── Dynamic categories from GET /item/categories ── */}
                <select value={form.category} onChange={e => field("category", e.target.value)} className={SELECT_CLS}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => field("description", e.target.value)}
                rows={4} placeholder="Describe the item, what is included, and any usage notes…"
                className={`${INPUT_CLS} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Material</label>
                <input value={form.material} onChange={e => field("material", e.target.value)}
                  placeholder="e.g. Aluminum" className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Condition</label>
                <select value={form.schema} onChange={e => field("schema", e.target.value)} className={SELECT_CLS}>
                  {["Excellent","Like New","Good","Fair"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {["height","width","depth","weight"].map(dim => (
                <div key={dim}>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5 capitalize">{dim}</label>
                  <input value={form[dim]} onChange={e => field(dim, e.target.value)}
                    placeholder={dim === "weight" ? "1.2 kg" : "10 cm"} className={INPUT_CLS} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Quantity</label>
                <input type="number" min="1" value={form.quantity}
                  onChange={e => field("quantity", e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Rate (RM/day)</label>
                <input type="number" min="0" step="0.01" value={form.rate}
                  onChange={e => field("rate", e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Deposit (RM)</label>
                <input type="number" min="0" step="0.01" value={form.deposit}
                  onChange={e => field("deposit", e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Availability</label>
                <select value={form.availability} onChange={e => field("availability", e.target.value)} className={SELECT_CLS}>
                  {["Available","Unavailable","Reserved"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Pickup Method</label>
              <select value={form.pickupMethod} onChange={e => field("pickupMethod", e.target.value)}
                className={`${SELECT_CLS} max-w-xs`}>
                {["Self Pickup","Owner Delivery","Courier"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Images (up to 3)</label>
              <input type="file" accept="image/*" multiple onChange={handleImages} className={INPUT_CLS} />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {imagePreviews.map(p => (
                    <div key={p.name} className="overflow-hidden rounded-xl border border-stone-200">
                      <img src={p.url} alt="" className="h-24 w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex gap-3 pt-5 border-t border-stone-100">
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (isEditing ? "Updating…" : "Saving…") : (isEditing ? "Update Item" : "Save & Publish")}
              </PrimaryBtn>
              <GhostBtn type="button" onClick={goBack}>Cancel</GhostBtn>
            </div>
          </form>
        </Card>

        <Card className="p-6 h-fit">
          <h2 className="font-semibold text-stone-800 mb-4">Listing Tips</h2>
          <div className="space-y-3">
            {[
              ["📸","Great photos = more requests","High quality photos increase enquiries by 70%"],
              ["💬","Detailed description","Include what's in the box, usage tips, and any restrictions"],
              ["💰","Competitive pricing","Browse similar items to set a fair daily rate"],
              ["📍","Accurate pickup info","Renters filter by location — be specific"],
            ].map(([e, t, d]) => (
              <div key={t} className="flex gap-3 p-3 bg-stone-50 rounded-xl">
                <span className="text-base shrink-0">{e}</span>
                <div>
                  <p className="text-xs font-semibold text-stone-700">{t}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
