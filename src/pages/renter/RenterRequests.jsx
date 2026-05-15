import { useState, useEffect } from "react"
import { Check, CheckCircle, DollarSign } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { fetchTransactionsByRenter, markTransactionPaid, cancelTransaction } from "../../api/transactions"
import { transformTransactions } from "../../utils/dataTransform"
import Header from "../../components/layout/Header"
import { Card } from "../../components/ui/Buttons"
import StatusBadge from "../../components/ui/StatusBadge"
import PaymentModal from "./PaymentModal"

const STEPS = ["Pending", "Approved", "Active", "Completed"]

export default function RenterRequests() {
  const { user, token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [payTarget, setPayTarget]       = useState(null)
  const [payLoading, setPayLoading]     = useState(false)
  const [paidToast, setPaidToast]       = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!token || !user?.id) return
    setLoading(true)
    fetchTransactionsByRenter(token)
      .then(r => setTransactions(transformTransactions(r || [])))
      .catch(err => {
        console.error("RenterRequests fetch error:", err)
        setError(err.message || "Failed to load requests.")
      })
      .finally(() => setLoading(false))
  }, [token, user?.id])

  async function handleConfirmPayment(transactionId, paymentRef) {
    setPayLoading(true)
    try {
      await markTransactionPaid(token, transactionId, paymentRef)
      setTransactions(prev =>
        prev.map(t => t.transactionID === transactionId ? { ...t, paymentStatus: "Paid" } : t)
      )
      setPayTarget(null)
      setPaidToast(true)
      setTimeout(() => setPaidToast(false), 3500)
    } catch (err) {
      console.error(err)
      setError("Payment failed. Please try again.")
    } finally {
      setPayLoading(false)
    }
  }

  async function handleCancel(transactionId) {
    setCancellingId(transactionId)
    try {
      await cancelTransaction(token, transactionId)
      setTransactions(prev =>
        prev.map(t => t.transactionID === transactionId ? { ...t, transactionStatus: "Cancelled" } : t)
      )
    } catch (err) {
      setError("Failed to cancel request. Please try again.")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <Header title="My Requests" subtitle="Track all your rental and borrow requests" />

      {/* Success toast */}
      {paidToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">Payment confirmed! Owner has been notified.</span>
        </div>
      )}

      {payTarget && (
        <PaymentModal
          transaction={payTarget}
          onClose={() => setPayTarget(null)}
          onConfirm={handleConfirmPayment}
          loading={payLoading}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      {transactions.length === 0 && !error && (
        <div className="text-center py-20">
          <span className="text-5xl block mb-3">📋</span>
          <p className="font-medium text-stone-600">No requests yet</p>
          <p className="text-stone-400 text-sm mt-1">Browse items and submit your first request</p>
        </div>
      )}

      <div className="space-y-4">
        {transactions.map(t => {
          const stepIdx     = STEPS.indexOf(t.transactionStatus)
          const showPayBtn  = (t.transactionStatus === "Approved" || t.transactionStatus === "Active") && t.paymentStatus !== "Paid"
          const alreadyPaid = t.paymentStatus === "Paid" && t.transactionStatus !== "Cancelled"

          return (
            <Card key={t.transactionID} className="p-5">
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-stone-900">{t.itemName}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Owner: {t.ownerName}</p>
                </div>
                <StatusBadge status={t.transactionStatus} />
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-3 gap-4 text-sm mb-5">
                <div>
                  <p className="text-xs text-stone-400">Dates</p>
                  <p className="font-medium text-stone-700 text-xs mt-0.5">{t.startDate} – {t.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Total</p>
                  <p className="font-semibold text-orange-600">RM {t.totalAmount}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Payment</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-0.5 inline-block ${
                    t.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
                  }`}>
                    {t.paymentStatus === "Paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Progress stepper */}
              {t.transactionStatus !== "Cancelled" && (
                <div className="mb-4">
                  <div className="flex items-center">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i <= stepIdx ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-400"
                        }`}>
                          {i < stepIdx ? <Check className="w-3 h-3" /> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? "bg-orange-400" : "bg-stone-100"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {STEPS.map(s => <span key={s} className="text-xs text-stone-400 flex-1 first:text-left last:text-right text-center">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Cancelled */}
              {t.transactionStatus === "Cancelled" && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-3">
                  This request was cancelled.
                  {t.ownerNote && <span className="block text-xs mt-0.5">Reason: {t.ownerNote}</span>}
                </p>
              )}

              {/* Cancel button — only while Pending */}
              {t.transactionStatus === "Pending" && (
                <div className="border-t border-stone-100 pt-3 mt-1">
                  <button
                    onClick={() => handleCancel(t.transactionID)}
                    disabled={cancellingId === t.transactionID}
                    className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {cancellingId === t.transactionID ? "Cancelling…" : "Cancel Request"}
                  </button>
                </div>
              )}

              {/* Pay Now */}
              {showPayBtn && (
                <div className="border-t border-stone-100 pt-4 mt-1 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-stone-700">Payment due</p>
                    <p className="text-xs text-stone-400">Deposit: RM {t.depositAmount ?? "—"} · Total: RM {t.totalAmount}</p>
                  </div>
                  <button
                    onClick={() => setPayTarget(t)}
                    className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <DollarSign className="w-3.5 h-3.5" />Pay Now
                  </button>
                </div>
              )}

              {/* Already paid */}
              {alreadyPaid && (
                <div className="border-t border-stone-100 pt-3 mt-1 flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">
                    Payment confirmed{t.paymentDate && <span className="text-stone-400 font-normal"> · {t.paymentDate}</span>}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
