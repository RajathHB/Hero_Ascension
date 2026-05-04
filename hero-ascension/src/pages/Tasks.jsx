import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Inbox,
  Sparkles,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Tasks() {
  const { tasks, addTask, toggleTask, removeTask } = useApp()
  const [newTitle, setNewTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addTask(newTitle)
    setNewTitle('')
  }

  const completedCount = tasks.filter(t => t.completed).length
  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="max-w-2xl mx-auto page-enter pb-40">
      
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-hero-muted mb-2">System Inbox</p>
        <h1 className="font-serif text-5xl text-hero-text">Inbox.</h1>
        <p className="text-hero-muted text-base mt-3 font-medium">Capture temporary mission parameters and ideas.</p>
      </div>

      {/* Task Input */}
      <form onSubmit={handleSubmit} className="mb-12">
        <div className="relative group">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new mission task..."
            className="input-hero py-6 pr-20 text-lg shadow-sm"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-hero-accent text-white flex items-center justify-center shadow-hero-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 mb-8 px-4">
         <div className="flex items-center gap-2">
            <Zap size={16} className="text-hero-accent" />
            <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">Pending: <span className="text-hero-text">{pendingTasks.length}</span></span>
         </div>
         <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-hero-muted" />
            <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">Completed: <span className="text-hero-text">{completedCount}</span></span>
         </div>
      </div>

      {/* Task List */}
      <div className="space-y-12">
        {/* Pending */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {pendingTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card-hover p-5 flex items-center gap-4 group bg-white"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="w-7 h-7 rounded-lg border-2 border-black/[0.05] flex items-center justify-center hover:border-hero-accent/50 transition-colors"
                >
                  <Circle size={14} className="text-transparent" />
                </button>
                <p className="flex-1 text-hero-text font-medium text-base">{task.title}</p>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="w-10 h-10 rounded-xl bg-black/[0.02] flex items-center justify-center text-hero-muted opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all border border-black/[0.03]"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-black/[0.05] rounded-[2rem] bg-black/[0.01]">
               <Inbox size={48} className="mx-auto mb-4 text-hero-muted opacity-20" />
               <p className="text-hero-muted font-medium text-base italic">Inbox zero. Mind at peak efficiency.</p>
            </div>
          )}
        </div>

        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-black/[0.05]">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-hero-muted px-4">Recently Accomplished</h3>
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="glass-card p-5 flex items-center gap-4 opacity-40 grayscale bg-black/[0.01]"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className="w-7 h-7 rounded-lg bg-hero-accent flex items-center justify-center"
                >
                  <CheckCircle2 size={16} className="text-white" />
                </button>
                <p className="flex-1 text-hero-text font-medium text-base line-through">{task.title}</p>
                <button 
                  onClick={() => removeTask(task.id)}
                  className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center text-hero-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bonus Tip */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-8 glass-panel bg-hero-accent/[0.03] border-hero-accent/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-hero-accent" />
        <div className="flex gap-4">
           <div className="w-11 h-11 rounded-xl bg-hero-accent/10 flex items-center justify-center text-hero-accent flex-shrink-0">
              <Sparkles size={22} />
           </div>
           <div>
              <p className="text-base font-bold text-hero-text mb-2">Protocol Tip</p>
              <p className="text-sm text-hero-muted leading-relaxed">
                 Use the inbox for capturing ideas as they emerge. Once verified, elevate critical items 
                 to long-term objectives or habit rituals.
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  )
}
