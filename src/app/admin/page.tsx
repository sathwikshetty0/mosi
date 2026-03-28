'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Users, Video, Search, ShieldCheck, 
  Zap, Activity, UserCheck, Inbox,
  BarChart3, Clock, TrendingUp, Globe, CheckCircle2, Trash2,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, FileText, Briefcase, MapPin,
  Headphones, Sparkles, Check, X, Share, ChevronRight, UserPlus, Fingerprint
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SessionData {
  id: string
  status: string
  date: string
  duration: number
  summary?: string
  user_id?: string
  recording_url?: string
  stakeholders: { id?: string; name: string; role: string; company: string; sector: string; employees?: string; geography?: string; domain?: string; email?: string } | null
  opportunities: { id: string; tag: string; title: string; description?: string; paid?: boolean; duration?: string; skills?: string; toolset?: string; engagementType?: string; status?: string }[]
  evidence: { id: string; type?: string; url?: string; title?: string; opportunity_id?: string }[]
}

interface ProfileData {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  updated_at: string
}

const statusConfig: Record<string, { pill: string; label: string }> = {
  Scheduled: { pill: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'Scheduled' },
  Recording: { pill: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Live' },
  Review:    { pill: 'bg-amber-50 text-amber-600 border-amber-100', label: 'In Review' },
  Published: { pill: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Published' },
}

const tagColors: Record<string, { text: string; border: string; bg: string }> = {
  Core: { text: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50/50' },
  Efficiency: { text: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50/50' },
  Expansion: { text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/50' },
  Disrupt: { text: 'text-rose-600', border: 'border-rose-100', bg: 'bg-rose-50/50' },
}

type Tab = 'overview' | 'sessions' | 'users' | 'stakeholders'

// ─── INLINE SESSION DETAIL PANEL ───
function SessionDetailPanel({ session, profiles, onClose, onPublish, onDelete, onAssign }: { 
  session: SessionData; 
  profiles: ProfileData[];
  onClose: () => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onAssign: (id: string, userId: string | null) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  
  const stakeholder = session.stakeholders
  const opportunities = session.opportunities || []
  const cfg = statusConfig[session.status] || statusConfig.Review
  const isPublished = session.status === 'Published'
  const currentResearcher = profiles.find(p => p.id === session.user_id)

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Back + Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        <button onClick={onClose} className="w-10 h-10 sm:w-11 sm:h-11 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-white transition-all shrink-0 shadow-sm mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest', cfg.pill)}>
              {cfg.label}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{session.date}</span>
            {currentResearcher && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="w-3 h-3" /> {currentResearcher.full_name}
              </span>
            )}
            {!currentResearcher && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-widest">Unassigned</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{stakeholder?.name || 'Unknown Stakeholder'}</h2>
          <p className="text-sm text-slate-500 font-medium">{stakeholder?.role || 'N/A'} · <span className="text-slate-700 font-bold">{stakeholder?.company || 'N/A'}</span></p>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={() => setIsAssigning(!isAssigning)} className="h-10 px-4 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2">
             <UserPlus className="w-3.5 h-3.5" /> {session.user_id ? 'Reassign' : 'Assign'}
           </button>
        </div>
      </div>

      {isAssigning && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-slate-100 border border-slate-200 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-2">
          {profiles.map(p => (
            <button key={p.id} onClick={() => { onAssign(session.id, p.id); setIsAssigning(false) }} className={cn("px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-all border", p.id === session.user_id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400 hover:text-blue-600")}>
                {p.full_name.split(' ')[0]}
            </button>
          ))}
          <button onClick={() => { onAssign(session.id, null); setIsAssigning(false) }} className="px-3 py-2 bg-white text-rose-500 border border-rose-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50">
            Unassign
          </button>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        {!isPublished && (
          <button 
            onClick={() => onPublish(session.id)}
            className="h-11 px-6 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Check className="w-4 h-4" /> Publish
          </button>
        )}
        {isPublished && (
          <div className="h-11 px-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Published
          </div>
        )}
        <button 
          onClick={() => { if (confirm('Delete this session permanently?')) onDelete(session.id) }}
          className="h-11 px-5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Executive Summary */}
      {session.summary && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" /> Executive Summary
          </h3>
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              {session.summary}
            </div>
          </div>
        </section>
      )}

      {/* Opportunities / Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" /> Insights & Opportunities
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
            {opportunities.length} Highlights
          </span>
        </div>

        <div className="space-y-3">
          {opportunities.map((opp, index) => {
            const isExpanded = expandedId === opp.id
            const theme = tagColors[opp.tag] || tagColors.Core
            return (
              <div key={opp.id} className={cn("bg-white border transition-all rounded-2xl shadow-sm overflow-hidden", isExpanded ? "border-slate-300 ring-4 ring-slate-50" : "border-slate-100")}>
                <div className="p-4 flex items-center justify-between gap-4">
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-300">#{(index + 1).toString().padStart(2, '0')}</span>
                        <span className={cn('text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border', theme.text, theme.border, theme.bg)}>
                          {opp.tag}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 truncate">{opp.title}</h4>
                   </div>
                   <button onClick={() => setExpandedId(isExpanded ? null : opp.id)} className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                   </button>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                     <p className="text-xs text-slate-500 leading-relaxed">{opp.description}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </motion.div>
  )
}


function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(urlTab || 'overview')
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  
  // ⚡️ MULTI-SELECT STATE
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)

  // Sync tab with URL param
  useEffect(() => {
    if (urlTab && ['overview', 'sessions', 'users', 'stakeholders'].includes(urlTab)) {
      setTab(urlTab)
    }
  }, [urlTab])


  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/sessions')
        const data = await res.json()
        if (data.sessions) setSessions(data.sessions)
        if (data.profiles) setProfiles(data.profiles)
        if (data.stakeholders) setStakeholders(data.stakeholders)
      } catch (e) {
        console.error('Admin data fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return null
    return sessions.find(s => s.id === selectedSessionId) || null
  }, [selectedSessionId, sessions])

  const handleBulkAssign = async (userId: string | null) => {
    if (selectedIds.length === 0) return
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, user_id: userId })
      })
      if (res.ok) {
        setSessions(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, user_id: userId || undefined } : s))
        setSelectedIds([])
        setIsBulkAssignOpen(false)
      }
    } catch (e) {
      console.error('Bulk assignment failed:', e)
    }
  }

  const handleAssignSingle = async (id: string, userId: string | null) => {
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, user_id: userId })
      })
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, user_id: userId || undefined } : s))
      }
    } catch (e) {
      console.error('Single assignment failed:', e)
    }
  }

  const handlePublishFromAdmin = async (id: string) => {
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Published' })
      })
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Published' } : s))
      }
    } catch (e) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Published' } : s))
    }
  }

  const handleDeleteFromAdmin = async (id: string) => {
    await fetch(`/api/admin/sessions?id=${id}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(x => x.id !== id))
    setSelectedSessionId(null)
  }

  const stats = useMemo(() => {
    const total = sessions.length
    const insights = sessions.reduce((a, s) => a + (s.opportunities?.length || 0), 0)
    const published = sessions.filter(s => s.status === 'Published').length
    const inReview = sessions.filter(s => s.status === 'Review').length
    const publishRate = total ? Math.round((published / total) * 100) : 0
    const totalStakeholders = stakeholders.length
    return { total, insights, published, inReview, publishRate, stakeholders: totalStakeholders }
  }, [sessions, stakeholders])

  const userStats = useMemo(() =>
    profiles.map(p => {
      const us = sessions.filter(s => s.user_id === p.id)
      return { ...p, sessionCount: us.length, insightCount: us.reduce((a, s) => a + (s.opportunities?.length || 0), 0), publishedCount: us.filter(s => s.status === 'Published').length }
    }).sort((a, b) => b.sessionCount - a.sessionCount)
  , [profiles, sessions])

  const filteredSessions = useMemo(() =>
    sessions.filter(s => {
      const q = search.toLowerCase()
      const matchSearch = (s.stakeholders?.name || '').toLowerCase().includes(q) || (s.stakeholders?.company || '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  , [sessions, search, statusFilter])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const tabs: { id: Tab; label: string; shortLabel: string }[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
    { id: 'sessions', label: 'All Sessions', shortLabel: 'Sessions' },
    { id: 'stakeholders', label: 'Stakeholders', shortLabel: 'People' },
    { id: 'users', label: 'Users', shortLabel: 'Users' },
  ]

  const allStakeholdersList = useMemo(() => {
    return stakeholders.map(sh => {
      const shSessions = sessions.filter(s => (s.stakeholders?.name === sh.name && s.stakeholders?.company === sh.company) || s.stakeholders?.id === sh.id)
      return { 
        ...sh, 
        sessionCount: shSessions.length, 
        sessions: shSessions 
      }
    }).sort((a, b) => b.sessionCount - a.sessionCount)
  }, [stakeholders, sessions])

  const kpis = [
    { label: 'Total Sessions', val: stats.total, icon: Video, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
    { label: 'Total Insights', val: stats.insights, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Stakeholders', val: stats.stakeholders, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Published', val: stats.published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'In Review', val: stats.inReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Publish Rate', val: `${stats.publishRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-slate-50/30 animate-in fade-in duration-500">
      {/* ⚡️ BULK ACTIONS BAR */}
      <AnimatePresence>
        {selectedIds.length > 0 && !selectedSession && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[60] p-4 bg-slate-900 shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-4 border-b border-white/10">
            <p className="text-white text-sm font-bold flex items-center gap-2">
               <Fingerprint className="w-5 h-5 text-blue-400" />
               <span className="text-blue-400">{selectedIds.length}</span> Sessions Selected
            </p>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <button onClick={() => setIsBulkAssignOpen(!isBulkAssignOpen)} className="h-10 px-6 bg-white rounded-xl text-xs font-black uppercase text-slate-800 flex items-center gap-2 hover:bg-blue-50 transition-all">
                    Assign To <ChevronDown className="w-4 h-4" />
                  </button>
                  {isBulkAssignOpen && (
                    <div className="absolute top-12 left-0 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 space-y-1 z-[70] animate-in slide-in-from-top-2">
                       {profiles.map(p => (
                         <button key={p.id} onClick={() => handleBulkAssign(p.id)} className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100">
                            {p.full_name}
                         </button>
                       ))}
                       <div className="h-px bg-slate-100 mx-2 my-1" />
                       <button onClick={() => handleBulkAssign(null)} className="w-full text-left px-4 py-3 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all">
                          Unassign All
                       </button>
                    </div>
                  )}
               </div>
               <button onClick={() => setSelectedIds([])} className="h-10 px-6 bg-white/10 text-white/50 rounded-xl text-xs font-bold uppercase hover:bg-white/20 hover:text-white transition-all">
                  Cancel
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              {selectedSession ? `Session: ${selectedSession.stakeholders?.name || 'Detail'}` :
               tab === 'overview' && 'Platform Overview'}
              {!selectedSession && tab === 'sessions' && 'All Sessions'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-[0.15em] mt-0.5">
              {selectedSession ? `${selectedSession.stakeholders?.company || 'N/A'}` :
               tab === 'overview' && `${stats.total} sessions repository`}
            </p>
          </div>

          {!selectedSession && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar -mx-1 sm:mx-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSelectedSessionId(null); setSelectedIds([]) }}
                  className={cn(
                    'px-3 sm:px-5 py-2 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0',
                    tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {t.shortLabel}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : selectedSession ? (
          <SessionDetailPanel 
            key={selectedSession.id}
            session={selectedSession} 
            profiles={profiles}
            onClose={() => setSelectedSessionId(null)}
            onPublish={handlePublishFromAdmin}
            onDelete={handleDeleteFromAdmin}
            onAssign={handleAssignSingle}
          />
        ) : (
          <AnimatePresence mode="wait">

            {/* ─── OVERVIEW ─── */}
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {kpis.map(k => (
                    <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 hover:shadow-sm hover:border-slate-200 transition-all group">
                      <div className={cn('w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-3 sm:mb-4 border', k.bg, k.border)}>
                        <k.icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', k.color)} />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800">{k.val}</h3>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                   {/* Unassigned Summary */}
                   {sessions.filter(s => !s.user_id).length > 0 && (
                    <div className="bg-white border border-rose-100 bg-rose-50/20 rounded-2xl p-6 sm:p-10 space-y-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Fingerprint className="w-4 h-4" /> Data Integrity
                           </p>
                           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                              {sessions.filter(s => !s.user_id).length} <span className="text-slate-400">/ {sessions.length}</span>
                           </h2>
                           <p className="text-sm text-slate-500 font-medium">Unassigned sessions detected. Link them to researchers to populate their individual dashboards.</p>
                        </div>
                        <button onClick={() => { setTab('sessions'); setStatusFilter('all'); setSearch('') }} className="h-11 px-8 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                           Fix Unassigned Data <ArrowRight className="w-4 h-4 text-blue-400" />
                        </button>
                    </div>
                   )}

                  {/* Top Researchers */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-500" /> Professional Load
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {userStats.slice(0, 5).map((u, i) => (
                        <div key={u.id}>
                           <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-slate-700">{u.full_name}</p>
                             <p className="text-xs font-bold text-slate-500">{u.sessionCount} Sessions</p>
                           </div>
                           <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(u.sessionCount / Math.max(...userStats.map(x => x.sessionCount), 1)) * 100}%` }} />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── ALL SESSIONS ─── */}
            {tab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                  <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search repository..."
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {['all', 'Scheduled', 'Review', 'Published'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap', statusFilter === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700')}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="pl-6 py-5 w-4">
                           <input type="checkbox" checked={selectedIds.length === filteredSessions.length && filteredSessions.length > 0} onChange={() => setSelectedIds(selectedIds.length === filteredSessions.length ? [] : filteredSessions.map(s => s.id))} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        </th>
                        <th className="px-6 py-5">Stakeholder</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Researcher</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSessions.map(s => {
                        const cfg = statusConfig[s.status] || statusConfig.Review
                        const isSelected = selectedIds.includes(s.id)
                        const researcher = profiles.find(p => p.id === s.user_id)
                        
                        return (
                          <tr key={s.id} className={cn('hover:bg-slate-50/50 transition-all group', isSelected && 'bg-blue-50/50')}>
                            <td className="pl-6 py-5">
                               <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(s.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-sm font-black text-slate-400">
                                     {s.stakeholders?.name[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-700">{s.stakeholders?.name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">{s.stakeholders?.company || 'N/A'}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest', cfg.pill)}>
                                 {cfg.label}
                               </span>
                            </td>
                            <td className="px-6 py-5">
                               {researcher ? (
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 bg-blue-100 border border-blue-200 text-blue-600 rounded-md flex items-center justify-center text-[8px] font-black">
                                        {researcher.full_name[0]}
                                     </div>
                                     <span className="text-xs font-bold text-slate-600">{researcher.full_name}</span>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">Unassigned</span>
                               )}
                            </td>
                            <td className="px-6 py-5 text-right">
                               <button onClick={() => setSelectedSessionId(s.id)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors px-4 py-2 bg-slate-100/50 border border-slate-200 rounded-xl hover:bg-white">
                                  Review Detail →
                               </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredSessions.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                       <Inbox className="w-12 h-12 text-slate-200 mx-auto" />
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No matches in repository</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── STAKEHOLDERS ─── */}
            {tab === 'stakeholders' && (
              <motion.div key="stakeholders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {allStakeholdersList.map((sh, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 hover:shadow-xl hover:border-blue-100 transition-all group">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                           {sh.name[0]}
                        </div>
                        <div>
                           <h3 className="text-base font-bold text-slate-800">{sh.name}</h3>
                           <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{sh.company}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-lg font-black text-slate-800">{sh.sessionCount}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">Sessions</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-lg font-black text-blue-600">{sh.sessions.reduce((a: any, s: any) => a + (s.opportunities?.length || 0), 0)}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">Insights</p>
                        </div>
                     </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ─── USERS ─── */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStats.map((u, i) => (
                  <div key={u.id} className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 hover:shadow-xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-400">
                           {u.full_name[0]}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-800">{u.full_name}</h3>
                           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">{u.role}</span>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400 font-medium">Session Load</span>
                           <span className="text-slate-800 font-black">{u.sessionCount}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(u.sessionCount / Math.max(...userStats.map(x => x.sessionCount), 1)) * 100}%` }} />
                        </div>
                     </div>
                  </div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
