'use client'

import { useMosiStore } from '@/lib/store'
import { 
  Users, Video, Lightbulb, Activity, Plus, 
  ArrowRight, Layers, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Home() {
  const { sessions } = useMosiStore()

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
    <div className="space-y-10 pb-16 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Good Morning 👋
          </h1>
          <p className="text-sm text-slate-500">
            Your discovery dashboard. Start a new session or review existing ones.
          </p>
        </div>
        <Link href="/setup">
          <button className="h-12 px-6 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </Link>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl space-y-3 hover:shadow-md transition-all">
             <stat.icon className="w-5 h-5 text-slate-400" />
             <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
             </div>
          </div>
        ))}
      </section>

      {/* SESSIONS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Recent Sessions</h3>
          <Link href="/interviews" className="text-sm text-slate-400 hover:text-slate-900 transition-all flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <Link key={session.id} href={session.status === 'Review' ? '/review' : session.status === 'Published' ? '/preview' : `/interview/${session.id}`} className="block">
                <div className="p-6 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:border-slate-200 transition-all flex items-center gap-5 group">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                                "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md",
                                session.status === 'Review' ? "bg-amber-50 text-amber-600" : 
                                session.status === 'Published' ? "bg-emerald-50 text-emerald-600" :
                                "bg-blue-50 text-blue-600"
                            )}>{session.status}</span>
                            <span className="text-xs text-slate-400">{session.date}</span>
                        </div>
                        <h4 className="text-base font-semibold text-slate-900 truncate">{session.stakeholder?.name || 'Untitled Participant'}</h4>
                        <p className="text-xs text-slate-400">{session.stakeholder?.company || 'N/A'} · {session.opportunities.length} insights</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all shrink-0" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                 <Video className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                 <p className="text-base font-semibold text-slate-900">No sessions yet</p>
                 <p className="text-sm text-slate-400 mt-1">Start your first discovery session to begin.</p>
              </div>
              <Link href="/setup">
                <button className="mt-4 h-10 px-5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all">
                  Start Session →
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
