import { useState, useEffect, useMemo } from "react"
import { Check, X, Play, CheckCircle, RefreshCw } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import {
  fetchTransactionsByOwner,
  approveRequest,
  rejectRequest,
  activateTransaction,
  completeTransaction,
} from "../../api/transactions"
import { transformTransactions } from "../../utils/dataTransform"
import { Card } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"
import StatusBadge from "../../components/ui/StatusBadge"
import Avatar from "../../components/ui/Avatar"

const STATUS_TABS = [
  { id: "All",       label: "All",       color: "text-stone-600"  },
  { id: "Pending",   label: "Pending",   color: "text-amber-600"  },
  { id: "Approved",  label: "Approved",  color: "text-blue-600"   },
  { id: "Active",    label: "Active",    color: "text-purple-600" },
  { id: "Completed", label: "Completed", color: "text-emerald-600"},
  { id: "Cancelled", label: "Cancelled", color: "text-stone-400"  },
]

const TAB_ACTIVE   = "bg-white shadow-sm text-stone-900 font-semibold"
const TAB_INACTIVE = "text-stone-500 hover:text-stone-700"

export default function OwnerRequests() {
  const { user, token }  = useAuth()
  const toast            = useToast()

  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [refreshing,   setRefreshing]   = useState(false)
  const [activeTab,    setActiveTab]    = useState("All")
  const [actionId,     setActionId]     = useState(null)
  const [rejectModal,  setRejectModal]  = useState(null)
  const [rejectNote,   setRejectNote]   = useState("")

  async function load(showRefreshing = false) {
    if (!token || !user?.id) return
    showRefreshing ? setRefreshing(true) : setLoading(true)
    try {
      const raw = await fetchTransactionsByOwner(token)
      setTransactions(transformTransactions(raw || []))
    } catch (err) {
      toast.error(err.message || "Failed to load requests.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [token, user?.id]) // eslint-disable-line

  // ── Counts per tab ───────────────────────────────────────────────────────
  const counts = useMemo(() =>
          STATUS_TABS.reduce((acc, tab) => {
            acc[tab.id] = tab.id === "All"
                ? transactions.length
                : transactions.filter(t => t.transactionStatus === tab.id).length
            return acc
          }, {}),
      [transactions])

  const filtered = useMemo(() =>
          activeTab === "All"
              ? transactions
              : transactions.filter(t => t.transactionStatus === activeTab),
      [transactions, activeTab])

  // ── Actions ──────────────────────────────────────────────────────────────
  function optimisticUpdate(id, patch) {
    setTransactions(prev => prev.map(t => t.transactionID === id ? { ...t, ...patch } : t))
  }

  async function handleApprove(id) {
    setActionId(id)
    try {
      await approveRequest(token, id)
      optimisticUpdate(id, { transactionStatus: "Approved" })
      toast.success("Request approved — item is confirmed for the renter.")
    } catch (err) {
      toast.error(err.message || "Failed to approve request.")
    } finally { setActionId(null) }
  }

  async function handleReject(id, note) {
    setActionId(id)
    try {
      await rejectRequest(token, id, note)
      optimisticUpdate(id, { transactionStatus: "Cancelled", ownerNote: note })
      toast.success("Request rejected.")
    } catch (err) {
      toast.error(err.message || "Failed to reject request.")
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
      optimisticUpdate(id, { transactionStatus: "Active" })
      toast.success("Rental activated — item is now with the renter.")
    } catch (err) {
      toast.error(err.message || "Failed to activate rental.")
    } finally { setActionId(null) }
  }

  async function handleComplete(id) {
    setActionId(id)
    try {
      await completeTransaction(token, id)
      optimisticUpdate(id, { transactionStatus: "Completed" })
      toast.success("Rental completed — item marked as returned.")
    } catch (err) {
      toast.error(err.message || "Failed to complete rental.")
    } finally { setActionId(null) }
  }

  if (loading) {
    return (
        <div>
          <Header title="Rental Requests" subtitle="Manage incoming requests for your items" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-white rounded-2xl border border-stone-100 animate-pulse" />
            ))}
          </div>
        </div>
    )
  }

  return (
      <div>
        <Header
            title="Rental Requests"
            subtitle="Manage incoming requests for your items"
            action={
              <button
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            }
        />

        {/* ── Status filter tabs ──────────────────────────────────────────── */}
        <div className="bg-stone-100 rounded-2xl p-1 flex gap-1 mb-5 overflow-x-auto">
          {STATUS_TABS.map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                      activeTab === tab.id ? TAB_ACTIVE : TAB_INACTIVE
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`font-semibold tabular-nums ${
                    activeTab === tab.id ? "text-stone-700" : "text-stone-400"
                }`}>
              {counts[tab.id] ?? 0}
            </span>
              </button>
          ))}
        </div>

        {/* ── Reject modal ────────────────────────────────────────────────── */}
        {rejectModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.45)" }}
                onClick={() => setRejectModal(null)}
            >
              <div
                  className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                  onClick={e => e.stopPropagation()}
              >
                <h3 className="font-semibold text-stone-900 mb-1">Reject this request?</h3>
                <p className="text-sm text-stone-500 mb-4">Leave a note to let the renter know why.</p>
                <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. Item is unavailable for those dates…"
                    autoFocus
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                      onClick={() => handleReject(rejectModal.id, rejectNote)}
                      disabled={actionId === rejectModal.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                  >
                    {actionId === rejectModal.id ? "Rejecting…" : "Confirm Reject"}
                  </button>
                  <button
                      onClick={() => { setRejectModal(null); setRejectNote("") }}
                      className="flex-1 border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium rounded-xl py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
            <div className="text-center py-20">
          <span className="text-5xl block mb-3">
            {activeTab === "All" ? "📬" : activeTab === "Pending" ? "✅" : "🗂️"}
          </span>
              <p className="font-medium text-stone-600">
                {activeTab === "All"
                    ? "No requests yet"
                    : `No ${activeTab.toLowerCase()} requests`}
              </p>
              <p className="text-stone-400 text-sm mt-1">
                {activeTab === "All"
                    ? "Requests appear here when renters enquire about your items"
                    : `Requests with ${activeTab.toLowerCase()} status will appear here`}
              </p>
            </div>
        ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="border-b border-stone-100">
                    {["Item", "Renter", "Dates", "Days", "Total", "Payment", "Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-stone-500 whitespace-nowrap">
                          {h}
                        </th>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                  {filtered.map(t => (
                      <tr key={t.transactionID} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-stone-800 whitespace-nowrap">{t.itemName}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{t.type}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar initials={t.renterAvatar || "??"} size="sm" />
                            <span className="text-stone-700 whitespace-nowrap text-xs">{t.renterName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-stone-500 whitespace-nowrap text-xs">
                          {t.startDate}<br /><span className="text-stone-400">→ {t.endDate}</span>
                        </td>
                        <td className="px-4 py-4 text-stone-600 text-xs text-center">
                          {t.totalDays}d
                        </td>
                        <td className="px-4 py-4 font-semibold text-stone-800 text-xs whitespace-nowrap">
                          RM {t.totalAmount}
                        </td>
                        <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                          t.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-stone-100 text-stone-500"
                      }`}>
                        {t.paymentStatus}
                      </span>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={t.transactionStatus} />
                        </td>

                        {/* ── Action buttons with labels ── */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1.5 min-w-[120px]">

                            {t.transactionStatus === "Pending" && (
                                <>
                                  <button
                                      onClick={() => handleApprove(t.transactionID)}
                                      disabled={actionId === t.transactionID}
                                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
                                  >
                                    <Check className="w-3.5 h-3.5 shrink-0" />
                                    {actionId === t.transactionID ? "Approving…" : "Approve"}
                                  </button>
                                  <button
                                      onClick={() => setRejectModal({ id: t.transactionID })}
                                      disabled={actionId === t.transactionID}
                                      className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
                                  >
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                    Reject
                                  </button>
                                </>
                            )}

                            {t.transactionStatus === "Approved" && (
                                <button
                                    onClick={() => handleActivate(t.transactionID)}
                                    disabled={actionId === t.transactionID}
                                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
                                >
                                  <Play className="w-3.5 h-3.5 shrink-0" />
                                  {actionId === t.transactionID ? "Activating…" : "Hand Over"}
                                </button>
                            )}

                            {t.transactionStatus === "Active" && (
                                <button
                                    onClick={() => handleComplete(t.transactionID)}
                                    disabled={actionId === t.transactionID}
                                    className="flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  {actionId === t.transactionID ? "Completing…" : "Mark Returned"}
                                </button>
                            )}

                            {!["Pending", "Approved", "Active"].includes(t.transactionStatus) && (
                                <span className="text-xs text-stone-300 px-3">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              <div className="px-5 py-3 border-t border-stone-100 text-xs text-stone-400">
                Showing {filtered.length} of {transactions.length} request{transactions.length !== 1 ? "s" : ""}
              </div>
            </Card>
        )}
      </div>
  )
}