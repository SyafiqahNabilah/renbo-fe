import { useState, useEffect } from "react"
import { Check, X, Play, CheckCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { fetchTransactionsByOwner, approveRequest, rejectRequest, activateTransaction, completeTransaction } from "../../api/transactions"
import { transformTransactions } from "../../utils/dataTransform"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import StatusBadge from "../../components/ui/StatusBadge"
import Avatar from "../../components/ui/Avatar"

export default function OwnerRequests() {
  const { user, token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [actionId, setActionId]         = useState(null)
  const [rejectModal, setRejectModal]   = useState(null) // { id } for reject note dialog
  const [rejectNote, setRejectNote]     = useState("")

  useEffect(() => {
    if (!token || !user?.id) return
    setLoading(true)
    fetchTransactionsByOwner(token)
      .then(r => setTransactions(transformTransactions(r || [])))
      .catch(err => {
        console.error("OwnerRequests fetch error:", err)
        setError(err.message || "Failed to load requests.")
      })
      .finally(() => setLoading(false))
  }, [token, user?.id])

  async function handleApprove(id) {
    setActionId(id)
    try {
      await approveRequest(token, id)
      setTransactions(prev => prev.map(t => t.transactionID === id ? { ...t, transactionStatus: "Approved" } : t))
    } catch (err) {
      setError(err.message || "Failed to approve.")
    } finally { setActionId(null) }
  }

  async function handleReject(id, note) {
    setActionId(id)
    try {
      await rejectRequest(token, id, note)
      setTransactions(prev => prev.map(t => t.transactionID === id ? { ...t, transactionStatus: "Cancelled", ownerNote: note } : t))
    } catch (err) {
      setError(err.message || "Failed to reject.")
    } finally {
      setActionId(null)
      setRejectModal(null)
      setRejectNote("")
    }
  }

  async function handleActivate(id) {
    setActionId(id)
    try {
      await activateTransaction(token, id)
      setTransactions(prev => prev.map(t => t.transactionID === id ? { ...t, transactionStatus: "Active" } : t))
    } catch (err) {
      setError(err.message || "Failed to activate.")
    } finally { setActionId(null) }
  }

  async function handleComplete(id) {
    setActionId(id)
    try {
      await completeTransaction(token, id)
      setTransactions(prev => prev.map(t => t.transactionID === id ? { ...t, transactionStatus: "Completed" } : t))
    } catch (err) {
      setError(err.message || "Failed to complete.")
    } finally { setActionId(null) }
  }

  if (loading) return <div className="p-6 text-center text-stone-500">Loading requests…</div>

  if (!transactions.length) return (
    <div>
      <Header title="Rental Requests" subtitle="Manage incoming requests for your items" />
      <div className="text-center py-20">
        <span className="text-5xl block mb-3">📬</span>
        <p className="font-medium text-stone-600">No requests yet</p>
        <p className="text-stone-400 text-sm mt-1">Requests appear here when renters enquire about your items</p>
      </div>
    </div>
  )

  return (
    <div>
      <Header title="Rental Requests" subtitle="Manage incoming requests for your items" />

      {/* Reject note modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-stone-900 mb-2">Reject this request?</h3>
            <p className="text-sm text-stone-500 mb-3">Optionally leave a note for the renter.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={3}
              placeholder="e.g. Item is unavailable for those dates"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => handleReject(rejectModal.id, rejectNote)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl text-sm transition-all">
                Confirm Reject
              </button>
              <button onClick={() => { setRejectModal(null); setRejectNote("") }} className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium rounded-xl py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {["ID", "Item", "Renter", "Dates", "Rate/day", "Days", "Total", "Type", "Payment", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.transactionID} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-stone-500">{t.transactionID}</td>
                  <td className="px-4 py-4 font-medium text-stone-800 whitespace-nowrap">{t.itemName}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.renterAvatar} size="sm" />
                      <span className="text-stone-700 whitespace-nowrap text-xs">{t.renterName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-stone-500 whitespace-nowrap text-xs">{t.startDate} → {t.endDate}</td>
                  <td className="px-4 py-4 text-stone-700 text-xs">RM {t.dailyRate}</td>
                  <td className="px-4 py-4 text-stone-700 text-xs">{t.totalDays}</td>
                  <td className="px-4 py-4 font-semibold text-stone-800 text-xs">RM {t.totalAmount}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.type === "Rent" ? "bg-purple-50 text-purple-700" : "bg-sky-50 text-sky-700"}`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      t.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700"
                      : t.paymentStatus === "Deposit Returned" ? "bg-blue-50 text-blue-700"
                      : "bg-stone-100 text-stone-500"
                    }`}>{t.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={t.transactionStatus} /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1.5">
                      {/* Pending → Approve / Reject */}
                      {t.transactionStatus === "Pending" && (<>
                        <button onClick={() => handleApprove(t.transactionID)} disabled={actionId === t.transactionID} title="Approve"
                          className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 p-1.5 rounded-lg transition-colors">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setRejectModal({ id: t.transactionID })} disabled={actionId === t.transactionID} title="Reject"
                          className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-500 p-1.5 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>)}
                      {/* Approved → Activate (item handed over) */}
                      {t.transactionStatus === "Approved" && (
                        <button onClick={() => handleActivate(t.transactionID)} disabled={actionId === t.transactionID} title="Mark as Active (item handed over)"
                          className="bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 p-1.5 rounded-lg transition-colors">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Active → Complete (item returned) */}
                      {t.transactionStatus === "Active" && (
                        <button onClick={() => handleComplete(t.transactionID)} disabled={actionId === t.transactionID} title="Mark as Completed (item returned)"
                          className="bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-600 p-1.5 rounded-lg transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!["Pending", "Approved", "Active"].includes(t.transactionStatus) && (
                        <span className="text-xs text-stone-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
