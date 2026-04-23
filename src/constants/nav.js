import {
  LayoutDashboard, Package, Inbox, BarChart2,
  Search, FileText, Users, Activity,
} from "lucide-react"

export const NAV = {
  Owner: [
    { id: "owner-dash",     label: "Dashboard",    icon: LayoutDashboard },
    { id: "owner-items",    label: "My Items",      icon: Package },
    { id: "owner-requests", label: "Requests",      icon: Inbox },
    { id: "owner-report",   label: "Earnings",      icon: BarChart2 },
  ],
  Renter: [
    { id: "renter-browse",   label: "Browse Items",  icon: Search },
    { id: "renter-requests", label: "My Requests",   icon: FileText },
  ],
  Admin: [
    { id: "admin-dash",  label: "Dashboard",     icon: LayoutDashboard },
    { id: "admin-users", label: "Users",          icon: Users },
    { id: "admin-txn",   label: "Transactions",   icon: Activity },
  ],
}

export const INITIAL_PAGE = {
  Owner:  "owner-dash",
  Renter: "renter-browse",
  Admin:  "admin-dash",
}
