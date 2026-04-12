import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Settings, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import clsx from 'clsx'

export default function Layout() {
  const { user, logout } = useApp()

  return (
    <div className="min-h-screen bg-hero-gradient bg-grid-pattern bg-grid flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-plasma-400/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-plasma-400/10 border border-plasma-400/30 flex items-center justify-center">
            <span className="text-plasma-400 font-display text-sm">HA</span>
          </div>
          <span className="font-display text-xl text-plasma-400 tracking-widest">HERO ASCENSION</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-slate-500 uppercase tracking-wider hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-ember-400 hover:bg-ember-400/10 transition-all text-sm font-body font-semibold"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Exit</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2">
        <div className="glass-card max-w-sm mx-auto flex items-center justify-around px-2 py-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <LayoutDashboard size={20} />
            <span>Command</span>
          </NavLink>
          <NavLink
            to="/manage"
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <Settings size={20} />
            <span>Manage</span>
          </NavLink>
          <NavLink
            to="/progress"
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <Trophy size={20} />
            <span>Heroes</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
