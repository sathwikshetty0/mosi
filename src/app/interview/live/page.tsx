'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, ShieldCheck, ChevronRight,
  Mic, X, Loader2, BarChart2, MessageSquare, Layers, Globe
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

type QuadrantKey = CEEDTag

const quadrants: { id: QuadrantKey; icon: any; color: string; bg: string; border: string; questions: string[] }[] = [
  {
    id: 'Core', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    questions: [
      'Walk me through your core product or service.',
      'What are the top 2–3 challenges your team faces right now?',
      'What features or aspects do customers love most?',
      'How do you currently differentiate from competitors?',
      'What does your typical customer journey look like?'
    ]
  },
  {
    id: 'Efficiency', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    questions: [
      'Which department or process consumes the most time each week?',
      'How does your team currently generate and qualify leads?',
      'What processes are still manual that frustrate your team?',
      'Where do you feel you\'re leaving money on the table?',
      'What tools or tech do you wish you had?'
    ]
  },
  {
    id: 'Expansion', icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    questions: [
      'Do customers frequently ask for services or features you don\'t offer?',
      'Are there adjacent markets you want to enter in the next 12–24 months?',
      'What partnerships or channels have you not fully explored?',
      'Which customer segment do you think is underserved?'
    ]
  },
  {
    id: 'Disrupt', icon: Sparkles, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
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
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [isFinishing, setIsFinishing] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [showAssetMenu, setShowAssetMenu] = React.useState(false)

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

  const handleMarkAsked = (idx: number) => {
    const key = `${activeQuadrant}-${idx}`
    setAnsweredQuestions(prev => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
    })
  }

  const handleQuickCapture = () => {
    addOpportunity({
      timestamp: recordingSeconds,
      title: 'Strategic Opportunity',
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
  }

  const handleStopInterview = () => {
    if (confirm('Finalize this session?')) {
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
        addEvidence({ type, url, timestamp: recordingSeconds, title: 'External Link' })
      }
    } else {
      setActiveEvidenceType(type)
      fileInputRef.current?.click()
    }
    setShowAssetMenu(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activeEvidenceType) {
      const url = URL.createObjectURL(file)
      addEvidence({ type: activeEvidenceType, url, timestamp: recordingSeconds, title: file.name })
    }
    setActiveEvidenceType(null)
  }

  const evidence = currentSession?.evidence || []

  return (
    <div className="flex h-[calc(100vh-2rem)] lg:h-[calc(100vh-40px)] bg-[#0A0A0B] text-white rounded-[2.5rem] overflow-hidden relative border border-white/5 font-sans">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* 🖼 LEFT ASSET GALLERY (WhatsApp style) */}
      <aside className="hidden lg:flex w-24 flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl shrink-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Vault</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar">
            {evidence.length === 0 ? (
                <div className="opacity-10 text-center py-20 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border border-dashed border-white rounded-lg" />
                </div>
            ) : [...evidence].reverse().map((ev, i) => (
                <div key={i} className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer">
                    {ev.type === 'image' ? (
                        <img src={ev.url} alt="asset" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {ev.type === 'video' ? <Video className="w-4 h-4" /> : ev.type === 'link' ? <LinkIcon className="w-4 h-4" /> : <FileIcon className="w-4 h-4" />}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </aside>

      {/* 📱 MAIN DISCOVERY WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* TOP STATUS BAR */}
        <header className="p-6 lg:p-8 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
               {quadrants.map(q => (
                 <button 
                  key={q.id}
                  onClick={() => { setActiveQuadrant(q.id); setQuestionIndex(0) }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                    activeQuadrant === q.id ? `bg-white text-black border-white shadow-xl scale-105` : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                  )}
                 >
                   {q.id}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                <span className="text-[10px] font-mono font-black tracking-widest text-rose-500 uppercase">Live Rec: {formatDuration(recordingSeconds)}</span>
            </div>
        </header>

        {/* CONTENT CENTER */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 lg:px-12 pb-32">
            
            {/* HERO QUESTION */}
            <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/80 mb-6">Discovery Protocol / {activeQuadrant}</p>
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white/90">
                        {questions[questionIndex]}
                    </h1>
                </div>

                {/* FOLLOW UP SUGGESTIONS */}
                <div className="grid grid-cols-1 gap-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Synthesized Follow-ups</p>
                    {questions.map((q, i) => i !== questionIndex && (
                        <button 
                            key={i}
                            onClick={() => setQuestionIndex(i)}
                            className={cn(
                                "text-left p-6 rounded-3xl transition-all border group relative",
                                answeredQuestions.has(`${activeQuadrant}-${i}`) 
                                ? "bg-white/5 border-white/5 text-slate-600" 
                                : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.07] hover:border-white/20 hover:text-white"
                            )}
                        >
                            <span className="text-[10px] font-black opacity-30 mr-4">{String(i + 1).padStart(2, '0')}</span>
                            <span className="text-sm lg:text-base font-bold uppercase tracking-tight">{q}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 📟 THE CONTROL HUB (WhatsApp inspired) */}
        <div className="absolute inset-x-0 bottom-0 p-6 lg:p-12 pointer-events-none">
            <div className="max-w-3xl mx-auto flex flex-col gap-6 items-center pointer-events-auto">
                
                {/* Opportunity Tapper */}
                <button 
                    onClick={handleQuickCapture}
                    className="h-16 px-12 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
                >
                    <Activity className="w-4 h-4" />
                    Tap Strategic Opportunity
                </button>

                {/* Recording Bar */}
                <div className="w-full h-20 bg-[#1C1C1E] rounded-full border border-white/10 shadow-2xl flex items-center px-4 gap-4">
                    
                    {/* Add Asset */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowAssetMenu(!showAssetMenu)}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                                showAssetMenu ? "bg-white text-black rotate-45" : "bg-white/5 text-white hover:bg-white/10"
                            )}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                        
                        {showAssetMenu && (
                            <div className="absolute bottom-16 left-0 bg-[#2C2C2E] border border-white/10 p-2 rounded-2xl shadow-3xl flex flex-col gap-1 w-48 animate-in slide-in-from-bottom-2">
                                {[
                                    { id: 'image', icon: ImageIcon, label: 'Capture Image' },
                                    { id: 'video', icon: Video, label: 'Record Clip' },
                                    { id: 'link', icon: LinkIcon, label: 'External Link' },
                                    { id: 'file', icon: FileIcon, label: 'Enterprise Doc' },
                                ].map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleCaptureEvidence(item.id as any)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-left transition-all"
                                    >
                                        <item.icon className="w-4 h-4 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Waveform Visualization (Dynamic UI) */}
                    <div className="flex-1 flex items-center gap-1.5 px-4 overflow-hidden">
                        {[...Array(40)].map((_, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-1 bg-blue-500/40 rounded-full transition-all duration-300",
                                    isRecording && !isPaused ? "animate-pulse" : "opacity-30"
                                )}
                                style={{ 
                                    height: `${Math.max(4, Math.random() * (isRecording && !isPaused ? 32 : 8))}px`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Recording Controls */}
                    <div className="flex items-center gap-2 pr-2">
                        <button 
                            onClick={handlePauseInterview}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-all border-2",
                                isPaused ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-rose-500 hover:bg-rose-500/10"
                            )}
                        >
                            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                        </button>
                        <button 
                            onClick={handleStopInterview}
                            className="w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-500 active:scale-90 transition-all shadow-xl shadow-rose-900/20"
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* FINISH OVERLAY */}
        {isFinishing && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Finalizing Archive</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Synthesizing discovery manifest...</p>
                </div>
            </div>
        )}
      </main>
    </div>
  )
}
