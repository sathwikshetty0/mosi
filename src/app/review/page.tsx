'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Play, Pause, FastForward, Rewind, Clock, ChevronRight, ChevronLeft,
  CheckCircle2, Trash2, BarChart2, CheckCircle, Sparkles,
  FileText, Headphones, Save, Zap, Image as ImageIcon, Link as LinkIcon, File as FileIcon,
  X
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration, Opportunity } from '@/lib/store'
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
  const { sessions, updateOpportunity, deleteSession, updateSessionSummary } = useMosiStore()
  
  const session = sessions.find(s => s.status === 'Review') || sessions[0]

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showChecklistPopup, setShowChecklistPopup] = React.useState(false)
  const [checklist, setChecklist] = React.useState<boolean[]>(CHECKLIST.map(() => false))
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')
  
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
        <h3 className="text-lg font-semibold text-slate-900">No sessions to review</h3>
        <p className="text-sm text-slate-400 mt-1">Start an interview first.</p>
      </div>
      <button onClick={() => router.push('/setup')} className="h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
        Start Interview
      </button>
    </div>
  )

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Synthesis Mode</span>
              <span className="text-xs text-slate-400 font-medium">{session.date}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{session.stakeholder?.name || 'Untitled Participant'}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium mt-1">
              <Clock className="w-3 h-3" /> Duration: {formatDuration(session.duration)} / {session.stakeholder?.company || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all">
            <Trash2 className="w-4 h-4" />
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
        
        {/* LOGS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Logs
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
              {session.opportunities.length} Items
            </span>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['#', 'Log Title', 'Tag', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {session.opportunities.map((opp, i) => (
                  <tr key={opp.id} className="group hover:bg-slate-50 transition-all">
                    <td className="px-6 py-5 text-xs text-slate-300 font-mono font-bold">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 text-sm tracking-tight">{opp.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 object-center">
                         <button 
                           onClick={() => toggleAudio(opp.timestamp)}
                           className="text-[10px] text-blue-500 hover:text-blue-700 font-bold uppercase tracking-widest flex items-center gap-1 bg-blue-50 px-2 rounded-md"
                         >
                           <Play className="w-3 h-3" /> {formatDuration(opp.timestamp)}
                         </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg', tagColors[opp.tag].bg, tagColors[opp.tag].text)}>{opp.tag}</span>
                    </td>
                    <td className="px-6 py-5">
                      {opp.paid ? (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Paid</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Unpaid</span>
                      )}
                      {opp.engagementType === 'Gig' && <span className="ml-2 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Gig</span>}
                      {opp.engagementType === 'Internship' && <span className="ml-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md">Intern</span>}
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => setSelectedId(opp.id)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest underline decoration-slate-200 underline-offset-4"
                      >
                        Edit Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {session.opportunities.length === 0 && (
              <div className="p-16 text-center text-slate-300 italic text-sm">No logs captured during session.</div>
            )}
          </div>
        </section>

        {/* DIGITAL LOGS SECTION (EVIDENCE) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
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
                  <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-md p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
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

        {/* TRANSCRIBE / SUMMARY SECTION */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 lg:p-10 space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Transcribe & Summary (AI / Manual)
              </h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] mt-1">Refine and synthesize the total session</p>
            </div>
            <button onClick={handleSaveSummary} className="h-11 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <Save className="w-4 h-4" /> Save Record
            </button>
          </div>
          <textarea 
            className="w-full min-h-[250px] p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 leading-relaxed outline-none focus:border-slate-300 transition-all resize-none shadow-inner relative z-10"
            placeholder="Review the audio and finalize the summary here..."
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-tight text-lg">Edit {selectedOpp.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reviewing Logic & Data</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all">
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
                        <button onClick={() => skipAudio(-10)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><Rewind className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleAudio()} className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-md">{isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}</button>
                        <button onClick={() => skipAudio(10)} className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><FastForward className="w-3.5 h-3.5" /></button>
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
                        <button onClick={() => updateOpportunity(selectedOpp.id, { paid: false })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", !selectedOpp.paid ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Unpaid</button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 block uppercase tracking-widest">Engagement Type</label>
                      <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Gig' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Gig' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Gig</button>
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Internship' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Internship' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Intern</button>
                        <button onClick={() => updateOpportunity(selectedOpp.id, { engagementType: 'Full-time' })} className={cn("flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", selectedOpp.engagementType === 'Full-time' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-700")}>Full-time</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setSelectedId(null)} className="h-12 px-8 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-md">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKLIST POPUP */}
      {showChecklistPopup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-8 relative">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Post-Interview Checklist</h3>
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
                className="h-12 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
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
