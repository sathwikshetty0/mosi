'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useMosiStore } from '@/lib/store'
import { 
  User, Mail, Shield, ShieldCheck, 
  MapPin, Calendar, Video, Zap, 
  CheckCircle2, ArrowLeft, Edit, LogOut, Briefcase, RefreshCw, Home
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth()
  const { sessions, fetchSessions } = useMosiStore()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    if (user) fetchSessions()
  }, [fetchSessions, user])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSessions()
    setIsRefreshing(false)
  }

  // 🛡️ LOADING / AUTH ERROR STATE
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
          <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Syncing Identity...</p>
      </div>
    )
  }

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
             <Shield className="w-8 h-8" />
          </div>
          <div className="text-center">
             <h2 className="text-xl font-bold text-slate-800">Auth Signature Missing</h2>
             <p className="text-sm text-slate-400 font-medium">Please sign in to view your researcher credentials.</p>
          </div>
          <button onClick={() => router.push('/login')} className="h-11 px-8 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
             Go to Login
          </button>
       </div>
    )
  }

  // Fallback for missing profile
  const userName = profile?.full_name || user.email?.split('@')[0] || 'Unknown Researcher'
  const userRole = profile?.role || 'Guest Researcher'
  const userCreatedAt = profile?.updated_at || user.created_at

  const userSessions = sessions.filter(s => s.user_id === user.id) || []
  const totalInsights = userSessions.reduce((acc, s) => acc + (s.opportunities?.length || 0), 0)
  const totalPublished = userSessions.filter(s => s.status === 'Published').length
  const initials = userName[0].toUpperCase()

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header — Back to Dashboard */}
      <header className="flex items-center justify-between mb-8 sm:mb-12">
        <button 
           onClick={() => router.push('/')}
           className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white hover:border-slate-300 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-2">
            <button 
               onClick={handleRefresh}
               className={cn(
                  "h-10 px-5 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2",
                  isRefreshing && "opacity-50 pointer-events-none"
               )}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> {isRefreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button 
               onClick={signOut}
               className="h-10 px-5 bg-white border border-rose-100 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              Sign Out <LogOut className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Profile Info - Hero Section */}
      <section className="bg-white border border-slate-100/60 rounded-[2.5rem] p-8 sm:p-12 mb-8 shadow-sm relative overflow-hidden group">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-32 -translate-y-32 -z-10 group-hover:bg-blue-50/50 transition-colors" />
         
         <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-slate-800 to-black rounded-[2.5rem] flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-2xl relative group-hover:scale-105 transition-transform">
               {initials}
               <div className="absolute -bottom-2 -right-2 bg-blue-500 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
               </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
               <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{userName}</h1>
                  <p className="text-lg font-bold text-blue-600 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-wide">
                     <Briefcase className="w-4 h-4" /> {userRole}
                  </p>
               </div>

               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                  <span className="flex items-center gap-2 leading-none">
                     <Mail className="w-4 h-4 text-slate-300" /> {user.email}
                  </span>
                  <span className="flex items-center gap-2 leading-none">
                     <Shield className="w-4 h-4 text-slate-300" /> Verified Researcher
                  </span>
               </div>

               <div className="pt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button className="h-10 px-6 bg-slate-100/80 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2 border border-slate-200">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
        {[
          { label: 'Total Sessions', val: userSessions.length, icon: Video, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'Insight Density', val: totalInsights, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Briefs Published', val: totalPublished, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Retention Yr', val: new Date(userCreatedAt).getFullYear(), icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 space-y-4 hover:shadow-md hover:border-slate-200 transition-all group">
             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", s.bg, s.color)}>
                <s.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{s.val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
             </div>
          </div>
        ))}
      </section>

      {/* Professional Identity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 items-start">
         <section className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Zap className="w-4 h-4" /> Protocol Identity
                  </h3>
                  <p className="text-2xl sm:text-3xl font-black leading-tight text-white/95 max-w-xl">
                    "Advancing stakeholder intelligence through synthesis and discovery."
                  </p>
               </div>
               <div className="flex flex-col gap-3">
                  <button onClick={() => router.push('/')} className="h-12 px-8 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2 group-hover:scale-105">
                     <Home className="w-4 h-4" /> Go to Dashboard
                  </button>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Access Protocol</p>
                    <p className="text-sm font-bold text-white truncate">{userRole} Credentials</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10">
                     <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Service Cluster</p>
                    <p className="text-sm font-bold text-white truncate">Global Discovery Platform</p>
                  </div>
               </div>
            </div>
         </section>
      </div>

    </div>
  )
}
