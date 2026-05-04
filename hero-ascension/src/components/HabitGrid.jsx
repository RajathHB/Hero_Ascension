import React, { useState, useMemo } from 'react'
import { useApp, isHabitActiveOnDate } from '../context/AppContext'
import { HABIT_CATEGORIES } from '../data/categories'
import { ChevronLeft, ChevronRight, TrendingUp, Trophy } from 'lucide-react'
import clsx from 'clsx'

const PRIORITY_COLORS = { low: '#6B7280', medium: '#F59E0B', high: '#EF4444' }

export default function HabitGrid() {
  const { habits, logs, toggleHabit, today } = useApp()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date())

  const dayStrs = useMemo(() =>
    Array.from({ length: daysInMonth }, (_, i) =>
      `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    ), [year, month, daysInMonth])

  // Group habits by category
  const grouped = useMemo(() => {
    const map = {}
    habits.forEach(h => {
      const cat = h.category || 'fitness'
      if (!map[cat]) map[cat] = []
      map[cat].push(h)
    })
    return Object.entries(map).map(([catId, items]) => {
      const catDef = HABIT_CATEGORIES.find(c => c.id === catId) || HABIT_CATEGORIES[0]
      return { ...catDef, habits: items }
    })
  }, [habits])

  // Weekly summaries
  const weekSummaries = useMemo(() => {
    const weeks = []
    let ws = 0
    while (ws < daysInMonth) {
      const we = Math.min(ws + 7, daysInMonth)
      const weekDays = dayStrs.slice(ws, we)
      let total = 0, done = 0
      weekDays.forEach(ds => {
        habits.forEach(h => {
          if (isHabitActiveOnDate(h, ds)) {
            total++
            if (logs[`${h.id}_${ds}`]) done++
          }
        })
      })
      weeks.push({ label: `W${weeks.length + 1}`, pct: total > 0 ? Math.round((done / total) * 100) : 0 })
      ws = we
    }
    return weeks
  }, [dayStrs, habits, logs, daysInMonth])

  // Monthly summary
  const monthlySummary = useMemo(() => {
    let total = 0, done = 0
    habits.forEach(h => {
      dayStrs.forEach(ds => {
        if (isHabitActiveOnDate(h, ds)) {
          total++
          if (logs[`${h.id}_${ds}`]) done++
        }
      })
    })
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [habits, dayStrs, logs])

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy size={44} className="text-hero-muted/20 mb-3" />
        <p className="text-hero-muted font-medium text-base">No habits yet. Add some from Settings!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-9 h-9 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-text transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-serif text-2xl text-hero-text min-w-[180px] text-center">{monthLabel}</h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-lg bg-white border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-text transition-colors">
            <ChevronRight size={18} />
          </button>
          <button onClick={goToday} className="ml-1 px-3 py-2 text-xs font-bold uppercase tracking-widest text-hero-accent bg-white border border-black/[0.05] rounded-lg hover:bg-black/[0.02] transition-colors">Today</button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-black/[0.05]">
            <TrendingUp size={14} className="text-hero-accent" />
            <span className="text-xs font-bold text-hero-accent">{monthlySummary.pct}%</span>
            <span className="text-xs text-hero-muted">{monthlySummary.done}/{monthlySummary.total}</span>
          </div>
          {weekSummaries.map(w => (
            <div key={w.label} className="px-2.5 py-2 rounded-lg bg-white border border-black/[0.05] text-center min-w-[44px]">
              <p className="text-[10px] font-bold uppercase text-hero-muted">{w.label}</p>
              <p className={clsx("text-xs font-bold", w.pct >= 80 ? "text-green-600" : w.pct >= 50 ? "text-hero-accent" : "text-hero-muted")}>{w.pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-black/[0.01]">
                <th className="sticky left-0 z-20 bg-white/95 backdrop-blur-sm text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-hero-muted border-b border-r border-black/[0.05] min-w-[180px]">Habit</th>
                <th className="text-left px-3 py-3 text-xs font-bold uppercase tracking-widest text-hero-muted border-b border-r border-black/[0.05] min-w-[80px]">Cat</th>
                <th className="text-center px-2 py-3 text-xs font-bold uppercase text-hero-muted border-b border-r border-black/[0.05] min-w-[40px]">Goal</th>
                {dayStrs.map((ds, i) => {
                  const isToday = ds === today
                  const d = new Date(year, month, i + 1)
                  const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' })
                  return (
                    <th key={ds} className={clsx("text-center px-0 py-2 border-b border-r border-black/[0.05] min-w-[32px]", isToday && "bg-hero-accent/5")}>
                      <span className="text-[9px] font-bold uppercase text-hero-muted block leading-tight">{dayLetter}</span>
                      <span className={clsx("text-xs font-bold leading-tight", isToday ? "text-hero-accent" : "text-hero-text")}>{i + 1}</span>
                    </th>
                  )
                })}
                <th className="text-center px-3 py-3 text-xs font-bold uppercase text-hero-muted border-b border-black/[0.05] min-w-[80px]">Progress</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(group => (
                <React.Fragment key={group.id}>
                  {group.habits.map(habit => {
                    const goal = habit.monthlyGoal || 25
                    const activeDays = dayStrs.filter(ds => isHabitActiveOnDate(habit, ds))
                    const completedDays = activeDays.filter(ds => logs[`${habit.id}_${ds}`]).length
                    const progressPct = Math.min(100, Math.round((completedDays / goal) * 100))
                    const catDef = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[0]

                    return (
                      <tr key={habit.id} className="hover:bg-black/[0.005] transition-colors">
                        <td className="sticky left-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-2.5 border-b border-r border-black/[0.05]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[habit.priority] || PRIORITY_COLORS.medium }} />
                            <span className="font-medium text-hero-text text-sm truncate">{habit.title}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 border-b border-r border-black/[0.05]">
                          <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: catDef.color }}>
                            {catDef.icon} {catDef.label}
                          </span>
                        </td>
                        <td className="text-center px-2 py-2.5 border-b border-r border-black/[0.05]">
                          <span className="font-bold text-hero-text text-xs">{goal}</span>
                        </td>
                        {dayStrs.map(ds => {
                          const isActive = isHabitActiveOnDate(habit, ds)
                          const isDone = logs[`${habit.id}_${ds}`]
                          const isToday = ds === today
                          const isFuture = ds > today

                          return (
                            <td key={ds} className={clsx("text-center px-0 py-1.5 border-b border-r border-black/[0.05]", isToday && "bg-hero-accent/5")}>
                              {isActive ? (
                                <button onClick={() => !isFuture && toggleHabit(habit.id, ds)} disabled={isFuture}
                                  className={clsx("w-[22px] h-[22px] rounded-[5px] mx-auto flex items-center justify-center transition-all duration-150",
                                    isDone ? "bg-hero-accent text-white" : isFuture ? "bg-black/[0.02]" : "bg-black/[0.04] hover:bg-hero-accent/20 cursor-pointer")}>
                                  {isDone && <span className="text-[10px] leading-none">✓</span>}
                                </button>
                              ) : (
                                <span className="block w-[22px] h-[22px] mx-auto rounded-[5px] bg-black/[0.01]" />
                              )}
                            </td>
                          )
                        })}
                        <td className="px-3 py-2.5 border-b border-black/[0.05]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: catDef.color }} />
                            </div>
                            <span className="text-xs font-bold text-hero-muted whitespace-nowrap">{completedDays}/{goal}</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
