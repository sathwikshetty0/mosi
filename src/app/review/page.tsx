'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, MessageSquare, Clock, ChevronRight,
  CheckCircle2, Download, Trash2,
  BarChart2, CheckCircle, Brain, Sparkles,
  FileText, Headphones, Save, Zap
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
            <h2 className="text-xl font-bold text-slate-900">{session.stakeholder.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDuration(session.duration)} · {session.stakeholder.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={handlePublish} className="h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
            Publish <ChevronRight className="w-4 h-4" />
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
        <div className="lg:col-span-8 space-y-6">
          
          {/* TABS */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            {[
              { id: 'insights' as const, label: 'Insights', icon: Zap },
              { id: 'summary' as const, label: 'Summary', icon: FileText },
              { id: 'transcript' as const, label: 'Transcript', icon: MessageSquare },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['#', 'Insight', 'Tag', 'Context'].map(h => (
                        <th key={h} className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {session.opportunities.map((opp, i) => (
                      <tr key={opp.id} onClick={() => setSelectedId(opp.id)}
                        className={cn('cursor-pointer transition-all hover:bg-slate-50', selectedId === opp.id && 'bg-blue-50/50 border-l-2 border-l-blue-500')}>
                        <td className="px-5 py-4 text-xs text-slate-300 font-mono">{String(i + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900 text-sm">{opp.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatDuration(opp.timestamp)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('text-[10px] font-medium px-2 py-1 rounded-md', tagColors[opp.tag].bg, tagColors[opp.tag].text)}>{opp.tag}</span>
                        </td>
                        <td className="px-5 py-4">
                          {opp.paid && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-medium px-2 py-0.5 rounded">Paid</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* EDITOR */}
              {selectedOpp && (
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                    <div>
                      <h3 className="font-semibold text-slate-900">Edit Insight</h3>
                      <p className="text-xs text-slate-400">Captured at {formatDuration(selectedOpp.timestamp)}</p>
                    </div>
                    <span className={cn('text-[10px] font-medium px-2.5 py-1 rounded-md', tagColors[selectedOpp.tag].bg, tagColors[selectedOpp.tag].text)}>{selectedOpp.tag}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                        <input type="text" className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:border-slate-300 outline-none transition-all" value={selectedOpp.title} onChange={(e) => updateOpportunity(selectedOpp.id, { title: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                        <textarea rows={3} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 focus:border-slate-300 outline-none resize-none transition-all" placeholder="Add details..." value={selectedOpp.description} onChange={(e) => updateOpportunity(selectedOpp.id, { description: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-4 bg-slate-50 p-5 rounded-xl">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-medium text-slate-400 mb-1 block">Tag</label>
                          <select className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs font-medium" value={selectedOpp.tag} onChange={(e) => updateOpportunity(selectedOpp.id, { tag: e.target.value as CEEDTag })}>
                            {(['Core', 'Efficiency', 'Expansion', 'Disrupt'] as CEEDTag[]).map(t => (<option key={t} value={t}>{t}</option>))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-medium text-slate-400 mb-1 block">Revenue</label>
                          <div className="flex gap-1">
                            <button onClick={() => updateOpportunity(selectedOpp.id, { paid: true })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-semibold transition-all", selectedOpp.paid ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-400")}>Paid</button>
                            <button onClick={() => updateOpportunity(selectedOpp.id, { paid: false })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-semibold transition-all", !selectedOpp.paid ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-400")}>Draft</button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-400 mb-1 block">Timeline</label>
                        <input type="text" className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs outline-none" placeholder="e.g. 12 weeks" value={selectedOpp.duration} onChange={(e) => updateOpportunity(selectedOpp.id, { duration: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 lg:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Session Summary</h3>
                  <p className="text-xs text-slate-400">Listen to the audio and write your synthesis.</p>
                </div>
                <button onClick={handleSaveSummary} className="h-9 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-all">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
              <textarea 
                className="w-full min-h-[300px] p-5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed outline-none focus:border-slate-300 transition-all resize-none"
                placeholder="Synthesize key findings, pain points, and strategic opportunities discussed during the session..."
                value={localSummary}
                onChange={(e) => setLocalSummary(e.target.value)}
              />
              <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Tip: Focus on capturing the &quot;Voice of the Customer&quot; while connecting findings to the CEED framework quadrants.
                </p>
              </div>
            </div>
          )}

          {/* TRANSCRIPT TAB */}
          {activeTab === 'transcript' && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Transcript</h3>
                  <p className="text-xs text-slate-400">AI-generated session transcript.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">Verified</span>
                </div>
              </div>
              <div className="space-y-4">
                {session.transcript?.map((p) => (
                  <div key={p.id} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all group">
                    <div className="w-20 shrink-0 text-right">
                      <p className="text-xs font-semibold text-slate-900">{p.speaker}</p>
                      <p className="text-[10px] text-slate-400">{formatDuration(p.timestamp)}</p>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
