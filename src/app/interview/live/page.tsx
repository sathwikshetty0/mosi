'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Mic, MicOff, Square, Play, Pause,
  Plus, MessageSquare, Image as ImageIcon, Video, Link as LinkIcon,
  CheckCircle, Archive, Zap, TrendingUp, Bomb, X, Clock,
  ChevronLeft, ChevronRight, Tag, File as FileIcon, Sparkles, Activity, ShieldCheck,
  BarChart2
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

type QuadrantKey = CEEDTag

const quadrants: { id: QuadrantKey; icon: any; color: string; bg: string; border: string; questions: string[] }[] = [
  {
    id: 'Core', icon: Archive, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    questions: [
      'Walk me through your core product or service.',
      'What are the top 2–3 challenges your team faces right now?',
      'What features or aspects do customers love most?',
      'How do you currently differentiate from competitors?',
      'What does your typical customer journey look like?'
    ]
  },
  {
    id: 'Efficiency', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
    questions: [
      'Which department or process consumes the most time each week?',
      'How does your team currently generate and qualify leads?',
      'What processes are still manual that frustrate your team?',
      'Where do you feel you\'re leaving money on the table?',
      'What tools or tech do you wish you had?'
    ]
  },
  {
    id: 'Expansion', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
    questions: [
      'Do customers frequently ask for services or features you don\'t offer?',
      'Are there adjacent markets you want to enter in the next 12–24 months?',
      'What partnerships or channels have you not fully explored?',
      'Which customer segment do you think is underserved?'
    ]
  },
  {
    id: 'Disrupt', icon: Bomb, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200',
    questions: [
      'If you were to restart this company today, what would you do completely differently?',
      'What technology do you think will disrupt your industry in 3–5 years?',
      'What assumptions about your business model could turn out to be wrong?',
      'What would a competitor with 10x your budget do to beat you?'
    ]
  }
]

