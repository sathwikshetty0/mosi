'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Video, Search, ShieldCheck, 
  Zap, Activity, UserCheck, Inbox,
  BarChart3, Clock, TrendingUp, Globe, CheckCircle2, Trash2, Shield, Command,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, FileText, Briefcase, MapPin,
  Headphones, Sparkles, Check, X, Share, ChevronRight, UserPlus, Fingerprint, Mail, Image as ImageIcon, Link as LinkIcon, Play,
  Linkedin, Phone
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
  recordingUrl?: string // Add both just in case
  stakeholders: { 
    id?: string; 
    name: string; 
    role: string; 
    company: string; 
    sector: string; 
    employees?: string; 
    revenue?: string;
    geography?: string; 
    domain?: string; 
    email?: string; 
    phone?: string;
    linkedin?: string;
    address?: string;
    pincode?: string;
    created_at?: string;
  } | null
  opportunities: { id: string; tag: string; title: string; description?: string; paid?: boolean; duration?: string; skills?: string; toolset?: string; engagementType?: string; status?: string }[]
  evidence: { id: string; type?: string; url?: string; title?: string; opportunity_id?: string }[]
}

interface ProfileData {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  updated_at: string
  role_title?: string
  department?: string
  specialization?: string
  office_location?: string
  place?: string
  phone?: string
  linkedin?: string
  bio?: string
  public_email?: string
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

type Tab = 'overview' | 'sessions' | 'users' | 'stakeholders' | 'companies'

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
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  
  const stakeholder = session.stakeholders
  const opportunities = session.opportunities || []
  const cfg = statusConfig[session.status] || statusConfig.Review
  const isPublished = session.status === 'Published'
  const currentUser = profiles.find(p => p.id === session.user_id)

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-slate-900/95 backdrop-blur-xl"
            onClick={() => setSelectedAsset(null)}
          >
            <button 
              onClick={() => setSelectedAsset(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {selectedAsset.type === 'image' ? (
                <img src={selectedAsset.url} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10" alt="" />
              ) : selectedAsset.type === 'video' ? (
                <video src={selectedAsset.url} controls autoPlay className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10" />
              ) : null}
              <div className="absolute -bottom-16 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                 <p className="text-white text-sm font-bold uppercase tracking-[0.2em]">{selectedAsset.title || 'Session Artifact'}</p>
                 <a href={selectedAsset.url} download className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-blue-300 mt-2 inline-block border-b border-blue-400/30 pb-0.5">Download High-Res Original</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {currentUser && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="w-3 h-3" /> {currentUser.full_name}
              </span>
            )}
            {!currentUser && (
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
      <div className="flex gap-2 flex-wrap items-center">
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
          onClick={() => {
            const url = `${window.location.origin}/preview?id=${session.id}`
            navigator.clipboard.writeText(url)
            alert('Share link copied to clipboard!')
          }}
          className="h-11 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Share className="w-4 h-4" /> Share
        </button>

        <button 
          onClick={() => { if (confirm('Delete this session permanently?')) onDelete(session.id) }}
          className="h-11 px-5 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Recording Player */}
      {(session.recording_url || session.recordingUrl) && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-500" /> Session Recording
          </h3>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
             <audio src={session.recording_url || session.recordingUrl} controls className="w-full" />
          </div>
        </section>
      )}

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

      {/* Evidence & Assets */}
      {session.evidence && session.evidence.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-500" /> Collected Evidence
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {session.evidence.map((ev, i) => (
              <div 
                key={i} 
                onClick={() => (ev.type === 'image' || ev.type === 'video') ? setSelectedAsset(ev) : window.open(ev.url, '_blank')}
                className="group relative aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-300 transition-all shadow-sm cursor-pointer"
              >
                {ev.type === 'image' ? (
                  <img src={ev.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                ) : ev.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <video src={ev.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20"><Play className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" /></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        {ev.type === 'link' ? <LinkIcon className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-emerald-500" />}
                     </div>
                     <span className="text-[8px] font-black text-slate-400 uppercase truncate w-full text-center px-1">{ev.title || 'Asset'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
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

      {/* Stakeholder Dossier */}
      <section className="space-y-4 pt-10 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4 text-blue-500" /> Executive Stakeholder Dossier
        </h3>
        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
           
           <div className="lg:col-span-6 space-y-8">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    {stakeholder?.name?.[0]}
                 </div>
                 <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{stakeholder?.name}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em]">{stakeholder?.role} · <span className="text-blue-600">{stakeholder?.company}</span></p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Industry', val: stakeholder?.sector, icon: Briefcase },
                   { label: 'Scale', val: stakeholder?.employees, icon: BarChart3 },
                   { label: 'Revenue', val: stakeholder?.revenue, icon: TrendingUp },
                   { label: 'Location', val: stakeholder?.geography, icon: MapPin },
                 ].map(i => (
                    <div key={i.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                       <div className="flex items-center gap-2 mb-2">
                          <i.icon className="w-3 h-3 text-slate-300" />
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{i.label}</p>
                       </div>
                       <p className="text-sm font-black text-slate-800 truncate">{i.val || '—'}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 sm:p-8 space-y-6 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">Security & Contact Matrix</p>
                 <div className="space-y-4">
                    {[
                      { label: 'Verified Email', val: stakeholder?.email, icon: Mail },
                      { label: 'Direct Phone', val: stakeholder?.phone, icon: Phone },
                      { label: 'LinkedIn', val: stakeholder?.linkedin, icon: Linkedin },
                      { label: 'Corporate Domain', val: stakeholder?.domain, icon: Globe },
                    ].map(i => i.val ? (
                       <div key={i.label} className="flex items-center justify-between group/dossier">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover/dossier:bg-blue-50 transition-colors">
                                <i.icon className="w-3.5 h-3.5 text-slate-400 group-hover/dossier:text-blue-500 transition-colors" />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i.label}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{i.val}</span>
                       </div>
                    ) : null)}
                 </div>
                 
                 <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-2 tracking-widest">Office Address</p>
                    <div className="flex items-start gap-3">
                       <MapPin className="w-3.5 h-3.5 text-slate-300 mt-0.5" />
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {stakeholder?.address || 'No address data provided'}{stakeholder?.pincode ? `, ${stakeholder?.pincode}` : ''} <br/>
                          <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-1 inline-block">Captured: {stakeholder?.created_at ? new Date(stakeholder.created_at).toLocaleDateString() : 'N/A'}</span>
                       </p>
                    </div>
                 </div>
              </div>
           </div>
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
  const [expandedShId, setExpandedShId] = useState<string | null>(null)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  
  // ⚡️ MULTI-SELECT STATE
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)

  // Sync tab with URL param
  useEffect(() => {
    if (urlTab && ['overview', 'sessions', 'users', 'stakeholders', 'companies'].includes(urlTab)) {
      setTab(urlTab as Tab)
    } else if (!urlTab) {
      setTab('overview')
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
    { id: 'overview', label: 'Dashboard', shortLabel: 'Dashboard' },
    { id: 'sessions', label: 'All Sessions', shortLabel: 'Sessions' },
    { id: 'stakeholders', label: 'Stakeholders', shortLabel: 'People' },
    { id: 'companies', label: 'Companies', shortLabel: 'Accounts' },
    { id: 'users', label: 'Users', shortLabel: 'Users' },
  ]

  const allStakeholdersList = useMemo(() => {
    return stakeholders.map(sh => {
      const shSessions = sessions.filter(s => (s.stakeholders?.name === sh.name && s.stakeholders?.company === sh.company) || s.stakeholders?.id === sh.id)
      const introducer = profiles.find(p => p.id === sh.user_id)
      return { 
        ...sh, 
        sessionCount: shSessions.length, 
        sessions: shSessions,
        introducer: introducer?.full_name || 'Legacy / System'
      }
    }).sort((a, b) => b.sessionCount - a.sessionCount)
  }, [stakeholders, sessions, profiles])

  const allCompaniesList = useMemo(() => {
    const companiesMap: Record<string, any> = {}
    
    sessions.forEach(s => {
      const companyName = s.stakeholders?.company || 'Unknown'
      if (!companiesMap[companyName]) {
        companiesMap[companyName] = { 
          name: companyName, 
          sessions: [], 
          stakeholders: new Set(),
          insightCount: 0,
          sector: s.stakeholders?.sector || 'N/A'
        }
      }
      companiesMap[companyName].sessions.push(s)
      if (s.stakeholders?.name) companiesMap[companyName].stakeholders.add(s.stakeholders.name)
      companiesMap[companyName].insightCount += (s.opportunities?.length || 0)
    })

    return Object.values(companiesMap).sort((a, b) => (b as any).sessions.length - (a as any).sessions.length)
  }, [sessions])

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
          <motion.div 
            initial={{ y: -100 }} 
            animate={{ y: 0 }} 
            exit={{ y: -100 }} 
            className="fixed top-0 left-0 right-0 z-[60] p-4 bg-white/80 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-center gap-4 border-b border-slate-100"
          >
            <div className="text-slate-800 text-sm font-black flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                  <Fingerprint className="w-4 h-4 text-white" />
               </div>
               <span><span className="text-blue-600">{selectedIds.length}</span> Sessions Selected</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <button onClick={() => setIsBulkAssignOpen(!isBulkAssignOpen)} className="h-11 px-8 bg-slate-900 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                    Assign To <ChevronDown className="w-4 h-4 text-blue-400" />
                  </button>
                  {isBulkAssignOpen && (
                    <div className="absolute top-14 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 space-y-1 z-[70] animate-in slide-in-from-top-2">
                       <div className="px-4 py-3 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Select Agent</p>
                       </div>
                       {profiles.map(p => (
                         <button key={p.id} onClick={() => handleBulkAssign(p.id)} className="w-full text-left px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-transparent shadow-sm hover:shadow-lg hover:shadow-blue-200 group/u">
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
               <button onClick={() => setSelectedIds([])} className="h-11 px-6 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold uppercase hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 transition-all">
                  Cancel
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {selectedSession ? `Session: ${selectedSession.stakeholders?.name || 'Detail'}` :
               tab === 'overview' && 'Admin Dashboard'}
              {!selectedSession && tab === 'sessions' && 'All Sessions'}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-[0.15em] mt-0.5">
              {selectedSession ? `${selectedSession.stakeholders?.company || 'N/A'}` :
               tab === 'overview' && `${stats.total} sessions repository`}
            </p>
          </div>

          {!selectedSession && (
            <div className="flex items-center gap-1 -mx-1 sm:mx-0">
              {/* Tabs moved to sidebar */}
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
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 sm:space-y-10">
                
                {/* 📊 KPI GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {kpis.map(k => (
                    <div key={k.label} className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden relative">
                      <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110', k.bg, k.border)}>
                        <k.icon className={cn('w-4 h-4 sm:w-5 sm:h-5', k.color)} />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{k.val}</h3>
                      <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:scale-125 transition-transform", k.color.replace('text-', 'bg-'))} />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                   
                   {/* 🛡️ DATA STATUS (4 cols) */}
                   <div className="lg:col-span-5 space-y-6 sm:space-y-8">
                     {sessions.filter(s => !s.user_id).length > 0 && (
                      <div className="bg-white border border-rose-100 bg-rose-50/20 rounded-[2rem] p-6 sm:p-10 space-y-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                             <Fingerprint className="w-20 h-20 text-rose-500" />
                          </div>
                          <div className="space-y-2 relative">
                             <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Data Integrity
                             </p>
                             <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                {sessions.filter(s => !s.user_id).length} <span className="text-slate-300 font-medium">/ {sessions.length}</span>
                             </h2>
                             <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-[240px]">Unassigned sessions detected. Link them to users for visibility.</p>
                          </div>
                          <button onClick={() => { setTab('sessions'); setStatusFilter('all'); setSearch('') }} className="h-12 px-8 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                             Review & Assign <ArrowRight className="w-4 h-4 text-blue-400" />
                          </button>
                      </div>
                     )}

                     <div className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-10 space-y-8">
                        <div className="flex items-center justify-between">
                           <h2 className="text-base font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                             <BarChart3 className="w-5 h-5 text-blue-600" /> Platform Flow
                           </h2>
                        </div>
                        <div className="space-y-6">
                           {[
                             { label: 'Published Ratio', val: stats.publishRate, color: 'bg-emerald-500', bg: 'bg-emerald-50' },
                             { label: 'Review Velocity', val: Math.round((stats.inReview / Math.max(stats.total, 1)) * 100), color: 'bg-amber-500', bg: 'bg-amber-50' },
                             { label: 'Session Saturation', val: Math.round((stats.total / 100) * 100), color: 'bg-blue-600', bg: 'bg-blue-50' },
                           ].map(item => (
                             <div key={item.label} className="space-y-2">
                               <div className="flex justify-between items-center px-1">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                 <span className="text-xs font-black text-slate-700">{item.val}%</span>
                               </div>
                               <div className={cn("h-3 rounded-full overflow-hidden p-0.5", item.bg)}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className={cn("h-full rounded-full shadow-sm", item.color)} />
                               </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   </div>

                  {/* 👥 USER ACTIVITY (7 cols) */}
                  <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-10 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-blue-600" /> Team Utilization
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active User Load & Output</p>
                      </div>
                      <Link href="/admin?tab=users" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage All Users →</Link>
                    </div>
                    <div className="space-y-8">
                      {userStats.slice(0, 6).map((u, i) => (
                        <div key={u.id} className="group cursor-default">
                           <div className="flex items-center justify-between mb-3 px-1">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black relative overflow-hidden group-hover:scale-105 group-hover:border-blue-100 group-hover:bg-blue-50 transition-all duration-500 shadow-sm">
                                    {u.avatar_url ? (
                                       <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                       u.full_name[0]
                                    )}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800">{u.full_name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Platform User</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-black text-slate-900">{u.sessionCount} <span className="text-slate-300 font-medium text-[10px]">sessions</span></p>
                                 <p className="text-[9px] text-blue-600 font-bold uppercase">{u.insightCount} Insights</p>
                              </div>
                           </div>
                           <div className="h-2 bg-slate-50 rounded-full overflow-hidden mx-1">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(u.sessionCount / Math.max(...userStats.map(x => x.sessionCount), 1)) * 100}%` }} className="h-full bg-slate-900 rounded-full relative overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80" />
                              </motion.div>
                           </div>
                        </div>
                      ))}
                      {userStats.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                           <Users className="w-12 h-12 text-slate-100 mx-auto" />
                           <p className="text-slate-300 font-bold uppercase tracking-[0.2em] text-[10px]">No users registered</p>
                        </div>
                      )}
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
                        <th className="px-6 py-5">User</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSessions.map(s => {
                        const cfg = statusConfig[s.status] || statusConfig.Review
                        const isSelected = selectedIds.includes(s.id)
                        const user = profiles.find(p => p.id === s.user_id)
                        
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
                               {user ? (
                                 <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black relative overflow-hidden shadow-sm transition-all group-hover:scale-110">
                                        {user.avatar_url ? (
                                           <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : user.full_name[0]}
                                     </div>
                                     <span className="text-xs font-bold text-slate-600">{user.full_name}</span>
                                 </div>
                               ) : (
                                 <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">Unassigned</span>
                               )}
                            </td>
                            <td className="px-6 py-5 text-right space-x-2">
                               <button 
                                 onClick={() => {
                                   const shareUrl = `${window.location.origin}/preview?id=${s.id}`
                                   navigator.clipboard.writeText(shareUrl)
                                   alert('Briefing link copied!')
                                 }}
                                 className="text-slate-400 hover:text-blue-600 transition-colors"
                                 title="Share Briefing"
                               >
                                  <Share className="w-4 h-4" />
                               </button>
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
              <motion.div key="stakeholders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allStakeholdersList.map((sh, i) => {
                  const isShExpanded = expandedShId === sh.id
                  return (
                    <motion.div 
                      layout
                      key={sh.id || i} 
                      onClick={() => setExpandedShId(isShExpanded ? null : sh.id || i.toString())}
                      className={cn(
                        "bg-white border rounded-[2rem] p-6 sm:p-10 group relative overflow-hidden cursor-pointer transition-colors duration-500",
                        isShExpanded 
                          ? "col-span-full border-blue-200 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] space-y-12" 
                          : "border-slate-100 hover:border-blue-100 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.04)] space-y-8"
                      )}
                      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                    >
                      <div className="flex items-start justify-between">
                         <div className="flex items-center gap-6">
                            <div className={cn(
                               "w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black transition-all duration-500 shrink-0", 
                               isShExpanded 
                                  ? "bg-blue-500 text-white shadow-2xl shadow-blue-200 scale-110" 
                                  : "bg-slate-50 border border-slate-100 text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100"
                            )}>
                               {sh.name[0]}
                            </div>
                            <div>
                               <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{sh.name}</h3>
                               <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.1em]">{sh.company} · <span className="text-blue-500/80">{sh.sector || 'Strategic Partner'}</span></p>
                            </div>
                         </div>
                         <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</p>
                               <p className="text-sm font-bold text-slate-700">{sh.role || 'N/A'}</p>
                            </div>
                            {!isShExpanded && (
                               <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2">
                                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sh.sessionCount} Sessions</span>
                               </div>
                            )}
                         </div>
                      </div>

                      {isShExpanded && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 flex flex-col justify-center relative overflow-hidden shadow-sm">
                               <p className="text-lg font-black text-slate-800">{sh.sessionCount}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase">Sessions</p>
                               <Video className="absolute -right-2 -bottom-2 w-10 h-10 text-slate-100" />
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 flex flex-col justify-center shadow-sm">
                               <p className="text-sm font-black text-blue-600 truncate">{sh.employees || '—'}</p>
                               <p className="text-[10px] sm:text-[9px] text-slate-400 font-bold uppercase">Scale</p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 flex flex-col justify-center shadow-sm">
                               <p className="text-sm font-black text-emerald-600 truncate">{sh.revenue || '—'}</p>
                               <p className="text-[10px] sm:text-[9px] text-slate-400 font-bold uppercase">Revenue</p>
                            </div>
                            <div className="p-3 bg-white rounded-2xl border border-slate-100 flex flex-col justify-center shadow-sm">
                               <p className="text-sm font-black text-slate-700 truncate">{sh.geography || '—'}</p>
                               <p className="text-[10px] sm:text-[9px] text-slate-400 font-bold uppercase">Location</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Matrix</p>
                               <div className="space-y-3">
                                  {sh.email && (
                                    <div className="flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-colors group/item">
                                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover/item:bg-blue-50 transition-colors shadow-sm">
                                          <Mail className="w-4 h-4" />
                                       </div>
                                       <span className="text-sm font-bold truncate">{sh.email}</span>
                                    </div>
                                  )}
                                  {sh.phone && (
                                    <div className="flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-colors group/item">
                                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover/item:bg-blue-50 transition-colors shadow-sm">
                                          <Phone className="w-4 h-4" />
                                       </div>
                                       <span className="text-sm font-bold truncate">{sh.phone}</span>
                                    </div>
                                  )}
                                  {sh.linkedin && (
                                    <a href={sh.linkedin.startsWith('http') ? sh.linkedin : `https://${sh.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-500 hover:text-blue-600 transition-colors group/item" onClick={e => e.stopPropagation()}>
                                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover/item:bg-blue-50 transition-colors shadow-sm">
                                          <Linkedin className="w-4 h-4" />
                                       </div>
                                       <span className="text-sm font-bold truncate underline decoration-blue-200">Linkedin Profile</span>
                                    </a>
                                  )}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identity & Firmographics</p>
                               <div className="space-y-4 bg-slate-50/50 rounded-3xl p-6 sm:p-8 border border-slate-100 relative overflow-hidden group/id">
                                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/id:scale-110 transition-transform"><Fingerprint className="w-20 h-20 text-slate-900" /></div>
                                  <div className="flex justify-between items-center relative">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Introduced By</span>
                                     <span className="text-xs font-black text-blue-600">{sh.introducer}</span>
                                  </div>
                                  <div className="flex justify-between items-center relative border-t border-slate-200/50 pt-4">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Domain</span>
                                     <span className="text-xs font-black text-slate-800">{sh.domain || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between items-start gap-4 relative">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Primary Office</span>
                                     <span className="text-xs font-black text-right leading-relaxed text-slate-700">
                                        {sh.address ? `${sh.address}${sh.pincode ? `, ${sh.pincode}` : ''}` : 'N/A'}
                                     </span>
                                  </div>
                                  <div className="flex justify-between items-center relative border-t border-slate-200/50 pt-4">
                                     <span className="text-[10px] font-bold text-slate-400 uppercase">Registered</span>
                                     <span className="text-xs font-black text-slate-500">{new Date(sh.created_at).toLocaleDateString()}</span>
                                  </div>
                               </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engagement History</p>
                               <span className="text-[10px] font-bold text-blue-600 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100">{sh.sessionCount} Sessions</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                               {sh.sessions.map((s: any) => (
                                  <button 
                                     key={s.id} 
                                     onClick={(e) => { e.stopPropagation(); setSelectedSessionId(s.id) }}
                                     className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all text-left shadow-sm group/session"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-100 group-hover/session:bg-blue-600 group-hover/session:border-blue-600 transition-all shadow-sm">
                                           <Video className="w-4 h-4 text-slate-400 group-hover/session:text-white" />
                                        </div>
                                        <div className="min-w-0">
                                           <p className="text-xs font-black text-slate-800 truncate">{s.date}</p>
                                           <p className="text-[9px] text-slate-400 font-black uppercase">{s.status}</p>
                                        </div>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-slate-300 group-hover/session:text-blue-600 transition-colors shrink-0" />
                                  </button>
                               ))}
                               {sh.sessionCount === 0 && (
                                  <div className="col-span-full py-12 bg-white border border-dashed border-slate-200 rounded-3xl text-center">
                                     <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                     <p className="text-xs text-slate-400 font-bold uppercase italic px-1">No sessions recorded yet.</p>
                                  </div>
                               )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {!isShExpanded && (
                        <div className="absolute bottom-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="bg-slate-900 text-white p-1 rounded-lg">
                              <ChevronDown className="w-4 h-4" />
                           </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* ─── COMPANIES ─── */}
            {tab === 'companies' && (
              <motion.div key="companies" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 sm:space-y-6">
                {allCompaniesList.map((co: any) => {
                  const isCoExpanded = expandedCompany === co.name
                  return (
                    <motion.div 
                      key={co.name} 
                      layout
                      onClick={() => setExpandedCompany(isCoExpanded ? null : co.name)}
                      className={cn(
                        "bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group",
                        isCoExpanded ? "p-8 sm:p-12 space-y-10 border-blue-200" : "p-6 sm:p-8 flex items-center justify-between"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-sm">
                           <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{co.name}</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{co.sector} · {co.stakeholders.size} Stakeholders</p>
                        </div>
                      </div>
                      
                      {!isCoExpanded ? (
                        <div className="flex items-center gap-8">
                           <div className="text-right hidden sm:block">
                              <p className="text-xl font-black text-slate-900">{co.sessions.length}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Sessions</p>
                           </div>
                           <div className="text-right hidden sm:block">
                              <p className="text-xl font-black text-blue-600">{co.insightCount}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Insights</p>
                           </div>
                           <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 transition-all" />
                        </div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[
                                { label: 'Total Engagement', val: co.sessions.length, icon: Video, color: 'text-slate-800', bg: 'bg-slate-50' },
                                { label: 'Strategic Insights', val: co.insightCount, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                                { label: 'Active Stakeholders', val: co.stakeholders.size, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                              ].map(s => (
                                <div key={s.label} className={cn("p-8 rounded-[2rem] border border-slate-100/50 text-center space-y-2 shadow-sm", s.bg)}>
                                   <p className={cn("text-4xl font-black tracking-tighter", s.color)}>{s.val}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                </div>
                              ))}
                           </div>

                           <div className="space-y-6">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Network & Personnel</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {Array.from(co.stakeholders).map((name: any) => (
                                   <div key={name} className="flex items-center gap-4 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-300">{name[0]}</div>
                                      <div>
                                         <p className="text-xs font-black text-slate-800">{name}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase">Stakeholder</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-6">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Institutional Sessions</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {co.sessions.map((s: any) => (
                                   <button 
                                      key={s.id} 
                                      onClick={(e) => { e.stopPropagation(); setSelectedSessionId(s.id) }}
                                      className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-xl transition-all text-left shadow-sm group/co-sess"
                                   >
                                      <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-100 group-hover/co-sess:bg-blue-600 transition-all">
                                            <Video className="w-5 h-5 text-slate-400 group-hover/co-sess:text-white" />
                                         </div>
                                         <div>
                                            <p className="text-sm font-black text-slate-800">{s.date}</p>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">{s.status} · {s.opportunities?.length || 0} Insights</p>
                                         </div>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover/co-sess:text-blue-600 transition-all" />
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}

            {/* ─── USERS ─── */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {userStats.map((u, i) => {
                  const isUserExpanded = expandedUserId === u.id
                  return (
                    <motion.div 
                      key={u.id} 
                      layout
                      onClick={() => setExpandedUserId(isUserExpanded ? null : u.id)}
                      className={cn(
                        "bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group/user",
                        isUserExpanded ? "col-span-full border-blue-200" : "p-8 space-y-6"
                      )}
                    >
                      {isUserExpanded ? (
                        <div className="divide-y divide-slate-100/50">
                           <div className="p-8 sm:p-10 bg-white flex items-center justify-between relative">
                              <div className="flex items-center gap-6">
                                 <div className="w-24 h-24 bg-white border-2 border-slate-100 rounded-[2rem] flex items-center justify-center text-4xl font-black text-slate-800 shadow-xl relative group-hover/user:scale-105 transition-transform overflow-hidden">
                                    {u.avatar_url ? (
                                       <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center text-white">
                                          {u.full_name[0]}
                                       </div>
                                    )}
                                 </div>
                                 <div className="space-y-1.5">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{u.full_name}</h3>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50 uppercase tracking-[0.2em]">Principal Strategist</span>
                                       <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/50 uppercase tracking-[0.2em]">Verified</span>
                                    </div>
                                 </div>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setExpandedUserId(null) }} className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-800 hover:border-slate-200 shadow-sm transition-all active:scale-90">
                                 <ChevronDown className="w-5 h-5 rotate-180" />
                              </button>
                           </div>

                           <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-10 bg-white">
                              <div className="md:col-span-4 space-y-8">
                                 <div className="space-y-5">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pl-1">Professional DNA</p>
                                    <div className="space-y-4">
                                       {[
                                          { label: 'Strategic Role', val: u.role_title || 'Principal Strategic Researcher', icon: Shield },
                                          { label: 'Institutional Unit', val: u.department || 'Enterprise Intelligence', icon: Command },
                                          { label: 'Geographic Sync', val: u.place || u.office_location || 'Global Digital HQ', icon: Globe },
                                          { label: 'Institutional Email', val: u.public_email || 'No public email', icon: Mail },
                                          { label: 'Contact Number', val: u.phone || 'No direct number', icon: Phone },
                                          { label: 'Access ID', val: `STK-${u.id.substring(0, 8).toUpperCase()}`, icon: Fingerprint }
                                       ].map(detail => (
                                          <div key={detail.label} className="flex items-center gap-4 group/item">
                                             <div className="w-10 h-10 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center justify-center text-slate-300 group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-all duration-300">
                                                <detail.icon className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">{detail.label}</p>
                                                <p className="text-sm font-bold text-slate-700 truncate max-w-[240px]">{detail.val}</p>
                                             </div>
                                          </div>
                                       ))}
                                       {u.linkedin && (
                                          <a href={u.linkedin.startsWith('http') ? u.linkedin : `https://${u.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group/item border-t border-slate-50 pt-4 mt-2">
                                             <div className="w-10 h-10 bg-slate-50/50 border border-slate-100/50 rounded-xl flex items-center justify-center text-slate-300 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                                                <Linkedin className="w-4 h-4" />
                                             </div>
                                             <div>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Social Hub</p>
                                                <p className="text-sm font-bold text-blue-600 underline decoration-blue-200">LinkedIn Profile</p>
                                             </div>
                                          </a>
                                       )}
                                    </div>

                                    {u.bio && (
                                       <div className="pt-6 border-t border-slate-100">
                                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-3">Professional Bio</p>
                                          <p className="text-xs text-slate-500 leading-relaxed italic">{u.bio}</p>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              <div className="md:col-span-8 space-y-10">
                                 <div className="space-y-5">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pl-1">Operational Performance</p>
                                    <div className="grid grid-cols-3 gap-5">
                                       {[
                                          { label: 'Sessions', val: u.sessionCount, color: 'text-slate-800', bg: 'bg-slate-50' },
                                          { label: 'Insights', val: u.insightCount, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                                          { label: 'Briefs', val: u.publishedCount, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                                       ].map(stat => (
                                          <div key={stat.label} className={cn("p-6 rounded-[2rem] border border-slate-100/50 text-center space-y-1.5 shadow-sm hover:shadow-lg transition-all duration-500", stat.bg)}>
                                             <p className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.val}</p>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                          </div>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="space-y-5">
                                    <div className="flex items-center justify-between px-1">
                                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Workload Balanced Sync</p>
                                       <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{u.sessionCount ? Math.round(u.insightCount / u.sessionCount) : 0} Insights Density</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5">
                                       <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: `${Math.min((u.insightCount / 20) * 100, 100)}%` }} />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.25rem] flex items-center justify-center text-xl font-black text-slate-800 shadow-sm relative overflow-hidden group-hover/user:scale-110 group-hover/user:shadow-xl transition-all duration-500">
                               {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    {u.full_name[0]}
                                  </div>
                               )}
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-slate-800 group-hover/user:text-blue-600 transition-colors">{u.full_name}</h3>
                               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">Platform User</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Session Load</span>
                                <span className="text-slate-800 font-black">{u.sessionCount}</span>
                             </div>
                             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${(u.sessionCount / Math.max(...userStats.map(x => x.sessionCount), 1)) * 100}%` }} />
                             </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )
                })}
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
