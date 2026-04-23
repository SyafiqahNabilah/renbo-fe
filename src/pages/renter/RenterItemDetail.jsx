import { useState } from "react"
import { Star, MapPin, ArrowLeft } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { requestRent } from "../../api/transactions"
import { getItemImageSrc } from "../../components/ui/helpers"
import { todayString, tomorrowString } from "../../components/ui/helpers"
import { Card, GhostBtn, PrimaryBtn } from "../../components/ui/Buttons"
import Avatar from "../../components/ui/Avatar"

export default function RenterItemDetail({ item, setPage }) {
  const { token } = useAuth()
  // FIX: default to today + tomorrow, never past dates
  const [from, setFrom]     = useState(todayString())
  const [to, setTo]         = useState(tomorrowString())
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const [success, setSuccess] = useState(false)

  if (!item) return <div className="text-center py-20 text-stone-400">No item selected.</div>

  const imageSrc  = getItemImageSrc(item)
  const available = item.available ?? item.avail ?? true

  const days = Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86_400_000))
  const rentalTotal = item.price * days
  const grandTotal  = rentalTotal + (item.deposit || 0)

  async function handleRequest() {
    if (new Date(to) <= new Date(from)) {
      setError("End date must be after start date.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await requestRent(token, {
        itemId:          item.id,
        startDate:       from,
        endDate:         to,
        transactionType: "RENT",
        renterNote:      `Request to rent for ${days} day${days > 1 ? "s" : ""}`,
        // totalAmount is NOT sent — backend calculates it from item rate × days
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || "Failed to send rental request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <GhostBtn onClick={() => setPage("renter-browse")} className="mb-5">
        <ArrowLeft className="w-4 h-4 mr-1.5 inline" />Back to Browse
      </GhostBtn>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="overflow-hidden">
            <div className="h-64 bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center">
              {imageSrc
                ? <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
                : <span className="text-8xl">{item.emoji || "📦"}</span>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">{item.category}</span>
                <h1 className="text-2xl font-bold text-stone-900 mt-1">{item.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {item.rating != null && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">{item.rating}</span>
                      <span className="text-stone-400 text-sm">({item.reviews} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-stone-500 text-sm">
                    <MapPin className="w-3.5 h-3.5" />{item.location}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${available ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                {available ? "Available" : "Unavailable"}
              </span>
            </div>

            <p className="text-stone-600 leading-relaxed">{item.description}</p>

            {(item.condition || item.deposit > 0) && (
              <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-stone-100">
                {[["Condition", item.condition], ["Deposit", `RM ${item.deposit}`]].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs text-stone-400 mb-0.5">{l}</p>
                    <p className="font-semibold text-stone-800">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {item.ownerName && (
            <Card className="p-5">
              <h2 className="font-semibold text-stone-800 mb-3">About the Owner</h2>
              <div className="flex items-center gap-3">
                <Avatar initials={item.ownerAvatar} size="lg" />
                <div>
                  <p className="font-semibold text-stone-800">{item.ownerName}</p>
                  {item.rating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-stone-600">Verified Owner</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Booking card */}
        <div>
          <Card className="p-5 sticky top-6">
            {success ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-semibold text-stone-900 mb-1">Request sent!</h3>
                <p className="text-sm text-stone-500 mb-4">The owner will respond within 24 hours.</p>
                <GhostBtn onClick={() => setPage("renter-requests")} className="w-full justify-center">View My Requests</GhostBtn>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-stone-900">RM {item.price}</span>
                  <span className="text-stone-400 text-sm"> / day</span>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">From</label>
                    <input
                      type="date"
                      value={from}
                      min={todayString()}           // FIX: block past dates
                      onChange={e => setFrom(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1.5">To</label>
                    <input
                      type="date"
                      value={to}
                      min={from || todayString()}   // FIX: end date cannot be before start
                      onChange={e => setTo(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 py-4 border-t border-stone-100 mb-4 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>RM {item.price} × {days} day{days !== 1 ? "s" : ""}</span>
                    <span>RM {rentalTotal}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Deposit (refundable)</span>
                    <span>RM {item.deposit || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total Amount</span>
                    <span>RM {grandTotal}</span>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

                <PrimaryBtn onClick={handleRequest} disabled={loading || !available} className="w-full text-center justify-center">
                  {loading ? "Sending request…" : "Request to Rent"}
                </PrimaryBtn>
                <p className="text-xs text-stone-400 text-center mt-3">You won't be charged until the owner approves</p>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
