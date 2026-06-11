import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH: Update an opportunity
export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 })
  }

  // Verify ownership through session
  const { data: opp } = await supabase
    .from('opportunities')
    .select('session_id')
    .eq('id', id)
    .single()

  if (!opp) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', opp.session_id)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE: Remove an opportunity
export async function DELETE(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing opportunity id' }, { status: 400 })
  }

  // Verify ownership through session
  const { data: opp } = await supabase
    .from('opportunities')
    .select('session_id')
    .eq('id', id)
    .single()

  if (!opp) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('id', opp.session_id)
    .single()

  if (!session || session.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
