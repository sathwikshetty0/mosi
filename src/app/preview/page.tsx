'use client'

import * as React from 'react'
import {
  FileCheck, Globe, Clock, BarChart2,
  ChevronDown, ChevronUp, Image as ImageIcon, Link as LinkIcon, File as FileIcon, Check, X,
  MapPin, Briefcase, Headphones, FileText, Share, Zap, Sparkles
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMosiStore, CEEDTag } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, { text: string; border: string; bg: string; icon: string }> = {
  Core: { text: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50/50', icon: 'text-blue-400' },
  Efficiency: { text: 'text-amber-600', border: 'border-amber-100', bg: 'bg-amber-50/50', icon: 'text-amber-400' },
  Expansion: { text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/50', icon: 'text-emerald-400' },
  Disrupt: { text: 'text-rose-600', border: 'border-rose-100', bg: 'bg-rose-50/50', icon: 'text-rose-400' }
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
    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
        <FileCheck className="w-8 h-8 text-slate-200" />
      </div>
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Report Unavailable</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">This session data is not yet available for preview.</p>
      </div>
      <button onClick={() => router.push('/')} className="h-10 px-6 bg-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all">
        Dashboard
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
    <div className="max-w-4xl mx-auto pb-32 px-6 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <header className="space-y-8 pt-10 pb-10 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">
                Protocol Preview
              </span>
              {approved && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Approved
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {stakeholder?.name || 'Anonymous'}
              </h1>
              <p className="text-base font-medium text-slate-500">
                {stakeholder?.role} / <span className="text-slate-800">{stakeholder?.company || 'N/A'}</span> 
              </p>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" /> {session.date}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <BarChart2 className="w-3.5 h-3.5" /> {opportunities.length} Insights
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {!approved ? (
              <button 
                onClick={handleApproveAll} 
                className="h-11 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Approve <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="h-11 px-6 bg-white border border-slate-100 text-slate-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Published
              </div>
            )}
            <button className="w-11 h-11 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <div className="py-12 space-y-16">
        
        {/* EXECUTIVE SYNTHESIS SECTION */}
        {session.summary && (
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" /> Analysis Synthesis
            </h3>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="prose prose-slate max-w-none">
                {session.summary.split('\n\n').map((para, i) => (
                  <p key={i} className="text-base text-slate-600 leading-relaxed font-normal mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* METADATA & AUDIO */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-8 space-y-6">
             <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                <Globe className="w-3.5 h-3.5" /> Market Context
             </h3>
             <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
                {[
                  { label: 'Domain', val: stakeholder?.domain, icon: Globe, color: 'text-blue-500' },
                  { label: 'Industry', val: stakeholder?.sector, icon: Briefcase, color: 'text-emerald-500' },
                  { label: 'Scale', val: stakeholder?.employees, icon: BarChart2, color: 'text-rose-500' },
                  { label: 'Location', val: stakeholder?.geography, icon: MapPin, color: 'text-amber-500' },
                ].map(item => item.val ? (
                  <div key={item.label} className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <item.icon className={cn("w-3 h-3", item.color)} /> {item.label}
                    </p>
                    <p className="text-sm font-bold text-slate-700">{item.val}</p>
                  </div>
                ) : null)}
             </div>
          </div>

          <div className="md:col-span-4 space-y-6">
             <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2 px-2">
                <Headphones className="w-3.5 h-3.5" /> Audio
             </h3>
             <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Recording</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Master MP3</p>
                  </div>
                </div>
                {session.recordingUrl ? (
                  <audio src={session.recordingUrl} controls className="w-full h-8" />
                ) : (
                  <p className="text-[10px] text-slate-400 italic">No audio.</p>
                )}
             </div>
          </div>

        </div>

        {/* INSIGHTS GRID */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center gap-2">
              <FileIcon className="w-3.5 h-3.5" /> Log Insights
            </h3>
            <span className="text-[9px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">
              {opportunities.length} Total
            </span>
          </div>
          
          <div className="space-y-4">
            {opportunities.map((opp, index) => {
              const isExpanded = expandedId === opp.id;
              const oppEvidence = session.evidence.filter(e => (e as any).opportunity_id === opp.id)
              const theme = tagColors[opp.tag]

              return (
                <div key={opp.id} className={cn(
                  "bg-white border transition-all duration-300 overflow-hidden rounded-2xl",
                  isExpanded ? "ring-4 ring-slate-50 border-slate-200" : "border-slate-100 hover:border-slate-200",
                  opp.status === 'Hidden' && "opacity-40"
                )}>
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-300">#{(index + 1).toString().padStart(2, '0')}</span>
                        <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border', theme.text, theme.border, theme.bg)}>
                          {opp.tag}
                        </span>
                        {opp.paid && <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 rounded">Paid</span>}
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 tracking-tight uppercase">
                        {opp.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex gap-1.5">
                         <button 
                           onClick={() => handleStatusUpdate(opp.id, 'Approved')} 
                           className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all border", 
                            opp.status === 'Approved' ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-300 border-slate-100 hover:text-emerald-500")}
                         >
                           <Check className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleStatusUpdate(opp.id, 'Hidden')} 
                           className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all border", 
                            opp.status === 'Hidden' ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-300 border-slate-100 hover:text-rose-500")}
                         >
                           <X className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                        className="h-9 px-4 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-all"
                      >
                        {isExpanded ? 'Close' : 'View'} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="px-6 pb-8 space-y-8 animate-in slide-in-from-top-2 duration-300">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                        <div className="space-y-4">
                          <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Detail Narrative</h5>
                          <p className="text-sm text-slate-600 leading-relaxed">{opp.description || 'No description.'}</p>
                        </div>
                        <div className="space-y-4">
                          <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Metrics</h5>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: 'Time', val: opp.duration, icon: Clock },
                              { label: 'Role', val: opp.engagementType, icon: Briefcase },
                              { label: 'Stack', val: opp.toolset, icon: Globe },
                            ].map(m => (
                              <div key={m.label} className="space-y-1">
                                <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><m.icon className="w-3 h-3" /> {m.label}</span>
                                <span className="block text-xs font-bold text-slate-600">{m.val || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ASSETS */}
                      {oppEvidence.length > 0 && (
                        <div className="pt-6 border-t border-slate-50 space-y-4">
                          <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Linked Assets</h5>
                          <div className="flex flex-wrap gap-3">
                            {oppEvidence.map((ev, i) => (
                               <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="h-9 px-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 hover:bg-slate-100 transition-all group/asset">
                                  {ev.type === 'link' ? <LinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover/asset:text-slate-600" /> : <FileIcon className="w-3.5 h-3.5 text-slate-400 group-hover/asset:text-slate-600" />}
                                  <span className="text-[10px] font-bold text-slate-500 group-hover/asset:text-slate-800 uppercase tracking-widest truncate max-w-[150px]">{ev.title || ev.type}</span>
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
