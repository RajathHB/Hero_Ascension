import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Login from './pages/Login'
import HeroSelect from './pages/HeroSelect'
import Dashboard from './pages/Dashboard'
import Stats from './pages/Stats'
import ManageHabits from './pages/ManageHabits'
import Layout from './components/Layout'

function AppRoutes() {
  const { user, onboarded, loading, selectedHeroId } = useApp()

  if (loading) return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-hero-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-hero-muted font-bold uppercase tracking-widest text-xs">Synchronizing Neural Link...</p>
      </div>
    </div>
  )

  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>

  // Safety: If onboarded but no hero is selected, force back to onboarding
  if (!onboarded || !selectedHeroId) return (
    <Routes>
      <Route path="/onboarding" element={<HeroSelect />} />
      <Route path="*" element={<Navigate to="/onboarding" />} />
    </Routes>
  )

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/manage" element={<ManageHabits />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
