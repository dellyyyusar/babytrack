const API_BASE = '/api'

interface FetchOptions extends RequestInit {
  params?: Record<string, string>
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return null
    }
    const data = await res.json()
    localStorage.setItem('accessToken', data.access_token)
    return data.access_token
  } catch {
    return null
  }
}

export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  let url = `${API_BASE}${endpoint}`

  if (params) {
    const cleaned: Record<string, string> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    }
    const searchParams = new URLSearchParams(cleaned)
    url += `?${searchParams.toString()}`
  }

  const accessToken = localStorage.getItem('accessToken')
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res = await fetch(url, { ...fetchOptions, headers })

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(url, { ...fetchOptions, headers })
    } else {
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}
