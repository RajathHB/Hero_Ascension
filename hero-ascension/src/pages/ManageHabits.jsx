import React, { useState } from 'react'
import { useApp, HERO_ROSTER } from '../context/AppContext'
import StreakBadge from '../components/StreakBadge'
import { Plus, Trash2, Pencil, Check, X, Flame, UserMinus } from 'lucide-react'
import clsx from 'clsx'

const HABIT_TEMPLATES = {
  'iron-will': ['Wake up at 6am', 'No phone in first hour', 'Plan the next day', 'Cold shower', 'Journal 5 min'],
  'ember-fist': ['Workout 30 min', 'Hit protein goal', 'Walk 8,000 steps', 'Stretch 10 min', 'Track calories'],
  'arcane-mind': ['Read 20 pages', 'Learn 1 new thing', 'Practice a skill 20 min', 'Review notes', 'No doom-scrolling'],
  'golden-path': ['Log every expense', 'Review investments', 'Learn 1 finance concept', 'No impulse buys', 'Save 10% of income'],
  'jade-spirit': ['Meditate 10 min', 'Breathwork session', 'Digital detox 1hr', 'Gratitude journal', 'Sleep 7-8hrs'],
  'nova-heart':  ['Call a friend', 'Do 1 kind act', 'Family check-in', 'Put phone away at dinner', 'Express gratitude'],
}

const FREQ_LABELS = { daily: 'Daily', weekdays: 'Weekdays', weekly: 'Weekly' }

