'use client'

import { useState } from 'react'
import { login, signup, signInWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Chrome, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    // The form will handle the server action automatically via action prop, 
    // but we can use this to show a loader if we wanted to handle it manually.
    // However, for simplicity and standard Next.js behavior, we'll let the form action run.
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white p-4 font-['Inter',_sans-serif]">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-4"
          >
            <div className="w-12 h-12 flex items-center justify-center">
               <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-400 fill-current">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
               </svg>
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/40 text-sm">
            {isLogin ? 'Enter your credentials to access MOSI' : 'Join the most advanced interview platform'}
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-x-0 space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="text-xs font-medium text-white/60 ml-1">FULL NAME</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                    <Input 
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe" 
                      className="bg-white/[0.05] border-white/10 h-12 pl-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-white/60 ml-1">EMAIL ADDRESS</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="name@company.com" 
                  className="bg-white/[0.05] border-white/10 h-12 pl-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-medium text-white/60">PASSWORD</Label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest font-bold">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-white/[0.05] border-white/10 h-12 pl-12 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050505] px-2 text-white/30 tracking-widest font-bold">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              onClick={() => signInWithGoogle()}
              className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-all border-white/10 group"
            >
              <Chrome className="mr-2 h-4 w-4 text-white group-hover:text-blue-400 transition-colors" />
              Sign in with Google
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-white/40 text-xs text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-white font-semibold hover:text-blue-400 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
