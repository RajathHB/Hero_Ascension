import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { HERO_ROSTER } from '../data/heroRoster'
import { HABIT_CATEGORIES } from '../data/categories'
import { api } from '../services/api'

export { HERO_ROSTER, HABIT_CATEGORIES }

const AppContext = createContext(null)

// ─── Gamification Constants ─────────────────────────────────────────
export const XP_PER_HABIT = 20
export const BOSS_MODE_BONUS = 100
export const PRIORITY_MULTIPLIER = { low: 1, medium: 1.5, high: 2 }
export const DAY_KEYS  = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// ─── Level Logic ────────────────────────────────────────────────────
export const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1
export const getXPForLevel = (level) => 100 * Math.pow(level - 1, 2)
export const getLevelProgress = (xp) => {
  const level = calculateLevel(xp)
  const floor = getXPForLevel(level)
  const ceil = getXPForLevel(level + 1)
  const pct = Math.round(((xp - floor) / (ceil - floor)) * 100)
  return { current: xp - floor, needed: ceil - floor, pct }
}

// ─── Helpers ────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1], 16)} ${parseInt(r[2], 16)} ${parseInt(r[3], 16)}` : '59 130 246'
}

export function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr() { return toDateStr(new Date()) }

export function isHabitActiveOnDate(habit, dateStr) {
  if (!habit.repeat_days || habit.repeat_days.length === 0 || habit.repeat_days.length === 7) return true
  const d = new Date(dateStr + 'T00:00:00')
  const dayKey = DAY_KEYS[d.getDay()]
  return habit.repeat_days.includes(dayKey)
}

// ─── Provider ───────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ha_user') || 'null'))
  const [loading, setLoading] = useState(!!user)

  // These will be synced with backend
  const [selectedHeroId, setSelectedHeroId] = useState(null)
  const [xp, setXp] = useState(0)
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [calendarTodos, setCalendarTodos] = useState({})
  const [onboarded, setOnboarded] = useState(false)

  const selectedHero = HERO_ROSTER.find(h => h.id === selectedHeroId)

  // ── Sync with Backend on Load ──
  useEffect(() => {
    if (user) {
      setLoading(true)
      api.getFullState()
        .then(state => {
          setSelectedHeroId(state.profile.selected_hero_id)
          setXp(state.profile.xp)
          setHabits(state.habits)
          setLogs(state.logs)
          setCalendarTodos(state.calendar_todos)
          setOnboarded(state.profile.onboarded)
        })
        .catch(err => console.error("Sync failed", err))
        .finally(() => setLoading(false))
    }
  }, [user])

  // ── CSS Variables ──
  useEffect(() => {
    if (selectedHero) {
      document.documentElement.style.setProperty('--hero-accent-rgb', hexToRgb(selectedHero.accentColor))
      document.documentElement.style.setProperty('--hero-accent', selectedHero.accentColor)
      document.documentElement.style.setProperty('--hero-accent-glow', selectedHero.accentGlow)
    }
  }, [selectedHero])

  // ── Auth ──
  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password)
    localStorage.setItem('ha_token', res.access_token)
    const u = { userId: res.user_id, name: res.name, email: res.email }
    setUser(u)
    localStorage.setItem('ha_user', JSON.stringify(u))
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const res = await api.signup(name, email, password)
    localStorage.setItem('ha_token', res.access_token)
    const u = { userId: res.user_id, name: res.name, email: res.email }
    setUser(u)
    localStorage.setItem('ha_user', JSON.stringify(u))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('ha_token')
    localStorage.removeItem('ha_user')
    setSelectedHeroId(null); setXp(0); setHabits([]); setLogs({}); setCalendarTodos({}); setOnboarded(false)
  }, [])

  // ── XP & Profile ──
  const updateProfile = useCallback(async (updates) => {
    // Optimistic update
    if (updates.xp !== undefined) setXp(updates.xp)
    if (updates.selected_hero_id !== undefined) setSelectedHeroId(updates.selected_hero_id)
    if (updates.onboarded !== undefined) setOnboarded(updates.onboarded)
    
    await api.updateProfile(updates)
  }, [])

  const addXp = useCallback((amount) => {
    const newXp = Math.max(0, xp + amount)
    updateProfile({ xp: newXp })
  }, [xp, updateProfile])

  // ── Habits ──
  const addHabit = useCallback(async (title, category = 'fitness', monthly_goal = 25, repeat_days = [], priority = 'medium') => {
    const habit = {
      id: `h_${crypto.randomUUID()}`,
      title,
      category,
      monthly_goal,
      repeat_days,
      priority,
      xp_reward: Math.round(XP_PER_HABIT * (PRIORITY_MULTIPLIER[priority] || 1))
    }
    // Optimistic
    setHabits(prev => [...prev, habit])
    await api.createHabit(habit)
  }, [])

  const removeHabit = useCallback(async (id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    await api.deleteHabit(id)
  }, [])

  const toggleHabit = useCallback(async (id, date = todayStr()) => {
    const key = `${id}_${date}`
    const wasChecked = logs[key] || false
    const habit = habits.find(h => h.id === id)
    const reward = habit?.xp_reward || XP_PER_HABIT

    // Optimistic UI
    setLogs(prev => {
      const next = { ...prev, [key]: !wasChecked }
      const activeToday = habits.filter(h => isHabitActiveOnDate(h, date))
      const dayDone = activeToday.filter(h => next[`${h.id}_${date}`]).length
      if (dayDone === activeToday.length && activeToday.length > 0 && !wasChecked) {
        addXp(BOSS_MODE_BONUS)
      }
      return next
    })
    addXp(wasChecked ? -reward : reward)
    
    await api.toggleLog(id, date)
  }, [logs, habits, addXp])

  // ── Calendar Todos ──
  // Note: For now, keeping these local or I could implement a proper todos API. 
  // Given time, I'll keep them in state and maybe add a generic sync later.
  const addCalendarTodo = useCallback((date, title) => {
    setCalendarTodos(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), { id: `ct_${Date.now()}`, title, done: false }]
    }))
  }, [])

  const toggleCalendarTodo = useCallback((date, id) => {
    setCalendarTodos(prev => ({
      ...prev,
      [date]: (prev[date] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
    }))
  }, [])

  const removeCalendarTodo = useCallback((date, id) => {
    setCalendarTodos(prev => ({
      ...prev,
      [date]: (prev[date] || []).filter(t => t.id !== id)
    }))
  }, [])

  const getStreak = useCallback(() => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i)
      const ds = toDateStr(d)
      const active = habits.filter(h => isHabitActiveOnDate(h, ds))
      if (active.length === 0) continue
      const dayLogs = active.filter(h => logs[`${h.id}_${ds}`])
      if (dayLogs.length > 0) streak++
      else if (i > 0) break
    }
    return streak
  }, [logs, habits])

  const value = {
    user, login, signup, logout, loading,
    selectedHeroId, setSelectedHeroId: (id) => updateProfile({ selected_hero_id: id }), selectedHero,
    xp, addXp, habits, addHabit, removeHabit, toggleHabit,
    logs,
    calendarTodos, addCalendarTodo, toggleCalendarTodo, removeCalendarTodo,
    onboarded, setOnboarded: (val) => updateProfile({ onboarded: val }),
    streak: getStreak(),
    level: calculateLevel(xp),
    levelProgress: getLevelProgress(xp),
    today: todayStr()
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
