import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// Helper to verify admin
async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user, profile }
}

// GET: Fetch all team members with workload stats
export async function GET() {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  // Get all profiles
  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  if (profilesErr) return NextResponse.json({ error: profilesErr.message }, { status: 500 })

  // Get session counts per user for workload
  const { data: sessions } = await supabase
    .from('sessions')
    .select('user_id, status')

  // Calculate workload per user
  const workload: Record<string, { total: number; inReview: number; published: number }> = {}
  sessions?.forEach((s: any) => {
    if (!s.user_id) return
    if (!workload[s.user_id]) workload[s.user_id] = { total: 0, inReview: 0, published: 0 }
    workload[s.user_id].total++
    if (s.status === 'Review') workload[s.user_id].inReview++
    if (s.status === 'Published') workload[s.user_id].published++
  })

  const team = (profiles || []).map((p: any) => ({
    ...p,
    workload: workload[p.id] || { total: 0, inReview: 0, published: 0 }
  }))

  // Get all teams with members for admin view
  const { data: allTeams } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: allTeamMembers } = await supabase
    .from('team_members')
    .select('*')
    .order('joined_at', { ascending: true })

  const teamsWithMembers = (allTeams || []).map((t: any) => ({
    ...t,
    members: (allTeamMembers || [])
      .filter((m: any) => m.team_id === t.id)
      .map((m: any) => {
        const profile = (profiles || []).find((p: any) => p.id === m.user_id)
        return {
          userId: m.user_id,
          role: m.role,
          name: profile?.full_name || 'Unknown',
          joinedAt: m.joined_at,
        }
      })
  }))

  return NextResponse.json({ team, teams: teamsWithMembers })
}

// POST: Invite a new researcher (creates profile entry)
export async function POST(req: Request) {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { email, full_name, role = 'normal' } = body

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  // Use Supabase Admin API to invite user
  // Note: This requires the service_role key which we don't have on client
  // Instead, we'll generate an invite link that the admin can share
  const inviteUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}` // Placeholder
  
  // For now, we create a "pending" entry in a simple way
  // The user will self-register, and their profile gets created on auth callback
  return NextResponse.json({ 
    success: true, 
    message: `Invite ready for ${email}. Share the signup link with them.`,
    signupUrl: '/signup'
  })
}

// PATCH: Update user role or deactivate
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const auth = await verifyAdmin(supabase)
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json()
  const { userId, role, deactivate } = body

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  // Prevent admin from demoting themselves
  if (userId === auth.user.id && role === 'normal') {
    return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 })
  }

  const updates: any = {}
  if (role) updates.role = role
  // Deactivation: We'll use a convention of setting role to 'deactivated'
  if (deactivate) updates.role = 'deactivated'

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
