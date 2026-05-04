import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import clsx from 'clsx'
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Calendar as CalendarIcon,
  Zap,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Calendar() {
  const { habits, logs, streak, today } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calendar Logic
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const { grid, monthLabel } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const cells = []
    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      cells.push({ day: i, dateStr })
    }
    
    return { 
      grid: cells, 
      monthLabel: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' }) 
    }
  }, [year, month])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Heatmap Logic
  const getIntensity = (dateStr) => {
    if (!dateStr) return 0
    const dayLogs = Object.keys(logs).filter(k => k.endsWith(dateStr) && logs[k])
    if (dayLogs.length === 0) return 0
    const ratio = dayLogs.length / Math.max(habits.length, 1)
    if (ratio >= 0.8) return 4
    if (ratio >= 0.5) return 3
    if (ratio >= 0.2) return 2
    return 1
  }

  const intensityClasses = [
    'bg-black/[0.01] border-black/[0.03]',
    'bg-hero-accent/5 border-hero-accent/10',
    'bg-hero-accent/20 border-hero-accent/20',
    'bg-hero-accent/40 border-hero-accent/30',
    'bg-hero-accent border-hero-accent text-white shadow-hero-glow z-10'
  ]

  return (
    <div className="max-w-4xl mx-auto page-enter pb-40">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-hero-muted mb-2">Temporal Logs</p>
          <div className="flex items-center gap-4">
             <h1 className="font-serif text-5xl text-hero-text">Log.</h1>
             {streak > 0 && (
               <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-orange-600">
                 <Flame size={18} fill="currentColor" />
                 <span className="font-bold text-sm">{streak} Day Streak</span>
               </div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={goToToday} className="btn-glass px-6 py-3 text-sm uppercase tracking-widest">Today</button>
           <div className="flex items-center bg-black/[0.02] rounded-2xl border border-black/[0.05] overflow-hidden">
              <button onClick={prevMonth} className="p-4 hover:bg-black/[0.05] transition-colors border-r border-black/[0.05]">
                <ChevronLeft size={20} className="text-hero-muted" />
              </button>
              <span className="px-6 font-bold text-sm tracking-widest min-w-[180px] text-center text-hero-text">{monthLabel}</span>
              <button onClick={nextMonth} className="p-4 hover:bg-black/[0.05] transition-colors border-l border-black/[0.05]">
                <ChevronRight size={20} className="text-hero-muted" />
              </button>
           </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card p-4 md:p-8">
        <div className="grid grid-cols-7 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold uppercase tracking-[0.15em] text-hero-muted py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {grid.map((cell, i) => {
            const intensity = getIntensity(cell.dateStr)
            const isToday = cell.dateStr === today
            
            return (
              <div 
                key={i} 
                className={clsx(
                  "aspect-square rounded-2xl border flex flex-col items-center justify-center relative transition-all duration-500 group",
                  cell.day ? intensityClasses[intensity] : "opacity-0 pointer-events-none",
                  isToday && !intensity && "border-hero-accent/40 bg-hero-accent/[0.02]"
                )}
              >
                {cell.day && (
                  <>
                    <span className={clsx(
                      "text-sm font-bold transition-all",
                      intensity === 4 ? "text-white" : isToday ? "text-hero-accent" : "text-hero-muted"
                    )}>
                      {cell.day}
                    </span>
                    {isToday && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-hero-accent animate-ping" />
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-3 bg-white border border-black/[0.05] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 scale-90 group-hover:scale-100 shadow-xl">
                       <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-1">{cell.dateStr}</p>
                       <p className="text-xs font-bold text-hero-text">
                         {intensity > 0 ? `${intensity * 25}% Sync` : 'System Idle'}
                       </p>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-xs font-bold uppercase tracking-[0.15em] text-hero-muted">
         <div className="flex items-center gap-3">
            <span>Low Consistency</span>
            <div className="flex gap-1.5">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className={clsx("w-4 h-4 rounded-md border border-black/[0.02]", intensityClasses[i])} />
               ))}
            </div>
            <span>Elite Peak</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md border-2 border-hero-accent/40 bg-hero-accent/[0.02]" />
            <span>Mission Day (Today)</span>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-hero-accent/10 flex items-center justify-center text-hero-accent">
               <Zap size={32} />
            </div>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-1">Peak Sync</p>
               <p className="text-2xl font-serif text-hero-text">Ultra-Focus</p>
               <p className="text-sm text-hero-muted mt-1">Consistency above 85% this cycle</p>
            </div>
         </div>
         <div className="glass-panel p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-600">
               <CalendarIcon size={32} />
            </div>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-1">Sync History</p>
               <p className="text-2xl font-serif text-hero-text">{grid.filter(c => getIntensity(c.dateStr) > 0).length} Days</p>
               <p className="text-sm text-hero-muted mt-1">Confirmed mission activity</p>
            </div>
         </div>
      </div>
    </div>
  )
}
