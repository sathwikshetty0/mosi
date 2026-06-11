import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST: Publish a session (set status to 'Published')
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sessionId } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  // Verify ownership
  const { data: session, error: fetchErr } = await supabase
    .from('sessions')
    .select('user_id, status')
    .eq('id', sessionId)
    .single()

  if (fetchErr || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'Published' })
    .eq('id', sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, previousStatus: session.status })
}
