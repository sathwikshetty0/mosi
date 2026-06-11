'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Play, Pause, FastForward, Rewind, Clock, ChevronRight, ChevronLeft,
  CheckCircle2, Trash2, BarChart2, CheckCircle, Sparkles,
  FileText, Headphones, Save, Zap, Image as ImageIcon, Link as LinkIcon, File as FileIcon,
  X, User, Building2, ChevronDown
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
  
  const { sessions, updateOpportunity, deleteSession, updateSessionSummary, updateSessionStakeholder, updateSessionTranscript } = useMosiStore()
  
  const session = React.useMemo(() => {
    let sess = sessionId ? sessions.find(s => s.id === sessionId) : (sessions.find(s => s.status === 'Review') || sessions[0])
    if (sess) {
      // Ensure opportunities are sorted chronologically
      return {
        ...sess,
        opportunities: [...sess.opportunities].sort((a, b) => a.timestamp - b.timestamp)
      }
    }
    return null
  }, [sessions, sessionId])

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showChecklistPopup, setShowChecklistPopup] = React.useState(false)
  const [checklist, setChecklist] = React.useState<boolean[]>(CHECKLIST.map(() => false))
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')
  const [localTranscript, setLocalTranscript] = React.useState(session?.transcriptText || '')
  const [isSynthesizing, setIsSynthesizing] = React.useState(false)
  const [showStakeholderEdit, setShowStakeholderEdit] = React.useState(false)
  const [stakeholderForm, setStakeholderForm] = React.useState({
    name: session?.stakeholder?.name || '',
    role: session?.stakeholder?.role || '',
    phone: session?.stakeholder?.phone || '',
    email: session?.stakeholder?.email || '',
    company: session?.stakeholder?.company || '',
    sector: session?.stakeholder?.sector || '',
    linkedin: session?.stakeholder?.linkedin || '',
    employees: session?.stakeholder?.employees || '',
    revenue: session?.stakeholder?.revenue || '',
    geography: session?.stakeholder?.geography || '',
  })

  // Auto-open stakeholder edit if it's a quick session with missing details
  React.useEffect(() => {
    if (session && (!session.stakeholder?.name || !session.stakeholder?.company)) {
      setShowStakeholderEdit(true)
    }
  }, [session])

  // Keep stakeholder form in sync when session changes
  React.useEffect(() => {
    if (session?.stakeholder) {
      setStakeholderForm({
        name: session.stakeholder.name || '',
        role: session.stakeholder.role || '',
        phone: session.stakeholder.phone || '',
        email: session.stakeholder.email || '',
        company: session.stakeholder.company || '',
        sector: session.stakeholder.sector || '',
        linkedin: session.stakeholder.linkedin || '',
        employees: session.stakeholder.employees || '',
        revenue: session.stakeholder.revenue || '',
        geography: session.stakeholder.geography || '',
      })
    }
  }, [session?.id])

  const handleSaveStakeholder = () => {
    if (session) {
      updateSessionStakeholder(session.id, stakeholderForm)
      setShowStakeholderEdit(false)
    }
  }
  
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [audioProgress, setAudioProgress] = React.useState(0)
  const [currentTimeFormatted, setCurrentTimeFormatted] = React.useState('0:00')
  const [audioError, setAudioError] = React.useState(false)

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
      
      // Set transcript (word-for-word from ElevenLabs)
      if (data.transcript) {
        setLocalTranscript(data.transcript)
        updateSessionTranscript(session.id, data.transcript)
      }
      // Set summary (structured from NVIDIA Nemotron)
      if (data.summary) {
        setLocalSummary(data.summary)
        updateSessionSummary(session.id, data.summary)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to synthesize.')
    } finally {
      setIsSynthesizing(false)
    }
  }

  const toggleAudio = async (timestamp?: number) => {
    if (audioRef.current) {
      try {
        if (timestamp !== undefined) {
          audioRef.current.currentTime = timestamp
          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
             playPromise.catch(() => { /* handle abort silently */ })
          }
          setIsPlaying(true)
        } else {
          if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
          } else {
            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
               await playPromise.catch(() => {})
            }
            setIsPlaying(true)
          }
        }
      } catch (e) {
        console.warn('Audio playback interrupted or unavailable.')
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
    <div className="space-y-6 sm:space-y-8 pb-32 animate-in fade-in duration-700 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100 mt-4 sm:mt-6">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
            <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Reviewing</span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-widest">{session.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate">{session.stakeholder?.name || 'Anonymous'}</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {formatDuration(session.duration)} / <span className="text-slate-600 font-bold truncate">{session.stakeholder?.company || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleDelete} className="text-xs font-bold text-slate-300 hover:text-red-500 transition-colors py-1.5 px-3 hover:bg-red-50 rounded-lg">
            Delete Session
          </button>
        </div>
      </div>

      {/* STAKEHOLDER DETAILS — Editable Section */}
      <section className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <button 
          onClick={() => setShowStakeholderEdit(!showStakeholderEdit)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              (!session.stakeholder?.name || !session.stakeholder?.company) 
                ? "bg-amber-50 border-amber-200 text-amber-500" 
                : "bg-slate-50 border-slate-100 text-slate-400"
            )}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-700">
                {session.stakeholder?.name || <span className="text-amber-500 italic">Add Stakeholder Details</span>}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {session.stakeholder?.role ? `${session.stakeholder.role} · ` : ''}{session.stakeholder?.company || 'Company not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(!session.stakeholder?.name || !session.stakeholder?.company) && (
              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-widest">Incomplete</span>
            )}
            <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", showStakeholderEdit && "rotate-180")} />
          </div>
        </button>

        {showStakeholderEdit && (
          <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stakeholder Name</label>
                <input className={inputClass} placeholder="e.g. Jane Doe" value={stakeholderForm.name} onChange={e => setStakeholderForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Role / Title</label>
                <input className={inputClass} placeholder="e.g. Product Lead" value={stakeholderForm.role} onChange={e => setStakeholderForm(f => ({ ...f, role: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <input className={inputClass} placeholder="e.g. Acme Corp" value={stakeholderForm.company} onChange={e => setStakeholderForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Sector</label>
                <input className={inputClass} placeholder="e.g. Fintech" value={stakeholderForm.sector} onChange={e => setStakeholderForm(f => ({ ...f, sector: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} type="email" placeholder="e.g. jane@company.com" value={stakeholderForm.email} onChange={e => setStakeholderForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} type="tel" placeholder="e.g. +1 555-0000" value={stakeholderForm.phone} onChange={e => setStakeholderForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input className={inputClass} placeholder="e.g. linkedin.com/in/janedoe" value={stakeholderForm.linkedin} onChange={e => setStakeholderForm(f => ({ ...f, linkedin: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Employees</label>
                <input className={inputClass} placeholder="e.g. 50-200" value={stakeholderForm.employees} onChange={e => setStakeholderForm(f => ({ ...f, employees: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveStakeholder} 
                className="h-10 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                <Save className="w-3.5 h-3.5" /> Save Details
              </button>
            </div>
          </div>
        )}
      </section>

      <audio 
        ref={audioRef} 
        src={session.recordingUrl || undefined} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)} 
        onTimeUpdate={handleTimeUpdate} 
        onError={() => { if (session.recordingUrl) setAudioError(true) }}
        onCanPlay={() => setAudioError(false)}
        preload="auto"
        className="hidden" 
      />

      {/* AUDIO UNAVAILABLE WARNING */}
      {audioError && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Headphones className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-800">Audio not available</p>
            <p className="text-xs text-amber-600">
              {session.recordingUrl?.startsWith('blob:')
                ? 'The local recording has expired. It will be available once cloud sync completes — try refreshing in a moment.'
                : 'Could not load the audio file. The recording may still be uploading.'}
            </p>
          </div>
        </div>
      )}

      {/* 🟢 COMPACT LIGHT-THEME AUDIO PLAYER */}
      <section className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-7 text-slate-800 shadow-md shadow-slate-200/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity text-slate-900">
          <Headphones className="w-32 h-32 -mr-8 -mt-8" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100/50">
                    <Headphones className="w-5 h-5 text-blue-500" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 line-clamp-1">{session.stakeholder?.name || 'Unspecified Stakeholder'}</h3>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest leading-none mt-0.5">Interview Audio • {session.recordingUrl?.startsWith('blob') ? 'Local' : 'Synchronized'}</p>
                 </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black font-mono text-slate-800 tracking-tighter">{currentTimeFormatted}</span>
                <span className="text-xs font-bold text-slate-200 mx-1.5">/</span>
                <span className="text-xs font-black font-mono text-slate-400">{formatDuration(session.duration)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full cursor-pointer relative group/seek" onClick={handleSeek}>
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 ease-linear" 
                  style={{ width: `${audioProgress}%` }} 
                />
              </div>

              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => skipAudio(-10)} 
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                  <Rewind className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => toggleAudio()} 
                  className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-300"
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                </button>

                <button 
                  onClick={() => skipAudio(10)} 
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                  <FastForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-2 shrink-0 border-l border-slate-100 pl-6">
             <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 min-w-[140px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                   <span className="text-[10px] font-black uppercase text-slate-600">Live</span>
                </div>
             </div>
             <button 
                onClick={() => skipAudio(session.duration)}
                className="w-full py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-1.5"
              >
                Jump to End <FastForward className="w-2.5 h-2.5" />
             </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-10">
        
        {/* TIMELINE / LOGS TABLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Interview Timeline</h3>
               <div className="h-4 w-[1px] bg-slate-200" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological Highlights</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
              {session.opportunities.length} Pins
            </span>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
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

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {session.opportunities.map((opp, i) => (
              <div key={opp.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-300 font-bold">#{(i + 1).toString().padStart(2, '0')}</span>
                      <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border', tagColors[opp.tag].text, tagColors[opp.tag].border, tagColors[opp.tag].bg)}>
                        {opp.tag}
                      </span>
                      <span className={cn("text-[9px] font-bold uppercase", opp.paid ? "text-emerald-500" : "text-slate-300")}>
                        {opp.paid ? 'Commercial' : 'Insight'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-700 text-sm tracking-tight">{opp.title}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <button onClick={() => toggleAudio(opp.timestamp)} className="text-[10px] text-slate-400 hover:text-slate-800 font-bold flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" /> {formatDuration(opp.timestamp)}
                  </button>
                  <button onClick={() => setSelectedId(opp.id)} className="h-8 px-4 bg-slate-50 text-slate-600 border border-slate-100 font-bold text-[10px] uppercase rounded-lg hover:bg-slate-100 transition-all">
                    Edit
                  </button>
                </div>
              </div>
            ))}
            {session.opportunities.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-100">No highlights captured.</div>
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

        {/* TRANSCRIPT — Word-for-word from ElevenLabs */}
        <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Transcript
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Word-for-word transcription via ElevenLabs. Editable.</p>
            </div>
            <button onClick={handleSynthesize} disabled={isSynthesizing} className={cn("h-10 px-4 sm:px-6 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-sm shrink-0", isSynthesizing ? "bg-slate-50 text-slate-300 border-slate-100" : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700")}>
              <Sparkles className={cn("w-4 h-4", isSynthesizing && "animate-pulse")} />
              {isSynthesizing ? "Processing..." : "Generate Transcript & Summary"}
            </button>
          </div>
          <textarea 
            className="w-full min-h-[180px] sm:min-h-[250px] p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl text-sm text-slate-700 leading-relaxed outline-none focus:bg-white focus:border-slate-300 transition-all resize-y font-medium" 
            placeholder="Transcript will appear here after processing the audio. You can also paste or type manually..." 
            value={localTranscript} 
            onChange={(e) => setLocalTranscript(e.target.value)} 
          />
        </section>

        {/* SUMMARY — Structured from NVIDIA Nemotron */}
        <section className="bg-white border border-slate-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-sm overflow-hidden">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> Executive Summary
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">AI-generated summary powered by NVIDIA Nemotron. Editable.</p>
            </div>
          </div>
          <textarea 
            className="w-full min-h-[200px] sm:min-h-[300px] p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl text-sm sm:text-base text-slate-700 leading-relaxed outline-none focus:bg-white focus:border-slate-300 transition-all resize-y font-medium" 
            placeholder="Executive summary will be generated here after processing. You can also edit manually..." 
            value={localSummary} 
            onChange={(e) => setLocalSummary(e.target.value)} 
          />
        </section>

      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-40 flex justify-center">
        <button onClick={handleNextClick} className="w-full max-w-sm h-12 sm:h-14 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-sm font-bold hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
          Publish Final Report <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* EDIT MODAL */}
      {selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[95vh] border border-slate-100">
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg sm:text-xl tracking-tight">Edit Highlight</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Refine captured point details.</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm border border-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 font-medium">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
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
