'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { useMosiStore } from './store'
import { logout } from '@/app/login/actions'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const initializeAuth = async () => {
      if (!supabase) return
      
      // Use getUser() to ping the server to accurately read secure cookies
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (!mounted) return
      
      setUser(user ?? null)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (mounted) setProfile(profile)
      }
      
      if (mounted) setLoading(false)
    }

    initializeAuth()

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) return
        
        // Ignore INITIAL_SESSION otherwise it immediately overwrites `getUser()` with null
        if (event === 'INITIAL_SESSION') return

        const { setSessions, fetchSessions } = useMosiStore.getState()
        
        if (event === 'SIGNED_OUT') {
          setSessions([])
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (mounted) setProfile(profile)
          
          if (event === 'SIGNED_IN') {
            fetchSessions()
          }
        } else {
          if (mounted) setProfile(null)
        }
        
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
      
      // Call Server Action to securely wipe cookies and redirect
      await logout()
    } catch (e) {
      // If server action fails or throws (redirect), fall back to manual reload
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
