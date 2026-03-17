'use client'

import * as React from 'react'
import {
  FileCheck, FileText, Download, Sparkles, Check, X,
  ArrowRight, TrendingUp, Brain, ShieldCheck, Globe,
  Clock, Building2, BarChart2, MessageSquare, Eye, EyeOff, MessageCircle,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn, exportToCSV } from '@/lib/utils'

const tagColors: Record<CEEDTag, string> = {
  Core: 'bg-blue-50 text-blue-600 border border-blue-100',
  Efficiency: 'bg-amber-50 text-amber-600 border border-amber-100',
  Expansion: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  Disrupt: 'bg-rose-50 text-rose-600 border border-rose-100'
}

export default function PreviewPage() {
  const { sessions, publishSession, updateOpportunityStatus, updateTranscriptStatus } = useMosiStore()
  const session = sessions.find(s => s.status === 'Review') || sessions[0]
  const router = useRouter()
  const [approved, setApproved] = React.useState(session?.status === 'Published')
  const [activeTab, setActiveTab] = React.useState<'summary' | 'transcript' | 'opportunities'>('summary')

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
        <FileCheck className="w-8 h-8 text-slate-200" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">No preview available</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          Complete an interview and transition it to review status to see the stakeholder preview.
        </p>
      </div>
      <Button id="go-home-btn" onClick={() => router.push('/')} className="btn-primary">
        Go to Dashboard
      </Button>
    </div>
  )

  const handleApprove = () => {
    if (session) {
      publishSession(session.id)
      setApproved(true)
    }
  }

  const handleExportCSV = () => {
    const data = (session.opportunities || []).map(o => ({
      Title: o.title,
      Tag: o.tag,
      Paid: o.paid ? 'Yes' : 'No',
      Duration: o.duration,
      Skills: o.skills,
      Description: o.description,
      Timestamp: formatDuration(o.timestamp),
      Status: o.status
    }))
    exportToCSV(data, `MOSI_Opportunities_${session.stakeholder.company}.csv`)
  }

  const { stakeholder, opportunities, date, duration, transcript } = session

  const handleStatusUpdate = (id: string, type: 'opp' | 'para', status: 'Approved' | 'Hidden' | 'Pending') => {
    if (type === 'opp') {
      updateOpportunityStatus(session.id, id, status)
    } else {
      updateTranscriptStatus(session.id, id, status)
    }
  }

  const handleCommentUpdate = (id: string, type: 'opp' | 'para') => {
    const comment = prompt("Add a comment/correction:")
    if (comment === null) return
    if (type === 'opp') {
      const opp = opportunities.find(o => o.id === id)
      updateOpportunityStatus(session.id, id, opp?.status || 'Pending', comment)
    } else {
      const para = transcript?.find(p => p.id === id)
      updateTranscriptStatus(session.id, id, para?.status || 'Pending', comment)
    }
  }

  // Dynamic AI analysis
  const problemStatement = opportunities.length > 0 
    ? `${stakeholder.company} is experiencing ${opportunities.length} primary challenges, focusing on ${opportunities[0].tag} strategic improvements.`
    : "No primary pain points identified during the session."
  const opportunityStatement = opportunities.length > 0
    ? `Highest priority focus: "${opportunities[0].title}". This presents a strategic window for ${stakeholder.sector} optimization.`
    : "Interview complete. Identify opportunities in the review phase to generate a strategic outlook."

  const timelineHighlights = [
    ...(opportunities.slice(0, 3).map(o => ({
      time: formatDuration(o.timestamp),
      event: o.title
    }))),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4 lg:px-0">
      
      {/* 🚀 STAKEHOLDER HEADER */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 lg:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe className="w-64 h-64 -mr-20 -mt-20 shrink-0" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">
                Stakeholder Preview
              </span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-all ${approved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {approved ? '✓ Published & Approved' : 'Review Required'}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
              Executive Summary: <br/><span className="text-blue-400">{stakeholder.name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-4 lg:gap-8 text-sm text-slate-400 font-bold">
              <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Building2 className="w-4 h-4 text-blue-500" />{stakeholder.company}</span>
              <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><Clock className="w-4 h-4 text-blue-500" />{date} · {formatDuration(duration)}</span>
              <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]"><BarChart2 className="w-4 h-4 text-blue-500" />{opportunities.length} Insights</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 lg:w-64">
             {!approved ? (
                <button
                  onClick={handleApprove}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" /> Approve & Sign
                </button>
             ) : (
                <div className="h-14 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ring-4 ring-emerald-500/10">
                   <Check className="w-5 h-5" /> Approved
                </div>
             )}
             <button onClick={handleExportCSV} className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Download Opportunity CSV
             </button>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-20 px-2">
         {[
            { id: 'summary', label: 'Analysis', icon: Brain },
            { id: 'opportunities', label: 'Insights', icon: TrendingUp },
            { id: 'transcript', label: 'Transcript', icon: FileText },
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                  "flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                  activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
               )}
            >
               <tab.icon className="w-4 h-4" />
               {tab.label}
               {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900 rounded-t-full" />
               )}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📋 MAIN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-8">
          
          {activeTab === 'summary' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
               {/* AI Intelligence */}
               <div className="premium-card p-6 lg:p-10 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">AI Insight Matrix</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Synthetic intelligence discovery</p>
                     </div>
                     <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Enhanced Discovery</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Bottleneck</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{problemStatement}"</p>
                     </div>
                     <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 space-y-4 shadow-inner">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Discovery Outcome</p>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed font-black">"{opportunityStatement}"</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-4">Critical Timeline Events</h4>
                     <div className="grid grid-cols-1 gap-4">
                        {timelineHighlights.map((h, i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 font-bold group hover:border-blue-200 transition-all">
                              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-lg flex-none">{h.time}</span>
                              <p className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{h.event}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'opportunities' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Discovery Items ({opportunities.length})</h3>
               <div className="grid grid-cols-1 gap-4">
                  {opportunities.map((opp) => (
                     <div key={opp.id} className={cn(
                        "premium-card p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border-2 transition-all",
                        opp.status === 'Approved' ? "border-emerald-100 bg-emerald-50/20" : 
                        opp.status === 'Hidden' ? "opacity-40 grayscale" : "border-slate-100 bg-white"
                     )}>
                        <div className="space-y-3 flex-1">
                           <div className="flex items-center gap-2">
                              <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest', tagColors[opp.tag])}>
                                 {opp.tag}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formatDuration(opp.timestamp)} Mark</span>
                              {opp.status === 'Approved' && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Verified</span>}
                           </div>
                           <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{opp.title}</h4>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-loose">
                              Status: <span className="text-slate-900">{opp.status}</span> · Duration: <span className="text-slate-900">{opp.duration || 'N/A'}</span> · Skills: <span className="text-slate-900">{opp.skills || 'N/A'}</span>
                           </p>
                           {opp.comment && (
                              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
                                 <MessageCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                 <p className="text-[10px] font-bold text-amber-700 italic">"{opp.comment}"</p>
                              </div>
                           )}
                        </div>
                        
                        <div className="flex items-center gap-2 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                           <button onClick={() => handleCommentUpdate(opp.id, 'opp')} className="flex-1 lg:flex-none p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                              <MessageSquare className="w-4 h-4" />
                           </button>
                           {opp.status !== 'Approved' && (
                              <button onClick={() => handleStatusUpdate(opp.id, 'opp', 'Approved')} className="flex-1 lg:flex-none h-10 px-4 rounded-xl border border-slate-200 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                                 Verify
                              </button>
                           )}
                           <button onClick={() => handleStatusUpdate(opp.id, 'opp', opp.status === 'Hidden' ? 'Pending' : 'Hidden')} className="flex-1 lg:flex-none p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-all">
                              {opp.status === 'Hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
          )}

          {activeTab === 'transcript' && (
             <div className="premium-card p-6 lg:p-10 bg-white border border-slate-100 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-1">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Record Transcript</h3>
                   <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Interactive Paragraph Review</p>
                </div>

                <div className="space-y-6">
                   {transcript?.map((para) => (
                      <div key={para.id} className={cn(
                        "p-4 lg:p-6 rounded-3xl transition-all relative group",
                        para.status === 'Approved' ? "bg-emerald-50/20 border border-emerald-50" : 
                        para.status === 'Hidden' ? "opacity-20 blur-[1px]" : "hover:bg-slate-50 border border-transparent hover:border-slate-100"
                      )}>
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{para.speaker}</span>
                               <span className="text-[9px] font-bold text-slate-300 uppercase">{formatDuration(para.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button onClick={() => handleStatusUpdate(para.id, 'para', 'Approved')} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all bg-white"><Check className="w-3 h-3" /></button>
                               <button onClick={() => handleCommentUpdate(para.id, 'para')} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all bg-white"><MessageSquare className="w-3 h-3" /></button>
                               <button onClick={() => handleStatusUpdate(para.id, 'para', para.status === 'Hidden' ? 'Pending' : 'Hidden')} className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all bg-white">{para.status === 'Hidden' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                            </div>
                         </div>
                         <p className="text-sm lg:text-base text-slate-700 leading-relaxed font-medium">
                            {para.text}
                         </p>
                         {para.comment && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-50 flex items-start gap-2">
                               <MessageCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                               <p className="text-[9px] font-bold text-amber-600 italic">"{para.comment}"</p>
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        {/* 🏢 SIDEBAR: STAKEHOLDER CONTEXT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card p-6 bg-white border border-slate-100 shadow-xl space-y-6">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder Intelligence</h3>
             <div className="space-y-4">
                {[
                  { label: 'Primary Contact', val: stakeholder.name, icon: Users },
                  { label: 'Role / Designation', val: stakeholder.role, icon: ShieldCheck },
                  { label: 'Enterprise', val: stakeholder.company, icon: Building2 },
                  { label: 'Sector Context', val: stakeholder.sector, icon: Globe },
                  { label: 'Org Scale', val: stakeholder.employees, icon: BarChart2 },
                ].filter(r => r.val).map(row => (
                  <div key={row.label} className="space-y-1">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <row.icon className="w-3 h-3" /> {row.label}
                     </p>
                     <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{row.val}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="premium-card p-6 bg-slate-900 text-white space-y-6">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Verification</h3>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                As a stakeholder, you can verify each insight, hide sensitive paragraphs, or add clarifying comments.
             </p>
             <ul className="space-y-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Use Transcript Tab to Review text</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Approve individual Insights</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"/> Hide blocks from public report</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
