'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, ShieldCheck, ChevronRight,
  Mic, X, Loader2, BarChart2, MessageSquare, Layers, Globe, MoreVertical,
  ArrowUp
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

type QuadrantKey = CEEDTag

const quadrants: { id: QuadrantKey; questions: string[] }[] = [
  {
    id: 'Core',
    questions: [
      'Walk me through your core product or service.',
      'What are the top 2–3 challenges your team faces right now?',
      'What features or aspects do customers love most?',
      'How do you currently differentiate from competitors?',
      'What does your typical customer journey look like?'
    ]
  },
  {
    id: 'Efficiency',
    questions: [
      'Which department or process consumes the most time each week?',
      'How does your team currently generate and qualify leads?',
      'What processes are still manual that frustrate your team?',
      'Where do you feel you\'re leaving money on the table?',
      'What tools or tech do you wish you had?'
    ]
  },
  {
    id: 'Expansion',
    questions: [
      'Do customers frequently ask for services or features you don\'t offer?',
      'Are there adjacent markets you want to enter in the next 12–24 months?',
      'What partnerships or channels have you not fully explored?',
      'Which customer segment do you think is underserved?'
    ]
  },
  {
    id: 'Disrupt',
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
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [isFinishing, setIsFinishing] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const [stream, setStream] = React.useState<MediaStream | null>(null)

  // Setup stream (Audio Only)
  React.useEffect(() => {
    async function setupMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
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
  }, [])

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
      title: 'Strategic Insight Captured',
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
    if (confirm('Finalize session?')) {
        stopRecording()
        setIsFinishing(true)
    }
  }

  return (
    <div className="flex h-screen bg-[#0E0E10] text-white overflow-hidden relative font-sans p-6 lg:p-12">
      
      {/* 📱 ULTRA MINIMAL WORKSPACE */}
      <main className="max-w-2xl mx-auto w-full flex flex-col h-full relative">
        
        {/* TOP: SIMPLE BRAND / LOGO ONLY */}
        <header className="py-8 shrink-0">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-b-2 border-r-2 border-black rotate-45 mb-1 mr-1" />
            </div>
        </header>

        {/* CENTER: THE QUESTION & OPTIONS */}
        <div className="flex-1 flex flex-col justify-center space-y-12 pb-32">
            
            {/* HERO QUESTION */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h1 className="text-4xl lg:text-5xl font-medium tracking-tight leading-tight text-white/95">
                    {questions[questionIndex]}
                </h1>
            </div>

            {/* OPTIONS (FOLLOW UPS) */}
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
                {questions.map((q, i) => i !== questionIndex && (
                    <button 
                        key={i}
                        onClick={() => setQuestionIndex(i)}
                        className="w-full text-left p-5 rounded-[1.5rem] bg-white/[0.04] border border-white/[0.02] hover:bg-white/[0.08] transition-all text-sm font-medium text-white/40 hover:text-white"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>

        {/* BOTTOM: THE RECORDER PILL */}
        <div className="absolute inset-x-0 bottom-12 space-y-4 px-4 lg:px-0">
             {/* PAUSE/STOP UTILITY */}
             <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <button 
                    onClick={() => setIsPaused(!isPaused)} 
                    className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                    onClick={handleQuickCapture}
                    className="px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white"
                >
                    Log Insight
                </button>
             </div>

             {/* MAIN RECORDER BAR */}
             <div className="h-20 bg-[#1C1C1E] rounded-full border border-white/10 flex items-center px-8 justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className={cn("w-2 h-2 rounded-full", isRecording && !isPaused ? "bg-emerald-500 animate-pulse" : "bg-slate-700")} />
                    <span className="text-sm font-medium text-white/90">
                        {isPaused ? 'Recording Paused' : 'Listening...'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/30 tracking-widest">{formatDuration(recordingSeconds)}</span>
                    <button 
                        onClick={handleStopInterview}
                        className="w-12 h-12 bg-[#2BD789] text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                        <ArrowUp className="w-6 h-6 stroke-[3px]" />
                    </button>
                </div>
             </div>
        </div>

      </main>

      {/* FINISH OVERLAY */}
      {isFinishing && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500 text-center">
              <div className="w-20 h-20 border-2 border-white/5 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-emerald-500 rounded-full animate-spin border-t-transparent" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Processing Audio Archive...</p>
          </div>
      )}
    </div>
  )
}
