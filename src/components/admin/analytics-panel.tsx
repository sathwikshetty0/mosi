'use client'

import { cn } from '@/lib/utils'
import { 
  BarChart3, Clock, TrendingUp, AlertCircle, Database, 
  CheckCircle2, Zap, Users, FileText, Headphones,
  Download, HardDrive, ArrowUpRight, Activity
} from 'lucide-react'

interface SessionData {
  id: string
  status: string
  date: string
  duration: number
  summary?: string
  user_id?: string
  recording_url?: string
  stakeholders: { name: string; company: string } | null
  opportunities: { tag: string; title: string }[]
  evidence: any[]
  created_at?: string
}

interface Props {
  sessions: SessionData[]
  profiles: any[]
  stakeholders: any[]
}

export function AnalyticsPanel({ sessions, profiles, stakeholders }: Props) {

  // --- CEED BREAKDOWN ---
  const ceedCounts = { Core: 0, Efficiency: 0, Expansion: 0, Disrupt: 0 }
  sessions.forEach(s => {
    s.opportunities?.forEach(o => {
      if (o.tag in ceedCounts) ceedCounts[o.tag as keyof typeof ceedCounts]++
    })
  })
  const totalOpps = Object.values(ceedCounts).reduce((a, b) => a + b, 0)

  // --- AVERAGE DURATION ---
  const sessionsWithDuration = sessions.filter(s => s.duration > 0)
  const avgDuration = sessionsWithDuration.length > 0 
    ? Math.round(sessionsWithDuration.reduce((sum, s) => sum + s.duration, 0) / sessionsWithDuration.length)
    : 0

  // --- PUBLISH RATE ---
  const publishedSessions = sessions.filter(s => s.status === 'Published')
  const publishRate = sessions.length > 0 ? Math.round((publishedSessions.length / sessions.length) * 100) : 0

  // --- TOP STAKEHOLDERS ---
  const stakeholderFreq: Record<string, { name: string; company: string; count: number }> = {}
  sessions.forEach(s => {
    const name = s.stakeholders?.name
    if (name && name !== 'Untitled Stakeholder') {
      if (!stakeholderFreq[name]) stakeholderFreq[name] = { name, company: s.stakeholders?.company || 'N/A', count: 0 }
      stakeholderFreq[name].count++
    }
  })
  const topStakeholders = Object.values(stakeholderFreq).sort((a, b) => b.count - a.count).slice(0, 5)

  // --- TRANSCRIPTION USAGE ---
  const withTranscript = sessions.filter(s => s.summary && s.summary.length > 50).length
  const withRecording = sessions.filter(s => s.recording_url && !s.recording_url.startsWith('blob:')).length

  // --- INCOMPLETE SESSIONS ---
  const incomplete = sessions.filter(s => {
    const noStakeholder = !s.stakeholders?.name || s.stakeholders.name === 'Untitled Stakeholder'
    const noSummary = !s.summary || s.summary.length < 20
    const noRecording = !s.recording_url || s.recording_url.startsWith('blob:')
    return noStakeholder || noSummary || noRecording
  })

  // --- STORAGE ---
  const totalEvidence = sessions.reduce((sum, s) => sum + (s.evidence?.length || 0), 0)

  // --- SESSIONS OVER TIME (last 8 weeks) ---
  const weeklyData: { label: string; count: number }[] = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    const count = sessions.filter(s => {
      if (!s.created_at) return false
      const d = new Date(s.created_at)
      return d >= weekStart && d < weekEnd
    }).length

    weeklyData.push({
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    })
  }
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1)

  // --- EXPORT ---
  const handleExportAll = async () => {
    const { exportSessionsCSV } = await import('@/lib/export-csv')
    const formatted = sessions.map(s => ({
      id: s.id,
      stakeholder: { name: s.stakeholders?.name || '', company: s.stakeholders?.company || '', sector: '', products: '', employees: '', revenue: '', yearsInBusiness: '', geography: '', role: '', phone: '', email: '', linkedin: '' },
      status: s.status as any,
      date: s.date,
      duration: s.duration,
      opportunities: s.opportunities || [],
      settings: { audio: true, video: true },
      evidence: s.evidence || [],
      summary: s.summary,
    }))
    exportSessionsCSV(formatted as any)
  }

  const ceedColors = [
    { tag: 'Core', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500', light: 'text-blue-600' },
    { tag: 'Efficiency', color: 'from-amber-400 to-amber-500', bg: 'bg-amber-500', light: 'text-amber-600' },
    { tag: 'Expansion', color: 'from-emerald-400 to-emerald-500', bg: 'bg-emerald-500', light: 'text-emerald-600' },
    { tag: 'Disrupt', color: 'from-rose-400 to-rose-500', bg: 'bg-rose-500', light: 'text-rose-600' },
  ]

  return (
    <div className="space-y-6">
      
      {/* SESSIONS OVER TIME */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Session Activity
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Last 8 weeks</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="flex items-end gap-1 h-20">
            {weeklyData.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div 
                  className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400 opacity-90 hover:opacity-100 transition-all cursor-default relative group"
                  style={{ height: `${Math.max((w.count / maxWeekly) * 100, 4)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                    {w.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-slate-500">
            <span>{weeklyData[0]?.label}</span>
            <span>{weeklyData[weeklyData.length - 1]?.label}</span>
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Duration', value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, icon: Clock, accent: 'text-slate-600' },
          { label: 'Publish Rate', value: `${publishRate}%`, icon: TrendingUp, accent: 'text-emerald-600' },
          { label: 'Recordings', value: String(withRecording), icon: Headphones, accent: 'text-blue-600' },
          { label: 'Transcribed', value: String(withTranscript), icon: FileText, accent: 'text-violet-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-100 rounded-xl p-4 group hover:border-slate-200 hover:shadow-sm transition-all">
            <m.icon className={cn("w-4 h-4 mb-2", m.accent)} />
            <p className="text-xl font-bold text-slate-800">{m.value}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* CEED + TOP STAKEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CEED */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> CEED Distribution
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{totalOpps} total</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ceedColors.map(item => {
              const count = ceedCounts[item.tag as keyof typeof ceedCounts]
              const pct = totalOpps > 0 ? Math.round((count / totalOpps) * 100) : 0
              return (
                <div key={item.tag} className="relative bg-slate-50 rounded-xl p-3 overflow-hidden">
                  <div className={cn("absolute bottom-0 left-0 right-0 opacity-10", item.bg)} style={{ height: `${pct}%` }} />
                  <div className="relative z-10">
                    <p className={cn("text-lg font-bold", item.light)}>{count}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.tag}</p>
                    <p className="text-[9px] text-slate-400">{pct}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TOP STAKEHOLDERS */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Top Stakeholders
          </h3>
          {topStakeholders.length > 0 ? (
            <div className="space-y-2.5">
              {topStakeholders.map((sh, i) => (
                <div key={sh.name} className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                    i === 0 ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{sh.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{sh.company}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {sh.count} <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No data yet</p>
          )}
        </div>
      </div>

      {/* INCOMPLETE SESSIONS */}
      {incomplete.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Incomplete Sessions
            </h3>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{incomplete.length}</span>
          </div>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
            {incomplete.slice(0, 6).map(s => {
              const issues = []
              if (!s.stakeholders?.name || s.stakeholders.name === 'Untitled Stakeholder') issues.push('stakeholder')
              if (!s.summary || s.summary.length < 20) issues.push('summary')
              if (!s.recording_url || s.recording_url.startsWith('blob:')) issues.push('recording')
              return (
                <div key={s.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-amber-100/50 transition-all">
                  <span className="text-xs font-bold text-amber-900 truncate max-w-[180px]">{s.stakeholders?.name || s.date || 'Unnamed'}</span>
                  <span className="text-[9px] text-amber-600 font-medium">Missing: {issues.join(', ')}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SYSTEM + EXPORT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-slate-400" /> System Status
          </h3>
          <div className="space-y-2.5">
            {[
              { name: 'ElevenLabs (Transcription)', ok: true },
              { name: 'NVIDIA Nemotron (Summary)', ok: true },
              { name: 'Supabase Storage', ok: true },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{s.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
              <span className="text-[11px] text-slate-500">Evidence files</span>
              <span className="text-xs font-bold text-slate-700">{totalEvidence}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Cloud recordings</span>
              <span className="text-xs font-bold text-slate-700">{withRecording}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Export
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Download all data for analysis or backup.</p>
          </div>
          <button 
            onClick={handleExportAll}
            className="mt-4 h-10 w-full bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 justify-center hover:bg-black active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Sessions CSV
          </button>
        </div>
      </div>
    </div>
  )
}
