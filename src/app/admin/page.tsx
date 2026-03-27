'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  Users, Video, Search, ShieldCheck, 
  Zap, Activity, UserCheck, Inbox,
  BarChart3, Clock, TrendingUp, Globe, CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SessionData {
  id: string
  status: string
  date: string
  duration: number
  summary?: string
  user_id?: string
  recording_url?: string
  stakeholders: { id?: string; name: string; role: string; company: string; sector: string; employees?: string; geography?: string } | null
  opportunities: { id: string; tag: string; title: string }[]
  evidence: { id: string }[]
}

interface ProfileData {
  id: string
  full_name: string
  role: string
  avatar_url?: string
  updated_at: string
}

const statusConfig: Record<string, { pill: string; label: string }> = {
  Scheduled: { pill: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'Scheduled' },
  Recording: { pill: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Live' },
  Review:    { pill: 'bg-amber-50 text-amber-600 border-amber-100', label: 'In Review' },
  Published: { pill: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Published' },
}

type Tab = 'overview' | 'sessions' | 'users' | 'stakeholders'

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(urlTab || 'overview')
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  // Sync tab with URL param
  useEffect(() => {
    if (urlTab && ['overview', 'sessions', 'users', 'stakeholders'].includes(urlTab)) {
      setTab(urlTab)
    }
  }, [urlTab])


  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/sessions')
        const data = await res.json()
        if (data.sessions) setSessions(data.sessions)
        if (data.profiles) setProfiles(data.profiles)
        if (data.stakeholders) setStakeholders(data.stakeholders)
      } catch (e) {
        console.error('Admin data fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = sessions.length
    const insights = sessions.reduce((a, s) => a + (s.opportunities?.length || 0), 0)
    const published = sessions.filter(s => s.status === 'Published').length
    const inReview = sessions.filter(s => s.status === 'Review').length
    const publishRate = total ? Math.round((published / total) * 100) : 0
    // Use the explicit stakeholder list from DB
    const totalStakeholders = stakeholders.length
    return { total, insights, published, inReview, publishRate, stakeholders: totalStakeholders }
  }, [sessions, stakeholders])

  const userStats = useMemo(() =>
    profiles.map(p => {
      const us = sessions.filter(s => s.user_id === p.id)
      return { ...p, sessionCount: us.length, insightCount: us.reduce((a, s) => a + (s.opportunities?.length || 0), 0), publishedCount: us.filter(s => s.status === 'Published').length }
    }).sort((a, b) => b.sessionCount - a.sessionCount)
  , [profiles, sessions])

  const filteredSessions = useMemo(() =>
    sessions.filter(s => {
      const q = search.toLowerCase()
      const matchSearch = (s.stakeholders?.name || '').toLowerCase().includes(q) || (s.stakeholders?.company || '').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchStatus
    })
  , [sessions, search, statusFilter])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'sessions', label: 'All Sessions' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'users', label: 'Users' },
  ]

  // Full stakeholders list with merged session counts
  const allStakeholdersList = useMemo(() => {
    return stakeholders.map(sh => {
      const shSessions = sessions.filter(s => (s.stakeholders?.name === sh.name && s.stakeholders?.company === sh.company) || s.stakeholders?.id === sh.id)
      return { 
        ...sh, 
        sessionCount: shSessions.length, 
        sessions: shSessions 
      }
    }).sort((a, b) => b.sessionCount - a.sessionCount)
  }, [stakeholders, sessions])

  const kpis = [
    { label: 'Total Sessions', val: stats.total, icon: Video, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-100' },
    { label: 'Total Insights', val: stats.insights, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Stakeholders', val: stats.stakeholders, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Published', val: stats.published, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'In Review', val: stats.inReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Publish Rate', val: `${stats.publishRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-slate-50/30 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {tab === 'overview' && 'Platform Overview'}
              {tab === 'sessions' && 'All Sessions'}
              {tab === 'stakeholders' && 'All Stakeholders'}
              {tab === 'users' && 'Researchers'}
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.2em]">
              {tab === 'overview' && `${stats.total} total sessions · ${stats.stakeholders} unique stakeholders`}
              {tab === 'sessions' && `${filteredSessions.length} sessions in repository`}
              {tab === 'stakeholders' && `${allStakeholdersList.length} unique stakeholders profiled`}
              {tab === 'users' && `${profiles.length} registered researchers`}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all',
                tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ─── OVERVIEW ─── */}
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {kpis.map(k => (
                    <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-sm hover:border-slate-200 transition-all group">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-4 border', k.bg, k.border)}>
                        <k.icon className={cn('w-4 h-4', k.color)} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                      <h3 className="text-2xl font-black text-slate-800">{k.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Two-col layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Researchers */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-500" /> Top Researchers
                      </h2>
                      <button onClick={() => setTab('users')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">
                        View all →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {userStats.slice(0, 6).map((u, i) => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border',
                              i === 0 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              i === 1 ? 'bg-slate-100 text-slate-500 border-slate-200' :
                              'bg-white text-slate-400 border-slate-100'
                            )}>
                              {u.full_name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">{u.full_name || 'Anonymous'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-right">
                            <div>
                              <p className="text-base font-black text-slate-800">{u.sessionCount}</p>
                              <p className="text-[9px] text-slate-400 uppercase">Sessions</p>
                            </div>
                            <div>
                              <p className="text-base font-black text-blue-600">{u.insightCount}</p>
                              <p className="text-[9px] text-slate-400 uppercase">Insights</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userStats.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">No users registered yet</p>}
                    </div>
                  </div>

                  {/* Recent Sessions */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Recent Activity
                      </h2>
                      <button onClick={() => setTab('sessions')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">
                        View all →
                      </button>
                    </div>
                    <div className="space-y-2">
                      {sessions.slice(0, 7).map(s => {
                        const cfg = statusConfig[s.status] || statusConfig.Review
                        return (
                          <Link key={s.id} href={s.status === 'Review' ? `/review?id=${s.id}` : `/preview?id=${s.id}`}
                            className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              <Video className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-700 truncate">{s.stakeholders?.name || 'Unknown Stakeholder'}</p>
                              <p className="text-[11px] text-slate-400 truncate">{s.stakeholders?.company || 'N/A'} · {s.date}</p>
                            </div>
                            <span className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-widest shrink-0', cfg.pill)}>
                              {cfg.label}
                            </span>
                          </Link>
                        )
                      })}
                      {sessions.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">No sessions recorded yet</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── ALL SESSIONS ─── */}
            {tab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by stakeholder or company..."
                      className="w-full h-11 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['all', 'Scheduled', 'Review', 'Published'].map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                          statusFilter === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">{filteredSessions.length} sessions in repository</p>

                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5">Stakeholder</th>
                        <th className="px-6 py-5">Company / Sector</th>
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5">Insights</th>
                        <th className="px-6 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSessions.map(s => {
                        const cfg = statusConfig[s.status] || statusConfig.Review
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-sm font-black text-slate-500 shrink-0">
                                  {(s.stakeholders?.name || 'A')[0]}
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors text-sm">
                                  {s.stakeholders?.name || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-600">{s.stakeholders?.company || '—'}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">{s.stakeholders?.sector || '—'}</p>
                            </td>
                            <td className="px-6 py-5 text-sm text-slate-500 font-medium">{s.date}</td>
                            <td className="px-6 py-5">
                              <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest', cfg.pill)}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-sm font-bold text-slate-700">{s.opportunities?.length || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link href={s.status === 'Review' ? `/review?id=${s.id}` : `/preview?id=${s.id}`}
                                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:shadow-sm inline-block"
                              >
                                Open →
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredSessions.length === 0 && (
                    <div className="py-24 text-center space-y-3">
                      <Inbox className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No sessions match your filter</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── USERS ─── */}
            {tab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">{profiles.length} registered researchers</p>

                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5">Researcher</th>
                        <th className="px-6 py-5">Role</th>
                        <th className="px-6 py-5">Sessions</th>
                        <th className="px-6 py-5">Insights</th>
                        <th className="px-6 py-5">Published</th>
                        <th className="px-6 py-5">Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {userStats.map((u, i) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border shrink-0',
                                i === 0 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                i === 1 ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                'bg-white text-slate-400 border-slate-100'
                              )}>
                                {u.full_name?.[0] || 'U'}
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{u.full_name || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              'text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest',
                              u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xl font-black text-slate-800">{u.sessionCount}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-base font-black text-blue-600">{u.insightCount}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-base font-black text-emerald-600">{u.publishedCount}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="w-28">
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${Math.min((u.sessionCount / Math.max(...userStats.map(x => x.sessionCount), 1)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userStats.length === 0 && (
                    <div className="py-24 text-center space-y-3">
                      <Users className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No users registered yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── STAKEHOLDERS ─── */}
            {tab === 'stakeholders' && (
              <motion.div key="stakeholders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allStakeholdersList.map((sh, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md hover:border-slate-200 transition-all group space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 rounded-xl flex items-center justify-center text-base font-black text-slate-600 shrink-0 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                            {sh.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm leading-tight">{sh.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{sh.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          {sh.sessionCount} {sh.sessionCount === 1 ? 'session' : 'sessions'}
                        </span>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-slate-50">
                        {sh.company && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Company</span>
                            <span className="font-semibold text-slate-700">{sh.company}</span>
                          </div>
                        )}
                        {sh.sector && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Sector</span>
                            <span className="font-semibold text-slate-600">{sh.sector}</span>
                          </div>
                        )}
                        {sh.geography && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Geography</span>
                            <span className="font-semibold text-slate-600">{sh.geography}</span>
                          </div>
                        )}
                        {sh.employees && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Team Size</span>
                            <span className="font-semibold text-slate-600">{sh.employees}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {sh.sessions.map(s => {
                          const cfg = statusConfig[s.status] || statusConfig.Review
                          return (
                            <Link
                              key={s.id}
                              href={s.status === 'Review' ? `/review?id=${s.id}` : `/preview?id=${s.id}`}
                              className={cn('text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-widest hover:opacity-80 transition-opacity', cfg.pill)}
                            >
                              {s.date} · {cfg.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {allStakeholdersList.length === 0 && (
                    <div className="col-span-full py-24 text-center space-y-3">
                      <Users className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No stakeholders found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
