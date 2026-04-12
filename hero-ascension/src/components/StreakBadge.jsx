import React from 'react'
import clsx from 'clsx'

export default function StreakBadge({ streak = 0, size = 'sm' }) {
  const hot = streak >= 7
  const fire = streak >= 14

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded font-mono font-bold leading-none',
      size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      fire
        ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
        : hot
        ? 'bg-yellow-500/15 border border-yellow-500/30 text-yellow-400'
        : 'bg-slate-800/60 border border-slate-700/60 text-slate-500'
    )}>
      {fire ? '🔥' : hot ? '⚡' : '○'}
      <span>{streak}d</span>
    </span>
  )
}
