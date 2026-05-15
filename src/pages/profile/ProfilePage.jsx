import { useState } from "react"
import { User, Mail, Phone, MapPin, CreditCard, Save, CheckCircle, Shield } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../context/ToastContext"
import { updateProfile } from "../../api/users"
import { Card, PrimaryBtn, GhostBtn } from "../../components/ui/Buttons"
import Header from "../../components/layout/Header"

const INPUT_CLS =
  "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm " +
  "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 " +
  "disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed"

const ROLE_COLORS = {
  Owner:  "bg-purple-50 text-purple-700 border-purple-100",
  Renter: "bg-sky-50 text-sky-700 border-sky-100",
  Admin:  "bg-orange-50 text-orange-700 border-orange-100",
}

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth()
  const { toast } = useToast()

  // Split stored full name into first / last
  const nameParts  = (user?.name || "").trim().split(" ")
  const storedFirst = nameParts[0] || ""
  const storedLast  = nameParts.slice(1).join(" ") || ""

  const [firstName, setFirstName] = useState(storedFirst)
  const [lastName,  setLastName]  = useState(storedLast)
  const [phoneNo,   setPhoneNo]   = useState(user?.phoneNo || "")
  const [address,   setAddress]   = useState(user?.address || "")
  const [noAccount, setNoAccount] = useState(user?.noAccount || "")

  const [saving,   setSaving]   = useState(false)

  const isDirty =
    firstName !== storedFirst ||
    lastName  !== storedLast  ||
    phoneNo   !== ""          ||
    address   !== ""          ||
    noAccount !== ""

  async function handleSave() {
    if (!firstName.trim()) { toast.error("First name is required."); return }
    setSaving(true)

    // Only send non-empty fields (patch semantics — backend ignores null)
    const payload = {}
    if (firstName.trim())  payload.firstName = firstName.trim()
    if (lastName.trim())   payload.lastName  = lastName.trim()
    if (phoneNo.trim())    payload.phoneNo   = phoneNo.trim()
    if (address.trim())    payload.address   = address.trim()
    if (noAccount.trim())  payload.noAccount = noAccount.trim()

    try {
      const updated = await updateProfile(token, user.id, payload)
      // Refresh name in AuthContext so sidebar + header reflect the change immediately
      if (updated?.fullName) updateUser({ name: updated.fullName })
      // Sync form with returned data
      setFirstName(updated.firstName || "")
      setLastName(updated.lastName || "")
      setPhoneNo(updated.phoneNo || "")
      setAddress(updated.address || "")
      setNoAccount(updated.noAccount || "")
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(err.message || "Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    setFirstName(storedFirst)
    setLastName(storedLast)
    setPhoneNo("")
    setAddress("")
    setNoAccount("")
  }

  return (
    <div>
      <Header
        title="Account Settings"
        subtitle="Manage your profile information"
      />

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: identity card ──────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="p-6 text-center">
            {/* Avatar */}
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">
                {(firstName[0] || "?").toUpperCase()}
                {(lastName[0]  || "").toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-stone-900 text-lg">
              {[firstName, lastName].filter(Boolean).join(" ") || "Your Name"}
            </p>
            <p className="text-stone-500 text-sm mt-0.5">{user?.email}</p>

            {/* Role badge */}
            <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[user?.role] || ""}`}>
              <Shield className="w-3 h-3" />
              {user?.role} Account
            </span>
          </Card>

          {/* Read-only info */}
          <Card className="p-5">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Account Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">Email</p>
                  <p className="text-stone-700 font-medium truncate">{user?.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Shield className="w-4 h-4 text-stone-400 shrink-0" />
                <div>
                  <p className="text-xs text-stone-400">Role</p>
                  <p className="text-stone-700 font-medium">{user?.role || "—"}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-4 pt-3 border-t border-stone-100">
              Email and role cannot be changed here.
            </p>
          </Card>
        </div>

        {/* ── Right: edit form ─────────────────────────────────────────── */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-semibold text-stone-800 mb-5">Edit Profile</h2>

          <div className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Ahmad"
                    className={`${INPUT_CLS} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Last name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Razali"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  value={phoneNo}
                  onChange={e => setPhoneNo(e.target.value)}
                  placeholder="e.g. 0123456789"
                  className={`${INPUT_CLS} pl-10`}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                  placeholder="No. 12, Jalan Bukit Bintang, 55100 KL"
                  className={`${INPUT_CLS} pl-10 resize-none`}
                />
              </div>
            </div>

            {/* Bank account */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Bank account number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  value={noAccount}
                  onChange={e => setNoAccount(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className={`${INPUT_CLS} pl-10`}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Used by owners to receive payments</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
              <PrimaryBtn onClick={handleSave} disabled={saving || !isDirty}>
                {saving
                  ? <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving…</>
                  : <><Save className="w-4 h-4 mr-1.5 inline" />Save Changes</>}
              </PrimaryBtn>
              {isDirty && (
                <GhostBtn onClick={handleReset} disabled={saving}>
                  Discard
                </GhostBtn>
              )}
              {!isDirty && !saving && (
                <p className="text-xs text-stone-400">No changes to save</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
