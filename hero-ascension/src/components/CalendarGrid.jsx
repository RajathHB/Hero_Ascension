import React from 'react'
import clsx from 'clsx'

const COLOR_MAP = {
  teal:  'bg-brand-teal',
  rose:  'bg-brand-rose',
  gold:  'bg-brand-gold',
  mint:  'bg-brand-mint',
  coral: 'bg-brand-coral',
  sky:   'bg-brand-sky',
}

export default function CalendarGrid({ data = [], color = 'coral', compact = false }) {
  const dotColor = COLOR_MAP[color] || COLOR_MAP.coral

  return (
    <div className={clsx('flex flex-wrap', compact ? 'gap-1' : 'gap-2')}>
      {data.map(({ date, done, isToday, isFuture }) => {
        const day = new Date(date + 'T00:00:00').getDate()
        return (
          <div
            key={date}
            title={`${date} — ${isFuture ? 'Upcoming' : done ? 'Completed' : 'Not completed'}`}
            className={clsx(
              'rounded-lg flex items-center justify-center relative transition-all duration-500',
              compact ? 'w-6 h-6' : 'w-9 h-9',
              isFuture
                ? 'border border-dashed border-black/10 text-brand-muted/20'
                : done
                ? [dotColor, 'text-white shadow-lg shadow-black/5']
                : 'bg-brand-offwhite border border-black/5 text-brand-muted/40',
              isToday && !done && 'ring-2 ring-brand-coral/40 ring-offset-2 ring-offset-brand-cream'
            )}
          >
            {!compact && (
              <span className={clsx('text-[10px] font-bold leading-none select-none', done ? 'text-white' : 'text-brand-muted/60')}>
                {day}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
