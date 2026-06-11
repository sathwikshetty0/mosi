import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET: Fetch user's teams with members
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get teams the user belongs to
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('user_id', user.id)

  if (!memberships || memberships.length === 0) {
    return NextResponse.json({ teams: [] })
  }

  const teamIds = memberships.map(m => m.team_id)

  // Get team details
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)

  // Get all members for these teams
  const { data: allMembers } = await supabase
    .from('team_members')
    .select('*, profiles:user_id(id, full_name, role, avatar_url, public_email)')
    .in('team_id', teamIds)

  // Combine
  const result = (teams || []).map(team => ({
    ...team,
    userRole: memberships.find(m => m.team_id === team.id)?.role || 'member',
    members: (allMembers || []).filter(m => m.team_id === team.id).map(m => ({
      id: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
      name: (m.profiles as any)?.full_name || 'Unknown',
      avatar: (m.profiles as any)?.avatar_url,
      email: (m.profiles as any)?.public_email,
    }))
  }))

  return NextResponse.json({ teams: result })
}

// POST: Create a new team
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
  }

  // Create team
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({ name: name.trim(), created_by: user.id })
    .select()
    .single()

  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 })

  // Add creator as owner
  const { error: memberErr } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: user.id, role: 'owner' })

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 })

  return NextResponse.json({ success: true, team })
}

// DELETE: Delete a team (owner only)
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('id')
  if (!teamId) return NextResponse.json({ error: 'Missing team id' }, { status: 400 })

  // Verify ownership
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'owner') {
    return NextResponse.json({ error: 'Only team owners can delete teams' }, { status: 403 })
  }

  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
