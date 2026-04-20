'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useMosiStore, DEFAULT_CEED_QUESTIONS, CEEDQuestion, CEEDTag } from '@/lib/store'
import { 
  User, Building2, Globe, Mic, Video, Type,
  Calendar, MapPin, ChevronRight, CheckCircle,
  Sparkles, Activity, Zap, AlertCircle, ChevronLeft, Search, Users,
  Plus, Trash2, Edit3, MessageSquarePlus, GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REQUIRED_STEP1 = ['name', 'role', 'phone', 'email'] as const
const REQUIRED_STEP2 = ['company', 'sector'] as const

export default function SetupPage() {
  const router = useRouter()
  const { 
    sessions, fetchSessions, fetchStakeholdersList, stakeholdersList, 
    setCurrentSession, scheduleSession,
    globalCompanies, fetchGlobalCompanies
  } = useMosiStore()

  const [step, setStep] = React.useState(1)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [showErrors, setShowErrors] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showStakeholderPicker, setShowStakeholderPicker] = React.useState(false)
  const [pickerTab, setPickerTab] = React.useState<'people' | 'companies'>('people')
  
  const [form, setForm] = React.useState({
    name: '', role: '', phone: '', email: '', linkedin: '', domain: '',
    company: '', sector: '', products: '', employees: '', revenue: '',
    yearsInBusiness: '', geography: '', address: '', pincode: '',
    audio: true, video: true, transcript: true, translate: false,
    scheduleDate: '', scheduleTime: '', location: ''
  })

  // CEED Questions state
  const [ceedQuestions, setCeedQuestions] = React.useState<CEEDQuestion[]>(
    () => DEFAULT_CEED_QUESTIONS.map(q => ({ ...q }))
  )
  const [activeQTab, setActiveQTab] = React.useState<CEEDTag>('Core')
  const [editingQuestionId, setEditingQuestionId] = React.useState<string | null>(null)
  const [newQuestionText, setNewQuestionText] = React.useState('')

  const filteredQuestions = ceedQuestions.filter(q => q.quadrant === activeQTab)

  const handleUpdateQuestion = (id: string, newText: string) => {
    setCeedQuestions(prev => prev.map(q => q.id === id ? { ...q, text: newText } : q))
    setEditingQuestionId(null)
  }

  const handleDeleteQuestion = (id: string) => {
    setCeedQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return
    const newQ: CEEDQuestion = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text: newQuestionText.trim(),
      quadrant: activeQTab
    }
    setCeedQuestions(prev => [...prev, newQ])
    setNewQuestionText('')
  }

  const handleResetQuestions = () => {
    setCeedQuestions(DEFAULT_CEED_QUESTIONS.map(q => ({ ...q })))
  }

  React.useEffect(() => {
    fetchStakeholdersList()
    fetchGlobalCompanies()
    fetchSessions()
  }, [])

  const filteredStakeholders = React.useMemo(() => {
    if (!searchTerm) return stakeholdersList
    return stakeholdersList.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, stakeholdersList])

  const uniqueStakeholders = React.useMemo(() => {
    const map = new Map<string, any>()
    stakeholdersList.forEach(s => {
      if (!s.name) return
      if (!map.has(s.name.toLowerCase())) {
        map.set(s.name.toLowerCase(), s)
      }
    })
    return Array.from(map.values())
  }, [stakeholdersList])

  const [showNameSuggestions, setShowNameSuggestions] = React.useState(false)
  const nameSuggestions = React.useMemo(() => {
    if (!showNameSuggestions) return []
    if (!form.name) return uniqueStakeholders
    return uniqueStakeholders.filter(s => 
      s.name.toLowerCase().includes(form.name.toLowerCase())
    )
  }, [form.name, uniqueStakeholders, showNameSuggestions])

  const uniqueCompanies = React.useMemo(() => {
    const map = new Map<string, any>()
    
    // 1. From Stakeholders Table
    stakeholdersList.forEach(s => {
      if (!s.company || s.company === 'N/A') return
      if (!map.has(s.company.toLowerCase())) {
        map.set(s.company.toLowerCase(), {
          name: s.company,
          sector: s.sector,
          employees: s.employees,
          revenue: s.revenue,
          geography: s.geography,
          address: s.address,
          pincode: s.pincode,
          domain: s.domain
        })
      }
    })

    // 2. From recent sessions (Safety fallback)
    sessions.forEach(sess => {
      const s = sess.stakeholder
      if (!s || !s.company || s.company === 'N/A') return
      if (!map.has(s.company.toLowerCase())) {
        map.set(s.company.toLowerCase(), {
          name: s.company,
          sector: s.sector,
          employees: s.employees,
          revenue: s.revenue,
          geography: s.geography,
          address: s.address,
          pincode: s.pincode,
          domain: s.domain
        })
      }
    })

    // 3. Merge with Global companies
    globalCompanies.forEach(co => {
      const key = co.name?.toLowerCase().trim() || co.company?.toLowerCase().trim()
      if (!key) return
      if (!map.has(key)) {
        map.set(key, { ...co, name: co.name || co.company })
      }
    })

    return Array.from(map.values())
  }, [stakeholdersList, sessions, globalCompanies])

  const [showCompanySuggestions, setShowCompanySuggestions] = React.useState(false)
  const companySuggestions = React.useMemo(() => {
    if (!showCompanySuggestions) return []
    if (!form.company) return uniqueCompanies
    return uniqueCompanies.filter(c => 
      c.name.toLowerCase().includes(form.company.toLowerCase())
    )
  }, [form.company, uniqueCompanies, showCompanySuggestions])

  const selectExisting = (sh: any) => {
    setForm(f => ({
      ...f,
      name: sh.name || '',
      role: sh.role || '',
      phone: sh.phone || '',
      email: sh.email || '',
      linkedin: sh.linkedin || '',
      domain: sh.domain || '',
      company: sh.company || '',
      sector: sh.sector || '',
      employees: sh.employees || '',
      revenue: sh.revenue || '',
      geography: sh.geography || '',
      address: sh.address || '',
      pincode: sh.pincode || '',
    }))
    setShowStakeholderPicker(false)
    setTouched({})
  }

  const selectCompany = (co: any) => {
    setForm(f => ({
      ...f,
      company: co.name || co.company,
      sector: co.sector || f.sector,
      employees: co.employees || f.employees,
      revenue: co.revenue || f.revenue,
      geography: co.geography || f.geography,
      address: co.address || f.address,
      pincode: co.pincode || f.pincode,
      domain: co.domain || f.domain
    }))
    setShowCompanySuggestions(false)
    if (showStakeholderPicker) setShowStakeholderPicker(false)
  }

  const update = (key: string, value: string | boolean) => {
    setForm(f => ({ ...f, [key]: value }))
    setTouched(t => ({ ...t, [key]: true }))
  }

  const markTouched = (key: string) => {
    setTouched(t => ({ ...t, [key]: true }))
  }

  const isFieldEmpty = (key: string) => !(form as any)[key]?.toString().trim()

  const step1Valid = REQUIRED_STEP1.every(k => !isFieldEmpty(k))
  const step2Valid = REQUIRED_STEP2.every(k => !isFieldEmpty(k))

  const handleContinue = () => {
    if (step === 1) {
      setShowErrors(true)
      REQUIRED_STEP1.forEach(k => markTouched(k))
      if (!step1Valid) return
      setShowErrors(false)
      setStep(2)
    } else if (step === 2) {
      setShowErrors(true)
      REQUIRED_STEP2.forEach(k => markTouched(k))
      if (!step2Valid) return
      setShowErrors(false)
      setStep(3)
    }
  }

  const handleStart = () => {
    if (!step1Valid || !step2Valid) {
      setShowErrors(true)
      if (!step1Valid) setStep(1)
      else if (!step2Valid) setStep(2)
      return
    }
    setCurrentSession({
      stakeholder: {
        name: form.name, role: form.role, phone: form.phone,
        email: form.email, linkedin: form.linkedin, domain: form.domain,
        company: form.company, sector: form.sector, products: form.products,
        employees: form.employees, revenue: form.revenue, address: form.address,
        yearsInBusiness: form.yearsInBusiness, geography: form.geography, pincode: form.pincode
      },
      settings: { audio: form.audio, video: form.video },
      opportunities: [],
      location: form.location,
      status: 'Recording',
      ceedQuestions
    })
    router.push('/interview/live')
  }

  const completedSteps = [
    step > 1 || step1Valid,
    step > 2 || step2Valid,
    false
  ]

  const inputClass = (key: string, required = false) => cn(
    "w-full h-12 px-4 rounded-xl border-2 outline-none transition-all duration-200 text-sm font-semibold text-slate-800",
    "placeholder:text-slate-300 placeholder:font-normal",
    "bg-white",
    "hover:border-slate-300",
    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white",
    (showErrors && required && isFieldEmpty(key) && touched[key])
      ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200",
  )

  const labelClass = "block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider"

  const RequiredDot = () => (
    <span className="text-red-400 ml-0.5">*</span>
  )

  const FieldError = ({ field }: { field: string }) => (
    (showErrors && touched[field] && isFieldEmpty(field)) ? (
      <p className="mt-1.5 text-[10px] font-semibold text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-3 h-3" /> This field is required
      </p>
    ) : null
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-36 animate-in fade-in duration-700 px-4 sm:px-6 pt-4 sm:pt-8">
      
      {/* HEADER */}
      <div className="space-y-2 sm:space-y-3 text-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
          <Sparkles className="w-3 h-3" /> Setup Wizard
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
          New Session Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium px-2">
          Sync stakeholder context and corporate DNA to begin discovery.
        </p>
      </div>

      {/* STEP TABS — Progress Indicator */}
      <div className="flex items-center gap-0 p-1 sm:p-1.5 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100">
        {[
          { n: 1, label: 'Stakeholder', shortLabel: 'Person', icon: User },
          { n: 2, label: 'Company', shortLabel: 'Company', icon: Building2 },
          { n: 3, label: 'Settings', shortLabel: 'Config', icon: Activity }
        ].map((s, idx) => (
          <button
            key={s.n}
            onClick={() => {
              if (s.n < step) setStep(s.n)
              else if (s.n === step + 1) handleContinue()
            }}
            className={cn(
              "flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 relative",
              step === s.n 
                ? 'bg-white text-slate-800 shadow-md border border-slate-200' 
                : completedSteps[idx]
                  ? 'text-emerald-600 hover:text-emerald-700'
                  : 'text-slate-400 hover:text-slate-500'
            )}
          >
            {completedSteps[idx] && step !== s.n ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <s.icon className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* STEP 1 — Stakeholder */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
          {/* Step Description */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100/60 rounded-2xl">
            <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
              <span className="font-bold text-blue-800">Step 1 of 3:</span> Enter the stakeholder&apos;s personal and professional details. Fields marked with <span className="text-red-400 font-bold">*</span> are required.
            </p>
          </div>

          {/* SELECTION MODE TOGGLE */}
          <div className="flex gap-2.5 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <button 
              onClick={() => setShowStakeholderPicker(false)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                !showStakeholderPicker ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Type className="w-3.5 h-3.5" /> Manual Entry
            </button>
            <button 
              onClick={() => setShowStakeholderPicker(true)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                showStakeholderPicker ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Users className="w-3.5 h-3.5" /> CRM Repository
            </button>
          </div>

          {showStakeholderPicker ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                  <button 
                    onClick={() => setPickerTab('people')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      pickerTab === 'people' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  > People </button>
                  <button 
                    onClick={() => setPickerTab('companies')}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      pickerTab === 'companies' ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  > Companies </button>
               </div>

               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    className="w-full h-12 pl-11 pr-4 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold text-slate-800"
                    placeholder={pickerTab === 'people' ? "Search for stakeholders..." : "Search for companies..."}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               
               <div className="grid grid-cols-1 gap-2.5 max-h-[400px] overflow-y-auto pr-1 customize-scrollbar">
                  {pickerTab === 'people' ? (
                    filteredStakeholders.map(sh => (
                      <button
                        key={sh.id}
                        onClick={() => selectExisting(sh)}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group text-left"
                      >
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-lg font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                               {sh.name[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sh.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em]">{sh.role} · <span className="text-slate-600">{sh.company}</span></p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">Select</span>
                            <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-all" />
                         </div>
                      </button>
                    ))
                  ) : (
                    uniqueCompanies
                      .filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(co => (
                        <button
                          key={co.name}
                          onClick={() => selectCompany(co)}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group text-left"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-lg font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                                 {co.name[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{co.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em]">{co.sector || 'N/A'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">Select</span>
                              <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500 transition-all" />
                           </div>
                        </button>
                      ))
                  )}
                  
                  {((pickerTab === 'people' && filteredStakeholders.length === 0) || (pickerTab === 'companies' && uniqueCompanies.filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0)) && (
                    <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                       <Users className="w-8 h-8 text-slate-200 mx-auto" />
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">No matching records found in CRM</p>
                       <button onClick={() => setShowStakeholderPicker(false)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"> Create New Instead →</button>
                    </div>
                  )}
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <label className={labelClass}>Stakeholder Name <RequiredDot /></label>
                <input 
                  className={inputClass('name', true)} 
                  placeholder="e.g. Jane Doe" 
                  value={form.name} 
                  onChange={e => {
                    update('name', e.target.value)
                    setShowNameSuggestions(true)
                  }} 
                  onBlur={() => {
                    markTouched('name')
                    setTimeout(() => setShowNameSuggestions(false), 200)
                  }}
                  onFocus={() => setShowNameSuggestions(true)}
                />
                {nameSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 border-b border-slate-100">Existing Stakeholders</p>
                    {nameSuggestions.slice(0, 5).map(sh => (
                      <button
                        key={sh.id || sh.name}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectExisting(sh)
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {sh.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{sh.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{sh.role} · {sh.company}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
                <FieldError field="name" />
              </div>
              <div>
                <label className={labelClass}>Job Title / Role <RequiredDot /></label>
                <input 
                  className={inputClass('role', true)} 
                  placeholder="e.g. Product Lead" 
                  value={form.role} 
                  onChange={e => update('role', e.target.value)}
                  onBlur={() => markTouched('role')}
                />
                <FieldError field="role" />
              </div>
            <div>
              <label className={labelClass}>Contact Number <RequiredDot /></label>
              <input 
                className={inputClass('phone', true)} 
                placeholder="e.g. +1 555-0000" 
                value={form.phone} 
                onChange={e => update('phone', e.target.value)}
                onBlur={() => markTouched('phone')}
                type="tel"
              />
              <FieldError field="phone" />
            </div>
            <div>
              <label className={labelClass}>Email Address <RequiredDot /></label>
              <input 
                className={inputClass('email', true)} 
                type="email" 
                placeholder="e.g. jane@enterprise.com" 
                value={form.email} 
                onChange={e => update('email', e.target.value)}
                onBlur={() => markTouched('email')}
              />
              <FieldError field="email" />
            </div>
            <div>
              <label className={labelClass}>Vertical / Domain</label>
              <input 
                className={inputClass('domain')} 
                placeholder="e.g. Logistics / AI" 
                value={form.domain} 
                onChange={e => update('domain', e.target.value)} 
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn Profile</label>
              <input 
                className={inputClass('linkedin')} 
                placeholder="e.g. linkedin.com/in/janedoe" 
                value={form.linkedin} 
                onChange={e => update('linkedin', e.target.value)} 
              />
            </div>
          </div>
        )}
      </div>
    )}

      {/* STEP 2 — Company */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
          <div className="p-4 bg-gradient-to-r from-violet-50/80 to-purple-50/50 border border-violet-100/60 rounded-2xl">
            <p className="text-xs text-violet-700/80 font-medium leading-relaxed">
              <span className="font-bold text-violet-800">Step 2 of 3:</span> Enter the company&apos;s organizational details and market position.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className={labelClass}>Company Name <RequiredDot /></label>
              <input 
                className={inputClass('company', true)} 
                placeholder="e.g. Acme International" 
                value={form.company} 
                onChange={e => {
                  update('company', e.target.value)
                  setShowCompanySuggestions(true)
                }}
                onBlur={() => {
                  markTouched('company')
                  // Delay closing to allow clicking suggestions
                  setTimeout(() => setShowCompanySuggestions(false), 200)
                }}
                onFocus={() => {
                  setShowCompanySuggestions(true)
                  fetchGlobalCompanies()
                }}
              />
              {companySuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 bg-slate-50 border-b border-slate-100">Existing Records</p>
                  {companySuggestions.slice(0, 5).map(co => (
                    <button
                      key={co.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent onBlur from firing before selection
                        selectCompany(co)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {co.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{co.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{co.sector || 'N/A'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
              <FieldError field="company" />
            </div>
            <div>
              <label className={labelClass}>Sector / Market <RequiredDot /></label>
              <input 
                className={inputClass('sector', true)} 
                placeholder="e.g. Fintech & SaaS" 
                value={form.sector} 
                onChange={e => update('sector', e.target.value)}
                onBlur={() => markTouched('sector')}
              />
              <FieldError field="sector" />
            </div>
            <div>
              <label className={labelClass}>Employee Count</label>
              <input className={inputClass('employees')} placeholder="e.g. 50 - 200" value={form.employees} onChange={e => update('employees', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Annual Revenue</label>
              <input className={inputClass('revenue')} placeholder="e.g. $5M - $20M ARR" value={form.revenue} onChange={e => update('revenue', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Years Active</label>
              <input className={inputClass('yearsInBusiness')} placeholder="e.g. 8 Years" value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Geographic Region</label>
              <input className={inputClass('geography')} placeholder="e.g. EMEA / NA" value={form.geography} onChange={e => update('geography', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Service / Product Details</label>
              <textarea 
                rows={3} 
                className={cn(inputClass('products'), "h-auto py-3 resize-none")} 
                placeholder="Briefly describe what they offer..." 
                value={form.products} 
                onChange={e => update('products', e.target.value)} 
              />
            </div>
            <div>
              <label className={labelClass}>HQ Address</label>
              <input className={inputClass('address')} placeholder="e.g. 123 Silicon Blvd" value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Zip / Pincode</label>
              <input className={inputClass('pincode')} placeholder="e.g. 10001" value={form.pincode} onChange={e => update('pincode', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 — Settings */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
          <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100/60 rounded-2xl">
            <p className="text-xs text-emerald-700/80 font-medium leading-relaxed">
              <span className="font-bold text-emerald-800">Step 3 of 3:</span> Configure capture settings, interview questions, and meeting logistics.
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-500 px-1 uppercase tracking-widest">Capture Settings</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { key: 'audio', label: 'Audio', desc: 'Record audio', icon: Mic },
                { key: 'video', label: 'Video', desc: 'Capture video', icon: Video },
                { key: 'transcript', label: 'Record', desc: 'Transcription', icon: Activity },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => update(opt.key, !(form as any)[opt.key])}
                  className={cn(
                    "p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 sm:gap-2.5 group relative overflow-hidden cursor-pointer",
                    (form as any)[opt.key] 
                      ? "bg-blue-50/80 text-slate-800 border-blue-200 shadow-md shadow-blue-100/50" 
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <opt.icon className={cn("w-5 h-5 transition-all", (form as any)[opt.key] ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500")} />
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{opt.desc}</span>
                  {(form as any)[opt.key] && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ============ CEED QUESTION EDITOR ============ */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4" /> CEED Framework Questions
              </h3>
              <button 
                onClick={handleResetQuestions}
                className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
              >
                Reset to Defaults
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium px-1 -mt-2">
              Customize the interview questions for each CEED quadrant. Edit existing questions, add new ones, or remove ones you don&apos;t need.
            </p>

            {/* Quadrant Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-100/60 rounded-xl border border-slate-200/50">
              {(['Core', 'Efficiency', 'Expansion', 'Disrupt'] as CEEDTag[]).map(tab => {
                const count = ceedQuestions.filter(q => q.quadrant === tab).length
                return (
                  <button 
                    key={tab}
                    onClick={() => { setActiveQTab(tab); setEditingQuestionId(null) }}
                    className={cn(
                      "flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-center relative",
                      activeQTab === tab 
                        ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                    <span className={cn(
                      "ml-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-black",
                      activeQTab === tab ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-300"
                    )}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              {filteredQuestions.length > 0 ? filteredQuestions.map((q, idx) => (
                <div key={q.id} className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-200 transition-all">
                  {editingQuestionId === q.id ? (
                    <div className="space-y-3">
                      <textarea
                        autoFocus
                        rows={2}
                        defaultValue={q.text}
                        className="w-full px-3 py-2.5 border-2 border-blue-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 resize-none bg-blue-50/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleUpdateQuestion(q.id, (e.target as HTMLTextAreaElement).value)
                          }
                          if (e.key === 'Escape') setEditingQuestionId(null)
                        }}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button 
                          onClick={() => setEditingQuestionId(null)}
                          className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={(e) => {
                            const textarea = (e.target as HTMLElement).closest('.space-y-3')?.querySelector('textarea')
                            if (textarea) handleUpdateQuestion(q.id, textarea.value)
                          }}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-black text-slate-300 mt-0.5 min-w-[20px]">{idx + 1}.</span>
                      <p className="text-sm font-medium text-slate-700 flex-1 leading-relaxed">{q.text}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => setEditingQuestionId(q.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                          title="Edit question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          title="Remove question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="py-10 text-center bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                  <MessageSquarePlus className="w-6 h-6 text-slate-200 mx-auto" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No questions in this quadrant</p>
                </div>
              )}
            </div>

            {/* Add New Question */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddQuestion() }}
                placeholder={`Add a new ${activeQTab} question...`}
                className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-200 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 bg-white hover:border-slate-300"
              />
              <button 
                onClick={handleAddQuestion}
                disabled={!newQuestionText.trim()}
                className={cn(
                  "h-12 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shrink-0",
                  newQuestionText.trim()
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                    : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                )}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {(['Core', 'Efficiency', 'Expansion', 'Disrupt'] as CEEDTag[]).map(tab => (
                  <span key={tab} className={cn(activeQTab === tab && "text-blue-600")}>
                    {tab[0]}: {ceedQuestions.filter(q => q.quadrant === tab).length}
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-300 ml-auto uppercase tracking-widest">
                Total: {ceedQuestions.length}
              </span>
            </div>
          </div>
          {/* ============ END CEED QUESTION EDITOR ============ */}

          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-500 px-1 uppercase tracking-widest">Logistics <span className="text-slate-300 font-medium normal-case">(Optional)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Meeting Date</label>
                <input type="date" className={inputClass('scheduleDate')} value={form.scheduleDate} onChange={e => update('scheduleDate', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Meeting Time</label>
                <input type="time" className={inputClass('scheduleTime')} value={form.scheduleTime} onChange={e => update('scheduleTime', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Digital Hub / Location</label>
                <input className={inputClass('location')} placeholder="e.g. Meeting link or physical office" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white sm:bg-transparent border-t border-slate-100 p-4 sm:p-0 sm:pt-6 flex items-center gap-3 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] sm:shadow-none">
        {step > 1 && (
          <button 
            onClick={() => { setShowErrors(false); setStep(step - 1) }} 
            className="h-12 px-6 rounded-2xl border-2 border-slate-200 text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 3 ? (
          <button 
            onClick={handleContinue} 
            className={cn(
              "flex-1 h-12 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2",
              (step === 1 && step1Valid) || (step === 2 && step2Valid)
                ? "bg-slate-800 text-white hover:bg-slate-700 shadow-lg shadow-slate-200"
                : "bg-slate-100 text-slate-800 border-2 border-slate-200 hover:bg-slate-200"
            )}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex-1 flex gap-3">
            <button
              onClick={() => { scheduleSession(); router.push('/') }}
              className="px-6 h-12 border-2 border-slate-200 text-slate-500 rounded-2xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Archive
            </button>
            <button
              onClick={handleStart}
              className="flex-1 h-12 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <Zap className="w-4 h-4 fill-current" /> Start Discovery
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
