import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

export type CEEDTag = 'Core' | 'Efficiency' | 'Expansion' | 'Disrupt'

export interface TranscriptParagraph {
  id: string
  text: string
  speaker: string
  timestamp: number
  status: 'Approved' | 'Hidden' | 'Pending'
  comment?: string
}

export interface EvidenceItem {
  id: string
  type: 'image' | 'video' | 'link' | 'file'
  url: string
  timestamp: number
  title?: string
}

export interface Opportunity {
  id: string
  timestamp: number // seconds into the interview
  title: string
  description: string
  tag: CEEDTag
  paid: boolean
  duration: string
  skills: string
  toolset?: string
  engagementType?: string // e.g., 'Gig', 'Internship', 'Full-time'
  score: {
    clarity: number      // 1-4
    awareness: number    // 1-4
    attempts: number     // 1-4
    intensity: number    // 1-4
  }
  notes: string
  evidence: EvidenceItem[]
  status: 'Approved' | 'Hidden' | 'Pending'
  comment?: string
}

export interface StakeholderProfile {
  name: string
  role: string
  phone: string
  email: string
  linkedin: string
  company: string
  sector: string
  products: string
  employees: string
  revenue: string
  yearsInBusiness: string
  geography: string
  domain?: string
  address?: string
  pincode?: string
  id?: string
}

export interface InterviewSession {
  id: string
  stakeholder: StakeholderProfile
  status: 'Scheduled' | 'Recording' | 'Review' | 'Published'
  date: string
  duration: number // seconds
  opportunities: Opportunity[]
  settings: {
    audio: boolean
    video: boolean
  }
  evidence: EvidenceItem[]
  recordingUrl?: string
  location?: string
  transcript?: TranscriptParagraph[]
  summary?: string
  user_id?: string
}



interface MosiStore {
  // Current session being set up / conducted
  currentSession: Partial<InterviewSession> | null
  // All completed / past sessions
  sessions: InterviewSession[]
  // Live interview state
  isRecording: boolean
  recordingSeconds: number
  activeQuadrant: CEEDTag
  selectedOpportunityId: string | null

  // Actions  
  setCurrentSession: (session: Partial<InterviewSession>) => void
  startRecording: () => void
  stopRecording: () => void
  setActiveQuadrant: (q: CEEDTag) => void
  addOpportunity: (opp: Omit<Opportunity, 'id'> & { id?: string }) => void
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void
  removeOpportunity: (id: string) => void
  setSelectedOpportunity: (id: string | null) => void
  addEvidence: (evidence: Omit<EvidenceItem, 'id'>) => void
  addEvidenceToOpportunity: (oppId: string, evidence: Omit<EvidenceItem, 'id'>) => void
  finalizeSession: (recordingUrl?: string) => string
  scheduleSession: () => void
  publishSession: (id: string) => void
  deleteSession: (id: string) => void
  tick: () => void
  updateOpportunityStatus: (sessionId: string, oppId: string, status: 'Approved' | 'Hidden' | 'Pending', comment?: string) => void
  updateTranscriptStatus: (sessionId: string, paraId: string, status: 'Approved' | 'Hidden' | 'Pending', comment?: string) => void
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  updateSessionSummary: (id: string, summary: string) => void
  setRecordingUrl: (id: string, url: string) => void
  profiles: any[]
  fetchAllProfiles: () => Promise<void>
  fetchSessions: () => Promise<void>
  setSessions: (sessions: InterviewSession[]) => void
  fetchSessionById: (id: string) => Promise<void>
  updateStakeholder: (id: string, updates: Partial<StakeholderProfile>) => void
  deleteStakeholder: (id: string) => void
}



