'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Play, Pause, FastForward, Rewind, Clock, ChevronRight, ChevronLeft,
  CheckCircle2, Trash2, BarChart2, CheckCircle, Sparkles,
  FileText, Headphones, Save, Zap, Image as ImageIcon, Link as LinkIcon, File as FileIcon,
  X
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration, Opportunity } from '@/lib/store'
import { cn } from '@/lib/utils'

const tagColors: Record<CEEDTag, { bg: string; text: string; border: string }> = {
  Core: { bg: 'bg-blue-50/50', text: 'text-blue-500', border: 'border-blue-100' },
  Efficiency: { bg: 'bg-amber-50/50', text: 'text-amber-500', border: 'border-amber-100' },
  Expansion: { bg: 'bg-emerald-50/50', text: 'text-emerald-500', border: 'border-emerald-100' },
  Disrupt: { bg: 'bg-rose-50/50', text: 'text-rose-500', border: 'border-rose-100' }
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
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('id')
  
  const { sessions, updateOpportunity, deleteSession, updateSessionSummary } = useMosiStore()
  
  const session = React.useMemo(() => {
    if (sessionId) return sessions.find(s => s.id === sessionId)
    return sessions.find(s => s.status === 'Review') || sessions[0]
  }, [sessions, sessionId])

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showChecklistPopup, setShowChecklistPopup] = React.useState(false)
  const [checklist, setChecklist] = React.useState<boolean[]>(CHECKLIST.map(() => false))
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')
  const [isSynthesizing, setIsSynthesizing] = React.useState(false)
  
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [audioProgress, setAudioProgress] = React.useState(0)
  const [currentTimeFormatted, setCurrentTimeFormatted] = React.useState('0:00')

  const selectedOpp = session?.opportunities.find(o => o.id === selectedId)

  const toggleChecklist = (i: number) => {
    setChecklist(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const handleNextClick = () => {
    setShowChecklistPopup(true)
  }

  const handleGoToPreview = () => {
    if (session) {
      if (localSummary !== session.summary) {
        updateSessionSummary(session.id, localSummary)
      }
      setShowChecklistPopup(false)
      router.push(`/preview?id=${session.id}`)
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

  const handleSynthesize = async () => {
    if (!session) return
    setIsSynthesizing(true)
    try {
      let response: Response;
      
      // If the URL is still a local browser blob (Supabase upload pending/failed)...
      if (session.recordingUrl && session.recordingUrl.startsWith('blob:')) {
        const formData = new FormData()
        try {
          const blobResponse = await fetch(session.recordingUrl)
          const audioBlob = await blobResponse.blob()
          formData.append('audioFile', audioBlob, 'recording.webm')
        } catch (e) {
          console.warn('Could not fetch local blob - might be expired.')
        }
        
        formData.append('opportunities', JSON.stringify(session.opportunities))
        formData.append('stakeholder', JSON.stringify(session.stakeholder))
        
        response = await fetch('/api/synthesize', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Normal JSON request using the public Cloud URL
        response = await fetch('/api/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordingUrl: session.recordingUrl,
            opportunities: session.opportunities,
            stakeholder: session.stakeholder,
          }),
        })
      }

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'API Error')
      }

      setLocalSummary(data.summary)
      updateSessionSummary(session.id, data.summary)
      alert('Successfully transcribed and synthesized the interview!')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to synthesize.')
    } finally {
      setIsSynthesizing(false)
    }
  }

  const toggleAudio = (timestamp?: number) => {
    if (audioRef.current) {
      if (timestamp !== undefined) {
        audioRef.current.currentTime = timestamp
        audioRef.current.play()
        setIsPlaying(true)
      } else {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    }
  }

  const skipAudio = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = pos * audioRef.current.duration
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = audioRef.current.duration || 1
      setAudioProgress((current / duration) * 100)
      
      const mins = Math.floor(current / 60)
      const secs = Math.floor(current % 60)
      setCurrentTimeFormatted(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
  }

  React.useEffect(() => {
    if (selectedOpp && audioRef.current) {
      audioRef.current.currentTime = selectedOpp.timestamp
      handleTimeUpdate()
    }
  }, [selectedId, selectedOpp])

  const handleLoadedMetadata = () => {
    if (selectedOpp && audioRef.current) {
      audioRef.current.currentTime = selectedOpp.timestamp
      handleTimeUpdate()
    }
  }

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
        <BarChart2 className="w-7 h-7 text-slate-300" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">No sessions to review</h3>
        <p className="text-sm text-slate-400 mt-1">Start an interview first.</p>
      </div>
      <button onClick={() => router.push('/setup')} className="h-10 px-5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
        Start Interview
      </button>
    </div>
  )

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 max-w-5xl mx-auto px-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Review Phase</span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">{session.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{session.stakeholder?.name || 'Anonymous'}</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" /> {formatDuration(session.duration)} / <span className="text-slate-600">{session.stakeholder?.company || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleDelete} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-red-500 transition-colors py-1.5 px-3 hover:bg-red-50 rounded-lg">
            Delete
          </button>
        </div>
      </div>

      {/* AUDIO SOURCE (HIDDEN) */}
      <audio 
        ref={audioRef}
        src={session.recordingUrl} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-8">
        
        {/* LOGS TABLE - MINIMAL */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Session Catalog</h3>
            <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest">
              {session.opportunities.length} Logs
            </span>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                   {['Index', 'Context', 'Quadrant', 'Commercial', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {session.opportunities.map((opp, i) => (
                  <tr key={opp.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 text-[10px] text-slate-200 font-bold">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 text-sm tracking-tight uppercase">{opp.title}</p>
                      <button 
                        onClick={() => toggleAudio(opp.timestamp)}
                        className="text-[9px] text-slate-400 hover:text-slate-800 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-1"
                      >
                        <Play className="w-3 h-3" /> {formatDuration(opp.timestamp)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border', tagColors[opp.tag].text, tagColors[opp.tag].border, tagColors[opp.tag].bg)}>
                        {opp.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[8px] font-black uppercase tracking-widest", opp.paid ? "text-emerald-500" : "text-slate-300")}>
                        {opp.paid ? 'Revenue' : 'Info'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedId(opp.id)}
                        className="text-[9px] font-black text-slate-300 hover:text-slate-600 transition-all uppercase tracking-widest"
                      >
                        Refine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {session.opportunities.length === 0 && (
              <div className="p-12 text-center text-slate-300 italic text-xs">Waiting for session data.</div>
            )}
          </div>
        </section>

        {/* DIGITAL LOGS SECTION (EVIDENCE) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" /> Digital Logs
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
              {session.evidence.length} Assets
            </span>
          </div>
          
          {session.evidence.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {session.evidence.map((ev, i) => (
                <div key={i} className="group relative aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:border-slate-300 transition-all">
                  {ev.type === 'image' ? (
                    <img src={ev.url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : ev.type === 'video' ? (
                    <video src={ev.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      {ev.type === 'link' ? <LinkIcon className="w-8 h-8 text-slate-300" /> : <FileIcon className="w-8 h-8 text-slate-300" />}
                      <p className="text-xs font-bold text-slate-400 truncate px-4 w-full text-center">{ev.title || 'Attached Link'}</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-slate-700/90 backdrop-blur-md p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[10px] text-white font-black uppercase tracking-widest truncate">{ev.title || ev.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-400">No digital assets captured.</p>
            </div>
          )}
        </section>

        {/* SUMMARY SECTION - CLEAN */}
        <section className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6 relative overflow-hidden">
           <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session Synthesis</h3>
              <p className="text-[9px] text-slate-300 font-bold uppercase">Consolidated Insights</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSynthesize} 
                disabled={isSynthesizing}
                className={cn("h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-lg",
                  isSynthesizing ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" : "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                )}
              >
                <Sparkles className={cn("w-3.5 h-3.5", isSynthesizing && "animate-pulse")} /> 
                {isSynthesizing ? "Synthesizing..." : "Generate AI Synthesis"}
              </button>
            </div>
          </div>
          <textarea 
            className="w-full min-h-[250px] p-8 bg-white border border-slate-100 rounded-2xl text-base text-slate-700 leading-relaxed outline-none focus:border-slate-300 transition-all resize-none shadow-sm"
            placeholder="Review and finalize the session synthesis here..."
            value={localSummary}
            onChange={(e) => setLocalSummary(e.target.value)}
          />
        </section>

      </div>

      {/* FIXED NEXT STEP BAR AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-40 flex justify-center">
        <button 
          onClick={handleNextClick} 
          className="w-full max-w-sm h-14 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          Complete & Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* LOG EDIT POPUP */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-700/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-700 uppercase tracking-tight text-lg">Edit {selectedOpp.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reviewing Logic & Data</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Audio Controls */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100 text-blue-500">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-600">
                      Timestamp: {formatDuration(selectedOpp.timestamp)} 
                      {session.recordingUrl && <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{currentTimeFormatted}</span>}
                    </p>
                    {session.recordingUrl && (
                      <div className="flex gap-2">
                        <button onClick={() => skipAudio(-10)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"><Rewind className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleAudio()} className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-md">{isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}</button>
                        <button onClick={() => skipAudio(10)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"><FastForward className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  {!session.recordingUrl && <p className="text-[10px] text-slate-400 italic">No audio recorded for this session.</p>}
                  {session.recordingUrl && (
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full cursor-pointer relative group" onClick={handleSeek}>
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-linear" style={{ width: `${audioProgress}%` }} />
                      {/* Hover Seek UI */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Data Fields */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Log Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Title</label>
                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" value={selectedOpp.title || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Implementation Timeline</label>
                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" placeholder="e.g. Q3 2024" value={selectedOpp.duration || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { duration: e.target.value })} />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Advanced Notes (Log Summary)</label>
                    <textarea rows={3} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none resize-none" value={selectedOpp.description || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { description: e.target.value })} />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Skillset Required</label>
                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" placeholder="e.g. React, UX Design" value={selectedOpp.skills || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { skills: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Toolset Required</label>
                    <input type="text" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" placeholder="e.g. Figma, Supabase" value={selectedOpp.toolset || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { toolset: e.target.value })} />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Commercial Status</label>
                      <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <button onClick={() => updateOpportunity(selectedOpp.id, { paid: true })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.paid ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Paid</button>
                        <button onClick={() => updateOpportunity(selectedOpp.id, { paid: false })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", !selectedOpp.paid ? "bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Unpaid</button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Engagement Type</label>
                      <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Gig' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Gig' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Gig</button>
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Internship' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Internship' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Intern</button>
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Full-time' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Full-time' ? "bg-slate-700 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Full-time</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setSelectedId(null)} className="h-12 px-8 bg-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST POPUP */}
      {showChecklistPopup && (
        <div className="fixed inset-0 bg-slate-700/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-8 relative">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 tracking-tight">Post-Interview Checklist</h3>
              <p className="text-sm font-medium text-slate-400">Please confirm these steps before proceeding to Stakeholder Preview.</p>
            </div>
            
            <div className="space-y-3">
              {CHECKLIST.map((item, i) => (
                <button key={i} onClick={() => toggleChecklist(i)}
                  className={cn("w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left border",
                    checklist[i] ? "bg-emerald-50 border-emerald-100" : "hover:bg-slate-50 border-slate-100"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors",
                    checklist[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                  )}>
                    {checklist[i] && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn("text-xs font-bold uppercase tracking-widest", checklist[i] ? "text-emerald-700" : "text-slate-500")}>{item}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowChecklistPopup(false)} 
                className="h-12 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Go Back
              </button>
              <button 
                onClick={handleGoToPreview}
                className="h-12 bg-slate-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Proceed <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
