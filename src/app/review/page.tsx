'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, MessageSquare, Clock, ChevronRight,
  CheckCircle2, Download, Trash2,
  BarChart2, CheckCircle, Brain, Sparkles,
  FileText, Headphones, Save, Zap,
  Image as ImageIcon, Link as LinkIcon, File as FileIcon
} from 'lucide-react'
import { useMosiStore, CEEDTag, Opportunity, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, { bg: string; text: string }> = {
  Core: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Efficiency: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Expansion: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Disrupt: { bg: 'bg-rose-50', text: 'text-rose-600' }
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
  
  const session = sessions.find(s => s.status === 'Review') || sessions[0]

  const [selectedId, setSelectedId] = React.useState<string>(session?.opportunities[0]?.id || '')
  const [checklist, setChecklist] = React.useState<boolean[]>(CHECKLIST.map(() => false))
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')

  const selectedOpp = session?.opportunities.find(o => o.id === selectedId)

  const toggleChecklist = (i: number) => {
    setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const handleGoToPreview = () => {
    if (session) {
      if (localSummary !== session.summary) {
        updateSessionSummary(session.id, localSummary)
      }
      router.push('/preview')
    }
  }

  const handleDelete = () => {
    if (session && confirm('Delete this interview?')) {
      deleteSession(session.id)
      router.push('/')
    }
  }

  const handleSaveSummary = () => {
    if (session) updateSessionSummary(session.id, localSummary)
  }

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
        <BarChart2 className="w-7 h-7 text-slate-300" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">No sessions to review</h3>
        <p className="text-sm text-slate-400 mt-1">Start an interview first.</p>
      </div>
      <button onClick={() => router.push('/setup')} className="h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
        Start Interview
      </button>
    </div>
  )

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-amber-50 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">In Review</span>
              <span className="text-xs text-slate-400">{session.date}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{session.stakeholder?.name || 'Untitled Participant'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDuration(session.duration)} · {session.stakeholder?.company || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={handleGoToPreview} className="h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
            Stakeholder Preview <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AUDIO PLAYER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
          <Headphones className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 mb-1">Audio Recording</p>
          {session.recordingUrl ? (
            <audio src={session.recordingUrl} controls className="w-full h-8" />
          ) : (
            <p className="text-xs text-slate-300 italic">Recording not available in local preview.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* INSIGHTS SECTION */}
          <section className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Strategic Insights
              </h3>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['#', 'Insight', 'Tag', 'Context'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {session.opportunities.map((opp, i) => (
                    <tr key={opp.id} onClick={() => setSelectedId(opp.id)}
                      className={cn('cursor-pointer transition-all hover:bg-slate-50', selectedId === opp.id && 'bg-blue-50/50 border-l-4 border-l-blue-600')}>
                      <td className="px-5 py-4 text-xs text-slate-300 font-mono font-bold">{String(i + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{opp.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDuration(opp.timestamp)} mark</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg', tagColors[opp.tag].bg, tagColors[opp.tag].text)}>{opp.tag}</span>
                      </td>
                      <td className="px-5 py-4">
                        {opp.paid && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Paid</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {session.opportunities.length === 0 && (
                <div className="p-12 text-center text-slate-300 italic text-sm">No insights logged during session.</div>
              )}
            </div>

            {/* EDITOR */}
            {selectedOpp && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase tracking-tight text-sm">Refine Insight</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Captured at {formatDuration(selectedOpp.timestamp)}</p>
                  </div>
                  <span className={cn('text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl', tagColors[selectedOpp.tag].bg, tagColors[selectedOpp.tag].text)}>{selectedOpp.tag}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Entry Title</label>
                      <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-slate-300 outline-none transition-all uppercase tracking-tight" value={selectedOpp.title} onChange={(e) => updateOpportunity(selectedOpp.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Description / Details</label>
                      <textarea rows={4} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 font-medium leading-relaxed focus:border-slate-300 outline-none resize-none transition-all" placeholder="Enter deep context..." value={selectedOpp.description} onChange={(e) => updateOpportunity(selectedOpp.id, { description: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Quadrant</label>
                        <select className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest" value={selectedOpp.tag} onChange={(e) => updateOpportunity(selectedOpp.id, { tag: e.target.value as CEEDTag })}>
                          {(['Core', 'Efficiency', 'Expansion', 'Disrupt'] as CEEDTag[]).map(t => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Commercial Status</label>
                        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl">
                          <button onClick={() => updateOpportunity(selectedOpp.id, { paid: true })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.paid ? "bg-emerald-500 text-white shadow-lg" : "text-slate-300 hover:text-slate-600")}>Paid</button>
                          <button onClick={() => updateOpportunity(selectedOpp.id, { paid: false })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", !selectedOpp.paid ? "bg-slate-900 text-white shadow-lg" : "text-slate-300 hover:text-slate-600")}>Draft</button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Implementation Timeline</label>
                      <input type="text" className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none uppercase tracking-tight" placeholder="e.g. Q3 2024 / 6 Months" value={selectedOpp.duration} onChange={(e) => updateOpportunity(selectedOpp.id, { duration: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SUMMARY SECTION */}
          <section className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-10 space-y-6 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Executive Synthesis
                </h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1">Review audio archive and finalize summary</p>
              </div>
              <button onClick={handleSaveSummary} className="h-11 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <Save className="w-4 h-4" /> Save Analysis
              </button>
            </div>
            <textarea 
              className="w-full min-h-[350px] p-8 bg-slate-50 border border-slate-100 rounded-3xl text-sm text-slate-700 leading-relaxed outline-none focus:border-slate-300 transition-all resize-none font-medium shadow-inner"
              placeholder="Synthesize key findings into a high-level executive summary..."
              value={localSummary}
              onChange={(e) => setLocalSummary(e.target.value)}
            />
          </section>

          {/* EVIDENCE GALLERY */}
          <section className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Evidence Library
              </h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                {session.evidence.length} Assets Captured
              </span>
            </div>
            {session.evidence.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {session.evidence.map((ev, i) => (
                  <div key={i} className="group relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-300 transition-all">
                    {ev.type === 'image' ? (
                      <img src={ev.url} alt={ev.title} className="w-full h-full object-cover" />
                    ) : ev.type === 'video' ? (
                      <video src={ev.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        {ev.type === 'link' ? <LinkIcon className="w-6 h-6 text-slate-300" /> : <FileIcon className="w-6 h-6 text-slate-300" />}
                        <p className="text-[10px] font-bold text-slate-400 truncate px-4">{ev.title || 'Attached Link'}</p>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[8px] text-white font-black uppercase tracking-widest truncate">{ev.title || ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 italic">No media assets captured during this session.</p>
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CHECKLIST */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Review Checklist</h3>
              <span className="text-xs font-medium text-slate-400">{checklist.filter(v => v).length}/{CHECKLIST.length}</span>
            </div>
            <div className="space-y-2">
              {CHECKLIST.map((item, i) => (
                <button key={i} onClick={() => toggleChecklist(i)}
                  className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                    checklist[i] ? "bg-emerald-50" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0",
                    checklist[i] ? "bg-emerald-500 border-emerald-500" : "border-slate-200"
                  )}>
                    {checklist[i] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={cn("text-xs", checklist[i] ? "text-emerald-700 font-medium" : "text-slate-500")}>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI PRD */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Generate PRD</h4>
              <p className="text-xs text-slate-400 mt-1">Create a technical requirements document from this session.</p>
            </div>
            <button className="w-full h-10 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
