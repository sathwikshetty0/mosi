'use client'

import { useEffect, useState, useMemo } from 'react'
import { useMosiStore } from '@/lib/store'
import { 
  Users, Video, BarChart3, Search, Filter, ShieldCheck, 
  Clock, Zap, Activity, Globe, Database, UserCheck, Inbox
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { InterviewCard } from '@/components/ui/interview-card'

export default function AdminDashboard() {
  const { sessions, fetchSessions, profiles, fetchAllProfiles } = useMosiStore()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'overview' | 'users' | 'archive'>('overview')

  useEffect(() => {
    fetchSessions()
    fetchAllProfiles()
  }, [fetchSessions, fetchAllProfiles])

  // Advanced Stats Calculation
  const stats = useMemo(() => {
    const totalUsers = (profiles || []).length
    const totalSessions = (sessions || []).length
    const avgInsightsPerUser = totalUsers > 0 ? (totalSessions / totalUsers).toFixed(1) : '0'
    const publishedRate = totalSessions > 0 ? Math.round((sessions.filter(s => s.status === 'Published').length / totalSessions) * 100) : 0

    return { totalUsers, totalSessions, avgInsightsPerUser, publishedRate }
  }, [profiles, sessions])

  const userStats = useMemo(() => {
    return (profiles || []).map(p => ({
      ...p,
      sessionCount: sessions.filter(s => s.user_id === p.id).length,
      insightCount: sessions.filter(s => s.user_id === p.id).reduce((acc, s) => acc + (s.opportunities?.length || 0), 0)
    }))
  }, [profiles, sessions])

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 font-['Inter']">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        
        {/* 🏢 CORPORATE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-3">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                   <Database className="w-5 h-5 text-blue-400" />
                </div>
                <Badge className="text-[10px] uppercase font-black tracking-widest bg-blue-500/5 text-blue-400 border-blue-500/20 px-3 py-1">Master Console</Badge>
             </div>
             <h1 className="text-4xl font-black tracking-tight text-white">Platform Oversight</h1>
             <p className="text-white/40 text-lg font-medium">Central intelligence and administrative controls for all MOSI sessions.</p>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-2xl">
             {['overview', 'users', 'archive'].map((v) => (
               <button
                key={v}
                onClick={() => setView(v as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
               >
                 {v}
               </button>
             ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* 📊 PLATFORM PULSE */}
          {view === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Platform Users', val: stats.totalUsers, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'Global Sessions', val: stats.totalSessions, icon: Video, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Avg. Activity', val: `${stats.avgInsightsPerUser} s/u`, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Release Rate', val: `${stats.publishedRate}%`, icon: Globe, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.06] transition-all group border-b-4 border-b-transparent hover:border-b-blue-500/40">
                     <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6" />
                     </div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                     <h3 className="text-4xl font-black">{item.val}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* USER ACTIVITY BOARD */}
                 <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-bold flex items-center gap-3">
                          <Users className="w-5 h-5 text-blue-400" /> Top Researchers
                       </h3>
                       <button onClick={() => setView('users')} className="text-[10px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">See all</button>
                    </div>
                    <div className="space-y-4">
                       {userStats.slice(0, 5).sort((a, b) => b.sessionCount - a.sessionCount).map((user, i) => (
                         <div key={user.id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center font-bold text-blue-300 border border-white/5">
                                  {user.full_name?.[0] || '?'}
                               </div>
                               <div>
                                  <p className="text-base font-bold text-white/90 group-hover:text-white transition-colors">{user.full_name || 'Anonymous'}</p>
                                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{user.role}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black text-white">{user.sessionCount}</p>
                               <p className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Interviews</p>
                            </div>
                         </div>
                       ))}
                       {userStats.length === 0 && <p className="text-center py-10 text-white/20 font-bold uppercase tracking-widest">No researchers tracked</p>}
                    </div>
                 </div>

                 {/* GLOBAL VOLUME CHART */}
                 <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center space-y-10 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-blue-600/5 blur-[100px] -z-10 group-hover:bg-blue-600/10 transition-all duration-700" />
                    <div className="h-56 w-56 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center relative shadow-2xl shadow-blue-500/5 transition-all group-hover:border-white/10">
                      <Activity className="w-12 h-12 text-blue-400 mb-2 animate-pulse" />
                      <span className="text-5xl font-black tracking-tighter">{sessions.length}</span>
                      <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mt-1">Global Volume</span>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-full border-t-2 border-blue-500/40 rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xl font-bold text-white/80">Platform Throughput</h4>
                       <p className="text-white/40 text-sm font-medium max-w-xs leading-relaxed">System-wide monitoring of interview distribution and data saturation across all active accounts.</p>
                       <div className="flex gap-2 justify-center">
                          {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-1 bg-white/5 rounded-full" />)}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* 👤 USER REGISTRY */}
          {view === 'users' && (
             <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
             >
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                   <table className="w-full text-left">
                      <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                         <tr>
                            <th className="px-10 py-8">Researcher</th>
                            <th className="px-10 py-8">Status/Role</th>
                            <th className="px-10 py-8">Activity</th>
                            <th className="px-10 py-8">Impact Metrics</th>
                            <th className="px-10 py-8 text-right">System ID</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {userStats.map(user => (
                           <tr key={user.id} className="hover:bg-white/[0.03] transition-all group">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                                       {user.full_name?.[0] || 'U'}
                                    </div>
                                    <div className="space-y-0.5">
                                       <span className="text-base font-bold text-white/90 group-hover:text-white transition-colors">{user.full_name || 'Anonymous'}</span>
                                       <p className="text-xs text-white/30 font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <Badge className={`${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-white/60 border-white/10'} text-[10px] uppercase font-black px-3 py-1`}>
                                    {user.role}
                                 </Badge>
                              </td>
                              <td className="px-10 py-8 font-black text-2xl text-white/90">{user.sessionCount}</td>
                              <td className="px-10 py-8">
                                 <div className="space-y-3 w-48">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                                       <span>Insights Map</span>
                                       <span className="text-blue-400">{user.insightCount}⚡</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                       <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(user.sessionCount * 12, 100)}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className="h-full bg-blue-500" 
                                       />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 font-mono text-[10px] text-white/10 text-right group-hover:text-white/30 transition-colors uppercase tracking-widest">{user.id.split('-')[0]}...</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}

          {/* 📀 GLOBAL REPOSITORY */}
          {view === 'archive' && (
             <motion.div 
              key="archive"
              initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-10"
             >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                   <div className="space-y-1">
                      <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em]">The Deep Repository</h2>
                      <p className="text-sm font-medium text-white/20">Audit-level access to all platform raw data.</p>
                   </div>
                   <div className="bg-white/5 p-2 rounded-2xl flex items-center gap-3 border border-white/10 w-full md:w-96 pl-4 group focus-within:border-blue-500/40 transition-all">
                      <Search className="w-5 h-5 text-white/20 group-focus-within:text-blue-400" />
                      <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter platform sessions..." 
                        className="bg-transparent border-none h-10 text-sm font-bold p-0 focus:ring-0 placeholder:text-white/10" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {sessions.filter(s => 
                     (s.stakeholder?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                     (s.stakeholder?.company || '').toLowerCase().includes(search.toLowerCase())
                   ).map((s, i) => (
                     <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                     >
                       <InterviewCard 
                        id={s.id}
                        stakeholder={s.stakeholder?.name || 'Anonymous'}
                        company={s.stakeholder?.company || 'N/A'}
                        sector={s.stakeholder?.sector || 'N/A'}
                        date={s.date}
                        status={s.status}
                        opportunityCount={s.opportunities?.length || 0}
                       />
                     </motion.div>
                   ))}
                   {sessions.length === 0 && (
                     <div className="col-span-full py-40 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] text-center space-y-4">
                        <Inbox className="w-16 h-16 text-white/5 mx-auto" />
                        <h3 className="text-lg font-bold text-white/20 uppercase tracking-[0.3em]">Master Database Empty</h3>
                        <p className="text-sm text-white/10 font-medium">Awaiting first successful architectural sync.</p>
                     </div>
                   )}
                </div>
             </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
