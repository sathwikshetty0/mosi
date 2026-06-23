'use client'

import * as React from 'react'
import {
  FileCheck, Globe, Clock, BarChart2,
  ChevronDown, ChevronUp, Link as LinkIcon, File as FileIcon, Check, X,
  MapPin, Briefcase, Headphones, FileText, Share, Zap, Sparkles, ArrowLeft, Mail, ChevronRight, Edit,
  Image as ImageIcon, Play
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMosiStore, CEEDTag } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const tagColors: Record<CEEDTag, { text: string; border: string; bg: string; icon: string }> = {
  Core: { text: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50/50', icon: 'text-blue-400' },
  Efficiency: { text: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50/50', icon: 'text-amber-400' },
  Expansion: { text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/50', icon: 'text-emerald-400' },
  Disrupt: { text: 'text-rose-600', border: 'border-rose-100', bg: 'bg-rose-50/50', icon: 'text-rose-400' }
}

function PreviewContent() {
  const { sessions, publishSession, updateOpportunityStatus, fetchSessions, fetchSessionById } = useMosiStore()
  const { user, profile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('id')
  const [dataLoading, setDataLoading] = React.useState(true)

  // 🔑 CRITICAL: Actually fetch session data on mount
  React.useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 4

    async function loadData() {
      setDataLoading(true)
      
      // First try fetching all sessions
      await fetchSessions()
      
      // Check if we found the session
      const currentSessions = useMosiStore.getState().sessions
      const found = sessionId ? currentSessions.find(s => s.id === sessionId) : currentSessions[0]
      
      if (!found && sessionId) {
        // Try fetching this specific session directly
        await fetchSessionById(sessionId)
        
        // Still not found? retry with delay (DB sync might be in progress)
        const updatedSessions = useMosiStore.getState().sessions
        const stillNotFound = !updatedSessions.find(s => s.id === sessionId)
        
        if (stillNotFound && retryCount < maxRetries && mounted) {
          retryCount++
          setTimeout(loadData, 1500)
          return
        }
      }
      
      if (mounted) setDataLoading(false)
    }

    loadData()
    return () => { mounted = false }
  }, [sessionId, fetchSessions, fetchSessionById])

  const session = React.useMemo(() => {
    if (sessionId) return sessions.find(s => s.id === sessionId)
    return sessions.find(s => s.status === 'Review' || s.status === 'Published') || sessions[0]
  }, [sessions, sessionId])

  const isGuest = !authLoading && !user
  const isLoading = authLoading || dataLoading

  // While auth is loading, show nothing (prevents flash of guest view)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#786BF9] rounded-full animate-spin" />
      </div>
    )
  }

  const [approved, setApproved] = React.useState(session?.status === 'Published')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [isCopied, setIsCopied] = React.useState(false)
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null)

  const handleShare = () => {
    const url = `${window.location.origin}/preview?id=${session?.id}`
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    if (!session) return
    const { exportSessionPDF } = await import('@/lib/export-pdf')
    exportSessionPDF(session as any)
  }

  const handleEmailDispatch = () => {
    if (!session) return
    const url = `${window.location.origin}/preview?id=${session.id}`
    const subject = `Strategic Discovery Briefing: ${session.stakeholder.name} / ${session.stakeholder.company}`
    const body = `Hi ${session.stakeholder.name},\n\nI've generated the strategic discovery briefing from our recent session. You can review the insights, highlights, and executive summary at the following secure link:\n\n${url}\n\nBest regards,\n${profile?.full_name || 'MOSI Research Team'}`

    window.location.href = `mailto:${session.stakeholder.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  React.useEffect(() => {
    if (session) setApproved(session.status === 'Published')
  }, [session])

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading briefing...</p>
    </div>
  )

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in px-4">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
        <FileCheck className="w-8 h-8 text-slate-200" />
      </div>
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Report Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">This session data is not yet available for preview.</p>
      </div>
      <button onClick={() => router.push('/')} className="h-11 px-8 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200">
        Go Home
      </button>
    </div>
  )

  const handleApproveAll = () => {
    if (session) { publishSession(session.id); setApproved(true) }
  }

  const stakeholder = session?.stakeholder
  const opportunities = session?.opportunities || []

  const handleStatusUpdate = (id: string, status: 'Approved' | 'Hidden' | 'Pending') => {
    updateOpportunityStatus(session.id, id, status)
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 px-4 sm:px-6 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <header className="space-y-6 sm:space-y-8 pt-6 sm:pt-10 pb-8 sm:pb-10 border-b border-slate-100">
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-[10px] sm:text-xs font-bold px-3 py-1 border rounded-full uppercase tracking-widest transition-all shadow-sm",
                isGuest ? "text-amber-600 bg-amber-50 border-amber-100" : "text-blue-600 bg-blue-50 border-blue-100"
              )}>
                {isGuest ? '• GUEST VIEW' : '• RESEARCHER VIEW'}
              </span>
              {approved && (
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5" /> Published
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isGuest && (
                <button 
                  onClick={() => router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                  className="hidden sm:flex h-9 px-4 bg-white border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 hover:border-blue-200 transition-all items-center gap-2 shadow-sm"
                >
                  Researcher Login <ChevronRight className="w-3 h-3" />
                </button>
              )}
              <button 
                onClick={() => router.back()} 
                className="w-10 h-10 sm:w-11 sm:h-11 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tighter uppercase italic leading-none">
              Strategic <br/><span className="text-blue-600">Briefing</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-500">
              Stakeholder: <span className="text-slate-800 font-bold">{stakeholder?.name || 'Anonymous'}</span> / {stakeholder?.role} · <span className="text-slate-800 font-bold">{stakeholder?.company || 'N/A'}</span> 
            </p>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Clock className="w-4 h-4" /> {session.date}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <BarChart2 className="w-4 h-4" /> {opportunities.length} Discovery Points
            </div>
          </div>

          {!isGuest && (
            <div className="flex gap-2 flex-wrap">
                {!approved ? (
                <button 
                    onClick={handleApproveAll} 
                    className="h-11 px-6 sm:px-8 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 flex-1 sm:flex-none"
                >
                    Publish Report <Check className="w-4 h-4" />
                </button>
                ) : (
                <div className="flex gap-2 flex-wrap">
                    <button 
                        onClick={handleShare}
                        className="h-11 px-4 sm:px-6 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share className="w-4 h-4" />}
                        {isCopied ? 'Copied' : 'Share'}
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        className="h-11 px-4 sm:px-6 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                    >
                        <FileText className="w-4 h-4" /> PDF
                    </button>
                    <button 
                        onClick={handleEmailDispatch}
                        className="h-11 px-4 sm:px-6 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100/50 flex-1 sm:flex-none"
                    >
                        <Mail className="w-4 h-4" /> Email
                    </button>
                </div>
            )}
            <button
               onClick={() => router.push(`/review?id=${session.id}`)}
               className="h-11 px-6 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-white transition-all active:scale-95 shadow-sm"
            >
               <Edit className="w-4 h-4" /> Edit Briefing
            </button>
          </div>)}

          {isGuest && !approved && (
            <div className="p-1 px-2">
               <button 
                    onClick={handleApproveAll} 
                    className="h-11 px-8 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                >
                    Sign-off & Publish Briefing <Check className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">As a stakeholder, you can authorize the final publication of this briefing.</p>
            </div>
          )}

          {isGuest && approved && (
             <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-4 duration-500">
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Public Briefing URL</p>
                   <div className="text-xs font-bold text-emerald-800 truncate select-all">{typeof window !== 'undefined' ? window.location.origin : ''}/preview?id={session.id}</div>
                </div>
                <button 
                   onClick={handleShare}
                   className="h-10 px-6 flex items-center justify-center bg-white border border-emerald-200 rounded-xl text-emerald-600 font-bold text-xs hover:bg-emerald-100 transition-all shadow-sm shrink-0 gap-2"
                >
                   {isCopied ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
                   {isCopied ? 'Link Copied' : 'Copy Briefing Link'}
                </button>
             </div>
          )}
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* EXECUTIVE SYNTHESIS SECTION */}
        {session.summary && (
          <section className="space-y-4 sm:space-y-6">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" /> Executive Synthesis
            </h3>
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="prose prose-slate max-w-none">
                {session.summary.split('\n\n').map((para, i) => (
                  <p key={i} className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium mb-4 sm:mb-6 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* METADATA & AUDIO */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">

          <div className="md:col-span-8 space-y-4 sm:space-y-6">
             <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1 sm:px-2">
                <Globe className="w-4 h-4 text-slate-400" /> Market Context
             </h3>
             <div className="grid grid-cols-2 gap-4 sm:gap-8 p-6 sm:p-10 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl">
                {[
                  { label: 'Domain', val: stakeholder?.domain, icon: Globe, color: 'text-blue-500' },
                  { label: 'Industry', val: stakeholder?.sector, icon: Briefcase, color: 'text-emerald-500' },
                  { label: 'Scale', val: stakeholder?.employees, icon: BarChart2, color: 'text-rose-500' },
                  { label: 'Headquarters', val: stakeholder?.geography, icon: MapPin, color: 'text-amber-500' },
                ].map(item => item.val ? (
                  <div key={item.label} className="space-y-1 sm:space-y-2">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                       {item.label}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-slate-700">{item.val}</p>
                  </div>
                ) : null)}
             </div>
          </div>

          <div className="md:col-span-4 space-y-4 sm:space-y-6">
             <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1 sm:px-2">
                <Headphones className="w-4 h-4 text-slate-400" /> Media
             </h3>
             <div className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 border border-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audio Log</p>
                    <p className="text-xs text-slate-700 font-bold uppercase">Recording</p>
                  </div>
                </div>
                {session.recordingUrl ? (
                  <>
                    <audio src={session.recordingUrl} controls playsInline preload="metadata" className="w-full h-10 rounded-lg" 
                      onError={(e) => {
                        const target = e.currentTarget.parentElement
                        if (target) {
                          const msg = target.querySelector('.audio-error-msg')
                          if (msg) (msg as HTMLElement).style.display = 'block'
                        }
                      }}
                    />
                    <p className="audio-error-msg text-[10px] text-amber-600 font-medium mt-1 hidden">
                      Audio format may not be supported on this device. Try on a laptop or Chrome browser.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">No recording found.</p>
                )}
             </div>
          </div>

        </div>

        {/* INSIGHTS GRID */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-slate-400" /> Opportunities
            </h3>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-white px-3 sm:px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
              {opportunities.length} Highlights
            </span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {opportunities.map((opp, index) => {
              const isExpanded = expandedId === opp.id;
              const oppEvidence = session.evidence.filter(e => (e as any).opportunity_id === opp.id)
              const theme = tagColors[opp.tag]

              return (
                <div key={opp.id} className={cn(
                  "bg-white border transition-all duration-300 overflow-hidden rounded-2xl sm:rounded-[2rem] shadow-sm",
                  isExpanded ? "ring-4 sm:ring-8 ring-slate-50 border-slate-200" : "border-slate-100 hover:border-slate-200",
                  opp.status === 'Hidden' && "opacity-40"
                )}>
                  <div className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-6">

                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="text-xs font-bold text-slate-300">#{(index + 1).toString().padStart(2, '0')}</span>
                        <span className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border', theme.text, theme.border, theme.bg)}>
                          {opp.tag}
                        </span>
                        {opp.paid && <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 rounded-full">Commercial</span>}
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                        {opp.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                      {!isGuest && !approved && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(opp.id, 'Approved')} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm", opp.status === 'Approved' ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-300 border-slate-100 hover:text-emerald-500")}>
                            <Check className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleStatusUpdate(opp.id, 'Hidden')} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm", opp.status === 'Hidden' ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-300 border-slate-100 hover:text-rose-500")}>
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                        className="h-10 px-4 sm:px-6 bg-slate-50 rounded-xl text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-all border border-slate-100 shadow-sm"
                      >
                        {isExpanded ? 'Hide' : 'Details'} {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="px-5 sm:px-8 pb-8 sm:pb-10 space-y-6 sm:space-y-8 animate-in slide-in-from-top-2 duration-300">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 pt-6 sm:pt-8 border-t border-slate-100">
                        <div className="space-y-3 sm:space-y-4">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Narrative</h5>
                          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">{opp.description || 'No detailed description provided.'}</p>
                        </div>
                        <div className="space-y-4 sm:space-y-6">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specifications</h5>
                          <div className="grid grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                            {[
                              { label: 'Timeline', val: opp.duration, icon: Clock },
                              { label: 'Scope', val: opp.engagementType, icon: Briefcase },
                              { label: 'Core Stack', val: opp.toolset, icon: Globe },
                              { label: 'Requirements', val: opp.skills, icon: FileText },
                            ].map(m => (
                              <div key={m.label} className="space-y-1">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">{m.label}</span>
                                <span className="block text-xs sm:text-sm font-bold text-slate-600">{m.val || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ASSETS */}
                      {oppEvidence.length > 0 && (
                        <div className="pt-6 sm:pt-8 border-t border-slate-100 space-y-3 sm:space-y-4">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference Assets</h5>
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {oppEvidence.map((ev, i) => (
                               <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="h-10 sm:h-11 px-4 sm:px-6 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 hover:bg-slate-100 transition-all font-bold group/asset shadow-sm">
                                  {ev.type === 'link' ? <LinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover/asset:text-slate-600" /> : <FileIcon className="w-3.5 h-3.5 text-slate-400 group-hover/asset:text-slate-600" />}
                                  <span className="text-[10px] sm:text-xs text-slate-500 group-hover/asset:text-slate-800 uppercase tracking-widest truncate max-w-[150px] sm:max-w-[200px]">{ev.title || ev.type}</span>
                               </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* GLOBAL EVIDENCE GALLERY */}
        {session.evidence.length > 0 && (
          <section className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1 sm:px-2">
              <ImageIcon className="w-4 h-4 text-blue-500" /> Session Artifacts & Evidence
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {session.evidence.map((ev, i) => (
                <div 
                  key={i} 
                  onClick={() => (ev.type === 'image' || ev.type === 'video') ? setSelectedAsset(ev) : window.open(ev.url, '_blank')}
                  className="group relative aspect-square bg-slate-50 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-500 cursor-pointer"
                >
                  {ev.type === 'image' ? (
                    <img src={ev.url} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : ev.type === 'video' ? (
                    <div className="relative w-full h-full">
                       <video src={ev.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
                       </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {ev.type === 'link' ? <LinkIcon className="w-6 h-6 text-blue-500" /> : <FileIcon className="w-6 h-6 text-emerald-500" />}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center truncate w-full px-2">{ev.title || 'Asset'}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                     <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] translate-y-2 group-hover:translate-y-0 transition-transform">View Archive</span>
                     <div className="w-8 h-1 bg-blue-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* REVIEW COMPARTMENTS — Researcher's structured notes */}
        {session.reviewNotes && session.reviewNotes.length > 0 && (
          <section className="space-y-4 sm:space-y-6">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 px-1 sm:px-2">
              <FileCheck className="w-4 h-4 text-emerald-500" /> Review Notes
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {session.reviewNotes.map((note: any, i: number) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{note.category}</p>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
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
              <X className="w-6 h-6 shadow-sm" />
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

    </div>
  )
}

export default function PreviewPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <PreviewContent />
    </React.Suspense>
  )
}