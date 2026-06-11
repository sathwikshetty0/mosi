'use client'

import * as React from 'react'
import { Users, Plus, X, Crown, UserPlus, Trash2, LogOut, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { useToastStore } from '@/components/ui/toast'

interface TeamMember {
  id: string
  role: string
  name: string
  email?: string
  avatar?: string
  joinedAt: string
}

interface Team {
  id: string
  name: string
  created_by: string
  created_at: string
  userRole: string
  members: TeamMember[]
}

export default function TeamPage() {
  const { user } = useAuth()
  const addToast = useToastStore(s => s.addToast)
  const [teams, setTeams] = React.useState<Team[]>([])
  const [loading, setLoading] = React.useState(true)
  const [showCreate, setShowCreate] = React.useState(false)
  const [newTeamName, setNewTeamName] = React.useState('')
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [invitingTeamId, setInvitingTeamId] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const loadTeams = async () => {
    try {
      const res = await fetch('/api/teams')
      const data = await res.json()
      if (data.teams) setTeams(data.teams)
    } catch (e) {
      console.error('Failed to load teams:', e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadTeams() }, [])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        addToast(`Team "${newTeamName}" created!`, 'success')
        setNewTeamName('')
        setShowCreate(false)
        loadTeams()
      } else {
        addToast(data.error || 'Failed to create team', 'error')
      }
    } catch (e) {
      addToast('Failed to create team', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInvite = async (teamId: string) => {
    if (!inviteEmail.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, email: inviteEmail.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        addToast(`${data.name || inviteEmail} added to team!`, 'success')
        setInviteEmail('')
        setInvitingTeamId(null)
        loadTeams()
      } else {
        addToast(data.error || 'Failed to add member', 'error')
      }
    } catch (e) {
      addToast('Failed to add member', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (teamId: string, userId: string, name: string) => {
    const isSelf = userId === user?.id
    if (!confirm(isSelf ? 'Leave this team?' : `Remove ${name} from the team?`)) return
    try {
      const res = await fetch(`/api/teams/members?teamId=${teamId}&userId=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        addToast(isSelf ? 'Left the team' : `${name} removed`, 'success')
        loadTeams()
      } else {
        const data = await res.json()
        addToast(data.error || 'Failed', 'error')
      }
    } catch (e) {
      addToast('Failed to remove member', 'error')
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Delete team "${teamName}"? All members will lose shared access.`)) return
    try {
      const res = await fetch(`/api/teams?id=${teamId}`, { method: 'DELETE' })
      if (res.ok) {
        addToast(`Team "${teamName}" deleted`, 'success')
        loadTeams()
      }
    } catch (e) {
      addToast('Failed to delete team', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl mx-auto pt-8">
        <div className="h-8 w-32 bg-slate-200 rounded-lg" />
        <div className="h-4 w-56 bg-slate-100 rounded" />
        <div className="h-40 bg-slate-100 rounded-2xl mt-6" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-2 sm:pt-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">My Teams</h1>
          <p className="text-xs text-slate-500">{teams.length === 0 ? 'Create a team to share interviews with colleagues.' : `${teams.length} team${teams.length > 1 ? 's' : ''}`}</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="h-9 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-black active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> New Team
        </button>
      </div>

      {/* Create team form */}
      {showCreate && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold text-blue-800">Create a new team</p>
          <div className="flex gap-2">
            <input 
              placeholder="Team name (e.g. Research Unit Alpha)" 
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
              className="flex-1 h-9 px-3 rounded-lg border border-blue-200 bg-white text-sm outline-none focus:border-blue-400"
              autoFocus
            />
            <button 
              onClick={handleCreateTeam} 
              disabled={isSubmitting || !newTeamName.trim()}
              className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-blue-700"
            >
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Teams list */}
      {teams.length === 0 && !showCreate ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-4">
          <Users className="w-10 h-10 text-slate-200 mx-auto" />
          <div>
            <p className="text-sm font-bold text-slate-600">No teams yet</p>
            <p className="text-xs text-slate-400 mt-1">Create a team to share sessions, stakeholders and insights with your colleagues.</p>
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="h-10 px-6 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Team header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{team.name}</h3>
                    <p className="text-[10px] text-slate-400">{team.members.length} member{team.members.length !== 1 ? 's' : ''} · You are {team.userRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {team.userRole === 'owner' && (
                    <>
                      <button 
                        onClick={() => setInvitingTeamId(invitingTeamId === team.id ? null : team.id)}
                        className="h-8 px-3 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 transition-all"
                      >
                        <UserPlus className="w-3 h-3" /> Add
                      </button>
                      <button 
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="h-8 w-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {team.userRole === 'member' && (
                    <button 
                      onClick={() => handleRemoveMember(team.id, user!.id, 'yourself')}
                      className="h-8 px-3 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded-lg flex items-center gap-1.5 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-3 h-3" /> Leave
                    </button>
                  )}
                </div>
              </div>

              {/* Invite form */}
              {invitingTeamId === team.id && (
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2 animate-in fade-in duration-200">
                  <Mail className="w-4 h-4 text-slate-400 mt-2.5 shrink-0" />
                  <input 
                    placeholder="Member's email (must have an account)" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInvite(team.id)}
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-400"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleInvite(team.id)}
                    disabled={isSubmitting || !inviteEmail.trim()}
                    className="h-9 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Members list */}
              <div className="divide-y divide-slate-50">
                {team.members.map(member => (
                  <div key={member.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      member.role === 'owner' ? "bg-amber-50 text-amber-700" : "bg-slate-50 text-slate-500"
                    )}>
                      {member.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate flex items-center gap-2">
                        {member.name}
                        {member.role === 'owner' && <Crown className="w-3 h-3 text-amber-500" />}
                        {member.id === user?.id && <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold">You</span>}
                      </p>
                      {member.email && <p className="text-[10px] text-slate-400 truncate">{member.email}</p>}
                    </div>
                    {team.userRole === 'owner' && member.id !== user?.id && (
                      <button 
                        onClick={() => handleRemoveMember(team.id, member.id, member.name)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Shared data note */}
              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">
                  All team members can see each other&apos;s sessions, stakeholders, and organizations.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
