'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { useMosiStore } from './store'

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
    const getSession = async () => {
      if (!supabase) return
      
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile)
      }
      
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event: any, session: any) => {
        const { setSessions, fetchSessions } = useMosiStore.getState()
        
        // Only purge sessions on explicit sign-out, NOT on token refresh
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
          setProfile(profile)
          
          // Re-fetch sessions on sign-in to ensure fresh data
          if (event === 'SIGNED_IN') {
            fetchSessions()
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (e) {
      console.error('Local signout error:', e)
    }
    
    // Call Server Action to securely wipe cookies and redirect
    const { logout } = await import('@/app/login/actions')
    try {
      await logout()
    } catch (e) {
      // Ignore: redirect() throws internally
    } finally {
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
