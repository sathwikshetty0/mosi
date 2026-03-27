'use client'

import { useState, Suspense } from 'react'
import { login, signup, signInWithGoogle } from './actions'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react'

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white">
      {/* ── LEFT PANEL — Branding (hidden on mobile, shown on lg+) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-slate-800 p-14 relative overflow-hidden">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute bottom-0 right-0 w-[70%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">M</span>
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">MOSI</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Intelligence
            </p>
          </div>
        </div>

        {/* Centre quote */}
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-1 bg-blue-500 rounded-full" />
          <h2 className="text-white text-3xl font-bold leading-snug tracking-tight">
            Turn stakeholder<br />conversations into<br />strategic intelligence.
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Capture, synthesise, and share insights from every interview using the CEED framework.
          </p>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { val: 'CEED', label: 'Framework' },
            { val: 'AI', label: 'Synthesis' },
            { val: '100%', label: 'Secure' },
          ].map(s => (
            <div key={s.label} className="space-y-1">
              <p className="text-white font-black text-xl">{s.val}</p>
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-7 sm:space-y-8"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">M</span>
            </div>
            <h1 className="text-slate-800 font-black text-xl tracking-tight">MOSI</h1>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {isLogin ? 'Sign in to your MOSI workspace.' : 'Start capturing stakeholder intelligence.'}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form action={isLogin ? login : signup} onSubmit={() => setIsLoading(true)} className="space-y-4">

            {/* Full Name — signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label htmlFor="fullName" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      id="fullName" name="fullName"
                      placeholder="John Doe"
                      required={!isLogin}
                      className="w-full h-12 sm:h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-base sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="email" name="email" type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full h-12 sm:h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-base sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="password" name="password" type="password"
                  placeholder="••••••••"
                  required
                  className="w-full h-12 sm:h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-base sm:text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-800/10 group"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-widest">or</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full h-12 sm:h-12 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:border-slate-300"
            >
              {/* Google 'G' icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <p className="text-center text-sm text-slate-400 pb-4 sm:pb-0">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-700 font-bold hover:text-blue-600 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
