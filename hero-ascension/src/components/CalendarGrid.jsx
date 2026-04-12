import React from 'react'
import clsx from 'clsx'

const COLOR_DOT = {
  plasma: 'bg-cyan-400 shadow-[0_0_6px_rgba(0,245,255,0.7)]',
  ember:  'bg-orange-400 shadow-[0_0_6px_rgba(255,107,53,0.7)]',
  arcane: 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.7)]',
  gold:   'bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
  jade:   'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
  rose:   'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.7)]',
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
              'rounded flex items-center justify-center relative transition-all duration-200',
              compact ? 'w-5 h-5' : 'w-7 h-7',
              isFuture
                ? 'bg-void-900/40 border border-dashed border-white/10 text-slate-800'
                : done
                ? [COLOR_DOT[color], 'text-void-900']
                : 'bg-void-800/60 border border-white/5 text-slate-700',
              isToday && !done && 'border-white/30',
              isToday && 'ring-1 ring-offset-1 ring-offset-void-900 ring-white/20'
            )}
          >
            {!compact && (
              <span className={clsx('font-mono leading-none select-none', done ? 'text-void-950 font-bold text-xs' : 'text-slate-600 text-xs')}>
                {day}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
