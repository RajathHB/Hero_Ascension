import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DAY_KEYS, DAY_NAMES } from '../context/AppContext'
import { HERO_ROSTER } from '../data/heroRoster'
import { HABIT_CATEGORIES } from '../data/categories'
import {
  ArrowRight, LogOut, ChevronDown, Shield, Plus, Trash2, Check, ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const PRIORITY_COLORS = { low: '#6B7280', medium: '#F59E0B', high: '#EF4444' }

export default function Onboarding() {
  const { setSelectedHeroId, selectedHeroId, addHabit, removeHabit, habits, setOnboarded, logout, loading } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [heroId, setHeroId] = useState(selectedHeroId || '')
  const [saving, setSaving] = useState(false)

  // Habit form
  const [habitTitle, setHabitTitle] = useState('')
  const [habitCat, setHabitCat] = useState('fitness')
  const [habitGoal, setHabitGoal] = useState(25)
  const [habitRepeatDays, setHabitRepeatDays] = useState([]) // empty = every day
  const [habitPriority, setHabitPriority] = useState('medium')

  const hero = HERO_ROSTER.find(h => h.id === heroId)
  const marvelHeroes = HERO_ROSTER.filter(h => h.category === 'Marvel-inspired')
  const dcHeroes = HERO_ROSTER.filter(h => h.category === 'DC-inspired')

  const handleHeroContinue = () => {
    if (!heroId) return
    setSelectedHeroId(heroId)
    setStep(2)
  }

  const toggleDay = (dayKey) => {
    setHabitRepeatDays(prev =>
      prev.includes(dayKey) ? prev.filter(d => d !== dayKey) : [...prev, dayKey]
    )
  }

  const handleAddHabit = (title) => {
    const t = (title || habitTitle).trim()
    if (!t) return
    addHabit(t, habitCat, habitGoal, habitRepeatDays, habitPriority)
    setHabitTitle('')
    setHabitRepeatDays([])
    setHabitPriority('medium')
  }

  const handleFinish = async () => {
    if (habits.length === 0) return
    setSaving(true)
    try {
      await setOnboarded(true)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  const templates = {
    fitness: ['Wakeup early & exercise', 'Stretch for 10 minutes'],
    health: ['Drink 2-3 litres of water', 'Deep breathing / meditation'],
    study: ['Read or study for 30 minutes', 'Review what you learned today'],
    career: ['Plan top 3 work tasks', 'Upskill (Automation/AI)'],
    diet: ['Eat at least one fruit', 'Avoid junk food today'],
    money: ['Track daily expenses', 'Avoid unnecessary spending'],
    productivity: ['Focused work block (no distractions)', 'Finish the hardest task first'],
    social: ['Connect with one friend / colleague', 'Avoid gossip / negative talk'],
    family: ['Speak quality time with family', 'Express gratitude to a family member'],
    sleep: ['Sleep before planned time', 'No screens 30 min before sleep'],
  }

  return (
    <div className="min-h-screen bg-hero-bg text-hero-text font-sans relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.05] bg-hero-accent" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.03] bg-purple-400" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center gap-2">
            <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all", step >= 1 ? "bg-hero-accent text-white" : "bg-black/[0.03] text-hero-muted")}>
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">Hero</span>
          </div>
          <div className="flex-1 h-px bg-black/[0.05]" />
          <div className="flex items-center gap-2">
            <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all", step >= 2 ? "bg-hero-accent text-white" : "bg-black/[0.03] text-hero-muted")}>2</div>
            <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">Habits</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Hero Selection ─── */}
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-hero-muted mb-2">Step 1</p>
                <h1 className="font-serif text-4xl md:text-5xl text-hero-text mb-2">Choose your <span className="italic">Hero.</span></h1>
                <p className="text-hero-muted font-medium text-base">Your archetype defines your journey's theme and accent color.</p>
              </div>

              <div className="glass-card p-6 md:p-8 mb-8">
                <label className="label-hero mb-3">Identity Selection</label>
                <div className="relative">
                  <select value={heroId} onChange={(e) => setHeroId(e.target.value)}
                    className="w-full bg-black/[0.02] border border-black/[0.05] rounded-2xl px-6 py-5 text-lg font-bold appearance-none cursor-pointer focus:border-hero-accent/30 outline-none transition-all">
                    <option value="" disabled>Select your archetype...</option>
                    <optgroup label="Marvel Inspired">{marvelHeroes.map(h => <option key={h.id} value={h.id}>{h.icon} {h.name} — {h.trait}</option>)}</optgroup>
                    <optgroup label="DC Inspired">{dcHeroes.map(h => <option key={h.id} value={h.id}>{h.icon} {h.name} — {h.trait}</option>)}</optgroup>
                  </select>
                  <ChevronDown size={22} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-hero-muted" />
                </div>

                {hero && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-5 p-5 bg-black/[0.01] rounded-2xl border border-black/[0.03]">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-center text-4xl shadow-sm">{hero.icon}</div>
                    <div className="flex-1">
                      <h2 className="font-serif text-2xl text-hero-text">{hero.name}</h2>
                      <p className="text-hero-muted text-sm font-medium mt-0.5">"{hero.tagline}"</p>
                      <span className="inline-block mt-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 bg-hero-accent/10 text-hero-accent rounded-md">{hero.trait}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={logout} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-hero-muted hover:text-red-500 transition-colors">
                  <LogOut size={18} /> Exit
                </button>
                <button onClick={handleHeroContinue} disabled={!heroId} className={clsx("btn-hero px-8 py-4 text-sm", !heroId && "opacity-40 cursor-not-allowed")}>
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>

          ) : (
            /* ─── STEP 2: Habit Setup ─── */
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1">
              <div className="mb-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-hero-muted hover:text-hero-text transition-colors mb-3">
                  <ArrowLeft size={16} /> Back to Hero
                </button>
                <h1 className="font-serif text-4xl md:text-5xl text-hero-text mb-2">Add your <span className="italic">Habits.</span></h1>
                <p className="text-hero-muted font-medium text-base">Pick a category, set repeat days, priority, and monthly goal.</p>
              </div>

              {/* Create Habit Form */}
              <div className="glass-card p-6 md:p-8 mb-6">
                <h3 className="text-base font-bold text-hero-text mb-5">Create habit</h3>

                {/* Name */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Name</label>
                  <input value={habitTitle} onChange={e => setHabitTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                    placeholder="E.g., Meditate..." className="flex-1 px-4 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm outline-none focus:border-hero-accent/30 transition-all" />
                </div>

                {/* Category */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Category</label>
                  <select value={habitCat} onChange={e => setHabitCat(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm font-medium appearance-none cursor-pointer outline-none">
                    {HABIT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>

                <div className="border-t border-black/[0.05] pt-4 mt-4 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-4">Settings</h4>

                  {/* Repeat Days */}
                  <div className="flex items-start gap-4 mb-4">
                    <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0 pt-2">Repeat</label>
                    <div className="flex-1">
                      <div className="flex gap-1.5 flex-wrap">
                        {DAY_KEYS.map((dk, i) => (
                          <button key={dk} onClick={() => toggleDay(dk)}
                            className={clsx(
                              "w-10 h-10 rounded-lg text-xs font-bold uppercase transition-all",
                              habitRepeatDays.includes(dk) ? "bg-hero-accent text-white shadow-sm" : "bg-black/[0.03] text-hero-muted hover:bg-black/[0.06]"
                            )}>
                            {DAY_NAMES[i].slice(0, 2)}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-hero-muted mt-1.5">
                        {habitRepeatDays.length === 0 ? 'Every day (default)' : habitRepeatDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Priority</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <button key={p} onClick={() => setHabitPriority(p)}
                          className={clsx(
                            "px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                            habitPriority === p ? "text-white shadow-sm" : "bg-black/[0.03] text-hero-muted hover:bg-black/[0.06]"
                          )}
                          style={habitPriority === p ? { backgroundColor: PRIORITY_COLORS[p] } : {}}>
                          {p} {p === 'low' ? '(1x)' : p === 'medium' ? '(1.5x)' : '(2x)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Goal */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Goal</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} max={31} value={habitGoal} onChange={e => setHabitGoal(Number(e.target.value))}
                        className="w-16 px-3 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm font-bold text-center outline-none" />
                      <span className="text-sm text-hero-muted">days / month</span>
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button onClick={() => handleAddHabit()} disabled={!habitTitle.trim()}
                  className={clsx("btn-hero w-full py-4 text-sm mt-2", !habitTitle.trim() && "opacity-40 cursor-not-allowed")}>
                  <Plus size={18} /> Add Habit
                </button>
              </div>

              {/* Quick Templates */}
              <div className="glass-card p-6 mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-3">
                  Quick Add — {HABIT_CATEGORIES.find(c => c.id === habitCat)?.icon} {HABIT_CATEGORIES.find(c => c.id === habitCat)?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(templates[habitCat] || []).map(t => (
                    <button key={t} onClick={() => handleAddHabit(t)}
                      className="px-3.5 py-2 rounded-lg bg-black/[0.02] border border-black/[0.05] text-xs font-bold text-hero-muted hover:bg-hero-accent hover:text-white hover:border-hero-accent transition-all">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit List */}
              {habits.length > 0 && (
                <div className="glass-card p-6 mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-hero-muted mb-3">
                    Your Habits ({habits.length})
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                      {habits.map(h => {
                        const catDef = HABIT_CATEGORIES.find(c => c.id === h.category) || HABIT_CATEGORIES[0]
                        const repeatLabel = (!h.repeat_days || h.repeat_days.length === 0) ? 'Every day' : h.repeat_days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')
                        return (
                          <motion.div key={h.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-black/[0.05] group">
                            <span className="text-lg">{catDef.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-hero-text truncate">{h.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold uppercase tracking-widest text-hero-muted">{catDef.label}</span>
                                <span className="text-xs text-hero-muted">•</span>
                                <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[h.priority] }}>{h.priority}</span>
                                <span className="text-xs text-hero-muted">•</span>
                                <span className="text-xs text-hero-muted">{repeatLabel}</span>
                                <span className="text-xs text-hero-muted">•</span>
                                <span className="text-xs text-hero-accent font-bold">+{h.xp_reward} XP</span>
                              </div>
                            </div>
                            <button onClick={() => removeHabit(h.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-hero-muted opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0">
                              <Trash2 size={15} />
                            </button>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-hero-muted">{habits.length} habit{habits.length !== 1 ? 's' : ''} added</p>
                <button onClick={handleFinish} disabled={habits.length === 0} className={clsx("btn-hero px-8 py-4 text-sm", habits.length === 0 && "opacity-40 cursor-not-allowed")}>
                  Start Journey <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saving overlay */}
        <AnimatePresence>
          {saving && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl">
              <div className="text-center">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-28 h-28 bg-hero-accent text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Shield size={52} />
                </motion.div>
                <h2 className="font-serif text-4xl text-hero-text mb-2">Ready.</h2>
                <p className="text-hero-muted font-medium text-sm uppercase tracking-widest">Entering Mission Mode</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
