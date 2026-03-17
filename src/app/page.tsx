'use client'

import * as React from 'react'
import { StatsCard } from '@/components/ui/stats-card'
import { InterviewCard } from '@/components/ui/interview-card'
import { useMosiStore } from '@/lib/store'
import { 
  Users, Video, Lightbulb, CheckCircle2, Plus, 
  ArrowRight, Zap, ShieldCheck, Sparkles, Activity,
  Layers, Globe, TrendingUp, BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Home() {
  const { sessions } = useMosiStore()

  const totalInterviews = sessions.length
  const totalOpportunities = sessions.reduce((acc, s) => acc + s.opportunities.length, 0)
  const uniqueStakeholders = new Set(sessions.map(s => s.stakeholder.name)).size
  const pendingApprovals = sessions.filter(s => s.status === 'Review').length

  const stats = [
    { title: 'Archives', value: String(totalInterviews), icon: Video },
    { title: 'Insights', value: String(totalOpportunities), icon: Lightbulb },
    { title: 'Stakeholders', value: String(uniqueStakeholders), icon: Users },
    { title: 'Pipeline', value: String(pendingApprovals), icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 lg:p-12 space-y-16 animate-in fade-in duration-1000">
      
      {/* 🚀 ULTRA-SIMP HEADER */}
      <section className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-12 pt-12">
        <div className="space-y-8 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Mosi Intelligence Hub</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white/90">
                Precision<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Discovery</span><br/>
                Archive
            </h1>

            <p className="text-lg text-slate-500 font-bold uppercase tracking-tight max-w-md leading-relaxed">
                Transforming dialectic chaos into structured enterprise logic.
            </p>
        </div>

        <div className="shrink-0">
            <Link href="/setup">
                <button className="group h-32 w-32 lg:h-48 lg:w-48 bg-white text-black rounded-full font-black uppercase tracking-widest text-[10px] shadow-3xl shadow-white/5 hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-4 border-8 border-black">
                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                    <span>Initiate</span>
                </button>
            </Link>
        </div>
      </section>

      {/* 📊 MINIMAL ANALYTICS */}
      <section className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-4 hover:bg-white/[0.05] transition-all">
             <stat.icon className="w-6 h-6 text-blue-400 opacity-50" />
             <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{stat.title}</p>
             </div>
          </div>
        ))}
      </section>

      {/* 📜 DISCOVERY FEED */}
      <section className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Operational History</h3>
            <Link href="/interviews" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all flex items-center gap-2">
                All Manifests <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Link key={session.id} href={`/session/${session.id}`} className="block">
                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] hover:bg-white/[0.06] hover:border-white/10 transition-all flex items-center gap-8 group">
                    <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center border border-white/5 text-blue-400 shadow-2xl group-hover:scale-110 transition-transform">
                        <Layers className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border leading-none",
                                session.status === 'Review' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                                session.status === 'Published' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>{session.status}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">{session.date}</span>
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tight text-white/90 truncate">{session.stakeholder.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{session.stakeholder.company} · {session.opportunities.length} Insights</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-40 text-center space-y-8 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem]">
              <div className="w-32 h-32 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                 <Video className="w-12 h-12 text-slate-800" />
              </div>
              <div className="space-y-2">
                 <p className="text-2xl font-black uppercase tracking-tighter">Manifest Empty</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 max-w-[200px] mx-auto leading-relaxed">System standby. No discovery cycles initiated.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
