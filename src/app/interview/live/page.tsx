'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Square, Play, Pause, Plus, Image as ImageIcon, Video, Link as LinkIcon,
  File as FileIcon, Sparkles, Activity, Layers, Globe, ArrowUp, X,
  CheckCircle2, ArrowRight, MessageSquare
} from 'lucide-react'
import { useMosiStore, CEEDTag, formatDuration, DEFAULT_CEED_QUESTIONS, DEFAULT_NORMAL_QUESTIONS } from '@/lib/store'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { WaveformVisualizer } from '@/components/WaveformVisualizer'
import { motion, AnimatePresence } from 'framer-motion'

const QUADRANT_IDS: CEEDTag[] = ['Core', 'Efficiency', 'Expansion', 'Disrupt']

export default function LiveInterviewPage() {
  return (
    <React.Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-200 rounded-lg" />)}
        </div>
        <div className="pt-12 space-y-4">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-3/4 bg-slate-200 rounded" />
          <div className="h-6 w-1/2 bg-slate-200 rounded" />
        </div>
      </div>
    }>
      <LiveInterviewContent />
    </React.Suspense>
  )
}

function LiveInterviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuickMode = searchParams.get('quick') === '1'
  const quickType = searchParams.get('type') as 'ceed' | 'normal' | null
  const {
    isRecording, recordingSeconds, activeQuadrant, currentSession,
    startRecording, stopRecording, setActiveQuadrant, addOpportunity,
    addEvidence, finalizeSession, tick, startQuickSession, startQuickSessionWithType
  } = useMosiStore()

  const interviewType = currentSession?.interviewType || quickType || 'ceed'

  // If quick mode and no current session, set up based on type
  React.useEffect(() => {
    if (isQuickMode && !currentSession) {
      if (quickType) {
        startQuickSessionWithType(quickType)
      } else {
        startQuickSession()
      }
    }
  }, [isQuickMode, currentSession, startQuickSession, startQuickSessionWithType, quickType])

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
  const [isCaptured, setIsCaptured] = React.useState(false)

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

  // Determine best recording MIME type for this browser
  const getMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
    if (MediaRecorder.isTypeSupported('audio/aac')) return 'audio/aac'
    return '' // Let browser pick default
  }

  const mimeTypeRef = React.useRef(getMimeType())

  React.useEffect(() => {
    if (isRecording && stream && !mediaRecorderRef.current) {
      chunksRef.current = []
      const options: MediaRecorderOptions = {}
      if (mimeTypeRef.current) options.mimeType = mimeTypeRef.current
      
      const recorder = new MediaRecorder(stream, options)
      // Use the actual mimeType the recorder chose (may differ from requested)
      const actualMime = recorder.mimeType || mimeTypeRef.current || 'audio/webm'
      
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: actualMime })
        setBlobUrl(URL.createObjectURL(blob))
      }
      recorder.start()
      mediaRecorderRef.current = recorder
    } else if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
  }, [isRecording, stream])

  const finalizedRef = React.useRef(false)
  React.useEffect(() => {
    if (blobUrl && isFinishing && !finalizedRef.current) { 
      finalizedRef.current = true
      const newId = finalizeSession(blobUrl)
      router.push(`/review?id=${newId}`) 
    }
  }, [blobUrl, isFinishing, finalizeSession, router])

  React.useEffect(() => {
    let timer: any
    if (isRecording && !isPaused) {
      timer = setInterval(() => tick(), 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording, isPaused, tick])

  // Build questions based on interview type
  const sessionCeedQuestions = currentSession?.ceedQuestions ?? DEFAULT_CEED_QUESTIONS
  const sessionNormalQuestions = currentSession?.normalQuestions ?? DEFAULT_NORMAL_QUESTIONS
  
  const questions = React.useMemo(() => {
    if (interviewType === 'normal') {
      return sessionNormalQuestions.map(q => q.text)
    }
    return sessionCeedQuestions
      .filter(q => q.quadrant === activeQuadrant)
      .map(q => q.text)
  }, [interviewType, sessionCeedQuestions, sessionNormalQuestions, activeQuadrant])

  const toggleQuestionDone = (q: string) => {
    const isNowAnswered = !answeredQuestions.has(q)
    
    setAnsweredQuestions(prev => {
      const next = new Set(prev)
      if (next.has(q)) next.delete(q)
      else next.add(q)
      return next
    })

    // Auto-advance if it was marked as answered and there's a next question
    if (isNowAnswered && questionIndex < questions.length - 1) {
      setTimeout(() => {
        setQuestionIndex(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 400)
    }
  }

  const handleQuickCapture = () => {
    const logNumber = (currentSession?.opportunities?.length || 0) + 1
    addOpportunity({
      timestamp: recordingSeconds, title: `Log ${logNumber}`, description: '',
      tag: activeQuadrant, paid: false, duration: '', skills: '',
      score: { clarity: 1, awareness: 1, attempts: 1, intensity: 1 },
      notes: '', evidence: [], status: 'Pending'
    })
    setIsCaptured(true)
    setTimeout(() => setIsCaptured(false), 2000)
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
    if (!currentSession) {
      alert('Please start a session first.')
      setShowAssetMenu(false)
      return
    }

    if (type === 'link') {
      const url = prompt('Enter URL:', 'https://')
      if (url) addEvidence({ type, url, timestamp: recordingSeconds, title: 'Link' })
    } else {
      setActiveEvidenceType(type)
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
          // Set accept based on type for better mobile UX
          if (type === 'image') fileInputRef.current.accept = 'image/*'
          else if (type === 'video') fileInputRef.current.accept = 'video/*'
          else fileInputRef.current.accept = '*/*'
          fileInputRef.current.click()
        }
      }, 100)
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
    <div className="max-w-2xl mx-auto flex flex-col min-h-[calc(100dvh-8rem)] relative animate-in fade-in duration-700 px-4 sm:px-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
        capture="environment"
        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none" 
        onChange={handleFileChange} 
      />

      {/* 2X2 CEED QUADRANT SELECTOR */}
      <header className="py-4 sm:py-10 space-y-3 sm:space-y-6 shrink-0 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRecording && !isPaused && (
              <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">REC</span>
              </div>
            )}
            {isRecording && !isPaused && stream && (
              <WaveformVisualizer 
                stream={stream} 
                isActive={true} 
                width={60} 
                height={20}
                color="#f43f5e"
              />
            )}
          </div>
          <span className="text-sm font-mono font-black text-slate-800 tracking-wider bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">{formatDuration(recordingSeconds)}</span>
        </div>
        
        {interviewType === 'ceed' ? (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            {QUADRANT_IDS.map(qId => (
              <button 
                key={qId}
                onClick={() => { setActiveQuadrant(qId); setQuestionIndex(0) }}
                className={cn(
                  "h-10 sm:h-14 rounded-lg sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-[0.2em] transition-all border-2 text-center flex items-center justify-center",
                  activeQuadrant === qId 
                    ? 'bg-[#786BF9] text-white border-[#786BF9] shadow-lg' 
                    : 'bg-white text-[#8E959D] border-[#E8EAEB] active:bg-[#F1F2FB]'
                )}
              >
                {qId}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2">
            <div className="h-8 px-3 bg-[#2C64F9] text-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> Normal Interview
            </div>
            <span className="text-[10px] text-[#8E959D]">{questions.length} questions</span>
          </div>
        )}
      </header>

      {/* MAIN QUESTION */}
      <div className="flex-1 flex flex-col justify-center pb-44 sm:pb-48 space-y-6 sm:space-y-10 py-6 sm:py-0">
        {questions.length > 0 ? (
        <>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs font-bold text-[#786BF9] uppercase tracking-widest">
              {interviewType === 'ceed' ? `${activeQuadrant} Focus` : 'Interview Questions'}
            </p>
            {answeredQuestions.has(questions[Math.min(questionIndex, questions.length - 1)]) && (
              <span className="bg-emerald-50 text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Answered
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-700 leading-tight">
            {questions[Math.min(questionIndex, questions.length - 1)]}
          </h1>
          <button 
            onClick={() => toggleQuestionDone(questions[Math.min(questionIndex, questions.length - 1)])}
            className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all border",
              answeredQuestions.has(questions[Math.min(questionIndex, questions.length - 1)])
                ? "bg-slate-50 text-slate-400 border-slate-100"
                : "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
            )}
          >
            {answeredQuestions.has(questions[Math.min(questionIndex, questions.length - 1)]) ? "Done" : "Mark Answered"}
          </button>
        </div>

        {/* FOLLOW-UP OPTIONS */}
        <div className="space-y-1 sm:space-y-2">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Remaining Opportunities</p>
          {questions.map((q, i) => i !== questionIndex && (
            <button 
              key={i}
              onClick={() => { setQuestionIndex(i); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className={cn(
                "w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between group",
                answeredQuestions.has(q) 
                  ? "bg-slate-50/50 border-slate-100 opacity-60" 
                  : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50"
              )}
            >
              <span className={cn("text-xs sm:text-sm font-medium", answeredQuestions.has(q) ? "text-slate-400 line-through decoration-slate-300" : "text-slate-600")}>
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
        </>
        ) : (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-500">No questions configured for {activeQuadrant}</p>
            <p className="text-xs text-slate-400">Add questions in the setup wizard for this quadrant.</p>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-8 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pointer-events-none z-20 safe-area-bottom">
        
        {/* CAPTURE TOAST */}
        <AnimatePresence>
          {isCaptured && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               exit={{ opacity: 0, y: -20 }}
               className="pointer-events-none mb-3 mx-auto w-fit"
            >
              <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                 <CheckCircle2 className="w-3 h-3" /> Captured
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-2xl mx-auto flex flex-col gap-2 sm:gap-4 items-center pointer-events-auto">
          
          {/* UTILITY ROW */}
          <div className="flex items-center gap-2 w-full">
            {isRecording && (
              <button 
                onClick={handlePauseInterview} 
                className="h-10 px-4 flex-1 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button 
              onClick={handleQuickCapture} 
              disabled={!isRecording || isUploading}
              className={cn(
                "h-10 px-6 flex-[2] rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-90",
                isCaptured ? "bg-emerald-600 border-emerald-600 text-white" :
                (isRecording && !isUploading) ? "border-slate-800 bg-slate-800 text-white" : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
              )}
            >
              <Activity className={cn("w-3.5 h-3.5", isCaptured && "animate-bounce")} /> 
              {isCaptured ? '✓' : 'Log'}
            </button>
          </div>

          {/* MAIN RECORDER BAR */}
          <div className="w-full py-2.5 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-full border border-slate-200 shadow-lg flex items-center px-3 sm:px-4 gap-3 relative">
            
            {/* START / STOP ACTION */}
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all shadow-xl shadow-blue-100 shrink-0"
              >
                <Play className="w-6 h-6 fill-current ml-1" />
              </button>
            ) : (
              <button 
                onClick={handleStopInterview}
                className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 transition-all shadow-xl shadow-red-100 shrink-0"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}

            {/* STATUS & TIME */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isRecording && !isPaused ? "bg-red-500 animate-pulse" : "bg-slate-300")} />
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800 truncate">
                  {!isRecording ? 'Session Ready' : isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
              {isRecording && (
                <span className="text-[10px] font-mono font-black text-slate-400 mt-0.5 tracking-wider">
                  ELAPSED: {formatDuration(recordingSeconds)}
                </span>
              )}
            </div>

            {/* ASSET BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowAssetMenu(!showAssetMenu)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm border-2 shrink-0",
                  showAssetMenu ? "bg-slate-900 border-slate-900 text-white rotate-45" : 
                  "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Plus className="w-6 h-6" />
              </button>

              <AnimatePresence>
                {showAssetMenu && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[25] pointer-events-auto sm:hidden"
                      onClick={() => setShowAssetMenu(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-16 right-0 bg-white border border-slate-100 p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-56 z-[30] pointer-events-auto overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Attach Insight Asset</p>
                      </div>
                      {[
                        { id: 'image', icon: ImageIcon, label: 'Capture Image' },
                        { id: 'video', icon: Video, label: 'Capture Video' },
                        { id: 'link', icon: LinkIcon, label: 'Attach Link' },
                        { id: 'file', icon: FileIcon, label: 'Attach File' },
                      ].map(item => (
                        <button 
                          key={item.id}
                          onClick={() => handleCaptureEvidence(item.id as any)}
                          className="w-full flex items-center gap-3 px-4 py-4 sm:py-3 rounded-2xl hover:bg-blue-50 text-left transition-all text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-blue-600 group"
                        >
                          <item.icon className="w-5 h-5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-blue-500" />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* FINISH OVERLAY */}
      {isFinishing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-200 text-center">
          <div className="w-16 h-16 border-2 border-slate-200 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-slate-700 rounded-full animate-spin border-t-transparent" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-700">Processing Session...</p>
            <p className="text-sm text-slate-400 mt-1">Preparing your review dashboard.</p>
          </div>
        </div>
      )}
    </div>
  )
}
