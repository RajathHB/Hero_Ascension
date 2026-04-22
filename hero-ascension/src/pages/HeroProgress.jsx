import React, { useState } from 'react'
import { useApp, HERO_ROSTER, getTierIndex, getXPToNextTier, TIER_XP } from '../context/AppContext'
import XPBar from '../components/XPBar'
import CalendarGrid from '../components/CalendarGrid'
import StreakBadge from '../components/StreakBadge'
import { Trophy, TrendingUp, Shield, Star, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const EVOLUTION_MESSAGES = [
  'You have just begun. The journey is long.',
  'Progress noted. Your legend is forming.',
  'Halfway to mastery. Few reach this far.',
  'The pinnacle. You have become legendary.',
]

function TierProgress({ hero, xp }) {
  const tierIdx = getTierIndex(xp)
  const { current, needed, pct } = getXPToNextTier(xp, hero.tiers.length)
  const atMax = tierIdx >= hero.tiers.length - 1

  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: hero.colorHex }} />

      {/* Hero identity */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: `${hero.colorHex}10` }}>
          {hero.icon}
        </div>
        <div>
          <h3 className="font-display text-2xl tracking-wide" style={{ color: hero.colorHex }}>
            {hero.name}
          </h3>
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: '#9E9A8C' }}>{hero.domain}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg uppercase tracking-widest"
              style={{ background: `${hero.colorHex}12`, color: hero.colorHex, border: `1px solid ${hero.colorHex}25` }}
            >
              {hero.tiers[tierIdx]}
            </span>
            <span className="font-mono text-xs" style={{ color: '#9E9A8C' }}>{xp} XP total</span>
          </div>
        </div>
      </div>

      {/* Tier track */}
      <div className="relative mb-5">
        <div className="flex items-center justify-between mb-2">
          {hero.tiers.map((tier, i) => (
            <div key={tier} className="flex flex-col items-center gap-1 flex-1">
              <div className={clsx(
                'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500',
              )}
                style={i <= tierIdx
                  ? { background: hero.colorHex, borderColor: 'transparent', boxShadow: `0 2px 8px ${hero.colorHex}30` }
                  : { borderColor: 'rgba(0,0,0,0.1)', background: '#fff' }
                }>
                {i < tierIdx
                  ? <Trophy size={12} className="text-white" />
                  : i === tierIdx
                  ? <Star size={12} className="text-white" />
                  : <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C4BFAE' }} />
                }
              </div>
              <span className="font-mono text-xs text-center leading-tight"
                style={{ color: i <= tierIdx ? hero.colorHex : '#C4BFAE', fontSize: '0.6rem' }}>
                {tier.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        {/* Connection line */}
        <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 -z-10"
          style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${(tierIdx / (hero.tiers.length - 1)) * 100}%`,
              background: hero.colorHex,
            }}
          />
        </div>
      </div>

      {/* XP to next tier */}
      {!atMax ? (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-xs" style={{ color: '#9E9A8C' }}>Progress to {hero.tiers[tierIdx + 1]}</span>
            <span className="font-mono text-xs font-bold" style={{ color: hero.colorHex }}>
              {current} / {needed} XP
            </span>
          </div>
          <XPBar pct={pct} color={hero.color} height="h-2.5" showPct={false} />
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: hero.colorHex }}>
            ✦ Maximum tier reached ✦
          </p>
        </div>
      )}

      {/* Evolution message */}
      <p className="font-body text-xs italic mt-3 text-center" style={{ color: '#9E9A8C' }}>
        "{EVOLUTION_MESSAGES[tierIdx]}"
      </p>
    </div>
  )
}

function HeroDetailPanel({ hero, habits, getHabitStreak, getMonthCalendarData, heroXP, getHeroMonthlyRate }) {
  const heroHabits = habits.filter(h => h.heroId === hero.id)
  const xp = heroXP[hero.id] || 0
  const monthRate = getHeroMonthlyRate(hero.id)
  const tierIdx = getTierIndex(xp)

  const topStreak = heroHabits.reduce((best, h) => {
    const s = getHabitStreak(h.id)
    return s > best.streak ? { name: h.name, streak: s } : best
  }, { name: '', streak: 0 })

  if (heroHabits.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wider" style={{ color: '#9E9A8C' }}>No habits assigned to this hero yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="font-display text-2xl" style={{ color: hero.colorHex }}>{xp}</p>
          <p className="font-mono text-xs uppercase" style={{ color: '#9E9A8C' }}>Total XP</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="font-display text-2xl" style={{ color: monthRate >= 80 ? '#52B788' : monthRate >= 50 ? '#E9C46A' : '#E07A8E' }}>
            {monthRate}%
          </p>
          <p className="font-mono text-xs uppercase" style={{ color: '#9E9A8C' }}>This Month</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="font-display text-2xl" style={{ color: hero.colorHex }}>{topStreak.streak}</p>
          <p className="font-mono text-xs uppercase" style={{ color: '#9E9A8C' }}>Best Streak</p>
        </div>
      </div>

      {/* Monthly eval preview */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: hero.colorHex }} />
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#7A7668' }}>Monthly Evaluation</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <XPBar pct={monthRate} color={hero.color} height="h-3" showPct={false} />
          </div>
          <span className="font-display text-xl flex-shrink-0" style={{ color: hero.colorHex }}>{monthRate}%</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Shield size={12} style={{ color: '#9E9A8C' }} />
          <p className="font-mono text-xs" style={{ color: '#9E9A8C' }}>
            {monthRate >= 80
              ? `⬆ On track to evolve → ${hero.tiers[Math.min(tierIdx + 1, hero.tiers.length - 1)]}`
              : monthRate >= 50
              ? `= Maintaining ${hero.tiers[tierIdx]} tier`
              : `⚠ At risk — low completion rate`
            }
          </p>
        </div>
      </div>

      {/* Habits with streaks + calendar */}
      <div className="space-y-3">
        <h4 className="font-mono text-xs uppercase tracking-widest" style={{ color: '#9E9A8C' }}>Habit Performance</h4>
        {heroHabits.map(habit => {
          const streak = getHabitStreak(habit.id)
          const calData = getMonthCalendarData(habit.id)
          const done = calData.filter(d => d.done).length
          const pct = Math.round((done / calData.length) * 100)
          return (
            <div key={habit.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm" style={{ color: '#3D3A32' }}>{habit.name}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: '#9E9A8C' }}>{habit.frequency} · {done}/{calData.length} days</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {streak > 0 && <StreakBadge streak={streak} />}
                  <span className="font-mono text-xs font-bold" style={{ color: hero.colorHex }}>{pct}%</span>
                </div>
              </div>
              <XPBar pct={pct} color={hero.color} height="h-1.5" showPct={false} className="mb-2" />
              <CalendarGrid data={calData} color={hero.color} compact />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HeroProgress() {
  const { selectedHeroes, habits, heroXP, getHabitStreak, getMonthCalendarData, getHeroMonthlyRate } = useApp()
  const [activeHeroId, setActiveHeroId] = useState(selectedHeroes[0]?.id || null)

  const activeHero = selectedHeroes.find(h => h.id === activeHeroId) || selectedHeroes[0]

  if (selectedHeroes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-sm" style={{ color: '#9E9A8C' }}>No heroes selected yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 page-enter">
        <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#9E9A8C' }}>Your Legion</p>
        <h1 className="font-display text-4xl text-plasma-400 tracking-wide">HERO PROGRESS</h1>
        <p className="font-body mt-1" style={{ color: '#7A7668' }}>Track evolution. Own every domain.</p>
      </div>

      {/* Hero selector tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 page-enter page-enter-delay-1">
        {selectedHeroes.map(hero => {
          const xp = heroXP[hero.id] || 0
          const tierIdx = getTierIndex(xp)
          const isActive = hero.id === activeHeroId
          return (
            <button
              key={hero.id}
              onClick={() => setActiveHeroId(hero.id)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200"
              style={isActive ? {
                background: `${hero.colorHex}08`,
                borderColor: `${hero.colorHex}30`,
                boxShadow: `0 2px 12px ${hero.colorHex}10`,
              } : {
                borderColor: 'rgba(0,0,0,0.06)',
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              <span className="text-lg">{hero.icon}</span>
              <div className="text-left">
                <p className="font-display text-sm tracking-wide leading-none" style={{ color: isActive ? hero.colorHex : '#7A7668' }}>
                  {hero.name}
                </p>
                <p className="font-mono text-xs mt-0.5" style={{ color: isActive ? `${hero.colorHex}80` : '#C4BFAE' }}>
                  {hero.tiers[tierIdx]}
                </p>
              </div>
              {isActive && <ChevronRight size={14} style={{ color: hero.colorHex }} />}
            </button>
          )
        })}
      </div>

      {activeHero && (
        <div className="space-y-4 page-enter page-enter-delay-2">
          {/* Tier progress card */}
          <TierProgress
            hero={activeHero}
            xp={heroXP[activeHero.id] || 0}
          />

          {/* Detail panel */}
          <HeroDetailPanel
            hero={activeHero}
            habits={habits}
            getHabitStreak={getHabitStreak}
            getMonthCalendarData={getMonthCalendarData}
            heroXP={heroXP}
            getHeroMonthlyRate={getHeroMonthlyRate}
          />
        </div>
      )}
    </div>
  )
}
