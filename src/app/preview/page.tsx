'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Download } from 'lucide-react'
import { useMosiStore } from '@/lib/store'

export default function PreviewPage() {
  const { sessions, publishSession } = useMosiStore()
  const router = useRouter()
  
  const session = sessions.find(s => s.status === 'Review' || s.status === 'Published') || sessions[0]
  const [approved, setApproved] = React.useState(session?.status === 'Published')

  const handleApprove = () => {
    if (session) {
      publishSession(session.id)
      setApproved(true)
    }
  }

  if (!session) return (
    <div className="flex h-screen items-center justify-center p-6 text-[#E0E2E0]/50">
      No preview available.
    </div>
  )

  const { stakeholder, opportunities } = session

  return (
    <div className="flex flex-col h-full p-6 lg:p-12 space-y-12 animate-in fade-in duration-700">
      
      <header className="pt-8 flex justify-between items-center">
        <button onClick={() => router.push('/review')} className="text-[#E0E2E0]/50 hover:text-[#E0E2E0] transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-right">
            <h2 className="text-sm font-medium text-[#E0E2E0]">Stakeholder Preview</h2>
            <p className="text-xs text-[#E0E2E0]/40">{approved ? 'Approved' : 'Pending Review'}</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col space-y-12 max-w-2xl mx-auto w-full pb-20">
        
        {/* SUMMARY BLOCK */}
        <div className="space-y-6">
            <h1 className="text-4xl font-medium tracking-tight text-[#E0E2E0] leading-tight">
                Executive Synthesis for<br/>
                <span className="text-[#20D08A]">{stakeholder.company}</span>
            </h1>
            <p className="text-base font-medium text-[#E0E2E0]/70 leading-relaxed bg-white/[0.04] p-6 rounded-[2rem] border border-white/[0.02]">
                {session.summary || "No executive summary provided. The session focused on discovering key challenges and operational bottlenecks."}
            </p>
        </div>

        {/* INSIGHTS */}
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#E0E2E0]/50 uppercase tracking-widest pl-2">Strategic Discoveries</h3>
            <div className="grid grid-cols-1 gap-3">
                {opportunities.length > 0 ? (
                    opportunities.map((opp, i) => (
                        <div key={i} className="p-6 bg-white/[0.02] border border-white/[0.02] rounded-[2rem]">
                            <h4 className="text-base font-medium text-[#E0E2E0] mb-2">{opp.title}</h4>
                            <p className="text-sm text-[#E0E2E0]/50 leading-relaxed max-w-xl">
                                {opp.description || 'No detailed analysis provided for this insight.'}
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                               <span className="px-3 py-1 rounded-full bg-white/[0.05] text-[10px] uppercase font-mono text-[#E0E2E0]/70">{opp.tag}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-[#E0E2E0]/30 pl-2">No discoveries recorded.</div>
                )}
            </div>
        </div>

      </div>

      <div className="pb-12 max-w-2xl mx-auto w-full">
         {!approved ? (
             <button 
                onClick={handleApprove} 
                className="w-full h-16 bg-[#20D08A] text-[#161816] font-medium rounded-full flex items-center justify-between px-8 hover:bg-[#1bb87a] transition-all text-lg"
             >
                <span>Approve & Finalize</span>
                <Check className="w-6 h-6" />
             </button>
         ) : (
             <div className="w-full h-16 bg-white/[0.05] border border-white/10 text-[#E0E2E0] font-medium rounded-full flex items-center justify-between px-8 text-lg opacity-50">
                <span>Officially Approved</span>
                <Check className="w-6 h-6 text-[#20D08A]" />
             </div>
         )}
      </div>

    </div>
  )
}
