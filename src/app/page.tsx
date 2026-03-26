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
    <div className="space-y-10 pb-16 animate-in fade-in duration-700 max-w-6xl mx-auto px-6">
      
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Good Morning 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Review your discovery sessions and insights.
          </p>
        </div>
        <Link href="/setup">
          <button className="h-11 px-6 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 border border-slate-200">
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </Link>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl space-y-3 hover:shadow-sm transition-all group">
             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-800 transition-colors">
                <stat.icon className="w-5 h-5" />
             </div>
             <div>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{stat.title}</p>
             </div>
          </div>
        ))}
      </section>

      {/* SESSIONS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Sessions</h3>
          <Link href="/interviews" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition-all flex items-center gap-1">
            View Archive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.length > 0 ? (
            sessions.slice(0, 6).map((session) => (
              <Link key={session.id} href={session.status === 'Review' ? `/review?id=${session.id}` : session.status === 'Published' ? `/preview?id=${session.id}` : `/interview/${session.id}`} className="block">
                <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50/50 hover:shadow-sm hover:border-slate-200 transition-all flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:border-slate-200 group-hover:text-slate-800 transition-all shrink-0">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                                session.status === 'Review' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                session.status === 'Published' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                "bg-blue-50 text-blue-600 border-blue-100"
                            )}>{session.status}</span>
                            <span className="text-xs text-slate-400 font-medium">{session.date}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-700 truncate tracking-tight">{session.stakeholder?.name || 'Untitled Participant'}</h4>
                        <p className="text-xs text-slate-400 font-medium">{session.stakeholder?.company || 'N/A'} · {session.opportunities.length} Insights</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-800 transition-all shrink-0" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                 <Video className="w-8 h-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                 <p className="text-base font-bold text-slate-700">No sessions yet</p>
                 <p className="text-sm text-slate-400 font-medium">Start your first discovery session to populate this list.</p>
              </div>
              <Link href="/setup">
                <button className="mt-4 h-11 px-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all shadow-sm">
                  Start Your First Session
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
