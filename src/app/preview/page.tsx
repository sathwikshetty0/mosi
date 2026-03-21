'use client'

import * as React from 'react'
import {
  FileCheck, FileText, Check, X,
  Building2, Clock, BarChart2,
  ChevronDown, ChevronUp, Image as ImageIcon, Link as LinkIcon, File as FileIcon, Play, Pause, ShieldCheck, Mail, Globe, MapPin, Briefcase, Headphones
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, string> = {
  Core: 'bg-blue-50 text-blue-600',
  Efficiency: 'bg-amber-50 text-amber-600',
  Expansion: 'bg-emerald-50 text-emerald-600',
  Disrupt: 'bg-rose-50 text-rose-600'
}

export default function PreviewPage() {
  const { sessions, publishSession, updateOpportunityStatus } = useMosiStore()
  const session = sessions.find(s => s.status === 'Review' || s.status === 'Published') || sessions[0]
  const router = useRouter()
  const [approved, setApproved] = React.useState(session?.status === 'Published')
  
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
        <FileCheck className="w-7 h-7 text-slate-300" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">No preview available</h3>
        <p className="text-sm text-slate-400 mt-1">Complete an interview first.</p>
      </div>
      <button onClick={() => router.push('/')} className="h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
        Go to Dashboard
      </button>
    </div>
  )

  const handleApproveAll = () => {
    if (session) { publishSession(session.id); setApproved(true) }
  }

  const stakeholder = session?.stakeholder
  const opportunities = session?.opportunities || []
  const date = session?.date
  const duration = session?.duration || 0

  const handleStatusUpdate = (id: string, status: 'Approved' | 'Hidden' | 'Pending') => {
    updateOpportunityStatus(session.id, id, status)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">Stakeholder Approval</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border", approved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100')}>
                {approved ? '✓ Published internally' : 'Review Required'}
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {stakeholder?.name || 'Untitled Participant'}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {stakeholder?.role} {stakeholder?.company && `at ${stakeholder.company}`}
              </p>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Clock className="w-4 h-4 text-slate-300" /> {date}
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <BarChart2 className="w-4 h-4 text-slate-300" /> {opportunities.length} Logs
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 lg:w-48">
            {!approved ? (
              <button 
                onClick={handleApproveAll} 
                className="h-12 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Approve All
              </button>
            ) : (
              <div className="h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest">
                <Check className="w-4 h-4" /> Approved
              </div>
            )}
            <button className="h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest">
              Export PDF
            </button>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          {[
            { label: 'Domain', val: stakeholder?.domain, icon: Globe },
            { label: 'Sector', val: stakeholder?.sector, icon: Briefcase },
            { label: 'Employees', val: stakeholder?.employees, icon: BarChart2 },
            { label: 'Geography', val: stakeholder?.geography, icon: MapPin },
          ].map(item => item.val ? (
            <div key={item.label} className="bg-slate-50 rounded-xl p-4 space-y-1 text-center">
              <item.icon className="w-4 h-4 text-blue-500 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-xs font-bold text-slate-900 truncate">{item.val}</p>
            </div>
          ) : null)}
        </div>

        {/* AUDIO PLAYER - STAKEHOLDER VERSION */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 mt-4">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Session Recording</p>
            {session.recordingUrl ? (
              <audio src={session.recordingUrl} controls className="w-full h-8" />
            ) : (
              <p className="text-xs text-slate-400 italic font-medium mt-1">Recording is not available.</p>
            )}
          </div>
        </div>
      </div>

      {/* CHALLENGES LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Identified Challenges / Logs</h3>
        
        {opportunities.map((opp, index) => {
          const isExpanded = expandedId === opp.id;
          const oppEvidence = session.evidence.filter(e => (e as any).opportunity_id === opp.id)

          return (
            <div key={opp.id} className={cn("bg-white border rounded-3xl overflow-hidden transition-all shadow-sm",
              opp.status === 'Approved' ? "border-emerald-200 bg-emerald-50/10" : 
              opp.status === 'Hidden' ? "border-red-200 bg-red-50/10 opacity-75" : "border-slate-100 hover:border-blue-200"
            )}>
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">#{index + 1}</span>
                    <span className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg', tagColors[opp.tag])}>{opp.tag}</span>
                    {opp.paid ? (
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] border border-emerald-100 font-black uppercase tracking-widest px-2 py-1 rounded-md">Commercial (Paid)</span>
                    ) : (
                      <span className="bg-slate-50 text-slate-500 text-[9px] border border-slate-200 font-black uppercase tracking-widest px-2 py-1 rounded-md">Draft / Unpaid</span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-tight">{opp.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                     <button 
                       onClick={() => handleStatusUpdate(opp.id, 'Approved')} 
                       className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all", opp.status === 'Approved' ? "bg-emerald-500 text-white shadow-md" : "bg-white text-emerald-600 hover:bg-emerald-50 border border-transparent")}
                       title="Approve"
                     >
                       <Check className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => handleStatusUpdate(opp.id, 'Hidden')} 
                       className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-all", opp.status === 'Hidden' ? "bg-red-500 text-white shadow-md" : "bg-white text-red-500 hover:bg-red-50 border border-transparent")}
                       title="Reject / Hide"
                     >
                       <X className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                    className="h-14 px-5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                  >
                    More {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* EXPANDED DETAILS */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-6 animate-in slide-in-from-top-4 duration-300">
                  
                  {/* Notes & Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</h5>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">{opp.description || 'No descriptive details provided.'}</p>
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirements</h5>
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-xs font-semibold text-slate-500">Timeline</span>
                          <span className="text-xs font-bold text-slate-900">{opp.duration || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-xs font-semibold text-slate-500">Engagement</span>
                          <span className="text-xs font-bold text-slate-900">{opp.engagementType || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <span className="text-xs font-semibold text-slate-500">Skillset</span>
                          <span className="text-xs font-bold text-slate-900">{opp.skills || 'Any'}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-xs font-semibold text-slate-500">Toolset</span>
                          <span className="text-xs font-bold text-slate-900">{opp.toolset || 'Any'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specific Evidence */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Digital Assets for this Log</h5>
                    </div>
                    {oppEvidence.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {oppEvidence.map((ev, i) => (
                           <div key={i} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                             {ev.type === 'image' ? (
                               <img src={ev.url} alt={ev.title} className="w-full h-full object-cover" />
                             ) : ev.type === 'video' ? (
                               <video src={ev.url} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                                 {ev.type === 'link' ? <LinkIcon className="w-6 h-6 text-slate-400" /> : <FileIcon className="w-6 h-6 text-slate-400" />}
                                 <p className="text-[10px] font-bold text-slate-500 w-full text-center truncate">{ev.title || 'Attachment'}</p>
                               </div>
                             )}
                             <a href={ev.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 bg-slate-900/40 transition-opacity flex items-center justify-center">
                               <span className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">View Asset</span>
                             </a>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                        <p className="text-xs font-medium text-slate-400 italic">No specific assets linked to this log.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )
        })}
        {opportunities.length === 0 && (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-400">No logs identified to preview.</p>
          </div>
        )}
      </div>

    </div>
  )
}
