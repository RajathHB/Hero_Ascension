import React from 'react'
import clsx from 'clsx'
import { Check } from 'lucide-react'

export default function HeroCard({ hero, selected, onClick, compact = false }) {
  if (compact) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
          'glass-card',
          selected ? 'shadow-md' : 'hover:shadow-sm',
          onClick && 'cursor-pointer'
        )}
        style={selected ? { borderColor: `${hero.colorHex}40` } : {}}
        onClick={onClick}
      >
        <span className="text-2xl">{hero.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display tracking-wide text-lg leading-none" style={{ color: hero.colorHex }}>{hero.name}</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: '#9E9A8C' }}>{hero.domain}</p>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: hero.colorHex, color: '#fff' }}>
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
        selected ? 'shadow-elevated' : 'hover:shadow-card',
      )}
      style={{
        background: selected ? `${hero.colorHex}08` : 'rgba(255,255,255,0.7)',
        borderColor: selected ? `${hero.colorHex}50` : 'rgba(0,0,0,0.06)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none"
        style={{
          background: hero.colorHex,
          opacity: selected ? 0.08 : 0,
          filter: 'blur(40px)',
        }} />

      {/* Selection indicator */}
      <div className={clsx(
        'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
      )}
        style={selected
          ? { background: hero.colorHex, borderColor: 'transparent', color: '#fff' }
          : { borderColor: 'rgba(0,0,0,0.12)', background: 'transparent' }
        }>
        {selected && <Check size={13} strokeWidth={3} />}
      </div>

      {/* Icon */}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-3xl transition-all duration-300 border"
        style={{
          background: selected ? `${hero.colorHex}12` : 'rgba(0,0,0,0.02)',
          borderColor: selected ? `${hero.colorHex}25` : 'rgba(0,0,0,0.05)',
        }}>
        {hero.icon}
      </div>

      {/* Content */}
      <h3 className="font-display text-2xl tracking-wide mb-0.5" style={{ color: selected ? hero.colorHex : '#3D3A32' }}>
        {hero.name}
      </h3>
      <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#9E9A8C' }}>
        {hero.domain}
      </p>
      <p className="font-body text-sm leading-relaxed" style={{ color: '#7A7668' }}>
        {hero.tagline}
      </p>

      {/* Tier preview */}
      <div className="flex gap-1.5 mt-4">
        {hero.tiers.map((tier, i) => (
          <div
            key={tier}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i === 0 ? hero.colorHex : 'rgba(0,0,0,0.08)',
              opacity: i === 0 ? (selected ? 1 : 0.5) : 0.4,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-xs mt-1.5 transition-colors"
        style={{ color: selected ? hero.colorHex : '#C4BFAE' }}>
        START: {hero.tiers[0].toUpperCase()}
      </p>
    </div>
  )
}
