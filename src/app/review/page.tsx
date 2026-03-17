'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, ArrowRight } from 'lucide-react'
import { useMosiStore, formatDuration } from '@/lib/store'

export default function ReviewPage() {
  const router = useRouter()
  const { sessions, updateSessionSummary, publishSession } = useMosiStore()
  
  const session = sessions.find(s => s.status === 'Review') || sessions[0]
  const [localSummary, setLocalSummary] = React.useState(session?.summary || '')

  const handlePublish = () => {
    if (session) {
      if (localSummary !== session.summary) updateSessionSummary(session.id, localSummary)
      publishSession(session.id)
      router.push('/preview')
    }
  }

  if (!session) return (
    <div className="flex h-screen items-center justify-center p-6 text-[#E0E2E0]/50">
      No archives available.
    </div>
  )

  return (
    <div className="flex flex-col h-full p-6 lg:p-12 space-y-12 animate-in fade-in duration-700">
      
      <header className="pt-8 flex justify-between items-center">
        <button onClick={() => router.push('/')} className="text-[#E0E2E0]/50 hover:text-[#E0E2E0] transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-right">
            <h2 className="text-sm font-medium text-[#E0E2E0]">{session.stakeholder.name}</h2>
            <p className="text-xs text-[#E0E2E0]/40">{session.stakeholder.company}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col space-y-12 max-w-2xl mx-auto w-full pb-20">
        
        {/* PLAYER */}
        <div className="p-6 bg-white/[0.04] rounded-[2rem] border border-white/[0.02]">
            <div className="flex items-center gap-4 mb-4">
                <button className="w-12 h-12 rounded-full bg-[#E0E2E0]/10 flex items-center justify-center hover:bg-[#E0E2E0]/20 transition-all">
                    <Play className="w-5 h-5 text-[#E0E2E0] ml-1" />
                </button>
                <div>
                   <p className="text-sm font-medium text-[#E0E2E0]">Session Audio</p>
                   <p className="text-xs text-[#E0E2E0]/40">{formatDuration(session.duration)} / Finalized</p>
                </div>
            </div>
            {session.recordingUrl && <audio src={session.recordingUrl} controls className="w-full opacity-50" />}
        </div>

        {/* INSIGHTS */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#E0E2E0]/50 uppercase tracking-widest pl-2">Captured Insights</h3>
            {session.opportunities.length > 0 ? (
                session.opportunities.map((opp, i) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/[0.02] rounded-3xl flex items-center justify-between">
                        <span className="text-sm font-medium text-[#E0E2E0]">{opp.title}</span>
                        <span className="text-[10px] uppercase font-mono text-[#20D08A]">{opp.tag}</span>
                    </div>
                ))
            ) : (
                <div className="text-sm text-[#E0E2E0]/30 pl-2">None logged.</div>
            )}
        </div>

        {/* SUMMARY */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#E0E2E0]/50 uppercase tracking-widest pl-2">Executive Summary</h3>
            <textarea 
                className="w-full min-h-[200px] p-6 bg-white/[0.04] rounded-[2rem] border border-white/[0.02] outline-none focus:border-[#20D08A]/50 text-base text-[#E0E2E0] resize-none"
                placeholder="Synthesize the findings here..."
                value={localSummary}
                onChange={e => setLocalSummary(e.target.value)}
            />
        </div>

      </div>

      <div className="pb-12 max-w-2xl mx-auto w-full">
         <button onClick={handlePublish} className="w-full h-16 bg-[#20D08A] text-[#161816] font-medium rounded-full flex items-center justify-between px-8 hover:bg-[#1bb87a] transition-all text-lg">
            Publish Preview <ArrowRight className="w-6 h-6" />
         </button>
      </div>
    </div>
  )
}
