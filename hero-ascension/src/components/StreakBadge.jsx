import React from 'react'
import clsx from 'clsx'

export default function StreakBadge({ streak = 0, size = 'sm' }) {
  const hot = streak >= 7
  const fire = streak >= 14

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-lg font-mono font-bold leading-none',
      size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      fire
        ? 'text-ember-400'
        : hot
        ? 'text-gold-400'
        : ''
    )}
      style={{
        background: fire ? 'rgba(231,111,81,0.1)' : hot ? 'rgba(233,196,106,0.1)' : 'rgba(0,0,0,0.04)',
        border: fire ? '1px solid rgba(231,111,81,0.2)' : hot ? '1px solid rgba(233,196,106,0.2)' : '1px solid rgba(0,0,0,0.06)',
        color: fire ? '#E76F51' : hot ? '#D4A843' : '#9E9A8C',
      }}
    >
      {fire ? '🔥' : hot ? '⚡' : '○'}
      <span>{streak}d</span>
    </span>
  )
}
