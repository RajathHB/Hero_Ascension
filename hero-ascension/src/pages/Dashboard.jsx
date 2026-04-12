import React, { useState } from 'react'
import { useApp, HERO_ROSTER } from '../context/AppContext'
import CalendarGrid from '../components/CalendarGrid'
import StreakBadge from '../components/StreakBadge'
import XPBar from '../components/XPBar'
import StatCard from '../components/StatCard'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap, Target, Flame } from 'lucide-react'
import clsx from 'clsx'

function HeroHabitSection({ hero, habits, isHabitDone, toggleHabitLog, getHabitStreak, getMonthCalendarData, heroXP }) {
  const [expanded, setExpanded] = useState(true)
  const [showCal, setShowCal] = useState(false)

  const heroHabits = habits.filter(h => h.heroId === hero.id)
  if (heroHabits.length === 0) return null

  const todayDone = heroHabits.filter(h => isHabitDone(h.id)).length
  const pct = Math.round((todayDone / heroHabits.length) * 100)
  const xp = heroXP[hero.id] || 0

  const colorBorder = {
    plasma: 'border-cyan-400/20', ember: 'border-orange-400/20',
    arcane: 'border-purple-400/20', gold: 'border-yellow-400/20',
    jade: 'border-emerald-400/20', rose: 'border-rose-400/20',
  }
  const colorBg = {
    plasma: 'bg-cyan-400/5', ember: 'bg-orange-400/5',
    arcane: 'bg-purple-400/5', gold: 'bg-yellow-400/5',
    jade: 'bg-emerald-400/5', rose: 'bg-rose-400/5',
  }

  return (
    <div className={clsx('rounded-2xl border overflow-hidden', colorBorder[hero.color], colorBg[hero.color])}>
      {/* Hero header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${hero.colorHex}15`, border: `1px solid ${hero.colorHex}30` }}>
          {hero.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg tracking-wide" style={{ color: hero.colorHex }}>
              {hero.name}
            </span>
            <span className="font-mono text-xs text-slate-600">{todayDone}/{heroHabits.length} today</span>
          </div>
          <XPBar pct={pct} color={hero.color} height="h-1.5" className="mt-1.5 max-w-48" showPct={false} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="font-display text-xl" style={{ color: hero.colorHex }}>{xp}</p>
            <p className="font-mono text-xs text-slate-600">XP</p>
          </div>
          <span className="text-slate-600">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Habit list */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {heroHabits.map(habit => {
            const done = isHabitDone(habit.id)
            const streak = getHabitStreak(habit.id)
            return (
              <div
                key={habit.id}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group',
                  done
                    ? 'bg-black/30 border border-white/5'
                    : 'bg-black/20 border border-white/5 hover:border-white/10'
                )}
                onClick={() => toggleHabitLog(habit.id)}
              >
                {/* Checkbox */}
                <div className={clsx(
                  'w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  done
                    ? 'border-transparent'
                    : 'border-white/15 group-hover:border-white/30'
                )}
                  style={done ? { background: `${hero.colorHex}25`, borderColor: `${hero.colorHex}60` } : {}}>
                  {done
                    ? <CheckCircle2 size={16} style={{ color: hero.colorHex }} />
                    : <Circle size={16} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                  }
                </div>

                {/* Habit name */}
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'font-body font-semibold text-sm transition-all',
                    done ? 'text-slate-500 line-through' : 'text-slate-200'
                  )}>
                    {habit.name}
                  </p>
                  <p className="font-mono text-xs text-slate-700">{habit.frequency}</p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {streak > 0 && <StreakBadge streak={streak} />}
                  <span className="font-mono text-xs text-slate-600">+{habit.xpValue}xp</span>
                </div>
              </div>
            )
          })}

          {/* Calendar toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowCal(v => !v) }}
            className="w-full text-center font-mono text-xs text-slate-600 hover:text-slate-400 py-1.5 transition-colors"
          >
            {showCal ? '▲ Hide calendar' : '▼ Show monthly calendar'}
          </button>

          {showCal && (
            <div className="pt-2 space-y-3">
              {heroHabits.map(habit => (
                <div key={habit.id}>
                  <p className="font-mono text-xs text-slate-600 mb-1.5 truncate">{habit.name}</p>
                  <CalendarGrid data={getMonthCalendarData(habit.id)} color={hero.color} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const {
    user, selectedHeroes, habits, goals,
    isHabitDone, toggleHabitLog, getHabitStreak,
    getMonthCalendarData, heroXP, today,
    todayCompletionCount, updateGoalProgress,
  } = useApp()

  const totalHabits = habits.length
  const doneToday = todayCompletionCount()
  const overallPct = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0
  const totalXP = Object.values(heroXP).reduce((a, b) => a + b, 0)
  const activeGoals = goals.filter(g => g.status === 'active')

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8 page-enter">
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">{dateLabel}</p>
        <h1 className="font-display text-4xl text-slate-100 tracking-wide">
          READY,{' '}
          <span className="text-plasma-400">{user?.name?.toUpperCase() || 'HERO'}</span>
        </h1>
        <p className="font-body text-slate-500 mt-1">
          {doneToday === totalHabits && totalHabits > 0
            ? '🏆 All habits complete. Legendary day.'
            : doneToday === 0
            ? 'Your heroes are waiting. Begin your streak.'
            : `${totalHabits - doneToday} habit${totalHabits - doneToday !== 1 ? 's' : ''} left. Keep pushing.`
          }
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8 page-enter page-enter-delay-1">
        <StatCard
          label="Today"
          value={`${doneToday}/${totalHabits}`}
          sub="habits done"
          color="plasma"
          icon={<Zap size={16} className="text-cyan-400" />}
        />
        <StatCard
          label="Total XP"
          value={totalXP}
          sub="across heroes"
          color="gold"
          icon={<Flame size={16} className="text-yellow-400" />}
        />
        <StatCard
          label="Goals"
          value={activeGoals.length}
          sub="in progress"
          color="arcane"
          icon={<Target size={16} className="text-purple-400" />}
        />
      </div>

      {/* Overall progress bar */}
      <div className="glass-card p-4 mb-8 page-enter page-enter-delay-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Daily Progress</span>
          <span className={clsx(
            'font-display text-2xl',
            overallPct === 100 ? 'text-jade-400' : 'text-plasma-400'
          )}>{overallPct}%</span>
        </div>
        <XPBar pct={overallPct} color={overallPct === 100 ? 'jade' : 'plasma'} height="h-3" showPct={false} />
      </div>

      {/* Habit sections by hero */}
      <div className="space-y-4 page-enter page-enter-delay-3">
        <h2 className="font-mono text-xs text-slate-600 uppercase tracking-widest">Today's Missions</h2>
        {selectedHeroes.map(hero => (
          <HeroHabitSection
            key={hero.id}
            hero={hero}
            habits={habits}
            isHabitDone={isHabitDone}
            toggleHabitLog={toggleHabitLog}
            getHabitStreak={getHabitStreak}
            getMonthCalendarData={getMonthCalendarData}
            heroXP={heroXP}
          />
        ))}
      </div>

      {/* Goals section */}
      {goals.length > 0 && (
        <div className="mt-8 page-enter page-enter-delay-4">
          <h2 className="font-mono text-xs text-slate-600 uppercase tracking-widest mb-3">Major Goals</h2>
          <div className="space-y-3">
            {goals.map(goal => {
              const hero = HERO_ROSTER.find(h => h.id === goal.heroId)
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              return (
                <div key={goal.id} className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{hero?.icon || '🎯'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-body font-semibold text-slate-200 text-sm">{goal.title}</p>
                        <span
                          className="font-mono text-xs font-bold flex-shrink-0"
                          style={{ color: hero?.colorHex || '#00f5ff' }}
                        >
                          {goal.currentValue}/{goal.targetValue}
                        </span>
                      </div>
                      <XPBar pct={pct} color={hero?.color || 'plasma'} height="h-1.5" showPct={false} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-xs text-slate-600">
                          {goal.deadline ? `Due ${goal.deadline}` : hero?.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                            className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >−</button>
                          <button
                            onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                            className="w-6 h-6 rounded flex items-center justify-center font-bold transition-colors"
                            style={{ background: `${hero?.colorHex || '#00f5ff'}15`, color: hero?.colorHex || '#00f5ff' }}
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
