import React, { useState } from 'react'
import { useApp, getTierIndex, getXPToNextTier } from '../context/AppContext'
import XPBar from '../components/XPBar'
import CalendarGrid from '../components/CalendarGrid'
import StreakBadge from '../components/StreakBadge'
import { Trophy, TrendingUp, Sparkles, Star, ChevronRight, Activity } from 'lucide-react'
import clsx from 'clsx'

const EVOLUTION_MESSAGES = [
  'The journey of self-mastery begins.',
  'Your core habits are stabilizing.',
  'An exceptional level of discipline.',
  'The peak of heroic potential.',
]

function TierProgress({ hero, xp }) {
  const tierIdx = getTierIndex(xp)
  const { current, needed, pct } = getXPToNextTier(xp, hero.tiers.length)
  const atMax = tierIdx >= hero.tiers.length - 1

  return (
    <div className="premium-card p-10 relative overflow-hidden group bg-white">
      {/* Background decoration */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000"
        style={{ backgroundColor: hero.colorHex || '#EF4444' }} />

      {/* Hero identity */}
      <div className="flex items-center gap-6 mb-12 relative z-10">
        <div className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-5xl bg-brand-offwhite border border-black/5 shadow-soft">
          {hero.icon}
        </div>
        <div>
          <h3 className="font-serif text-4xl text-brand-ink">
            {hero.name}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-muted mt-2">{hero.domain}</p>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest bg-brand-ink text-white">
              {hero.tiers[tierIdx]}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">{xp} XP Total</span>
          </div>
        </div>
      </div>

      {/* Tier track */}
      <div className="relative mb-12 z-10 pt-4 px-4">
        <div className="flex items-center justify-between mb-4 relative z-20">
          {hero.tiers.map((tier, i) => (
            <div key={tier} className="flex flex-col items-center gap-3 flex-1">
              <div className={clsx(
                'w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-1000 relative z-20',
                i <= tierIdx ? 'bg-brand-ink border-brand-ink text-white shadow-xl shadow-black/20' : 'bg-white border-black/5 text-brand-muted/20'
              )}>
                {i < tierIdx ? <Trophy size={20} /> : i === tierIdx ? <Star size={20} className="fill-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
              </div>
              <span className={clsx(
                "text-[10px] font-bold text-center uppercase tracking-widest px-1",
                i <= tierIdx ? "text-brand-ink" : "text-brand-muted/40"
              )}>
                {tier}
              </span>
            </div>
          ))}
        </div>
        {/* Connection line */}
        <div className="absolute top-[2.75rem] left-10 right-10 h-1 -z-10 bg-black/[0.03] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-ink transition-all duration-1000 ease-in-out"
            style={{ width: `${(tierIdx / (hero.tiers.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* XP to next tier */}
      <div className="relative z-10 max-w-xl mx-auto">
        {!atMax ? (
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-brand-muted">Advancing to {hero.tiers[tierIdx + 1]}</span>
              <span className="text-[10px] font-bold tracking-widest text-brand-ink">
                {current} / {needed} XP
              </span>
            </div>
            <XPBar pct={pct} height="h-2" showPct={false} />
          </div>
        ) : (
          <div className="text-center py-4 bg-brand-ink rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">
              Maximum Potential Achieved
            </p>
          </div>
        )}
      </div>

      <p className="text-sm italic mt-10 text-center text-brand-muted opacity-60">
        "{EVOLUTION_MESSAGES[tierIdx] || 'Destiny awaits.'}"
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
      <div className="premium-card p-10 text-center bg-white border-dashed border-black/10 opacity-60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">No habits assigned to this hero.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-8 text-center bg-white group">
          <p className="font-serif text-4xl text-brand-ink mb-1">{xp}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Current XP</p>
        </div>
        <div className="premium-card p-8 text-center bg-white group">
          <p className={clsx(
            "font-serif text-4xl mb-1",
            monthRate >= 80 ? "text-brand-mint" : monthRate >= 50 ? "text-brand-gold" : "text-brand-coral"
          )}>{monthRate}%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Monthly Success</p>
        </div>
        <div className="premium-card p-8 text-center bg-white group">
          <p className="font-serif text-4xl text-brand-ink mb-1">{topStreak.streak}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Best Streak</p>
        </div>
      </div>

      {/* Progress Log Header */}
      <div className="flex items-center justify-between">
        <h2 className="section-title">Habit Performance</h2>
        <div className="flex items-center gap-2">
           <Activity size={16} className="text-brand-coral" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Activity Logs</span>
        </div>
      </div>

      {/* Habit Details */}
      <div className="grid grid-cols-1 gap-8">
        {heroHabits.map(habit => {
          const streak = getHabitStreak(habit.id)
          const calData = getMonthCalendarData(habit.id)
          const done = calData.filter(d => d.done).length
          const pct = Math.round((done / calData.length) * 100)
          
          return (
            <div key={habit.id} className="premium-card p-10 bg-white group">
              <div className="flex items-start justify-between gap-6 mb-8">
                <div>
                  <h4 className="font-serif text-2xl text-brand-ink mb-2">{habit.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted bg-brand-offwhite px-3 py-1 rounded-lg">
                      {habit.frequency}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted opacity-50">
                      {done}/{calData.length} Days Tracked
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-serif text-3xl text-brand-ink">{pct}%</span>
                  {streak > 0 && <StreakBadge streak={streak} />}
                </div>
              </div>
              
              <div className="mb-8">
                <XPBar pct={pct} height="h-1.5" showPct={false} />
              </div>
              
              <div className="bg-brand-offwhite/50 p-6 rounded-[2rem] border border-black/5">
                <CalendarGrid data={calData} color="coral" compact />
              </div>
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center opacity-40">
        <Sparkles size={64} className="mb-6 text-brand-muted" />
        <p className="font-serif text-2xl text-brand-ink">Your Legion is Empty</p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Initialize your heroes in the selection chamber.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto page-enter pb-40">
      
      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">Character Development</p>
        <h1 className="font-serif text-5xl md:text-6xl text-brand-ink mb-4">Hero Legion.</h1>
        <p className="text-sm text-brand-muted max-w-xl leading-relaxed">
          Monitor the growth and evolution of your heroic roster. Each habit completed contributes to the ascension of your chosen champions.
        </p>
      </div>

      {/* Hero Selector */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {selectedHeroes.map(hero => {
          const xp = heroXP[hero.id] || 0
          const tierIdx = getTierIndex(xp)
          const isActive = hero.id === activeHeroId
          
          return (
            <button
              key={hero.id}
              onClick={() => setActiveHeroId(hero.id)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-5 px-6 py-4 rounded-3xl border transition-all duration-500 snap-start",
                isActive ? "bg-white border-brand-coral shadow-elevated" : "bg-brand-offwhite border-black/5 hover:border-black/10"
              )}
            >
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all",
                isActive ? "bg-brand-coral text-white" : "bg-white text-brand-muted opacity-40"
              )}>
                {hero.icon}
              </div>
              <div className="text-left pr-4">
                <p className={clsx(
                  "font-serif text-xl leading-none mb-1",
                  isActive ? "text-brand-ink" : "text-brand-muted"
                )}>
                  {hero.name}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted opacity-60">
                  {hero.tiers[tierIdx]}
                </p>
              </div>
              {isActive && <ChevronRight size={18} className="text-brand-coral" />}
            </button>
          )
        })}
      </div>

      {activeHero && (
        <div className="space-y-12 page-enter">
          {/* Main Progress Card */}
          <TierProgress
            hero={activeHero}
            xp={heroXP[activeHero.id] || 0}
          />

          {/* Detailed Stats */}
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
