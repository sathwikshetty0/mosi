'use client'

import { StatsCard } from '@/components/ui/stats-card'
import { InterviewCard } from '@/components/ui/interview-card'
import { useMosiStore } from '@/lib/store'
import { 
  Users, 
  Video, 
  Lightbulb, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  ArrowRight,
  Zap,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Activity,
  BarChart3
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
    { title: 'Session Archives', value: String(totalInterviews), icon: Video, trend: { value: 12, label: 'vs last cycle' } },
    { title: 'Strategic Insights', value: String(totalOpportunities), icon: Lightbulb, trend: { value: 8, label: 'efficiency gain' } },
    { title: 'Stakeholder Base', value: String(uniqueStakeholders), icon: Users, trend: { value: 24, label: 'expansion rate' } },
    { title: 'Review Pipeline', value: String(pendingApprovals), icon: CheckCircle2, trend: { value: -5, label: 'latency' } }
  ]

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-1000">
      
      {/* 🚀 ELITE COMMAND CENTER HEADER */}
      <div className="relative group mx-2 lg:mx-0">
         <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
         <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-100 shadow-3xl shadow-slate-200/50 overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full -mr-48 -mt-48 opacity-30 blur-[100px] pointer-events-none animate-pulse-soft" />
            
            <div className="relative z-10 space-y-8 max-w-3xl">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl shadow-xl shadow-slate-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Command Active</span>
                 </div>
                 <div className="h-px w-12 bg-slate-100" />
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Operational Cycle 2026.03</p>
              </div>
              
              <div className="space-y-2">
                 <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase">
                   Precision <br/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900">Discovery</span> <br/>
                   Engine
                 </h1>
              </div>

              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest max-w-xl leading-relaxed">
                Transforming complex stakeholder dialogues into structured, actionable strategic archives with synthetic intelligence.
              </p>
            </div>

            <div className="relative z-10 shrink-0 flex flex-col gap-4">
               <Link href="/setup">
                  <button id="start-interview-btn" className="group h-24 px-12 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    <Plus className="w-6 h-6" />
                    Initiate Discovery
                  </button>
               </Link>
               <div className="flex items-center justify-center gap-6">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-xl" />)}
                  </div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">400+ Sessions Processed</p>
               </div>
            </div>
         </div>
      </div>

      {/* 📊 GLOBAL ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <StatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* 🧭 CEED STRATEGY ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
         <div className="lg:col-span-8 bg-slate-900 rounded-[3.5rem] p-10 lg:p-16 relative overflow-hidden shadow-3xl shadow-slate-200">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full gap-16">
               <div className="space-y-8 flex-1">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                     <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">CEED Framework Protocol</p>
                  </div>
                  <h3 className="text-white text-4xl lg:text-5xl font-black tracking-tighter leading-[0.9] uppercase max-w-xl">
                     Structuring the <br/>future of <span className="text-blue-400 italic">Enterprise</span> logic.
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {[
                        { label: 'Core', color: 'bg-blue-600', icon: ShieldCheck, desc: 'FOUNDATION' },
                        { label: 'Efficiency', color: 'bg-amber-500', icon: Zap, desc: 'VELOCITY' },
                        { label: 'Expansion', color: 'bg-emerald-500', icon: TrendingUp, desc: 'GROWTH' },
                        { label: 'Disrupt', color: 'bg-rose-500', icon: TrendingDown, desc: 'INNOVATION' },
                     ].map(item => (
                        <div key={item.label} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 group/item hover:bg-white/10 hover:border-white/20 transition-all border-2 border-transparent">
                           <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-transform group-hover/item:scale-110", item.color)}>
                              <item.icon className="w-7 h-7" />
                           </div>
                           <div className="text-center space-y-1">
                              <p className="text-white text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                              <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="flex items-center justify-between border-t border-white/10 pt-8">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">System Load: Nominal</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Synthesis Rate: 98.4%</span>
                     </div>
                  </div>
                  <button className="flex items-center gap-3 text-white/40 hover:text-white transition-all group/link font-black text-[10px] uppercase tracking-widest">
                     Explore Framework <ArrowRight className="w-4 h-4 group-hover/link:translate-x-2 transition-transform" />
                  </button>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 bg-white rounded-[3.5rem] p-12 border-2 border-slate-50 shadow-2xl flex flex-col justify-between group hover:border-slate-900 transition-all duration-700">
            <div className="space-y-8">
               <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  <Sparkles className="w-8 h-8" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Synthetic <br/>Artifacts</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-[1.8]">
                     Autonomous generation of technical blueprints, PRDs, and market analysis from your live discovery feed.
                  </p>
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">3 New Manifests Ready</span>
               </div>
               <button className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-blue-600 shadow-xl shadow-slate-200">
                  Vault Access
               </button>
            </div>
         </div>
      </div>

      {/* 📜 RECENT DISCOVERY FEED */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
             <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Active Archives</h3>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Latest Stakeholder Engagements</p>
             </div>
          </div>
          <Link href="/interviews" className="px-6 py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-900 hover:bg-slate-900 hover:text-white uppercase tracking-widest transition-all flex items-center gap-2 group">
            All Records <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {sessions.length > 0 ? (
            sessions.slice(0, 4).map((session) => (
              <InterviewCard
                key={session.id}
                id={session.id}
                stakeholder={session.stakeholder.name}
                company={session.stakeholder.company}
                sector={session.stakeholder.sector}
                date={session.date}
                status={session.status}
                opportunityCount={session.opportunities.length}
              />
            ))
          ) : (
            <div className="col-span-full border-4 border-dashed border-slate-100 rounded-[4rem] py-32 text-center space-y-8 bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-3xl">
                 <Video className="w-12 h-12 text-slate-200" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Manifest Empty</h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[240px] mx-auto leading-loose">No strategic archives have been synthesized in the current cycle.</p>
              </div>
              <Link href="/setup">
                 <button className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-200">Initiate First Discovery →</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
