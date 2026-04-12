import React from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'

export default function HeroCard({ hero, selected, onClick, compact = false }) {
  const colorMap = {
    plasma: { border: 'border-cyan-400/60', glow: 'shadow-plasma', text: 'text-cyan-400', bg: 'bg-cyan-400/10', check: 'bg-cyan-400 text-void-900' },
    ember:  { border: 'border-orange-400/60', glow: 'shadow-ember', text: 'text-orange-400', bg: 'bg-orange-400/10', check: 'bg-orange-400 text-void-900' },
    arcane: { border: 'border-purple-400/60', glow: 'shadow-arcane', text: 'text-purple-400', bg: 'bg-purple-400/10', check: 'bg-purple-400 text-void-900' },
    gold:   { border: 'border-yellow-400/60', glow: 'shadow-gold', text: 'text-yellow-400', bg: 'bg-yellow-400/10', check: 'bg-yellow-400 text-void-900' },
    jade:   { border: 'border-emerald-400/60', glow: 'shadow-jade', text: 'text-emerald-400', bg: 'bg-emerald-400/10', check: 'bg-emerald-400 text-void-900' },
    rose:   { border: 'border-rose-400/60', glow: '', text: 'text-rose-400', bg: 'bg-rose-400/10', check: 'bg-rose-400 text-void-900' },
  }

  const c = colorMap[hero.color] || colorMap.plasma

  if (compact) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
          'glass-card',
          selected ? [c.border, c.glow] : 'border-white/5 hover:border-white/10',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <span className="text-2xl">{hero.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={clsx('font-display tracking-wide text-lg leading-none', c.text)}>{hero.name}</p>
          <p className="font-mono text-xs text-slate-500 mt-0.5">{hero.domain}</p>
        </div>
        {selected && (
          <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', c.check)}>
            <Check size={11} strokeWidth={3} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden group',
        onClick && 'cursor-pointer',
        selected
          ? [c.border, c.glow, c.bg]
          : 'border-white/8 bg-void-800/60 hover:border-white/20',
      )}
    >
      {/* Background decoration */}
      <div className={clsx(
        'absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300',
        selected ? 'opacity-20' : 'opacity-0 group-hover:opacity-10',
        c.bg
      )} style={{ background: hero.colorHex, filter: 'blur(40px)' }} />

      {/* Selection indicator */}
      <div className={clsx(
        'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
        selected ? [c.check, 'border-transparent'] : 'border-white/20 bg-transparent'
      )}>
        {selected && <Check size={13} strokeWidth={3} />}
      </div>

      {/* Icon */}
      <div className={clsx(
        'w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-3xl transition-all duration-300',
        selected ? c.bg : 'bg-void-900/60',
        'border',
        selected ? c.border : 'border-white/5'
      )}>
        {hero.icon}
      </div>

      {/* Content */}
      <h3 className={clsx('font-display text-2xl tracking-wide mb-0.5', selected ? c.text : 'text-slate-300')}>
        {hero.name}
      </h3>
      <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-3">
        {hero.domain}
      </p>
      <p className="font-body text-sm text-slate-400 leading-relaxed">
        {hero.tagline}
      </p>

      {/* Tier preview */}
      <div className="flex gap-1.5 mt-4">
        {hero.tiers.map((tier, i) => (
          <div
            key={tier}
            className={clsx(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i === 0 ? (selected ? `opacity-100` : 'opacity-40') : 'opacity-15'
            )}
            style={{ background: i === 0 ? hero.colorHex : '#334155' }}
          />
        ))}
      </div>
      <p className={clsx('font-mono text-xs mt-1.5 transition-colors', selected ? c.text : 'text-slate-600')}>
        START: {hero.tiers[0].toUpperCase()}
      </p>
    </div>
  )
}
