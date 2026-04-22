import React from 'react'
import clsx from 'clsx'

const COLOR_DOT = {
  plasma: 'bg-teal-400',
  ember:  'bg-orange-400',
  arcane: 'bg-purple-400',
  gold:   'bg-yellow-400',
  jade:   'bg-emerald-400',
  rose:   'bg-rose-400',
}

export default function CalendarGrid({ data = [], color = 'plasma', compact = false }) {
  return (
    <div className={clsx('flex flex-wrap', compact ? 'gap-1' : 'gap-1.5')}>
      {data.map(({ date, done, isToday, isFuture }) => {
        const day = new Date(date + 'T00:00:00').getDate()
        return (
          <div
            key={date}
            title={`${date} — ${isFuture ? 'Upcoming' : done ? 'Done ✓' : 'Missed'}`}
            className={clsx(
              'rounded-lg flex items-center justify-center relative transition-all duration-200',
              compact ? 'w-5 h-5' : 'w-7 h-7',
              isFuture
                ? 'border border-dashed text-transparent'
                : done
                ? [COLOR_DOT[color], 'text-white']
                : 'text-transparent',
              isToday && 'ring-2 ring-offset-1 ring-offset-cream-50'
            )}
            style={{
              ...(isFuture
                ? { background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.08)' }
                : done
                ? {}
                : { background: 'rgba(0,0,0,0.04)' }),
              ...(isToday ? { ringColor: 'rgba(42,157,143,0.3)' } : {}),
            }}
          >
            {!compact && (
              <span className={clsx('font-mono leading-none select-none text-xs', done ? 'text-white font-bold' : '')}
                style={!done ? { color: '#C4BFAE' } : {}}>
                {day}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
