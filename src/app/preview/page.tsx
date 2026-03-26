'use client'

import * as React from 'react'
import {
  FileCheck, Globe, Clock, BarChart2,
  ChevronDown, ChevronUp, Image as ImageIcon, Link as LinkIcon, File as FileIcon, Check, X,
  MapPin, Briefcase, Headphones, FileText, Share
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMosiStore, CEEDTag } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, string> = {
  Core: 'text-slate-600 border-slate-200 bg-slate-50',
  Efficiency: 'text-slate-600 border-slate-200 bg-slate-50',
  Expansion: 'text-slate-600 border-slate-200 bg-slate-50',
  Disrupt: 'text-slate-600 border-slate-200 bg-slate-50'
}

export default function PreviewPage() {
  const { sessions, publishSession, updateOpportunityStatus } = useMosiStore()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('id')
  
  const session = React.useMemo(() => {
    if (sessionId) return sessions.find(s => s.id === sessionId)
    return sessions.find(s => s.status === 'Review' || s.status === 'Published') || sessions[0]
  }, [sessions, sessionId])

  const router = useRouter()
  const [approved, setApproved] = React.useState(session?.status === 'Published')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (session) setApproved(session.status === 'Published')
  }, [session])

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6">
        <FileCheck className="w-10 h-10 text-slate-200" />
      </div>
      <div className="space-y-2 mb-8">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Report Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">This session hasn't been finalized or synchronized yet.</p>
      </div>
      <button onClick={() => router.push('/')} className="h-11 px-8 bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-900 transition-all">
        Return to Dashboard
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
    <div className="max-w-4xl mx-auto pb-40 px-6 animate-in fade-in duration-1000">
      
      {/* HEADER SECTION */}
      <header className="space-y-10 pt-12 pb-16 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1 bg-slate-50 border border-slate-100 rounded-md">
                Confidential Report
              </span>
              {approved && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                  ✓ Verified & Published
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                {stakeholder?.name || 'Anonymous Participant'}
              </h1>
              <p className="text-lg font-medium text-slate-500 max-w-2xl">
                {stakeholder?.role} at <span className="text-slate-700">{stakeholder?.company || 'Leading Enterprise'}</span> 
                {stakeholder?.sector && ` in the ${stakeholder.sector} sector.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-8 items-center pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 pr-8">
                <Clock className="w-4 h-4 text-slate-300" /> {session.date}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 pr-8">
                <BarChart2 className="w-4 h-4 text-slate-300" /> {opportunities.length} Insights Identified
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Globe className="w-4 h-4 text-slate-300" /> {stakeholder?.geography || 'Global'}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col gap-3 shrink-0">
            {!approved ? (
              <button 
                onClick={handleApproveAll} 
                className="h-14 px-10 bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
              >
                Approve Report <Check className="w-4 h-4" />
              </button>
            ) : (
              <div className="h-14 px-10 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
                <Check className="w-4 h-4 text-emerald-500" /> Export Published
              </div>
            )}
            <div className="flex gap-3">
              <button className="flex-1 h-12 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all" title="Share">
                <Share className="w-4 h-4" />
              </button>
              <button className="flex-1 h-12 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all" title="Download PDF">
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="py-20 space-y-24">
        
        {/* EXECUTIVE SYNTHESIS SECTION */}
        {session.summary && (
          <section className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Section 01 / Executive Synthesis</h3>
              <div className="h-1 w-12 bg-slate-800 rounded-full" />
            </div>
            <div className="bg-slate-50/50 rounded-[2.5rem] p-12 border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -z-10 -mr-32 -mt-32" />
               <div className="prose prose-slate prose-lg max-w-none">
                {session.summary.split('\n\n').map((para, i) => (
                  <p key={i} className="text-lg text-slate-600 leading-relaxed font-normal last:mb-0 mb-6 drop-shadow-sm">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DATA MATRIX & AUDIO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-8 space-y-10">
             <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Section 02 / Metadata & Context</h3>
                <div className="h-1 w-12 bg-slate-800 rounded-full" />
             </div>
             <div className="grid grid-cols-2 gap-y-10 gap-x-12 p-10 bg-white border border-slate-100 rounded-[2.5rem]">
                {[
                  { label: 'Primary Domain', val: stakeholder?.domain, icon: Globe },
                  { label: 'Industry Sector', val: stakeholder?.sector, icon: Briefcase },
                  { label: 'Organizational Scale', val: stakeholder?.employees, icon: BarChart2 },
                  { label: 'Market Geography', val: stakeholder?.geography, icon: MapPin },
                ].map(item => item.val ? (
                  <div key={item.label} className="space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </p>
                    <p className="text-lg font-bold text-slate-700">{item.val}</p>
                  </div>
                ) : null)}
             </div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Source Audio</h3>
                <div className="h-1 w-8 bg-slate-800 rounded-full" />
             </div>
             <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 text-white shadow-2xl shadow-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verbatim Master</p>
                    <p className="text-xs text-white/60 font-medium">Session MP3</p>
                  </div>
                </div>
                {session.recordingUrl ? (
                  <audio src={session.recordingUrl} controls className="w-full h-10 opacity-80" />
                ) : (
                  <p className="text-xs text-slate-500 italic">No audio recorded.</p>
                )}
             </div>
          </div>

        </div>

        {/* INSIGHTS GRID */}
        <section className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Section 03 / Core Insight Mapping</h3>
              <div className="h-1 w-12 bg-slate-800 rounded-full" />
            </div>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 uppercase tracking-widest">
              {opportunities.length} Total Logs
            </span>
          </div>
          
          <div className="space-y-8">
            {opportunities.map((opp, index) => {
              const isExpanded = expandedId === opp.id;
              const oppEvidence = session.evidence.filter(e => (e as any).opportunity_id === opp.id)

              return (
                <div key={opp.id} className={cn(
                  "group bg-white border border-slate-100 rounded-[2.5rem] transition-all duration-500 overflow-hidden",
                  opp.status === 'Hidden' && "opacity-40",
                  isExpanded ? "ring-2 ring-slate-800/10 shadow-2xl shadow-slate-100" : "hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50"
                )}>
                  <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">#{(index + 1).toString().padStart(2, '0')}</span>
                        <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border', tagColors[opp.tag])}>
                          {opp.tag} Index
                        </span>
                        {opp.paid && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-2 rounded-md">Validated Asset</span>}
                      </div>
                      <h4 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:translate-x-1 transition-transform uppercase">
                        {opp.title}
                      </h4>
                      <p className="text-base text-slate-500 font-medium leading-relaxed max-w-2xl px-1 border-l-2 border-slate-100 ml-1">
                        {opp.description?.substring(0, 140)}{opp.description?.length > 140 ? '...' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex gap-2">
                         <button 
                           onClick={() => handleStatusUpdate(opp.id, 'Approved')} 
                           className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all border outline-none", 
                            opp.status === 'Approved' ? "bg-slate-800 text-white border-slate-800 shadow-lg" : "bg-white text-slate-300 border-slate-100 hover:text-emerald-500 hover:border-emerald-100")}
                         >
                           <Check className="w-5 h-5" />
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(opp.id, 'Hidden')} 
                           className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all border outline-none", 
                            opp.status === 'Hidden' ? "bg-slate-800 text-white border-slate-800 shadow-lg" : "bg-white text-slate-300 border-slate-100 hover:text-red-500 hover:border-red-100")}
                         >
                           <X className="w-5 h-5" />
                         </button>
                      </div>
                      
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                        className="h-12 px-6 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-2 transition-all"
                      >
                        {isExpanded ? 'Collapse' : 'Detailed View'} {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="px-10 pb-12 space-y-12 animate-in slide-in-from-top-4 duration-500">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-10 border-t border-slate-50">
                        <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Full Log Narrative</h5>
                          <p className="text-lg text-slate-600 leading-relaxed font-normal">{opp.description || 'No descriptive details provided.'}</p>
                        </div>
                        <div className="space-y-8">
                          <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Commercial Specifications</h5>
                          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                            {[
                              { label: 'Timeline', val: opp.duration, icon: Clock },
                              { label: 'Resource Model', val: opp.engagementType, icon: Briefcase },
                              { label: 'Skill Vector', val: opp.skills, icon: BarChart2 },
                              { label: 'Tool Stack', val: opp.toolset, icon: Globe },
                            ].map(m => (
                              <div key={m.label} className="space-y-2">
                                <span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <m.icon className="w-3 h-3" /> {m.label}
                                </span>
                                <span className="block text-sm font-bold text-slate-700">{m.val || 'Unspecified'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ASSETS */}
                      {oppEvidence.length > 0 && (
                        <div className="pt-10 border-t border-slate-50 space-y-6">
                          <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Linked Verification Assets</h5>
                          <div className="flex flex-wrap gap-4">
                            {oppEvidence.map((ev, i) => (
                               <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="h-12 px-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:bg-slate-100 hover:border-slate-200 transition-all group/asset shadow-sm">
                                  {ev.type === 'link' ? <LinkIcon className="w-4 h-4 text-slate-400 group-hover/asset:text-slate-800" /> : <FileIcon className="w-4 h-4 text-slate-400 group-hover/asset:text-slate-800" />}
                                  <span className="text-[10px] font-bold text-slate-500 group-hover/asset:text-slate-800 uppercase tracking-widest truncate max-w-[180px]">{ev.title || ev.type}</span>
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

      </div>

    </div>
  )
}
