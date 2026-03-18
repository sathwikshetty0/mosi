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
  fetchSessions: () => Promise<void>
}



export const useMosiStore = create<MosiStore>()(
  persist(
    (set, get) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  currentSession: null,
  sessions: [],
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
      id: opp.id || `opp_${Date.now()}`,
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

  fetchSessions: async () => {
    if (!supabase) return
    const { data: sessionsData, error } = await supabase
      .from('sessions')
      .select('*, stakeholders(*), opportunities(*, evidence(*)), evidence(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch sessions failed:', error)
      return
    }

    if (sessionsData) {
      const formattedSessions: InterviewSession[] = sessionsData.map((s: any) => ({
        id: s.id,
        stakeholder: s.stakeholders,
        status: s.status,
        date: s.date,
        duration: s.duration,
        opportunities: (s.opportunities || []).map((o: any) => ({
          ...o,
          evidence: o.evidence || []
        })),
        settings: s.audio_settings,
        evidence: s.evidence || [],
        recordingUrl: s.recording_url,
        summary: s.summary
      }))
      set({ sessions: formattedSessions })
    }
  },

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
      recordingUrl, // Use local blobUrl by default
      transcript: [],
      summary: ''
    }

    set((s) => ({
      sessions: [session, ...s.sessions],
      currentSession: null,
      isRecording: false,
      recordingSeconds: 0
    }))

    // 🚀 BACKGROUND SYNC TO SUPABASE (Only if configured)
    if (supabase) {
      ;(async () => {
        // 1. STAKEHOLDER
        const { data: sData } = await supabase.from('stakeholders').insert(stakeholder).select().single()
        if (!sData) return
        
        // 2. SESSION
        const { data: sessData } = await supabase.from('sessions').insert({
          id: newId,
          stakeholder_id: sData.id,
          status: 'Review',
          date: session.date,
          duration: session.duration,
          audio_settings: session.settings
        }).select().single()

        if (!sessData) return

        // 3. OPPORTUNITIES
        if (session.opportunities.length > 0) {
          await supabase.from('opportunities').insert(
            session.opportunities.map(o => ({
              session_id: newId,
              title: o.title,
              description: o.description,
              tag: o.tag,
              timestamp: o.timestamp,
              status: 'Pending'
            }))
          )
        }

        // 4. EVIDENCE
        if (session.evidence.length > 0) {
          await supabase.from('evidence').insert(
            session.evidence.map(e => ({
              session_id: newId,
              type: e.type,
              url: e.url,
              title: e.title
            }))
          )
        }

        // 5. AUDIO UPLOAD
        if (recordingUrl && recordingUrl.startsWith('blob:')) {
          const response = await fetch(recordingUrl)
          const blob = await response.blob()
          const fileName = `${newId}.webm`
          const { data: uploadData } = await supabase.storage.from('recordings').upload(fileName, blob)
          
          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage.from('recordings').getPublicUrl(fileName)
            await supabase.from('sessions').update({ recording_url: publicUrl }).eq('id', newId)
            get().setRecordingUrl(newId, publicUrl)
          }
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
      supabase.from('sessions').update({ status: 'Published' }).eq('id', id).then()
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
