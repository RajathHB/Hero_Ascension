import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Helper to format Date to YYYY-MM-DD local string
const toLocalDateStr = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DateRangePicker({ 
  startDate, // String YYYY-MM-DD
  endDate,   // String YYYY-MM-DD
  onChange,  // (startStr, endStr) => void
  accentColor = '#2A9D8F' 
}) {
  const [viewDate, setViewDate] = useState(() => {
    return startDate ? new Date(startDate + 'T00:00:00') : new Date()
  })

  // Calendar math
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sunday

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const handleDayClick = (day) => {
    const clickedDateStr = toLocalDateStr(new Date(year, month, day))
    
    // Logic: 
    // 1. If nothing is selected, select start.
    // 2. If start is selected but no end, and clicked is AFTER start, select end.
    // 3. Otherwise (both selected, or clicked is BEFORE start), start over with new start.
    if (!startDate || (startDate && endDate) || clickedDateStr < startDate) {
      onChange(clickedDateStr, '')
    } else {
      onChange(startDate, clickedDateStr)
    }
  }

  // Generation of day grid
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null) // Empty slots for shift
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-black/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-warm-500">
          <ChevronLeft size={18} />
        </button>
        <div className="font-title tracking-widest text-lg" style={{ color: '#3D3A32' }}>
          {monthNames[month]} {year}
        </div>
        <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-warm-500">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center font-body text-[10px] uppercase text-warm-400 font-bold tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />

          const currentDateStr = toLocalDateStr(new Date(year, month, day))
          const isStart = currentDateStr === startDate
          const isEnd = currentDateStr === endDate
          const isSelected = isStart || isEnd
          const inRange = startDate && endDate && currentDateStr > startDate && currentDateStr < endDate

          // Styling logic for the elegant pill shape across ranges
          let bgClass = "bg-transparent"
          let textClass = "text-warm-800"
          let roundedClass = "rounded-xl" // Default

          if (isSelected) {
            bgClass = "" // Replaced by inline style for accent color
            textClass = "text-white font-bold"
            if (isStart && endDate) roundedClass = "rounded-l-xl rounded-r-none"
            if (isEnd && startDate) roundedClass = "rounded-r-xl rounded-l-none"
          } else if (inRange) {
             textClass = "text-warm-800 font-medium"
             roundedClass = "rounded-none"
          }

          return (
            <div key={day} className="relative flex justify-center py-0.5">
               {/* Background range spanning indicator */}
              {(inRange || (isStart && endDate) || (isEnd && startDate)) && (
                  <div 
                    className={`absolute inset-0 top-0.5 bottom-0.5 ${isStart ? 'left-1/2' : ''} ${isEnd ? 'right-1/2' : ''}`}
                    style={{ background: `${accentColor}15` }} 
                  />
              )}
              
              {/* Actual button */}
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={`relative z-10 w-8 h-8 flex items-center justify-center text-sm font-body transition-all ${roundedClass} ${textClass} hover:scale-110`}
                style={isSelected ? { background: accentColor, boxShadow: `0 4px 12px ${accentColor}40` } : {}}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>

      {/* Helper text prompt underneath */}
      <div className="mt-4 text-center">
        <span className="font-body text-[10px] tracking-widest uppercase py-1 px-3 rounded-full" 
              style={{ background: 'rgba(0,0,0,0.03)', color: '#9E9A8C' }}>
          {!startDate ? 'Select a start date' : !endDate ? 'Select an end date' : 'Range selected'}
        </span>
      </div>
    </div>
  )
}
