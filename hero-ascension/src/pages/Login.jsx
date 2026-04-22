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
      let data
      if (mode === 'signup') {
        data = await apiSignup(form.name, form.email, form.password)
      } else {
        data = await apiLogin(form.email, form.password)
      }
      // Pass user_id from backend so localStorage is scoped per-user
      login({
        userId: data.user_id,
        email: data.email || form.email,
        name: data.name || form.name || form.email.split('@')[0],
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'rgba(42,157,143,0.08)' }} />
      <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'rgba(233,196,106,0.08)' }} />

      <div className="w-full max-w-md page-enter">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative"
            style={{ background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.15)' }}>
            <Shield size={40} className="text-plasma-400" />
          </div>
          <h1 className="font-display text-5xl text-plasma-400 tracking-widest">
            HERO ASCENSION
          </h1>
          <p className="font-mono text-xs mt-2 tracking-widest uppercase" style={{ color: '#9E9A8C' }}>
            Your real life. Your hero journey.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 relative">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden mb-8 p-1 gap-1"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 rounded-lg font-body font-semibold text-sm uppercase tracking-wider transition-all duration-200"
                style={mode === m
                  ? { background: '#fff', color: '#2A9D8F', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { color: '#9E9A8C' }
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#9E9A8C' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl font-body text-sm"
                style={{ background: 'rgba(231,111,81,0.08)', border: '1px solid rgba(231,111,81,0.2)', color: '#E76F51' }}>
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
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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

          <p className="text-center font-mono text-xs mt-6" style={{ color: '#9E9A8C' }}>
            {mode === 'login' ? 'No account? ' : 'Already enlisted? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-plasma-400 hover:underline font-semibold"
            >
              {mode === 'login' ? 'Enlist now' : 'Access your account'}
            </button>
          </p>
        </div>

        <p className="text-center font-mono text-xs mt-6" style={{ color: '#C4BFAE' }}>
          ◈ SECURE LOGIN · TRACK YOUR JOURNEY ◈
        </p>
      </div>
    </div>
  )
}
