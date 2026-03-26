'use client'

import * as React from 'react'
import { useMosiStore } from '@/lib/store'
import { 
  Users, Video, Lightbulb, Activity, Plus, 
  ArrowRight, Layers, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Home() {
  const { sessions, fetchSessions } = useMosiStore()

  React.useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const totalInterviews = sessions.length
  const totalOpportunities = sessions.reduce((acc, s) => acc + s.opportunities.length, 0)
  const uniqueStakeholders = new Set(sessions.map(s => s.stakeholder?.name || 'Unknown')).size
  const pendingApprovals = sessions.filter(s => s.status === 'Review').length

  const stats = [
    { title: 'Sessions', value: String(totalInterviews), icon: Video },
    { title: 'Insights', value: String(totalOpportunities), icon: Lightbulb },
    { title: 'Stakeholders', value: String(uniqueStakeholders), icon: Users },
    { title: 'In Review', value: String(pendingApprovals), icon: Activity }
  ]

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-700 max-w-5xl mx-auto px-6">
      
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">
            Discovery Protocol
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Executive Control Tower / {sessions.length} Active Sessions
          </p>
        </div>
        <Link href="/setup">
          <button className="h-10 px-6 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-100">
            <Plus className="w-3.5 h-3.5" />
            New Protocol
          </button>
        </Link>
      </section>

      {/* STATS - COMPACT */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-2 hover:shadow-sm transition-all group">
             <stat.icon className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-colors" />
             <div>
                <p className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{stat.title}</p>
             </div>
          </div>
        ))}
      </section>

      {/* SESSIONS - DENSE LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Recent Executions</h3>
          <Link href="/interviews" className="text-[10px] font-black text-slate-400 hover:text-slate-800 transition-all flex items-center gap-1 uppercase tracking-widest">
            Log Archive <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {sessions.length > 0 ? (
            sessions.slice(0, 5).map((session) => (
              <Link key={session.id} href={session.status === 'Review' ? `/review?id=${session.id}` : session.status === 'Published' ? `/preview?id=${session.id}` : `/interview/${session.id}`} className="block">
                <div className="px-5 py-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 hover:border-slate-200 transition-all flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:border-slate-200 group-hover:text-slate-800 transition-all shrink-0">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                session.status === 'Review' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                session.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-blue-50 text-blue-600 border-blue-100"
                            )}>{session.status}</span>
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{session.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 truncate tracking-tight">{session.stakeholder?.name || 'Untitled Participant'}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{session.stakeholder?.company || 'N/A'} · {session.opportunities.length} insights</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-800 transition-all shrink-0" />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-16 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-3xl">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                 <Video className="w-6 h-6 text-slate-200" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">No Active Protocols</p>
                 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Initiate first session to populate dashboard.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
