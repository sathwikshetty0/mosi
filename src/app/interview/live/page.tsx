'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, Layers, Globe, ArrowUp, X, Mic
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

  // Real-time audio levels for visual feedback
  const [audioLevel, setAudioLevel] = React.useState(0)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    async function setupMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        setStream(s)
        startRecording()

        // Setup Audio Analyser
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(s)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        
        audioContextRef.current = audioCtx
        analyserRef.current = analyser

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i]
            }
            const average = sum / bufferLength
            setAudioLevel(average)
            animationFrameRef.current = requestAnimationFrame(updateLevel)
          }
        }
        updateLevel()

      } catch (err) {
        console.error("Mic access error:", err)
      }
    }
    setupMedia()
    return () => { 
      stream?.getTracks().forEach(t => t.stop())
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
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
    stopRecording()
    setIsFinishing(true)
  }

  const handlePauseInterview = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) { 
        mediaRecorderRef.current.resume()
        setIsPaused(false) 
        if (audioContextRef.current) audioContextRef.current.resume()
      }
      else { 
        mediaRecorderRef.current.pause()
        setIsPaused(true) 
        if (audioContextRef.current) audioContextRef.current.suspend()
      }
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
            <span className="text-xs font-mono font-bold text-slate-600 tracking-wider bg-slate-100 px-3 py-1 rounded-lg">ACTIVE SESSION</span>
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

      {/* GIANT TIMESTAMP & VISUAL WAVEFORM */}
      <div className="flex flex-col items-center py-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100/50 shadow-sm mb-6">
        <div className="relative h-24 flex items-center justify-center w-full">
            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-blue-500 rounded-full transition-all duration-75" 
                        style={{ height: `${Math.max(10, (audioLevel * (0.5 + Math.random() * 0.5)))}%` }}
                    />
                ))}
            </div>
            <h2 className="text-6xl font-black font-mono tracking-tighter text-slate-900 z-10 animate-in zoom-in duration-500">
                {formatDuration(recordingSeconds)}
            </h2>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
            {isPaused ? 'Recording Paused' : 'Listening Context...'}
        </p>
      </div>

      {/* MAIN QUESTION */}
      <div className="flex-1 flex flex-col justify-center pb-48 space-y-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{activeQuadrant} EXPLORATION</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-[1.15]">
            {questions[questionIndex]}
          </h1>
        </div>

        {/* FOLLOW-UP OPTIONS */}
        <div className="space-y-2">
          {questions.map((q, i) => i !== questionIndex && (
            <button 
              key={i}
              onClick={() => setQuestionIndex(i)}
              className="w-full text-left px-5 py-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-sm font-medium text-slate-500 hover:text-slate-900 group flex items-start gap-4"
            >
              <div className="w-5 h-5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                 <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-400" />
              </div>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-10 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none z-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-4 items-center pointer-events-auto">
          
          {/* UTILITY ROW */}
          <div className="flex items-center gap-3">
            <button onClick={handlePauseInterview} className="h-10 px-6 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2">
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={handleQuickCapture} className="h-10 px-6 rounded-2xl border border-blue-200 bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2">
              <Activity className="w-4 h-4" /> Log Insight
            </button>
          </div>

          {/* MAIN RECORDER BAR */}
          <div className="w-full h-16 bg-white rounded-3xl border border-slate-200 shadow-2xl flex items-center px-4 gap-4">
            
            {/* PLUS BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowAssetMenu(!showAssetMenu)}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                  showAssetMenu ? "bg-slate-900 text-white rotate-45" : "bg-slate-100 text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent"
                )}
              >
                <Plus className="w-5 h-5" />
              </button>
              {showAssetMenu && (
                <div className="absolute bottom-16 left-0 bg-white border border-slate-200 p-2 rounded-2xl shadow-2xl w-48 animate-in slide-in-from-bottom-2">
                  {[
                    { id: 'image', icon: ImageIcon, label: 'Capture Image' },
                    { id: 'video', icon: Video, label: 'Video Clip' },
                    { id: 'link', icon: LinkIcon, label: 'External Link' },
                    { id: 'file', icon: FileIcon, label: 'Upload Document' },
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleCaptureEvidence(item.id as any)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-all text-xs font-bold text-slate-600 hover:text-slate-900 group"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STATUS TEXT & LEVEL */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex gap-0.5 items-center">
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={i} 
                        className={cn("w-1 rounded-full transition-all duration-100", 
                            isPaused ? "bg-slate-200 h-1" : "bg-emerald-500"
                        )}
                        style={{ height: isPaused ? '4px' : `${4 + Math.random() * (audioLevel / 5)}px` }}
                    />
                ))}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isPaused ? 'Recording Paused' : 'Live Archive Active'}
              </span>
            </div>

            {/* STOP / FINISH */}
            <button 
              onClick={handleStopInterview}
              className="h-10 px-5 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-100 group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Finish</span>
              <ArrowUp className="w-4 h-4 stroke-[3px] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* FINISH OVERLAY */}
      {isFinishing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500 text-center p-6">
          <div className="w-24 h-24 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-slate-900 rounded-full animate-spin border-t-transparent" />
            <Mic className="w-8 h-8 text-slate-900" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">Finalizing Archive</h2>
            <p className="text-sm text-slate-400 font-medium">Synthesizing insights and preparing review dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}
