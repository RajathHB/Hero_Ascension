import React from 'react'
import clsx from 'clsx'

const COLOR_MAP = {
  plasma: { fill: 'from-teal-500 to-teal-400', glow: '', text: 'text-plasma-400' },
  ember:  { fill: 'from-orange-500 to-orange-400', glow: '', text: 'text-ember-400' },
  arcane: { fill: 'from-purple-500 to-purple-400', glow: '', text: 'text-arcane-400' },
  gold:   { fill: 'from-yellow-500 to-yellow-400', glow: '', text: 'text-gold-400' },
  jade:   { fill: 'from-emerald-500 to-emerald-400', glow: '', text: 'text-jade-400' },
  rose:   { fill: 'from-rose-500 to-rose-400', glow: '', text: 'text-rose-400' },
}

export default function XPBar({ pct = 0, color = 'plasma', label, showPct = true, height = 'h-2', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.plasma
  const clampedPct = Math.min(100, Math.max(0, pct))

  return (
    <div className={className}>
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#9E9A8C' }}>{label}</span>}
          {showPct && <span className={clsx('font-mono text-xs font-bold', c.text)}>{clampedPct}%</span>}
        </div>
      )}
      <div className={clsx('relative w-full rounded-full overflow-hidden', height)}
        style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', c.fill)}
          style={{ width: `${clampedPct}%` }}
        />
        {/* Shimmer effect */}
        {clampedPct > 5 && (
          <div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ marginLeft: `${clampedPct - 8}%`, transition: 'margin 0.7s ease-out' }}
          />
        )}
      </div>
    </div>
  )
}