export const useMosiStore = create<MosiStore>()(
  persist(
    (set, get) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  currentSession: null,
  sessions: [],
  profiles: [],
  isRecording: false,
  recordingSeconds: 0,
  activeQuadrant: 'Core',
  selectedOpportunityId: null,

  setCurrentSession: (session) => set((s) => ({
    currentSession: { ...s.currentSession, ...session }
  })),

  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),

  setActiveQuadrant: (q) => set({ activeQuadrant: q }),

  addOpportunity: (opp) => set((s) => {
    const newOpp: Opportunity = { 
      id: opp.id || crypto.randomUUID(),
      ...opp 
    } as Opportunity
    return {
      currentSession: {
        ...s.currentSession,
        opportunities: [...(s.currentSession?.opportunities || []), newOpp]
      }
    }
  }),

  updateOpportunity: (id, updates) => set((s) => {
    // Update in historical sessions
    const newSessions = s.sessions.map(sess => ({
      ...sess,
      opportunities: sess.opportunities.map(o => o.id === id ? { ...o, ...updates } : o)
    }))
    
    // Update in current session if present
    const newCurrent = s.currentSession ? {
      ...s.currentSession,
      opportunities: s.currentSession.opportunities?.map(o => o.id === id ? { ...o, ...updates } : o)
    } : s.currentSession

    return { sessions: newSessions, currentSession: newCurrent }
  }),

  removeOpportunity: (id) => set((s) => {
    const newSessions = s.sessions.map(sess => ({
      ...sess,
      opportunities: sess.opportunities.filter(o => o.id !== id)
    }))

    const newCurrent = s.currentSession ? {
      ...s.currentSession,
      opportunities: s.currentSession.opportunities?.filter(o => o.id !== id)
    } : s.currentSession

    return { sessions: newSessions, currentSession: newCurrent }
  }),

  setSelectedOpportunity: (id) => set({ selectedOpportunityId: id }),



  addEvidence: (evidence) => set((s) => ({
    currentSession: {
      ...s.currentSession,
      evidence: [...(s.currentSession?.evidence || []), { ...evidence, id: `ev_${Date.now()}` }]
    }
  })),

  addEvidenceToOpportunity: (oppId, evidence) => set((s) => {
    const newEvidence: EvidenceItem = { ...evidence, id: `ev_${Date.now()}` }
    
    // Update current session
    const newCurrent = s.currentSession ? {
      ...s.currentSession,
      opportunities: s.currentSession.opportunities?.map(o => 
        o.id === oppId ? { ...o, evidence: [...o.evidence, newEvidence] } : o
      )
    } : s.currentSession

    // Also update sessions array just in case we're editing a completed one
    const newSessions = s.sessions.map(sess => ({
      ...sess,
      opportunities: sess.opportunities.map(o =>
        o.id === oppId ? { ...o, evidence: [...o.evidence, newEvidence] } : o
      )
    }))

    return { currentSession: newCurrent, sessions: newSessions }
  }),

  fetchAllProfiles: async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    
    // 🛡️ SECURITY BLOCK: If no user, return NOTHING
    if (!user) {
      set({ profiles: [] })
      return
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('full_name', { ascending: true })

    if (error) {
       console.error('Fetch profiles failed:', error.message)
       return
    }

    if (profiles) {
       set({ profiles })
    }
  },

  fetchSessions: async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    
    // 🛡️ SECURITY BLOCK: If no researcher is logged in, show ZERO data in the archive
    if (!user) {
      set({ sessions: [] })
      return
    }
    
    let query = supabase.from('sessions').select('*, stakeholders(*), opportunities(*), evidence(*)')
    query = query.eq('user_id', user.id) // STRICTURE ENFORCEMENT

    const { data: sessionsData, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch sessions failed:', error.message || error)
      return
    }

    if (sessionsData) {
      console.log(`Fetched ${sessionsData.length} sessions from Supabase`)
      const fallbackStakeholder: StakeholderProfile = {
        name: 'Untitled Stakeholder', role: 'N/A', phone: '', email: '', linkedin: '',
        company: 'N/A', sector: '', products: '', employees: '', revenue: '',
        yearsInBusiness: '', geography: ''
      }
      
      const formattedSessions: InterviewSession[] = sessionsData.map((s: any) => {
        const sessionEvidence = s.evidence || []
        const sessionOpps = (s.opportunities || []).map((o: any) => ({
          ...o,
          evidence: sessionEvidence.filter((e: any) => e.opportunity_id === o.id)
        }))
        const rootEvidence = sessionEvidence.filter((e: any) => !e.opportunity_id)

        return {
          id: s.id,
          stakeholder: s.stakeholders || fallbackStakeholder,
          status: s.status,
          date: s.date,
          duration: s.duration,
          opportunities: sessionOpps,
          settings: s.audio_settings || { audio: true, video: true },
          evidence: rootEvidence,
          recordingUrl: s.recording_url,
          summary: s.summary || '',
          user_id: s.user_id
        }
      })

      // 🚀 SMART MERGE: Keep local sessions (like newly generated ones) 
      // until the DB sync is 100% complete and returned in the fetch.
      set((state) => {
        const dbIds = new Set(formattedSessions.map(s => s.id))
        const localOnly = state.sessions.filter(s => !dbIds.has(s.id) && s.status === 'Review')
        return { sessions: [...localOnly, ...formattedSessions] }
      })
    }
  },

  fetchSessionById: async (id: string) => {
    if (!supabase) return
    
    const { data: sessionData, error } = await supabase
      .from('sessions')
      .select('*, stakeholders(*), opportunities(*), evidence(*)')
      .eq('id', id)
      .single()

    if (error) {
       console.error('Fetch single session failed:', error.message)
       return
    }

    if (sessionData) {
      const formatted = {
        ...sessionData,
        stakeholder: sessionData.stakeholders,
        findings: sessionData.opportunities || [],
        evidence: sessionData.evidence || []
      }
      
      set((state) => {
        const exists = state.sessions.find(s => s.id === id)
        if (exists) {
           return { sessions: state.sessions.map(s => s.id === id ? formatted : s) }
        }
        return { sessions: [formatted, ...state.sessions] }
      })
    }
  },

  setSessions: (sessions) => set({ sessions }),

  finalizeSession: (recordingUrl) => {
    const newId = crypto.randomUUID()
    const state = get()
    if (!state.currentSession) return ''

    const stakeholder = state.currentSession.stakeholder!
    const session: InterviewSession = {
      id: newId,
      stakeholder,
      status: 'Review',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: state.recordingSeconds,
      opportunities: (state.currentSession.opportunities || []).map(o => ({ ...o, status: 'Pending' })),
      settings: state.currentSession.settings || { audio: true, video: true },
      evidence: state.currentSession.evidence || [],
      recordingUrl,
      transcript: [],
      summary: ''
    }

    set((s) => ({
      sessions: [session, ...s.sessions],
      currentSession: null,
      isRecording: false,
      recordingSeconds: 0
    }))

    // 🚀 BACKGROUND SYNC TO SUPABASE
    if (supabase) {
      ;(async () => {
        try {
          console.log('Starting Supabase sync for session:', newId)

          // 0. GET CURRENT USER ID
          let currentUserId: string | null = null
          try {
            const { data: { user } } = await supabase.auth.getUser()
            currentUserId = user?.id || null
            console.log('Current user ID:', currentUserId)
          } catch (e) {
            console.error('Failed to get current user:', e)
          }
          
          // 1. STAKEHOLDER (Find existing or Create)
          let stakeholderId: any = null
          try {
            const dbStakeholder: any = {
              name: stakeholder.name || 'Anonymous',
              role: stakeholder.role || 'Unspecified',
              phone: stakeholder.phone || '',
              email: stakeholder.email || '',
              linkedin: stakeholder.linkedin || '',
              company: stakeholder.company || 'N/A',
              sector: stakeholder.sector || '',
              employees: stakeholder.employees || '',
              revenue: stakeholder.revenue || '',
              geography: stakeholder.geography || '',
              domain: stakeholder.domain || '',
              address: stakeholder.address || '',
              pincode: stakeholder.pincode || ''
            }

            if (currentUserId) {
              dbStakeholder.user_id = currentUserId
            }

            // First, try to find an existing stakeholder by name to avoid duplicates
            console.log('Checking for existing stakeholder:', dbStakeholder.name)
            const { data: existingSH } = await supabase
              .from('stakeholders')
              .select('id')
              .eq('name', dbStakeholder.name)
              .maybeSingle()

            if (existingSH) {
              stakeholderId = existingSH.id
              console.log('Found existing stakeholder, linking to ID:', stakeholderId)
              
              // Update their details while we are at it
              await supabase.from('stakeholders').update(dbStakeholder).eq('id', stakeholderId)
            } else {
              console.log('Creating new stakeholder:', dbStakeholder.name)
              const { data: sData, error: sErr } = await supabase.from('stakeholders').insert(dbStakeholder).select().single()
              if (sErr || !sData) {
                console.error('Stakeholder sync failed:', sErr?.message || sErr)
              } else {
                stakeholderId = sData.id
                console.log('Stakeholder created successfully, ID:', stakeholderId)
              }
            }
          } catch (e) {
            console.error('Stakeholder sync exception:', e)
          }

          // 2. SESSION (Crucial step)
          try {
            const sessionInsert: any = {
              id: newId,
              stakeholder_id: stakeholderId,
              status: 'Review',
              date: session.date,
              duration: session.duration,
              audio_settings: session.settings,
              summary: session.summary || '',
              transcript: session.transcript || []
            }
            // Only include user_id if we have one
            if (currentUserId) {
              sessionInsert.user_id = currentUserId
            }
            console.log('Inserting session row:', sessionInsert)
            const { error: sessErr } = await supabase.from('sessions').insert(sessionInsert)
            if (sessErr) {
               console.error('Session sync failed:', sessErr, 'Message:', sessErr?.message, 'Code:', sessErr?.code)
            } else {
               console.log('Session row inserted successfully')
            }
          } catch (e) {
            console.error('Session sync exception:', e)
          }

          // 3. OPPORTUNITIES
          try {
            if (session.opportunities.length > 0) {
              const { error: oppErr } = await supabase.from('opportunities').insert(
                session.opportunities.map(o => ({
                  session_id: newId,
                  title: o.title,
                  description: o.description,
                  tag: o.tag,
                  timestamp: o.timestamp,
                  status: 'Pending'
                }))
              )
              if (oppErr) console.error('Opportunities sync failed:', oppErr)
            }
          } catch (e) {
            console.error('Opportunities sync exception:', e)
          }

          // 4. EVIDENCE & OPPORTUNITY EVIDENCE
          try {
            const evidenceToInsert = [
              ...session.evidence.map(e => ({
                session_id: newId,
                type: e.type,
                url: e.url,
                title: e.title
              })),
              ...session.opportunities.flatMap(o => 
                (o.evidence || []).map(e => ({
                  session_id: newId,
                  opportunity_id: o.id,
                  type: e.type,
                  url: e.url,
                  title: e.title
                }))
              )
            ]
            
            if (evidenceToInsert.length > 0) {
              const { error: evErr } = await supabase.from('evidence').insert(evidenceToInsert)
              if (evErr) console.error('Evidence sync failed:', evErr)
            }
          } catch (e) {
            console.error('Evidence sync exception:', e)
          }

          // 5. AUDIO UPLOAD & RECORDING URL UPDATE
          // This is often the most important but also the most fragile step
          try {
            if (recordingUrl && recordingUrl.startsWith('blob:')) {
              console.log('Fetching audio blob for upload...')
              const response = await fetch(recordingUrl)
              const blob = await response.blob()
              const fileName = `${newId}.webm`
              
              console.log('Uploading audio to Supabase Storage...')
              const { data: uploadData, error: uploadErr } = await supabase.storage.from('recordings').upload(fileName, blob)
              
              if (uploadErr) {
                console.error('Audio upload failed:', uploadErr)
              } else if (uploadData) {
                console.log('Audio uploaded successfully, retrieving public URL...')
                const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(fileName)
                
                console.log('Updating session with recording URL...')
                const { error: updateErr } = await supabase.from('sessions').update({ recording_url: publicUrl }).eq('id', newId)
                
                if (updateErr) {
                  console.error('Failed to update session with recording URL:', updateErr)
                } else {
                  console.log('Recording URL sync complete.')
                  get().setRecordingUrl(newId, publicUrl)
                }
              }
            } else if (recordingUrl) {
              // Not a blob, maybe already a URL? update it directly
              await supabase.from('sessions').update({ recording_url: recordingUrl }).eq('id', newId)
            }
          } catch (e) {
            console.error('Audio sync exception:', e)
          }

          console.log('Supabase background sync finished for session:', newId)
        } catch (globalErr) {
          console.error('Global Supabase sync error:', globalErr)
        }
      })()
    }

    return newId
  },

  scheduleSession: () => set((s) => {
    if (!s.currentSession) return {}
    const session: InterviewSession = {
      id: `sess_${Date.now()}`,
      stakeholder: s.currentSession.stakeholder!,
      status: 'Scheduled',
      date: s.currentSession.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: 0,
      opportunities: [],
      settings: s.currentSession.settings || { audio: true, video: true },
      evidence: [],
      location: s.currentSession.location
    }
    return {
      sessions: [session, ...s.sessions],
      currentSession: null,
      isRecording: false,
      recordingSeconds: 0
    }
  }),

  publishSession: (id) => {
    set((s) => ({
      sessions: s.sessions.map(sess =>
        sess.id === id ? { ...sess, status: 'Published' } : sess
      )
    }))
    if (supabase) {
      supabase.from('sessions')
        .update({ status: 'Published' })
        .eq('id', id)
        .then(() => {
          // Re-fetch to ensure everything is synced and visible
          get().fetchSessions()
        })
    }
  },

  updateOpportunityStatus: (sessionId, oppId, status, comment) => set((s) => ({
    sessions: s.sessions.map(sess => sess.id === sessionId ? {
      ...sess,
      opportunities: sess.opportunities.map(o => o.id === oppId ? { ...o, status, comment } : o)
    } : sess)
  })),

  updateTranscriptStatus: (sessionId, paraId, status, comment) => set((s) => ({
    sessions: s.sessions.map(sess => sess.id === sessionId ? {
      ...sess,
      transcript: sess.transcript?.map(p => p.id === paraId ? { ...p, status, comment } : p)
    } : sess)
  })),

  deleteSession: (id) => {
    set((s) => ({
      sessions: s.sessions.filter(sess => sess.id !== id)
    }))
    if (supabase) {
      supabase.from('sessions').delete().eq('id', id).then()
    }
  },

  updateSessionSummary: (id, summary) => {
    set((s) => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, summary } : sess)
    }))
    if (supabase) {
      supabase.from('sessions').update({ summary }).eq('id', id).then()
    }
  },

  setRecordingUrl: (id: string, url: string) => set((s) => ({
    sessions: s.sessions.map(sess => sess.id === id ? { ...sess, recordingUrl: url } : sess)
  })),

  updateStakeholder: (id: string, updates: Partial<StakeholderProfile>) => {
    set((s) => ({
      sessions: s.sessions.map(sess =>
        sess.stakeholder?.id === id
          ? { ...sess, stakeholder: { ...sess.stakeholder, ...updates } }
          : sess
      )
    }))
    // Sync to Supabase
    if (supabase) {
      supabase.from('stakeholders')
        .update(updates)
        .eq('id', id)
        .then((result: { error: any }) => {
          if (result.error) console.error('Stakeholder update failed:', result.error)
        })
    }
  },
  
  deleteStakeholder: (id: string) => {
    set((s) => ({
      sessions: s.sessions.filter(sess => sess.stakeholder?.id !== id)
    }))
    if (supabase) {
      supabase.from('stakeholders').delete().eq('id', id).then()
    }
  },

  tick: () => set((s) => ({
    recordingSeconds: s.isRecording ? s.recordingSeconds + 1 : s.recordingSeconds
  }))
}), {
  name: 'mosi-storage',
  partialize: (state) => ({ 
    sessions: state.sessions, 
    currentSession: state.currentSession,
    isSidebarCollapsed: state.isSidebarCollapsed 
  }),
})
)

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
