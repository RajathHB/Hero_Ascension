/**
 * src/api/client.js
 * ──────────────────
 * Central API client for the Hero Ascension backend.
 *
 * HOW TO USE:
 *   1. Set VITE_API_URL in your frontend .env file:
 *      VITE_API_URL=http://localhost:8000
 *
 *   2. Import functions where needed:
 *      import { login, listHabits, toggleLog } from '../api/client'
 *
 *   3. The token is stored in localStorage under 'ha_token'.
 *      All authenticated calls attach it automatically.
 */

// In development, requests go through Vite's proxy (/api → localhost:8000)
// which eliminates CORS issues entirely. For production, set VITE_API_URL
// to the deployed backend URL.
const BASE = import.meta.env.VITE_API_URL || '/api'

// ── Token helpers ──────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('ha_token') || ''
}

function saveToken(token) {
  localStorage.setItem('ha_token', token)
}

function clearToken() {
  localStorage.removeItem('ha_token')
}

// ── Base fetch wrapper ─────────────────────────────────────────────────

async function api(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }

  // 204 No Content — return null
  if (res.status === 204) return null
  return res.json()
}

function get(path) {
  return api(path, { method: 'GET' })
}

function post(path, body) {
  return api(path, { method: 'POST', body: JSON.stringify(body) })
}

function patch(path, body) {
  return api(path, { method: 'PATCH', body: JSON.stringify(body) })
}

function del(path) {
  return api(path, { method: 'DELETE' })
}

// ── Auth ───────────────────────────────────────────────────────────────

export async function signup(name, email, password) {
  const data = await post('/auth/signup', { name, email, password })
  saveToken(data.access_token)
  return data
}

export async function login(email, password) {
  const data = await post('/auth/login', { email, password })
  saveToken(data.access_token)
  return data
}

export function logout() {
  clearToken()
}

export function getMe() {
  return get('/auth/me')
}

// ── Heroes ─────────────────────────────────────────────────────────────

export function getHeroRoster() {
  return get('/heroes/roster')
}

export function selectHeroes(heroIds) {
  return post('/heroes/select', { hero_ids: heroIds })
}

export function getMyHeroes() {
  return get('/heroes/my')
}

export function evaluateHeroes() {
  return post('/heroes/evaluate', {})
}

export function evaluateHero(heroId) {
  return post(`/heroes/evaluate/${heroId}`, {})
}

// ── Habits ─────────────────────────────────────────────────────────────

export function listHabits() {
  return get('/habits/')
}

export function createHabit(name, heroId, frequency = 'daily', xpValue = 10) {
  return post('/habits/', { name, hero_id: heroId, frequency, xp_value: xpValue })
}

export function deleteHabit(habitId) {
  return del(`/habits/${habitId}`)
}

export function getHabitStreak(habitId) {
  return get(`/habits/${habitId}/streak`)
}

// ── Logs (Daily Tracker) ───────────────────────────────────────────────

export function toggleLog(habitId, logDate) {
  const body = { habit_id: habitId }
  if (logDate) body.log_date = logDate   // YYYY-MM-DD string
  return post('/logs/toggle', body)
}

export function getTodayLogs() {
  return get('/logs/today')
}

export function getHabitHistory(habitId, days = 30) {
  return get(`/logs/history/${habitId}?days=${days}`)
}

export function getDateSummary(dateStr) {
  return get(`/logs/summary/${dateStr}`)
}

// ── Goals ──────────────────────────────────────────────────────────────

export function listGoals() {
  return get('/goals/')
}

export function createGoal(title, heroId, targetValue, deadline) {
  return post('/goals/', {
    title,
    hero_id: heroId,
    target_value: targetValue,
    deadline: deadline || null,
  })
}

export function updateGoalProgress(goalId, currentValue) {
  return patch(`/goals/${goalId}`, { current_value: currentValue })
}

export function deleteGoal(goalId) {
  return del(`/goals/${goalId}`)
}

// ── Dashboard ──────────────────────────────────────────────────────────

export function getDashboard() {
  return get('/dashboard/')
}
