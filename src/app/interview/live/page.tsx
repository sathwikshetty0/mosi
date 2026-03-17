'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, Layers, Globe, ArrowUp, X
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'

const quadrants: { id: CEEDTag; questions: string[] }[] = [
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
  const [showAssetMenu, setShowAssetMenu] = React.useState(false)

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [activeEvidenceType, setActiveEvidenceType] = React.useState<'image' | 'video' | 'link' | 'file' | null>(null)

  React.useEffect(() => {
    async function setupMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        setStream(s)
        startRecording()
      } catch (err) {
        console.error("Mic access error:", err)
      }
    }
    setupMedia()
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  React.useEffect(() => {
    if (isRecording && stream && !mediaRecorderRef.current) {
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlobUrl(URL.createObjectURL(blob))
      }
      recorder.start()
      mediaRecorderRef.current = recorder
    } else if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }, [isRecording, stream])

  React.useEffect(() => {
    if (isFinishing && blobUrl) { finalizeSession(blobUrl); router.push('/review') }
  }, [isFinishing, blobUrl, finalizeSession, router])

  React.useEffect(() => {
    const timer = setInterval(() => { if (isRecording && !isPaused) tick() }, 1000)
    return () => clearInterval(timer)
  }, [isRecording, isPaused, tick])

  const currentQ = quadrants.find(q => q.id === activeQuadrant)!
  const questions = currentQ.questions

  const handleQuickCapture = () => {
    addOpportunity({
      timestamp: recordingSeconds, title: 'Strategic Insight', description: '',
      tag: activeQuadrant, paid: false, duration: '', skills: '',
      score: { clarity: 1, awareness: 1, attempts: 1, intensity: 1 },
      notes: '', evidence: [], status: 'Pending'
    })
  }

  const handleStopInterview = () => {
    if (confirm('Finalize this session?')) { stopRecording(); setIsFinishing(true) }
  }

  const handlePauseInterview = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) { mediaRecorderRef.current.resume(); setIsPaused(false) }
      else { mediaRecorderRef.current.pause(); setIsPaused(true) }
    }
  }

  const handleCaptureEvidence = (type: 'image' | 'video' | 'link' | 'file') => {
    if (type === 'link') {
      const url = prompt('Enter URL:', 'https://')
      if (url) addEvidence({ type, url, timestamp: recordingSeconds, title: 'Link' })
    } else {
      setActiveEvidenceType(type)
      fileInputRef.current?.click()
    }
    setShowAssetMenu(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activeEvidenceType) {
      addEvidence({ type: activeEvidenceType, url: URL.createObjectURL(file), timestamp: recordingSeconds, title: file.name })
    }
    setActiveEvidenceType(null)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] relative animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* 2X2 CEED QUADRANT SELECTOR */}
      <header className="py-6 space-y-4 shrink-0">
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Discovery Protocol</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-slate-300")} />
            <span className="text-xs font-mono font-bold text-slate-600 tracking-wider bg-slate-100 px-3 py-1 rounded-lg">{formatDuration(recordingSeconds)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {quadrants.map(q => (
            <button 
              key={q.id}
              onClick={() => { setActiveQuadrant(q.id); setQuestionIndex(0) }}
              className={cn(
                "h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 text-center flex items-center justify-center gap-2",
                activeQuadrant === q.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
              )}
            >
              {q.id}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN QUESTION */}
      <div className="flex-1 flex flex-col justify-center pb-48 space-y-10">
        <div className="space-y-3">
          <p className="text-xs font-medium text-blue-500">{activeQuadrant} Questions</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {questions[questionIndex]}
          </h1>
        </div>

        {/* FOLLOW-UP OPTIONS */}
        <div className="space-y-2">
          {questions.map((q, i) => i !== questionIndex && (
            <button 
              key={i}
              onClick={() => setQuestionIndex(i)}
              className="w-full text-left px-5 py-4 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-sm text-slate-500 hover:text-slate-800"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none z-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-3 items-center pointer-events-auto">
          
          {/* UTILITY ROW */}
          <div className="flex items-center gap-3">
            <button onClick={handlePauseInterview} className="h-9 px-4 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleQuickCapture} className="h-9 px-4 rounded-full border border-blue-200 bg-blue-50 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-all shadow-sm flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Log Insight
            </button>
          </div>

          {/* MAIN RECORDER BAR */}
          <div className="w-full h-14 bg-white rounded-full border border-slate-200 shadow-lg flex items-center px-3 gap-3">
            
            {/* PLUS BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowAssetMenu(!showAssetMenu)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  showAssetMenu ? "bg-slate-900 text-white rotate-45" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
              {showAssetMenu && (
                <div className="absolute bottom-14 left-0 bg-white border border-slate-200 p-2 rounded-xl shadow-xl w-44 animate-in slide-in-from-bottom-2">
                  {[
                    { id: 'image', icon: ImageIcon, label: 'Image' },
                    { id: 'video', icon: Video, label: 'Video' },
                    { id: 'link', icon: LinkIcon, label: 'Link' },
                    { id: 'file', icon: FileIcon, label: 'Document' },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleCaptureEvidence(item.id as any)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-all text-sm text-slate-600 hover:text-slate-900"
                    >
                      <item.icon className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STATUS TEXT */}
            <div className="flex-1 flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", isRecording && !isPaused ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              <span className="text-sm text-slate-400">
                {isPaused ? 'Paused' : 'Listening...'}
              </span>
            </div>

            {/* STOP / FINISH */}
            <button 
              onClick={handleStopInterview}
              className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all shadow-sm"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>
        </div>
      </div>

      {/* FINISH OVERLAY */}
      {isFinishing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500 text-center">
          <div className="w-16 h-16 border-2 border-slate-200 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-slate-900 rounded-full animate-spin border-t-transparent" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Processing Session...</p>
            <p className="text-sm text-slate-400 mt-1">Preparing your review dashboard.</p>
          </div>
        </div>
      )}
    </div>
  )
}
