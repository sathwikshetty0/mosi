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
  'Stakeholder profile reviewed',
  'Company context verified',
  'Market insights assessed',
  'Core opportunities confirmed',
  'Efficiency gains noted',
  'Expansion potential explored',
  'Disruptive ideas captured'
]

function ReviewContent() {
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

  const handleSynthesize = async () => {
    if (!session) return
    setIsSynthesizing(true)
    try {
      let response: Response;
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
        response = await fetch('/api/synthesize', { method: 'POST', body: formData })
      } else {
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
      if (!response.ok) throw new Error(data.error || 'API Error')
      setLocalSummary(data.summary)
      updateSessionSummary(session.id, data.summary)
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
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play(); setIsPlaying(true); }
      }
    }
  }

  const skipAudio = (seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime += seconds
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
  }, [selectedId])

  const inputClass = "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-800 outline-none transition-all text-sm font-bold placeholder:text-slate-300"
  const labelClass = "block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest"

  if (!session) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
        <BarChart2 className="w-7 h-7 text-slate-300" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-700">No sessions to review</h3>
        <p className="text-sm text-slate-400 mt-1">Start an interview first.</p>
      </div>
      <button onClick={() => router.push('/setup')} className="h-10 px-5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
        Start Interview
      </button>
    </div>
  )

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 max-w-5xl mx-auto px-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 mt-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Reviewing Session</span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">{session.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{session.stakeholder?.name || 'Anonymous'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4" /> {formatDuration(session.duration)} / <span className="text-slate-600 font-bold">{session.stakeholder?.company || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleDelete} className="text-xs font-bold text-slate-300 hover:text-red-500 transition-colors py-1.5 px-3 hover:bg-red-50 rounded-lg">
            Delete Session
          </button>
        </div>
      </div>

      <audio ref={audioRef} src={session.recordingUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onTimeUpdate={handleTimeUpdate} className="hidden" />

      <div className="grid grid-cols-1 gap-10">
        
        {/* LOGS TABLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Interview Highlights</h3>
            <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              {session.opportunities.length} Points
            </span>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                   {['#', 'Highlight Detail', 'Quadrant', 'Type', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {session.opportunities.map((opp, i) => (
                  <tr key={opp.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 text-xs text-slate-300 font-bold">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 text-sm tracking-tight">{opp.title}</p>
                      <button onClick={() => toggleAudio(opp.timestamp)} className="text-[10px] text-slate-400 hover:text-slate-800 font-bold flex items-center gap-1.5 mt-1">
                        <Play className="w-3.5 h-3.5 fill-current" /> {formatDuration(opp.timestamp)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border', tagColors[opp.tag].text, tagColors[opp.tag].border, tagColors[opp.tag].bg)}>
                        {opp.tag}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", opp.paid ? "text-emerald-500" : "text-slate-300")}>
                        {opp.paid ? 'Commercial' : 'Insight'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedId(opp.id)} className="h-8 px-4 bg-slate-50 text-slate-600 border border-slate-100 font-bold text-[10px] uppercase rounded-lg hover:bg-slate-100 transition-all">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {session.opportunities.length === 0 && (
              <div className="p-16 text-center text-slate-400 font-medium text-sm">No highlights captured.</div>
            )}
          </div>
        </section>

        {/* EVIDENCE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Evidence & Assets</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{session.evidence.length} Items</span>
          </div>
          {session.evidence.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {session.evidence.map((ev, i) => (
                <div key={i} className="group relative aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                  {ev.type === 'image' ? (
                    <img src={ev.url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : ev.type === 'video' ? (
                    <video src={ev.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      {ev.type === 'link' ? <LinkIcon className="w-8 h-8 text-slate-300" /> : <FileIcon className="w-8 h-8 text-slate-300" />}
                      <p className="text-xs font-bold text-slate-400 truncate px-4 w-full text-center">{ev.title || 'Attached Asset'}</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-3 transform translate-y-full group-hover:translate-y-0 transition-transform border-t border-slate-100">
                    <p className="text-[10px] text-slate-800 font-bold uppercase tracking-widest truncate">{ev.title || ev.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-sm font-medium text-slate-400 italic">No external context captured.</p>
            </div>
          )}
        </section>

        {/* SUMMARY */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Executive Summary</h3>
              <p className="text-xs text-slate-400 font-medium italic">Refine the consolidated interview synthesis.</p>
            </div>
            <button onClick={handleSynthesize} disabled={isSynthesizing} className={cn("h-10 px-6 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-sm", isSynthesizing ? "bg-slate-50 text-slate-300 border-slate-100" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>
              <Sparkles className={cn("w-4 h-4", isSynthesizing ? "text-slate-300 animate-pulse" : "text-blue-500")} /> 
              {isSynthesizing ? "Synthesizing..." : "AI Refine"}
            </button>
          </div>
          <textarea className="w-full min-h-[300px] p-8 bg-slate-50 border border-slate-100 rounded-2xl text-base text-slate-700 leading-relaxed outline-none focus:bg-white focus:border-slate-300 transition-all resize-none font-medium" placeholder="Review and finalize the session summary here..." value={localSummary} onChange={(e) => setLocalSummary(e.target.value)} />
        </section>

      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-40 flex justify-center">
        <button onClick={handleNextClick} className="w-full max-w-sm h-14 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
          Publish Final Report <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* EDIT MODAL */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-xl tracking-tight">Edit Highlight</h3>
                <p className="text-xs text-slate-400 font-medium">Refine captured point details.</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 font-medium">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100 text-slate-400">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        {formatDuration(selectedOpp.timestamp)} 
                        {session.recordingUrl && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{currentTimeFormatted}</span>}
                      </p>
                    </div>
                    {session.recordingUrl && (
                      <div className="flex gap-2">
                        <button onClick={() => skipAudio(-5)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 transition-all"><Rewind className="w-4 h-4" /></button>
                        <button onClick={() => toggleAudio()} className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-md">{isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}</button>
                        <button onClick={() => skipAudio(5)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 transition-all"><FastForward className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  {session.recordingUrl && (
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full cursor-pointer relative" onClick={handleSeek}>
                      <div className="h-full bg-slate-700 rounded-full transition-all duration-100 ease-linear" style={{ width: `${audioProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className={labelClass}>Point Title</label><input type="text" className={inputClass} value={selectedOpp.title || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { title: e.target.value })} /></div>
                <div><label className={labelClass}>Timeline / ETA</label><input type="text" className={inputClass} placeholder="e.g. Next Quarter" value={selectedOpp.duration || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { duration: e.target.value })} /></div>
                <div><label className={labelClass}>Skills Required</label><input type="text" className={inputClass} placeholder="e.g. Figma, React" value={selectedOpp.skills || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { skills: e.target.value })} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Context & Notes</label><textarea rows={4} className={cn(inputClass, "h-auto py-4 font-medium")} value={selectedOpp.description || ''} onChange={(e) => updateOpportunity(selectedOpp.id, { description: e.target.value })} /></div>
                
                <div>
                  <label className={labelClass}>Point Type</label>
                  <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <button onClick={() => updateOpportunity(selectedOpp.id, { paid: true })} className={cn("flex-1 h-9 rounded-lg text-xs font-bold transition-all", selectedOpp.paid ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" : "text-slate-400")}>Commercial</button>
                    <button onClick={() => updateOpportunity(selectedOpp.id, { paid: false })} className={cn("flex-1 h-9 rounded-lg text-xs font-bold transition-all", !selectedOpp.paid ? "bg-white text-slate-600 shadow-sm border border-slate-200" : "text-slate-400")}>General</button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Engagement</label>
                  <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    {['Gig', 'Internship', 'Full-time'].map(t => (
                      <button key={t} onClick={() => updateOpportunity(selectedOpp.id, { engagementType: t as any })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-bold transition-all", selectedOpp.engagementType === t ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "text-slate-400")}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedId(null)} className="h-12 px-12 bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-sm">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST MODAL */}
      {showChecklistPopup && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-10 border border-slate-100">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-blue-100"><CheckCircle2 className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Finalizing Review</h3>
              <p className="text-sm font-medium text-slate-400">Ensure all interview highlights are correct.</p>
            </div>
            
            <div className="space-y-3">
              {CHECKLIST.map((item, i) => (
                <button key={i} onClick={() => toggleChecklist(i)} className={cn("w-full flex items-center gap-4 p-5 rounded-2xl transition-all text-left border", checklist[i] ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 hover:border-slate-200")}>
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all", checklist[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200")}>{checklist[i] && <CheckCircle className="w-4 h-4" />}</div>
                  <span className={cn("text-xs font-bold", checklist[i] ? "text-emerald-700" : "text-slate-500")}>{item}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleGoToPreview} className="h-14 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                Generate Report <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setShowChecklistPopup(false)} className="h-12 text-slate-400 font-bold text-xs hover:text-slate-600 transition-all uppercase tracking-widest text-center">Wait, one more thing</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function ReviewPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin" /></div>}>
      <ReviewContent />
    </React.Suspense>
  )
}
