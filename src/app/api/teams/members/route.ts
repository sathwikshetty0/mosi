import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST: Add a member to a team (by email lookup)
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { teamId, email } = body

  if (!teamId || !email) {
    return NextResponse.json({ error: 'teamId and email are required' }, { status: 400 })
  }

  // Verify caller is owner of the team
  const { data: callerMembership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (callerMembership?.role !== 'owner') {
    return NextResponse.json({ error: 'Only team owners can add members' }, { status: 403 })
  }

  // Find user by email in profiles (check public_email) or auth metadata
  // First try profiles table
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('public_email', email)
    .maybeSingle()

  let targetUserId = targetProfile?.id

  // If not found by public_email, try to find by auth email
  // (This requires admin access, so we'll check a different way)
  if (!targetUserId) {
    // Look for any profile where the id matches a user with that email
    // Unfortunately we can't query auth.users from client — return helpful error
    return NextResponse.json({ 
      error: `No user found with email "${email}". They need to sign up first and set their email in their profile.` 
    }, { status: 404 })
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'User is already a team member' }, { status: 409 })
  }

  // Add member
  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: targetUserId, role: 'member' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, userId: targetUserId, name: targetProfile?.full_name })
}

// DELETE: Remove a member from a team
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId')
  const memberId = searchParams.get('userId')

  if (!teamId || !memberId) {
    return NextResponse.json({ error: 'teamId and userId are required' }, { status: 400 })
  }

  // Verify caller is owner
  const { data: callerMembership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (callerMembership?.role !== 'owner') {
    // Members can leave themselves
    if (memberId !== user.id) {
      return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 })
    }
  }

  // Can't remove the owner
  const { data: targetMembership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', memberId)
    .single()

  if (targetMembership?.role === 'owner' && memberId !== user.id) {
    return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 })
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', memberId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
