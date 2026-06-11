import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST: Add evidence to a session
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sessionId, opportunityId, type, url, title } = body

  if (!sessionId || !type || !url) {
    return NextResponse.json({ error: 'Missing required fields: sessionId, type, url' }, { status: 400 })
  }

  // Verify ownership
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', sessionId)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const insertData: Record<string, unknown> = {
    session_id: sessionId,
    type,
    url,
    title: title || null,
  }

  if (opportunityId) {
    insertData.opportunity_id = opportunityId
  }

  const { data: evidence, error } = await supabase
    .from('evidence')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, evidence })
}

// DELETE: Remove evidence
export async function DELETE(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing evidence id' }, { status: 400 })
  }

  // Verify ownership through session
  const { data: ev } = await supabase
    .from('evidence')
    .select('session_id')
    .eq('id', id)
    .single()

  if (!ev) {
    return NextResponse.json({ error: 'Evidence not found' }, { status: 404 })
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', ev.session_id)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('evidence')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
