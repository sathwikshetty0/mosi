'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Shield, ShieldCheck, UserPlus, Mail, 
  BarChart3, Clock, ChevronDown, Check, X, 
  AlertCircle, Activity, Briefcase, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/components/ui/toast'

interface TeamMember {
  id: string
  full_name: string
  role: string
  public_email?: string
  role_title?: string
  updated_at?: string
  workload: {
    total: number
    inReview: number
    published: number
  }
}

interface ActivityItem {
  id: string
  action: string
  userName: string
  userId: string
  stakeholderName: string
  timestamp: string
  status: string
}

export function TeamPanel() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null)
  const addToast = useToastStore(s => s.addToast)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamRes, activityRes] = await Promise.all([
        fetch('/api/admin/team'),
        fetch('/api/admin/activity')
      ])
      const teamData = await teamRes.json()
      const activityData = await activityRes.json()
      if (teamData.team) setTeam(teamData.team)
      if (teamData.teams) setTeams(teamData.teams)
      if (activityData.activities) setActivities(activityData.activities)
    } catch (e) {
      console.error('Failed to load team data:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      const data = await res.json()
      if (res.ok) {
        setTeam(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
        setRoleChangeId(null)
        addToast(`Role updated to ${newRole}`, 'success')
      } else {
        addToast(data.error || 'Failed to update role', 'error')
      }
    } catch (e) {
      addToast('Failed to update role', 'error')
    }
  }

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They won't be able to log in.`)) return
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deactivate: true })
      })
      if (res.ok) {
        setTeam(prev => prev.map(m => m.id === userId ? { ...m, role: 'deactivated' } : m))
        addToast(`${name} deactivated`, 'success')
      }
    } catch (e) {
      addToast('Failed to deactivate user', 'error')
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName })
      })
      const data = await res.json()
      if (res.ok) {
        addToast(`Invite ready for ${inviteEmail}`, 'success')
        setShowInvite(false)
        setInviteEmail('')
        setInviteName('')
      } else {
        addToast(data.error || 'Failed to create invite', 'error')
      }
    } catch (e) {
      addToast('Failed to send invite', 'error')
    }
  }

  // Workload analysis
  const avgWorkload = team.length > 0 ? Math.round(team.reduce((sum, m) => sum + m.workload.inReview, 0) / team.length) : 0
  const overloaded = team.filter(m => m.workload.inReview > avgWorkload * 1.5 && m.workload.inReview > 2)
  const underloaded = team.filter(m => m.workload.inReview === 0 && m.role !== 'deactivated')

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER + INVITE */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Team Members</h3>
          <p className="text-xs text-slate-400">{team.filter(m => m.role !== 'deactivated').length} active researchers</p>
        </div>
        <button 
          onClick={() => setShowInvite(!showInvite)}
          className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" /> Invite
        </button>
      </div>

      {/* INVITE FORM */}
      {showInvite && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold text-blue-800">Invite a new researcher</p>
          <div className="flex gap-2">
            <input 
              placeholder="Name" 
              value={inviteName} 
              onChange={e => setInviteName(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-blue-200 bg-white text-sm outline-none focus:border-blue-400"
            />
            <input 
              placeholder="Email" 
              type="email"
              value={inviteEmail} 
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-blue-200 bg-white text-sm outline-none focus:border-blue-400"
            />
            <button 
              onClick={handleInvite}
              disabled={!inviteEmail}
              className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-blue-700 transition-all"
            >
              Send
            </button>
          </div>
          <p className="text-[10px] text-blue-600">Share the signup link: <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">/signup</span></p>
        </div>
      )}

      {/* WORKLOAD BALANCER */}
      {(overloaded.length > 0 || underloaded.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-bold text-amber-800">Workload Imbalance Detected</p>
          </div>
          {overloaded.length > 0 && (
            <p className="text-[11px] text-amber-700">
              <span className="font-bold">{overloaded.map(m => m.full_name).join(', ')}</span> {overloaded.length === 1 ? 'has' : 'have'} above-average review load ({overloaded[0]?.workload.inReview} sessions)
            </p>
          )}
          {underloaded.length > 0 && (
            <p className="text-[11px] text-amber-700">
              <span className="font-bold">{underloaded.map(m => m.full_name).join(', ')}</span> {underloaded.length === 1 ? 'has' : 'have'} no sessions in review — consider reassigning
            </p>
          )}
        </div>
      )}

      {/* TEAM GRID */}
      <div className="space-y-3">
        {team.map(member => (
          <div key={member.id} className={cn(
            "bg-white border rounded-xl p-4 flex items-center gap-4 transition-all",
            member.role === 'deactivated' ? "border-red-100 opacity-50" : "border-slate-100 hover:border-slate-200"
          )}>
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
              member.role === 'admin' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
            )}>
              {member.full_name?.[0] || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">{member.full_name || 'Unnamed'}</p>
                <span className={cn(
                  "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border",
                  member.role === 'admin' ? "bg-blue-50 text-blue-600 border-blue-100" :
                  member.role === 'deactivated' ? "bg-red-50 text-red-600 border-red-100" :
                  "bg-slate-50 text-slate-500 border-slate-100"
                )}>
                  {member.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{member.role_title || 'Researcher'} · {member.workload.total} sessions</p>
            </div>

            {/* Workload indicators */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
              <div className="text-center">
                <p className="text-amber-600">{member.workload.inReview}</p>
                <p className="text-slate-300">Review</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-600">{member.workload.published}</p>
                <p className="text-slate-300">Published</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {roleChangeId === member.id ? (
                <div className="flex gap-1 animate-in fade-in">
                  <button onClick={() => handleRoleChange(member.id, 'admin')} className="h-7 px-2 bg-blue-50 text-blue-600 rounded text-[9px] font-bold border border-blue-100 hover:bg-blue-100">Admin</button>
                  <button onClick={() => handleRoleChange(member.id, 'normal')} className="h-7 px-2 bg-slate-50 text-slate-600 rounded text-[9px] font-bold border border-slate-100 hover:bg-slate-100">Normal</button>
                  <button onClick={() => setRoleChangeId(null)} className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-slate-700"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setRoleChangeId(member.id)}
                    className="h-7 px-2 text-[9px] font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    title="Change role"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                  {member.role !== 'deactivated' && (
                    <button 
                      onClick={() => handleDeactivate(member.id, member.full_name)}
                      className="h-7 px-2 text-[9px] font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="Deactivate"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TEAMS OVERVIEW */}
      {teams.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">All Teams ({teams.length})</h3>
          </div>
          
          <div className="space-y-3">
            {teams.map((t: any) => (
              <div key={t.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.members?.length || 0} members · Created {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                {t.members && t.members.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.members.map((m: any) => (
                      <span key={m.userId} className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg border",
                        m.role === 'owner' ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-white text-slate-600 border-slate-100"
                      )}>
                        {m.name} {m.role === 'owner' ? '👑' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVITY LOG */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
        </div>
        
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {activities.length > 0 ? activities.slice(0, 25).map(act => (
            <div key={`${act.id}-${act.action}`} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-all">
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                act.action === 'published' ? "bg-emerald-500" :
                act.action === 'completed' ? "bg-amber-500" :
                "bg-blue-500"
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700">
                  <span className="font-bold">{act.userName}</span>
                  {' '}{act.action}{' '}
                  <span className="text-slate-500">session with {act.stakeholderName}</span>
                </p>
              </div>
              <span className="text-[10px] text-slate-300 font-medium shrink-0">
                {act.timestamp ? new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>
          )) : (
            <p className="text-xs text-slate-400 py-8 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
