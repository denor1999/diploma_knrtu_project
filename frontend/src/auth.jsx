import { createContext, useContext, useMemo, useState } from 'react'
import { DEMO_USER, seedHistory, seedSubscriptions } from './data'

const AuthContext = createContext(null)
const USERS_KEY = 'vovremya-users'
const SESSION_KEY = 'vovremya-session'
const DATA_KEY = 'vovremya-data'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function seedUsers() {
  const users = readJson(USERS_KEY, [])
  if (!users.some((user) => user.email === DEMO_USER.email)) {
    users.push(DEMO_USER)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
  return users
}

function seedData() {
  const stored = readJson(DATA_KEY, null)
  if (stored?.subscriptions && stored?.history) return stored
  const data = {
    subscriptions: seedSubscriptions,
    history: seedHistory,
  }
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  return data
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(seedUsers)
  const [sessionEmail, setSessionEmail] = useState(() => localStorage.getItem(SESSION_KEY))
  const [data, setData] = useState(seedData)

  const user = users.find((item) => item.email === sessionEmail) ?? null

  function persistUsers(next) {
    setUsers(next)
    localStorage.setItem(USERS_KEY, JSON.stringify(next))
  }

  function persistData(next) {
    setData(next)
    localStorage.setItem(DATA_KEY, JSON.stringify(next))
  }

  const api = useMemo(() => {
    function login(email, password) {
      const found = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase())
      if (!found || found.password !== password) {
        return 'Неверная почта или пароль.'
      }
      localStorage.setItem(SESSION_KEY, found.email)
      setSessionEmail(found.email)
      return ''
    }

    function register({ name, email, password }) {
      const normalized = email.trim().toLowerCase()
      if (users.some((item) => item.email.toLowerCase() === normalized)) {
        return 'Аккаунт с такой почтой уже есть. Войдите.'
      }
      const nextUser = { name: name.trim(), email: normalized, password }
      persistUsers([...users, nextUser])
      localStorage.setItem(SESSION_KEY, normalized)
      setSessionEmail(normalized)
      return ''
    }

    function logout() {
      localStorage.removeItem(SESSION_KEY)
      setSessionEmail(null)
    }

    function subscriptionsFor(email) {
      if (!email) return []
      return data.subscriptions.filter((item) => item.email === email)
    }

    function toggleSubscription(id) {
      persistData({
        ...data,
        subscriptions: data.subscriptions.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      })
    }

    function removeSubscription(id) {
      persistData({
        ...data,
        subscriptions: data.subscriptions.filter((item) => item.id !== id),
      })
    }

    function addSubscription(entry) {
      const subscription = { ...entry, id: `sub-${Date.now()}` }
      persistData({ ...data, subscriptions: [subscription, ...data.subscriptions] })
      return subscription
    }

    function recordSearch(entry) {
      const item = { ...entry, id: `h-${Date.now()}` }
      persistData({ ...data, history: [item, ...data.history].slice(0, 8) })
    }

    return {
      user,
      login,
      register,
      logout,
      subscriptions: subscriptionsFor(user?.email),
      history: data.history,
      toggleSubscription,
      removeSubscription,
      addSubscription,
      recordSearch,
    }
  }, [user, users, data])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
