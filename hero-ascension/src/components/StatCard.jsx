import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, sub, icon, color = 'plasma', className = '' }) {
  const colorMap = {
    plasma: { text: 'text-plasma-400', bg: '', border: '' },
    ember:  { text: 'text-ember-400', bg: '', border: '' },
    arcane: { text: 'text-arcane-400', bg: '', border: '' },
    gold:   { text: 'text-gold-400', bg: '', border: '' },
    jade:   { text: 'text-jade-400', bg: '', border: '' },
    rose:   { text: 'text-rose-400', bg: '', border: '' },
  }

  const c = colorMap[color] || colorMap.plasma

  return (
    <div className={clsx('glass-card p-4', className)}>
      {icon && (
        <div className="mb-2 text-xl">{icon}</div>
      )}
      <p className="font-display text-3xl leading-none mb-1">
        <span className={c.text}>{value}</span>
      </p>
      <p className="font-mono text-xs uppercase tracking-wider" style={{ color: '#9E9A8C' }}>{label}</p>
      {sub && <p className="font-body text-xs mt-1" style={{ color: '#C4BFAE' }}>{sub}</p>}
    </div>
  )
}
