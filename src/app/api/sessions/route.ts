import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET: Fetch sessions for the current authenticated user
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*, stakeholders(*), opportunities(*), evidence(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessions: sessions || [] })
}

// PATCH: Update a session's stakeholder or metadata
export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sessionId, stakeholder, summary, status } = body

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  // Verify the user owns this session
  const { data: sessionData, error: sessionErr } = await supabase
    .from('sessions')
    .select('id, user_id, stakeholder_id')
    .eq('id', sessionId)
    .single()

  if (sessionErr || !sessionData) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  if (sessionData.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update stakeholder if provided
  if (stakeholder) {
    if (sessionData.stakeholder_id) {
      // Update existing stakeholder
      const { error: shErr } = await supabase
        .from('stakeholders')
        .update(stakeholder)
        .eq('id', sessionData.stakeholder_id)

      if (shErr) {
        return NextResponse.json({ error: `Stakeholder update failed: ${shErr.message}` }, { status: 500 })
      }
    } else {
      // Create new stakeholder and link to session
      const { data: newSH, error: shErr } = await supabase
        .from('stakeholders')
        .insert({ ...stakeholder, user_id: user.id })
        .select()
        .single()

      if (shErr || !newSH) {
        return NextResponse.json({ error: `Stakeholder creation failed: ${shErr?.message}` }, { status: 500 })
      }

      // Link stakeholder to session
      await supabase.from('sessions').update({ stakeholder_id: newSH.id }).eq('id', sessionId)
    }
  }

  // Update session fields if provided
  const sessionUpdate: Record<string, unknown> = {}
  if (summary !== undefined) sessionUpdate.summary = summary
  if (status !== undefined) sessionUpdate.status = status

  if (Object.keys(sessionUpdate).length > 0) {
    const { error: updateErr } = await supabase
      .from('sessions')
      .update(sessionUpdate)
      .eq('id', sessionId)

    if (updateErr) {
      return NextResponse.json({ error: `Session update failed: ${updateErr.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
