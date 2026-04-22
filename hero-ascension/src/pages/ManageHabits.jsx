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

const FREQ_LABELS = { daily: 'Daily', weekdays: 'Weekdays', weekend: 'Weekend', custom: 'Custom' }

function formatCustomRange(habit) {
  if (!habit.customFrom || !habit.customTo) return ''
  const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(habit.customFrom)} – ${fmt(habit.customTo)}`
}

function EditableHabit({ habit, hero, selectedHeroes, onUpdate, onDelete, streak, monthCalData }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(habit.name)
  const [freq, setFreq] = useState(habit.frequency)
  const [heroId, setHeroId] = useState(habit.heroId)
  const [customFrom, setCustomFrom] = useState(habit.customFrom || '')
  const [customTo, setCustomTo] = useState(habit.customTo || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const done = monthCalData.filter(d => d.done).length
  const total = monthCalData.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (freq === 'custom' && (!customFrom || !customTo)) return
    onUpdate(habit.id, {
      name: trimmed, frequency: freq, heroId,
      ...(freq === 'custom' ? { customFrom, customTo } : { customFrom: '', customTo: '' }),
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(habit.name)
    setFreq(habit.frequency)
    setHeroId(habit.heroId)
    setCustomFrom(habit.customFrom || '')
    setCustomTo(habit.customTo || '')
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
        style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${hero.colorHex}25` }}>
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
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>Frequency</label>
            <select
              value={freq}
              onChange={e => setFreq(e.target.value)}
              className="input-field py-2 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekend">Weekend</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>Hero</label>
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
        {freq === 'custom' && (
          <div className="grid grid-cols-2 gap-2 page-enter">
            <div>
              <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="input-field py-2 text-sm" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                min={customFrom} className="input-field py-2 text-sm" />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 justify-between pt-1">
          <button
            onClick={handleDelete}
            className={clsx(
              'flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-all',
            )}
            style={confirmDelete
              ? { background: 'rgba(231,111,81,0.1)', color: '#E76F51', border: '1px solid rgba(231,111,81,0.2)' }
              : { color: '#9E9A8C' }
            }
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-colors"
              style={{ background: 'rgba(0,0,0,0.04)', color: '#7A7668' }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-sm font-body font-semibold transition-all"
              style={{ background: `${hero.colorHex}15`, color: hero.colorHex, border: `1px solid ${hero.colorHex}25` }}
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
      className="flex items-center gap-3 px-3 py-3 rounded-xl group transition-all cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}
      onClick={() => setEditing(true)}
    >
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: hero.colorHex, opacity: 0.4 }} />
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-sm truncate" style={{ color: '#3D3A32' }}>{habit.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs px-1.5 py-0.5 rounded-lg"
            style={{ background: `${hero.colorHex}08`, color: `${hero.colorHex}`, fontSize: '0.65rem' }}>
            {FREQ_LABELS[habit.frequency] || habit.frequency}
          </span>
          {habit.frequency === 'custom' && habit.customFrom && habit.customTo && (
            <span className="font-mono text-xs" style={{ color: '#9E9A8C' }}>{formatCustomRange(habit)}</span>
          )}
          {createdLabel && (
            <span className="font-mono text-xs" style={{ color: '#C4BFAE' }}>since {createdLabel}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {streak > 0 && <StreakBadge streak={streak} />}
        <div className="text-right hidden sm:block">
          <p className="font-mono text-xs font-bold" style={{ color: pct >= 80 ? '#52B788' : pct >= 50 ? '#E9C46A' : '#E07A8E' }}>
            {pct}%
          </p>
          <p className="font-mono" style={{ fontSize: '0.6rem', color: '#C4BFAE' }}>{done}/{total}</p>
        </div>
        <Pencil size={14} className="transition-colors flex-shrink-0" style={{ color: '#C4BFAE' }} />
      </div>
    </div>
  )
}

function AddHabitInline({ hero, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [freq, setFreq] = useState('daily')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const submit = (habitName) => {
    const n = (habitName || name).trim()
    if (!n) return
    if (freq === 'custom' && (!customFrom || !customTo)) return
    onAdd({
      name: n, heroId: hero.id, frequency: freq, xpValue: 10,
      ...(freq === 'custom' ? { customFrom, customTo } : {}),
    })
    setName(''); setCustomFrom(''); setCustomTo('')
    if (!habitName) setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-body font-semibold text-sm transition-all hover:shadow-sm"
        style={{ background: `${hero.colorHex}06`, border: `1px dashed ${hero.colorHex}20`, color: `${hero.colorHex}` }}
      >
        <Plus size={16} /> Add Habit
      </button>
    )
  }

  return (
    <div className="space-y-3 p-3 rounded-xl"
      style={{ background: `${hero.colorHex}04`, border: `1px solid ${hero.colorHex}12` }}>
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
          <option value="weekend">Weekend</option>
          <option value="custom">Custom</option>
        </select>
        <button
          onClick={() => submit()}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: `${hero.colorHex}15`, border: `1px solid ${hero.colorHex}25`, color: hero.colorHex }}
        >
          <Plus size={18} />
        </button>
      </div>
      {freq === 'custom' && (
        <div className="flex gap-2 items-center page-enter">
          <div className="flex-1">
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>From</label>
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="input-field py-2 text-sm w-full" />
          </div>
          <div className="flex-1">
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>To</label>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              min={customFrom} className="input-field py-2 text-sm w-full" />
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {(HABIT_TEMPLATES[hero.id] || []).map(t => (
          <button
            key={t}
            onClick={() => submit(t)}
            className="px-2.5 py-1 rounded-full font-body text-xs transition-all hover:shadow-sm"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', color: '#7A7668' }}
          >
            + {t}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setOpen(false); setName('') }}
        className="w-full text-center font-mono text-xs py-1 transition-colors"
        style={{ color: '#9E9A8C' }}
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
        <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#9E9A8C' }}>Arsenal</p>
        <h1 className="font-display text-4xl text-plasma-400 tracking-wide">MANAGE HABITS</h1>
        <p className="font-body mt-1" style={{ color: '#7A7668' }}>
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
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none"
                style={{ background: hero.colorHex }} />

              {/* Hero header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${hero.colorHex}10` }}>
                  {hero.icon}
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl tracking-wide" style={{ color: hero.colorHex }}>
                    {hero.name}
                  </p>
                  <p className="font-mono text-xs" style={{ color: '#9E9A8C' }}>
                    {hero.domain} · {heroHabits.length} habit{heroHabits.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {/* Remove hero button */}
                {canRemoveHero && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isConfirming && (
                      <button
                        onClick={() => setConfirmRemoveHero(null)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: '#9E9A8C' }}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveHero(hero.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-body font-semibold transition-all"
                      style={isConfirming
                        ? { background: 'rgba(231,111,81,0.1)', color: '#E76F51', border: '1px solid rgba(231,111,81,0.2)' }
                        : { color: '#9E9A8C' }
                      }
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
                <div className="mb-4 px-3 py-2 rounded-xl text-xs font-body"
                  style={{ background: 'rgba(231,111,81,0.06)', border: '1px solid rgba(231,111,81,0.15)', color: '#E76F51' }}>
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
                  style={{ background: 'rgba(0,0,0,0.015)', border: '1px dashed rgba(0,0,0,0.08)' }}>
                  <Flame size={20} className="mx-auto mb-2" style={{ color: '#C4BFAE' }} />
                  <p className="font-mono text-xs uppercase" style={{ color: '#9E9A8C' }}>No habits assigned</p>
                  <p className="font-body text-xs mt-1" style={{ color: '#C4BFAE' }}>Add habits below to power this hero.</p>
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
