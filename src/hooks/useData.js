import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchItems, fetchItemsByOwner } from "../api/items"
import { fetchTransactions, fetchTransactionsByOwner, fetchTransactionsByRenter } from "../api/transactions"
import { fetchUsers } from "../api/users"
import { transformItems, transformTransactions, transformUsers } from "../utils/dataTransform"

/**
 * Role-aware data hook — fetches only what each role actually needs.
 *
 *  Renter → items (browse + detail)
 *  Owner  → own items + own transactions
 *  Admin  → all users + all transactions + all items
 *
 * Exposes refetch() so components can trigger a fresh load after
 * mutations (approve, cancel, delete, etc.) without a full page reload.
 */
export function useData() {
  const { token, user, loading: authLoading } = useAuth()

  const [items,        setItems]        = useState([])
  const [transactions, setTransactions] = useState([])
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [tick,         setTick]         = useState(0)   // incremented by refetch()

  /** Call this after any mutation to reload fresh data from the server. */
  const refetch = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (authLoading || !token || !user) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const role = user.role  // "Owner" | "Renter" | "Admin"

        if (role === "Renter") {
          // Renters only need the public item list and their own transactions
          const [itemsData, txData] = await Promise.all([
            fetchItems(token),
            fetchTransactionsByRenter(token),
          ])
          if (cancelled) return
          setItems(transformItems(itemsData || []))
          setTransactions(transformTransactions(txData || []))
          setUsers([])

        } else if (role === "Owner") {
          // Owners need their own items and their own transactions
          const [itemsData, txData] = await Promise.all([
            fetchItemsByOwner(token, user.id),
            fetchTransactionsByOwner(token),
          ])
          if (cancelled) return
          setItems(transformItems(itemsData || []))
          setTransactions(transformTransactions(txData || []))
          setUsers([])

        } else {
          // Admin needs everything
          const [itemsData, txData, usersData] = await Promise.all([
            fetchItems(token),
            fetchTransactions(token),
            fetchUsers(token),
          ])
          if (cancelled) return
          setItems(transformItems(itemsData || []))
          setTransactions(transformTransactions(txData || []))
          setUsers(transformUsers(usersData || []))
        }

      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load data")
          console.error("useData error:", err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }

  }, [token, authLoading, user, tick])

  return { items, transactions, users, loading, error, refetch }
}