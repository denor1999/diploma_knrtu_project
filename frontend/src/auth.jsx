import { createContext, useContext, useMemo, useState } from 'react'
import { seedHistory, seedSubscriptions } from './data'

const AuthContext = createContext(null)
const SESSION_KEY = 'vovremya-session'
const DATA_KEY = 'vovremya-data'

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
  if (fromTab?.email) return fromTab
  const stored = readJson(localStorage, SESSION_KEY, null)
  return stored?.email ? stored : null
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

function seedData() {
  const stored = readJson(localStorage, DATA_KEY, null)
  if (stored?.subscriptions && stored?.history) return stored
  const data = {
    subscriptions: seedSubscriptions,
    history: seedHistory,
  }
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  return data
}

async function postAuth(path, body) {
  let response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    return { error: 'Не удалось связаться с сервером. Запустите бэкенд на порту 8080.' }
  }
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { error: payload.detail || 'Не получилось выполнить запрос.' }
  }
  return { user: payload }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)
  const [data, setData] = useState(seedData)

  function persistData(next) {
    setData(next)
    localStorage.setItem(DATA_KEY, JSON.stringify(next))
  }

  const api = useMemo(() => {
    async function login(email, password, remember = true) {
      const result = await postAuth('/api/auth/login', {
        email: email.trim(),
        password,
      })
      if (result.error) return result.error
      saveSession(result.user, remember)
      setUser(result.user)
      return ''
    }

    async function register({ name, email, password }) {
      const result = await postAuth('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      })
      if (result.error) return result.error
      saveSession(result.user, true)
      setUser(result.user)
      return ''
    }

    function logout() {
      clearSession()
      setUser(null)
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
  }, [user, data])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
