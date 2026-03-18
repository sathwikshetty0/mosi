'use client'

import * as React from 'react'
import {
  FileCheck, FileText, Download, Sparkles, Check, X,
  ArrowRight, TrendingUp, Brain, ShieldCheck, Globe,
  Clock, Building2, BarChart2, MessageSquare, Eye, EyeOff, MessageCircle,
  Users, Image as ImageIcon, Link as LinkIcon, File as FileIcon,
  Headphones, Play, Pause
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn, exportToCSV } from '@/lib/utils'

const tagColors: Record<CEEDTag, string> = {
  Core: 'bg-blue-50 text-blue-600',
  Efficiency: 'bg-amber-50 text-amber-600',
  Expansion: 'bg-emerald-50 text-emerald-600',
  Disrupt: 'bg-rose-50 text-rose-600'
}

export default function PreviewPage() {
  const { sessions, publishSession, updateOpportunityStatus, updateTranscriptStatus } = useMosiStore()
  const session = sessions.find(s => s.status === 'Review' || s.status === 'Published') || sessions[0]
  const router = useRouter()
  const [approved, setApproved] = React.useState(session?.status === 'Published')
  const [activeTab, setActiveTab] = React.useState<'summary' | 'opportunities' | 'evidence'>('summary')

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

  const handleApprove = () => {
    if (session) { publishSession(session.id); setApproved(true) }
  }

  const handleExportCSV = () => {
    const data = (session.opportunities || []).map(o => ({
      Title: o.title, Tag: o.tag, Paid: o.paid ? 'Yes' : 'No',
      Duration: o.duration, Skills: o.skills, Description: o.description,
      Timestamp: formatDuration(o.timestamp), Status: o.status
    }))
    exportToCSV(data, `MOSI_${session?.stakeholder?.company || 'Export'}.csv`)
  }

  const stakeholder = session?.stakeholder
  const opportunities = session?.opportunities || []
  const date = session?.date
  const duration = session?.duration || 0
  const transcript = session?.transcript

  const handleStatusUpdate = (id: string, type: 'opp' | 'para', status: 'Approved' | 'Hidden' | 'Pending') => {
    if (type === 'opp') updateOpportunityStatus(session.id, id, status)
    else updateTranscriptStatus(session.id, id, status)
  }

  const handleCommentUpdate = (id: string, type: 'opp' | 'para') => {
    const comment = prompt("Add a comment:")
    if (comment === null) return
    if (type === 'opp') {
      const opp = opportunities.find(o => o.id === id)
      updateOpportunityStatus(session.id, id, opp?.status || 'Pending', comment)
    } else {
      const para = transcript?.find(p => p.id === id)
      updateTranscriptStatus(session.id, id, para?.status || 'Pending', comment)
    }
  }

  const problemStatement = (opportunities.length > 0 && stakeholder)
    ? `${stakeholder.company} faces ${opportunities.length} primary challenges around ${opportunities[0].tag} improvements.`
    : "No pain points identified."
  const opportunityStatement = (opportunities.length > 0 && stakeholder)
    ? `Top priority: "${opportunities[0].title}" — a strategic window for ${stakeholder.sector} optimization.`
    : "Complete the review phase to generate insights."

  const timelineHighlights = opportunities.slice(0, 3).map(o => ({
    time: formatDuration(o.timestamp), event: o.title
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">Stakeholder Preview</span>
              <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-md", approved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                {approved ? '✓ Published' : 'Review Required'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {stakeholder?.name || 'Untitled Participant'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{stakeholder?.company || 'N/A'}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{date} · {formatDuration(duration)}</span>
              <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5" />{opportunities.length} Insights</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 lg:w-52">
            {!approved ? (
              <button onClick={handleApprove} className="h-10 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Approve
              </button>
            ) : (
              <div className="h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold">
                <Check className="w-4 h-4" /> Approved
              </div>
            )}
            <button onClick={handleExportCSV} className="h-9 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all">
              Export CSV
            </button>
          </div>
        </div>

        {/* AUDIO PLAYER - STAKEHOLDER VERSION */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Session Recording</p>
            {session.recordingUrl ? (
              <audio src={session.recordingUrl} controls className="w-full h-8" />
            ) : (
              <p className="text-xs text-slate-400 italic font-medium">Recording is being processed for cloud playback.</p>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
        {[
          { id: 'summary', label: 'Analysis', icon: Brain },
          { id: 'opportunities', label: 'Insights', icon: TrendingUp },
          { id: 'evidence', label: 'Evidence', icon: ImageIcon },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={cn("flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              activeTab === tab.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAIN */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                  <div className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">Enhanced</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-slate-50 space-y-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Problem Statement</p>
                    <p className="text-sm text-slate-700 leading-relaxed italic">"{problemStatement}"</p>
                  </div>
                  <div className="p-5 rounded-xl bg-blue-50 space-y-2">
                    <p className="text-[10px] font-semibold text-blue-600 uppercase">Opportunity</p>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">"{opportunityStatement}"</p>
                  </div>
                </div>
                {timelineHighlights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase">Key Moments</h4>
                    {timelineHighlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100">
                        <span className="bg-slate-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shrink-0">{h.time}</span>
                        <p className="text-sm text-slate-600">{h.event}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {opportunities.map((opp) => (
                <div key={opp.id} className={cn("bg-white border rounded-2xl p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shadow-sm transition-all",
                  opp.status === 'Approved' ? "border-emerald-100 bg-emerald-50/20" : 
                  opp.status === 'Hidden' ? "opacity-40" : "border-slate-100"
                )}>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-md', tagColors[opp.tag])}>{opp.tag}</span>
                      <span className="text-[10px] text-slate-400">{formatDuration(opp.timestamp)}</span>
                      {opp.status === 'Approved' && <span className="bg-emerald-500 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">Verified</span>}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">{opp.title}</h4>
                    <p className="text-xs text-slate-400">Duration: {opp.duration || 'N/A'} · Skills: {opp.skills || 'N/A'}</p>
                    {opp.comment && (
                      <div className="mt-2 p-3 rounded-lg bg-amber-50 flex items-start gap-2">
                        <MessageCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 italic">"{opp.comment}"</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCommentUpdate(opp.id, 'opp')} className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 transition-all"><MessageSquare className="w-4 h-4" /></button>
                    {opp.status !== 'Approved' && (
                      <button onClick={() => handleStatusUpdate(opp.id, 'opp', 'Approved')} className="h-9 px-3 rounded-lg border border-slate-200 text-emerald-600 text-xs font-semibold hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">Verify</button>
                    )}
                    <button onClick={() => handleStatusUpdate(opp.id, 'opp', opp.status === 'Hidden' ? 'Pending' : 'Hidden')} className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 transition-all">
                      {opp.status === 'Hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'evidence' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Evidence Library</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                  {session.evidence.length} Assets
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
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm p-2 transform translate-y-full group-hover:translate-y-0 transition-transform text-center">
                        <p className="text-[8px] text-white font-black uppercase tracking-widest truncate">{ev.title || ev.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400 italic">No media assets available for this session.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Stakeholder Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Contact', val: stakeholder?.name, icon: Users },
                { label: 'Role', val: stakeholder?.role, icon: ShieldCheck },
                { label: 'Company', val: stakeholder?.company, icon: Building2 },
                { label: 'Sector', val: stakeholder?.sector, icon: Globe },
                { label: 'Team Size', val: stakeholder?.employees, icon: BarChart2 },
              ].filter(r => r.val).map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <row.icon className="w-4 h-4 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">{row.label}</p>
                    <p className="text-sm font-medium text-slate-900">{row.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Verification Guide</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              As a stakeholder, you can verify insights, hide sensitive paragraphs, or add clarifying comments using the controls on each item.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
