import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') console.log('[MOSI]', ...args)
}

export type CEEDTag = 'Core' | 'Efficiency' | 'Expansion' | 'Disrupt'

export interface CEEDQuestion {
  id: string
  text: string
  quadrant: CEEDTag
}

export const DEFAULT_CEED_QUESTIONS: CEEDQuestion[] = [
  // Core
  { id: 'c1', text: 'Walk me through your core product or service.', quadrant: 'Core' },
  { id: 'c2', text: 'What are the top 2–3 challenges your team faces right now?', quadrant: 'Core' },
  { id: 'c3', text: 'What features or aspects do customers love most?', quadrant: 'Core' },
  { id: 'c4', text: 'How do you currently differentiate from competitors?', quadrant: 'Core' },
  { id: 'c5', text: 'What does your typical customer journey look like?', quadrant: 'Core' },
  // Efficiency
  { id: 'e1', text: 'Which department or process consumes the most time each week?', quadrant: 'Efficiency' },
  { id: 'e2', text: 'How does your team currently generate and qualify leads?', quadrant: 'Efficiency' },
  { id: 'e3', text: 'What processes are still manual that frustrate your team?', quadrant: 'Efficiency' },
  { id: 'e4', text: 'Where do you feel you\'re leaving money on the table?', quadrant: 'Efficiency' },
  { id: 'e5', text: 'What tools or tech do you wish you had?', quadrant: 'Efficiency' },
  // Expansion
  { id: 'x1', text: 'Do customers frequently ask for services or features you don\'t offer?', quadrant: 'Expansion' },
  { id: 'x2', text: 'Are there adjacent markets you want to enter in the next 12–24 months?', quadrant: 'Expansion' },
  { id: 'x3', text: 'What partnerships or channels have you not fully explored?', quadrant: 'Expansion' },
  { id: 'x4', text: 'Which customer segment do you think is underserved?', quadrant: 'Expansion' },
  // Disrupt
  { id: 'd1', text: 'If you were to restart this company today, what would you do completely differently?', quadrant: 'Disrupt' },
  { id: 'd2', text: 'What technology do you think will disrupt your industry in 3–5 years?', quadrant: 'Disrupt' },
  { id: 'd3', text: 'What assumptions about your business model could turn out to be wrong?', quadrant: 'Disrupt' },
  { id: 'd4', text: 'What would a competitor with 10x your budget do to beat you?', quadrant: 'Disrupt' },
]

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
  transcriptText?: string
  summary?: string
  user_id?: string
  ceedQuestions?: CEEDQuestion[]
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
  startQuickSession: () => void
  updateSessionStakeholder: (id: string, stakeholder: Partial<StakeholderProfile>) => void
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
  updateSessionTranscript: (id: string, transcriptText: string) => void
  setRecordingUrl: (id: string, url: string) => void
  profiles: any[]
  fetchAllProfiles: () => Promise<void>
  fetchSessions: () => Promise<void>
  setSessions: (sessions: InterviewSession[]) => void
  fetchSessionById: (id: string) => Promise<void>
  updateStakeholder: (id: string, updates: Partial<StakeholderProfile>) => void
  deleteStakeholder: (id: string) => void
  stakeholdersList: StakeholderProfile[]
  fetchStakeholdersList: () => Promise<void>
  globalCompanies: any[]
  fetchGlobalCompanies: () => Promise<void>
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
  stakeholdersList: [],
  globalCompanies: [],

  setCurrentSession: (session) => set((s) => ({
    currentSession: { ...s.currentSession, ...session }
  })),

  startQuickSession: () => {
    set({
      currentSession: {
        stakeholder: {
          name: '', role: '', phone: '', email: '', linkedin: '',
          company: '', sector: '', products: '', employees: '', revenue: '',
          yearsInBusiness: '', geography: ''
        },
        settings: { audio: true, video: true },
        opportunities: [],
        status: 'Recording',
        ceedQuestions: DEFAULT_CEED_QUESTIONS
      }
    })
  },

  updateSessionStakeholder: (id: string, stakeholderUpdates: Partial<StakeholderProfile>) => {
    // 1. Update local state
    set((s) => ({
      sessions: s.sessions.map(sess =>
        sess.id === id
          ? { ...sess, stakeholder: { ...sess.stakeholder, ...stakeholderUpdates } }
          : sess
      )
    }))

    // 2. Sync to Supabase
    if (supabase) {
      ;(async () => {
        try {
          // Get the session's stakeholder_id from Supabase
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('stakeholder_id')
            .eq('id', id)
            .single()

          if (sessionData?.stakeholder_id) {
            // Update the existing stakeholder record
            const { error } = await supabase
              .from('stakeholders')
              .update(stakeholderUpdates)
              .eq('id', sessionData.stakeholder_id)

            if (error) console.error('Stakeholder update sync failed:', error.message)
          } else {
            // No stakeholder linked yet — create one and link it
            const { data: { user } } = await supabase.auth.getUser()
            const currentState = get().sessions.find(s => s.id === id)
            const fullStakeholder = { ...currentState?.stakeholder, ...stakeholderUpdates }

            const insertData: any = {
              name: fullStakeholder.name || 'Unnamed',
              role: fullStakeholder.role || '',
              phone: fullStakeholder.phone || '',
              email: fullStakeholder.email || '',
              linkedin: fullStakeholder.linkedin || '',
              company: fullStakeholder.company || '',
              sector: fullStakeholder.sector || '',
              employees: fullStakeholder.employees || '',
              revenue: fullStakeholder.revenue || '',
              geography: fullStakeholder.geography || '',
              domain: fullStakeholder.domain || '',
              address: fullStakeholder.address || '',
              pincode: fullStakeholder.pincode || ''
            }
            if (user) insertData.user_id = user.id

            const { data: newSH, error: shErr } = await supabase
              .from('stakeholders')
              .insert(insertData)
              .select()
              .single()

            if (shErr) {
              console.error('Create stakeholder for session failed:', shErr.message)
            } else if (newSH) {
              await supabase.from('sessions').update({ stakeholder_id: newSH.id }).eq('id', id)
            }
          }
        } catch (e) {
          console.error('updateSessionStakeholder sync exception:', e)
        }
      })()
    }
  },

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
    
    let query = supabase.from('sessions')
      .select('*, stakeholders(*), opportunities(*), evidence(*)')
      .eq('user_id', user.id)

    const { data: sessionsData, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch sessions failed:', error.message || error)
      return
    }

    if (sessionsData) {
      devLog(`Fetched ${sessionsData.length} sessions from Supabase`)
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
          transcriptText: s.transcript?.text || '',
          user_id: s.user_id,
          ceedQuestions: s.ceed_questions || undefined
        }
      })

      // 🚀 SMART MERGE: Keep ALL local sessions (like newly generated ones) 
      // until the DB sync is 100% complete and returned in the fetch.
      set((state) => {
        const dbIds = new Set(formattedSessions.map(s => s.id))
        // Keep ONLY local-only sessions that are actively resolving their background sync
        const localOnly = state.sessions.filter(s => !dbIds.has(s.id) && (s as any).isPendingSync)
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
      const fallbackStakeholder: StakeholderProfile = {
        name: 'Untitled Stakeholder', role: 'N/A', phone: '', email: '', linkedin: '',
        company: 'N/A', sector: '', products: '', employees: '', revenue: '',
        yearsInBusiness: '', geography: ''
      }
      
      const sessionEvidence = sessionData.evidence || []
      const sessionOpps = (sessionData.opportunities || []).map((o: any) => ({
        ...o,
        evidence: sessionEvidence.filter((e: any) => e.opportunity_id === o.id)
      }))
      const rootEvidence = sessionEvidence.filter((e: any) => !e.opportunity_id)

      const formatted: InterviewSession = {
        id: sessionData.id,
        stakeholder: sessionData.stakeholders || fallbackStakeholder,
        status: sessionData.status,
        date: sessionData.date,
        duration: sessionData.duration,
        opportunities: sessionOpps,
        settings: sessionData.audio_settings || { audio: true, video: true },
        evidence: rootEvidence,
        recordingUrl: sessionData.recording_url,
        summary: sessionData.summary || '',
        transcriptText: sessionData.transcript?.text || '',
        user_id: sessionData.user_id,
        ceedQuestions: sessionData.ceed_questions || undefined
      }
      
      set((state) => {
        const id = sessionData.id // Ensure we use the ID from the data
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
      summary: '',
      ceedQuestions: state.currentSession.ceedQuestions || DEFAULT_CEED_QUESTIONS,
      isPendingSync: true
    } as any

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
          devLog('Starting Supabase sync for session:', newId)

          // 0. GET CURRENT USER ID
          let currentUserId: string | null = null
          try {
            const { data: { user } } = await supabase.auth.getUser()
            currentUserId = user?.id || null
            devLog('Current user ID:', currentUserId)
            
            // Auto-assign this session locally so the UI updates immediately
            if (currentUserId) {
              set((s) => ({
                sessions: s.sessions.map(sess => 
                  sess.id === newId ? { ...sess, user_id: currentUserId || undefined } : sess
                )
              }))
            }
          } catch (e) {
            console.error('Failed to get current user:', e)
          }
          
          // 1. STAKEHOLDER (Find existing or Create — SKIP if quick session with no name)
          let stakeholderId: any = null
          const hasStakeholderData = stakeholder.name && stakeholder.name.trim() !== ''
          
          if (hasStakeholderData) {
            try {
              const dbStakeholder: any = {
                name: stakeholder.name,
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
              devLog('Checking for existing stakeholder:', dbStakeholder.name)
              const { data: existingSH } = await supabase
                .from('stakeholders')
                .select('id')
                .eq('name', dbStakeholder.name)
                .maybeSingle()

              if (existingSH) {
                stakeholderId = existingSH.id
                devLog('Found existing stakeholder, linking to ID:', stakeholderId)
                
                // Update their details while we are at it
                await supabase.from('stakeholders').update(dbStakeholder).eq('id', stakeholderId)
              } else {
                devLog('Creating new stakeholder:', dbStakeholder.name)
                const { data: sData, error: sErr } = await supabase.from('stakeholders').insert(dbStakeholder).select().single()
                if (sErr || !sData) {
                  console.error('Stakeholder sync failed:', sErr?.message || sErr)
                } else {
                  stakeholderId = sData.id
                  devLog('Stakeholder created successfully, ID:', stakeholderId)
                }
              }
            } catch (e) {
              console.error('Stakeholder sync exception:', e)
            }
          } else {
            devLog('Quick session — skipping stakeholder creation (will be created when user fills details)')
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
              transcript: session.transcript || [],
              ceed_questions: session.ceedQuestions || []
            }
            // Only include user_id if we have one
            if (currentUserId) {
              sessionInsert.user_id = currentUserId
            }
            devLog('Inserting session row:', sessionInsert)
            const { error: sessErr } = await supabase.from('sessions').insert(sessionInsert)
            if (sessErr) {
               console.error('Session sync failed:', sessErr, 'Message:', sessErr?.message, 'Code:', sessErr?.code)
            } else {
               devLog('Session row inserted successfully')
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
              devLog('Fetching audio blob for upload...')
              const response = await fetch(recordingUrl)
              const blob = await response.blob()
              const fileName = `${newId}.webm`
              
              devLog('Uploading audio to Supabase Storage...')
              const { data: uploadData, error: uploadErr } = await supabase.storage.from('recordings').upload(fileName, blob)
              
              if (uploadErr) {
                console.error('Audio upload failed:', uploadErr)
              } else if (uploadData) {
                devLog('Audio uploaded successfully, retrieving public URL...')
                const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(fileName)
                
                devLog('Updating session with recording URL...')
                const { error: updateErr } = await supabase.from('sessions').update({ recording_url: publicUrl }).eq('id', newId)
                
                if (updateErr) {
                  console.error('Failed to update session with recording URL:', updateErr)
                } else {
                  devLog('Recording URL sync complete.')
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

          devLog('Supabase background sync finished for session:', newId)
        } catch (globalErr) {
          console.error('Global Supabase sync error:', globalErr)
        } finally {
          set((s) => ({
            sessions: s.sessions.map(sess =>
              sess.id === newId ? { ...sess, isPendingSync: false } : sess
            )
          }))
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
      location: s.currentSession.location,
      ceedQuestions: s.currentSession.ceedQuestions || DEFAULT_CEED_QUESTIONS
    }
    return {
      sessions: [session, ...s.sessions],
      currentSession: null,
      isRecording: false,
      recordingSeconds: 0
    }
  }),

  publishSession: (id) => {
    // 1. Immediately update local state
    set((s) => ({
      sessions: s.sessions.map(sess =>
        sess.id === id ? { ...sess, status: 'Published' } : sess
      )
    }))
    // 2. Sync to Supabase with proper error handling
    if (supabase) {
      ;(async () => {
        try {
          const { error } = await supabase.from('sessions')
            .update({ status: 'Published' })
            .eq('id', id)
          
          if (error) {
            console.error('Publish session to Supabase failed:', error.message)
            set((s) => ({
              sessions: s.sessions.map(sess =>
                sess.id === id ? { ...sess, status: 'Review' } : sess
              )
            }))
          } else {
            devLog('Session published to Supabase successfully:', id)
          }
          
          // Re-fetch to ensure everything is synced and visible
          await get().fetchSessions()
        } catch (e) {
          console.error('Publish session exception:', e)
        }
      })()
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

  deleteSession: async (id) => {
    const snapshot = get().sessions
    set((s) => ({ sessions: s.sessions.filter(sess => sess.id !== id) }))
    if (supabase) {
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) {
        console.error('Delete session failed:', error.message)
        set({ sessions: snapshot })
      }
    }
  },

  updateSessionSummary: (id, summary) => {
    const prevSummary = get().sessions.find(s => s.id === id)?.summary ?? ''
    set((s) => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, summary } : sess)
    }))
    if (supabase) {
      ;(async () => {
        const { error } = await supabase.from('sessions').update({ summary }).eq('id', id)
        if (error) {
          console.error('Summary update failed:', error.message)
          set((s) => ({
            sessions: s.sessions.map(sess => sess.id === id ? { ...sess, summary: prevSummary } : sess)
          }))
        }
      })()
    }
  },

  updateSessionTranscript: (id, transcriptText) => {
    set((s) => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, transcriptText } : sess)
    }))
    if (supabase) {
      ;(async () => {
        // Store in the transcript jsonb column as { text: "..." }
        const { error } = await supabase.from('sessions').update({ transcript: { text: transcriptText } }).eq('id', id)
        if (error) {
          console.error('Transcript update failed:', error.message)
        }
      })()
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

  fetchStakeholdersList: async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ stakeholdersList: [] })
      return
    }
    
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('name', { ascending: true })

    if (error) {
       console.error('Fetch stakeholders failed:', error.message)
       return
    }

    if (data) {
       set({ stakeholdersList: data })
    }
  },

  fetchGlobalCompanies: async () => {
    if (!supabase) return
    
    // We fetch just the company details for recommendations
    // This allows researchers to see all companies in the DB even if they haven't worked with them
    const { data, error } = await supabase
      .from('stakeholders')
      .select('company, sector, employees, revenue, geography, address, pincode, domain')
      .not('company', 'is', null)
      .not('company', 'eq', 'N/A')

    if (error) {
      console.error('Fetch global companies failed:', error.message)
      return
    }

    if (data) {
      // De-duplicate by company name
      const map = new Map()
      data.forEach(item => {
        const key = item.company.toLowerCase().trim()
        if (!map.has(key)) {
          map.set(key, {
            name: item.company,
            ...item
          })
        }
      })
      set({ globalCompanies: Array.from(map.values()) })
    }
  },

  tick: () => set((s) => ({
    recordingSeconds: s.isRecording ? s.recordingSeconds + 1 : s.recordingSeconds
  }))
}), {
  name: 'mosi-storage',
  partialize: (state) => ({ 
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
