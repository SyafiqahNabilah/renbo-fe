import { useState } from "react"
import { X, CheckCircle, AlertCircle, Check } from "lucide-react"

const PAYMENT_METHODS = [
  { id: "tng",     label: "Touch 'n Go eWallet", emoji: "💚", disabled: true  },
  { id: "maybank", label: "Maybank2U / MAE",       emoji: "🟡", disabled: true  },
  { id: "fpx",     label: "FPX Online Banking",   emoji: "🏦", disabled: true  },
  { id: "cash",    label: "Cash on Pickup",        emoji: "💵", disabled: false },
]

/**
 * FIX: onConfirm now receives (transactionId, paymentRef) instead of just the ID.
 * The caller (RenterRequests) must pass both to markTransactionPaid.
 */
export default function PaymentModal({ transaction, onClose, onConfirm, loading }) {
  const [selected,   setSelected]   = useState("cash")
  const [paymentRef, setPaymentRef] = useState("")

  if (!transaction) return null

  const rentalTotal   = Number(transaction.totalAmount   ?? 0)
  const depositAmount = Number(transaction.depositAmount ?? 0)
  const grandTotal    = (rentalTotal + depositAmount).toFixed(2)

  const breakdown = [
    [`Rental (${transaction.totalDays ?? "—"} days)`, `RM ${rentalTotal.toFixed(2)}`],
    ["Deposit (refundable)",  `RM ${depositAmount.toFixed(2)}`],
    ["Total Payable",         `RM ${grandTotal}`],
  ]

  function handleConfirm() {
    // For cash: use entered ref or fall back to a readable default
    const ref = paymentRef.trim() || `CASH-${new Date().toISOString().slice(0, 10)}`
    onConfirm(transaction.transactionID, ref)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-bold text-stone-900 text-lg">Complete Payment</h2>
            <p className="text-xs text-stone-400 mt-0.5">{transaction.transactionID}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Item summary */}
          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-0.5">Renting from {transaction.ownerName}</p>
            <p className="font-semibold text-stone-900">{transaction.itemName}</p>
            <p className="text-xs text-stone-500 mt-1">{transaction.startDate} → {transaction.endDate}</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-2">
            {breakdown.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-stone-500">{label}</span>
                <span className={`font-semibold ${label === "Total Payable" ? "text-orange-600 text-base" : "text-stone-700"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100" />

          {/* Payment method */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => !m.disabled && setSelected(m.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    m.disabled
                      ? "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                      : selected === m.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${selected === m.id && !m.disabled ? "text-orange-700" : "text-stone-700"}`}>
                      {m.label}
                    </p>
                    {m.disabled && <p className="text-xs text-stone-400">Coming soon</p>}
                  </div>
                  {selected === m.id && !m.disabled && <CheckCircle className="w-4 h-4 text-orange-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── FIX: Payment reference input ───────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Payment Reference <span className="text-stone-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              value={paymentRef}
              onChange={e => setPaymentRef(e.target.value)}
              placeholder="e.g. receipt no., transfer ref, or leave blank for cash"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            <p className="text-xs text-stone-400 mt-1">
              This reference is saved so both parties can verify the payment.
            </p>
          </div>

          {/* Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Online gateway coming soon. Pay cash on pickup then confirm here to notify the owner.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
              : <><Check className="w-4 h-4" />Confirm Payment — RM {grandTotal}</>}
          </button>

          <p className="text-xs text-stone-400 text-center -mt-1">
            This records your payment intent. Owner will verify on pickup.
          </p>
        </div>
      </div>
    </div>
  )
}
