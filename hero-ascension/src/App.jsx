import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Login from './pages/Login'
import HeroSelect from './pages/HeroSelect'
import HabitSetup from './pages/HabitSetup'
import Dashboard from './pages/Dashboard'
import HeroProgress from './pages/HeroProgress'
import ManageHabits from './pages/ManageHabits'
import Layout from './components/Layout'

function AppRoutes() {
  const { user, heroes, onboarded } = useApp()

  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>
  if (!onboarded) return (
    <Routes>
      <Route path="/select-heroes" element={<HeroSelect />} />
      <Route path="/setup" element={<HabitSetup />} />
      <Route path="*" element={<Navigate to="/select-heroes" />} />
    </Routes>
  )

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<HeroProgress />} />
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
