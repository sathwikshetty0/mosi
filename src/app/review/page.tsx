'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, MessageSquare, Clock, Edit3, ChevronRight,
  CheckCircle2, Star, Download, Share2, Trash2,
  ArrowUpRight, Tag, BarChart2, CheckCircle, Brain, Sparkles, Sidebar,
  FileText, Headphones, Save, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMosiStore, CEEDTag, Opportunity, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, { bg: string; text: string; border: string }> = {
  Core: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  Efficiency: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  Expansion: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  Disrupt: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' }
}

const CHECKLIST = [
  'Stakeholder profile captured',
  'Enterprise profile noted',
  'Market context assessed',
  'Core opportunity identified',
  'Efficiency opportunity identified',
  'Expansion explored',
  'Disrupt explored'
]

export default function ReviewPage() {
  const router = useRouter()
  const { sessions, updateOpportunity, publishSession, deleteSession, updateSessionSummary } = useMosiStore()
  const [activeTab, setActiveTab] = React.useState<'insights' | 'transcript' | 'summary'>('insights')
  
  // Show first session with review status, or first session
  const session = sessions.find(s => s.status === 'Review') || sessions[0]

  const [selectedId, setSelectedId] = React.useState<string>(session?.opportunities[0]?.id || '')
  const [checklist, setChecklist] = React.useState<boolean[]>(CHECKLIST.map(() => false))
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')

  const selectedOpp = session?.opportunities.find(o => o.id === selectedId)

  const toggleChecklist = (i: number) => {
    setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const handlePublish = () => {
    if (session) {
      if (localSummary !== session.summary) {
        updateSessionSummary(session.id, localSummary)
      }
      publishSession(session.id)
      router.push('/preview')
    }
  }

  const handleDelete = () => {
    if (session && confirm('Are you sure you want to delete this interview?')) {
      deleteSession(session.id)
      router.push('/')
    }
  }

  const handleSaveSummary = () => {
    if (session) {
      updateSessionSummary(session.id, localSummary)
    }
  }

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
        <BarChart2 className="w-8 h-8 text-slate-200" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">No interviews to review</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
          You don't have any interviews pending review. Start a new interview to begin.
        </p>
      </div>
      <Button onClick={() => router.push('/setup')} className="btn-primary">
        Start Interview
      </Button>
    </div>
  )

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      {/* 🚀 HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 lg:p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-slate-200">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
             <div className="flex items-center gap-2">
                <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">In Review</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{session.date}</span>
             </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-tighter">
              {session.stakeholder.name}
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
               {formatDuration(session.duration)} Session · {session.stakeholder.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button id="delete-btn" onClick={handleDelete} className="p-4 rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
            <Trash2 className="w-5 h-5" />
          </button>
          <button 
            id="publish-btn" 
            onClick={handlePublish} 
            className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-300 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Publish Preview <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📋 CENTER WORKSPACE */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* PLAYER & AUDIO ARTIFACT */}
           <div className="premium-card p-4 lg:p-6 bg-slate-900 text-white flex flex-col lg:flex-row items-center gap-6 group">
             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:bg-blue-500 transition-all">
               <Headphones className="w-6 h-6" />
             </div>
             <div className="flex-1 w-full space-y-3">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interview Audio Artifact</p>
                  <span className="text-[10px] font-black text-blue-400">00:00 / {formatDuration(session.duration)}</span>
               </div>
               {session.recordingUrl ? (
                 <audio src={session.recordingUrl} controls className="w-full h-8 opacity-40 hover:opacity-100 transition-opacity" />
               ) : (
                 <div className="p-2 bg-white/5 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                   <Clock className="w-4 h-4" /> Recording Not Linked for local Preview
                 </div>
               )}
             </div>
           </div>

           {/* NAVIGATION TABS */}
           <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
              {[
                { id: 'insights' as const, label: 'Insight Register', icon: Zap },
                { id: 'summary' as const, label: 'Session Summary', icon: FileText },
                { id: 'transcript' as const, label: 'Transcript', icon: MessageSquare },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                   <tab.icon className="w-3.5 h-3.5" />
                   {tab.label}
                </button>
              ))}
           </div>

           {activeTab === 'insights' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="premium-card p-0 overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {['#', 'Discovery Item', 'Tag', 'Context'].map(h => (
                            <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {session.opportunities.map((opp, i) => (
                          <tr
                            key={opp.id}
                            onClick={() => setSelectedId(opp.id)}
                            className={cn('cursor-pointer transition-all hover:bg-slate-50/80', selectedId === opp.id && 'bg-blue-50/50 border-l-4 border-l-blue-500')}
                          >
                            <td className="px-6 py-5 text-[10px] font-black text-slate-300">{String(i + 1).padStart(2, '0')}</td>
                            <td className="px-6 py-5">
                              <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{opp.title}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{formatDuration(opp.timestamp)} mark</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border',
                                tagColors[opp.tag].bg, tagColors[opp.tag].text, tagColors[opp.tag].border)}>
                                {opp.tag}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex gap-1.5 flex-wrap">
                                  {opp.paid && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Paid</span>}
                                  <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{opp.duration || 'Short Term'}</span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ACTIVE EDITOR */}
                {selectedOpp && (
                   <div className="premium-card p-8 bg-white border-2 border-slate-900 shadow-2xl shadow-slate-300/50 space-y-8 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
                         <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Insight Tuning</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">discovered at {formatDuration(selectedOpp.timestamp)}</p>
                         </div>
                         <span className={cn('text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border',
                            tagColors[selectedOpp.tag].bg, tagColors[selectedOpp.tag].text, tagColors[selectedOpp.tag].border)}>
                            {selectedOpp.tag}
                         </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Headline Opportunity</label>
                               <input 
                                 type="text"
                                 className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 focus:border-slate-900 outline-none transition-all uppercase tracking-tight"
                                 value={selectedOpp.title}
                                 onChange={(e) => updateOpportunity(selectedOpp.id, { title: e.target.value })}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Detailed Analysis</label>
                               <textarea 
                                 rows={4}
                                 className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:border-slate-900 outline-none resize-none transition-all"
                                 value={selectedOpp.description}
                                 placeholder="Synthesize content..."
                                 onChange={(e) => updateOpportunity(selectedOpp.id, { description: e.target.value })}
                               />
                            </div>
                         </div>

                         <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quadrants</label>
                                  <select 
                                    className="w-full h-10 px-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase"
                                    value={selectedOpp.tag}
                                    onChange={(e) => updateOpportunity(selectedOpp.id, { tag: e.target.value as CEEDTag })}
                                  >
                                    {(['Core', 'Efficiency', 'Expansion', 'Disrupt'] as CEEDTag[]).map(t => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Impact</label>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => updateOpportunity(selectedOpp.id, { paid: true })}
                                      className={cn("flex-1 h-10 rounded-xl border text-[9px] font-black uppercase transition-all", selectedOpp.paid ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-200")}
                                    >Paid</button>
                                    <button 
                                      onClick={() => updateOpportunity(selectedOpp.id, { paid: false })}
                                      className={cn("flex-1 h-10 rounded-xl border text-[9px] font-black uppercase transition-all", !selectedOpp.paid ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200")}
                                    >Draft</button>
                                  </div>
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Execution window</label>
                               <input 
                                 type="text"
                                 className="w-full h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none"
                                 placeholder="e.g. 12 WEEKS"
                                 value={selectedOpp.duration}
                                 onChange={(e) => updateOpportunity(selectedOpp.id, { duration: e.target.value })}
                               />
                            </div>
                         </div>
                      </div>
                   </div>
                )}
              </div>
           )}

           {activeTab === 'summary' && (
              <div className="premium-card p-8 lg:p-12 bg-white border-2 border-slate-100 shadow-xl space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Synthetic Summary</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interviewer Synthesis & Executive Overview</p>
                    </div>
                    <button 
                      onClick={handleSaveSummary}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg"
                    >
                       <Save className="w-4 h-4" /> Save Draft
                    </button>
                 </div>

                 <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                    <textarea 
                      className="relative w-full min-h-[400px] p-8 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-base font-bold text-slate-700 leading-relaxed outline-none focus:border-slate-900 focus:bg-white transition-all shadow-inner"
                      placeholder="Listen to the audio artifact and synthesize the strategic summary here. Focus on the core pain points, market opportunities, and technical feasibility discussed..."
                      value={localSummary}
                      onChange={(e) => setLocalSummary(e.target.value)}
                    />
                 </div>

                 <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border border-blue-200 shrink-0">
                       <Brain className="w-5 h-5 transition-transform hover:scale-110" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-900 uppercase mb-1">Discovery Best Practice</p>
                       <p className="text-[11px] text-blue-700 font-bold uppercase tracking-tight leading-relaxed">
                          Your summary will be the first section stakeholders read. Ensure it captures the "Voice of the Customer" while aligning with the technical CEED deliverables.
                       </p>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'transcript' && (
              <div className="premium-card p-6 lg:p-10 bg-white border-2 border-slate-100 shadow-xl space-y-10 animate-in slide-in-from-bottom-2 duration-300">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Session Record</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Automatic AI Transcription Artifact</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                       <CheckCircle className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                 </div>

                 <div className="space-y-10">
                    {session.transcript?.map((p) => (
                       <div key={p.id} className="group relative pl-32">
                          <div className="absolute left-0 top-0 w-28 text-right pr-6 space-y-1">
                             <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{p.speaker}</p>
                             <p className="text-[9px] font-bold text-slate-400">{formatDuration(p.timestamp)}</p>
                          </div>
                          <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all group-hover:bg-white group-hover:shadow-xl group-hover:border-slate-200 group-hover:-translate-x-1">
                             <p className="text-sm font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{p.text}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>

        {/* 🏢 SIDEBAR: CHECKLIST & AI TOOLS */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Review Progress */}
           <div className="premium-card p-8 bg-slate-900 text-white space-y-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Synthesis Progress</h3>
                <span className="text-xs font-black font-mono">{checklist.filter(v => v).length} / {CHECKLIST.length}</span>
              </div>
              <div className="space-y-4">
                 {CHECKLIST.map((item, i) => (
                   <button
                     key={i}
                     onClick={() => toggleChecklist(i)}
                     className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border",
                        checklist[i] ? "bg-blue-600/10 border-blue-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"
                     )}
                   >
                      <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0", checklist[i] ? "bg-blue-500 border-blue-500" : "border-white/20")}>
                         {checklist[i] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest text-left", checklist[i] ? "text-white" : "text-slate-500")}>{item}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* AI Enhancement */}
           <div className="premium-card p-8 bg-white border-2 border-slate-100 flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
                 <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Generate PRD</h4>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">Draft a technical requirement document based on the current synthesis.</p>
              </div>
              <button className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all">
                 Synthesize PRD
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