export default function LiveInterviewPage() {
  const router = useRouter()
  const {
    isRecording, recordingSeconds, activeQuadrant, currentSession,
    startRecording, stopRecording, setActiveQuadrant, addOpportunity,
    addEvidence, finalizeSession, tick
  } = useMosiStore()

  const [questionIndex, setQuestionIndex] = React.useState(0)
  const [answeredQuestions, setAnsweredQuestions] = React.useState<Set<string>>(new Set())
  const [evidenceFeedback, setEvidenceFeedback] = React.useState<string | null>(null)
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [isFinishing, setIsFinishing] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [activeEvidenceType, setActiveEvidenceType] = React.useState<'image' | 'video' | 'link' | 'file' | null>(null)

  // Setup stream (Audio Only)
  React.useEffect(() => {
    async function setupMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: currentSession?.settings?.audio !== false
        })
        setStream(s)
        startRecording()
      } catch (err) {
        console.error("Mic access error:", err)
      }
    }
    setupMedia()
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [currentSession?.settings?.audio])

  // Recorder logic
  React.useEffect(() => {
    if (isRecording && stream && !mediaRecorderRef.current) {
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
    } else if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }, [isRecording, stream])

  // Navigation after blob is ready
  React.useEffect(() => {
    if (isFinishing && blobUrl) {
      finalizeSession(blobUrl)
      router.push('/review')
    }
  }, [isFinishing, blobUrl, finalizeSession, router])

  // Timer tick
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (isRecording && !isPaused) tick()
    }, 1000)
    return () => clearInterval(timer)
  }, [isRecording, isPaused, tick])

  const currentQ = quadrants.find(q => q.id === activeQuadrant)!
  const questions = currentQ.questions

  const handleMarkAsked = () => {
    const key = `${activeQuadrant}-${questionIndex}`
    setAnsweredQuestions(prev => new Set([...prev, key]))
    if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1)
  }

  const handleQuickCapture = () => {
    addOpportunity({
      timestamp: recordingSeconds,
      title: 'Captured Insight',
      description: '',
      tag: activeQuadrant,
      paid: false,
      duration: '',
      skills: '',
      score: { clarity: 1, awareness: 1, attempts: 1, intensity: 1 },
      notes: '',
      evidence: [],
      status: 'Pending'
    })
    setEvidenceFeedback('capture')
    setTimeout(() => setEvidenceFeedback(null), 1000)
  }

  const handleStopInterview = () => {
    if (confirm('Complete and finalize this interview session?')) {
        stopRecording()
        setIsFinishing(true)
    }
  }

  const handlePauseInterview = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const handleCaptureEvidence = (type: 'image' | 'video' | 'link' | 'file') => {
    if (type === 'link') {
      const url = prompt('Enter evidence URL:', 'https://')
      if (url) {
        addEvidence({
          type,
          url,
          timestamp: recordingSeconds,
          title: 'External Link'
        })
        setEvidenceFeedback(type)
        setTimeout(() => setEvidenceFeedback(null), 1000)
      }
    } else {
      setActiveEvidenceType(type)
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activeEvidenceType) {
      const url = URL.createObjectURL(file)
      addEvidence({
        type: activeEvidenceType,
        url,
        timestamp: recordingSeconds,
        title: file.name
      })
      setEvidenceFeedback(activeEvidenceType)
      setTimeout(() => setEvidenceFeedback(null), 1000)
    }
    setActiveEvidenceType(null)
  }

  const captured = currentSession?.opportunities || []

  return (
    <div className="flex flex-col min-h-screen lg:h-[calc(100vh-100px)] bg-white lg:rounded-[2.5rem] lg:border-2 border-slate-100 lg:shadow-2xl shadow-slate-200/50 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={activeEvidenceType === 'image' ? 'image/*' : activeEvidenceType === 'video' ? 'video/*' : '*/*'}
        onChange={handleFileChange}
      />

      {/* 🚀 TOP COMMAND BAR */}
      <div className="p-4 lg:p-6 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-3 px-5 py-2.5 rounded-2xl transition-all",
            isRecording && !isPaused ? "bg-rose-500 text-white shadow-xl shadow-rose-200" : "bg-slate-100 text-slate-400"
          )}>
            <div className={cn("w-2.5 h-2.5 rounded-full", isRecording && !isPaused ? "bg-white animate-pulse" : "bg-slate-300")} />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">
              {isPaused ? 'Paused' : isRecording ? 'Recording' : 'Standby'}
            </span>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <span className="text-sm font-black font-mono">
              {formatDuration(recordingSeconds)}
            </span>
          </div>
          {!isRecording && (
             <button 
               onClick={startRecording}
               className="h-10 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
             >
               Start
             </button>
          )}
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:flex flex-col items-end mr-4">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{currentSession?.stakeholder?.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{currentSession?.stakeholder?.company}</p>
           </div>
           {isRecording && (
              <>
                <button 
                  onClick={handlePauseInterview}
                  className={cn("w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 transition-all flex items-center justify-center active:scale-90", isPaused ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900")}
                >
                  {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                </button>
                <button 
                  onClick={handleStopInterview}
                  className="px-4 h-10 lg:h-12 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> End
                </button>
              </>
           )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        
        {/* 🧭 CEED NAVIGATION DOCK */}
        <aside className="w-full lg:w-24 bg-slate-50 border-b lg:border-r border-slate-100 p-2 flex lg:flex-col gap-3 shrink-0 overflow-x-auto lg:overflow-y-auto no-scrollbar">
          {quadrants.map(q => (
            <button
              key={q.id}
              onClick={() => { setActiveQuadrant(q.id); setQuestionIndex(0) }}
              className={cn(
                'flex-1 lg:flex-none aspect-square lg:w-full lg:h-20 rounded-2xl lg:rounded-3xl transition-all flex flex-col items-center justify-center gap-2 border-2 relative group px-4 py-2 lg:p-0 min-w-fit lg:min-w-0',
                activeQuadrant === q.id
                  ? `bg-white ${q.border} ${q.color} shadow-lg lg:scale-105 z-10 font-black`
                  : 'bg-white/0 border-transparent text-slate-400 hover:bg-white hover:border-slate-100'
              )}
            >
              <q.icon className={cn("w-5 h-5 lg:w-6 lg:h-6 transition-transform group-hover:scale-110", activeQuadrant === q.id ? q.color : "text-slate-300")} />
              <span className="text-[8px] font-black uppercase tracking-widest">{q.id}</span>
              {activeQuadrant === q.id && (
                 <div className="hidden lg:block absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-lg shadow-blue-500/50" />
              )}
            </button>
          ))}
        </aside>

        {/* 📋 DISCOVERY WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 p-3 lg:p-6 gap-4 lg:gap-6 overflow-hidden bg-slate-50/30">
          
           <div className="flex-1 flex flex-col bg-white rounded-[1.5rem] lg:rounded-[2rem] border-2 border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 min-h-0">
              <div className="p-4 lg:p-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="space-y-0.5">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                       Framework: {activeQuadrant}
                    </h4>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Active Questions</p>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => setQuestionIndex(Math.max(0, questionIndex - 1))}
                      disabled={questionIndex === 0}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-slate-900 px-2">{questionIndex + 1} / {questions.length}</span>
                    <button 
                      onClick={() => setQuestionIndex(Math.min(questions.length - 1, questionIndex + 1))}
                      disabled={questionIndex === questions.length - 1}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-900 hover:text-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* QUESTIONS LIST - Ensure this is scrollable and visible */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 no-scrollbar min-h-0">
                 {questions.map((q, i) => {
                   const asked = answeredQuestions.has(`${activeQuadrant}-${i}`)
                   const active = i === questionIndex
                   return (
                     <div
                      key={i}
                      id={`question-${i}`}
                      onClick={() => setQuestionIndex(i)}
                      className={cn(
                        "w-full text-left p-4 lg:p-6 rounded-[1.2rem] lg:rounded-[2rem] border-2 transition-all relative group h-fit cursor-pointer",
                        active 
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl lg:translate-x-1" 
                          : asked 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700 opacity-60" 
                            : "bg-white border-slate-50 text-slate-500 hover:border-slate-200"
                      )}
                     >
                        <div className="flex gap-4 lg:gap-6 items-start">
                           <span className={cn("text-[10px] font-black mt-0.5", active ? "text-white/40" : "text-slate-300")}>{String(i + 1).padStart(2, '0')}</span>
                           <h3 className={cn("text-sm lg:text-lg font-black leading-tight flex-1 uppercase tracking-tight", active ? "text-white" : asked ? "line-through" : "text-slate-800")}>{q}</h3>
                        </div>
                        {active && (
                           <div className="mt-4 lg:mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkAsked() }}
                                className="h-10 px-4 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                              >
                                Mark Asked
                              </button>
                              <div className="flex-1 h-px bg-white/10" />
                           </div>
                        )}
                     </div>
                   )
                 })}
              </div>

              {/* ⚡ SYNTHESIS ACTION PAD - Keep it visible and compact */}
              <div className="p-4 lg:p-6 bg-slate-50 border-t border-slate-100 space-y-4 shrink-0">
                 <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-3 lg:gap-4">
                    <button 
                      onClick={handleQuickCapture}
                      className={cn(
                        "group h-16 lg:h-20 rounded-[1.2rem] lg:rounded-[2rem] transition-all shadow-xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-1 relative overflow-hidden",
                        evidenceFeedback === 'capture' 
                        ? "bg-emerald-500 text-white shadow-emerald-200" 
                        : "bg-slate-900 text-white hover:bg-blue-600"
                      )}
                    >
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                              <Activity className="w-4 h-4" />
                           </div>
                           {evidenceFeedback === 'capture' ? 'INSIGHT LOGGED ✓' : 'LOG STRATEGIC INSIGHT'}
                        </div>
                    </button>

                    <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 lg:gap-3">
                        {[
                          { icon: ImageIcon, label: 'IMG', type: 'image' as const },
                          { icon: LinkIcon, label: 'LINK', type: 'link' as const },
                          { icon: Video, label: 'VID', type: 'video' as const },
                          { icon: FileIcon, label: 'DOC', type: 'file' as const },
                        ].map(btn => (
                          <button 
                            key={btn.type} 
                            onClick={() => handleCaptureEvidence(btn.type)}
                            className={cn(
                              "flex flex-col items-center justify-center gap-1.5 rounded-xl lg:rounded-2xl border-2 transition-all active:scale-90 h-10 lg:h-auto",
                              evidenceFeedback === btn.type ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-900"
                            )}
                          >
                            <btn.icon className="w-3.5 h-3.5" />
                            <span className="text-[7px] lg:text-[8px] font-black uppercase tracking-widest">{btn.label}</span>
                          </button>
                        ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 🪵 INTELLIGENCE FEED */}
        <aside className="w-full lg:w-80 bg-white lg:border-l border-slate-100 flex flex-col min-h-0 shrink-0 overflow-hidden">
           <div className="p-4 lg:p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata Feed</h4>
                 <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Active Discovery</p>
              </div>
              <div className="px-3 py-1 bg-slate-50 rounded-lg flex items-center justify-center text-slate-900 font-black text-[10px] border border-slate-100">
                 {captured.length} INSIGHTS
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 no-scrollbar bg-slate-50/20 min-h-0">
              {captured.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-8 space-y-4">
                    <BarChart2 className="w-10 h-10 text-slate-900" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] leading-loose">Waiting for<br/>Insight...</p>
                 </div>
              ) : [...captured].reverse().map(opp => (
                <div key={opp.id} className="p-4 bg-white rounded-[1.2rem] border-2 border-slate-100 shadow-sm flex items-start gap-3 hover:border-slate-900 transition-all cursor-default group animate-in slide-in-from-right-4 duration-500">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-lg", {
                    'bg-blue-500': opp.tag === 'Core',
                    'bg-amber-500': opp.tag === 'Efficiency',
                    'bg-emerald-500': opp.tag === 'Expansion',
                    'bg-rose-500': opp.tag === 'Disrupt'
                  })} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">{opp.title}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{opp.tag} MATRIX</span>
                       <span className="text-[8px] text-slate-900 font-black font-mono">{formatDuration(opp.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="p-4 lg:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-3 bg-white p-3 lg:p-4 rounded-2xl border border-slate-100">
                 <ShieldCheck className="w-4 h-4 text-blue-600" />
                 <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-900 uppercase">Secure Buffer</p>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">Encryption Active</p>
                 </div>
              </div>
           </div>
        </aside>
      </div>

      {/* 🧭 PREMIUM TIMELINE FOOTER */}
      <footer className="px-4 lg:px-8 py-4 lg:py-6 bg-slate-900 shrink-0 relative overflow-hidden hidden lg:block">
         <div className="relative z-10 flex items-center gap-10">
            <div className="shrink-0 space-y-0.5">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Locus</span>
               <div className="text-lg font-black font-mono text-white tracking-widest">{formatDuration(recordingSeconds)}</div>
            </div>
            
            <div className="flex-1 h-2 bg-white/5 rounded-full relative overflow-hidden backdrop-blur-sm border border-white/5">
               <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${Math.min((recordingSeconds / 1800) * 100, 100)}%` }} />
               {captured.map(opp => {
                 const pct = (opp.timestamp / Math.max(recordingSeconds, 1800)) * 100
                 return (
                   <div 
                    key={opp.id} 
                    className={cn("absolute inset-y-0 w-1 z-20 transition-all", {
                      'bg-blue-400': opp.tag === 'Core',
                      'bg-amber-400': opp.tag === 'Efficiency',
                      'bg-emerald-400': opp.tag === 'Expansion',
                      'bg-rose-400': opp.tag === 'Disrupt'
                    })}
                    style={{ left: `${Math.min(pct, 99)}%` }}
                   />
                 )
               })}
            </div>
         </div>
      </footer>
    </div>
  )
}