function EditableHabit({ habit, hero, selectedHeroes, onUpdate, onDelete, streak, monthCalData }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const [freq, setFreq] = useState(habit.frequency)
  const [heroId, setHeroId] = useState(habit.heroId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const done = monthCalData.filter(d => d.done).length
  const total = monthCalData.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onUpdate(habit.id, { name: trimmed, frequency: freq, heroId })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(habit.name)
    setFreq(habit.frequency)
    setHeroId(habit.heroId)
    setEditing(false)
    setConfirmDelete(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(habit.id)
  }

  const createdLabel = habit.createdAt
    ? new Date(habit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  if (editing) {
    return (
      <div className="p-4 rounded-xl space-y-3 transition-all"
        style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${hero.colorHex}30` }}>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="input-field flex-1 py-2 text-sm"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-mono text-xs text-slate-600 uppercase mb-1 block">Frequency</label>
            <select
              value={freq}
              onChange={e => setFreq(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-xs text-slate-600 uppercase mb-1 block">Hero</label>
            <select
              value={heroId}
              onChange={e => setHeroId(e.target.value)}
              className="input-field py-2 text-sm"
            >
              {selectedHeroes.map(h => (
                <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-between pt-1">
          <button
            onClick={handleDelete}
            className={clsx(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-body font-semibold transition-all',
              confirmDelete
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-slate-600 hover:text-red-400 hover:bg-red-400/10'
            )}
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-body font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-body font-semibold transition-all"
              style={{ background: `${hero.colorHex}20`, color: hero.colorHex, border: `1px solid ${hero.colorHex}30` }}
            >
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-xl group transition-all cursor-pointer hover:border-white/12"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
      onClick={() => setEditing(true)}
    >
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: hero.colorHex, opacity: 0.5 }} />
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm text-slate-300 truncate">{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs px-1.5 py-0.5 rounded"
            style={{ background: `${hero.colorHex}10`, color: `${hero.colorHex}90`, fontSize: '0.65rem' }}>
            {FREQ_LABELS[habit.frequency] || habit.frequency}
          </span>
          {createdLabel && (
            <span className="font-mono text-xs text-slate-700">since {createdLabel}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {streak > 0 && <StreakBadge streak={streak} />}
        <div className="text-right hidden sm:block">
          <p className="font-mono text-xs font-bold" style={{ color: pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#fb7185' }}>
            {pct}%
          </p>
          <p className="font-mono text-slate-700" style={{ fontSize: '0.6rem' }}>{done}/{total}</p>
        </div>
        <Pencil size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </div>
    </div>
  )
}

function AddHabitInline({ hero, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [freq, setFreq] = useState('daily')

  const submit = (habitName) => {
    const n = (habitName || name).trim()
    if (!n) return
    onAdd({ name: n, heroId: hero.id, frequency: freq, xpValue: 10 })
    setName('')
    if (!habitName) setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-sm transition-all hover:scale-[1.01]"
        style={{ background: `${hero.colorHex}08`, border: `1px dashed ${hero.colorHex}25`, color: `${hero.colorHex}90` }}
      >
        <Plus size={16} /> Add Habit
      </button>
    )
  }

  return (
    <div className="space-y-3 p-3 rounded-xl"
      style={{ background: `${hero.colorHex}05`, border: `1px solid ${hero.colorHex}15` }}>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Read 20 pages"
          className="input-field flex-1 py-2 text-sm"
          autoFocus
        />
        <select
          value={freq}
          onChange={e => setFreq(e.target.value)}
          className="input-field w-28 py-2 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
        </select>
        <button
          onClick={() => submit()}
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          style={{ background: `${hero.colorHex}20`, border: `1px solid ${hero.colorHex}30`, color: hero.colorHex }}
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(HABIT_TEMPLATES[hero.id] || []).map(t => (
          <button
            key={t}
            onClick={() => submit(t)}
            className="px-2.5 py-1 rounded-full font-body text-xs text-slate-400 hover:text-slate-200 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            + {t}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setOpen(false); setName('') }}
        className="w-full text-center font-mono text-xs text-slate-600 hover:text-slate-400 py-1 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

export default function ManageHabits() {
  const {
    selectedHeroes, habits, addHabit, removeHabit, updateHabit,
    getHabitStreak, getMonthCalendarData, removeHero
  } = useApp()
  const [confirmRemoveHero, setConfirmRemoveHero] = useState(null)

  const totalHabits = habits.length
  const canRemoveHero = selectedHeroes.length > 1

  const handleRemoveHero = (heroId) => {
    if (confirmRemoveHero !== heroId) {
      setConfirmRemoveHero(heroId)
      setTimeout(() => setConfirmRemoveHero(null), 4000)
      return
    }
    removeHero(heroId)
    setConfirmRemoveHero(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 page-enter">
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">Arsenal</p>
        <h1 className="font-display text-4xl text-plasma-400 tracking-wide">MANAGE HABITS</h1>
        <p className="font-body text-slate-500 mt-1">
          {totalHabits} habit{totalHabits !== 1 ? 's' : ''} across {selectedHeroes.length} hero{selectedHeroes.length !== 1 ? 'es' : ''}.
          Tap any habit to edit.
        </p>
      </div>

      {/* Hero sections */}
      <div className="space-y-5 page-enter page-enter-delay-1">
        {selectedHeroes.map(hero => {
          const heroHabits = habits.filter(h => h.heroId === hero.id)
          const isConfirming = confirmRemoveHero === hero.id
          return (
            <div key={hero.id} className="glass-card p-5 relative overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: hero.colorHex }} />

              {/* Hero header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${hero.colorHex}15`, border: `1px solid ${hero.colorHex}30` }}>
                  {hero.icon}
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl tracking-wide" style={{ color: hero.colorHex }}>
                    {hero.name}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    {hero.domain} · {heroHabits.length} habit{heroHabits.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {/* Remove hero button */}
                {canRemoveHero && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isConfirming && (
                      <button
                        onClick={() => setConfirmRemoveHero(null)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveHero(hero.id)}
                      className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold transition-all',
                        isConfirming
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-slate-600 hover:text-red-400 hover:bg-red-400/10'
                      )}
                      title={isConfirming ? 'Click again to confirm removal' : 'Remove hero'}
                    >
                      <UserMinus size={14} />
                      {isConfirming ? 'Confirm' : 'Remove'}
                    </button>
                  </div>
                )}
              </div>

              {/* Confirm banner */}
              {isConfirming && (
                <div className="mb-4 px-3 py-2 rounded-lg text-xs font-body"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  ⚠ This will remove <strong>{hero.name}</strong> and all {heroHabits.length} habit{heroHabits.length !== 1 ? 's' : ''}, logs, and XP. Click "Confirm" again.
                </div>
              )}

              {/* Habit list */}
              {heroHabits.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {heroHabits.map(h => (
                    <EditableHabit
                      key={h.id}
                      habit={h}
                      hero={hero}
                      selectedHeroes={selectedHeroes}
                      onUpdate={updateHabit}
                      onDelete={removeHabit}
                      streak={getHabitStreak(h.id)}
                      monthCalData={getMonthCalendarData(h.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-4 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <Flame size={20} className="mx-auto mb-2 text-slate-700" />
                  <p className="font-mono text-xs text-slate-600 uppercase">No habits assigned</p>
                  <p className="font-body text-xs text-slate-700 mt-1">Add habits below to power this hero.</p>
                </div>
              )}

              {/* Add habit */}
              <AddHabitInline hero={hero} onAdd={addHabit} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
