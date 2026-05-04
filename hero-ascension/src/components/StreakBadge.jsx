import React from 'react'
import clsx from 'clsx'
import { Flame, Zap, Shield } from 'lucide-react'

export default function StreakBadge({ streak = 0, size = 'sm' }) {
  const hot = streak >= 7
  const elite = streak >= 14

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-xl font-bold leading-none backdrop-blur-sm',
      size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
      elite ? 'bg-hero-accent/20 text-white border border-hero-accent/30 shadow-hero-glow' : 
      hot ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
      'bg-white/5 text-hero-muted border border-white/5'
    )}>
      {elite ? <Zap size={14} className="fill-current text-hero-accent" /> : 
       hot ? <Flame size={14} className="fill-current text-orange-400" /> : 
       <Shield size={12} className="text-hero-muted" />}
      <span className="uppercase tracking-[0.15em]">{streak}D Streak</span>
    </span>
  )
}
