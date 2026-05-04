import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function HeroCard({ hero, selected, onClick, compact = false }) {
  if (compact) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300',
          'bg-white',
          selected ? 'border-brand-coral ring-4 ring-brand-coral/5 shadow-card' : 'border-black/5 hover:border-black/10',
          onClick && 'cursor-pointer'
        )}
        onClick={onClick}
      >
        <span className="text-3xl">{hero.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-lg leading-none text-brand-ink">{hero.name}</p>
          <p className="text-xs uppercase font-bold tracking-widest mt-1 text-brand-muted">{hero.domain}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-brand-coral flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5 }}
      className={clsx(
        'relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden group h-full',
        onClick && 'cursor-pointer',
        selected ? 'bg-white border-brand-coral ring-8 ring-brand-coral/5 shadow-elevated' : 'bg-white border-black/[0.03] shadow-card hover:shadow-elevated hover:border-black/[0.08]'
      )}
    >
      {/* Background decoration */}
      <div className={clsx(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] transition-opacity duration-500 pointer-events-none",
        selected ? "opacity-20" : "opacity-0 group-hover:opacity-10"
      )}
      style={{ background: hero.glowColor || '#EF4444' }} />

      {/* Selection Icon */}
      <div className={clsx(
        "absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
        selected ? "bg-brand-coral border-brand-coral scale-110" : "border-black/5"
      )}>
        {selected && <Check size={16} className="text-white" />}
      </div>

      {/* Icon Container */}
      <div className={clsx(
        "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 text-4xl transition-all duration-500 border relative z-10",
        selected ? "bg-brand-coral/10 border-brand-coral/20 rotate-6" : "bg-brand-offwhite border-black/5"
      )}>
        {hero.icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2 text-brand-muted">
          {hero.domain}
        </p>
        <h3 className="font-serif text-3xl mb-3 text-brand-ink">
          {hero.name}
        </h3>
        <p className="text-sm leading-relaxed text-brand-muted/80">
          {hero.tagline}
        </p>

        {/* Divider */}
        <div className="h-px bg-black/[0.03] my-6" />

        {/* Tier preview */}
        <div className="flex gap-1.5 mb-2">
          {hero.tiers.map((tier, i) => (
            <div
              key={tier}
              className={clsx(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                i === 0 ? (selected ? "bg-brand-coral" : "bg-brand-ink") : "bg-black/[0.05]"
              )}
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">
            Initial: {hero.tiers[0]}
          </p>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity">
            Select Hero
          </p>
        </div>
      </div>
    </motion.div>
  )
}
