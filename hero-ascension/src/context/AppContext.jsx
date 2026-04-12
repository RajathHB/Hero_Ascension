import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AppContext = createContext(null)

// ─── Hero definitions ───────────────────────────────────────────────
export const HERO_ROSTER = [
  {
    id: 'iron-will',
    name: 'Iron Will',
    domain: 'Discipline',
    tagline: 'Bend before none. Break nothing.',
    color: 'plasma',
    colorHex: '#00f5ff',
    glowClass: 'hero-plasma',
    icon: '⚡',
    tiers: ['Cadet', 'Sentinel', 'Vanguard', 'Iron Lord'],
    bg: 'from-cyan-900/30 to-void-900',
  },
  {
    id: 'ember-fist',
    name: 'Ember Fist',
    domain: 'Strength',
    tagline: 'Forge your body. Forge your will.',
    color: 'ember',
    colorHex: '#ff6b35',
    glowClass: 'hero-ember',
    icon: '🔥',
    tiers: ['Brawler', 'Warrior', 'Protector', 'King'],
    bg: 'from-orange-900/30 to-void-900',
  },
  {
    id: 'arcane-mind',
    name: 'Arcane Mind',
    domain: 'Learning',
    tagline: 'Knowledge is the only true power.',
    color: 'arcane',
    colorHex: '#c084fc',
    glowClass: 'hero-arcane',
    icon: '🔮',
    tiers: ['Apprentice', 'Scholar', 'Sage', 'Archmage'],
    bg: 'from-purple-900/30 to-void-900',
  },
  {
    id: 'golden-path',
    name: 'Golden Path',
    domain: 'Wealth',
    tagline: 'Every coin is a vote for your future.',
    color: 'gold',
    colorHex: '#fbbf24',
    glowClass: 'hero-gold',
    icon: '💰',
    tiers: ['Saver', 'Builder', 'Investor', 'Sovereign'],
    bg: 'from-yellow-900/30 to-void-900',
  },
  {
    id: 'jade-spirit',
    name: 'Jade Spirit',
    domain: 'Mindfulness',
    tagline: 'Still water reflects the whole sky.',
    color: 'jade',
    colorHex: '#34d399',
    glowClass: 'hero-jade',
    icon: '🌿',
    tiers: ['Seeker', 'Monk', 'Sage', 'Enlightened'],
    bg: 'from-emerald-900/30 to-void-900',
  },
  {
    id: 'nova-heart',
    name: 'Nova Heart',
    domain: 'Relationships',
    tagline: 'Connection is the source of all strength.',
    color: 'rose',
    colorHex: '#fb7185',
    glowClass: 'hero-rose',
    icon: '💫',
    tiers: ['Companion', 'Ally', 'Guardian', 'Beacon'],
    bg: 'from-rose-900/30 to-void-900',
  },
]

// ─── XP thresholds per tier ─────────────────────────────────────────
export const TIER_XP = [0, 500, 1500, 3500]

export function getTierIndex(xp) {
  let tier = 0
  for (let i = TIER_XP.length - 1; i >= 0; i--) {
    if (xp >= TIER_XP[i]) { tier = i; break }
  }
  return Math.min(tier, TIER_XP.length - 1)
}

export function getXPToNextTier(xp, maxTier) {
  const tierIdx = getTierIndex(xp)
  if (tierIdx >= maxTier - 1) return { current: xp, needed: 0, pct: 100 }
  const floor = TIER_XP[tierIdx]
  const ceil = TIER_XP[tierIdx + 1]
  const pct = Math.round(((xp - floor) / (ceil - floor)) * 100)
  return { current: xp - floor, needed: ceil - floor, pct }
}

// ─── Helpers ─────────────────────────────────────────────────────────
function toLocalDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr() {
  return toLocalDateStr(new Date())
}

