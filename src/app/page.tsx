'use client'

import * as React from 'react'
import { useMosiStore } from '@/lib/store'
import { Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { sessions } = useMosiStore()

  return (
    <div className="flex flex-col h-full p-6 lg:p-12 space-y-12 animate-in fade-in duration-1000">
      
      <header className="pt-12">
        <h1 className="text-4xl font-medium tracking-tight text-[#E0E2E0] mb-2">
            MOSI AI
        </h1>
        <p className="text-sm font-medium text-[#E0E2E0]/50">
            Interview Intelligence
        </p>
      </header>

      <div className="flex-1 space-y-8">
        <h2 className="text-xl font-medium text-[#E0E2E0]/80">Recent Archives</h2>
        
        <div className="flex flex-col gap-3">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((session) => (
              <Link key={session.id} href={session.status === 'Review' ? '/review' : session.status === 'Published' ? '/preview' : `/interview/${session.id}`} className="block">
                <div className="p-5 bg-white/[0.04] border border-white/[0.02] rounded-3xl hover:bg-white/[0.08] transition-all flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-medium text-[#E0E2E0]">{session.stakeholder.name}</h4>
                        <p className="text-sm font-medium text-[#E0E2E0]/40">{session.stakeholder.company} · {session.date}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#E0E2E0]/30" />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 text-center text-sm font-medium text-[#E0E2E0]/40">
              No recent archives.
            </div>
          )}
        </div>
      </div>

      <div className="pb-12">
          <Link href="/setup">
              <button className="w-full h-16 bg-[#20D08A] text-[#161816] rounded-full font-medium text-base hover:bg-[#1bb87a] transition-all flex items-center justify-between px-6">
                  <span>Start New Interview</span>
                  <Plus className="w-6 h-6" />
              </button>
          </Link>
      </div>
    </div>
  )
}
