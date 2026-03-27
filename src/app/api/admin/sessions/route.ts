import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Verify the requester is an admin
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

  // Fetch ALL sessions — this works because the admin RLS policy allows it
  // If you see empty results, run: ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*, stakeholders(*), opportunities(*), evidence(*)')
    .order('created_at', { ascending: false })

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true })

  const { data: stakeholders, error: stakeholdersError } = await supabase
    .from('stakeholders')
    .select('*')
    .order('name', { ascending: true })

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 })
  }

  return NextResponse.json({ 
    sessions: sessions || [], 
    profiles: profiles || [],
    stakeholders: stakeholders || []
  })
}
