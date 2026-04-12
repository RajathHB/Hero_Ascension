import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { signup as apiSignup, login as apiLogin } from '../api/client'
import { Zap, Shield, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useApp()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('All fields are required.'); return }
    if (mode === 'signup' && !form.name) { setError('Enter your hero name.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await apiSignup(form.name, form.email, form.password)
      } else {
        await apiLogin(form.email, form.password)
      }
      login(form.email, form.name || form.email.split('@')[0])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Scan line */}
      <div className="scan-line opacity-30" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: '#00f5ff' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: '#c084fc' }} />

      <div className="w-full max-w-md page-enter">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative"
            style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
            <Shield size={40} className="text-plasma-400" />
            <div className="absolute inset-0 rounded-2xl animate-pulse-slow"
              style={{ boxShadow: '0 0 30px rgba(0,245,255,0.2)' }} />
          </div>
          <h1 className="font-display text-5xl text-plasma-400 tracking-widest animate-glow">
            HERO ASCENSION
          </h1>
          <p className="font-mono text-xs text-slate-500 mt-2 tracking-widest uppercase">
            Your real life. Your hero journey.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 relative">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-tr" />
          <div className="corner-decoration corner-bl" />
          <div className="corner-decoration corner-br" />

          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-plasma-400/15 mb-8 p-1 gap-1"
            style={{ background: 'rgba(5,12,20,0.6)' }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded font-body font-semibold text-sm uppercase tracking-wider transition-all duration-200"
                style={mode === m
                  ? { background: 'rgba(0,245,255,0.15)', color: '#00f5ff', borderColor: 'rgba(0,245,255,0.3)' }
                  : { color: 'rgba(148,163,184,0.5)' }
                }
              >
                {m === 'login' ? '⚡ Access' : '🛡 Enlist'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="page-enter">
                <label className="label-text">Hero Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="What shall you be called?"
                  className="input-field"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="your@email.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="input-field pr-12"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg font-body text-sm text-ember-400"
                style={{ background: 'rgba(255,69,0,0.08)', border: '1px solid rgba(255,69,0,0.2)' }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base mt-2 h-12 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-void-900/40 border-t-void-900 rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  {mode === 'signup' ? 'Begin Ascension' : 'Enter the Arena'}
                </span>
              )}
            </button>
          </form>

          <p className="text-center font-mono text-xs text-slate-600 mt-6">
            {mode === 'login' ? 'No account? ' : 'Already enlisted? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-plasma-400 hover:underline"
            >
              {mode === 'login' ? 'Enlist now' : 'Access your account'}
            </button>
          </p>
        </div>

        <p className="text-center font-mono text-xs text-slate-700 mt-6">
          ◈ DATA STORED LOCALLY · NO SERVER REQUIRED ◈
        </p>
      </div>
    </div>
  )
}
