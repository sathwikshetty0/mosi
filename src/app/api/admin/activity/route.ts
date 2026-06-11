import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET: Fetch recent activity (derived from sessions data + timestamps)
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get recent sessions with user info for activity reconstruction
  const { data: recentSessions, error } = await supabase
    .from('sessions')
    .select('id, status, date, created_at, user_id, stakeholder_id, stakeholders(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get profiles for user name resolution
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  const profileMap: Record<string, string> = {}
  profiles?.forEach((p: any) => { profileMap[p.id] = p.full_name || 'Unknown' })

  // Build activity feed from session data
  const activities = (recentSessions || []).map((s: any) => {
    let action = 'created'
    if (s.status === 'Published') action = 'published'
    else if (s.status === 'Review') action = 'completed'
    
    return {
      id: s.id,
      action,
      userName: profileMap[s.user_id] || 'Unassigned',
      userId: s.user_id,
      stakeholderName: s.stakeholders?.name || 'Unknown Stakeholder',
      timestamp: s.created_at,
      sessionId: s.id,
      status: s.status,
    }
  })

  return NextResponse.json({ activities })
}
