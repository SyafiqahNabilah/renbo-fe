import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { fetchItems } from "../api/items"
import { fetchTransactions } from "../api/transactions"
import { fetchUsers } from "../api/users"
import { transformItems, transformTransactions, transformUsers } from "../utils/dataTransform"

export function useData() {
  const { token, loading: authLoading } = useAuth()
  const [items, setItems]               = useState([])
  const [transactions, setTransactions] = useState([])
  const [users, setUsers]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (authLoading || !token) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [itemsData, transactionsData, usersData] = await Promise.all([
          fetchItems(token),
          fetchTransactions(token),
          fetchUsers(token),
        ])
        if (cancelled) return
        setItems(transformItems(itemsData || []))
        setTransactions(transformTransactions(transactionsData || []))
        setUsers(transformUsers(usersData || []))
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          console.error("useData load error:", err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [token, authLoading])

  return { items, transactions, users, loading, error }
}
