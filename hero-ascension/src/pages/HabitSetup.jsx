import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { 
  Zap, 
  Target, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ChevronRight,
  Shield,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function HabitSetup() {
  const { selectedHero, habits, addHabit, removeHabit, goals, addGoal, setOnboarded } = useApp()
  const navigate = useNavigate()
  
  const [tab, setTab] = useState('habits')
  const [habitTitle, setHabitTitle] = useState('')
  const [selectedTrait, setSelectedTrait] = useState('Discipline')
  const [goalForm, setGoalForm] = useState({ title: '', durationType: 'week' })
  const [saved, setSaved] = useState(false)

  if (!selectedHero) {
    navigate('/select-heroes')
    return null
  }

  const handleAddHabit = (title) => {
    const t = (title || habitTitle).trim()
    if (!t) return
    addHabit(t, selectedTrait)
    setHabitTitle('')
  }

  const handleAddGoal = () => {
    if (!goalForm.title.trim()) return
    addGoal(goalForm)
    setGoalForm({ title: '', durationType: 'week' })
  }

  const handleFinish = () => {
    setSaved(true)
    setTimeout(() => {
      setOnboarded(true)
      navigate('/dashboard')
    }, 1500)
  }

  const templates = [
    "Early Morning Discipline",
    "Heroic Meditation",
    "Daily Tech Learning",
    "Physical Conditioning",
    "Strategic Planning"
  ]

  return (
    <div className="min-h-screen bg-hero-bg text-hero-text p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-hero-muted mb-4">Protocol Initialization</p>
            <h1 className="font-serif text-5xl md:text-6xl text-hero-text leading-tight">
              Establish your <br /><span className="italic text-hero-accent">Rituals.</span>
            </h1>
          </div>
          <div className="flex gap-4">
             <div className={clsx(
               "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
               tab === 'habits' ? "bg-hero-accent text-white shadow-hero-glow" : "bg-white text-hero-muted border border-black/[0.05]"
             )} onClick={() => setTab('habits')}>1. Habits</div>
             <div className={clsx(
               "px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
               tab === 'goals' ? "bg-hero-accent text-white shadow-hero-glow" : "bg-white text-hero-muted border border-black/[0.05]"
             )} onClick={() => setTab('goals')}>2. Objectives</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Progress Tracker Left */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-8 bg-white shadow-xl border-white">
               <div className="w-16 h-16 rounded-2xl bg-hero-accent/5 border border-hero-accent/10 flex items-center justify-center text-4xl mb-6">
                  {selectedHero.icon}
               </div>
               <h2 className="font-serif text-2xl text-hero-text mb-2">{selectedHero.name}</h2>
               <p className="text-xs text-hero-muted font-medium mb-8">Synchronizing protocols for {selectedHero.trait} archetype...</p>
               
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all", habits.length > 0 ? "bg-hero-accent text-white" : "bg-black/[0.03] text-hero-muted")}>
                        {habits.length > 0 ? <Check size={16} /> : "1"}
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">Habit Protocols</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all", goals.length > 0 ? "bg-hero-accent text-white" : "bg-black/[0.03] text-hero-muted")}>
                        {goals.length > 0 ? <Check size={16} /> : "2"}
                     </div>
                     <span className="text-[10px] font-bold uppercase tracking-widest">Growth Objectives</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Configuration Area Right */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {tab === 'habits' ? (
                <motion.div 
                  key="habits"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="glass-card p-10 bg-white shadow-xl border-white">
                    <h3 className="font-serif text-2xl text-hero-text mb-8">Daily Habit Protocols</h3>
                    
                    <div className="flex flex-col md:flex-row gap-4 mb-10">
                       <div className="flex-1 relative group">
                          <input
                            value={habitTitle}
                            onChange={e => setHabitTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                            placeholder="E.g., Read for 30 minutes..."
                            className="input-hero py-6 pr-20 shadow-sm"
                          />
                          <button 
                            onClick={() => handleAddHabit()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-hero-accent text-white flex items-center justify-center shadow-hero-glow hover:scale-105 active:scale-95 transition-all"
                          >
                            <Plus size={24} />
                          </button>
                       </div>
                       <div className="md:w-48">
                          <select 
                            value={selectedTrait}
                            onChange={(e) => setSelectedTrait(e.target.value)}
                            className="input-hero py-6 appearance-none cursor-pointer shadow-sm"
                          >
                             {['Discipline', 'Health', 'Learning', 'Wealth', 'Relationships'].map(t => (
                               <option key={t} value={t} className="bg-white text-hero-text">{t}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-10">
                       {templates.map(t => (
                         <button 
                           key={t}
                           onClick={() => handleAddHabit(t)}
                           className="px-4 py-2 rounded-xl bg-black/[0.02] border border-black/[0.05] text-[9px] font-bold uppercase tracking-widest text-hero-muted hover:bg-hero-accent hover:text-white hover:border-hero-accent transition-all"
                         >
                           + {t}
                         </button>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <AnimatePresence mode="popLayout">
                          {habits.map(h => (
                            <motion.div 
                              key={h.id} 
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="glass-panel p-5 flex items-center justify-between border-black/[0.03] bg-white group"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-hero-accent/5 flex items-center justify-center text-hero-accent border border-hero-accent/10">
                                     <Check size={20} />
                                  </div>
                                  <div>
                                     <p className="font-bold text-sm text-hero-text">{h.title}</p>
                                     <p className="text-[9px] font-bold uppercase tracking-widest text-hero-muted">{h.trait}</p>
                                  </div>
                               </div>
                               <button onClick={() => removeHabit(h.id)} className="w-10 h-10 rounded-xl bg-black/[0.02] flex items-center justify-center text-hero-muted opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all">
                                  <Trash2 size={18} />
                               </button>
                            </motion.div>
                          ))}
                       </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="goals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="glass-card p-10 bg-white shadow-xl border-white">
                    <h3 className="font-serif text-2xl text-hero-text mb-8">Time-Bound Objectives</h3>
                    <div className="space-y-8">
                       <div>
                          <label className="label-hero">Goal Description</label>
                          <input
                            value={goalForm.title}
                            onChange={e => setGoalForm(g => ({ ...g, title: e.target.value }))}
                            placeholder="What do you want to achieve?"
                            className="input-hero shadow-sm"
                          />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                             <label className="label-hero">Duration Protocol</label>
                             <div className="grid grid-cols-3 gap-3">
                                {['week', 'month', 'custom'].map(d => (
                                  <button
                                    key={d}
                                    onClick={() => setGoalForm(g => ({ ...g, durationType: d }))}
                                    className={clsx(
                                      "py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                      goalForm.durationType === d ? "bg-hero-accent text-white shadow-hero-glow" : "bg-black/[0.02] text-hero-muted border border-black/[0.05]"
                                    )}
                                  >
                                    {d}
                                  </button>
                                ))}
                             </div>
                          </div>
                          <div className="flex items-end">
                             <button onClick={handleAddGoal} className="btn-hero w-full py-5">
                                Initialize Objective
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <AnimatePresence mode="popLayout">
                        {goals.map(g => (
                          <motion.div 
                            key={g.id} 
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-6 flex items-center justify-between border-black/[0.03] bg-white group"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                   <Target size={24} />
                                </div>
                                <div>
                                   <p className="font-bold text-sm text-hero-text mb-1">{g.title}</p>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-hero-muted">{g.durationType} cycle</p>
                                </div>
                             </div>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-8 pointer-events-none">
           <div className="max-w-2xl mx-auto glass-card p-6 flex items-center justify-between pointer-events-auto shadow-2xl border-white ring-1 ring-black/[0.05]">
              <div className="text-left">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-hero-muted mb-1">Initialized Roster</p>
                 <p className="text-sm font-bold text-hero-text">{habits.length} Habits / {goals.length} Goals</p>
              </div>
              <div className="flex gap-4">
                 {tab === 'habits' ? (
                   <button onClick={() => setTab('goals')} className="btn-glass px-8 py-4 flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                     Next Protocol <ChevronRight size={18} />
                   </button>
                 ) : (
                   <button 
                     onClick={handleFinish}
                     disabled={habits.length === 0}
                     className={clsx(
                       "btn-hero px-10 py-5 text-sm",
                       habits.length === 0 && "opacity-50 grayscale cursor-not-allowed"
                     )}
                   >
                     Initiate Ascension <ArrowRight size={20} className="ml-2" />
                   </button>
                 )}
              </div>
           </div>
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
           {saved && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl"
             >
                <div className="text-center">
                   <motion.div 
                     initial={{ scale: 0.8, rotate: -10 }}
                     animate={{ scale: 1, rotate: 0 }}
                     className="w-32 h-32 bg-hero-accent text-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-hero-accent/40"
                   >
                      <Shield size={64} className="animate-glow" />
                   </motion.div>
                   <h2 className="font-serif text-5xl text-hero-text mb-4">Protocols Verified.</h2>
                   <p className="text-hero-muted font-medium uppercase tracking-[0.4em] text-xs">Entering Operation Mode</p>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  )
}
