import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, isHabitActiveOnDate } from '../context/AppContext'
import { HABIT_CATEGORIES } from '../data/categories'
import HabitGrid from '../components/HabitGrid'
import CalendarTodo from '../components/CalendarTodo'
import {
  Zap, Flame, Sparkles, Calendar, Grid3X3, Settings, BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const PRIORITY_COLORS = { low: '#6B7280', medium: '#F59E0B', high: '#EF4444' }

const TABS = [
  { id: 'today', label: 'Today', icon: Zap },
  { id: 'tracker', label: 'Tracker', icon: Grid3X3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
]

export default function Dashboard() {
  const { selectedHero, xp, streak, level, levelProgress } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('today')

  if (!selectedHero) return <Navigate to="/onboarding" />

  return (
    <div className="page-enter pb-8">
      {/* Hero Header — single compact row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-3xl shadow-sm">
            {selectedHero.icon}
          </div>
          {streak > 0 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              🔥{streak}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl text-hero-text truncate">{selectedHero.name}</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-hero-accent/10 text-hero-accent rounded-md flex-shrink-0">{selectedHero.trait}</span>
            <span className="text-sm font-bold text-hero-muted flex-shrink-0">Lvl {level} · {xp} XP</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-[200px] h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${levelProgress.pct}%` }} className="h-full bg-hero-accent rounded-full" />
            </div>
            <span className="text-xs text-hero-muted font-medium">{levelProgress.current}/{levelProgress.needed} to Lvl {level + 1}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={() => navigate('/stats')} className="w-9 h-9 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-accent transition-colors">
            <BarChart3 size={16} />
          </button>
          <button onClick={() => navigate('/manage')} className="w-9 h-9 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-text transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Tab Switcher — slimmer */}
      <div className="flex items-center gap-1 p-1 bg-black/[0.02] rounded-xl border border-black/[0.03] mb-4">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={clsx("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200",
                isActive ? "bg-white text-hero-text shadow-sm" : "text-hero-muted hover:text-hero-text")}>
              <Icon size={14} />{tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'today' && <motion.div key="today" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}><TodayView /></motion.div>}
        {activeTab === 'tracker' && <motion.div key="tracker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}><HabitGrid /></motion.div>}
        {activeTab === 'calendar' && <motion.div key="calendar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.12 }}><CalendarTodo /></motion.div>}
      </AnimatePresence>
    </div>
  )
}

// ─── Today View ─────────────────────────────────────────────────────
function TodayView() {
  const { habits, logs, toggleHabit, today, calendarTodos, addCalendarTodo } = useApp()
  const [dailyFocus, setDailyFocus] = useState('')

  const activeToday = useMemo(() => habits.filter(h => isHabitActiveOnDate(h, today)), [habits, today])

  const grouped = useMemo(() => {
    const map = {}
    activeToday.forEach(h => {
      const cat = h.category || 'fitness'
      if (!map[cat]) map[cat] = []
      map[cat].push(h)
    })
    return Object.entries(map).map(([catId, items]) => {
      const catDef = HABIT_CATEGORIES.find(c => c.id === catId) || HABIT_CATEGORIES[0]
      return { ...catDef, habits: items }
    })
  }, [activeToday])

  const todayDone = activeToday.filter(h => logs[`${h.id}_${today}`]).length
  const todayTotal = activeToday.length
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0
  const allDone = todayDone === todayTotal && todayTotal > 0

  const todayTodos = calendarTodos[today] || []
  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const handleAddFocus = (e) => {
    e.preventDefault()
    if (!dailyFocus.trim()) return
    addCalendarTodo(today, dailyFocus.trim())
    setDailyFocus('')
  }

  return (
    <div className="space-y-4">
      {/* Compact Focus + Progress Row */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          {/* Mini progress ring */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-black/[0.04]" />
              <motion.circle initial={{ strokeDashoffset: 126 }} animate={{ strokeDashoffset: 126 - (126 * todayPct) / 100 }}
                cx="24" cy="24" r="20" stroke="var(--hero-accent)" strokeWidth="3" strokeDasharray="126" fill="transparent" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-hero-text">{todayPct}%</span>
            </div>
          </div>

          {/* Date + Progress summary */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-hero-muted uppercase tracking-wider">{dateLabel}</p>
            <p className="text-base font-bold text-hero-text">
              {allDone ? '🎉 All Done!' : `${todayDone} of ${todayTotal} Done`}
              {allDone && <span className="text-hero-accent ml-2 text-xs">+100 XP</span>}
            </p>
          </div>

          {/* Done / Left counters */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className="text-xl font-bold text-hero-text leading-none">{todayDone}</p>
              <p className="text-[10px] font-bold uppercase text-hero-muted mt-0.5">Done</p>
            </div>
            <div className="w-px h-6 bg-black/[0.06]" />
            <div className="text-center">
              <p className="text-xl font-bold text-hero-muted leading-none">{todayTotal - todayDone}</p>
              <p className="text-[10px] font-bold uppercase text-hero-muted mt-0.5">Left</p>
            </div>
          </div>

          {/* Inline focus input */}
          <form onSubmit={handleAddFocus} className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <input value={dailyFocus} onChange={e => setDailyFocus(e.target.value)} placeholder="Quick task..."
              className="w-44 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.05] text-sm outline-none focus:border-hero-accent/30 transition-all" />
            <button type="submit" className="px-3 py-2 rounded-lg bg-hero-accent text-white text-xs font-bold hover:scale-105 active:scale-95 transition-transform">Add</button>
          </form>
        </div>

        {/* Mobile focus input */}
        <form onSubmit={handleAddFocus} className="flex md:hidden items-center gap-1.5 mt-3">
          <input value={dailyFocus} onChange={e => setDailyFocus(e.target.value)} placeholder="Quick task..."
            className="flex-1 px-3 py-2 rounded-lg bg-black/[0.02] border border-black/[0.05] text-sm outline-none focus:border-hero-accent/30 transition-all" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-hero-accent text-white text-xs font-bold">Add</button>
        </form>

        {/* Focus tags */}
        {todayTodos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {todayTodos.map(t => (
              <span key={t.id} className={clsx("text-xs font-medium px-2 py-0.5 rounded-md", t.done ? "bg-green-50 text-green-600 line-through" : "bg-black/[0.03] text-hero-text")}>
                {t.done ? '✓' : '○'} {t.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Habits — compact single-line rows inside one card */}
      <div className="glass-card overflow-hidden divide-y divide-black/[0.04]">
        {grouped.map(group => (
          <div key={group.id}>
            {/* Category header row */}
            <div className="flex items-center gap-2 px-4 py-2 bg-black/[0.01]">
              <span className="text-sm">{group.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: group.color }}>{group.label}</span>
              <span className="text-xs text-hero-muted ml-auto">{group.habits.filter(h => logs[`${h.id}_${today}`]).length}/{group.habits.length}</span>
            </div>
            {/* Habit rows */}
            {group.habits.map(h => {
              const isDone = logs[`${h.id}_${today}`]
              return (
                <motion.div key={h.id} layout
                  className={clsx("flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all hover:bg-black/[0.01]", isDone && "opacity-60")}
                  onClick={() => toggleHabit(h.id, today)} whileTap={{ scale: 0.99 }}>
                  <div className={clsx("w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0",
                    isDone ? "bg-hero-accent text-white" : "border-2 border-black/[0.1]")}>
                    {isDone && <span className="text-[10px] leading-none">✓</span>}
                  </div>
                  <p className={clsx("flex-1 text-sm font-medium truncate", isDone ? "text-hero-muted line-through" : "text-hero-text")}>{h.title}</p>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[h.priority] || PRIORITY_COLORS.medium }} />
                  <span className={clsx("text-xs font-bold flex-shrink-0 tabular-nums",
                    isDone ? "text-hero-accent" : "text-hero-muted")}>
                    +{h.xp_reward} XP
                  </span>
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      {activeToday.length === 0 && (
        <div className="glass-card p-10 text-center">
          <Sparkles size={32} className="mx-auto mb-2 text-hero-muted/20" />
          <p className="text-hero-muted font-medium text-sm">
            {habits.length === 0 ? 'No habits configured yet — Go to Settings' : 'No habits scheduled for today'}
          </p>
        </div>
      )}
    </div>
  )
}
