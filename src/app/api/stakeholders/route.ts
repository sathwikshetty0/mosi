import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET: Fetch stakeholders for the current user
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: stakeholders, error } = await supabase
    .from('stakeholders')
    .select('*')
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ stakeholders: stakeholders || [] })
}

// POST: Create a new stakeholder
export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, role, phone, email, linkedin, company, sector, employees, revenue, geography, domain, address, pincode } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Stakeholder name is required' }, { status: 400 })
  }

  const { data: stakeholder, error } = await supabase
    .from('stakeholders')
    .insert({
      name: name.trim(),
      role: role || '',
      phone: phone || '',
      email: email || '',
      linkedin: linkedin || '',
      company: company || '',
      sector: sector || '',
      employees: employees || '',
      revenue: revenue || '',
      geography: geography || '',
      domain: domain || '',
      address: address || '',
      pincode: pincode || '',
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, stakeholder })
}

// PATCH: Update a stakeholder
export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing stakeholder id' }, { status: 400 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('stakeholders')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Stakeholder not found' }, { status: 404 })
  }

  // Allow update if user owns it or if it has no owner
  if (existing.user_id && existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('stakeholders')
    .update(updates)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// DELETE: Delete a stakeholder
export async function DELETE(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing stakeholder id' }, { status: 400 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('stakeholders')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Stakeholder not found' }, { status: 404 })
  }

  if (existing.user_id && existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('stakeholders')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
