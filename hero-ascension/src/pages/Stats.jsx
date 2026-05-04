import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { HABIT_CATEGORIES } from '../data/categories'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip as RTooltip } from 'recharts'
import { motion } from 'framer-motion'
import { Award, Flame, TrendingUp, Shield, Star, Zap, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

export default function Stats() {
  const { xp, level, levelProgress, streak, habits, logs, selectedHero, today } = useApp()
  const navigate = useNavigate()

  if (!selectedHero) return null

  // Weekly activity (last 7 days)
  const weeklyData = useMemo(() => {
    const days = []
    const t = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(t); d.setDate(d.getDate() - i)
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const done = Object.keys(logs).filter(k => k.endsWith(ds) && logs[k]).length
      days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), count: done })
    }
    return days
  }, [logs])

  // Category distribution
  const catData = useMemo(() => {
    const counts = {}
    habits.forEach(h => { counts[h.category] = (counts[h.category] || 0) + 1 })
    return HABIT_CATEGORIES.filter(c => counts[c.id]).map(c => ({ ...c, count: counts[c.id] }))
  }, [habits])

  // Evolution
  const stages = ['Beginner', 'Warrior', 'Elite', 'Legend']
  const stageIdx = Math.min(Math.floor(level / 5), 3)

  return (
    <div className="max-w-3xl mx-auto page-enter pb-20">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-hero-muted hover:text-hero-text transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 className="font-serif text-4xl text-hero-text mb-8">Stats</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Level', value: level, icon: Shield, color: 'text-hero-accent' },
          { label: 'Total XP', value: xp, icon: Zap, color: 'text-hero-accent' },
          { label: 'Streak', value: `${streak}d`, icon: Flame, color: 'text-orange-500' },
          { label: 'Habits', value: habits.length, icon: Award, color: 'text-yellow-500' },
        ].map(s => (
          <div key={s.label} className="glass-card p-6 text-center">
            <s.icon size={22} className={clsx(s.color, "mx-auto mb-2")} />
            <p className="font-serif text-3xl text-hero-text">{s.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* XP Progress */}
      <div className="glass-card p-6 mb-8 flex items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-black/[0.04]" />
            <motion.circle initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 - (264 * levelProgress.pct) / 100 }}
              cx="48" cy="48" r="42" stroke="var(--hero-accent)" strokeWidth="5" strokeDasharray="264" fill="transparent" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-hero-text">{levelProgress.pct}%</span>
          </div>
        </div>
        <div>
          <p className="font-serif text-2xl text-hero-text mb-1">Level {level} → {level + 1}</p>
          <p className="text-sm text-hero-muted">{levelProgress.current} / {levelProgress.needed} XP needed</p>
          <div className="flex gap-3 mt-3">
            {stages.map((s, i) => (
              <span key={s} className={clsx("text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md",
                i === stageIdx ? "bg-hero-accent/10 text-hero-accent" : "text-hero-muted/40")}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-6">7-Day Activity</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} />
              <RTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ backgroundColor: '#FFF', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }} />
              <Bar dataKey="count" fill="var(--hero-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="glass-card p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-5">Category Mix</h2>
        <div className="space-y-3">
          {catData.map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-lg w-7">{c.icon}</span>
              <span className="text-sm font-bold text-hero-text w-28">{c.label}</span>
              <div className="flex-1 h-2.5 bg-black/[0.03] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(c.count / habits.length) * 100}%`, backgroundColor: c.color }} />
              </div>
              <span className="text-sm font-bold text-hero-muted w-6 text-right">{c.count}</span>
            </div>
          ))}
          {catData.length === 0 && <p className="text-center py-6 text-hero-muted/40 text-base italic">No habits yet</p>}
        </div>
      </div>
    </div>
  )
}
