import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HeroCard from '../components/HeroCard'
import { Plus, Trash2, Target, Zap, ArrowRight, Check, LogOut, Save } from 'lucide-react'

const HABIT_TEMPLATES = {
  'iron-will': ['Wake up at 6am', 'No phone in first hour', 'Plan the next day', 'Cold shower', 'Journal 5 min'],
  'ember-fist': ['Workout 30 min', 'Hit protein goal', 'Walk 8,000 steps', 'Stretch 10 min', 'Track calories'],
  'arcane-mind': ['Read 20 pages', 'Learn 1 new thing', 'Practice a skill 20 min', 'Review notes', 'No doom-scrolling'],
  'golden-path': ['Log every expense', 'Review investments', 'Learn 1 finance concept', 'No impulse buys', 'Save 10% of income'],
  'jade-spirit': ['Meditate 10 min', 'Breathwork session', 'Digital detox 1hr', 'Gratitude journal', 'Sleep 7-8hrs'],
  'nova-heart':  ['Call a friend', 'Do 1 kind act', 'Family check-in', 'Put phone away at dinner', 'Express gratitude'],
}

function HabitForm({ hero, onAdd }) {
  const [name, setName] = useState('')
  const [freq, setFreq] = useState('daily')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const submit = (habitName) => {
    const n = (habitName || name).trim()
    if (!n) return
    if (freq === 'custom' && (!customFrom || !customTo)) return
    onAdd({
      name: n,
      heroId: hero.id,
      frequency: freq,
      xpValue: 10,
      ...(freq === 'custom' ? { customFrom, customTo } : {}),
    })
    if (!habitName) { setName(''); setCustomFrom(''); setCustomTo('') }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="e.g. Read 20 pages"
          className="input-field flex-1 py-2 text-sm"
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
          style={{ background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.2)', color: '#2A9D8F' }}
        >
          <Plus size={18} />
        </button>
      </div>

      {freq === 'custom' && (
        <div className="flex gap-2 items-center page-enter">
          <div className="flex-1">
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>From</label>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="input-field py-2 text-sm w-full"
            />
          </div>
          <div className="flex-1">
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: '#9E9A8C' }}>To</label>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              min={customFrom}
              className="input-field py-2 text-sm w-full"
            />
          </div>
        </div>
      )}

      {/* Template chips */}
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
    </div>
  )
}


