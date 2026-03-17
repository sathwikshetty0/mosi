'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, ShieldCheck, ChevronRight,
  Mic, X, Loader2, BarChart2, MessageSquare, Layers, Globe, MoreVertical
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
  const [showVault, setShowVault] = React.useState(false)

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
    <div className="flex h-screen bg-[#0E0E10] text-white overflow-hidden relative font-sans lg:p-4">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* 🖼 LEFT ASSET GALLERY (WhatsApp style) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-[#121214] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 flex flex-col overflow-hidden shadow-2xl lg:shadow-none lg:rounded-[2rem]",
        showVault ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Vault</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Discovery</p>
                </div>
            </div>
            <button onClick={() => setShowVault(false)} className="lg:hidden text-slate-500">
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {evidence.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-10">
                    <div className="w-16 h-16 border-2 border-dashed border-white rounded-[2rem] mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No assets captured</p>
                </div>
            ) : [...evidence].reverse().map((ev, i) => (
                <div key={i} className="group relative w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer animate-in fade-in slide-in-from-left-4">
                    {ev.type === 'image' ? (
                        <img src={ev.url} alt="asset" className="w-full h-fit object-contain max-h-48" />
                    ) : (
                        <div className="w-full aspect-video flex flex-col items-center justify-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                {ev.type === 'video' ? <Video className="w-5 h-5 text-indigo-400" /> : ev.type === 'link' ? <LinkIcon className="w-5 h-5 text-emerald-400" /> : <FileIcon className="w-5 h-5 text-amber-400" />}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{ev.title || ev.type}</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black font-mono">{formatDuration(ev.timestamp)}</div>
                </div>
            ))}
        </div>
      </aside>

      {/* 📱 MAIN DISCOVERY WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 relative lg:ml-4 bg-[#0E0E10] lg:rounded-[2rem] lg:border border-white/5">
        
        {/* TOP STATUS BAR - Ultra Clean */}
        <header className="px-6 py-8 lg:px-12 lg:py-10 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2 lg:gap-3 bg-white/5 p-1 rounded-full border border-white/5">
               {quadrants.map(q => (
                 <button 
                  key={q.id}
                  onClick={() => { setActiveQuadrant(q.id); setQuestionIndex(0) }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                    activeQuadrant === q.id ? `bg-white text-black shadow-xl` : "text-slate-500 hover:text-white"
                  )}
                 >
                   {q.id}
                 </button>
               ))}
            </div>
            
            <button onClick={() => setShowVault(true)} className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-slate-400 hover:text-white transition-all">
                <ImageIcon className="w-5 h-5 text-blue-400" />
            </button>
            <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/10">
                   <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                   <span className="text-[10px] font-mono font-black tracking-widest text-rose-500 uppercase">{formatDuration(recordingSeconds)}</span>
                </div>
            </div>
        </header>

        {/* CONTENT CENTER - Optimized for Mobile Reading */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 pb-48 overflow-y-auto no-scrollbar pt-8 lg:pt-0">
            <div className="max-w-4xl mx-auto w-full space-y-16 lg:space-y-24">
                
                {/* HERO QUESTION - Gradient Magic */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 transition-all">{activeQuadrant} Quadrant Protocol</p>
                    <h1 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-white/95">
                        <span className="block opacity-100">{questions[questionIndex].split(' ').slice(0, -1).join(' ')}</span>
                        <span className="block text-slate-500 transition-colors duration-500">{questions[questionIndex].split(' ').slice(-1)}</span>
                    </h1>
                </div>

                {/* FOLLOW UP SUGGESTIONS - Pill Buttons */}
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-2">Next Suggested Prompts</p>
                    <div className="flex flex-col gap-3">
                        {questions.map((q, i) => i !== questionIndex && (
                            <button 
                                key={i}
                                onClick={() => setQuestionIndex(i)}
                                className={cn(
                                    "text-left p-6 lg:p-8 rounded-[2rem] transition-all border group relative overflow-hidden",
                                    answeredQuestions.has(`${activeQuadrant}-${i}`) 
                                    ? "bg-white/[0.02] border-white/5 text-slate-700" 
                                    : "bg-white/[0.04] border-white/10 text-white/40 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black opacity-20 group-hover:opacity-40">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="text-sm lg:text-lg font-bold tracking-tight uppercase leading-snug">{q}</span>
                                </div>
                                {answeredQuestions.has(`${activeQuadrant}-${i}`) && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* 📟 THE CONTROL CENTER - Ultra Premium Floating Mobile Hub */}
        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-16 z-30 pointer-events-none">
            <div className="max-w-xl mx-auto flex flex-col gap-4 pointer-events-auto items-center">
                
                {/* Strategic Action Trigger */}
                <button 
                    onClick={handleQuickCapture}
                    className="h-14 lg:h-16 px-10 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.3em] text-[9px] shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 border border-white/20 hover:bg-blue-500"
                >
                    <Activity className="w-4 h-4 mb-0.5" />
                    Strategic Insight Log
                </button>

                {/* Primary Recording Interface - Pill Shape */}
                <div className="w-full h-16 lg:h-20 bg-[#1C1C1E] rounded-full border border-white/10 shadow-3xl flex items-center p-2 relative">
                    
                    {/* ASSET ACCELERATOR (+) */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowAssetMenu(!showAssetMenu)}
                            className={cn(
                                "w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                showAssetMenu ? "bg-white text-black rotate-45 shadow-xl" : "bg-white/5 text-white hover:bg-white/10"
                            )}
                        >
                            <Plus className={cn("transition-transform", showAssetMenu ? "w-6 h-6" : "w-5 h-5")} />
                        </button>
                        
                        {/* ASSET CONTEXT MENU */}
                        {showAssetMenu && (
                            <div className="absolute bottom-20 left-0 bg-[#2C2C2E] border border-white/10 p-2 rounded-3xl shadow-3xl flex flex-col gap-1 w-48 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
                                {[
                                    { id: 'image', icon: ImageIcon, label: 'Capture Still', color: 'text-blue-400' },
                                    { id: 'video', icon: Video, label: 'Record Clip', color: 'text-indigo-400' },
                                    { id: 'link', icon: LinkIcon, label: 'Add Reference', color: 'text-emerald-400' },
                                    { id: 'file', icon: FileIcon, label: 'Attach Doc', color: 'text-amber-400' },
                                ].map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleCaptureEvidence(item.id as any)}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-white/5 text-left transition-all active:scale-95"
                                    >
                                        <item.icon className={cn("w-4 h-4", item.color)} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* WAVEFORM MONITOR */}
                    <div className="flex-1 h-full flex items-center justify-center gap-1.5 px-6 overflow-hidden mask-fade-edges">
                        {[...Array(24)].map((_, i) => (
                            <div 
                                key={i} 
                                className={cn(
                                    "w-1 rounded-full transition-all duration-300",
                                    isRecording && !isPaused ? "bg-blue-500 animate-pulse" : "bg-slate-700 opacity-20"
                                )}
                                style={{ 
                                    height: `${Math.max(2, Math.random() * (isRecording && !isPaused ? 40 : 10))}px`,
                                    animationDelay: `${i * 0.08}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* RECORDING COMMANDS */}
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={handlePauseInterview}
                            className={cn(
                                "w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all",
                                isPaused ? "bg-white text-black shadow-xl" : "bg-white/5 text-rose-500 hover:bg-rose-500/10"
                            )}
                        >
                            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
                        </button>
                        <button 
                            onClick={handleStopInterview}
                            className="w-12 h-12 lg:w-16 lg:h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* SYSTEM OVERLAY */}
        {isFinishing && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-white/5 rounded-full" />
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-spin border-t-transparent" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Manifesting Discovery</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Synthesizing Strategic Artifacts...</p>
                </div>
            </div>
        )}
      </main>

      <style jsx global>{`
        .mask-fade-edges {
            mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
