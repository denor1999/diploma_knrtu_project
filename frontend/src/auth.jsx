import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createForecast,
  createSubscription,
  deleteSubscription,
  listForecasts,
  listSubscriptions,
  loginRequest,
  patchSubscription,
  registerRequest,
} from './api'

const AuthContext = createContext(null)
const SESSION_KEY = 'vovremya-session'

function readJson(storage, key, fallback) {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function readSession() {
  const fromTab = readJson(sessionStorage, SESSION_KEY, null)
  if (fromTab?.email && fromTab?.token) return fromTab
  const stored = readJson(localStorage, SESSION_KEY, null)
  return stored?.email && stored?.token ? stored : null
}

function saveSession(user, remember) {
  const raw = JSON.stringify(user)
  if (remember) {
    localStorage.setItem(SESSION_KEY, raw)
    sessionStorage.removeItem(SESSION_KEY)
  } else {
    sessionStorage.setItem(SESSION_KEY, raw)
    localStorage.removeItem(SESSION_KEY)
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const [subscriptions, setSubscriptions] = useState([])
  const [history, setHistory] = useState([])

  async function refreshCabinet(nextUser = user) {
    if (!nextUser?.id) {
      setSubscriptions([])
      setHistory([])
      return
    }
    const [nextSubscriptions, nextHistory] = await Promise.all([
      listSubscriptions(),
      listForecasts(),
    ])
    setSubscriptions(nextSubscriptions)
    setHistory(nextHistory)
  }

  useEffect(() => {
    refreshCabinet().catch(() => {
      setSubscriptions([])
      setHistory([])
    })
  }, [user?.id])

  const api = useMemo(() => {
    async function login(email, password, remember = true) {
      try {
        const nextUser = await loginRequest({ email: email.trim(), password })
        saveSession(nextUser, remember)
        setUser(nextUser)
        return ''
      } catch (error) {
        return error.message
      }
    }

    async function register({ name, email, password }) {
      try {
        const nextUser = await registerRequest({
          name: name.trim(),
          email: email.trim(),
          password,
        })
        saveSession(nextUser, true)
        setUser(nextUser)
        return ''
      } catch (error) {
        return error.message
      }
    }

    function logout() {
      clearSession()
      setUser(null)
      setSubscriptions([])
      setHistory([])
    }

    async function toggleSubscription(id) {
      const current = subscriptions.find((item) => item.id === id)
      if (!current) return
      const updated = await patchSubscription(id, { active: !current.active })
      setSubscriptions((items) => items.map((item) => (item.id === id ? updated : item)))
    }

    async function removeSubscription(id) {
      await deleteSubscription(id)
      setSubscriptions((items) => items.filter((item) => item.id !== id))
    }

    async function addSubscription(entry) {
      const subscription = await createSubscription({
        from: entry.from,
        to: entry.to,
        date: entry.date,
        target: entry.target,
      })
      setSubscriptions((items) => [subscription, ...items.filter((item) => item.id !== subscription.id)])
      return subscription
    }

    async function recordSearch(entry) {
      if (!user?.token) return null
      const forecast = await createForecast({
        from: entry.from,
        to: entry.to,
        date: entry.date,
      })
      if (user?.id) {
        await refreshCabinet(user)
      }
      return forecast
    }

    return {
      user,
      login,
      register,
      logout,
      subscriptions,
      history,
      toggleSubscription,
      removeSubscription,
      addSubscription,
      recordSearch,
    }
  }, [user, subscriptions, history])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
