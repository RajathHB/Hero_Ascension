import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, CheckCircle2, Circle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function CalendarTodo() {
  const { calendarTodos, addCalendarTodo, toggleCalendarTodo, removeCalendarTodo, today } = useApp()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [newTitle, setNewTitle] = useState('')

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  // Build grid cells
  const cells = useMemo(() => {
    const arr = []
    for (let i = 0; i < firstDay; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      arr.push(ds)
    }
    return arr
  }, [year, month, firstDay, daysInMonth])

  const todosForSelected = calendarTodos[selectedDate] || []
  const doneCount = todosForSelected.filter(t => t.done).length

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addCalendarTodo(selectedDate, newTitle.trim())
    setNewTitle('')
  }

  const selectedLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Calendar Grid */}
      <div className="lg:col-span-3 glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-text transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-serif text-2xl text-hero-text">{monthLabel}</h3>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-hero-muted hover:text-hero-text transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-3">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold uppercase tracking-widest text-hero-muted py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((ds, i) => {
            if (!ds) return <div key={i} />
            const day = parseInt(ds.split('-')[2])
            const isToday = ds === today
            const isSelected = ds === selectedDate
            const todos = calendarTodos[ds] || []
            const hasTodos = todos.length > 0
            const allDone = hasTodos && todos.every(t => t.done)
            const hasPartial = hasTodos && !allDone

            return (
              <button
                key={ds}
                onClick={() => setSelectedDate(ds)}
                className={clsx(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 group",
                  isSelected ? "bg-hero-accent text-white shadow-hero-glow ring-2 ring-hero-accent/30" :
                  isToday ? "bg-hero-accent/5 text-hero-accent border border-hero-accent/20" :
                  "hover:bg-black/[0.03] text-hero-text"
                )}
              >
                <span className={clsx("text-sm font-bold", isSelected ? "text-white" : "")}>{day}</span>
                {hasTodos && (
                  <div className="flex gap-0.5 mt-0.5">
                    <div className={clsx(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-white/70" :
                      allDone ? "bg-green-500" : "bg-hero-accent"
                    )} />
                    {todos.length > 1 && (
                      <div className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white/40" :
                        hasPartial ? "bg-hero-accent/40" : "bg-green-500/40"
                      )} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Todo Panel for Selected Date */}
      <div className="lg:col-span-2 space-y-4">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-xl text-hero-text">{selectedLabel}</h3>
            {selectedDate === today && (
              <span className="text-xs font-bold uppercase tracking-widest text-hero-accent bg-hero-accent/5 px-2.5 py-1 rounded-md">Today</span>
            )}
          </div>
          {todosForSelected.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-4">
              {doneCount}/{todosForSelected.length} Completed
            </p>
          )}

          {/* Add Todo */}
          <form onSubmit={handleAdd} className="mb-5">
            <div className="relative">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add a task..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm text-hero-text placeholder-hero-muted/40 outline-none focus:border-hero-accent/30 transition-all"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-hero-accent text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
                <Plus size={18} />
              </button>
            </div>
          </form>

          {/* Todo List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {todosForSelected.map(todo => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={clsx(
                    "flex items-center gap-3 p-3.5 rounded-xl border transition-all group",
                    todo.done ? "bg-black/[0.01] border-black/[0.03]" : "bg-white border-black/[0.05]"
                  )}
                >
                  <button
                    onClick={() => toggleCalendarTodo(selectedDate, todo.id)}
                    className={clsx(
                      "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all",
                      todo.done ? "bg-hero-accent text-white" : "border-2 border-black/[0.08] hover:border-hero-accent/50"
                    )}
                  >
                    {todo.done && <span className="text-xs">✓</span>}
                  </button>
                  <span className={clsx(
                    "flex-1 text-sm transition-all",
                    todo.done ? "text-hero-muted line-through" : "text-hero-text font-medium"
                  )}>{todo.title}</span>
                  <button
                    onClick={() => removeCalendarTodo(selectedDate, todo.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-hero-muted opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {todosForSelected.length === 0 && (
              <div className="text-center py-10">
                <Calendar size={36} className="mx-auto mb-3 text-hero-muted/15" />
                <p className="text-hero-muted text-sm font-medium">No tasks for this day</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
