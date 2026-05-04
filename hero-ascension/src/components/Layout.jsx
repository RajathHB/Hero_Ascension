import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const { user, logout, selectedHero } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-hero-bg text-hero-text font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-black/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-hero-accent/10 flex items-center justify-center text-hero-accent">
            <Sparkles size={18} className="animate-glow" />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">Hero Ascension.</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-hero-muted hidden md:inline">
            {user?.name || 'Hero'} • {selectedHero?.trait || '—'}
          </span>
          <button onClick={handleLogout} className="w-9 h-9 rounded-lg bg-black/[0.02] flex items-center justify-center text-hero-muted hover:text-red-500 hover:bg-red-50 transition-all border border-black/[0.03]">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.04] bg-hero-accent" />
        <div className="absolute bottom-[5%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.03] bg-purple-400" />
      </div>
    </div>
  )
}