export default function HabitSetup() {
  const { selectedHeroes, habits, addHabit, removeHabit, goals, addGoal, setOnboarded, logout } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('habits')
  const [goalForm, setGoalForm] = useState({ title: '', heroId: selectedHeroes[0]?.id || '', targetValue: '', deadline: '' })
  const [saved, setSaved] = useState(false)

  const handleAddGoal = () => {
    const t = goalForm.title.trim()
    if (!t || !goalForm.heroId) return
    addGoal({ ...goalForm, targetValue: parseInt(goalForm.targetValue) || 100 })
    setGoalForm({ title: '', heroId: selectedHeroes[0]?.id || '', targetValue: '', deadline: '' })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFinish = () => {
    setOnboarded(true)
    navigate('/dashboard')
  }

  const totalHabits = habits.length
  const totalGoals = goals.length

  return (
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      {/* Logout button - top right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all"
          style={{ background: 'rgba(231,111,81,0.08)', color: '#E76F51', border: '1px solid rgba(231,111,81,0.15)' }}
        >
          <LogOut size={14} />
          Exit
        </button>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-6 px-6 page-enter">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-mono text-xs uppercase tracking-widest"
          style={{ background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.15)', color: '#2A9D8F' }}>
          <Zap size={12} />
          Step 2 of 2
        </div>
        <h1 className="font-display text-5xl text-plasma-400 tracking-wider mb-2">
          FORGE YOUR ARSENAL
        </h1>
        <p className="font-body" style={{ color: '#7A7668' }}>Add habits and goals for each of your heroes.</p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-2 mb-6 p-1 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
          {[
            { key: 'habits', label: `Daily Habits (${totalHabits})`, icon: '⚡' },
            { key: 'goals', label: `Major Goals (${totalGoals})`, icon: '🎯' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-lg font-body font-semibold text-sm transition-all"
              style={tab === t.key
                ? { background: '#fff', color: '#2A9D8F', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                : { color: '#9E9A8C' }
              }
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'habits' && (
          <div className="space-y-4 page-enter">
            {selectedHeroes.map(hero => {
              const heroHabits = habits.filter(h => h.heroId === hero.id)
              return (
                <div key={hero.id} className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{hero.icon}</span>
                    <div>
                      <p className="font-display text-xl tracking-wide" style={{ color: hero.colorHex }}>{hero.name}</p>
                      <p className="font-mono text-xs" style={{ color: '#9E9A8C' }}>{hero.domain} · {heroHabits.length} habit{heroHabits.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Existing habits */}
                  {heroHabits.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {heroHabits.map(h => (
                        <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Check size={13} style={{ color: hero.colorHex, flexShrink: 0 }} />
                            <span className="font-body text-sm truncate" style={{ color: '#3D3A32' }}>{h.name}</span>
                            <span className="font-mono text-xs flex-shrink-0" style={{ color: '#C4BFAE' }}>
                              {{ daily: 'Daily', weekdays: 'Weekdays', weekend: 'Weekend', custom: 'Custom' }[h.frequency] || h.frequency}
                              {h.frequency === 'custom' && h.customFrom && h.customTo && (
                                <> · {new Date(h.customFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(h.customTo + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() => removeHabit(h.id)}
                            className="transition-colors flex-shrink-0 ml-2 p-1"
                            style={{ color: '#C4BFAE' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <HabitForm hero={hero} onAdd={addHabit} />
                </div>
              )
            })}
          </div>
        )}

        {tab === 'goals' && (
          <div className="space-y-4 page-enter">
            {/* Add goal form */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target size={18} className="text-plasma-400" />
                <span className="font-display text-xl text-plasma-400 tracking-wide">ADD MAJOR GOAL</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label-text">Goal Title</label>
                  <input
                    value={goalForm.title}
                    onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Read 24 books this year"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-text">Linked Hero</label>
                    <select
                      value={goalForm.heroId}
                      onChange={e => setGoalForm(f => ({ ...f, heroId: e.target.value }))}
                      className="input-field"
                    >
                      {selectedHeroes.map(h => (
                        <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Target (units)</label>
                    <input
                      type="number"
                      value={goalForm.targetValue}
                      onChange={e => setGoalForm(f => ({ ...f, targetValue: e.target.value }))}
                      placeholder="e.g. 24"
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-text">Deadline (optional)</label>
                  <input
                    type="date"
                    value={goalForm.deadline}
                    onChange={e => setGoalForm(f => ({ ...f, deadline: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <button onClick={handleAddGoal} className="btn-secondary w-full">
                  <Plus size={16} /> Add Goal
                </button>
              </div>
            </div>

            {/* Goal list */}
            {goals.length > 0 && (
              <div className="space-y-2">
                {goals.map(g => {
                  const hero = selectedHeroes.find(h => h.id === g.heroId)
                  return (
                    <div key={g.id} className="glass-card p-4 flex items-center gap-4">
                      <span className="text-xl flex-shrink-0">{hero?.icon || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-semibold text-sm truncate" style={{ color: '#3D3A32' }}>{g.title}</p>
                        <p className="font-mono text-xs" style={{ color: '#9E9A8C' }}>
                          Target: {g.targetValue} · {hero?.name}
                          {g.deadline && ` · Due ${g.deadline}`}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: hero?.colorHex || '#2A9D8F', color: hero?.colorHex || '#2A9D8F' }}>
                        <span className="font-mono text-xs font-bold">0%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Save + Finish buttons */}
        <div className="mt-10 pb-10 text-center">
          {totalHabits >= 1 ? (
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: '#9E9A8C' }}>
                {totalHabits} habit{totalHabits !== 1 ? 's' : ''} · {totalGoals} goal{totalGoals !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleSave}
                  className="btn-secondary px-8 py-3 text-base"
                >
                  <Save size={16} />
                  {saved ? 'Saved ✓' : 'Save Progress'}
                </button>
                <button onClick={handleFinish} className="btn-primary px-12 py-4 text-base">
                  Enter the Arena
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: '#C4BFAE' }}>
              Add at least 1 habit to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
