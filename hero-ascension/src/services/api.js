const API_URL = 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('ha_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  
  if (response.status === 401) {
    localStorage.removeItem('ha_token')
    localStorage.removeItem('ha_user')
    window.location.href = '/onboarding'
    return null
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || 'API request failed')
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (name, email, password) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  }),
  getMe: () => request('/auth/me'),

  // Sync
  getFullState: () => request('/sync/'),
  updateProfile: (updates) => request('/sync/profile', {
    method: 'POST',
    body: JSON.stringify(updates)
  }),
  toggleLog: (habitId, logDate) => request('/sync/logs/toggle', {
    method: 'POST',
    body: JSON.stringify({ habit_id: habitId, log_date: logDate })
  }),

  // Habits
  getHabits: () => request('/habits/'),
  createHabit: (habit) => request('/habits/', {
    method: 'POST',
    body: JSON.stringify(habit)
  }),
  deleteHabit: (id) => request(`/habits/${id}`, {
    method: 'DELETE'
  }),

  // Todos
  // Note: I'll add a proper todos router if needed, but for now I can use sync or a generic endpoint
}
