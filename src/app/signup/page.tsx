'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, Lock, User, 
  ArrowRight, ShieldCheck, Sparkles, 
  Fingerprint, Command, Shield 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // 🛡️ SECURITY PROTOCOL: Password Matching
    if (password !== confirmPassword) {
      setError('Passwords do not match. Integrity check failed.')
      setLoading(false)
      return
    }

    // 1. Auth Signup
    const { data: authData, error: signupError } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase!.from('profiles').insert({ id: authData.user.id, full_name: fullName, role: 'researcher' })
    }

    setSuccess(true)
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center animate-in fade-in duration-1000">
         <div className="max-w-md space-y-8">
            <div className="w-24 h-24 bg-blue-50/50 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto border border-blue-100 shadow-2xl relative">
              <Mail className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Protocol established</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                A verification link has been sent to <span className="text-slate-900 font-bold">{email}</span>. Please confirm your identity to activate your institutional profile.
              </p>
            </div>
            <button onClick={() => router.push('/login')} className="h-14 px-10 bg-[#1E293B] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0F172A] transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl active:scale-95">
              Access Terminal <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* 🎭 LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] p-16 flex-col justify-between text-white relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />

         <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white text-sm font-black border border-white/10 shadow-2xl">M</div>
               <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase leading-none">MOSI</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Intelligence</p>
               </div>
            </div>

            <div className="pt-24 space-y-8 max-w-md">
               <div className="w-12 h-1 bg-blue-600 rounded-full" />
               <h1 className="text-5xl font-black leading-[1.1] tracking-tighter">
                 Turn stakeholder conversations into strategic intelligence.
               </h1>
               <p className="text-lg text-slate-400 font-medium leading-relaxed">
                 Capture, synthesise, and share insights from every interview using the CEED framework.
               </p>
            </div>
         </div>

         <div className="relative z-10 flex items-center gap-12 pt-20">
            {['CEED Framework', 'AI Synthesis', '100% Secure'].map(tag => (
              <div key={tag}>
                 <p className="text-xl font-black text-white">{tag.split(' ')[0]}</p>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{tag.split(' ')[1] || ' '}</p>
              </div>
            ))}
         </div>
      </div>

      {/* 📝 RIGHT PANEL - SIGNUP */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:py-16 relative overflow-y-auto no-scrollbar animate-in fade-in duration-1000">
        <div className="w-full max-w-[400px] space-y-8 pt-10 pb-10">
           
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create account</h2>
              <p className="text-sm text-slate-400 font-medium">Start capturing stakeholder intelligence.</p>
           </div>

           <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                 <div className="relative group/input">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      required
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                 <div className="relative group/input">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="researcher@organization.com"
                      className="w-full h-14 pl-12 pr-4 bg-blue-50/20 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                      required
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                   <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 px-4 bg-blue-50/20 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all" required />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirm Signature</label>
                   <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 px-4 bg-blue-50/20 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all" required />
                 </div>
              </div>

              {error && <p className="text-[10px] font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl text-center border border-rose-100 uppercase tracking-widest">{error}</p>}

              <button disabled={loading} className="w-full h-14 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group">
                 {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
           </form>

           <div className="relative flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
           </div>

           <button onClick={handleGoogleLogin} className="w-full h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center gap-4 hover:border-slate-200 transition-all active:scale-[0.98]">
              <div className="w-6 h-6 flex items-center justify-center">
                 <svg className="w-4.5 h-4.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
              <span className="text-sm font-bold text-slate-700">Continue with Google</span>
           </button>

           <div className="text-center pt-8 pb-4">
              <p className="text-sm text-slate-400 font-medium">
                Already have an account? <Link href="/login" className="text-slate-900 font-bold hover:underline ml-1">Sign in</Link>
              </p>
           </div>
        </div>
      </div>

    </div>
  )
}
