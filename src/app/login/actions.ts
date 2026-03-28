'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Ensure fresh cache
  revalidatePath('/', 'layout')
  
  // High-Speed Auth Redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
  
  const next = formData.get('next') as string
  
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  if (next && next.startsWith('/')) {
    redirect(next)
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  // PRO PROTOCOL: Double Registration
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // CRITICAL: Ensure profile exists so they aren't stuck on first login
  if (authData.user) {
    await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: fullName,
      role: 'researcher'
    })
  }

  revalidatePath('/', 'layout')
  
  const next = formData.get('next') as string
  if (next && next.startsWith('/')) {
    redirect(next)
  }

  // Send to home to complete verification check
  redirect('/')
}

export async function signInWithGoogle(next: string = '/', origin: string = 'http://localhost:3000') {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
