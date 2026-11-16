async function request(path, options = {}) {
  const { body, ...rest } = options
  let response
  try {
    response = await fetch(path, {
      ...rest,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...rest.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Не удалось связаться с сервером.')
  }
  if (response.status === 204) return null
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.detail || 'Не получилось выполнить запрос.')
  }
  return payload
}

export function loginRequest(body) {
  return request('/api/auth/login', { method: 'POST', body })
}

export function registerRequest(body) {
  return request('/api/auth/register', { method: 'POST', body })
}

export function listRoutes() {
  return request('/api/routes')
}

export function quoteForecast(from, to, date) {
  const params = new URLSearchParams({ from, to, date })
  return request(`/api/forecasts/quote?${params}`)
}

export function createForecast({ from, to, date, userId }) {
  return request('/api/forecasts', { method: 'POST', body: { from, to, date, userId } })
}

export function listForecasts(userId) {
  return request(`/api/forecasts?userId=${userId}`)
}

export function listSubscriptions(userId) {
  return request(`/api/subscriptions?userId=${userId}`)
}

export function createSubscription(body) {
  return request('/api/subscriptions', { method: 'POST', body })
}

export function patchSubscription(id, body) {
  return request(`/api/subscriptions/${id}`, { method: 'PATCH', body })
}

export function deleteSubscription(id) {
  return request(`/api/subscriptions/${id}`, { method: 'DELETE' })
}
