import React from 'react'
import clsx from 'clsx'

const COLOR_MAP = {
  plasma: { fill: 'from-cyan-600 to-cyan-400', glow: 'shadow-[0_0_8px_rgba(0,245,255,0.6)]', text: 'text-cyan-400' },
  ember:  { fill: 'from-orange-600 to-orange-400', glow: 'shadow-[0_0_8px_rgba(255,107,53,0.6)]', text: 'text-orange-400' },
  arcane: { fill: 'from-purple-600 to-purple-400', glow: 'shadow-[0_0_8px_rgba(192,132,252,0.6)]', text: 'text-purple-400' },
  gold:   { fill: 'from-yellow-600 to-yellow-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]', text: 'text-yellow-400' },
  jade:   { fill: 'from-emerald-600 to-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.6)]', text: 'text-emerald-400' },
  rose:   { fill: 'from-rose-600 to-rose-400', glow: 'shadow-[0_0_8px_rgba(251,113,133,0.6)]', text: 'text-rose-400' },
}

export default function XPBar({ pct = 0, color = 'plasma', label, showPct = true, height = 'h-2', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.plasma
  const clampedPct = Math.min(100, Math.max(0, pct))

  return (
    <div className={className}>
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">{label}</span>}
          {showPct && <span className={clsx('font-mono text-xs font-bold', c.text)}>{clampedPct}%</span>}
        </div>
      )}
      <div className={clsx('relative w-full rounded-full overflow-hidden', height, 'bg-void-800/80 border border-white/5')}>
        <div
          className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out', c.fill, c.glow)}
          style={{ width: `${clampedPct}%` }}
        />
        {/* Shimmer effect */}
        {clampedPct > 5 && (
          <div
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ marginLeft: `${clampedPct - 8}%`, transition: 'margin 0.7s ease-out' }}
          />
        )}
      </div>
    </div>
  )
}
