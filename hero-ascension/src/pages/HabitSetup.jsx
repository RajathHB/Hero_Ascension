import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HeroCard from '../components/HeroCard'
import { Plus, Trash2, Target, Zap, ArrowRight, Check } from 'lucide-react'

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

  const submit = (habitName) => {
    const n = (habitName || name).trim()
    if (!n) return
    onAdd({ name: n, heroId: hero.id, frequency: freq, xpValue: 10 })
    if (!habitName) setName('')
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
          <option value="weekly">Weekly</option>
        </select>
        <button
          onClick={() => submit()}
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Template chips */}
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
    </div>
  )
}

export default function HabitSetup() {
  const { selectedHeroes, habits, addHabit, removeHabit, goals, addGoal, setOnboarded } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('habits')
  const [goalForm, setGoalForm] = useState({ title: '', heroId: selectedHeroes[0]?.id || '', targetValue: '', deadline: '' })

  const handleAddGoal = () => {
    const t = goalForm.title.trim()
    if (!t || !goalForm.heroId) return
    addGoal({ ...goalForm, targetValue: parseInt(goalForm.targetValue) || 100 })
    setGoalForm({ title: '', heroId: selectedHeroes[0]?.id || '', targetValue: '', deadline: '' })
  }

  const handleFinish = () => {
    setOnboarded(true)
    navigate('/dashboard')
  }

  const totalHabits = habits.length
  const totalGoals = goals.length

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid relative overflow-hidden">
      <div className="scan-line opacity-20" />

      {/* Header */}
      <div className="text-center pt-10 pb-6 px-6 page-enter">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-mono text-xs text-plasma-400 uppercase tracking-widest"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <Zap size={12} />
          Step 2 of 2
        </div>
        <h1 className="font-display text-5xl text-plasma-400 tracking-wider mb-2">
          FORGE YOUR ARSENAL
        </h1>
        <p className="font-body text-slate-400">Add habits and goals for each of your heroes.</p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-2 mb-6 p-1 rounded-xl"
          style={{ background: 'rgba(5,12,20,0.6)', border: '1px solid rgba(0,245,255,0.1)' }}>
          {[
            { key: 'habits', label: `Daily Habits (${totalHabits})`, icon: '⚡' },
            { key: 'goals', label: `Major Goals (${totalGoals})`, icon: '🎯' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2.5 rounded-lg font-body font-semibold text-sm transition-all"
              style={tab === t.key
                ? { background: 'rgba(0,245,255,0.15)', color: '#00f5ff' }
                : { color: 'rgba(148,163,184,0.5)' }
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
                      <p className="font-mono text-xs text-slate-500">{hero.domain} · {heroHabits.length} habit{heroHabits.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Existing habits */}
                  {heroHabits.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {heroHabits.map(h => (
                        <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Check size={13} style={{ color: hero.colorHex, flexShrink: 0 }} />
                            <span className="font-body text-sm text-slate-300 truncate">{h.name}</span>
                            <span className="font-mono text-xs text-slate-600 flex-shrink-0">{h.frequency}</span>
                          </div>
                          <button
                            onClick={() => removeHabit(h.id)}
                            className="text-slate-600 hover:text-ember-400 transition-colors flex-shrink-0 ml-2 p-1"
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
                        <p className="font-body font-semibold text-slate-200 text-sm truncate">{g.title}</p>
                        <p className="font-mono text-xs text-slate-500">
                          Target: {g.targetValue} · {hero?.name}
                          {g.deadline && ` · Due ${g.deadline}`}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: hero?.colorHex || '#00f5ff', color: hero?.colorHex || '#00f5ff' }}>
                        <span className="font-mono text-xs font-bold">0%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Finish */}
        <div className="mt-10 pb-10 text-center">
          {totalHabits >= 1 ? (
            <div className="space-y-3">
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                {totalHabits} habit{totalHabits !== 1 ? 's' : ''} · {totalGoals} goal{totalGoals !== 1 ? 's' : ''}
              </p>
              <button onClick={handleFinish} className="btn-primary px-12 py-4 text-base">
                Enter the Arena
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <p className="font-mono text-xs text-slate-600 uppercase tracking-wider">
              Add at least 1 habit to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
