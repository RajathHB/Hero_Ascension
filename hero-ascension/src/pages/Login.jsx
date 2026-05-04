import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Sparkles, User, Mail, Lock, ArrowRight, Github, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const { login, signup } = useApp()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        await signup(formData.name, formData.email, formData.password)
      }
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.05] bg-hero-accent" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.03] bg-purple-400" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card p-10 md:p-14 shadow-2xl border-white ring-1 ring-black/[0.03]">
          
          <div className="flex flex-col items-center mb-12 text-center">
             <div className="w-20 h-20 rounded-3xl bg-hero-accent/10 flex items-center justify-center text-hero-accent mb-6 shadow-sm border border-hero-accent/10">
                <Sparkles size={40} className="animate-glow" />
             </div>
             <h1 className="font-serif text-4xl text-hero-text mb-3 tracking-tight">Hero Ascension.</h1>
             <p className="text-hero-muted text-sm font-medium">Initiate your transformation protocol.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="label-hero">Hero Designation</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-hero-muted/50" size={18} />
                  <input 
                    type="text" 
                    placeholder="Enter your name..." 
                    className="input-hero pl-14"
                    required={!isLogin}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="label-hero">Neural Sync Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-hero-muted/50" size={18} />
                <input 
                  type="email" 
                  placeholder="hero@ascension.com" 
                  className="input-hero pl-14"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-hero">Security Sequence</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-hero-muted/50" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="input-hero pl-14"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-hero w-full py-5 text-base mt-4 flex items-center justify-center">
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" /> 
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Initiate Sync' : 'Register Identity'} <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-10 text-xs font-bold uppercase tracking-widest text-hero-muted hover:text-hero-text transition-colors"
          >
            {isLogin ? "No identity found? Register now" : "Already registered? Return to sync"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
