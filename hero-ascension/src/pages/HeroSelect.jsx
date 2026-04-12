import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, HERO_ROSTER } from '../context/AppContext'
import HeroCard from '../components/HeroCard'
import { ArrowRight, Shield } from 'lucide-react'

export default function HeroSelect() {
  const { selectedHeroIds, toggleHeroSelection, confirmHeroSelection } = useApp()
  const navigate = useNavigate()

  const handleContinue = () => {
    if (selectedHeroIds.length === 0) return
    confirmHeroSelection()
    navigate('/setup')
  }

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid relative overflow-hidden">
      <div className="scan-line opacity-20" />

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-6 page-enter">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 font-mono text-xs text-plasma-400 uppercase tracking-widest"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <Shield size={12} />
          Step 1 of 2
        </div>
        <h1 className="font-display text-5xl sm:text-6xl text-plasma-400 tracking-wider mb-3">
          CHOOSE YOUR HEROES
        </h1>
        <p className="font-body text-slate-400 text-lg max-w-xl mx-auto">
          Select the life domains you want to master. Each hero represents a part of your journey.
          <span className="text-plasma-400"> You can pick multiple.</span>
        </p>
      </div>

      {/* Hero grid */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 page-enter page-enter-delay-1">
          {HERO_ROSTER.map(hero => (
            <HeroCard
              key={hero.id}
              hero={hero}
              selected={selectedHeroIds.includes(hero.id)}
              onClick={() => toggleHeroSelection(hero.id)}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-10 text-center page-enter page-enter-delay-2">
          {selectedHeroIds.length > 0 ? (
            <div className="space-y-3">
              <p className="font-mono text-sm text-slate-400">
                <span className="text-plasma-400 font-bold">{selectedHeroIds.length}</span>{' '}
                {selectedHeroIds.length === 1 ? 'hero' : 'heroes'} selected
              </p>
              <button onClick={handleContinue} className="btn-primary text-lg px-10 py-4">
                Set Up Habits
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <p className="font-mono text-sm text-slate-600 uppercase tracking-wider">
              Select at least one hero to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
