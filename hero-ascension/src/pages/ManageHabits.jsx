import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DAY_KEYS, DAY_NAMES } from '../context/AppContext'
import { HABIT_CATEGORIES } from '../data/categories'
import { Trash2, Plus, RotateCcw, UserMinus, ArrowLeft, Upload, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import * as XLSX from 'xlsx'

const PRIORITY_COLORS = { low: '#6B7280', medium: '#F59E0B', high: '#EF4444' }

// ─── Category Matching ────────────────────────────────────────────────
function matchCategory(rawLabel) {
  if (!rawLabel) return 'fitness'
  const cleaned = rawLabel
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .toLowerCase()
  const found = HABIT_CATEGORIES.find(
    c => cleaned === c.label.toLowerCase() || cleaned === c.id || c.label.toLowerCase().startsWith(cleaned)
  )
  return found ? found.id : 'fitness'
}

export default function ManageHabits() {
  const { selectedHero, habits, addHabit, removeHabit, updateHabit, setOnboarded, setSelectedHeroId } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [cat, setCat] = useState('fitness')
  const [goal, setGoal] = useState(25)
  const [repeatDays, setRepeatDays] = useState([])
  const [priority, setPriority] = useState('medium')
  const [showReset, setShowReset] = useState(false)
  const [importStatus, setImportStatus] = useState(null)

  if (!selectedHero) return null

  const toggleDay = (dk) => setRepeatDays(prev => prev.includes(dk) ? prev.filter(d => d !== dk) : [...prev, dk])

  const handleAdd = () => {
    if (!title.trim()) return
    addHabit(title.trim(), cat, goal, repeatDays, priority)
    setTitle(''); setRepeatDays([]); setPriority('medium')
  }

  const handleReset = async () => { 
    await setSelectedHeroId(null)
    await setOnboarded(false) 
  }

  // ─── Export (XLSX) ────────────────────────────────────────────────────
  const handleExport = () => {
    const data = habits.map(h => {
      const catDef = HABIT_CATEGORIES.find(c => c.id === h.category) || HABIT_CATEGORIES[0]
      return {
        Habits: h.title,
        Category: `${catDef.label} ${catDef.icon}`,
        'Month Goal': h.monthly_goal
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Habits')
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }, { wch: 12 }]
    XLSX.writeFile(wb, 'hero_habits.xlsx')
  }

  // ─── Import (XLSX / CSV / ODS) ────────────────────────────────────────
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (rows.length === 0) {
          setImportStatus({ type: 'error', msg: 'No data found in the file.' })
          setTimeout(() => setImportStatus(null), 3000)
          return
        }

        const sampleKeys = Object.keys(rows[0])
        const habitKey = sampleKeys.find(k => /habit/i.test(k)) || sampleKeys[0]
        const catKey = sampleKeys.find(k => /cat/i.test(k)) || sampleKeys[1]
        const goalKey = sampleKeys.find(k => /goal|month/i.test(k)) || sampleKeys[2]

        let count = 0
        for (const row of rows) {
          const habitName = String(row[habitKey] || '').trim()
          if (!habitName) continue
          const category = matchCategory(String(row[catKey] || ''))
          const monthlyGoal = parseInt(row[goalKey], 10) || 25
          addHabit(habitName, category, monthlyGoal, [], 'medium')
          count++
        }

        setImportStatus({ type: 'success', msg: `Imported ${count} habit${count !== 1 ? 's' : ''} successfully` })
      } catch (err) {
        console.error('Import error:', err)
        setImportStatus({ type: 'error', msg: 'Could not read file. Please use .xlsx, .csv, or .ods format.' })
      }
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl mx-auto page-enter pb-20">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-hero-muted hover:text-hero-text transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center text-3xl shadow-sm">{selectedHero.icon}</div>
        <div>
          <h1 className="font-serif text-3xl text-hero-text">Settings</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-hero-muted">{selectedHero.name} • {selectedHero.trait}</p>
        </div>
      </div>

      {/* Import / Export */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-hero-text mb-1">Import / Export</h2>
        <p className="text-xs text-hero-muted mb-4">
          Supports <span className="font-mono bg-black/[0.03] px-1.5 py-0.5 rounded">.xlsx</span>{' '}
          <span className="font-mono bg-black/[0.03] px-1.5 py-0.5 rounded">.csv</span>{' '}
          <span className="font-mono bg-black/[0.03] px-1.5 py-0.5 rounded">.ods</span>{' '}
          — columns: Habits, Category, Month Goal
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-xs font-bold uppercase tracking-widest text-hero-text hover:bg-hero-accent/5 hover:border-hero-accent/20 transition-all"
          >
            <Upload size={16} /> Upload File
          </button>
          <button
            onClick={handleExport}
            disabled={habits.length === 0}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-black/[0.02] border border-black/[0.06] text-xs font-bold uppercase tracking-widest text-hero-text hover:bg-hero-accent/5 hover:border-hero-accent/20 transition-all",
              habits.length === 0 && "opacity-40 cursor-not-allowed"
            )}
          >
            <Download size={16} /> Export XLSX
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.ods,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleImport}
          className="hidden"
        />
        <AnimatePresence>
          {importStatus && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={clsx(
                "text-sm font-bold mt-3 text-center",
                importStatus.type === 'success' ? "text-green-600" : "text-red-500"
              )}
            >
              {importStatus.type === 'success' ? '✓' : '✕'} {importStatus.msg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Create Habit */}
      <div className="glass-card p-6 mb-5">
        <h2 className="text-base font-bold text-hero-text mb-4">Create Habit</h2>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Name</label>
          <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Habit name..." className="flex-1 px-4 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm outline-none focus:border-hero-accent/30 transition-all" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Category</label>
          <select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm font-medium appearance-none cursor-pointer outline-none">
            {HABIT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>

        <div className="flex items-start gap-3 mb-3">
          <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0 pt-2">Repeat</label>
          <div>
            <div className="flex gap-1.5">
              {DAY_KEYS.map((dk, i) => (
                <button key={dk} onClick={() => toggleDay(dk)}
                  className={clsx("w-9 h-9 rounded-lg text-xs font-bold uppercase transition-all",
                    repeatDays.includes(dk) ? "bg-hero-accent text-white" : "bg-black/[0.03] text-hero-muted hover:bg-black/[0.06]")}>{DAY_NAMES[i].slice(0, 2)}
                </button>
              ))}
            </div>
            <p className="text-xs text-hero-muted mt-1">{repeatDays.length === 0 ? 'Every day' : repeatDays.join(', ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Priority</label>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={clsx("px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                  priority === p ? "text-white" : "bg-black/[0.03] text-hero-muted")}
                style={priority === p ? { backgroundColor: PRIORITY_COLORS[p] } : {}}>{p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-bold text-hero-muted w-20 flex-shrink-0">Goal</label>
          <input type="number" min={1} max={31} value={goal} onChange={e => setGoal(Number(e.target.value))}
            className="w-16 px-3 py-3 rounded-xl bg-black/[0.02] border border-black/[0.05] text-sm font-bold text-center outline-none" />
          <span className="text-sm text-hero-muted">days/month</span>
        </div>

        <button onClick={handleAdd} disabled={!title.trim()} className={clsx("btn-hero w-full py-3 text-sm", !title.trim() && "opacity-40 cursor-not-allowed")}>
          <Plus size={18} /> Add Habit
        </button>
      </div>

      {/* Habit List */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-hero-muted">Your Habits</h2>
          <span className="text-xs font-bold text-hero-muted">{habits.length} active</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {habits.map(h => {
              const catDef = HABIT_CATEGORIES.find(c => c.id === h.category) || HABIT_CATEGORIES[0]
              const repeatLabel = (!h.repeat_days || h.repeat_days.length === 0) ? 'Daily' : h.repeat_days.map(d => d.slice(0, 2).toUpperCase()).join(' ')
              return (
                <motion.div key={h.id} layout initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-black/[0.05] group">
                  <span className="text-lg flex-shrink-0">{catDef.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-hero-text truncate">{h.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-bold uppercase" style={{ color: catDef.color }}>{catDef.label}</span>
                      <span className="text-xs text-hero-muted">•</span>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[h.priority] }} />
                      <span className="text-xs font-bold" style={{ color: PRIORITY_COLORS[h.priority] }}>{h.priority}</span>
                      <span className="text-xs text-hero-muted">•</span>
                      <span className="text-xs text-hero-muted">{repeatLabel}</span>
                      <span className="text-xs text-hero-muted">•</span>
                      <span className="text-xs text-hero-muted">Goal: {h.monthly_goal}</span>
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
          {habits.length === 0 && <p className="text-center py-6 text-hero-muted/40 text-base italic">No habits yet</p>}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-100">
        <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">Danger Zone</h2>
        <button onClick={() => setShowReset(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100">
          <UserMinus size={15} /> Reset Identity & Start Over
        </button>
      </div>

      <AnimatePresence>
        {showReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/10 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card max-w-sm w-full p-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-5"><RotateCcw size={32} /></div>
              <h2 className="font-serif text-2xl text-hero-text mb-2">Reset Identity?</h2>
              <p className="text-hero-muted text-sm mb-6">Returns you to hero selection. Habits are preserved.</p>
              <div className="flex flex-col gap-2">
                <button onClick={handleReset} className="btn-hero bg-red-600 py-3 text-sm">Confirm Reset</button>
                <button onClick={() => setShowReset(false)} className="btn-glass py-3 text-sm">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
