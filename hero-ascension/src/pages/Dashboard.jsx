import React, { useState } from 'react'
import { useApp, HERO_ROSTER } from '../context/AppContext'
import CalendarGrid from '../components/CalendarGrid'
import StreakBadge from '../components/StreakBadge'
import XPBar from '../components/XPBar'
import StatCard from '../components/StatCard'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Zap, Target, Flame, TrendingUp, Award } from 'lucide-react'
import clsx from 'clsx'

function HeroHabitSection({ hero, habits, isHabitDone, toggleHabitLog, getHabitStreak, getMonthCalendarData, heroXP }) {
  const [expanded, setExpanded] = useState(true)
  const [showCal, setShowCal] = useState(false)

  const heroHabits = habits.filter(h => h.heroId === hero.id)
  if (heroHabits.length === 0) return null

  const todayDone = heroHabits.filter(h => isHabitDone(h.id)).length
  const pct = Math.round((todayDone / heroHabits.length) * 100)
  const xp = heroXP[hero.id] || 0

  return (
    <div className="glass-card overflow-hidden transition-all duration-300"
      style={{ borderLeft: `3px solid ${hero.colorHex}` }}>
      {/* Hero header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none transition-colors"
        onClick={() => setExpanded(e => !e)}
        style={{ background: expanded ? `${hero.colorHex}05` : 'transparent' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${hero.colorHex}10` }}>
          {hero.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg tracking-wide" style={{ color: hero.colorHex }}>
              {hero.name}
            </span>
            <span className="font-mono text-xs" style={{ color: '#9E9A8C' }}>{todayDone}/{heroHabits.length} today</span>
          </div>
          <XPBar pct={pct} color={hero.color} height="h-1.5" className="mt-1.5 max-w-48" showPct={false} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="font-display text-xl" style={{ color: hero.colorHex }}>{xp}</p>
            <p className="font-mono text-xs" style={{ color: '#C4BFAE' }}>XP</p>
          </div>
          <span style={{ color: '#9E9A8C' }}>
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
                )}
                style={{
                  background: done ? `${hero.colorHex}06` : 'rgba(0,0,0,0.015)',
                  border: done ? `1px solid ${hero.colorHex}20` : '1px solid rgba(0,0,0,0.04)',
                }}
                onClick={() => toggleHabitLog(habit.id)}
              >
                {/* Checkbox */}
                <div className={clsx(
                  'w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                )}
                  style={done
                    ? { background: `${hero.colorHex}15`, borderColor: `${hero.colorHex}50` }
                    : { borderColor: 'rgba(0,0,0,0.12)' }
                  }>
                  {done
                    ? <CheckCircle2 size={16} style={{ color: hero.colorHex }} />
                    : <Circle size={16} style={{ color: '#C4BFAE' }} className="group-hover:text-warm-500 transition-colors" />
                  }
                </div>

                {/* Habit name */}
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'font-body font-semibold text-sm transition-all',
                    done ? 'line-through' : ''
                  )} style={{ color: done ? '#9E9A8C' : '#3D3A32' }}>
                    {habit.name}
                  </p>
                  <p className="font-mono text-xs" style={{ color: '#C4BFAE' }}>{habit.frequency}</p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {streak > 0 && <StreakBadge streak={streak} />}
                  <span className="font-mono text-xs" style={{ color: '#C4BFAE' }}>+{habit.xpValue}xp</span>
                </div>
              </div>
            )
          })}

          {/* Calendar toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowCal(v => !v) }}
            className="w-full text-center font-mono text-xs py-1.5 transition-colors"
            style={{ color: '#9E9A8C' }}
          >
            {showCal ? '▲ Hide calendar' : '▼ Show monthly calendar'}
          </button>

          {showCal && (
            <div className="pt-2 space-y-3">
              {heroHabits.map(habit => (
                <div key={habit.id}>
                  <p className="font-mono text-xs mb-1.5 truncate" style={{ color: '#9E9A8C' }}>{habit.name}</p>
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

  // Best streak across all habits
  const bestStreak = habits.reduce((best, h) => {
    const s = getHabitStreak(h.id)
    return s > best ? s : best
  }, 0)

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  // Motivational message based on progress
  const getMessage = () => {
    if (doneToday === totalHabits && totalHabits > 0) return { text: '🏆 All habits complete. Legendary day!', style: { color: '#52B788' } }
    if (overallPct >= 75) return { text: '🔥 Almost there! Finish strong.', style: { color: '#E76F51' } }
    if (overallPct >= 50) return { text: '⚡ Great momentum. Keep pushing.', style: { color: '#E9C46A' } }
    if (doneToday === 0) return { text: 'Your heroes are waiting. Begin your streak.', style: { color: '#9E9A8C' } }
    return { text: `${totalHabits - doneToday} habit${totalHabits - doneToday !== 1 ? 's' : ''} left. Keep pushing.`, style: { color: '#7A7668' } }
  }
  const msg = getMessage()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Greeting */}
      <div className="mb-8 page-enter">
        <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#9E9A8C' }}>{dateLabel}</p>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: '#3D3A32' }}>
          READY,{' '}
          <span className="text-plasma-400">{user?.name?.toUpperCase() || 'HERO'}</span>
        </h1>
        <p className="font-body mt-1" style={msg.style}>{msg.text}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 page-enter page-enter-delay-1">
        <StatCard
          label="Today"
          value={`${doneToday}/${totalHabits}`}
          sub="habits done"
          color="plasma"
          icon={<Zap size={16} className="text-plasma-400" />}
        />
        <StatCard
          label="Total XP"
          value={totalXP}
          sub="across heroes"
          color="gold"
          icon={<Flame size={16} className="text-gold-400" />}
        />
        <StatCard
          label="Goals"
          value={activeGoals.length}
          sub="in progress"
          color="arcane"
          icon={<Target size={16} className="text-arcane-400" />}
        />
        <StatCard
          label="Best Streak"
          value={`${bestStreak}d`}
          sub="consecutive"
          color="ember"
          icon={<Award size={16} className="text-ember-400" />}
        />
      </div>

      {/* Overall progress bar */}
      <div className="glass-card p-5 mb-8 page-enter page-enter-delay-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: '#2A9D8F' }} />
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#7A7668' }}>Daily Progress</span>
          </div>
          <span className={clsx(
            'font-display text-3xl',
            overallPct === 100 ? 'text-jade-400' : 'text-plasma-400'
          )}>{overallPct}%</span>
        </div>
        <XPBar pct={overallPct} color={overallPct === 100 ? 'jade' : 'plasma'} height="h-3" showPct={false} />
        {overallPct === 100 && totalHabits > 0 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-body text-sm font-semibold"
              style={{ background: 'rgba(82,183,136,0.1)', color: '#52B788', border: '1px solid rgba(82,183,136,0.2)' }}>
              🎉 Perfect day achieved!
            </span>
          </div>
        )}
      </div>

      {/* Habit sections by hero */}
      <div className="space-y-4 page-enter page-enter-delay-3">
        <h2 className="font-mono text-xs uppercase tracking-widest" style={{ color: '#9E9A8C' }}>Today's Missions</h2>
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
          <h2 className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#9E9A8C' }}>Major Goals</h2>
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
                        <p className="font-body font-semibold text-sm" style={{ color: '#3D3A32' }}>{goal.title}</p>
                        <span
                          className="font-mono text-xs font-bold flex-shrink-0"
                          style={{ color: hero?.colorHex || '#2A9D8F' }}
                        >
                          {goal.currentValue}/{goal.targetValue}
                        </span>
                      </div>
                      <XPBar pct={pct} color={hero?.color || 'plasma'} height="h-1.5" showPct={false} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-xs" style={{ color: '#9E9A8C' }}>
                          {goal.deadline ? `Due ${goal.deadline}` : hero?.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.currentValue - 1))}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors font-body font-bold"
                            style={{ background: 'rgba(0,0,0,0.04)', color: '#7A7668' }}
                          >−</button>
                          <button
                            onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors"
                            style={{ background: `${hero?.colorHex || '#2A9D8F'}12`, color: hero?.colorHex || '#2A9D8F' }}
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
