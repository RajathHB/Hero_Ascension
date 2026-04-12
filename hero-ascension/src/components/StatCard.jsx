import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, sub, icon, color = 'plasma', className = '' }) {
  const colorMap = {
    plasma: { text: 'text-cyan-400', bg: 'bg-cyan-400/8', border: 'border-cyan-400/15' },
    ember:  { text: 'text-orange-400', bg: 'bg-orange-400/8', border: 'border-orange-400/15' },
    arcane: { text: 'text-purple-400', bg: 'bg-purple-400/8', border: 'border-purple-400/15' },
    gold:   { text: 'text-yellow-400', bg: 'bg-yellow-400/8', border: 'border-yellow-400/15' },
    jade:   { text: 'text-emerald-400', bg: 'bg-emerald-400/8', border: 'border-emerald-400/15' },
    rose:   { text: 'text-rose-400', bg: 'bg-rose-400/8', border: 'border-rose-400/15' },
  }

  const c = colorMap[color] || colorMap.plasma

  return (
    <div className={clsx('glass-card p-4 border', c.border, c.bg, className)}>
      {icon && (
        <div className="mb-2 text-xl">{icon}</div>
      )}
      <p className="font-display text-3xl leading-none mb-1" style={{ color: 'inherit' }}>
        <span className={c.text}>{value}</span>
      </p>
      <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      {sub && <p className="font-body text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  )
}
