'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, Layers, Globe, ArrowUp, X,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration } from '@/lib/store'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

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
  const [answeredQuestions, setAnsweredQuestions] = React.useState<Set<string>>(new Set())
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [isFinishing, setIsFinishing] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [showAssetMenu, setShowAssetMenu] = React.useState(false)
  const finishingSessionIdRef = React.useRef<string | null>(null)

  const { setRecordingUrl } = useMosiStore()

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [activeEvidenceType, setActiveEvidenceType] = React.useState<'image' | 'video' | 'link' | 'file' | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    async function setupMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        setStream(s)
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
    if (blobUrl && isFinishing) { 
      finalizeSession(blobUrl)
      router.push('/review') 
    }
  }, [blobUrl, isFinishing, finalizeSession, router])

  React.useEffect(() => {
    let timer: any
    if (isRecording && !isPaused) {
      timer = setInterval(() => tick(), 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording, isPaused, tick])

  const toggleQuestionDone = (q: string) => {
    setAnsweredQuestions(prev => {
      const next = new Set(prev)
      if (next.has(q)) next.delete(q)
      else next.add(q)
      return next
    })
  }

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
    stopRecording()
    setIsFinishing(true)
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activeEvidenceType) {
      setIsUploading(true)
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('evidence')
          .upload(fileName, file)

        if (error) throw error

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName)
            
          addEvidence({ 
            type: activeEvidenceType, 
            url: publicUrl, 
            timestamp: recordingSeconds, 
            title: file.name 
          })
        }
      } catch (err) {
        console.error('Evidence upload failed:', err)
        // Fallback to local blob if supabase fails or is not configured
        addEvidence({ 
          type: activeEvidenceType, 
          url: URL.createObjectURL(file), 
          timestamp: recordingSeconds, 
          title: file.name 
        })
      } finally {
        setIsUploading(false)
      }
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{activeQuadrant} Protocol</p>
            {answeredQuestions.has(questions[questionIndex]) && (
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Answered
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {questions[questionIndex]}
          </h1>
          <button 
            onClick={() => toggleQuestionDone(questions[questionIndex])}
            className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all border",
              answeredQuestions.has(questions[questionIndex])
                ? "bg-slate-50 text-slate-400 border-slate-100"
                : "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
            )}
          >
            {answeredQuestions.has(questions[questionIndex]) ? "Done" : "Mark Answered"}
          </button>
        </div>

        {/* FOLLOW-UP OPTIONS */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Remaining Opportunities</p>
          {questions.map((q, i) => i !== questionIndex && (
            <button 
              key={i}
              onClick={() => setQuestionIndex(i)}
              className={cn(
                "w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group",
                answeredQuestions.has(q) 
                  ? "bg-slate-50/50 border-slate-100 opacity-60" 
                  : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50"
              )}
            >
              <span className={cn("text-sm font-medium", answeredQuestions.has(q) ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600")}>
                {q}
              </span>
              {answeredQuestions.has(q) ? (
                <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              ) : (
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none z-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-3 items-center pointer-events-auto">
          
          {/* UTILITY ROW */}
          <div className="flex items-center gap-3">
            {isRecording && (
              <button 
                onClick={handlePauseInterview} 
                className="h-9 px-4 rounded-full border border-slate-200 bg-white text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button 
              onClick={handleQuickCapture} 
              disabled={!isRecording || isUploading}
              className={cn(
                "h-9 px-4 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm flex items-center gap-2",
                (isRecording && !isUploading) ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
              )}
            >
              <Activity className="w-4 h-4" /> Log Insight
            </button>
            {isUploading && (
              <span className="text-[9px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Uploading Media...</span>
            )}
          </div>

          {/* MAIN RECORDER BAR */}
          <div className="w-full h-16 bg-white rounded-full border border-slate-200 shadow-2xl flex items-center px-4 gap-4">
            
            {/* START / STOP ACTION */}
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 active:scale-90 transition-all shadow-lg"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button 
                onClick={handleStopInterview}
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 transition-all shadow-lg animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}

            {/* STATUS & TIME */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-slate-200")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {!isRecording ? 'Session Ready' : isPaused ? 'Paused' : 'Recording Live'}
                </span>
              </div>
              {isRecording && (
                <span className="text-xs font-mono font-bold text-slate-400 mt-0.5 tracking-tight">
                  T-PLUS {formatDuration(recordingSeconds)}
                </span>
              )}
            </div>

            {/* ASSET BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowAssetMenu(!showAssetMenu)}
                disabled={!isRecording}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  showAssetMenu ? "bg-slate-900 text-white rotate-45" : 
                  isRecording ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-slate-50 text-slate-200 cursor-not-allowed"
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
              {showAssetMenu && (
                <div className="absolute bottom-16 right-0 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xl w-48 animate-in slide-in-from-bottom-4">
                  {[
                    { id: 'image', icon: ImageIcon, label: 'Capture Image' },
                    { id: 'video', icon: Video, label: 'Capture Video' },
                    { id: 'link', icon: LinkIcon, label: 'Attach Link' },
                    { id: 'file', icon: FileIcon, label: 'Attach File' },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleCaptureEvidence(item.id as any)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900"
                    >
                      <item.icon className="w-4 h-4 text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FINISH OVERLAY */}
      {isFinishing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-200 text-center">
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
