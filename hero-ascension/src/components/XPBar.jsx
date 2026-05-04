import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function XPBar({ pct = 0, label, showPct = true, height = 'h-2.5', className = '' }) {
  const clampedPct = Math.min(100, Math.max(0, pct))

  return (
    <div className={className}>
      {(label || showPct) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">{label}</span>}
          {showPct && <span className="text-xs font-bold uppercase tracking-widest text-hero-accent">{clampedPct}%</span>}
        </div>
      )}
      <div className={clsx('relative w-full rounded-full bg-white/[0.05] overflow-hidden', height)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-hero-accent shadow-hero-glow"
        />
      </div>
    </div>
  )
}