// Check if a date is applicable for a given habit frequency
// daily = every day, weekdays = Mon-Fri, weekly = once per week
function isDayApplicable(date, frequency) {
  if (frequency === 'weekdays') {
    const day = date.getDay() // 0=Sun, 6=Sat
    return day !== 0 && day !== 6
  }
  // daily and weekly both show all days (weekly is tracked differently)
  return true
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ─── Provider ────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => load('ha_user', null))
  const [selectedHeroIds, setSelectedHeroIds] = useState(() => load('ha_selected_heroes', []))
  const [habits, setHabits] = useState(() => load('ha_habits', []))
  const [goals, setGoals] = useState(() => load('ha_goals', []))
  const [logs, setLogs] = useState(() => load('ha_logs', {}))
  // heroXP: { heroId: totalXP }
  const [heroXP, setHeroXP] = useState(() => load('ha_hero_xp', {}))
  const [onboarded, setOnboarded] = useState(() => load('ha_onboarded', false))

  // Persist everything
  useEffect(() => { save('ha_user', user) }, [user])
  useEffect(() => { save('ha_selected_heroes', selectedHeroIds) }, [selectedHeroIds])
  useEffect(() => { save('ha_habits', habits) }, [habits])
  useEffect(() => { save('ha_goals', goals) }, [goals])
  useEffect(() => { save('ha_logs', logs) }, [logs])
  useEffect(() => { save('ha_hero_xp', heroXP) }, [heroXP])
  useEffect(() => { save('ha_onboarded', onboarded) }, [onboarded])

  const selectedHeroes = HERO_ROSTER.filter(h => selectedHeroIds.includes(h.id))

  // ── Auth ──
  const login = useCallback((email, name) => {
    setUser({ email, name, joinedAt: new Date().toISOString() })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    // Data (heroes, habits, logs, XP, goals) is preserved in localStorage
    // and will be restored when the user logs back in
  }, [])

  // ── Hero selection ──
  const toggleHeroSelection = useCallback((heroId) => {
    setSelectedHeroIds(prev =>
      prev.includes(heroId) ? prev.filter(id => id !== heroId) : [...prev, heroId]
    )
  }, [])

  const confirmHeroSelection = useCallback(() => {
    // initialize XP for newly selected heroes
    setHeroXP(prev => {
      const next = { ...prev }
      selectedHeroIds.forEach(id => { if (!next[id]) next[id] = 0 })
      return next
    })
  }, [selectedHeroIds])

  const removeHero = useCallback((heroId) => {
    // Read current habits to find which ones to remove
    const habitsToRemove = habits.filter(h => h.heroId === heroId)
    const removeIds = new Set(habitsToRemove.map(h => h.id))

    // All state updates are flat/independent — no nesting
    setSelectedHeroIds(prev => prev.filter(id => id !== heroId))
    setHabits(prev => prev.filter(h => h.heroId !== heroId))
    setGoals(prev => prev.filter(g => g.heroId !== heroId))
    setLogs(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(key => {
        const habitId = key.split('_').slice(0, -1).join('_')
        if (removeIds.has(habitId)) delete next[key]
      })
      return next
    })
    setHeroXP(prev => {
      const next = { ...prev }
      delete next[heroId]
      return next
    })
  }, [habits])

  // ── Habits ──
  const addHabit = useCallback((habit) => {
    const newHabit = {
      id: `habit_${Date.now()}`,
      name: habit.name,
      heroId: habit.heroId,
      frequency: habit.frequency || 'daily',
      xpValue: habit.xpValue || 10,
      createdAt: new Date().toISOString(),
    }
    setHabits(prev => [...prev, newHabit])
    return newHabit
  }, [])

  const removeHabit = useCallback((habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }, [])

  const updateHabit = useCallback((habitId, updates) => {
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, ...updates } : h
    ))
  }, [])

  // ── Goals ──
  const addGoal = useCallback((goal) => {
    const newGoal = {
      id: `goal_${Date.now()}`,
      title: goal.title,
      heroId: goal.heroId,
      targetValue: goal.targetValue || 100,
      currentValue: 0,
      deadline: goal.deadline || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    setGoals(prev => [...prev, newGoal])
    return newGoal
  }, [])

  const updateGoalProgress = useCallback((goalId, value) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      const current = Math.min(value, g.targetValue)
      return { ...g, currentValue: current, status: current >= g.targetValue ? 'completed' : 'active' }
    }))
  }, [])

  // ── Daily habit logging ──
  const toggleHabitLog = useCallback((habitId, date = todayStr()) => {
    const key = `${habitId}_${date}`
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const wasChecked = logs[key] || false

    // Update logs
    setLogs(prev => ({ ...prev, [key]: !wasChecked }))

    // Update XP (independent call, not nested inside setLogs)
    setHeroXP(prev => ({
      ...prev,
      [habit.heroId]: Math.max(0,
        (prev[habit.heroId] || 0) + (wasChecked ? -habit.xpValue : habit.xpValue)
      ),
    }))
  }, [habits, logs])

  const isHabitDone = useCallback((habitId, date = todayStr()) => {
    return logs[`${habitId}_${date}`] || false
  }, [logs])

  // ── Streak calculation ──
  const getHabitStreak = useCallback((habitId) => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 90; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = `${habitId}_${toLocalDateStr(d)}`
      if (logs[key]) streak++
      else if (i > 0) break
    }
    return streak
  }, [logs])

  // ── Calendar data for last N days (lookback from today) ──
  const getCalendarData = useCallback((habitId, days = 30) => {
    const result = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = toLocalDateStr(d)
      result.push({
        date: dateStr,
        done: logs[`${habitId}_${dateStr}`] || false,
        isToday: i === 0,
      })
    }
    return result
  }, [logs])

  // ── Month calendar: from habit creation date → end of current month ──
  //    Handles 28/29/30/31 day months automatically
  const getMonthCalendarData = useCallback((habitId) => {
    const result = []
    const today = new Date()
    const habit = habits.find(h => h.id === habitId)

    // End of current month (day 0 of next month = last day of this month)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Start from habit creation date or 1st of month, whichever is later
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    let startDate = monthStart
    if (habit?.createdAt) {
      const created = new Date(habit.createdAt)
      const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate())
      if (createdDay > monthStart) startDate = createdDay
    }

    // Build array from startDate to end of month (skip non-applicable days)
    const freq = habit?.frequency || 'daily'
    const d = new Date(startDate)
    while (d <= endOfMonth) {
      if (isDayApplicable(d, freq)) {
        const dateStr = toLocalDateStr(d)
        const isFuture = d > today
        result.push({
          date: dateStr,
          done: isFuture ? false : (logs[`${habitId}_${dateStr}`] || false),
          isToday: d.toDateString() === today.toDateString(),
          isFuture,
        })
      }
      d.setDate(d.getDate() + 1)
    }
    return result
  }, [logs, habits])

  // ── Hero completion rate for current month (creation → end of month) ──
  const getHeroMonthlyRate = useCallback((heroId) => {
    const heroHabits = habits.filter(h => h.heroId === heroId)
    if (heroHabits.length === 0) return 0

    const today = new Date()
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    let total = 0, done = 0

    heroHabits.forEach(h => {
      // Start from habit creation or 1st of month, whichever is later
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      let startDay = monthStart
      if (h.createdAt) {
        const created = new Date(h.createdAt)
        const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate())
        if (createdDay > monthStart) startDay = createdDay
      }

      // Total = days from start to end of month (respecting frequency)
      // Done = only count up to today (can't complete future days)
      const freq = h.frequency || 'daily'
      const d = new Date(startDay)
      while (d <= endOfMonth) {
        if (isDayApplicable(d, freq)) {
          total++
          if (d <= today) {
            const dateStr = toLocalDateStr(d)
            if (logs[`${h.id}_${dateStr}`]) done++
          }
        }
        d.setDate(d.getDate() + 1)
      }
    })

    return total > 0 ? Math.round((done / total) * 100) : 0
  }, [habits, logs])

  const todayCompletionCount = useCallback(() => {
    const today = todayStr()
    return habits.filter(h => logs[`${h.id}_${today}`]).length
  }, [habits, logs])

  const value = {
    user, login, logout,
    selectedHeroIds, selectedHeroes, toggleHeroSelection, confirmHeroSelection, removeHero,
    habits, addHabit, removeHabit, updateHabit,
    goals, addGoal, updateGoalProgress,
    logs, toggleHabitLog, isHabitDone,
    heroXP, getHabitStreak, getCalendarData, getMonthCalendarData,
    getHeroMonthlyRate, todayCompletionCount,
    onboarded, setOnboarded,
    today: todayStr(),
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
