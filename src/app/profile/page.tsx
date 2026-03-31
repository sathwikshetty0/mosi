'use client'

import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useMosiStore } from '@/lib/store'
import { 
  User, Mail, Shield, ShieldCheck, 
  MapPin, Calendar, Video, Zap, 
  CheckCircle2, ArrowLeft, Edit, LogOut, Briefcase, RefreshCw, Home,
  Phone, Linkedin, Command, Globe, Fingerprint
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Caleb',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Sasha',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Toby',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Leila',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Kiki'
]

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth()
  const { sessions, fetchSessions } = useMosiStore()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  const [editForm, setEditForm] = React.useState({
    full_name: '',
    role_title: 'Principal Strategic Researcher',
    department: 'Enterprise Intelligence Unit',
    place: 'Global Digital HQ',
    phone: '',
    linkedin: '',
    public_email: '',
    bio: '',
    avatar_url: ''
  })

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        role_title: profile.role_title || 'Principal Strategic Researcher',
        department: profile.department || 'Enterprise Intelligence Unit',
        place: profile.place || 'Global Digital HQ',
        phone: profile.phone || '',
        linkedin: profile.linkedin || '',
        public_email: profile.public_email || user?.email || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile, user?.email])

  React.useEffect(() => {
    if (user) fetchSessions()
  }, [fetchSessions, user])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchSessions()
    setIsRefreshing(false)
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    setIsRefreshing(true)
    const { error } = await supabase!
      .from('profiles')
      .update(editForm)
      .eq('id', user.id)
    
    if (!error) {
      window.location.reload() // Quickest way to sync all context
    }
    setIsRefreshing(false)
    setIsEditing(false)
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

  // Unified Identity Variables
  const userName = editForm.full_name || user.email?.split('@')[0] || 'Unknown Researcher'
  const userCreatedAt = profile?.updated_at || user.created_at
  const userSessions = sessions.filter(s => s.user_id === user.id) || []
  const totalInsights = userSessions.reduce((acc, s) => acc + (s.opportunities?.length || 0), 0)
  const totalPublished = userSessions.filter(s => s.status === 'Published').length
  const initials = userName[0]?.toUpperCase() || 'U'

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
         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-32 -translate-y-32 -z-10 group-hover:bg-blue-50/50 transition-colors" />
         
         <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white border-2 border-slate-100 rounded-[2.5rem] flex items-center justify-center text-4xl sm:text-5xl font-black text-slate-800 shadow-xl relative group-hover:scale-105 transition-transform overflow-hidden">
               {editForm.avatar_url ? (
                  <img src={editForm.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white">
                    {initials}
                  </div>
               )}
               <div className="absolute -bottom-2 -right-2 bg-blue-500 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
               </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
               {isEditing ? (
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Protocol Avatar Matrix</p>
                       <div className="flex flex-wrap gap-2">
                          {AVATAR_OPTIONS.map(url => (
                             <button 
                                key={url}
                                onClick={() => setEditForm({...editForm, avatar_url: url})}
                                className={cn(
                                   "w-12 h-12 rounded-xl border-2 transition-all p-0.5 overflow-hidden active:scale-95",
                                   editForm.avatar_url === url 
                                      ? "border-blue-500 bg-blue-50 scale-110 shadow-lg" 
                                      : "border-slate-50 bg-slate-50 hover:border-slate-200 grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
                                )}
                             >
                                <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
                          <input value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Role</label>
                          <input value={editForm.role_title} onChange={e => setEditForm({...editForm, role_title: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Place / HQ</label>
                          <input value={editForm.place} onChange={e => setEditForm({...editForm, place: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Verification Email</label>
                          <input value={editForm.public_email} onChange={e => setEditForm({...editForm, public_email: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">LinkedIn URL</label>
                          <input value={editForm.linkedin} onChange={e => setEditForm({...editForm, linkedin: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" placeholder="linkedin.com/in/username" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Contact Number</label>
                          <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm" placeholder="+1..." />
                       </div>
                       <div className="md:col-span-2 space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Professional Bio / Mission</label>
                          <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full h-20 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm resize-none" />
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 text-center sm:text-left">
                    <div className="space-y-1">
                       <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{userName}</h1>
                       <p className="text-lg font-bold text-blue-600 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-wide">
                          <Briefcase className="w-4 h-4" /> {editForm.role_title}
                       </p>
                    </div>
                    {editForm.bio && (
                       <p className="text-sm text-slate-500 leading-relaxed max-w-xl italic border-l-2 border-slate-100 pl-4">{editForm.bio}</p>
                    )}

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-slate-400 font-bold text-[11px] uppercase tracking-widest pt-2">
                      <span className="flex items-center gap-2 leading-none">
                        <Mail className="w-4 h-4 text-slate-300" /> {editForm.public_email || user.email}
                      </span>
                      {editForm.phone && (
                        <span className="flex items-center gap-2 leading-none">
                            <Phone className="w-4 h-4 text-slate-300" /> {editForm.phone}
                        </span>
                      )}
                      {editForm.linkedin && (
                        <a href={editForm.linkedin.startsWith('http') ? editForm.linkedin : `https://${editForm.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 leading-none text-blue-500 hover:text-blue-600 transition-colors">
                            <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                      <span className="flex items-center gap-2 leading-none">
                        <Shield className="w-4 h-4 text-slate-300" /> Verified Identity
                      </span>
                    </div>
                 </div>
               )}

               <div className="pt-6 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="h-10 px-6 bg-slate-100/80 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2 border border-slate-200"
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                       <button 
                          onClick={handleUpdateProfile}
                          className="h-10 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2"
                        >
                          Save Identity
                       </button>
                       <button 
                          onClick={() => setIsEditing(false)}
                          className="h-10 px-6 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                          Cancel
                       </button>
                    </div>
                  )}
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
          { label: 'Retention Yr', val: userCreatedAt ? new Date(userCreatedAt).getFullYear() : '—', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Institutional Protocol Card */}
      <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-12 space-y-10 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full translate-x-32 -translate-y-32 blur-[80px] -z-10" />
         
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="space-y-4 text-center sm:text-left">
               <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center justify-center sm:justify-start gap-2">
                  <Zap className="w-4 h-4" /> Protocol Intelligence
               </h3>
               <p className="text-2xl sm:text-3xl font-black leading-tight text-slate-800 max-w-xl">
                 "Advancing stakeholder intelligence through institutional synthesis and discovery."
               </p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={() => router.push('/')} className="h-12 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl active:scale-95 group-hover:scale-105 mx-auto sm:mx-0">
                  <Home className="w-4 h-4" /> Finalize Dashboard
               </button>
            </div>
         </div>

         <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
               { label: 'Strategic Role', val: editForm.role_title, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
               { label: 'Institutional Unit', val: editForm.department, icon: Command, color: 'text-slate-500', bg: 'bg-slate-50' },
               { label: 'Geographic Sync', val: editForm.place, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-50' },
               { label: 'Institutional Email', val: editForm.public_email || user.email, icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
               { label: 'Contact Number', val: editForm.phone || 'No direct number', icon: Phone, color: 'text-indigo-500', bg: 'bg-indigo-50' },
               { label: 'Access ID', val: `STK-${user.id.substring(0, 8).toUpperCase()}`, icon: Fingerprint, color: 'text-rose-500', bg: 'bg-rose-50' }
            ].map(detail => (
               <div key={detail.label} className="flex items-center gap-5 group/protocol">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 transition-all duration-500 shadow-sm", detail.bg, detail.color)}>
                     <detail.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">{detail.label}</p>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{detail.val}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>
    </div>
  )
}
