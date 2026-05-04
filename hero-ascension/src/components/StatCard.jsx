import React from 'react'
import clsx from 'clsx'

export default function StatCard({ label, value, sub, icon, color = 'teal', className = '' }) {
  const colorMap = {
    teal:  { text: 'text-brand-teal',  bg: 'bg-brand-teal/10',  border: 'border-brand-teal/20' },
    rose:  { text: 'text-brand-rose',  bg: 'bg-brand-rose/10',  border: 'border-brand-rose/20' },
    gold:  { text: 'text-brand-gold',  bg: 'bg-brand-gold/10',  border: 'border-brand-gold/20' },
    mint:  { text: 'text-brand-mint',  bg: 'bg-brand-mint/10',  border: 'border-brand-mint/20' },
    coral: { text: 'text-brand-coral', bg: 'bg-brand-coral/10', border: 'border-brand-coral/20' },
    sky:   { text: 'text-brand-sky',   bg: 'bg-brand-sky/10',   border: 'border-brand-sky/20' },
  }

  const c = colorMap[color] || colorMap.teal

  return (
    <div className={clsx('premium-card p-6 flex flex-col justify-between h-full', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center border', c.bg, c.border, c.text)}>
          {icon}
        </div>
        {sub && (
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted bg-brand-offwhite px-2.5 py-1 rounded-lg">
            {sub}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-serif text-4xl mb-1">{value}</h3>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">{label}</p>
      </div>
    </div>
  )
}
