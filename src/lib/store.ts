import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from './supabase'

const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') console.log('[MOSI]', ...args)
}

export type CEEDTag = 'Core' | 'Efficiency' | 'Expansion' | 'Disrupt'
export type InterviewType = 'ceed' | 'normal'

export interface CEEDQuestion {
  id: string
  text: string
  quadrant: CEEDTag
}

export interface NormalQuestion {
  id: string
  text: string
  category: string
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

export const DEFAULT_NORMAL_QUESTIONS: NormalQuestion[] = [
  // Rapport & Context
  { id: 'n1', text: 'Tell me about your role and responsibilities.', category: 'Rapport & Context' },
  { id: 'n2', text: 'How long have you been in this position?', category: 'Rapport & Context' },
  { id: 'n3', text: 'What does a typical day look like for you?', category: 'Rapport & Context' },
  // Pain Points & Challenges
  { id: 'n4', text: "What's the biggest challenge you're facing right now?", category: 'Pain Points' },
  { id: 'n5', text: "What takes up most of your time that you wish didn't?", category: 'Pain Points' },
  { id: 'n6', text: 'Where do things break down in your current process?', category: 'Pain Points' },
  // Goals & Priorities
  { id: 'n7', text: 'What are your top 3 priorities this quarter?', category: 'Goals & Priorities' },
  { id: 'n8', text: 'What does success look like for you in 6 months?', category: 'Goals & Priorities' },
  { id: 'n9', text: 'What metrics matter most to your team?', category: 'Goals & Priorities' },
  // Tools & Processes
  { id: 'n10', text: 'What tools or software do you currently rely on?', category: 'Tools & Processes' },
  { id: 'n11', text: "What's working well that you wouldn't want to change?", category: 'Tools & Processes' },
  { id: 'n12', text: 'If you could fix one thing overnight, what would it be?', category: 'Tools & Processes' },
  // Decision Making
  { id: 'n13', text: 'Who else is involved in decisions like this?', category: 'Decision Making' },
  { id: 'n14', text: 'What does your typical evaluation process look like?', category: 'Decision Making' },
  { id: 'n15', text: 'What would make you say "yes" to something new?', category: 'Decision Making' },
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
  interviewType: InterviewType
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
  notes?: string
  tags?: string[]
  reviewNotes?: { category: string; content: string }[]
  user_id?: string
  ceedQuestions?: CEEDQuestion[]
  normalQuestions?: NormalQuestion[]
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
  startQuickSessionWithType: (type: InterviewType) => void
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
  updateSessionNotes: (id: string, notes: string) => void
  updateSessionReviewNotes: (id: string, reviewNotes: { category: string; content: string }[]) => void
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
        interviewType: 'ceed',
        ceedQuestions: DEFAULT_CEED_QUESTIONS
      }
    })
  },

  startQuickSessionWithType: (type: InterviewType) => {
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
        interviewType: type,
        ceedQuestions: type === 'ceed' ? DEFAULT_CEED_QUESTIONS : undefined,
        normalQuestions: type === 'normal' ? DEFAULT_NORMAL_QUESTIONS : undefined,
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
    
    // Use cached user if available (avoid redundant getUser calls)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ sessions: [] })
      return
    }

    // Get team member IDs — cache this to avoid re-fetching
    let teamUserIds: string[] = [user.id]
    try {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)

      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id)
        const { data: allMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .in('team_id', teamIds)

        if (allMembers) {
          const ids = new Set(allMembers.map(m => m.user_id))
          ids.add(user.id)
          teamUserIds = Array.from(ids)
        }
      }
    } catch (e) {
      // Teams not available, use own ID only
    }
    
    // OPTIMIZED: Fetch sessions WITHOUT evidence join (evidence loaded on demand)
    const { data: sessionsData, error } = await supabase
      .from('sessions')
      .select('*, stakeholders(*), opportunities(*)')
      .in('user_id', teamUserIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Fetch sessions failed:', error.message || error)
      // Fallback: try without opportunities too
      const { data: fallbackData } = await supabase
        .from('sessions')
        .select('*, stakeholders(*)')
        .in('user_id', teamUserIds)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (fallbackData) {
        const formattedSessions: InterviewSession[] = fallbackData.map((s: any) => ({
          id: s.id,
          stakeholder: s.stakeholders || { name: 'Untitled Stakeholder', role: 'N/A', phone: '', email: '', linkedin: '', company: 'N/A', sector: '', products: '', employees: '', revenue: '', yearsInBusiness: '', geography: '' },
          interviewType: s.interview_type || 'ceed',
          status: s.status,
          date: s.date,
          duration: s.duration,
          opportunities: [],
          settings: s.audio_settings || { audio: true, video: true },
          evidence: [],
          recordingUrl: s.recording_url,
          summary: s.summary || '',
          transcriptText: typeof s.transcript === 'object' && s.transcript !== null && !Array.isArray(s.transcript) ? (s.transcript.text || '') : '',
          reviewNotes: typeof s.transcript === 'object' && s.transcript !== null && !Array.isArray(s.transcript) ? (s.transcript.reviewNotes || []) : [],
          user_id: s.user_id,
          ceedQuestions: s.ceed_questions || undefined
        }))
        set({ sessions: formattedSessions })
      }
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
        const sessionOpps = (s.opportunities || []).map((o: any) => ({
          ...o,
          evidence: []
        }))

        return {
          id: s.id,
          stakeholder: s.stakeholders || fallbackStakeholder,
          interviewType: s.interview_type || 'ceed',
          status: s.status,
          date: s.date,
          duration: s.duration,
          opportunities: sessionOpps,
          settings: s.audio_settings || { audio: true, video: true },
          evidence: [],
          recordingUrl: s.recording_url,
          summary: s.summary || '',
          transcriptText: typeof s.transcript === 'object' && s.transcript !== null && !Array.isArray(s.transcript) ? (s.transcript.text || '') : '',
          reviewNotes: typeof s.transcript === 'object' && s.transcript !== null && !Array.isArray(s.transcript) ? (s.transcript.reviewNotes || []) : [],
          user_id: s.user_id,
          ceedQuestions: s.ceed_questions || undefined
        }
      })

      set((state) => {
        const dbIds = new Set(formattedSessions.map(s => s.id))
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
        interviewType: sessionData.interview_type || 'ceed',
        status: sessionData.status,
        date: sessionData.date,
        duration: sessionData.duration,
        opportunities: sessionOpps,
        settings: sessionData.audio_settings || { audio: true, video: true },
        evidence: rootEvidence,
        recordingUrl: sessionData.recording_url,
        summary: sessionData.summary || '',
        transcriptText: typeof sessionData.transcript === 'object' && sessionData.transcript !== null && !Array.isArray(sessionData.transcript) ? (sessionData.transcript.text || '') : '',
        reviewNotes: typeof sessionData.transcript === 'object' && sessionData.transcript !== null && !Array.isArray(sessionData.transcript) ? (sessionData.transcript.reviewNotes || []) : [],
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
      interviewType: state.currentSession.interviewType || 'ceed',
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
      normalQuestions: state.currentSession.normalQuestions,
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
              const oppsToInsert = session.opportunities.map(o => ({
                id: o.id, // Preserve local UUID so evidence FK matches
                session_id: newId,
                title: o.title,
                description: o.description,
                tag: o.tag,
                timestamp: o.timestamp,
                status: 'Pending'
              }))
              const { error: oppErr } = await supabase.from('opportunities').insert(oppsToInsert)
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
          try {
            if (recordingUrl && recordingUrl.startsWith('blob:')) {
              devLog('Fetching audio blob for upload...')
              const response = await fetch(recordingUrl)
              const blob = await response.blob()
              
              // Detect format from blob type for proper extension
              const mimeType = blob.type || 'audio/webm'
              const ext = mimeType.includes('mp4') ? 'mp4' 
                        : mimeType.includes('aac') ? 'aac' 
                        : 'webm'
              const fileName = `${newId}.${ext}`
              
              devLog(`Uploading audio to Supabase Storage (${mimeType}, ${(blob.size / 1024).toFixed(0)}KB)...`)
              const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('recordings')
                .upload(fileName, blob, {
                  contentType: mimeType,
                  upsert: true
                })
              
              if (uploadErr) {
                console.error('Audio upload failed:', uploadErr)
              } else if (uploadData) {
                devLog('Audio uploaded successfully, retrieving public URL...')
                const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(fileName)
                
                devLog('Public URL:', publicUrl)
                
                const { error: updateErr } = await supabase.from('sessions').update({ recording_url: publicUrl }).eq('id', newId)
                
                if (updateErr) {
                  console.error('Failed to update session with recording URL:', updateErr)
                } else {
                  devLog('Recording URL sync complete.')
                  get().setRecordingUrl(newId, publicUrl)
                }
              }
            } else if (recordingUrl) {
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
      interviewType: s.currentSession.interviewType || 'ceed',
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
        const { error } = await supabase.from('sessions').update({ transcript: { text: transcriptText } }).eq('id', id)
        if (error) {
          console.error('Transcript update failed:', error.message)
        }
      })()
    }
  },

  updateSessionNotes: (id, notes) => {
    set((s) => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, notes } : sess)
    }))
  },

  updateSessionReviewNotes: (id, reviewNotes) => {
    set((s) => ({
      sessions: s.sessions.map(sess => sess.id === id ? { ...sess, reviewNotes } : sess)
    }))
    // Persist to Supabase in the session's transcript jsonb (alongside text)
    if (supabase) {
      ;(async () => {
        const { data: sessionData } = await supabase.from('sessions').select('transcript').eq('id', id).single()
        const existing = (sessionData?.transcript && typeof sessionData.transcript === 'object' && !Array.isArray(sessionData.transcript)) 
          ? sessionData.transcript 
          : {}
        const { error } = await supabase.from('sessions').update({ 
          transcript: { ...existing, reviewNotes } 
        }).eq('id', id)
        if (error) console.error('Review notes save failed:', error.message)
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

    // Get team member IDs for shared access
    let filterIds: string[] = [user.id]
    try {
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)

      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id)
        const { data: allMembers } = await supabase
          .from('team_members')
          .select('user_id')
          .in('team_id', teamIds)

        if (allMembers) {
          const ids = new Set(allMembers.map(m => m.user_id))
          ids.add(user.id)
          filterIds = Array.from(ids)
        }
      }
    } catch (e) {
      // Teams table may not exist yet
    }
    
    // Build OR filter for all team member IDs + null
    const orFilter = [...filterIds.map(id => `user_id.eq.${id}`), 'user_id.is.null'].join(',')
    
    const { data, error } = await supabase
      .from('stakeholders')
      .select('*')
      .or(orFilter)
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
    isSidebarCollapsed: state.isSidebarCollapsed,
    sessions: state.sessions.slice(0, 20), // Cache last 20 sessions for instant load
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
